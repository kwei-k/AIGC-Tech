---
name: multistep-video-planner
description: Plans a multistep (T4) video compositing pipeline when a user has a shot whose subject must interact with a generated environment — generate the background plate first, generate the character/subject separately, then merge them, possibly with a mid-pipeline ComfyUI denoise/relight pass in between. Use when the user describes a shot like "character walks through X and touches Y", asks for a step-by-step generation plan, or has already been routed to T4 multistep compositing by the decision framework.
---

# Multistep Video Planner

Turn a shot description into a step-by-step T4 multistep compositing plan: plates, generation order, ComfyUI passes, merge strategy, QA gates.

## Before planning

1. Read `../../docs/en/03-multistep-video-generation.md` for the T4 pipeline mechanics and failure modes.
2. Read `../../docs/en/00-decision-framework.md` for the routing questions (Q1–Q6), escalation discipline, and the freeze-approved-artifacts rule.
3. Confirm T4 is actually warranted by the framework: complex interaction can require it, as can exact camera/geometry without existing footage or a 3D blockout. Q4 = no alone does not rule out T4. If no T4 constraint applies, recommend the cheaper applicable route. If the shot also exceeds the selected model's reliable clip length (Q1), note where T5 chaining must wrap the plan.

## The plan you must produce

Output a **numbered plan with markdown checkboxes** (`- [ ]`) for every actionable item. The plan must contain, in this order:

