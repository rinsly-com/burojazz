# Instagram "latest post" integration

The social block on the homepage can show the most recent **@buro.jazz** post on
the phone screen. It's opt-in per block (the **"Toon meest recente Instagram-post"**
checkbox) and degrades gracefully: with no token configured, or on any API
error, the block shows the static phone mockup exactly as before.

## How it works

- **`src/lib/instagram.ts`** — talks to the Instagram Graph API, caches the
  latest post in KV (`INSTAGRAM_KV`) for ~30 min, and lazily refreshes the
  long-lived token as it ages (no cron needed — refresh piggybacks on traffic).
- **`GET /api/instagram/latest`** (accp worker) — returns `{ post | null }`.
- **`InstagramPhone.tsx`** — the static site fetches that endpoint client-side
  (cross-origin to accp; CORS already allows `burojazz.com`) and overlays the
  post image on the phone screen, linking to the post permalink.

Because it's a live client-side fetch, new posts appear within the cache window
(~30 min) **without a redeploy**.

## One-time setup

### 1. Instagram account
Instagram Basic Display was shut off on 2024-12-04, so a personal account no
longer works. **@buro.jazz must be a Business or Creator account** (free,
reversible): Instagram app → Settings → *Account type and tools* → *Switch to
professional account*.

### 2. Meta app + token
1. Go to https://developers.facebook.com/ → create an app (type: **Business**).
2. Add the **Instagram** product → use *Instagram API with Instagram Login*.
3. Add @buro.jazz as an Instagram tester and accept the invite in the IG app.
4. Generate a **long-lived access token** (valid 60 days) for the account with
   at least the `instagram_business_basic` scope (read media).

> The token is what this integration stores and auto-refreshes. As long as the
> live site gets traffic at least once every ~60 days (it will), the token stays
> valid indefinitely. If it ever fully lapses, just re-seed a fresh one (below).

### 3. Provision Cloudflare (accp worker)
```bash
# a. create the KV namespace, then paste the returned id into wrangler.jsonc
#    (replace REPLACE_WITH_KV_NAMESPACE_ID)
wrangler kv namespace create INSTAGRAM_KV

# b. seed the long-lived token (KV takes precedence over the env secret)
wrangler kv key put --binding=INSTAGRAM_KV "ig:token" "<LONG_LIVED_TOKEN>" --remote
```

Alternatively, instead of step (b) you can set a Worker secret
`INSTAGRAM_ACCESS_TOKEN` (`wrangler secret put INSTAGRAM_ACCESS_TOKEN`); it's used
to seed the first fetch, but the refreshable copy lives in KV.

### 4. Enable it in the CMS
Edit the homepage → Social block → tick **"Toon meest recente Instagram-post"** →
save & publish.

## Verifying
```bash
curl https://accp.burojazz.com/api/instagram/latest
# { "post": { "permalink": "...", "imageUrl": "...", ... } }   ← configured
# { "post": null }                                              ← not configured / fallback
```

## Tuning the overlay
The post image is positioned on the phone screen by the `SCREEN` constant in
`InstagramPhone.tsx` (fractions of `public/images/social/phone-hand.png`,
1280×1024). If the phone artwork is replaced, re-measure and update it.
