import { type AiResultRecord } from './aiApi'

export interface AiDimensionViewModel {
  key: string
  label: string
  score: number | null
  description?: string
}

export interface AiScoreViewModel {
  overallScore: number | null
  assessmentLabel: string
  dimensions: AiDimensionViewModel[]
  aiComment?: string
  note?: string
  fallbackText?: string
  partial: boolean
  malformed: boolean
}

export interface AiRewriteViewModel {
  original?: string
  suggested: string
  reason?: string
}

export interface AiFeedbackViewModel {
  aiComment?: string
  summary?: string
  strengths: string[]
  improvements: string[]
  rewrites: AiRewriteViewModel[]
  missingSections: string[]
  targetRoleFit?: string
  dimensions: AiDimensionViewModel[]
  fallbackText?: string
  partial: boolean
  malformed: boolean
}

type RecordValue = Record<string, unknown>

const DIMENSION_LABELS: Record<string, string> = {
  layout_ats: 'Layout and ATS',
  language: 'Language clarity',
  keywords: 'Keywords',
  jd_fit: 'Target-role fit',
  format: 'Format',
  clarity: 'Clarity',
  skills: 'Skills',
  experience: 'Experience',
  relevance: 'Relevance',
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function readNumberFrom(value: unknown, keys: string[]) {
  const directNumber = readNumber(value)
  if (directNumber !== null) {
    return directNumber
  }

  if (!isRecord(value)) {
    return null
  }

  for (const key of keys) {
    const nestedNumber = readNumber(value[key])
    if (nestedNumber !== null) {
      return nestedNumber
    }
  }

  return null
}

function readText(value: unknown, keys: string[] = []): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    const text = value
      .flatMap((item): string[] => {
        if (typeof item === 'string' && item.trim()) {
          return [item.trim()]
        }

        if (isRecord(item)) {
          const itemText: string | undefined = readText(item, ['text', 'message', 'description', 'value', 'suggestion', 'recommendation'])
          return itemText ? [itemText] : []
        }

        return []
      })
      .join(' ')

    if (text) {
      return text
    }
  }

  if (!isRecord(value)) {
    return undefined
  }

  for (const key of keys) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }

    if (Array.isArray(candidate)) {
      const text = candidate.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).join(' ')
      if (text) {
        return text
      }
    }
  }

  return undefined
}
function readStringList(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) {
      return [item.trim()]
    }

    if (!isRecord(item)) {
      return []
    }

    const text = readText(item, ['text', 'message', 'description', 'value', 'suggestion', 'recommendation'])
    return text ? [text] : []
  })
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function readFirstText(record: RecordValue, keys: string[]) {
  for (const key of keys) {
    const text = readText(record[key], ['text', 'message', 'description', 'summary', 'feedback', 'assessment', 'recommendation', 'rationale'])
    if (text) {
      return text
    }
  }

  return undefined
}

function resolveResultValue(value: unknown) {
  if (isRecord(value)) {
    return { structured: value, fallbackText: undefined }
  }

  if (typeof value !== 'string' || !value.trim()) {
    return { structured: undefined, fallbackText: undefined }
  }

  const text = value.trim()

  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed)
      ? { structured: parsed, fallbackText: undefined }
      : typeof parsed === 'string' && parsed.trim()
        ? { structured: undefined, fallbackText: parsed.trim() }
        : { structured: undefined, fallbackText: undefined }
  } catch {
    const looksLikeRawJson = text.startsWith('{') || text.startsWith('[')
    return { structured: undefined, fallbackText: looksLikeRawJson ? undefined : text }
  }
}

function resolveResult(result: AiResultRecord) {
  const parsedResult = resolveResultValue(result.result)
  const parsedResultText = resolveResultValue(result.resultText)

  if (parsedResult.structured || parsedResultText.structured) {
    return {
      structured: {
        ...parsedResultText.structured,
        ...parsedResult.structured,
      },
      fallbackText: undefined,
    }
  }

  return {
    structured: undefined,
    fallbackText: parsedResult.fallbackText || parsedResultText.fallbackText,
  }
}

