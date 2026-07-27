# 06 — Pipeline Recipes: Four Worked End-to-End Examples

> **What this is:** four complete pipelines, from target shot to delivered clip, that
> compose the T0–T5 techniques from [doc 00](00-decision-framework.md). Each recipe
> shows the routing decision, the step sequence, where the ComfyUI passes land, the QA
> gate after every step, and the total cost against a naive single pass.

[中文版本](../zh/06-pipeline-recipes.md)

---

## When to use this doc

Use it after you have read [00 — The Decision Framework](00-decision-framework.md) and
answered Q1–Q6 for your shot. Find the recipe whose *routing trace* matches your
answers — not the one whose target shot sounds coolest — and copy it. Replace the
`<placeholder>` asset names with your own files.

## When NOT to use this doc

Do not copy a recipe because it is comprehensive. Every recipe here is the *escalated*
answer to its shot. If your Q1–Q6 answers allow T0 or T1 alone, the cheapest correct
pipeline is three to five seeds in an external tool — see the escalation discipline in
doc 00, section 6. A recipe is a ceiling, not a starting point.

## Reading conventions

- All parameter values are **starting points**, not truths. Tune per model.
- "Freeze" means the doc 00 rule: once a QA gate passes, that artifact becomes a fixed
  input. Never regenerate it downstream.
- Clip lengths, end-frame support, and ControlNet behavior are version-sensitive —
  as of 2026, check current docs for the model you actually run.

---

## R1 — A character walks through a stylized forest and touches a tree

**Route: T3 (environment) + T4 (merge).**

### Target shot

8 seconds. A named character from `<character-sheet.png>` walks three meters through a
stylized forest and places a hand on a specific tree. Camera: slow lateral dolly,
locked path. Style: painterly, consistent across the whole clip.

### Routing trace

| Question | Answer | Pushed |
|---|---|---|
| Q1 | 8s — inside one clip | stays out of T5 |
| Q2 | Yes — face/outfit must match the sheet | kills T0; demands an identity anchor |
| Q3 | Yes — exact dolly path and contact point | routes the environment to T3 (doc 00, section 4: camera paths are a 3D problem) |
| Q4 | Yes — hand contacts tree, feet contact ground | routes the merge to T4; naive paste will look fake |
| Q5 | Stylized, from scratch | text/image-to-video, not video-to-video |
| Q6 | Hero shot, days of budget | 8–12× single-pass is acceptable |

T0 was given its fair trial first (5 seeds): the face drifted by second 3 and the hand
missed the tree in every seed. Named constraints: identity + contact. That is the
T3+T4 route, per doc 00's scenario table.

### Pipeline

1. **Blockout.** Build the forest in Blender: `<forest-blockout.blend>`. Place the
   contact tree, lay the dolly track, keyframe the walk as a simple animated proxy.
   Render an untextured clay pass → `<forest-clay.mp4>`.
   *QA gate: camera path smooth; the proxy's hand reaches the tree trunk at the
   planned frame (frame 150 of 192 here). No style yet — geometry only.*
2. **T3 restyle of the environment (ComfyUI).** Load `<forest-clay.mp4>` →
   VAE Encode → ControlNet Apply with a Depth Anything preprocessor on the clay frames
   (control weight 0.9–1.0 as a starting point) → KSampler, denoise 0.55–0.70, style
   prompt from `<style-ref.png>` → VAE Decode → `<forest-plate.mp4>`.
   *QA gate: tree positions and camera move identical to the clay pass (diff against
   depth, not vibes); no trunk wobble across frames. **Freeze the plate.***
3. **Character pass.** Generate the walk separately: image-to-video anchored on
   `<character-sheet.png>` (T1), neutral or green background, matched camera angle and
   walk speed. If identity slips, add an IPAdapter reference in ComfyUI instead of
   lengthening the prompt.
   *QA gate: face matches the sheet at frames 1, 96, and 150; the hand is open and
   arriving at waist-to-shoulder height at frame 150. Freeze the approved take.*
4. **Merge (ComfyUI, T4).** Extract the character with a mask node, composite onto the
   frozen plate with ImageCompositeMasked, aligned so the hand meets the trunk at
   frame 150. Around the contact frames (145–160), run a masked inpaint pass over the
   hand/trunk region only — KSampler denoise 0.4–0.6 — so skin and bark share light
   and the contact reads as touch, not overlap.
   *QA gate: occlusion correct (fingers in front of bark, arm behind the near branch);
   contact shadow present on the trunk; no halo around the mask edge.*
