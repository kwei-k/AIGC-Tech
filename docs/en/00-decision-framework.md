# 00 — The Decision Framework: Which Technique for Your Target Frame?

> **The core thesis of this repo:** do not start from the tool you like. Start from the
> shot you need. Decompose the target frame into requirements, then route to the
> simplest pipeline that satisfies them. Every extra demand you pile into a single
> generation multiplies the failure rate.

[中文版本](../zh/00-decision-framework.md)

---

## 1. The Complexity Budget

Every video generation model has an implicit **complexity budget** per pass. A single
prompt that simultaneously demands:

- a specific character identity, **and**
- a precise camera move, **and**
- a specific style, **and**
- exact composition, **and**
- 30+ seconds of duration, **and**
- clean interaction between subject and environment

…will fail far more often than it succeeds. Not because the model is bad, but because
you asked one sampling pass to satisfy six constraints at once.

**Multi-step AIGC exists to spend the budget one dimension at a time.** Generate the
background without worrying about the character. Generate the character without
worrying about the background. Denoise, upscale, or restyle in between. Composite at
the end. Each pass carries one or two constraints, so each pass succeeds at high rate —
and a chain of 90%-success steps beats a single 15%-success mega-prompt.

The cost is orchestration: more steps, more intermediate artifacts, more places to
drift. This framework tells you when that cost is worth paying.

## 2. The Six Routing Questions

Answer these about your **target frame/shot** before touching any tool:

| # | Question | Why it routes |
|---|----------|---------------|
| Q1 | How long is the final shot? | >10s pushes you out of single-pass territory; minutes pushes you to long-take chaining. |
| Q2 | Must the subject stay *identical* across shots/frames? | Character consistency is the #1 reason to split generation into steps. |
| Q3 | Do you need exact control of composition/camera? | "Exact" means structural guidance (depth, clay render, 3D previz), not prompt engineering. |
| Q4 | Does the subject interact with the environment (contact shadows, occlusion, reflections)? | Interaction is what makes naive compositing look fake; it decides between T2/T3/T4. |
| Q5 | Is the target realistic, stylized, or a restyle of existing footage? | Restyle → video-to-video. From scratch → text/image-to-video. |
| Q6 | What is your compute/time budget per final second? | Chained pipelines cost 5–50× a single pass. Sometimes "good enough in one shot" wins. |

## 3. The Technique Ladder

Ordered from cheapest (try first) to most orchestrated (use when cheaper rungs fail).
Full details in the linked docs.

| Rung | Technique | Doc | One-line summary |
|------|-----------|-----|------------------|
| **T0** | Single-pass text-to-video | *(external tools)* | One prompt, one clip. The baseline — always try first. |
| **T1** | Image-to-video, keyframe-anchored | *(external tools)* | Lock the first (and last) frame with a still you control. |
| **T2** | Depth/structure-guided video | [02](02-depth-video.md) | Extract depth/pose per frame, steer generation with it. |
| **T3** | Clay-render transfer (白膜迁移) | [01](01-clay-render-transfer.md) | 3D blockout → untextured "clay" render → AI restyle with geometry locked. |
| **T4** | Multistep compositing | [03](03-multistep-video-generation.md) | Background plate → subject → merge, with ComfyUI passes (denoise, relight, upscale) in between. |
| **T5** | Long-take chaining (一镜到底) | [04](04-long-take-continuous-shot.md) | Chunk a minutes-long shot into overlapping segments with continuity anchors. |

Rungs compose. A real production pipeline is often T3 for the environment, T4 to marry
subject and background, T5 to stretch it to final duration.

## 4. The Decision Tree

