---
type: "query"
date: "2026-07-11T13:15:35.661339+00:00"
question: "How does a publish event in the editorial workflow propagate to a rebuilt static production site?"
contributor: "graphify"
source_nodes: ["enforceWorkflow", "triggerStaticDeployAfterChange", "triggerDeploy", "Publish-triggered Cloudflare Deploy Hook flow", "Static site build script", "getPublishedPages", "HomePage (frontend)", "isReviewer"]
---

# Q: How does a publish event in the editorial workflow propagate to a rebuilt static production site?

## Answer

Reviewer clicks Publish (WorkflowAction/ReviewPanel) -> _status set to published on a pages doc. enforceWorkflow beforeChange hook gates it: requires isReviewer AND workflowStatus==ready, then resets workflowStatus to draft. triggerStaticDeployAfterChange (afterChange hook, Pages.ts) checks _status==published and calls triggerDeploy, which POSTs CLOUDFLARE_DEPLOY_HOOK_URL. That fires a Cloudflare Workers Build running pnpm run deploy:static -> scripts/build-static.mjs, which stashes the (payload) admin/API + my-route groups, runs next build with BUILD_STATIC=true (next.config output:export), HomePage calls getPublishedPages() fetching published docs from accp API over HTTP (lib/pages.ts, DB-free), bakes static HTML into out/, always restores stashed routes in finally, deploys to Cloudflare Static Assets = production. Two safety layers on published: enforceWorkflow controls who sets it; Pages read access returns only published to unauth readers.

## Source Nodes

- enforceWorkflow
- triggerStaticDeployAfterChange
- triggerDeploy
- Publish-triggered Cloudflare Deploy Hook flow
- Static site build script
- getPublishedPages
- HomePage (frontend)
- isReviewer