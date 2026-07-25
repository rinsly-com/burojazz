# Deployment & CI/CD

This project runs across three environments with a headless-CMS → static-site
architecture on Cloudflare.

| Environment    | What runs                                    | Database      | How it deploys                                  |
| -------------- | -------------------------------------------- | ------------- | ----------------------------------------------- |
| **dev**        | Full Payload app (Next.js on Node)           | Local D1 mock | `pnpm dev`                                       |
| **accp**       | Full Payload CMS (admin + API) on a Worker   | Cloudflare D1 | Auto on push to `main` (Cloudflare Workers Build) |
| **production** | **Fully static HTML** — no runtime, no DB    | none          | Cloudflare Deploy Hook, fired when content is published |

- **accp** is the editor environment and the default preview. Editors log into
  the Payload admin, author content, and move it `draft → in review → published`.
- **production** is a static export (`out/`) of the public frontend, built by
  fetching **published** content from accp's API and served from Cloudflare's
  edge (Workers Static Assets). Publishing content on accp triggers the rebuild.

```
 push to main ───► Workers Build ───► deploy accp (Payload + D1)
                                            │
 editor clicks Publish ─► Payload afterChange hook ─► POST Deploy Hook
                                            │
                                            ▼
                              Workers Build (production)
                              pnpm run build:static  (fetches published
                              content from accp API) ─► deploy out/ (static)
```

---

## Content workflow (Draft → Review → Ready → Published)

The `pages` collection has drafts/versions enabled plus a `workflowStatus` field,
with rules enforced server-side by `src/hooks/enforceWorkflow.ts`:

1. **Draft** — `workflowStatus = draft`. Work in progress.
2. **Review** — author moves it to `review` to request review.
3. **Ready** — a **reviewer** approves it (`ready`). Only reviewers can do this.
4. **Published** — a **reviewer** publishes (Status → Published, i.e. `_status`
   set to `published`). This is only allowed from **Ready**, and fires the deploy
   hook to rebuild production. Publishing resets `workflowStatus` to `draft` for
   the next edit cycle.

### Roles (`users.roles`)

- **author** — create/edit content, submit Draft → Review.
- **reviewer** — everything an author can do, plus approve (Ready) and Publish.
- **admin** — everything, plus manage user roles.

