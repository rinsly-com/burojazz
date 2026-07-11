# Graph Report - .  (2026-07-11)

## Corpus Check
- Corpus is ~10,252 words - fits in a single context window. You may not need a graph.

## Summary
- 199 nodes · 257 edges · 23 communities (17 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Access Control & Collections|Access Control & Collections]]
- [[_COMMUNITY_Payload Config & Test Suites|Payload Config & Test Suites]]
- [[_COMMUNITY_Admin UI Components|Admin UI Components]]
- [[_COMMUNITY_Generated Payload Types|Generated Payload Types]]
- [[_COMMUNITY_API Routes & Cloudflare Runtime|API Routes & Cloudflare Runtime]]
- [[_COMMUNITY_Editorial Workflow & Roles|Editorial Workflow & Roles]]
- [[_COMMUNITY_E2E Auth & Fixtures|E2E Auth & Fixtures]]
- [[_COMMUNITY_Payload REST Catch-all Route|Payload REST Catch-all Route]]
- [[_COMMUNITY_Static Deploy Architecture|Static Deploy Architecture]]
- [[_COMMUNITY_Static Build Script|Static Build Script]]
- [[_COMMUNITY_Published Pages Rendering|Published Pages Rendering]]
- [[_COMMUNITY_Database Migrations|Database Migrations]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Static Export Mode|Static Export Mode]]
- [[_COMMUNITY_Frontend Root Layout|Frontend Root Layout]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Frontend E2E Test|Frontend E2E Test]]
- [[_COMMUNITY_Authenticated Access|Authenticated Access]]
- [[_COMMUNITY_My-Route Handler|My-Route Handler]]

## God Nodes (most connected - your core abstractions)
1. `Payload config (buildConfig)` - 12 edges
2. `isReviewer()` - 11 edges
3. `Pages collection` - 7 edges
4. `User` - 6 edges
5. `Users collection` - 6 edges
6. `Admin Panel e2e test suite` - 5 edges
7. `Comments collection` - 5 edges
8. `isReviewer` - 5 edges
9. `importMap` - 4 edges
10. `isAdmin()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Role model (author/reviewer/admin)` --references--> `hasRole`  [INFERRED]
  docs/DEPLOYMENT.md → src/access/roles.ts
- `CommentsPanel` --references--> `Role model (author/reviewer/admin)`  [INFERRED]
  src/components/CommentsPanel.tsx → docs/DEPLOYMENT.md
- `API integration test suite` --shares_data_with--> `Users collection`  [INFERRED]
  tests/int/api.int.spec.ts → src/collections/Users.ts
- `Playwright config` --references--> `Admin Panel e2e test suite`  [INFERRED]
  playwright.config.ts → tests/e2e/admin.e2e.spec.ts
- `OpenNext Cloudflare config` --conceptually_related_to--> `Payload config (buildConfig)`  [INFERRED]
  open-next.config.ts → src/payload.config.ts

## Hyperedges (group relationships)
- **Static production site export pipeline** — build_static_static_build, next_config_build_static_mode, pages_getpublishedpages, page_homepage [INFERRED 0.80]
- **Per-document publishing workflow** — pages_pages, pages_workflow_pipeline, users_users, workflow_int_spec_publishing_workflow [INFERRED 0.80]
- **Admin e2e authenticated test flow** — admin_e2e_spec_admin_panel, login_login, seeduser_seedtestuser, seeduser_testuser [EXTRACTED 1.00]
- **Editorial workflow: server enforcement plus admin UI** — enforceworkflow_enforceworkflow, workflowaction_workflowaction, reviewpanel_reviewpanel, workflowstatuscell_workflowstatuscell [INFERRED 0.85]
- **Role-based access shared across hooks and UI** — roles_isreviewer, enforceworkflow_enforceworkflow, workflowaction_workflowaction, reviewpanel_reviewpanel [INFERRED 0.85]
- **Publish event triggers static production rebuild** — enforceworkflow_enforceworkflow, triggerstaticdeploy_triggerstaticdeployafterchange, deployment_deploy_hook_flow [INFERRED 0.80]

