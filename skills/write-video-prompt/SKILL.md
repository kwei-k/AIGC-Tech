---
name: write-video-prompt
description: Write one concise, executable image-to-video or text-to-video advertising prompt from the user's current director intent, storyboard, reference images, character or wardrobe bindings, and shot requirements. Use when the user asks for a video-generation prompt, a motion-first prompt, or a reusable prompt-writing template. This Skill is for initial prompt writing only; do not use it to review generated results, diagnose failures, compare versions, or run an iterative prompt-refinement workflow.
---

# Write Video Prompt

Write the prompt from the user's current brief. Treat this Skill as a writing template,
not as a revision system.

Read `references/motion-first-template.md` before writing. Follow its reference-role
rules, clause order, language policy, output format, and validation checklist.

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
5. **Return only the deliverable.** Keep the positive prompt compact and move remaining
   failure restrictions into one `Negative:` line.

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

## Default output

Return exactly:

1. One copy-ready positive prompt paragraph.
2. One compact line beginning with `Negative:`.

Do not expose the internal interpretation, reference ledger, reasoning, headings,
alternatives, or parameter tables unless the user explicitly asks for them.
