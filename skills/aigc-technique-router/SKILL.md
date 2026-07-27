---
name: aigc-technique-router
description: Routes a target AIGC video shot or frame to the cheapest generation technique that can produce it. Load this skill when a user describes a shot they want to generate and asks which technique, model, or pipeline to use; when they mention 白膜迁移 (clay-render transfer), depth-guided video, multistep/multi-pass generation, ComfyUI pipelines, or 一镜到底 (long-take/one-shot video); or when a single-pass generation keeps failing and they need to know what to escalate to.
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
the decision tree, and the escalation rules. Follow it; do not improvise a parallel
taxonomy.

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

## Step 3: Walk the decision tree and answer

Apply the decision tree from the framework doc. Your answer must contain all five of:

1. **Recommended rung(s) T0–T5.** Rungs compose — say so when the answer is a chain
   (e.g. T3 for environment, T4 for the merge, T5 for duration).
2. **Rationale tied to the user's own answers.** "Your Q3 answer (exact dolly path)
   forces structural guidance, which rules out T0/T1" — not "T3 is more powerful".
3. **The cheapest first attempt.** Name the concrete first move, e.g. "3–5 seeds at T0
   before touching anything else".
4. **An explicit escalation trigger.** The format is: "if X fails, escalate to Y".
   X must be a named, observable constraint ("the character's face drifts between
   shots"), never "if it looks off".
5. **Links to the relevant docs**, using paths relative to this SKILL.md:
   - `../../docs/en/00-decision-framework.md` — framework, always link
   - `../../docs/en/01-clay-render-transfer.md` — T3 白膜迁移
   - `../../docs/en/02-depth-video.md` — T2
   - `../../docs/en/03-multistep-video-generation.md` — T4
   - `../../docs/en/04-long-take-continuous-shot.md` — T5 一镜到底
   - `../../docs/en/05-comfyui-integration.md` — ComfyUI as the workbench between rungs

   Only link docs that exist; check before linking.

## Routing discipline

- **Never skip rungs without a constraint that demands it.** A shot that Kling or a
  comparable model nails on the third seed does not deserve a 12-node ComfyUI graph.
- **Escalate one dimension at a time.** Consistency failure → add a keyframe anchor
  (T1) before rebuilding in ComfyUI (T4).
- **Respect Q6.** A 5–50× cost multiplier for a shot that airs once is a loss. Say so.
- **Freeze approved artifacts.** If the user already has a good plate, keyframe, or
  turnaround, treat it as a fixed input and route the remaining problem only.
- **Lip sync, talking heads** → specialized tool, outside this ladder. Say so and stop.

## Examples

**User:** "I need a 6-second shot of a robot walking through neon-lit rain. Which tool
should I use?"

**Skill output:** Missing Q1–Q6? Q1 is answered (6s). Ask at most 4: Q2 (must this robot
match other shots?), Q3 (exact camera move?), Q4 (does it interact — splashes,
reflections?), Q6 (budget per second?). Do not route until these come back, unless the
user declines — then assume: one-off shot, no exact camera, moderate interaction →
recommend **T0** (3–5 seeds first), escalation trigger "if the robot's design changes
between takes, escalate to T1 with a curated keyframe", links to the framework doc.

**User:** "我们要拍一个 10 分钟一镜到底的 MV,镜头跟着主角穿过三个房间,角色必须全程一致。"

**Skill output:** Q1 (10 min), Q2 (yes), Q3 (camera follows a path — exact), Q4, Q5
answered or quickly confirmed. Route: **T5 on top of T3/T4** — T3 (白膜迁移) for the
camera path through the rooms, T4 to keep the protagonist identical across the merge,
T5 (一镜到底) chaining with overlapping segments and continuity anchors for duration.
Cheapest first attempt: block out one room in 3D, run one clay-render transfer segment,
verify the character holds. Escalation trigger: "if seams between chained segments
drift in color or identity, escalate to a ComfyUI harmonize pass on the overlap
(doc 05)". Link docs 00, 01, 03, 04, 05.
