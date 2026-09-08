# AIGC-Tech

**A decision-first multistep video playbook. Choose the technique, structure the motion,
then generate the shot.**

A decision-first field guide to multi-step AIGC video production: clay-render transfer
(白模迁移), depth-guided video, multistep compositing (background → subject → merge,
with surgical ComfyUI passes in between), and long-take chaining for minutes-long
one-shots, and a motion-first prompt-writing template — plus agent-loadable skills that route
your target frame and turn director intent into executable video instructions.

[中文 README](README.zh-CN.md) · [Usage Guide](docs/en/09-usage-guide.md) · [Seedance / Dreamina](docs/en/08-seedance-and-dreamina.md) · [Decision Framework](docs/en/00-decision-framework.md) · [Skills](#agent-skills)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docs: EN + 中文](https://img.shields.io/badge/docs-EN%20%2B%20%E4%B8%AD%E6%96%87-blue)](docs/)
[![Agent Skills](https://img.shields.io/badge/agent%20skills-4-green)](skills/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Start here

Use the [usage guide](docs/en/09-usage-guide.md) to choose a Skill, keep an existing
prompt or ask for one fresh draft, and prepare a request for Seedance API or Dreamina
CLI. The [adaptation guide](docs/en/08-seedance-and-dreamina.md) explains how first
frames, first/last frames, and semantic references map to each tool.

In a checkout, ask your agent:

```text
Read skills/write-video-prompt/SKILL.md. Write one prompt for Dreamina CLI from my
current brief. This image defines the person; the other image is composition only.
```

With a finalized prompt, prepare the illustrative request locally:

```bash
node scripts/prepare-video-request.mjs --input examples/video-request.json
```

This helper outputs request data only; it does not write prompts or generate video.
The JSON examples are illustrative. Real video case studies are a future contribution.

## Why this repo exists

Most AIGC video tutorials are tool tutorials: "here's how to use Kling / Runway /
ComfyUI." That is the wrong starting point. The question that actually determines
whether your shot succeeds is:

> **Given my target frame — its duration, its consistency demands, its camera, its
> interactions — which *technique* should I pay for?**

A single prompt that demands character identity + precise camera + style + 30s duration
+ environment interaction fails most of the time. Not because models are bad, but
because one sampling pass cannot satisfy six constraints at once. **Multi-step AIGC
spends the complexity budget one dimension at a time** — generate the background, then
the character, denoise in ComfyUI, then merge. Each approved artifact becomes a frozen
input, so a downstream failure can be retried without throwing away everything upstream.

This repo is the control layer: a decision framework, per-technique playbooks, and
skills that route the shot, plan its passes, and write each generative prompt.

## The 60-second version

```mermaid
flowchart TD
    A[Your target shot] --> Q[Evaluate all six constraints]
    Q --> I{Identity must match?}
    I -- Yes --> T1[T1 identity anchor]
    Q --> S{Restyle existing footage?}
    S -- Yes --> T2[T2 depth / structure guidance]
    Q --> C{Exact camera or composition?}
    C -- Yes, with 3D --> T3[T3 clay-render transfer]
    C -- Yes, without 3D --> T4[T4 multistep control]
    Q --> X{Complex interaction?}
    X -- Yes --> T4
    Q --> D{Beyond reliable clip length?}
    D -- Yes --> T5[T5 duration wrapper]
    Q --> N{No higher constraint?}
    N -- Yes --> T0[T0 single pass]
    T1 --> O[Compose every required rung]
    T2 --> O
    T3 --> O
    T4 --> O
    T5 --> O
    T0 --> O
```

Full composable routing map, scenario table, and escalation rules:
**[docs/en/00-decision-framework.md](docs/en/00-decision-framework.md)**

## Documentation

| # | Doc (EN) | 中文 | What it answers |
|---|----------|------|-----------------|
| 00 | [The Decision Framework](docs/en/00-decision-framework.md) | [决策框架](docs/zh/00-decision-framework.md) | Which technique for your target frame — start here. |
| 01 | [Clay-Render Transfer (白模迁移)](docs/en/01-clay-render-transfer.md) | [白模迁移](docs/zh/01-clay-render-transfer.md) | Lock geometry with a 3D blockout, restyle with AI. |
| 02 | [Depth-Guided Video](docs/en/02-depth-video.md) | [深度视频](docs/zh/02-depth-video.md) | Per-frame depth as the steering wheel for v2v and restyle. |
| 03 | [Multistep Video Generation](docs/en/03-multistep-video-generation.md) | [多步骤视频生成](docs/zh/03-multistep-video-generation.md) | Background plate → subject → merge, with ComfyUI passes between steps. |
| 04 | [Long-Take Chaining (一镜到底)](docs/en/04-long-take-continuous-shot.md) | [长镜头一镜到底](docs/zh/04-long-take-continuous-shot.md) | Minutes-long continuous shots via overlapping segments + anchors. |
| 05 | [ComfyUI Integration Patterns](docs/en/05-comfyui-integration.md) | [ComfyUI 集成模式](docs/zh/05-comfyui-integration.md) | Denoise, relight, latent-merge, upscale — the workbench between steps. |
| 06 | [Pipeline Recipes](docs/en/06-pipeline-recipes.md) | [管线配方](docs/zh/06-pipeline-recipes.md) | End-to-end worked examples combining the techniques. |
| 07 | [Motion-First Video Prompt Template](docs/en/07-motion-first-video-prompt-template.md) | [运动优先的视频提示词写作模板](docs/zh/07-motion-first-video-prompt-template.md) | Structure director intent and typed references as one copy-ready prompt. |
| 08 | [Seedance and Dreamina Adaptation](docs/en/08-seedance-and-dreamina.md) | [Seedance 与即梦工具适配](docs/zh/08-seedance-and-dreamina.md) | Match reference roles and final prompts to the supported tool inputs. |
| 09 | [Usage Guide](docs/en/09-usage-guide.md) | [使用指南](docs/zh/09-usage-guide.md) | Choose and install Skills, opt into prompt writing, and prepare an offline request. |

## Agent Skills

Loadable by Claude Code, Kimi, and other Agent-Skills-compatible tools. Each skill
packages the routing logic so an agent can plan your pipeline instead of guessing.

| Skill | What it does |
|-------|--------------|
| [aigc-technique-router](skills/aigc-technique-router/SKILL.md) | Interviews you about the target shot (the six routing questions) and returns a recommended pipeline with rationale. |
| [multistep-video-planner](skills/multistep-video-planner/SKILL.md) | Turns a shot description into a step-by-step multistep plan: plates, passes, merge points, QA gates. |
| [comfyui-denoise-pass](skills/comfyui-denoise-pass/SKILL.md) | Designs the mid-pipeline denoise/relight pass: strength ranges, node order, failure checks. |
| [write-video-prompt](skills/write-video-prompt/SKILL.md) | Writes one motion-first prompt from the current brief and typed references, with target-specific handoff guidance when requested. |

Use a complete checkout for the full Skill set: the router, planner, and denoise
Skill depend on the manual. The writer can be installed as its complete folder,
including its references. See [installation and invocation](docs/en/09-usage-guide.md#4-install-without-losing-the-reference-documents).

## Validate the playbook

The routing cases, bilingual structure, local links, Skill metadata, and repository
claims are checked without third-party dependencies:

```bash
npm test
```

## Repo layout

```
├── docs/en, docs/zh      # the playbook, mirrored in English and Chinese
├── skills/               # agent-loadable skills (SKILL.md format)
├── scripts/              # routing reference and offline video-request preparation
├── examples/             # illustrative request inputs; no generated-video claims
├── tests/                # routing cases and repository consistency checks
├── workflows/            # contribution contract; executable examples are not committed yet
├── assets/               # reserved for future stills; current diagrams use Mermaid in docs
└── CONTRIBUTING.md       # how to add a technique or update the routing logic
```

## Principles

1. **Technique before tool.** Models change monthly; routing logic survives them.
2. **Cheapest rung first.** Always try single-pass before building a pipeline.
3. **Name the failing constraint** before escalating one dimension at a time.
4. **Freeze approved artifacts.** Never regenerate upstream of a step you approved.
5. **Document failure modes.** Knowing when a technique is wrong is half the playbook.
6. **Structure intent, not adjectives.** Express camera, subject, and scene motion before look.

## License

[MIT](LICENSE) — use it, fork it, ship shots with it.
