import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_PORTFOLIO_FILE_SIZE_BYTES, validateMomentMediaFiles, validatePortfolioUploadFile } from '../src/modules/portfolio/portfolioUploadPolicy.ts'

const file = (name: string, type: string, size: number) => ({ name, type, size })

test('portfolio uploads use the exact 5 MB boundary', () => {
  assert.equal(validatePortfolioUploadFile(file('cover.png', 'image/png', MAX_PORTFOLIO_FILE_SIZE_BYTES - 1), 'cover'), undefined)
  assert.equal(validatePortfolioUploadFile(file('cover.png', 'image/png', MAX_PORTFOLIO_FILE_SIZE_BYTES), 'cover'), undefined)
  assert.match(validatePortfolioUploadFile(file('cover.png', 'image/png', MAX_PORTFOLIO_FILE_SIZE_BYTES + 1), 'cover') ?? '', /5 MB/)
})

test('portfolio upload types differ by use case', () => {
  assert.match(validatePortfolioUploadFile(file('proof.pdf', 'application/pdf', 100), 'moment') ?? '', /not supported/)
  assert.match(validatePortfolioUploadFile(file('proof.pdf', 'application/pdf', 100), 'cover') ?? '', /not supported/)
  assert.match(validatePortfolioUploadFile(file('cover.png', 'application/pdf', 100), 'cover') ?? '', /not supported/)
  assert.equal(validatePortfolioUploadFile(file('proof.pdf', 'application/pdf', 100), 'evidence'), undefined)
  assert.equal(validatePortfolioUploadFile(file('clip.mp4', 'video/mp4', 100), 'moment'), undefined)
})

test('moment media requires one to five valid files', () => {
  assert.match(validateMomentMediaFiles([]) ?? '', /at least one/)
  assert.match(validateMomentMediaFiles(Array.from({ length: 6 }, (_, index) => file(`${index}.jpg`, 'image/jpeg', 100))) ?? '', /at most 5/)
})