```mermaid
flowchart TD
    A[Target shot defined] --> B{Duration > model's<br/>reliable clip length?}
    B -- No --> C{Need exact composition<br/>or camera path?}
    B -- Yes --> T5[T5: Long-take chaining<br/>→ doc 04]
    C -- No --> D{Subject identity must<br/>match an existing design?}
    C -- Yes --> E{Do you have or can you build<br/>a 3D blockout / previz?}
    D -- No --> F{Single character +<br/>complex environment interaction?}
    D -- Yes --> G[T1: Image-to-video with a<br/>curated keyframe of your subject]
    E -- Yes --> T3[T3: Clay-render transfer<br/>→ doc 01]
    E -- No --> H{Restyling existing footage?}
    H -- Yes --> T2[T2: Depth-guided video-to-video<br/>→ doc 02]
    H -- No --> T4
    F -- No --> T0[T0: Single-pass text-to-video.<br/>Try 3-5 seeds before escalating.]
    F -- Yes --> T4[T4: Multistep compositing<br/>→ doc 03]
    T0 -. fails on consistency .-> G
    G -. fails on environment .-> T4
    T4 -. needs longer duration .-> T5
```

**How to read it:** always enter at the cheapest rung that your Q1–Q6 answers allow.
Escalate only when a rung demonstrably fails — and escalate *one dimension at a time*.

## 5. Scenario Routing Table

| Your target | Route | Why |
|---|---|---|
| 5s atmospheric establishing shot, no named character | T0 | Nothing to be consistent with; seeds are cheap. |
| Product hero shot, exact packshot at the end | T1 (end-frame anchor) | The last frame is the only frame that must be exact. |
| Turn real drone footage into anime | T2 (depth + style) | Geometry is already correct; only appearance changes. |
| Precise camera dolly through a stylized city | T3 | Camera paths are a 3D problem. Prompt them and you get drift. |
| Character walks through a generated forest, touches a tree | T4 | Contact/interaction demands per-element control plus a merge pass. |
| 10-minute one-shot music video | T5 on top of T3/T4 | No model holds coherence for minutes; chain segments with anchors. |
| Talking-head close-up with lip sync | Specialized tool, not this stack | Lip sync is its own budget; don't pay it inside a general pipeline. |

## 6. Escalation Discipline

The most common failure mode of multi-step work is **over-escalation**: building a
12-node ComfyUI graph for a shot that Kling would have nailed on the third seed.

Rules of thumb:

1. **Spend 15 minutes on the cheap rung first.** Three to five seeds at T0/T1 is a
   fair trial. Zero seeds is not.
2. **Name the constraint that failed** before escalating. "It looks off" is not a
   constraint. "The character's face changed between shots" is — and it routes to T1/T4,
   not to a bigger prompt.
3. **Escalate one dimension at a time.** If T0 fails on consistency, add a keyframe
   anchor (T1) before rebuilding the whole pipeline in ComfyUI.
4. **Freeze what works.** Once a pass produces a good artifact (a clean background
   plate, a good character turnaround), treat it as a fixed input to the next pass.
   Never regenerate upstream artifacts downstream of a step you already approved.

## 7. Where ComfyUI Fits

ComfyUI is not a rung on the ladder — it is the **workbench between rungs**. Its job in
this playbook is surgical, not generative-from-scratch:

- mid-pipeline **denoise/relight** passes to harmonize a pasted subject with a plate,
- **latent-space merging** of separately generated elements,
- **upscale + detail** passes on approved frames,
- **depth/pose extraction** feeding T2/T3.

See [05 — ComfyUI integration patterns](05-comfyui-integration.md) for the recipes, and
[03](03-multistep-video-generation.md) for where each pass lands in a multistep chain.

## 8. Failure Modes of the Framework Itself

- **Routing by novelty** — picking T3 because clay transfer is fun, not because the shot
  needs it. The tree only moves right when a constraint demands it.
- **Ignoring Q6** — a 50-step pipeline for a shot that airs once is a loss. Budget is a
  real constraint; put it in the routing.
- **Treating the tree as static** — model capabilities move monthly. When a new model
  reliably handles two constraints at once, collapse that branch. (This is exactly the
  kind of update [CONTRIBUTING](../../CONTRIBUTING.md) asks for.)

---

**Next:** [01 — Clay-Render Transfer (白膜迁移)](01-clay-render-transfer.md)