function formatDimensionLabel(key: string) {
  return DIMENSION_LABELS[key] || key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function readDimensions(result: RecordValue): AiDimensionViewModel[] {
  const dimensions = result.dimensions
  const entries: Array<[string, unknown]> = isRecord(dimensions)
    ? Object.entries(dimensions)
    : Array.isArray(dimensions)
      ? dimensions.flatMap((item, index) => {
          if (!isRecord(item)) {
            return []
          }

          const key = readText(item.key || item.name || item.id, []) || `dimension-${index + 1}`
          return [[key, item] as [string, unknown]]
        })
      : isRecord(result.subScores)
        ? Object.entries(result.subScores)
        : []

  return entries.flatMap(([key, value]) => {
    const score = readNumberFrom(value, ['score', 'overall_score', 'overallScore', 'value', 'rating', 'points'])
    const description = readText(value, [
      'description',
      'feedback',
      'summary',
      'assessment',
      'recommendation',
      'notes',
      'message',
      'issues',
      'fixes',
      'missing',
      'gaps',
      'suggested_bullets',
      'suggestedBullets',
    ])

    if (score === null && !description) {
      return []
    }

    return [{ key, label: formatDimensionLabel(key), score, description }]
  })
}

function getAssessmentLabel(score: number | null) {
  if (score === null) {
    return 'Score unavailable'
  }

  // Temporary neutral labels; product has not defined official score thresholds.
  if (score < 60) {
    return 'Needs improvement'
  }

  if (score < 80) {
    return 'Fairly strong'
  }

  return 'Strong foundation'
}

export function adaptScoreResult(result: AiResultRecord): AiScoreViewModel {
  const source = resolveResult(result)
  const structured = source.structured
  const overallScore = result.score ?? (structured ? readNumberFrom(structured.overall_score ?? structured.overallScore ?? structured.score, []) : null)
  const dimensions = structured ? readDimensions(structured) : []
  const aiComment = structured
    ? readFirstText(structured, ['company_model_feedback', 'companyModelFeedback'])
    : undefined
  const noteCandidate = structured
    ? readFirstText(structured, ['disclaimer', 'explanation', 'overallFeedback'])
    : undefined
  const note = noteCandidate === aiComment ? undefined : noteCandidate
  const hasVisibleResult = overallScore !== null
    || dimensions.length > 0
    || Boolean(aiComment)
    || Boolean(note)
    || Boolean(source.fallbackText)

  return {
    overallScore,
    assessmentLabel: getAssessmentLabel(overallScore),
    dimensions,
    aiComment,
    note,
    fallbackText: source.fallbackText,
    partial: !hasVisibleResult || dimensions.length === 0,
    malformed: !hasVisibleResult,
  }
}

function readRewrites(value: unknown): AiRewriteViewModel[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (typeof item === 'string' && item.trim()) {
      return [{ suggested: item.trim() }]
    }

    if (!isRecord(item)) {
      return []
    }

    const suggested = readFirstText(item, [
      'suggested',
      'suggestion',
      'suggested_en',
      'suggestedEn',
      'suggested_vi',
      'suggestedVi',
      'rewrite',
      'rewritten',
      'after',
      'improved',
      'replacement',
      'recommended',
    ])
    if (!suggested) {
      return []
    }

    return [{
      original: readFirstText(item, ['original', 'original_ref', 'originalRef', 'before', 'current']),
      suggested,
      reason: readFirstText(item, ['reason', 'change_reason', 'changeReason', 'why', 'explanation']),
    }]
  })
}
export function adaptFeedbackResult(result: AiResultRecord): AiFeedbackViewModel {
  const source = resolveResult(result)
  const structured = source.structured
  if (!structured) {
    return {
      strengths: [],
      improvements: [],
      rewrites: [],
      missingSections: [],
      dimensions: [],
      fallbackText: source.fallbackText,
      partial: Boolean(source.fallbackText),
      malformed: !source.fallbackText,
    }
  }

  const strengths = uniqueStrings([
    ...readStringList(structured.strengths),
    ...readStringList(structured.positivePoints),
  ])
  const improvements = uniqueStrings([
    ...readStringList(structured.weaknesses),
    ...readStringList(structured.improvements),
    ...readStringList(structured.improvementChecklist),
    ...readStringList(structured.suggestions),
  ])
  const rewrites = readRewrites(structured.rewrites)
  const missingSections = uniqueStrings([
    ...readStringList(structured.missingSections),
    ...readStringList(structured.missing_sections),
    ...readStringList(structured.missing),
  ])
  const dimensions = readDimensions(structured)
  const aiComment = readFirstText(structured, ['company_model_feedback', 'companyModelFeedback'])
  const summaryCandidate = readFirstText(structured, ['overallFeedback', 'summary', 'explanation'])
  const summary = summaryCandidate === aiComment ? undefined : summaryCandidate
  const jdFit = isRecord(structured.dimensions) ? structured.dimensions.jd_fit : undefined
  const targetRoleFit = readFirstText(structured, ['targetRoleFit', 'target_role_fit', 'roleFit'])
    || readText(jdFit, ['feedback', 'summary', 'description', 'assessment'])
  const visibleGroupCount = [aiComment, summary, strengths.length, improvements.length, rewrites.length, missingSections.length, targetRoleFit, dimensions.length]
    .filter((value) => Boolean(value)).length

  return {
    aiComment,
    summary,
    strengths,
    improvements,
    rewrites,
    missingSections,
    targetRoleFit,
    dimensions,
    partial: visibleGroupCount > 0 && visibleGroupCount < 2,
    malformed: visibleGroupCount === 0,
  }
}