1. **Shot decomposition** — the list of plates/elements the shot is split into. Each element gets one or two constraints only (that is the complexity budget: one dimension per pass). Typical split: background plate, subject plate, interaction element (contact point, occlusion layer, shadow/reflection pass).
2. **Generation order with rationale** — background first (it defines light, palette, and perspective), subject second (generated against the frozen plate's lighting notes), interaction passes last. State *why* in one sentence per step, tied to which constraint each step carries.
3. **Per-step asset/prompt specs** — for each step: input assets (use placeholder names in angle brackets for user assets, e.g. `<character_reference.png>`, `<style_still.png>`), the prompt skeleton, duration/resolution target, and which routing question (Q1–Q6) the spec answers.
4. **Mid-pipeline ComfyUI passes** — for each pass name the node chain (real nodes only: KSampler, VAE Encode/Decode, ControlNet Apply, Depth Anything, IPAdapter, mask/composite nodes, upscale model nodes) and give parameter starting points, explicitly marked as starting points. Typical passes:
   - **Harmonize denoise (img2img on the merged frame):** the P1 safe envelope is 0.15–0.4, and the default starting point is 0.25. Lower preserves the subject; higher unifies a harder lighting/edge mismatch but increases identity drift. If 0.4 is not enough, fix the mask or upstream subject instead of raising denoise.
   - **Relight/color match:** match subject black point and white point to the plate before denoise; a curves/levels pass is cheaper than sampling and should be tried first.
   - **Structure lock during denoise:** ControlNet Apply with a Depth Anything depth map of the merged frame (ControlNet strength start 0.6–0.8) so the denoise pass cannot move geometry.
   - **Identity anchor:** IPAdapter fed with `<character_reference.png>` during the subject pass and any denoise pass that touches the subject's face (weight start 0.5–0.7).
   - **Upscale + detail:** upscale model node on the approved merged frames only, never on unapproved intermediates.
   Node behavior and model availability are version-sensitive — as of 2026, check current ComfyUI docs before finalizing a graph.
5. **Merge strategy choice with reasoning** — pick one and justify it in 2–3 sentences:
   - **Pixel-space merge** (mask/composite nodes on decoded frames): cheaper, easier to inspect, sufficient when occlusion is simple and lighting is flat. Default choice.
   - **Latent-space merge** (composite in latent between VAE Encode and the sampler): better edge blending and light wrap, but harder to debug and easier to smear the subject. Use only when pixel-space edges demonstrably fail on the QA gate.
   Recommend pixel space first, per escalation discipline.
6. **QA-gate checklist per step** — every step ends with a gate. A step's artifacts must pass its gate before the next step starts, and once approved they are **frozen**: never regenerate an upstream artifact downstream of an approved step (see the framework, section 6). If a gate fails, fix within the step (re-seed, re-prompt, adjust mask) — do not patch it in a later pass.
7. **Fallback/escalation notes** — name, per step, the likely failure and the one-dimension escalation: subject identity drifts → add/raise IPAdapter weight before anything else; merge edges fail in pixel space → move to latent merge; interaction still reads as fake → escalate that element to T3 (clay-render transfer) for the contact geometry; duration beyond clip length → wrap in T5 chaining.

## Optional prompt writing for the current step

Keep the default plan's prompt skeletons unless the user requests full prompts. For
a requested step, load [write-video-prompt](../write-video-prompt/SKILL.md) and pass
its current intent, camera/action requirements, asset roles, and project-specific
lighting or design constraints. Use write for a fresh prompt and keep for a supplied
final prompt. Limit the writing handoff to the selected step; do not send a QA history
or ask the writer to diagnose generated results.

When tool-ready output is requested, use
[the adaptation guide](../../docs/en/08-seedance-and-dreamina.md) and actual supported
settings. A placeholder asset is not an uploaded asset. The offline request helper
does not generate plates or execute this plan. These references require the full
repository layout described in [the usage guide](../../docs/en/09-usage-guide.md).

## Worked example

Shot: "A character walks through a stylized forest and touches a tree." (The framework's routing table maps exactly this to T4.)

- [ ] **1. Decompose the shot** into three elements:
  - [ ] Element A — forest background plate: style + environment (constraints: style, composition).
  - [ ] Element B — character walk cycle: identity + motion (constraints: character identity, walk motion).
  - [ ] Element C — interaction element: hand–tree contact, contact shadow, foreground branch occlusion (constraints: interaction only).
- [ ] **2. Generation order**
  - [ ] 2a. Background plate first — it fixes light direction, palette, and perspective that every later element must match.
  - [ ] 2b. Character walk second — generated to the frozen plate's lighting notes (light from upper left, cool ambient, warm rim), so the subject is lit for the plate it will enter.
  - [ ] 2c. Interaction pass last — contact and occlusion depend on both frozen inputs; generating them earlier would couple a constraint to an artifact that does not exist yet.
- [ ] **3. Per-step specs**
  - [ ] 3a. Plate: text/image-to-video from `<style_still.png>`; prompt skeleton "stylized forest interior, dappled light from upper left, one prominent tree at frame right, static or slow-push camera"; duration = shot length (Q1), resolution = final delivery res (Q3).
  - [ ] 3b. Subject: image-to-video anchored on `<character_reference.png>` + walk-cycle keyframe; prompt describes walk direction matching plate perspective; IPAdapter on `<character_reference.png>`, weight start 0.6 (Q2).
  - [ ] 3c. Interaction: mask around hand–tree contact region; note occlusion layers (foreground branches) as separate masks (Q4).
- [ ] **4. Mid-pipeline ComfyUI passes**
  - [ ] 4a. Levels/curves match of subject to plate black/white points — try before any sampling.
  - [ ] 4b. Harmonize denoise on merged frames: KSampler, denoise default start 0.25 (P1 safe envelope 0.15–0.4), ControlNet Apply + Depth Anything depth of the merged frame at strength start 0.7, IPAdapter on `<character_reference.png>` at 0.6 over the face region.
  - [ ] 4c. Upscale model pass on approved merged frames only.
- [ ] **5. Merge strategy: pixel space.** Occlusion here is simple (branches in front, tree behind the hand); masks on decoded frames are inspectable and cheap. Move to latent merge only if the QA gate shows edge smearing or light-wrap mismatch that curves + a 0.25-denoise P1 pass cannot fix.
- [ ] **6. QA gates (freeze on pass)**
  - [ ] Gate A (plate): style matches `<style_still.png>`; light direction consistent across frames; tree position stable. → freeze as `<plate_approved.mp4>`.
  - [ ] Gate B (subject): face matches `<character_reference.png>` in ≥9 of 10 spot-checked frames; walk reads as walking, no foot sliding at contact speed. → freeze as `<subject_approved.mp4>`.
  - [ ] Gate C (merge): no halo/edge smear at 100% zoom; contact shadow present at hand–tree touch frame; occlusion layers in correct order. → freeze as `<merged_approved.mp4>`.
  - [ ] Gate D (final): upscale artifacts absent; style uniform across plate and subject. Any fail routes back to the failing step, not to a downstream patch.
- [ ] **7. Fallbacks**
  - [ ] Face drifts in denoise → raise IPAdapter weight 0.1 at a time; do not raise denoise.
  - [ ] Edges fail in pixel space → switch to latent-space merge for the contact region only.
  - [ ] Contact still looks fake → escalate the contact moment to T3: block out hand + tree in 3D, clay-render, transfer style.
  - [ ] Shot must run longer than the model's clip length → wrap segments in T5 chaining with the touch frame as a continuity anchor.