5. **Harmonize.** Low-denoise pass over the full merged clip — KSampler denoise
   0.25–0.35 — to unify grain, color temperature, and light direction.
   *QA gate: character and plate share the same key-light direction; no flicker
   introduced by the pass.*
6. **Upscale + deliver.** Upscale-model pass on the approved frames only.
   *QA gate: labels, eyes, and the contact frame survive upscaling without new
   artifacts.*

### Failure modes

- **Hand passes through the trunk** → the plate and the character pass disagree on
  depth at the contact frame → re-mask with the plate's depth as the occlusion guide;
  never fix it by prompt.
- **Face is right at frame 1, wrong at frame 150** → the character pass ran past the
  model's identity-stable window → shorten the character pass to 4–5s and cover the
  rest with held frames or a second anchored pass.
- **Merged clip looks like a sticker on a painting** → harmonize pass skipped or
  denoise too low → rerun step 5 at 0.30–0.35 with the plate's color grade referenced.
- **Tree drifts between clay and plate** → ControlNet weight too low or denoise too
  high in step 2 → raise weight toward 1.0, drop denoise toward 0.55, regenerate the
  plate (it is not yet frozen at that point).

### Cost estimate

Roughly **8–12×** a single T0 pass per final second: one clay render, one restyle, two
to four character-pass attempts, one merge, one harmonize, one upscale. In wall time:
2–3 working days versus one afternoon of losing seed lotteries — and the contact frame
is controllable, which no amount of seeds buys you.

---

## R2 — 10-minute one-take music video (一镜到底)

**Route: T5 chaining over segments built with T3/T4, beat-mapped.**

### Target shot

10 minutes, one continuous camera move, no visible cuts, synced to a finished track at
120 BPM. A performer appears in about a third of the runtime; the rest is environment.
Style: consistent across all 10 minutes.

### Routing trace

| Question | Answer | Pushed |
|---|---|---|
| Q1 | 600s — far beyond any single clip | T5 is mandatory (doc 00, section 4: no model holds coherence for minutes) |
| Q2 | Yes — performer identity across segments | T1/T4 anchors per segment |
| Q3 | Yes — one unbroken camera path | T3 blockout owns the camera |
| Q4 | Moderate — performer walks through spaces, occasional contact | T4 merge on performer segments only |
| Q5 | Stylized, from scratch | generation, not restyle |
| Q6 | Flagship piece, weeks of budget | 20–50× single-pass is the price of "one take" |

### Pipeline

1. **Beat map first.** Lock the track. Mark section boundaries (verse/chorus/bridge)
   and place segment boundaries *on* them: 60–90 segments of 6–10s each, with 8–16
   frames of overlap between neighbors. Output: `<beat-map.csv>` — segment id, time
   range, location, performer present (y/n), target emotional beat.
   *QA gate: every segment boundary lands within ±2 frames of a musical section
   boundary; no segment exceeds your model's reliable clip length (as of 2026, check
   current docs).*
2. **Master camera path.** Build all locations in Blender and lay one continuous
   camera path across the whole 10 minutes: `<master-camera.blend>`. Split per segment
   and render clay passes → `<seg-001-clay.mp4>` … `<seg-075-clay.mp4>`.
   *QA gate: the last frame of segment k's clay equals the first frame of segment
   k+1's clay in position and direction — verify numerically in Blender, not by eye.*
3. **T3 restyle, batched.** Every segment gets the doc-01 treatment: depth-locked
   ControlNet, one frozen style prompt, one frozen `<style-ref.png>`, same denoise
   settings for all segments. Batch overnight.
   *QA gate: style consistency sampled at segment boundaries — put segment k's last
   frame and k+1's first frame side by side; a stranger should read them as the same
   film. Freeze each approved segment plate.*
4. **T4 on performer segments only.** For segments marked `y` in the beat map: R1
   steps 3–5 (anchored character pass, masked merge, harmonize). Non-performer
   segments skip this entirely — that is 40+ segments of saved work.
   *QA gate: performer face matches `<performer-sheet.png>` at each segment's first
   and last frame; identity drift measured across segment boundaries, not within
   them.*
5. **Chain the segments (T5).** For each boundary: use segment k's approved last
   frames as the start anchor for k+1 (end-frame/start-frame anchoring where the tool
   supports it, or a latent blend over the 8–16 overlap frames in ComfyUI). The seam
   hides on the musical section change.
   *QA gate: stepping through each seam frame by frame shows no position jump, no
   exposure pop, no scale shift. One bad seam = rework that boundary only, never the
   whole chain.*
