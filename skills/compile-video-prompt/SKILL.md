---
name: compile-video-prompt
description: Compile director intent, storyboards, reference images, character bindings, and model feedback into concise, executable image-to-video or text-to-video prompts. Use when a user asks for an advertising-film video prompt, supplies shot intent or reference images, wants camera and subject motion made precise, asks to revise a failed generation prompt, or needs reference roles such as first frame, composition, identity, wardrobe, lighting, or packaging assigned without ambiguity.
---

# Compile Video Prompt

Treat prompt writing as compilation, not copywriting. Convert the user's creative
intent and production evidence into a compact control sequence that a video model can
execute.

Read `references/motion-first-contract.md` before compiling a prompt. It is the
normative specification for intent parsing, reference roles, clause order, language
rendering, and validation.

## Workflow

1. **Resolve intent.** Identify what the shot must communicate, which facts are hard
   constraints, and which details may be inferred. Translate abstract qualities into
   visible direction. For example, "elegant" must become posture, pace, gaze, balance,
   camera behavior, fabric response, and lighting—not a stack of synonyms.
2. **Bind every reference.** Assign each supplied image one or more explicit roles from
   the contract. Never infer that a composition reference is the first frame or final
   frame. Ask one compact question if an unassigned reference could materially change
   generation behavior.
3. **Build motion in priority order.** Specify camera movement first, subject motion
   second, scene motion third, and look last. Use only compatible camera operations;
   do not turn the camera clause into a vocabulary dump.
4. **Render for the target.** Adapt syntax and detail density to the named model when
   known. Treat language as a rendering choice: preserve the semantic plan regardless
   of whether the output is English, Chinese, mixed production language, or another
   language.
5. **Validate and compress.** Remove decorative repetition, resolve contradictory
   motion, check continuity and reference roles, convert avoidable prohibitions into
   positive direction, and move the remaining failure constraints to `Negative:`.

## Interaction policy

- Use information already present in the brief before asking questions.
- Ask only when a missing hard constraint or reference role changes the physical shot.
- If the brief is sparse but executable, make conservative cinematic assumptions and
  compile immediately.
- Treat model feedback as evidence: revise the clause responsible for the observed
  failure instead of rewriting unrelated parts.
- Do not expose the internal semantic representation or hidden drafting analysis by
  default. Return it only when the user explicitly requests a breakdown.

## Default output

Return exactly:

1. One copy-ready prompt paragraph.
2. One compact line beginning with `Negative:`.

Do not add a preface, explanation, section headings, parameter table, or alternative
versions unless the user requests them. Keep reference bindings inside the prompt when
references are present.
