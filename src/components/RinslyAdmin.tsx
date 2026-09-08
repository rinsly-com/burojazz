/**
 * Every admin component the engine owns, re-exported for this app.
 *
 * Payload resolves `admin.components` paths against THIS app rather than against
 * the package, so the engine points all of them at one path,
 * `/components/RinslyAdmin` (see the engine's `config/adminPaths.ts`). Re-run
 * `pnpm generate:importmap` after touching this file.
 *
 * This site owns its content model, so its own `collections/Pages.ts` references
 * `WorkflowAction` and `WorkflowStatusCell` through this path too.
 *
 * Export the lot even though this site does not enable every feature: an unused
 * export costs an importMap entry and nothing else, while a missing one is a
 * blank admin screen found in production. The panels this site writes itself
 * (`ReviewPanel`, `CommentsPanel`, `SectionSelect`, `IconSelector`, `Deploy*`)
 * are app-owned and stay in their own files.
 */
export {
  AdminLogo,
  AdminIcon,
  AnalyticsPanel,
  UptimePanel,
  BackupsPanel,
  TotpLoginView,
  TotpSetupView,
  TotpGate,
  TotpNavLink,
  TotpAdminReset,
  WorkflowAction,
  WorkflowStatusCell,
  VisualEditBridge,
} from '@rinsly-com/site-core/admin'
