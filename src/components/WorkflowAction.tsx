/**
 * Stage-aware action button (Submit for review / Approve / Publish), now shared
 * via @rinsly-com/site-core.
 *
 * This file has to exist even though it only re-exports: Payload resolves admin
 * component paths against THIS app, so `collections/Pages.ts` points at
 * `/components/WorkflowAction#WorkflowAction` and the importMap resolves it
 * here. Same convention as the engine's own `fields/icon.ts` → IconSelector.
 *
 * Re-run `pnpm generate:importmap` if this path ever moves.
 */
export { WorkflowAction, WorkflowActionDefault as default } from '@rinsly-com/site-core/admin'
