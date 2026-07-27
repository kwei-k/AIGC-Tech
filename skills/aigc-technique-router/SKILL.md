---
name: aigc-technique-router
description: Routes a target AIGC video shot or frame to the cheapest generation technique that can produce it. Load this skill when a user describes a shot they want to generate and asks which technique, model, or pipeline to use; when they mention 白模迁移 (clay-render transfer), depth-guided video, multistep/multi-pass generation, ComfyUI pipelines, or 一镜到底 (long-take/one-shot video); or when a single-pass generation keeps failing and they need to know what to escalate to.
---

# AIGC Technique Router

Route the user's target shot to a rung on the technique ladder (T0–T5). Do not start
from a tool. Start from the shot, decompose it into requirements, and recommend the
cheapest pipeline that satisfies them.

## Step 1: Load the framework

Read the decision framework before routing anything:

```
../../docs/en/00-decision-framework.md
```

(relative to this SKILL.md). It defines the six routing questions, the T0–T5 ladder,
the composable routing map, and the escalation rules. For deterministic edge cases,
also inspect `../../scripts/route-shot.mjs`. Follow these sources; do not improvise a
parallel taxonomy.

## Step 2: Ask the routing questions

Check what the user's request already answers, then ask only the missing ones. Ask at
most 4 questions per round.

- **Q1** — How long is the final shot?
- **Q2** — Must the subject stay identical across shots/frames?
- **Q3** — Do you need exact control of composition or camera?
- **Q4** — Does the subject interact with the environment (contact shadows, occlusion,
  reflections)?
- **Q5** — Is the target realistic, stylized, or a restyle of existing footage?
- **Q6** — What is your compute/time budget per final second?

If the user gave a rich brief and only one or two answers are missing, ask just those.
If the user says "just route it", make conservative assumptions, state them, and route.

## Step 3: Compose the route and answer

Evaluate every answered constraint before returning a route. Do not stop at the first
matching rung:

- Identity must match an existing design → add **T1**.
- Existing footage already supplies camera/geometry → add **T2**.
- Otherwise, exact camera/geometry with a 3D blockout → add **T3**.
- Exact camera/geometry without footage or 3D → add **T4** as the controllable fallback.
- Contact, occlusion, reflection, or another complex interaction → add **T4**.
- Duration beyond the model's reliable clip length → wrap the per-segment route in **T5**.
- None of T1–T5 applies → return **T0**.

Your answer must contain all five of:

1. **Recommended rung(s) T0–T5.** Rungs compose — say so when the answer is a chain
   (e.g. T1 for identity, T3 for camera, T4 for the merge, T5 for duration).
2. **Rationale tied to the user's own answers.** "Your Q3 answer (exact dolly path)
   forces structural guidance, which rules out T0/T1" — not "T3 is more powerful".
3. **The cheapest first attempt.** Name the concrete first move, e.g. "3–5 seeds at T0
   before touching anything else".
4. **An explicit escalation trigger.** The format is: "if X fails, escalate to Y".
   X must be a named, observable constraint ("the character's face drifts between
   shots"), never "if it looks off".
5. **Links to the relevant docs**, using paths relative to this SKILL.md:
   - `../../docs/en/00-decision-framework.md` — framework, always link
   - `../../docs/en/01-clay-render-transfer.md` — T3 白模迁移
   - `../../docs/en/02-depth-video.md` — T2
   - `../../docs/en/03-multistep-video-generation.md` — T4
   - `../../docs/en/04-long-take-continuous-shot.md` — T5 一镜到底
   - `../../docs/en/05-comfyui-integration.md` — ComfyUI as the workbench between rungs

   Only link docs that exist; check before linking.

## Routing discipline

- **Never skip rungs without a constraint that demands it.** A shot that Kling or a
  comparable model nails on the third seed does not deserve a 12-node ComfyUI graph.
- **Never let one rung hide another constraint.** T5 solves duration only; it does not
  solve identity, camera, or interaction inside each segment. T1 solves identity only;
  it does not make contact shadows or occlusion correct.
- **Escalate one dimension at a time.** Consistency failure → add a keyframe anchor
  (T1) before rebuilding in ComfyUI (T4).
- **Respect Q6.** Estimate passes × generated frames × expected retries, then add human
  QA and assembly time. Do not quote one universal cost multiplier.
- **Freeze approved artifacts.** If the user already has a good plate, keyframe, or
  turnaround, treat it as a fixed input and route the remaining problem only.
- **Lip sync, talking heads** → specialized tool, outside this ladder. Say so and stop.

## Examples

**User:** "I need a 6-second shot of a robot walking through neon-lit rain. Which tool
should I use?"

**Skill output:** Missing Q1–Q6? Q1 is answered (6s). Ask at most 4: Q2 (must this robot
match other shots?), Q3 (exact camera move?), Q4 (does it interact — splashes,
reflections?), Q6 (budget per second?). Do not route until these come back, unless the
user declines — then assume: one-off shot, no exact camera, and rain is atmospheric
rather than a required splash/reflection interaction → recommend **T0** (3–5 seeds
first). Escalation trigger: "if the robot's design changes between takes, add T1 with
a curated keyframe; if visible splashes/reflections must match its movement, add T4."
Link the framework and any rung-specific docs used.

**User:** "我们要拍一个 10 分钟一镜到底的 MV,镜头跟着主角穿过三个房间,角色必须全程一致。"

**Skill output:** Q1 (10 min), Q2 (yes), Q3 (camera follows a path — exact), while Q4
still needs a quick confirmation. The minimum route is **T1 + T3 + T5** — T1 anchors
the protagonist, T3 (白模迁移) owns the camera path through the rooms, and T5 chains
the per-segment pipeline for duration. Add **T4** only when the blocking, reflection,
or subject/environment interaction actually requires separate elements and a merge.
Cheapest first attempt: block out one room in 3D, run one identity-anchored transfer
segment, and verify both camera and character. Escalation trigger: "if a required
occlusion or reflection fails in the combined segment, add T4 for that interaction;
if segment seams drift, use the overlap harmonize pass in doc 05." Link only the docs
for the rungs returned.
