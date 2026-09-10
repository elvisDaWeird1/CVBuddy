import { Fragment, type ReactNode } from 'react'

type RichTextLine = {
  type: 'blank' | 'heading' | 'bullet' | 'number' | 'paragraph' | 'code'
  text: string
  level?: number
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    const key = keyPrefix + '-' + index
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong className={'font-semibold text-[var(--color-text-primary)]'} key={key}>{part.slice(2, -2)}</strong>
    }
    return <Fragment key={key}>{part}</Fragment>
  })
}

function parseAiRichText(text: string): RichTextLine[] {
  let inCodeBlock = false
  const lines: RichTextLine[] = []
  const codeFence = String.fromCharCode(96).repeat(3)

  text.replace(/\r\n?/g, '\n').split('\n').forEach((rawLine) => {
    const line = rawLine.trim()
    if (line.startsWith(codeFence)) {
      inCodeBlock = !inCodeBlock
      return
    }
    if (inCodeBlock) {
      lines.push({ type: 'code', text: rawLine })
      return
    }
    if (!line) {
      lines.push({ type: 'blank', text: '' })
      return
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      lines.push({ type: 'heading', text: heading[2], level: heading[1].length })
      return
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line)
    if (bullet) {
      lines.push({ type: 'bullet', text: bullet[1] })
      return
    }
    const numbered = /^(\d+)[.)]\s+(.+)$/.exec(line)
    if (numbered) {
      lines.push({ type: 'number', text: numbered[2] })
      return
    }
    lines.push({ type: 'paragraph', text: line })
  })

  return lines
}

export function AiRichText({ text }: { text: string }) {
  const lines = parseAiRichText(text)
  const content: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line.type === 'blank') {
      content.push(<div className={'h-3'} key={'blank-' + index} />)
      index += 1
      continue
    }
    if (line.type === 'heading') {
      const className = line.level === 1
        ? 'mb-2 mt-4 text-lg font-semibold text-[var(--color-text-primary)]'
        : 'mb-1 mt-3 text-base font-semibold text-[var(--color-text-primary)]'
      content.push(
        line.level === 1
          ? <h3 className={className} key={'heading-' + index}>{renderInline(line.text, 'heading-' + index)}</h3>
          : line.level === 2
            ? <h4 className={className} key={'heading-' + index}>{renderInline(line.text, 'heading-' + index)}</h4>
            : <h5 className={className} key={'heading-' + index}>{renderInline(line.text, 'heading-' + index)}</h5>,
      )
      index += 1
      continue
    }
    if (line.type === 'bullet' || line.type === 'number') {
      const listType = line.type
      const startIndex = index
      const items: RichTextLine[] = []
      while (index < lines.length && lines[index].type === listType) {
        items.push(lines[index])
        index += 1
      }
      const listItems = items.map((item, itemIndex) => (
        <li className={'pl-1'} key={'list-item-' + startIndex + '-' + itemIndex}>
          {renderInline(item.text, 'list-' + startIndex + '-' + itemIndex)}
        </li>
      ))
      content.push(
        listType === 'bullet'
          ? <ul className={'my-2 list-disc space-y-1 pl-5 marker:text-[var(--color-teal)]'} key={'list-' + startIndex}>{listItems}</ul>
          : <ol className={'my-2 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-[var(--color-teal)]'} key={'list-' + startIndex}>{listItems}</ol>,
      )
      continue
    }
    if (line.type === 'code') {
      const startIndex = index
      const codeLines: string[] = []
      while (index < lines.length && lines[index].type === 'code') {
        codeLines.push(lines[index].text)
        index += 1
      }
      content.push(
        <pre className={'my-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-[var(--radius-sm)] bg-[var(--color-navy)] px-4 py-3 font-mono text-xs text-[var(--color-text-on-navy)]'} key={'code-' + startIndex}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      )
      continue
    }
    content.push(<p className={'py-0.5'} key={'paragraph-' + index}>{renderInline(line.text, 'paragraph-' + index)}</p>)
    index += 1
  }

  return (
    <div className={'min-w-0 break-words text-sm leading-relaxed text-[var(--color-text-secondary)]'}>
      {content}
    </div>
  )
}