## Communities (23 total, 6 thin omitted)

### Community 0 - "Access Control & Collections"
Cohesion: 0.13
Nodes (22): adminFieldOnly(), adminOnly(), authenticated(), hasRole(), isAdmin(), isAuthenticated(), isReviewer(), reviewerOnly() (+14 more)

### Community 1 - "Payload Config & Test Suites"
Cohesion: 0.12
Nodes (26): Admin Panel e2e test suite, API integration test suite, Comments collection, Frontend e2e test suite, RootLayout (frontend), login helper, Media collection, OpenNext Cloudflare config (+18 more)

### Community 2 - "Admin UI Components"
Cohesion: 0.11
Nodes (10): importMap, Comment, CommentsPanel(), Ref, PillStyle, STAGES, WorkflowStatusCell(), Args (+2 more)

### Community 3 - "Generated Payload Types"
Cohesion: 0.09
Nodes (21): Auth, CollectionsWidget, Comment, CommentsSelect, Config, GeneratedTypes, Media, MediaSelect (+13 more)

### Community 4 - "API Routes & Cloudflare Runtime"
Cohesion: 0.1
Nodes (10): Media, GET, OPTIONS, POST, cloudflareLogger, dirname, env, filename (+2 more)

### Community 5 - "Editorial Workflow & Roles"
Cohesion: 0.19
Nodes (13): CommentsPanel, Role model (author/reviewer/admin), Editorial state machine (Draft/Review/Ready/Published), enforceWorkflow, ReviewPanel, adminFieldOnly access helper, adminOnly access helper, hasRole (+5 more)

### Community 6 - "E2E Auth & Fixtures"
Cohesion: 0.25
Nodes (8): dashboardArtifact, editViewArtifact, listViewArtifact, login(), LoginOptions, cleanupTestUser(), seedTestUser(), testUser

### Community 7 - "Payload REST Catch-all Route"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 8 - "Static Deploy Architecture"
Cohesion: 0.29
Nodes (7): Publish-triggered Cloudflare Deploy Hook flow, Headless CMS to static site architecture, Three-environment topology (dev/accp/production), docker-compose MongoDB dev service, triggerDeploy, triggerStaticDeployAfterChange, triggerStaticDeployAfterDelete

### Community 9 - "Static Build Script"
Cohesion: 0.33
Nodes (3): backupDir, EXCLUDED, root

### Community 10 - "Published Pages Rendering"
Cohesion: 0.47
Nodes (3): HomePage(), getPublishedPages(), PageDoc

### Community 12 - "Next.js Config"
Cohesion: 0.5
Nodes (3): dirname, __filename, nextConfig

### Community 13 - "Static Export Mode"
Cohesion: 0.67
Nodes (4): Stash-and-restore server routes for static export, Static site build script, BUILD_STATIC export mode, Next.js config

## Ambiguous Edges - Review These
- `Three-environment topology (dev/accp/production)` → `docker-compose MongoDB dev service`  [AMBIGUOUS]
  docs/DEPLOYMENT.md · relation: references

## Knowledge Gaps
- **77 isolated node(s):** `__filename`, `dirname`, `nextConfig`, `eslintConfig`, `heading` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three-environment topology (dev/accp/production)` and `docker-compose MongoDB dev service`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Are the 3 inferred relationships involving `Pages collection` (e.g. with `Publishing workflow integration test suite` and `getPublishedPages`) actually correct?**
  _`Pages collection` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Users collection` (e.g. with `API integration test suite` and `Publishing workflow integration test suite`) actually correct?**
  _`Users collection` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `__filename`, `dirname`, `nextConfig` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Access Control & Collections` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Payload Config & Test Suites` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Admin UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._