The public frontend and the static build only ever read **published** documents
(enforced by the collection's `read` access control). PR-style review comments
live in the `comments` collection.

---

## One-time setup

### 1. Authenticate wrangler (interactive — run yourself)

```bash
pnpm wrangler login
```

### 2. Create the accp D1 database

```bash
pnpm wrangler d1 create burojazz-accp
```

Copy the returned `database_id` into `wrangler.jsonc` under `env.accp.d1_databases`
(replace `PLACEHOLDER_ACCP_DB_ID`). The top-level `burojazz-dev` id is only used
for remote dev; local `pnpm dev` uses a local mock and needs no real id.

Then regenerate types:

```bash
pnpm run generate:types
```

### 3. Create migrations

Drafts/versions add tables, so production needs migrations (dev auto-syncs schema):

```bash
pnpm payload migrate:create
```

Commit the generated `src/migrations/`.

### 4. Cloudflare Workers Build — accp (code deploy)

In the Cloudflare dashboard → Workers & Pages → **Create → Connect to Git**,
select this repo and configure:

- **Production branch:** `main`
- **Build command:** `pnpm run deploy` (runs migrations then builds+deploys)
- **Deploy command:** *(leave blank — `deploy:app` deploys)*
- **Environment variables:**
  - `CLOUDFLARE_ENV = accp`
  - `PAYLOAD_SECRET = <openssl rand -hex 32>` (mark as a secret)
- **D1 binding:** `D1` → `burojazz-accp`

Every push to `main` now migrates + deploys accp.

### 5. The production static build

The static site deploys via `pnpm run deploy:static` (which runs
`build:static` then `wrangler deploy --config wrangler.static.jsonc`), driven by
the **Deploy production (static)** GitHub Actions workflow
(`.github/workflows/deploy-prod.yml`).

Production is deployed **deliberately** — never automatically. The only triggers
are:

- the **Deploy now** button in the CMS admin Deploy view, which POSTs
  `/api/deploy` and fires a GitHub `repository_dispatch` (`deploy-static`);
- a manual run from the Actions tab (`workflow_dispatch`).

Publishing, editing or deleting content does **not** deploy. It only changes what
the next build will ship, so an editor can publish several pages and then deploy
once. Merges to `main` deploy accp only; prod picks that code up on the next
deploy.

### 6. Wire the dispatch credentials into accp

So the Deploy button can reach GitHub, set a token with `contents: write` on this
repo as a secret on the accp Worker:

```bash
pnpm wrangler secret put DEPLOY_DISPATCH_TOKEN --env accp
```

`DEPLOY_DISPATCH_URL` is already set as a plain var in `wrangler.jsonc`
(`https://api.github.com/repos/<owner>/<repo>/dispatches`); override
`DEPLOY_DISPATCH_EVENT` only if you rename the workflow's event type. With either
the URL or token missing (e.g. local dev) the deploy call is skipped and the
admin UI says so instead of failing.

---

## Secrets & variables summary

| Name                        | Where            | Purpose                                        |
| --------------------------- | ---------------- | ---------------------------------------------- |
| `PAYLOAD_SECRET`            | accp             | Signs Payload auth tokens                      |
| `CLOUDFLARE_ENV`            | accp build       | Selects the `accp` wrangler environment        |
| `DEPLOY_DISPATCH_URL`       | accp (var)       | GitHub dispatches endpoint the Deploy button POSTs to |
| `DEPLOY_DISPATCH_TOKEN`     | accp (secret)    | GitHub token (`contents: write`) for that dispatch |
| `DEPLOY_DISPATCH_EVENT`     | accp (optional)  | Dispatch event type (default `deploy-static`)  |
| `PAYLOAD_API_URL`           | prod build       | accp API origin the static build fetches from  |
| `NEXT_PUBLIC_PAYLOAD_API_URL`| prod build      | accp API origin the aanmelden form POSTs to (browser) |
| `FRONTEND_URL`              | accp             | CORS/CSRF allow-list for the static site origin(s), comma-separated |
| `AANMELDING_NOTIFY_TO`      | accp (optional)  | Team address that receives aanmelding emails (default `aanmeldingen@burojazz.com`) |
| `EMAIL_FROM_ADDRESS`        | accp (optional)  | From address for the team notification (must be a burojazz.com address) |
| `EMAIL_CONFIRM_FROM_ADDRESS`| accp (optional)  | From address for the submitter confirmation (must be on the Email-Sending subdomain, default `aanmelding@noreply.burojazz.com`) |

### Media (R2 + Cloudflare Image Transformations)

Media originals are stored in R2 and served by the accp worker at
`/api/media/file/<filename>`. The static production site rewrites those URLs
through Cloudflare Image Transformations (`/cdn-cgi/image/…`) so images are
resized and re-encoded (AVIF/WebP) at the edge — no `sharp` on the Worker. The
rewrite lives in `src/lib/image.ts` and is applied by the `<Media>` component
and `mediaUrl()` helper; it is gated on `PAYLOAD_API_URL` being an `https`
origin, so local dev and the worker's own preview serve plain same-origin URLs.

One-time setup on Cloudflare (per account/zone):

1. **Enable R2** on the Cloudflare account (Dashboard → R2 → Enable).
2. **Create the bucket**: `wrangler r2 bucket create burojazz-accp`.
   The `R2` binding in `wrangler.jsonc` is already wired; `payload.config.ts`
   activates the R2 storage adapter automatically once the binding resolves.
3. **Enable Image Transformations** on the `burojazz.com` zone
   (Dashboard → Images → Transformations → *Enable for this zone*). Without
   this, `/cdn-cgi/image/` URLs 404. Originals are same-zone, so "resize from
   any origin" is not required.

---

## Frontend notes

The public frontend lives in `src/app/(frontend)` and must be **static-export
safe**: fetch content over HTTP via `src/lib/pages.ts` (no `getPayload`/DB
imports), so it works both on accp at runtime and in the static build.

When you build out real pages, add dynamic routes (e.g.
`src/app/(frontend)/[slug]/page.tsx`) with `generateStaticParams()`. Note: under
`output: export`, a dynamic route with `dynamicParams = false` requires
`generateStaticParams()` to return **at least one** param — so publish some
content on accp (and set `PAYLOAD_API_URL` to accp) before the prod build, or it
will error on an empty result.

`scripts/build-static.mjs` temporarily removes the `(payload)` admin/API route
group and `my-route` before exporting; add any other server-only routes to its
`EXCLUDED` list.

## "Direct aanmelden" intake form

The homepage/header "Direct aanmelden" CTAs open a 4-step wizard dialog
(`src/components/frontend/aanmelden/`). Because the prod site is static, the
browser POSTs the submission cross-origin to the accp Payload API endpoint
`POST /api/aanmeldingen/submit`, which stores it in the `aanmeldingen`
collection and emails the team via an `afterChange` hook. `/aanmelden` is a
no-JS fallback page. Requirements:

1. **CORS** — set `FRONTEND_URL` on accp to the static site origin(s) (e.g.
   `https://burojazz.com`) so the browser POST is allowed.
2. **API origin** — set `NEXT_PUBLIC_PAYLOAD_API_URL` in the prod build to the
   accp origin. (In dev it's same-origin, so leave it unset.)
3. **Team notification — Cloudflare Email Routing** (see `src/lib/email.ts`):
   - Enable Email Routing on `burojazz.com`. ⚠ **This sets Cloudflare MX records
     and takes over inbound mail** — only do this if the domain does not already
     host mailboxes elsewhere, or use a subdomain.
   - Verify the destination address (`AANMELDING_NOTIFY_TO`) as an Email Routing
     destination.
   - The `send_email` binding `AANMELDING_EMAIL` is declared in `wrangler.jsonc`
     (dev + accp); keep its `destination_address` in sync with the verified
     address. Outside the Worker (local dev/CLI) mail is logged, not sent.
   - Because `destination_address` is pinned, this binding can send **only** to
     the verified team address — it cannot email arbitrary users.
4. **Submitter confirmation — Cloudflare Email Sending** (see `src/lib/email.ts`):
   - A receipt confirmation goes back to the referrer (`verwijzerEmail`). That is
     an arbitrary inbox, so it uses Email *Sending* (not Routing) from a dedicated
     onboarded subdomain: `wrangler email sending enable noreply.burojazz.com`
     (auto-adds SPF/DKIM/DMARC on the Cloudflare-managed zone).
   - The `send_email` binding `AANMELDING_CONFIRM_EMAIL` has no
     `destination_address` (any recipient) and `allowed_sender_addresses` pins the
     From to `EMAIL_CONFIRM_FROM_ADDRESS` (`aanmelding@noreply.burojazz.com`).
     Reply-To is set to the team address so replies are seen.
   - The confirmation is intentionally minimal and never echoes the sensitive
     intake data (health/DSM/reason) back over email.

## Manual commands

```bash
# Local development (Payload + local D1)
pnpm dev

# Deploy accp manually
CLOUDFLARE_ENV=accp pnpm run deploy

# Build the static prod site locally (fetches from PAYLOAD_API_URL)
pnpm run build:static        # -> ./out

# Preview the static site locally
pnpm run preview:static

# Deploy the static prod site manually
pnpm run deploy:static
```
