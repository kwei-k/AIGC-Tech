# Contributing

Contributions are welcome — this playbook gets better every time someone documents a
pipeline that actually shipped.

## What to contribute

- **New techniques**: follow the structure of existing docs in `docs/en/` — when to use
  it, when *not* to use it, the pipeline steps, failure modes, and parameter starting
  points. PRs that only add hype will be rejected; PRs that add failure modes are gold.
- **Decision-framework updates**: `docs/en/00-decision-framework.md` is the heart of
  this repo. If a new model or tool changes the routing logic, propose the change with
  a concrete before/after example and add or update a case in
  `tests/routing.test.mjs`.
- **Skills**: agent-loadable skills live in `skills/<name>/SKILL.md` and must follow the
  Agent Skills format (YAML frontmatter with `name` and `description`, then instructions).
- **Workflows**: ComfyUI workflow JSONs go in `workflows/` and must be loadable with the
  nodes listed in the accompanying markdown note.
- **Tool adaptation**: document asset-role mappings, supported parameters, and the
  exact API source or CLI help version checked. Keep API behavior separate from a
  CLI's aliases and defaults. Include an offline request example when supported by
  `scripts/prepare-video-request.mjs`.
- **Usage cases**: connect a brief, explicit reference roles, a final prompt,
  model/tool version, parameters, and an externally hosted video result. Include
  the verification date and visible limitations. Label an unrun example as
  illustrative; only mark a case as tested when its result can be inspected.

## Rules

1. English is the source of truth. If you edit `docs/en/XX-*.md`, mirror the change in
   `docs/zh/XX-*.md` (or flag it in the PR so a maintainer can).
2. No generated media in the repo. Link to external hosting for video examples.
3. Every claim about a tool's behavior should be verifiable — cite a version or a date
   when behavior is version-sensitive.
4. Keep it practical: this is a playbook for people shipping shots, not a survey paper.
5. Prompt writing remains optional and single-pass. Preserve a user's final prompt
   when requested. Tool adaptation must not introduce generated-result scoring,
   prompt-version state, or an automatic refinement loop.
6. Request preparation stays offline. Do not add credentials, automatic uploads, or
   paid generation to the helper or its tests. Example asset sources are placeholders;
   never present them as tested media.

## Validate a change

Run the zero-dependency suite before opening a PR:

```bash
npm test
```

It checks the executable routing cases, offline request mappings, local Markdown links,
English/Chinese filename parity, Skill metadata, and claims about workflow/assets that
are actually present. Preparation tests do not establish generation quality or account
access to a model.
When editing a Skill, also validate its folder with the Agent Skills validator available
in your agent environment.

## Style

- Short sentences. Concrete numbers over adjectives.
- Every technique doc must answer: "How do I know this is the wrong tool for my shot?"
