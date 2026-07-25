/**
 * src/lib/richText.ts — hasRichTextContent.
 *
 * A lexical field the editor typed into and then cleared is not null: it holds
 * a root with one empty paragraph. Anything deciding *whether to render at all*
 * (does this service card open a dialog?) must look inside, or it shows an
 * empty dialog.
 */
import { describe, expect, it } from 'vitest'

import { hasRichTextContent } from '../../src/lib/richText'

const root = (...children: unknown[]) => ({ root: { type: 'root', children } })
const paragraph = (...children: unknown[]) => ({ type: 'paragraph', children })
const text = (t: string) => ({ type: 'text', text: t })

describe('empty values', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'text'],
    ['a number', 3],
    ['an object with no root', { foo: 1 }],
    ['a root that is not an object', { root: 'nope' }],
    ['a root with no children', { root: {} }],
    ['a root whose children are not an array', { root: { children: 'nope' } }],
  ])('treats %s as empty', (_label, value) => {
    expect(hasRichTextContent(value)).toBe(false)
  })

  it('treats an empty children array as empty', () => {
    expect(hasRichTextContent(root())).toBe(false)
  })

  it('treats a single empty paragraph as empty — the cleared-field case', () => {
    expect(hasRichTextContent(root(paragraph()))).toBe(false)
  })

  it('treats a paragraph holding an empty text node as empty', () => {
    expect(hasRichTextContent(root(paragraph(text(''))))).toBe(false)
  })

  it.each([
    ['spaces', '   '],
    ['a tab', '\t'],
    ['a newline', '\n'],
  ])('treats a paragraph of only %s as empty', (_label, whitespace) => {
    expect(hasRichTextContent(root(paragraph(text(whitespace))))).toBe(false)
  })

  it('treats several empty paragraphs as empty', () => {
    expect(hasRichTextContent(root(paragraph(), paragraph(), paragraph()))).toBe(false)
  })
})

describe('values that render', () => {
  it('finds text in a paragraph', () => {
    expect(hasRichTextContent(root(paragraph(text('Hello'))))).toBe(true)
  })

  it('finds text padded with whitespace', () => {
    expect(hasRichTextContent(root(paragraph(text('  Hello  '))))).toBe(true)
  })

  it('finds text after leading empty paragraphs', () => {
    expect(hasRichTextContent(root(paragraph(), paragraph(text('Hello'))))).toBe(true)
  })

  it('finds text nested several levels deep', () => {
    expect(hasRichTextContent(root(paragraph({ type: 'list', children: [text('Hi')] })))).toBe(true)
  })

  it('counts a childless non-paragraph node that renders on its own', () => {
    expect(hasRichTextContent(root({ type: 'horizontalrule' }))).toBe(true)
  })

  it('counts an upload node', () => {
    expect(hasRichTextContent(root({ type: 'upload', value: 1 }))).toBe(true)
  })
})