6. **Beat-sync pass.** Nudge segment in/out points so motion peaks (footfalls, camera
   direction changes, contact moments) land on beats, ±2 frames.
   *QA gate: spot-check 10 random motion peaks against the beat grid.*
7. **Global finish.** One grade + one upscale pass over the assembled 10 minutes, so
   the whole film shares a single final look.
   *QA gate: watch it end to end once, uninterrupted. Fatigue artifacts you missed in
   isolation show up only at full length.*

### Failure modes

- **Slow identity drift over minutes** → each segment's character pass re-rolls the
  face → always anchor from the frozen `<performer-sheet.png>`, never from the
  previous segment's output.
- **Visible seam every 8 seconds** → overlaps blended in pixel space with a hard
  crossfade → blend in latent space or mask-blend along depth edges; move the seam to
  the section boundary where the ear expects change.
- **Style slowly warms/cools across the runtime** → segments generated in different
  sessions with slightly different settings → freeze the full parameter set in the
  batch script; regenerate outliers, don't re-grade the world.
- **Camera speed feels wrong against the music** → camera path was laid before the
  beat map → order matters: beat map (step 1) always precedes camera (step 2).

### Cost estimate

Roughly **20–50×** a naive single pass, spread over weeks. The dominant cost is step 3
(75+ restyled segments) — which is exactly why step 1 exists: segments you can cut on
paper cost nothing. Budget one full re-render cycle: you will need it at the seams.

---

## R3 — Real drone footage turned into Ghibli-style anime

**Route: T2 depth-guided restyle.**

### Target shot

20 seconds of real drone footage over a coastline, `<drone-source.mp4>`, restyled to
hand-painted anime. Geometry, camera move, and timing stay exactly as shot — only the
appearance changes.

### Routing trace

| Question | Answer | Pushed |
|---|---|---|
| Q1 | 20s — 2–3 model-length chunks | light chaining, not full T5 |
| Q2 | No named character | no identity machinery |
| Q3 | Exact — the geometry *is* the footage | depth guidance, weight high |
| Q4 | None — camera touches nothing | no T4 merge |
| Q5 | Restyle of existing footage | T2, directly off doc 00's scenario table |
| Q6 | Cheap — this is the low-budget recipe | 3–6× single-pass |

This is the one recipe where you should refuse escalation. No blockout, no compositing
graph. The footage already paid the geometry budget.

### Pipeline

1. **Chunk.** Cut `<drone-source.mp4>` at the model's reliable clip length with ~1s of
   overlap → `<clip-01.mp4>`, `<clip-02.mp4>`, `<clip-03.mp4>`.
   *QA gate: chunk boundaries fall on calm motion, not mid-turn.*
2. **Depth extraction (ComfyUI).** Run Depth Anything per frame →
   `<clip-01-depth.mp4>` etc.
   *QA gate: scrub the depth — coastline and rocks stable, no pumping. Sky and open
   water will be noisy; note those regions for step 3.*
3. **Restyle.** Per chunk: load frames → VAE Encode → ControlNet Apply (depth, weight
   0.8–1.0 as a starting point) → KSampler, denoise 0.55–0.75 as a starting point,
   style prompt plus `<style-ref.png>` through IPAdapter if plain prompting drifts →
   VAE Decode. **Same seed, same prompt, same settings for all three chunks.**
   *QA gate: geometry unchanged (overlay depth of output vs input); the first and last
   frames of each chunk read as the same painting style.*
4. **Join.** Blend the 1s overlaps with a short crossfade or a masked blend along the
   horizon line.
   *QA gate: no double-image at joins when stepped through frame by frame.*
5. **Deflicker if needed.** If flat regions (sky, water) shimmer, run a low-denoise
   pass — 0.2–0.3 — over the joined clip, or lower the ControlNet weight just for
   those regions with a mask.
   *QA gate: sky luminance stable across a 24-frame window.*
6. **Upscale + deliver.**
   *QA gate: painted texture survives upscaling; no photoreal detail reintroduced.*

### Failure modes

- **Frame-to-frame flicker** → per-frame style variance at high denoise → lower
  denoise toward 0.55, keep one seed across chunks, add the step-5 deflicker pass.
- **Depth shimmers on sky and open water** → Depth Anything has nothing to grab in
  featureless regions → mask those regions to a lower control weight instead of
  fighting the extractor.
- **Style drifts between chunks** → different seeds or settings per chunk → freeze
  seed, prompt, and parameters before batching; anchor chunk boundaries on shared
  overlap frames.
