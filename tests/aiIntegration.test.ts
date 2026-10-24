import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { createServer } from 'vite'
import { resolveApiBaseUrl } from '../src/config/apiBaseUrl.ts'

test('API base accepts Node /api and rejects FastAPI roots and /v1', () => {
  assert.equal(resolveApiBaseUrl(), '/api')
  assert.equal(resolveApiBaseUrl(' http://localhost:5000/api/ '), 'http://localhost:5000/api')
  for (const url of ['http://localhost:8001', 'http://ai:8000/v1', '/v1/models', '//ai:8000/api', '/api?key=value']) {
    assert.throws(() => resolveApiBaseUrl(url), /VITE_API_URL/)
  }
})

test('AI actions use the shared client, Node paths, bearer and idempotency without clearing a valid session', async (t) => {
  const storage = new Map([['cvbuddy.auth.token', 'test-user-token']])
  const redirects: string[] = []
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
    },
    sessionStorage: { setItem: () => undefined },
    dispatchEvent: () => true,
    location: { pathname: '/ai-assistant', replace: (path: string) => redirects.push(path) },
  } })
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })

  for (const base of ['/api', 'http://localhost:5000/api']) {
    const server = await createServer({
      configFile: false,
      envFile: false,
      root: fileURLToPath(new URL('..', import.meta.url)),
      resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
      define: { 'import.meta.env.VITE_API_URL': JSON.stringify(base) },
      server: { middlewareMode: true, watch: null, ws: false },
      appType: 'custom',
    })
    try {
      const { httpClient } = await server.ssrLoadModule('/src/apis/httpClient.ts')
      const api = await server.ssrLoadModule('/src/modules/ai/aiApi.ts')
      const payload = { industrySlug: 'language', targetRole: 'Translator' }
      const actions = [
        ['score', () => api.scoreCv('cv/1', payload, 'retry-key')],
        ['review', () => api.reviewCv('cv/1', payload, 'retry-key')],
        ['feedback', () => api.getFeedback('cv/1', payload, 'retry-key')],
        ['translate-to-english', () => api.translateCv('cv/1', 'retry-key')],
        ['translate-and-score', () => api.translateAndScoreCv('cv/1', payload, 'retry-key')],
      ] as const
      for (const [action, run] of actions) {
        httpClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
          assert.equal(config.method, 'post')
          assert.equal(httpClient.getUri(config), `${base}/ai/cvs/cv%2F1/${action}`)
          assert.equal(config.headers.get('Authorization'), 'Bearer test-user-token')
          assert.equal(config.headers.get('Idempotency-Key'), 'retry-key')
          assert.equal(config.headers.has('X-AI-Internal-Key'), false)
          return { data: { success: true, data: { aiResult: { id: 'result' }, workflow: { id: 'workflow' } } }, status: 200, statusText: 'OK', headers: {}, config }
        }
        await run()
      }
      httpClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        assert.ok(config.headers.get('Idempotency-Key'))
        throw new AxiosError('AI unavailable', undefined, config, undefined, {
          data: { code: 'AI_SERVICE_AUTH_FAILED' }, status: 503, statusText: 'Unavailable', headers: {}, config,
        })
      }
      await assert.rejects(api.translateCv('cv-1'))
      assert.equal(storage.get('cvbuddy.auth.token'), 'test-user-token')
      assert.deepEqual(redirects, [])

      // A real user-auth 401 must still invalidate the session.
      httpClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        throw new AxiosError('Unauthorized', undefined, config, undefined, {
          data: { code: 'UNAUTHORIZED' }, status: 401, statusText: 'Unauthorized', headers: {}, config,
        })
      }
      await assert.rejects(api.translateCv('cv-1'))
      assert.equal(storage.has('cvbuddy.auth.token'), false)
      storage.set('cvbuddy.auth.token', 'test-user-token')
      redirects.length = 0
    } finally {
      await server.close()
    }
  }
})
