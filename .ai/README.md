# `.ai/` — standing instructions for AI agents

Rules that apply to any agent working in this repo, regardless of the task it
was asked to do. Read the relevant file before starting; these override default
habits.

| File | Applies when |
| --- | --- |
| [TESTING.md](./TESTING.md) | **Always.** Every bug you encounter or fix gets a unit test in the same commit. Includes the mutation check that proves the test actually catches it. |

Project-wide context (architecture, Payload conventions, D1 migration rules)
lives in [`../CLAUDE.md`](../CLAUDE.md) and `.claude/skills/payload/`.

## Adding a rule here

Add a file when a mistake is worth preventing repo-wide rather than fixing once.
Keep each file short, imperative, and grounded in something that actually
happened — a rule with a real incident attached gets followed; an abstract
principle does not. Then link it in the table above.
