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

### 5. Create the production Deploy Hook + static build

The static site deploys via `pnpm run deploy:static` (which runs
`build:static` then `wrangler deploy --config wrangler.static.jsonc`).

Set up a second Workers Build (or a scheduled/hook-triggered build) for the
static site with:

- **Build command:** `pnpm run deploy:static`
- **Environment variables:**
  - `PAYLOAD_API_URL = https://<your-accp-worker-url>` (so the build fetches
    published content from accp)
- **Trigger:** a **Deploy Hook** (Settings → Builds → Deploy Hooks). Copy the
  hook URL.

### 6. Wire the deploy hook into accp

Set the hook URL as a secret on the accp Worker so publishing triggers a rebuild:

```bash
pnpm wrangler secret put CLOUDFLARE_DEPLOY_HOOK_URL --env accp
# paste the Deploy Hook URL from step 5
```

(Or add it as an environment variable on the accp Workers Build.)

---

## Secrets & variables summary

| Name                        | Where            | Purpose                                        |
| --------------------------- | ---------------- | ---------------------------------------------- |
| `PAYLOAD_SECRET`            | accp             | Signs Payload auth tokens                      |
| `CLOUDFLARE_ENV`            | accp build       | Selects the `accp` wrangler environment        |
| `CLOUDFLARE_DEPLOY_HOOK_URL`| accp (secret)    | Publishing content triggers the prod rebuild   |
| `PAYLOAD_API_URL`           | prod build       | accp API origin the static build fetches from  |
| `NEXT_PUBLIC_PAYLOAD_API_URL`| prod build      | accp API origin the aanmelden form POSTs to (browser) |
| `FRONTEND_URL`              | accp             | CORS/CSRF allow-list for the static site origin(s), comma-separated |
| `AANMELDING_NOTIFY_TO`      | accp (optional)  | Team address that receives aanmelding emails (default `aanmeldingen@burojazz.com`) |
| `EMAIL_FROM_ADDRESS`        | accp (optional)  | From address for outgoing mail (must be a burojazz.com address) |

R2 media storage is prepared but disabled (it costs money). To enable: uncomment
the `r2_buckets` block in `wrangler.jsonc`, create the bucket, and redeploy —
`payload.config.ts` activates the R2 adapter automatically once the binding exists.

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
3. **Email delivery — Cloudflare Email Routing** (see `src/lib/email.ts`):
   - Enable Email Routing on `burojazz.com`. ⚠ **This sets Cloudflare MX records
     and takes over inbound mail** — only do this if the domain does not already
     host mailboxes elsewhere, or use a subdomain.
   - Verify the destination address (`AANMELDING_NOTIFY_TO`) as an Email Routing
     destination.
   - The `send_email` binding `AANMELDING_EMAIL` is declared in `wrangler.jsonc`
     (dev + accp); keep its `destination_address` in sync with the verified
     address. Outside the Worker (local dev/CLI) mail is logged, not sent.

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
