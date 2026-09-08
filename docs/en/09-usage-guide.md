# 09 — Use the Playbook and Skills

[中文版本](../zh/09-usage-guide.md)

Start with the task you want the agent to complete. The repository contains four
Skills, a technical manual, and an offline helper that prepares a video request.
Prompt writing is optional. Video generation happens through your chosen external
tool after you review the prepared request.

## Before you start

Use Node.js 20 or newer for the helper and tests. Obtain a full checkout:

```bash
git clone https://github.com/kwei-k/AIGC-Tech.git
cd AIGC-Tech
node --version
```

There are no package dependencies to install. You can run `npm test` to check the
checkout. Reading the manual and asking an agent to use a Skill do not require Node.

## 1. Choose a Skill

| Your task | Skill | What you receive |
|---|---|---|
| Choose a technique for a shot | [aigc-technique-router](../../skills/aigc-technique-router/SKILL.md) | A route through T0–T5 and a first attempt |
| Plan a shot that needs separate elements and compositing | [multistep-video-planner](../../skills/multistep-video-planner/SKILL.md) | Steps, input assets, prompt specifications, and QA gates |
| Plan a ComfyUI denoise or relight pass | [comfyui-denoise-pass](../../skills/comfyui-denoise-pass/SKILL.md) | A node sequence and parameter starting points |
| Write a video prompt from a current brief | [write-video-prompt](../../skills/write-video-prompt/SKILL.md) | One prompt with explicit reference roles and motion before look |

In a checkout of this repository, you can ask an agent explicitly:

```text
Read skills/aigc-technique-router/SKILL.md and use it to plan this shot:
a six-second product shot with a slow orbit. The product must match my reference.
I also want you to write the prompt once for Dreamina CLI.
```

This works without assuming that the agent has already installed the Skills. Give
it access to the checkout so it can read the referenced documents.

## 2. Choose whether to write the prompt

**Keep my prompt.** When your wording is already final, say so. The agent can help
assign asset roles and prepare a tool request while keeping the prompt unchanged.

```text
Keep this prompt exactly: "Eye-level medium shot, slow dolly-in; the model takes
two measured steps toward camera; her jacket moves gently; soft side light."
Target: Dreamina CLI. This image is the first frame. Prepare the request only.
```

**Write it once.** Supply the current intent and reference roles. The writing
template turns the brief into visible camera, subject, scene, and lighting direction.

```text
Read skills/write-video-prompt/SKILL.md and write one prompt for Dreamina CLI.
Intent: a very elegant young woman walking toward camera, restrained luxury ad.
Image A defines the person; image B defines wardrobe; image C is composition only.
Five seconds. Write in English, with slow camera movement and a continuous action.
```

The same choice can accompany a router or planner request. For a multistep plan,
specify which current generation step needs a prompt, such as the background plate
or the character pass. Each prompt uses that step's brief and inputs.

The writer does not score generated videos, compare prompt versions, or run a
refinement loop. Its generic copy format is a positive paragraph followed by a
compact `Negative:` line. A target tool's request format is a separate concern;
see [tool adaptation](08-seedance-and-dreamina.md) before submitting either part.

## 3. Prepare an offline request

First finish the prompt with the agent, or supply your own final wording. Then edit
a copy of the illustrative [request JSON](../../examples/video-request.json) with
your target, final prompt, model, parameters, and assets. Run from the repository root:

```bash
node scripts/prepare-video-request.mjs --input examples/video-request.json
```

For the API target, use the separate illustrative
[Seedance request](../../examples/seedance-api-request.json):

```bash
node scripts/prepare-video-request.mjs --input examples/seedance-api-request.json
```

The helper reads JSON and prints a prepared request. It does not call an LLM, write
a prompt, upload assets, submit a job, or spend generation credits. It needs no API
credentials for preparation. The keep/write choice belongs to the Skill; the helper
always requires finalized text, not a writing-mode flag.

The input describes:

- `target`: `dreamina` or `seedance-api`;
- `prompt`: your final text, preserved exactly;
- `model`, `duration`, `resolution`, and optionally `ratio`;
- `assets`: each asset's `type`, `source`, and explicit `roles`.

Dreamina assets use local paths; this helper's API assets use HTTPS URLs. CLI
aliases and API model IDs are different. The supported values and media mappings
are listed in [08](08-seedance-and-dreamina.md).

Read the output before using it. For Dreamina, it contains a command argument array;
for Seedance API, it contains an endpoint and request body. Submit only the `body`
field as the API payload, not the entire preview object. Asset bindings explain
which uploaded reference each label identifies. Warnings explain what still needs
attention. An argument array is structured data, not a shell command to paste by
joining its values with spaces.

Preparation supports text-only input, one explicit first frame, an explicit
first/last-frame pair, or semantic references. Middle-frame and multiframe workflows
need manual tool-specific handling in this version. See the supported modes and
reference limits in [08](08-seedance-and-dreamina.md).

Validation covers request structure. It does not check that asset files exist or
inspect their duration, dimensions, or format. Relative Dreamina asset paths resolve
from the directory where the eventual CLI command runs, not the JSON file's directory.

The helper also cannot check that your account can use a model or that the resulting
video will satisfy the brief. Use your external tool's authentication, submission,
status, and download workflow when you are ready to generate. A prepared request is
not a video result.

## 4. Install without losing the reference documents

For all four Skills, a full repository checkout is the simplest starting point.
The router, planner, and denoise Skill refer to documents outside their own
directories. Copying only those `SKILL.md` files loses the required context.

The prompt writer can also be installed on its own. Copy the complete
`skills/write-video-prompt/` directory, including `references/` and `agents/`, into
the Skill directory used by your agent. Check for an existing installation first;
compare or back it up before replacing it. Follow the agent's own installation
instructions for the destination path and discovery behavior.

In Codex, after the writer is installed and discoverable, an explicit invocation is:

```text
$write-video-prompt Write one English prompt for this five-second shot. The image
is a composition reference only. Use a slow dolly-in and restrained subject motion.
```

The independently installed writer can provide a text handoff to your tool.
Installing it alone does not install the offline helper. Run that helper from a
repository checkout containing `scripts/` and `examples/`.

## 5. Examples now, video cases next

The JSON examples demonstrate request preparation. They are illustrative inputs,
not evidence of a paid generation run or a finished production shot.

Future cases should connect the director brief, reference roles, final prompt,
tool/model version, parameters, and an externally hosted result. Start with a
text-only shot, a first-frame shot, a first/last-frame product shot, and a
multi-reference shot. Record what was actually tested and any visible limitations;
see [contribution rules](../../CONTRIBUTING.md).
