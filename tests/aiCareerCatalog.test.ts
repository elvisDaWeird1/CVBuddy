import assert from 'node:assert/strict'
import test from 'node:test'
import { CAREER_CATALOG } from '../src/modules/ai/aiCareerCatalog.ts'

test('career catalog mirrors the AI taxonomy ordering and supplies usable target roles', () => {
  assert.equal(CAREER_CATALOG.length, 8)
  assert.deepEqual(CAREER_CATALOG.map((industry) => industry.slug), ['ai_software', 'computer_science', 'business_administration', 'marketing', 'finance_banking', 'hospitality_tourism', 'language', 'law'])
  const verticals = CAREER_CATALOG.flatMap((industry) => industry.verticals)
  assert.equal(verticals.length, 42)
  assert.equal(new Set(verticals.map((vertical) => vertical.slug)).size, 42)
  for (const vertical of verticals) {
    assert.ok(vertical.targetRoles.length >= 4)
    assert.ok(vertical.targetRoles.some((role) => role.isOther))
    const predefined = vertical.targetRoles.filter((role) => !role.isOther)
    assert.equal(new Set(predefined.map((role) => role.value)).size, predefined.length)
    assert.ok(predefined.every((role) => role.value.length <= 150))
  }
})
