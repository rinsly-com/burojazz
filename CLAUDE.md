# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Database migrations (D1/SQLite)

After `payload migrate:create`, ALWAYS run `pnpm lint:migrations` and review any
`INSERT ... SELECT` in the generated file against the **old** schema (the previous
migration's `.json` snapshot). drizzle-kit has generated table-recreate copies that
SELECT the *new* table's columns from the *old* table; SQLite then silently treats
each unknown double-quoted identifier as a string literal and corrupts every row
instead of failing (https://sqlite.org/quirks.html#dblquote). The linter (also run
by `deploy:database`) catches this statically; `tests/int/migration-replay.int.spec.ts`
replays all migrations on a scratch D1 with seeded data — add a seeder + assertions
there whenever a new migration transforms data.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
