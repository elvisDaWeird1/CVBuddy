import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('Vercel rewrites direct browser navigation to the React entry point', () => {
  const configuration = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'))

  assert.deepEqual(configuration.rewrites, [
    { source: '/(.*)', destination: '/index.html' },
  ])
})
