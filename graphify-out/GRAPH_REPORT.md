# Graph Report - burojazz  (2026-07-12)

## Corpus Check
- 107 files · ~372,125 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 568 nodes · 921 edges · 50 communities (44 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90078998`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Vitest Setup|Vitest Setup]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_Playwright Config|Playwright Config]]
- [[_COMMUNITY_OpenNext Config|OpenNext Config]]
- [[_COMMUNITY_My-Route Handler|My-Route Handler]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `Page` - 19 edges
2. `hrefFor()` - 13 edges
3. `sectionHeader()` - 12 edges
4. `Section()` - 12 edges
5. `Payload config (buildConfig)` - 12 edges
6. `isReviewer()` - 11 edges
7. `Eyebrow()` - 10 edges
8. `Icon()` - 10 edges
9. `User` - 8 edges
10. `ArrowIcon()` - 8 edges

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

## Communities (50 total, 6 thin omitted)

### Community 0 - "Access Control & Collections"
Cohesion: 0.05
Nodes (42): adminFieldOnly(), adminOnly(), authenticated(), hasRole(), isAdmin(), isAuthenticated(), isReviewer(), reviewerOnly() (+34 more)

### Community 1 - "Payload Config & Test Suites"
Cohesion: 0.04
Nodes (45): AboutBlock, AboutBlockSelect, AccordionBlock, AccordionBlockSelect, Auth, ButtonRowBlock, ButtonRowBlockSelect, CollectionsWidget (+37 more)

### Community 2 - "Admin UI Components"
Cohesion: 0.13
Nodes (22): aboutBlock, accordionBlock, buttonRowBlock, complaintsBlock, contactPersonsBlock, coreValuesBlock, heroBlock, richTextBlock (+14 more)

### Community 3 - "Generated Payload Types"
Cohesion: 0.08
Nodes (17): importMap, Comment, CommentsPanel(), Ref, IconModule, IconSelector(), SUGGESTED, MediaCropper() (+9 more)

### Community 4 - "API Routes & Cloudflare Runtime"
Cohesion: 0.14
Nodes (19): About(), Props, Accordion(), Props, ALIGN, ButtonRow(), Props, Props (+11 more)

### Community 5 - "Editorial Workflow & Roles"
Cohesion: 0.12
Nodes (26): Admin Panel e2e test suite, API integration test suite, Comments collection, Frontend e2e test suite, RootLayout (frontend), login helper, Media collection, OpenNext Cloudflare config (+18 more)

### Community 6 - "E2E Auth & Fixtures"
Cohesion: 0.15
Nodes (20): critical, dirname, Finding, findings, result, schema, applyStatement(), diffSchemas() (+12 more)

### Community 7 - "Payload REST Catch-all Route"
Cohesion: 0.1
Nodes (20): 1. Authenticate wrangler (interactive — run yourself), 2. Create the accp D1 database, 3. Create migrations, 4. Cloudflare Workers Build — accp (code deploy), 5. Create the production Deploy Hook + static build, 6. Wire the deploy hook into accp, code:block1 (push to main ───► Workers Build ───► deploy accp (Payload + ), code:bash (pnpm wrangler login) (+12 more)

### Community 8 - "Static Deploy Architecture"
Cohesion: 0.17
Nodes (15): CardData, DEFAULT_CARDS, DEFAULT_TABS, Props, ServiceCard(), CardData, ServiceCard(), ServicesTabs() (+7 more)

### Community 9 - "Static Build Script"
Cohesion: 0.23
Nodes (11): HomePage(), PageView(), RenderBlocks(), readSnapshot(), fetchPages(), getPublishedPages(), getRenderablePageBySlug(), getRenderablePages() (+3 more)

### Community 10 - "Published Pages Rendering"
Cohesion: 0.18
Nodes (12): ContactPersons(), DEFAULT_PEOPLE, OBJECT_POSITION, PersonCard(), PHOTOS, Props, Media, Media() (+4 more)

### Community 11 - "Database Migrations"
Cohesion: 0.16
Nodes (11): CONTACT_PEOPLE, CORE_VALUE_ICONS, footerData, headerData(), Layout, PayloadInstance, run(), seedDir (+3 more)

### Community 12 - "Next.js Config"
Cohesion: 0.13
Nodes (12): adapterRequire, assertAfter, dangling, db, dirname, { drizzle }, migrationsDir, notNull (+4 more)

### Community 13 - "Static Export Mode"
Cohesion: 0.16
Nodes (11): CoreValues(), FALLBACK_VALUES, ICONS, IconSpec, isHighlight(), normalize(), Props, SLOTS (+3 more)

### Community 14 - "Frontend Root Layout"
Cohesion: 0.18
Nodes (10): Complaints(), ContactCard(), FALLBACK_STEPS, PillData, Props, uploadUrl(), ComplaintsStepper(), Props (+2 more)

### Community 15 - "ESLint Config"
Cohesion: 0.19
Nodes (13): CommentsPanel, Role model (author/reviewer/admin), Editorial state machine (Draft/Review/Ready/Published), enforceWorkflow, ReviewPanel, adminFieldOnly access helper, adminOnly access helper, hasRole (+5 more)

### Community 16 - "Frontend E2E Test"
Cohesion: 0.26
Nodes (10): metadata, monaSans, montserrat, RootLayout(), SiteFooter(), fetchGlobal(), getFooter(), getHeader() (+2 more)

### Community 17 - "Authenticated Access"
Cohesion: 0.2
Nodes (9): CARD_IMAGES, FALLBACK_CARDS, Props, Vacancies(), Icon(), IconProps, icons, resolve() (+1 more)

### Community 18 - "Vitest Setup"
Cohesion: 0.25
Nodes (8): dashboardArtifact, editViewArtifact, listViewArtifact, login(), LoginOptions, cleanupTestUser(), seedTestUser(), testUser

### Community 19 - "Next Env Types"
Cohesion: 0.18
Nodes (10): Clone, Collections, Development, Docker, Docker (Optional), How it works, Payload Blank Template, Questions (+2 more)

### Community 20 - "Playwright Config"
Cohesion: 0.25
Nodes (6): backupDir, EXCLUDED, fetchJson(), root, snapshotContent(), snapshotDir

### Community 21 - "OpenNext Config"
Cohesion: 0.36
Nodes (6): Hero(), Props, uploadUrl(), ArrowIcon(), Button(), ButtonProps

### Community 22 - "My-Route Handler"
Cohesion: 0.22
Nodes (7): code:sql (INSERT INTO `__new_header_nav_items`("_order", "_parent_id",), Expected, Local mitigation (this repo), Reproduction, Summary, Upstream bug report draft: `migrate:create` generates a data-corrupting copy statement (SQLite/D1), Why this is severe

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (5): FALLBACK_INFO, FALLBACK_MENU, LinkItem, Props, SOCIALS

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (6): DEFAULT_ITEM_ICONS, DEFAULT_ITEMS, Props, VisionMission(), AccordionItem, VisionMissionAccordion()

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (7): Publish-triggered Cloudflare Deploy Hook flow, Headless CMS to static site architecture, Three-environment topology (dev/accp/production), docker-compose MongoDB dev service, triggerDeploy, triggerStaticDeployAfterChange, triggerStaticDeployAfterDelete

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): dirname, __filename, nextConfig

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (3): Claude Code, Database migrations (D1/SQLite), graphify

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (3): Answer, Q: How does a publish event in the editorial workflow propagate to a rebuilt static production site?, Source Nodes

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (4): Stash-and-restore server routes for static export, Static site build script, BUILD_STATIC export mode, Next.js config

## Ambiguous Edges - Review These
- `Three-environment topology (dev/accp/production)` → `docker-compose MongoDB dev service`  [AMBIGUOUS]
  docs/DEPLOYMENT.md · relation: references

## Knowledge Gaps
- **211 isolated node(s):** `config`, `__filename`, `dirname`, `nextConfig`, `eslintConfig` (+206 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Three-environment topology (dev/accp/production)` and `docker-compose MongoDB dev service`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Page` connect `API Routes & Cloudflare Runtime` to `Access Control & Collections`, `Payload Config & Test Suites`, `Static Deploy Architecture`, `Static Build Script`, `Published Pages Rendering`, `Database Migrations`, `Static Export Mode`, `Frontend Root Layout`, `Authenticated Access`, `OpenNext Config`, `Community 25`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `User` connect `Access Control & Collections` to `Payload Config & Test Suites`, `Database Migrations`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `config`, `__filename`, `dirname` to the rest of the system?**
  _211 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Access Control & Collections` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Payload Config & Test Suites` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Admin UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._