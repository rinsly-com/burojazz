# When you hit a problem: unit test it

**The rule: no bug is considered fixed until a test fails without the fix.**

This is not "add tests when convenient". Every bug that reaches this repo —
reported by a human, found while debugging, or noticed in passing — gets a unit
test committed alongside the fix, in the same commit.

The reason is specific to this project: the integration suite boots a real
Payload + miniflare D1 instance, and it does not currently start on a local
machine (see [Known broken](#known-broken)). CI coverage that only exists in the
int suite is coverage you cannot run. Unit tests are the layer that actually
executes, so that is where the safety net has to live.

## The procedure

1. **Reproduce it in a test first.** Write the test before the fix where you
   can. If you already fixed it, revert your fix locally and confirm the test
   fails, then restore it.
2. **Prove the test catches the bug.** A regression test that passes against the
   broken code is worse than no test — it certifies a bug as fixed. Always run
   the mutation check:

   ```bash
   cp src/thing.ts /tmp/thing.bak
   #  ...re-introduce the bug in src/thing.ts...
   pnpm exec vitest run --config ./vitest.unit.config.mts tests/unit/thing.unit.spec.ts
   #  EXPECT FAILURES. If it passes, the test is not testing the bug.
   cp /tmp/thing.bak src/thing.ts
   ```

3. **Name the test after the behaviour, not the function.** `falls back to the
   live row when the page has no draft version` beats `test getRenderablePageBySlug`.
4. **Write down the incident.** Put a comment above the test saying what broke in
   production and why. In six months the comment is the only thing explaining
   why an odd-looking assertion matters. Mark it `// REGRESSION:`.
5. **Keep it fast and hermetic.** No network, no D1, no filesystem. Mock at the
   module boundary with `vi.mock`.

## Where tests go

| Suite | Path | Runs | Use for |
| --- | --- | --- | --- |
| **unit** | `tests/unit/*.unit.spec.{ts,tsx}` | `pnpm test:unit` — ~1s, no I/O | **Default.** Pure logic, access rules, config assertions, client components |
| int | `tests/int/*.int.spec.ts` | `pnpm test:int` — boots Payload + D1 | Only what genuinely needs a database |
| e2e | `tests/e2e/*.e2e.spec.ts` | `pnpm test:e2e` — Playwright | Full user journeys through a running app |

Reach for `tests/unit` unless the thing under test cannot work without a
database. Most things can: extract the logic and test it directly.

## What is unit-testable here (with examples in-tree)

- **Pure helpers** — `hrefFor.unit.spec.ts`, `richText.unit.spec.ts`,
  `metadata.unit.spec.ts`, `siteUrl.unit.spec.ts`
- **Access control** — `roles.unit.spec.ts`, `enforceWorkflow.unit.spec.ts`.
  Assert every *deny* as well as every allow; a false positive silently widens
  access across the CMS.
- **HTTP data helpers** — `pages.unit.spec.ts`. Stub `fetch` with
  `vi.stubGlobal` and assert the **query string**, not just the return value:
  the difference between `draft=true` and `_status=published` is the difference
  between shipping drafts and shipping nothing.
- **Payload config** — `collectionConfig.unit.spec.ts`. Import the collection
  and assert its shape. Several incidents here were config mistakes (a hook on
  the wrong lifecycle), and a config assertion catches those with no runtime.
- **Admin components** — `WorkflowAction.unit.spec.tsx`. Mock `@payloadcms/ui`
  wholesale and assert what the component asks Payload to do. This is how you
  test admin behaviour without booting Payload.
- **Module-load-time env reads** — a `const X = process.env.Y === 'true'` at
  module scope is fixed at import. Use `vi.resetModules()` and a dynamic
  `import()` per case (see `loadPages` in `pages.unit.spec.ts`).

## Conventions

- One file per module under test, named after it.
- A file-level docblock stating what the module does **and what went wrong
  before**.
- `it.each` for table-driven cases — most rules here are tables (role × action,
  stage × permission).
- Assert the negative case. "Refuses to publish from the draft stage" is the
  test that matters.
- No `@testing-library/jest-dom` in this repo: use plain DOM assertions
  (`expect(button.disabled).toBe(true)`), and `fireEvent`, not `user-event`.

## Incidents already covered

Keep this list current — it is the record of what has actually bitten us.

| Incident | Guarded by |
| --- | --- |
| Advancing a workflow stage overwrote the live row and **unpublished the page**, so it vanished from production on the next deploy | `WorkflowAction.unit.spec.tsx` |
| Preview (accp) hid published pages with no draft version rows — `/contact` 404'd on accp while live on production | `pages.unit.spec.ts` |
| Production was rebuilt by every publish, every draft save of a live page, and every Header/Footer save, making Actions runs look random | `triggerStaticDeploy.unit.spec.ts`, `collectionConfig.unit.spec.ts` |
| The static build must ship published content only — never a draft | `pages.unit.spec.ts` |

## Known broken

`pnpm test:int` currently fails to boot on a local machine: `api.int.spec.ts`
and `workflow.int.spec.ts` both die in `beforeAll` → `getPayload()` →
`pushDevSchema` with `D1_ERROR: FOREIGN KEY constraint failed`. It reproduces on
`main` and is unrelated to any one change. Until it is fixed, **do not rely on
the int suite to catch your regression** — write the unit test.
