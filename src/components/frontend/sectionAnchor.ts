/**
 * Scroll-target ids for onepager sections.
 *
 * `RenderBlocks` publishes the content anchor on a wrapper around the block
 * (the anchor the content endpoint writes, otherwise the stable block id
 * that SectionSelect stores). Preview goes through site-core's
 * `createPreviewShell`, which owns its own wrapper; this site's
 * `PreviewShell` only supplies block components. The package source was not
 * readable from this environment (GitHub packages 401), so the formula
 * below is the one the public renderer emits — the ids `#wie-wij-zijn`,
 * `#vacatures`, and the nav hashes resolve against.
 *
 * About and Vacancies used to hardcode those two ids on their `<section>`.
 * Writing the same anchor through the content endpoint then published it
 * twice. The historical id stays only when the wrapper will not already
 * emit it, so an old link keeps working and the id is never duplicated.
 */

export function contentAnchorId(anchor?: string | null): string {
  return anchor?.trim().replace(/^#+/, '') ?? ''
}

/** Id of the wrapper around a block. Content anchor wins over the block id. */
export function blockWrapperId(block: {
  anchor?: string | null
  id?: string | null
}): string | undefined {
  return contentAnchorId(block.anchor) || block.id || undefined
}

/**
 * Historical section id (`wie-wij-zijn`, `vacatures`).
 * Returned only when no content anchor (and no block-id fallback on the
 * wrapper) already publishes that same id.
 */
export function fallbackSectionId(
  block: { anchor?: string | null; id?: string | null },
  fallbackId: string,
): string | undefined {
  if (blockWrapperId(block) === fallbackId) return undefined
  return fallbackId
}
