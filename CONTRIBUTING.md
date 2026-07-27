# Contributing

Contributions are welcome — this playbook gets better every time someone documents a
pipeline that actually shipped.

## What to contribute

- **New techniques**: follow the structure of existing docs in `docs/en/` — when to use
  it, when *not* to use it, the pipeline steps, failure modes, and parameter starting
  points. PRs that only add hype will be rejected; PRs that add failure modes are gold.
- **Decision-framework updates**: `docs/en/00-decision-framework.md` is the heart of
  this repo. If a new model or tool changes the routing logic, propose the change with
  a concrete before/after example.
- **Skills**: agent-loadable skills live in `skills/<name>/SKILL.md` and must follow the
  Agent Skills format (YAML frontmatter with `name` and `description`, then instructions).
- **Workflows**: ComfyUI workflow JSONs go in `workflows/` and must be loadable with the
  nodes listed in the accompanying markdown note.

## Rules

1. English is the source of truth. If you edit `docs/en/XX-*.md`, mirror the change in
   `docs/zh/XX-*.md` (or flag it in the PR so a maintainer can).
2. No generated media in the repo. Link to external hosting for video examples.
3. Every claim about a tool's behavior should be verifiable — cite a version or a date
   when behavior is version-sensitive.
4. Keep it practical: this is a playbook for people shipping shots, not a survey paper.

## Style

- Short sentences. Concrete numbers over adjectives.
- Every technique doc must answer: "How do I know this is the wrong tool for my shot?"
