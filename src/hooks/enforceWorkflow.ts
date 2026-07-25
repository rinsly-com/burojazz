/**
 * The editorial state machine now lives in the shared engine, so every Rinsly
 * site gets the same rules (and the same fixes):
 *
 *   Draft ─(author)─► Review ─(reviewer approves)─► Ready ─(reviewer publishes)─► Published
 *
 * This site keeps its OWN Pages collection (see payload.config.ts — it passes a
 * full `collections` override for its single-language content model), so it
 * wires the hook up itself rather than using `buildPages({ workflow: true })`.
 * The rules are identical either way.
 *
 * Kept as a re-export rather than changing every import site, and because the
 * path is referenced from collections/Pages.ts.
 */
export { enforceWorkflow } from '@rinsly-com/site-core/hooks/enforceWorkflow'
export type { WorkflowStatus } from '@rinsly-com/site-core/hooks/enforceWorkflow'
