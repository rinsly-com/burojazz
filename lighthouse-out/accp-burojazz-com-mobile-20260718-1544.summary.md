# Lighthouse — https://accp.burojazz.com (mobile)

- **Run:** 2026-07-18T15:44 (local)
- **Lighthouse:** 13.4.0
- **User agent:** HeadlessChrome/148.0.0.0 (X11; Linux x86_64)
- **Report:** [accp-burojazz-com-mobile-20260718-1544.report.html](./accp-burojazz-com-mobile-20260718-1544.report.html)

## Scores

| Category | Score | Δ vs prev |
|---|---:|---:|
| Performance | 61 [ok] | — |
| Accessibility | 96 [good] | — |
| Best Practices | 100 [good] | — |
| SEO | 69 [ok] | — |

## Core Web Vitals

| Metric | Value | Δ vs prev |
|---|---:|---:|
| LCP | 22.2 s | — |
| CLS | 0 | — |
| TBT | 10 ms | — |
| FCP | 3.6 s | — |
| Speed Index | 7.8 s | — |
| TTI | 23.3 s | — |

## Top opportunities

1. **Avoid multiple page redirects** — save ~1867 ms
2. **Reduce unused JavaScript** — save ~150 ms
3. Initial server response was already short (~180 ms) — no action

## Failing diagnostics (score < 0.9)

1. **Largest Contentful Paint** — 22.2 s
2. **Time to Interactive** — 23.3 s
3. **Speed Index** — 7.8 s
4. **First Contentful Paint** — 3.6 s
5. **Insufficient color contrast** — a11y
6. **Page is blocked from indexing** — expected for accp (noindex); drives SEO to 69
7. **Page prevented back/forward cache restoration** — 2 failure reasons
8. **LCP request discovery / breakdown / network dependency tree**

## Root causes

- **Redirect chain on `/`** wastes ~1.9 s before anything loads (root URL redirects to itself/canonical).
- **Media served through `/api/media/file/...`** (Payload API), not a static/CDN path: logo.svg 1.4 s, photo-5.jpg (392 KB) 2.6 s, directors-1.jpg 1.5 s — each on the throttled connection. The LCP image is one of these.
- **Unoptimized images** — 392 KB JPEG served as-is (output: export means no next/image optimization).

## Previous run

none
