/**
 * Rich text rendering (src/fields/textEditor.ts + the `.rich-text` styles).
 *
 * REGRESSION: the editor only offered paragraphs and inline marks, so editors
 * could not write a heading or a list in body copy at all. The standalone Rich
 * text block DID have Payload's full default feature set — but nothing styled
 * the output, and Tailwind's preflight resets exactly those elements
 * (`h1..h6 { font-size: inherit }`, `ol, ul { list-style: none }`). A heading
 * rendered as body text and a list lost its markers, so the features looked
 * broken rather than merely unstyled.
 *
 * These assert the two halves that have to hold together:
 *  1. every enabled feature converts to a real HTML element, and
 *  2. the wrapper carries `.rich-text`, which is what re-styles them.
 *
 * A feature that converts to nothing, or output that loses the class, is the
 * exact failure being pinned.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RichTextBlock } from '../../src/components/frontend/blocks/RichTextBlock'
import { textFeatures } from '../../src/fields/textEditor'

/** Lexical text-format bitmask (see @lexical/text). */
const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8

const text = (value: string, format = 0) => ({
  type: 'text' as const,
  text: value,
  detail: 0,
  format,
  mode: 'normal' as const,
  style: '',
  version: 1,
})

const block = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

const listItem = (value: string, extra: Record<string, unknown> = {}) =>
  block('listitem', [text(value)], { value: 1, ...extra })

/** One value exercising every feature textEditor enables. */
const SAMPLE = {
  root: block('root', [
    block('heading', [text('Heading two')], { tag: 'h2' }),
    block('heading', [text('Heading three')], { tag: 'h3' }),
    block('heading', [text('Heading four')], { tag: 'h4' }),
    block('paragraph', [
      text('plain '),
      text('bold', BOLD),
      text(' '),
      text('italic', ITALIC),
      text(' '),
      text('underline', UNDERLINE),
    ]),
    block('list', [listItem('first bullet'), listItem('second bullet')], {
      listType: 'bullet',
      tag: 'ul',
      start: 1,
    }),
    block('list', [listItem('first number'), listItem('second number')], {
      listType: 'number',
      tag: 'ol',
      start: 1,
    }),
    block('list', [listItem('done', { checked: true }), listItem('todo', { checked: false })], {
      listType: 'check',
      tag: 'ul',
      start: 1,
    }),
    block('quote', [text('A quotation.')]),
    { type: 'horizontalrule', version: 1 },
    block('paragraph', [text('centred')], { format: 'center' }),
    block('paragraph', [text('indented')], { indent: 1 }),
    block('paragraph', [
      block('link', [text('a link')], {
        fields: { linkType: 'custom', url: 'https://example.com', newTab: false },
      }),
    ]),
  ]),
}

type BlockProps = Parameters<typeof RichTextBlock>[0]

const renderSample = () => {
  const props = { blockType: 'richText', content: SAMPLE, width: 'narrow' } as unknown as BlockProps
  const { container } = render(<RichTextBlock {...props} />)
  return container
}

/** What the editor lets someone insert, as opposed to what renders. */
const featureKeys = () => textFeatures().map((f) => (f as { key: string }).key)

describe('the editor offers every text feature', () => {
  // This is a separate axis from the rendering tests below: the JSX converters
  // handle heading/list/quote nodes whether or not the editor can produce them,
  // so removing a feature here breaks authoring while every render test still
  // passes. Both halves need pinning.
  it.each([
    ['headings', 'heading'],
    ['bulleted lists', 'unorderedList'],
    ['numbered lists', 'orderedList'],
    ['checklists', 'checklist'],
    ['block quotes', 'blockquote'],
    ['horizontal rules', 'horizontalRule'],
    ['text alignment', 'align'],
    ['indentation', 'indent'],
    ['links', 'link'],
    ['bold', 'bold'],
    ['italic', 'italic'],
    ['underline', 'underline'],
    ['strikethrough', 'strikethrough'],
    ['inline code', 'inlineCode'],
    ['subscript', 'subscript'],
    ['superscript', 'superscript'],
  ])('enables %s', (_label, key) => {
    expect(featureKeys()).toContain(key)
  })

  it('exposes a toolbar, or none of the above is reachable', () => {
    expect(featureKeys()).toContain('toolbarFixed')
    expect(featureKeys()).toContain('toolbarInline')
  })

  it.each(['upload', 'relationship', 'blocks'])(
    'does not offer the %s node, which nothing renders or styles',
    (key) => {
      expect(featureKeys()).not.toContain(key)
    },
  )

  it('offers no h1 — the hero already provides the page heading', () => {
    const heading = textFeatures().find((f) => (f as { key: string }).key === 'heading') as {
      serverFeatureProps?: { enabledHeadingSizes?: string[] }
    }
    expect(heading.serverFeatureProps?.enabledHeadingSizes).not.toContain('h1')
  })
})

describe('every enabled feature converts to a real element', () => {
  it.each([
    ['heading 2', 'h2', 'Heading two'],
    ['heading 3', 'h3', 'Heading three'],
    ['heading 4', 'h4', 'Heading four'],
    ['bulleted list', 'ul', 'first bullet'],
    ['numbered list', 'ol', 'first number'],
    ['blockquote', 'blockquote', 'A quotation.'],
    ['link', 'a[href="https://example.com"]', 'a link'],
  ])('renders a %s as <%s>', (_label, selector, content) => {
    const el = renderSample().querySelector(selector)
    expect(el, `${selector} should be rendered`).not.toBeNull()
    expect(el!.textContent).toContain(content)
  })

  it('renders a horizontal rule', () => {
    expect(renderSample().querySelector('hr')).not.toBeNull()
  })

  it('renders list items, not bare text', () => {
    // Without <li> elements the CSS markers have nothing to attach to.
    expect(renderSample().querySelectorAll('li').length).toBeGreaterThanOrEqual(4)
  })

  it('marks up inline formatting instead of dropping it', () => {
    const c = renderSample()
    expect(c.querySelector('strong')?.textContent).toBe('bold')
    expect(c.querySelector('em')?.textContent).toBe('italic')
  })
})

describe('the output is styled', () => {
  it('wraps the value in .rich-text, which re-applies what preflight strips', () => {
    // Tailwind preflight kills heading sizes and list markers globally; this
    // class is the only thing putting them back.
    const wrapper = renderSample().querySelector('.rich-text')
    expect(wrapper, 'rich text output must carry the .rich-text class').not.toBeNull()
    expect(wrapper!.querySelector('h2')).not.toBeNull()
  })

  it('no longer relies on prose-* utilities', () => {
    // There is no @tailwindcss/typography plugin in this project, so any
    // prose-* class is dead weight that reads as if it were styling something.
    expect(renderSample().innerHTML).not.toMatch(/\bprose-/)
  })
})
