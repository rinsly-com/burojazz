/**
 * Helpers for Payload's lexical rich text values.
 *
 * A field the editor typed into and then cleared is not `null` — it holds a
 * root with one empty paragraph. Anything deciding *whether to render at all*
 * (e.g. "does this service card open a dialog?") has to look inside.
 */

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null

/** True when a node (or any of its descendants) would render something. */
function nodeHasContent(node: unknown): boolean {
  if (!isRecord(node)) return false

  // Text nodes count only when they hold more than whitespace.
  if (typeof node.text === 'string') return node.text.trim().length > 0

  const children = node.children
  if (Array.isArray(children)) return children.some(nodeHasContent)

  // A childless node that isn't text is still content when it renders on its
  // own (an upload, a horizontal rule, …) — but a bare empty paragraph is not.
  return node.type !== 'paragraph'
}

/** True when a Payload rich text value holds actual content. */
export function hasRichTextContent(value: unknown): boolean {
  if (!isRecord(value)) return false
  const root = value.root
  if (!isRecord(root)) return false
  const children = root.children
  return Array.isArray(children) && children.some(nodeHasContent)
}
