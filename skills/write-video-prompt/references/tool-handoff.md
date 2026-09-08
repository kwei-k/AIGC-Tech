# Preparing a video-tool handoff

Read this only when the user asks for API/CLI-ready output. Keep the writing
decision separate from transport: write produces a new prompt once; keep preserves
the supplied text exactly.

## Handoff contract

Collect the target, explicit model, duration, resolution, final prompt, and ordered
assets. Assign each asset a media type, source, and one or more creative roles.
Ask only for missing facts that affect the request. Keep supplied asset paths and
URLs unchanged; do not invent uploaded asset IDs or real files.

When the full AIGC-Tech checkout is available, its
`scripts/prepare-video-request.mjs --input <request.json>` command validates this
contract and prints an offline request. Locate it relative to the repository root,
not the agent's installation directory. The standalone writing Skill intentionally
does not bundle a generator or require this helper.

If the helper is unavailable, return the same information as a textual handoff.
Do not claim it was programmatically validated. Do not submit or upload as a side
effect of preparing it.

## Dreamina command selection

| Explicit input semantics | Command |
|---|---|
| No assets | `dreamina text2video` |
| One opening-frame image | `dreamina image2video --image` |
| Opening and ending images | `dreamina frames2video --first ... --last ...` |
| Identity, composition, look, action, or mixed-media references | `dreamina multimodal2video` |

For multimodal input, use repeated `--image`, `--video`, and `--audio` arguments.
At least one image or video is required. Never select image2video solely because
there is one image: its `--image` flag means first frame.

`multiframe2video` is a separate story-between-images workflow. It does not expose
the same model/resolution overrides in the inspected help. The repository helper
does not implement it; do not emulate middle-frame control by relabeling a reference.

The locally inspected CLI build is `1dcd265` (build date 2026-04-22). Help checked on
2026-09-08 lists Seedance 2.0 family video modes with 4–15 seconds and 720p. For
image2video and frames2video, the image determines ratio; no ratio flag is exposed.
These are local-help observations, not paid-generation results or universal model
limits. Re-check `dreamina <command> --help` before using a different CLI version.

## Seedance API mapping

The offline helper supports the Beijing Ark task endpoint:
`POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`.
Use the exact model ID `doubao-seedance-2-0-260128` or
`doubao-seedance-2-0-fast-260128`; Dreamina's CLI aliases are not API model IDs.

The request body contains `model`, `content`, `duration`, `resolution`, and an
optional `ratio`. The first content item is `{ "type": "text", "text": <prompt> }`.
Each media item has a type such as `image_url`, a same-named object containing
`url`, and a native `role`:

| Creative role | Native API role |
|---|---|
| Opening frame | `first_frame` |
| Ending frame (`final_frame` in this repository) | `last_frame` |
| Image used for identity, wardrobe, composition, action, camera, or look | `reference_image` |
| Video used for motion or look | `reference_video` |
| Audio used for sound | `reference_audio` |

Specific creative purposes remain in the prompt or human binding notes; native
`reference_image` does not distinguish a wardrobe reference from a look reference.
Keep mode must report any missing binding text rather than rewriting the prompt.

The helper intentionally implements a limited profile: 4–15 seconds, 720p, up to
9 image / 3 video / 3 audio references, HTTPS media URLs, and separate frame/reference
modes. These are the helper's limits, not a complete API capability catalog. It does
not upload local files, accept Asset IDs/base64, fetch media, or verify account access.
Authentication belongs to the external API client, never the input JSON.

Sources checked on 2026-09-08:
[official SDK task body](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/resources/content_generation/tasks.py),
[official Ark CLI native roles](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-gen/references/arkcli-gen.md),
[official model identifiers](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-models/references/arkcli-models-scenario-table.md).

## Prompt and constraint transport

The plain-text template's `Negative:` line does not establish an API field. None
of the inspected Dreamina commands exposes an independent negative-prompt flag.

- In write mode for a tool handoff, express constraints positively where possible.
  Keep any remaining restrictions in a separate human note unless the target's
  documented input supports them; explain what is not transmitted.
- In keep mode, preserve the complete supplied prompt. If it already includes a
  literal `Negative:` line, it remains ordinary prompt text, with no claim of
  special negative conditioning.
- Do not add `negative_prompt`, `--negative`, or unsupported control keys to a
  request. Never drop a user constraint silently.

The helper's argument array is data, not a shell command string. Each prompt or path
stays one argument, even if it contains spaces, quotes, dollar signs, or newlines.
Do not concatenate it into a command or feed it to `eval`.

## Completion means different things at each stage

An offline prepared request has not been uploaded or submitted. A task ID from an
external generator means the service accepted a task; it is not evidence that a
video finished. Dreamina uses `submit_id` and `query_result`; a Seedance API uses
its own task-response schema. Use each tool's current status documentation, and
only call a result generated after a completed status and an actual result exist.