export interface AiTranslationSectionViewModel {
  heading?: string
  content: string
}

export interface AiTranslationViewModel {
  text: string
  sections: AiTranslationSectionViewModel[]
  notes: string[]
  partial: boolean
  malformed: boolean
}

const TRANSLATION_SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  other: 'Other',
}

function resolveTranslationSource(result: AiResultRecord): unknown {
  if (result.result !== undefined && result.result !== null) {
    return result.result
  }

  const resultText = typeof result.resultText === 'string' ? result.resultText.trim() : ''
  if (!resultText) {
    return undefined
  }

  try {
    return JSON.parse(resultText) as unknown
  } catch {
    return resultText
  }
}

function formatTranslationHeading(key: string) {
  return TRANSLATION_SECTION_LABELS[key]
    || key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function readTranslationSectionContent(value: unknown) {
  return readText(value, [
    'content',
    'text',
    'translated',
    'translation',
    'translated_text',
    'translatedText',
    'body',
    'value',
  ])
}

function readTranslationSections(value: unknown) {
  if (Array.isArray(value)) {
    let invalidCount = 0
    const sections = value.flatMap((item): AiTranslationSectionViewModel[] => {
      if (typeof item === 'string' && item.trim()) {
        return [{ content: item.trim() }]
      }

      if (!isRecord(item)) {
        invalidCount += 1
        return []
      }

      const content = readTranslationSectionContent(item)
      if (!content) {
        invalidCount += 1
        return []
      }

      return [{
        heading: readFirstText(item, ['heading', 'title', 'label', 'name', 'section']),
        content,
      }]
    })

    return { sections, invalidCount }
  }

  if (isRecord(value)) {
    let invalidCount = 0
    const sections = Object.entries(value).flatMap(([key, section]): AiTranslationSectionViewModel[] => {
      const content = readTranslationSectionContent(section)
      if (!content) {
        invalidCount += 1
        return []
      }

      return [{ heading: formatTranslationHeading(key), content }]
    })

    return { sections, invalidCount }
  }

  return { sections: [], invalidCount: 0 }
}

export function adaptTranslationResult(result: AiResultRecord): AiTranslationViewModel {
  const source = resolveTranslationSource(result)

  if (typeof source === 'string' && source.trim()) {
    return {
      text: source.trim(),
      sections: [],
      notes: [],
      partial: false,
      malformed: false,
    }
  }

  if (Array.isArray(source)) {
    const sectionResult = readTranslationSections(source)
    const visible = sectionResult.sections.length > 0

    return {
      text: '',
      sections: sectionResult.sections,
      notes: [],
      partial: visible && sectionResult.invalidCount > 0,
      malformed: !visible,
    }
  }

  if (!isRecord(source)) {
    return {
      text: '',
      sections: [],
      notes: [],
      partial: false,
      malformed: true,
    }
  }

  const nestedSections = source.sections || source.translationSections || source.blocks
  const sectionResult = readTranslationSections(nestedSections)
  const text = readText(source, [
    'translated',
    'translation',
    'translated_text',
    'translatedText',
    'text',
    'content',
  ]) || ''
  const notes = uniqueStrings([
    ...readStringList(source.notes),
    ...readStringList(source.warnings),
  ])
  const visible = Boolean(text) || sectionResult.sections.length > 0

  return {
    text,
    sections: sectionResult.sections,
    notes,
    partial: visible && sectionResult.invalidCount > 0,
    malformed: !visible,
  }
}
