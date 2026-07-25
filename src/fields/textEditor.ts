import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * The editor for every rich text field on the site: the full set of *text*
 * features — structure (headings, lists, quotes, rules), inline marks, and
 * layout (alignment, indentation).
 *
 * Deliberately no Upload/Relationship/Blocks features. Those embed other
 * documents into the flow, which is what the page's own block layout is for;
 * keeping them out means a rich text value stays plain portable text.
 *
 * Headings start at h2 because every page already renders an h1 (the hero) and
 * h2 section titles, so letting body copy inject its own h1 would produce a
 * document with several — bad for both screen readers and SEO.
 *
 * IMPORTANT: anything enabled here needs matching output styles. Tailwind's
 * preflight sets `h1..h6 { font-size: inherit }` and `ol, ul { list-style:
 * none }`, so an unstyled heading renders as body text and a list loses its
 * markers entirely. The `.rich-text` class in globals.css is that styling —
 * every place that renders a rich text value applies it.
 */
/**
 * The feature list, exported separately so tests can assert exactly what an
 * editor is able to insert — the editor object itself exposes nothing readable.
 */
export const textFeatures = () => [
  // Toolbars, so the features below are actually reachable: the fixed bar for
  // block-level structure, the floating one for marks on a selection.
  FixedToolbarFeature(),
  InlineToolbarFeature(),

  // Structure
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
  UnorderedListFeature(),
  OrderedListFeature(),
  ChecklistFeature(),
  BlockquoteFeature(),
  HorizontalRuleFeature(),

  // Inline marks
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  StrikethroughFeature(),
  InlineCodeFeature(),
  SubscriptFeature(),
  SuperscriptFeature(),
  LinkFeature({}),

  // Layout
  AlignFeature(),
  IndentFeature(),
]

export const textEditor = lexicalEditor({ features: textFeatures })
