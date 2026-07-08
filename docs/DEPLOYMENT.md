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

## Content workflow (draft → in review → published)

The `pages` collection has drafts/versions enabled plus a `reviewState` field:

1. **Draft** — `reviewState = draft`, status `draft`. Work in progress.
2. **In review / staging** — `reviewState = in_review`, status still `draft`.
3. **Published (pushed)** — set **Status → Published**. This flips `_status` to
   `published` and fires the deploy hook, rebuilding production.

The public frontend and the static build only ever read **published** documents
(enforced by the collection's `read` access control).

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
