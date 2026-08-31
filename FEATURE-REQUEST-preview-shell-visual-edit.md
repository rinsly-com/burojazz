# Feature request: mount PreviewShell so visual editing works

**Found by:** Yaron, 2026-08-30, after site-core 0.15→0.16 brought live
preview / visual editing to ACCP. The iframe loads (after the
`localization: false` preview URL fix in 0.16.1), but clicking the page does
not make fields editable the way rinsly.com does.
**Status:** done (2026-08-31) — PreviewShell + route preview branch +
VisualEditBridge on owned Pages; rich text via `RichTextField` + `editable()`
on Accordion / VisionMission / RichTextBlock / About / Services.
**Where:** this repo only (`rinsly-com/burojazz`). Engine already ships the
pieces; Site and Template already wire them.

## What happens today

Live preview admin config is on (`buildSiteConfig` defaults `livePreview:
true`). The split view opens and the iframe hits `/?preview=1` or
`/slug?preview=1`.

What is missing on burojazz:

1. **No `src/components/PreviewShell.tsx`.** Site and Template each have a
   `'use client'` module that calls `createPreviewShell({ … })` with this
   site's block renderers. Without it, `?preview=1` still renders the public
   server tree from `RenderBlocks`. Form state never remounts the blocks in
   the browser, so the overlay cannot match live values → no in-place edit.
2. **Routes never load it.** Home and `[slug]` call `RenderBlocks` directly.
   Engine routes take `loadPreviewShell: () => import('@/components/PreviewShell')`
   and, when `?preview=1`, render that shell instead of the static layout.
3. **`VisualEditBridge` is not re-exported** from `src/components/RinslyAdmin.tsx`
   (Site exports it). Even if the shell existed, the admin return channel
   (click section → focus field, blur writes) would not mount unless Pages
   also points `admin.components.edit.livePreview` at it.
4. **This site owns `collections/Pages.ts`.** Engine `buildPages({ livePreview })`
   injects the bridge component; burojazz's Pages does not. That wiring has
   to be copied (or Pages rebuilt via `buildPages` with the workflow extras).

Bespoke blocks are the whole product here (hero, services, social, …). Leaving
them off the preview shell is exactly the failure mode the engine changelog
calls out: the blocks the client paid for are the ones that do not update as
you type.

## What to build

### 1. `PreviewShell` mirroring `RenderBlocks`

Add `src/components/PreviewShell.tsx` (same pattern as Template / Site):

- `'use client'`
- Import every block component `RenderBlocks` already switches on
- `export const PreviewShell = createPreviewShell({ hero: …, services: …, … })`

Do **not** import `@/components/frontend/RenderBlocks` into that module: that
map is server-callable today; marking it client would break the public
render. Duplicate the map and keep the two in step (see ADD-BLOCK /
CORE-PACKAGE notes).

Renderers must be client-safe (no `async` server components). Audit any block
that fetches on the server before putting it in the shell.

### 2. Preview branch on frontend routes

On `src/app/(frontend)/page.tsx` and `[slug]/page.tsx` (and any other page
route that renders `layout`):

- Detect preview the same way the engine does (`resolvePreview` /
  `?preview=1` + draft fetch)
- When preview: render `<PreviewShell initialPage={…} locale={…} serverURL={…} />`
  via `loadPreviewShell: () => import('@/components/PreviewShell')` (dynamic
  import so public visitors do not download the shell + icon barrel)
- When not: keep today's `RenderBlocks` path

Prefer threading through `createHomeRoute` / `createSlugRoute` if this site
can adopt them without losing workflow / unlocalized routing. If not, copy the
`renderPreview` branch from `site-core/app/factories.tsx` into the local
routes — same contract, no engine change required.

Preserve existing behaviour: header clearance, anchors, JSON-LD, metadata,
`localization: false` paths (`/` not `/nl`).

### 3. Admin bridge

- Export `VisualEditBridge` from `RinslyAdmin.tsx`
- On Pages edit view, set
  `admin.components.edit.livePreview: { Component: '/components/RinslyAdmin#VisualEditBridge' }`
  (same path the engine uses)
- `pnpm generate:importmap`

### 4. `editable()` only where matching fails

Most fields need no annotation (overlay matches stored strings to DOM text).
Add `editable()` from `@rinsly-com/site-core/preview` only for:

- Rich text containers (`inline: false`)
- Values the renderer transforms (stored `"acme"` → shown `"Acme B.V."`)

Do this after the shell works; do not spray attributes on every heading first.

## Done when

- Opening a page on ACCP → live preview: typing in the sidebar updates the
  iframe without save
- Clicking a plain-text string on the page focuses that field / allows in-place
  edit
- Section hover tools (move / duplicate / delete / add) work on burojazz blocks
- Public (non-preview) HTML and JS weight unchanged (shell stays behind the
  dynamic import)
- Static prod build still strips preview the way `build-static.mjs` already does
  for `loadPreviewShell`

## Out of scope

- Engine changes (unless a factory gap for `localization: false` + owned Pages
  shows up — then a Core FR, not this file)
- Header / Footer as-you-type (engine already documents those as save-to-redraw)
- Partner Portal

## Related

- site-core changelog 0.15.x — "How a site's own blocks stay live" / PreviewShell
- Core 0.16.1 — unlocalized `previewPath` (already on ACCP)
- Template `src/components/PreviewShell.tsx` + `loadPreviewShell` on routes —
  copy the shape, not the callout block
