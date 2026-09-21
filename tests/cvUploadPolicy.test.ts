import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CV_ACCEPT,
  MAX_CV_SIZE_BYTES,
  validateCvFile,
  type CvUploadCandidate,
} from '../src/modules/applicant/cvUploadPolicy.ts'

const file = (
  name: string,
  type: string,
  size: number,
): CvUploadCandidate => ({ name, type, size })

test('CV picker advertises only PDF and DOCX', () => {
  assert.match(CV_ACCEPT, /\.pdf/)
  assert.match(CV_ACCEPT, /\.docx/)
  assert.doesNotMatch(CV_ACCEPT, /\.doc(?:,|$)/)
  assert.doesNotMatch(CV_ACCEPT, /application\/msword/)
})

test('CV selection rejects missing and empty files', () => {
  assert.match(validateCvFile(null) ?? '', /valid CV file/)
  assert.match(validateCvFile(file('cv.pdf', 'application/pdf', 0)) ?? '', /valid CV file/)
})

test('CV selection rejects legacy DOC and mismatched MIME types', () => {
  assert.match(validateCvFile(file('cv.doc', 'application/msword', 100)) ?? '', /PDF and DOCX/)
  assert.match(validateCvFile(file('cv.pdf', '', 100)) ?? '', /PDF and DOCX/)
  assert.match(validateCvFile(file('cv.pdf', 'application/octet-stream', 100)) ?? '', /PDF and DOCX/)
  assert.match(validateCvFile(file('cv.docx', 'application/pdf', 100)) ?? '', /PDF and DOCX/)
})

test('CV selection accepts PDF and DOCX one byte below the 5 MB limit', () => {
  assert.equal(validateCvFile(file('cv.pdf', 'application/pdf', MAX_CV_SIZE_BYTES - 1)), undefined)
  assert.equal(validateCvFile(file(
    'cv.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    MAX_CV_SIZE_BYTES - 1,
  )), undefined)
})

test('CV selection accepts a file exactly at the 5 MB limit', () => {
  assert.equal(validateCvFile(file('cv.pdf', 'application/pdf', MAX_CV_SIZE_BYTES)), undefined)
})

test('CV selection rejects a file one byte above the 5 MB limit', () => {
  assert.match(
    validateCvFile(file('cv.pdf', 'application/pdf', MAX_CV_SIZE_BYTES + 1)) ?? '',
    /must not exceed 5 MB/,
  )
})
