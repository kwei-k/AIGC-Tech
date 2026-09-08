---
name: write-video-prompt
description: Write one motion-first video prompt from a current director brief, or preserve a supplied final prompt for a requested Seedance or Dreamina handoff. Use for initial prompt writing only, reference-role binding, or preparing an existing prompt for a video tool. Do not use for generated-result diagnosis, scoring, or prompt-iteration workflows.
---

# Write Video Prompt

Write the prompt from the user's current brief. Treat this Skill as a writing template,
not as a revision system.

## Choose the requested behavior

- **Write:** the user asks for a prompt or provides a creative brief without a final
  prompt. Read [the writing template](references/motion-first-template.md) and write
  once from the current brief.
- **Keep:** the user supplies a final prompt for use, or says to preserve it. Return
  or pass that text unchanged, including punctuation and line breaks. Do not append
  a Negative line, translate it, or reorder its clauses. Ask for the actual prompt
  if keep mode was requested without one.

These are Skill behaviors, not API parameters or Dreamina CLI flags. A request for
technical routing alone does not opt into writing.

For Seedance or Dreamina writing, also read
[scenario guidance](references/seedance-writing.md). For a requested API/CLI handoff,
read [tool handoff](references/tool-handoff.md). Plain prompt writing needs neither
an installed CLI nor credentials. Do not load tool details for an unrelated model.

## Writing process

1. **Understand the current intent.** Identify what the shot should communicate and
   translate abstract qualities into visible camera, body, environment, and lighting
   direction.
2. **Assign reference roles.** Give every supplied reference an explicit identity.
   Never assume that a composition reference is a first frame, middle frame, or final
   frame.
3. **Fill the template in order.** Write camera movement first, subject motion second,
   scene motion third, and look last. Include only details that visibly affect the
   shot.
4. **Render once.** Use the language requested by the user. If none is requested,
   mirror the user's working language while retaining standard English production
   terms where they reduce ambiguity. Full English is valid.
5. **Return the requested deliverable.** For plain text, keep the positive prompt
   compact and move remaining failure restrictions into one `Negative:` line. For
   an API/CLI handoff, follow the target-aware output rules below.

Ask one concise question only when an unassigned reference role or missing physical
shot fact would make the prompt materially ambiguous. Otherwise make conservative
cinematic assumptions and write the prompt immediately.

## Scope

- Write a fresh prompt from the current brief.
- Do not inspect or score generated videos.
- Do not diagnose model failures.
- Do not compare prompt versions or output a change log.
- Do not preserve clauses as revision state.
- Do not recommend an iterative optimization loop.
- If the user changes the brief, write a new prompt from the updated brief without
  carrying hidden revision history.
- Apply project-specific palette, character, wardrobe, UI, and packaging constraints
  only to the current brief. Do not turn one project's art direction into defaults
  for every shot.
- Preparing a prompt or request does not run a generation task. This Skill does not
  upload assets, spend credits, or submit requests.

## Default output

In write mode with no tool handoff requested, return exactly:

1. One copy-ready positive prompt paragraph.
2. One compact line beginning with `Negative:`.

Do not expose the internal interpretation, reference ledger, reasoning, headings,
alternatives, or parameter tables unless the user explicitly asks for them.

In keep mode, return the original prompt only. For an explicitly requested tool
handoff, provide the final prompt, ordered asset bindings, and request settings;
use the repository's offline helper when available. Keep unsupported constraints
visible in a short note. Never invent a server-side `negative_prompt` field or a
`middle_frame` control. Do not pretend the standalone Skill includes the repository
helper: if the helper is absent, return a textual handoff using the bundled reference.