- **Fast pans smear into mush** → denoise too high for the motion → lower denoise or
  raise control weight; if it still smears, split the chunk at the pan.

### Cost estimate

Roughly **3–6×** a single pass: extraction plus one restyle per chunk, one deflicker
at worst. An afternoon, not a week. If someone proposes a blockout for this shot, show
them doc 00, section 8.

---

## R4 — Product hero shot with an exact end frame

**Route: T1 end-frame anchor + light T4 cleanup.**

### Target shot

5 seconds. A cosmetic bottle rises and rotates into the final packshot. The **last
frame must match `<packshot-final.png>` exactly** — approved key art, logo legible,
composition locked. Everything before the last second just has to look expensive.

### Routing trace

| Question | Answer | Pushed |
|---|---|---|
| Q1 | 5s — one clip | no chaining |
| Q2 | Yes — the product must be the product | anchor + reference |
| Q3 | Only the final composition is exact | T1 end-frame anchor, *not* T3 — one exact frame is an anchor problem, not a 3D problem |
| Q4 | Minimal — a surface reflection at most | light cleanup only |
| Q5 | Realistic product look | image-to-video |
| Q6 | Tight — this airs once | 2–4× single-pass, hard ceiling |

Doc 00's escalation discipline applies in full: if three anchored seeds pass QA, you
are done. The T4 pass below exists for the common case where they *almost* pass.

### Pipeline

1. **Make the end frame first.** Produce and retouch `<packshot-final.png>` as a
   still, get it approved, **freeze it**. Every downstream step treats it as ground
   truth.
   *QA gate: stakeholder sign-off on the still, in writing.*
2. **Anchored generation (T1).** Image-to-video, 5s, with the end frame pinned to
   `<packshot-final.png>` and the start guided by `<bottle-beauty.png>`. Run 3–5
   seeds. End-frame support is version-sensitive — as of 2026, check current docs for
   your tool's exact anchoring controls.
   *QA gate: the final frame matches the approved still; the label is readable for the
   last full second.*
3. **Trim and pin if needed.** If the last generated frames drift off-anchor, cut the
   final 2–3 frames and append the approved still directly. A 0.1s hold on the real
   packshot reads as deliberate; a drifted logo reads as a bug.
   *QA gate: no motion pop at the splice point.*
4. **Light T4 cleanup (ComfyUI), only where QA failed.** Typical: masked inpaint over
   the label region — KSampler denoise 0.3–0.45 — to restore warped text; a 0.2–0.3
   denoise pass on the background to clean gradient banding. Nothing else.
   *QA gate: label text matches `<packshot-final.png>` glyph for glyph in the final
   second; cleanup passes touched no approved region.*
5. **Upscale + deliver.**
   *QA gate: final frame still matches after upscale — upscalers can "improve" logos.*

### Failure modes

- **The end frame drifts off the anchor** → anchoring strength too low or the move too
  ambitious for 5s → simplify the camera move, or use step 3's trim-and-pin; do not
  escalate to a blockout for one exact frame.
- **Label text warps mid-shot** → generative text is unreliable, always → masked
  inpaint per problem frame, or composite the real label from the frozen still over
  the region.
- **The bottle's reflection doesn't match the scene** → subject and background
  generated with different light → one low-denoise relight pass (0.25–0.35) over the
  bottle region only.
- **Scope creep into T3** → "while we're at it, let's blockout the rotation" → stop:
  Q3 only demands one exact frame. R1 exists for when the *path* must be exact.

### Cost estimate

Roughly **2–4×** a single pass: one still, five seeds, a few masked inpaints. The
cheapest recipe in this doc — because routing refused to buy control the shot didn't
need.

---

## Cross-recipe notes

- **The freeze rule is doing the heavy lifting.** Every recipe's QA gates exist to
  decide when an artifact becomes frozen. Unfrozen artifacts downstream of approved
  work are how 8× costs become 30× costs.
- **ComfyUI appears as a workbench, never a rung** — restyle, merge, harmonize,
  deflicker, inpaint, upscale. Node-level recipes live in
  [05 — ComfyUI integration patterns](05-comfyui-integration.md).
- **The four recipes span the ladder deliberately:** R4 barely leaves T1, R3 sits on
  T2, R1 composes T3+T4, R2 stacks everything. If your shot doesn't route to one of
  them, that's the framework working — go back to Q1–Q6, don't force a recipe.

---

**Previous:** [05 — ComfyUI integration patterns](05-comfyui-integration.md)
**Framework:** [00 — The Decision Framework](00-decision-framework.md)
