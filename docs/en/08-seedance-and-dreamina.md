# 08 — Seedance and Dreamina Tool Adaptation

[中文版本](../zh/08-seedance-and-dreamina.md)

Choose the production technique with the [decision framework](00-decision-framework.md),
then match your prompt and assets to a tool's supported inputs. Seedance is a model
family; a Seedance API and Dreamina CLI expose different identifiers, parameters,
and task workflows. A CLI alias is not automatically an API model ID.

This chapter covers a single handoff: an optional fresh prompt, explicit asset
roles, and a prepared request. Follow the [usage guide](09-usage-guide.md) for
invocation and offline preparation.

## 1. Select the input mode from the reference roles

| Inputs and intended use | Dreamina command | Offline helper |
|---|---|---|
| A prompt, no assets | `dreamina text2video` | Supported |
| One image explicitly assigned as the opening frame | `dreamina image2video --image` | Supported |
| Separate opening and ending images | `dreamina frames2video --first … --last …` | Supported |
| Identity, wardrobe, composition, look, action, or mixed-media references | `dreamina multimodal2video` | Supported |
| A story linked through multiple images | `dreamina multiframe2video` | Manual workflow; not implemented by the helper |
| A required hard middle-frame anchor | Check the selected tool's current documentation | Rejected by the helper |

The meaning of an image matters more than the number of images. A single
composition reference belongs in a reference workflow. Passing it to
`image2video --image` would make it the opening frame, changing the brief.

The helper also rejects a final frame without a first frame, and frame anchors
mixed with additional semantic reference assets. That is a boundary of this
helper's supported modes, not a claim that every model has the same limitations.
Choose a documented manual workflow if your shot needs a different combination.

## 2. Keep the creative roles visible

Describe what each asset controls before preparing the request:

```text
Image 1 defines character identity; Image 2 defines wardrobe only;
Image 3 controls composition only; Video 1 supplies the camera path.
```

These are readable labels for ordered assets. They are not uploaded asset IDs or
guaranteed UI mention tokens. Use the selected tool's documented syntax where it
requires one, and keep the prompt labels consistent with the actual asset order.

- `character_identity` does not automatically copy wardrobe or background.
- `composition_reference` does not imply `first_frame` or `final_frame`.
- A motion video can supply action or camera movement without importing its cast.
- An audio reference needs a stated purpose, such as voice, music, or rhythm.
- A product or UI reference identifies the design; it does not guarantee exact
  typography throughout a generated clip.

The helper's `bindings` list gives the actual labels and input order. Use it to
check a finished prompt before submission. The helper preserves your prompt text;
it does not rewrite an incorrect asset label.

## 3. Choose whether to write

If the user supplies final wording, **keep** it exactly. If the user asks for help
writing, **write** one prompt from the current brief using
[the motion-first template](07-motion-first-video-prompt-template.md).

For a first-frame shot, describe the movement from the visible opening state.
For first/last frames, describe the continuous transition between those states.
For reference-led input, bind the relevant identity, wardrobe, action, and look
before describing the shot. Within each shot, AIGC-Tech uses camera → subject →
scene → look; this is the repository's writing convention, not an API requirement.

Add timing, dialogue, or sound relationships only when the brief needs them. A
sound instruction in the prompt does not establish that a selected endpoint has
an audio-generation switch. Keep model, duration, resolution, and ratio in the
request settings; writing a resolution in prose cannot enable an unsupported one.

### What happens to Negative?

The generic writing template uses a separate `Negative:` line for the reader.
That format does not create a `negative_prompt` API field or a CLI flag. None of
the inspected Dreamina commands exposes a separate negative-prompt argument.

For a new tool-ready prompt, express constraints positively where possible and
keep any remaining restrictions in a human note if the target has no documented
place for them. State which notes are not transmitted. When keeping a supplied
prompt, a literal `Negative:` line stays in the text unchanged; it is ordinary
prompt text, without a claim of separate negative conditioning.

## 4. Dreamina CLI profile

The inspected local build reports commit `1dcd265`, version `1dcd265-dirty`, and
build time `2026-04-22T08:12:54Z`. Its help was checked on **2026-09-08**.

The helper supports the inspected aliases `seedance2.0`, `seedance2.0fast`,
`seedance2.0_vip`, and `seedance2.0fast_vip`, with integer durations of 4–15 seconds
and `720p`. Model aliases and account access must be checked against your installed
CLI. This is a supported preparation profile, not a promise that every account can
generate with every alias.

The command arguments are `--prompt`, `--model_version`, `--duration`, and
`--video_resolution`. Text and multimodal modes can also use `--ratio` with `1:1`,
`3:4`, `16:9`, `4:3`, `9:16`, or `21:9`. First-frame and first/last-frame modes infer
ratio from the input image; omit `ratio` for those helper inputs.

Multimodal mode uses repeated `--image`, `--video`, and `--audio` arguments. The
helper requires local asset paths and at least one image or video when audio is
present. It allows up to nine images, three videos, and three audio references.
It does not inspect media files to verify their duration, format, or dimensions.

Re-check a different build with read-only help before adapting its parameters:

```bash
dreamina --version
dreamina image2video --help
dreamina multimodal2video --help
```

`multiframe2video` is a distinct workflow. Do not treat it as another spelling of
multimodal references, or assume that it accepts the same model/resolution flags.

## 5. Seedance API profile

Set `target` to `seedance-api`. This helper prepares a `POST` request to:

```text
https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
```

The address and request fields follow the official SDK's
[task client](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/resources/content_generation/tasks.py)
and [regional endpoint definitions](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/_constants.py).

The supported API model IDs are `doubao-seedance-2-0-260128` and
`doubao-seedance-2-0-fast-260128`. They are separate from the CLI aliases above.
Both IDs appear in the official [Ark CLI model scenario table](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-models/references/arkcli-models-scenario-table.md).
The helper deliberately limits both targets to a 4–15-second, `720p` preparation
profile. This is not the complete capability list of the native API or proof of
account access to either model.

The output contains an endpoint and a body with `model`, `content`, `duration`,
`resolution`, and optional `ratio`. The first `content` item is
`{"type":"text","text":"<your exact final prompt>"}`. Media items follow it:

| Creative input | API content type | API role |
|---|---|---|
| `first_frame` image | `image_url` | `first_frame` |
| `final_frame` image | `image_url` | `last_frame` |
| Image used for identity, wardrobe, composition, action, or look | `image_url` | `reference_image` |
| Motion, camera, or look video | `video_url` | `reference_video` |
| `audio_reference` audio | `audio_url` | `reference_audio` |

For example, an image item has `image_url: {"url": "<asset HTTPS URL>"}`. Creative
roles such as wardrobe or composition remain explained in the prompt; they are not
invented API role values. `final_frame` is the helper's input term and is mapped to
the API's `last_frame`.

These media shapes and native roles follow the official
[SDK content types](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/types/content_generation/create_task_content_param.py)
and [Ark CLI generation input reference](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-gen/references/arkcli-gen.md),
checked on 2026-09-08. Ark CLI is a source for native API inputs here, not an alias
for Dreamina CLI.

This helper accepts **HTTPS URLs only** for API media. It does not upload local
files, resolve asset IDs, or encode base64 inputs. Those are preparation boundaries,
not claims that the native service forbids other input methods. The per-type limits
are nine images, three videos, and three audio references; the helper does not
inspect those URLs or validate media properties.

Unlike the inspected CLI frame commands, the API request schema includes `ratio`.
The helper permits its optional field for frame modes as well; actual output behavior
still follows the selected model and service. No independent `negative_prompt` field
is emitted by this supported schema. A literal `Negative:` in supplied text remains
part of the text item.

Run the illustrative API example without authentication or network access:

```bash
node scripts/prepare-video-request.mjs --input examples/seedance-api-request.json
```

This prints a request preview; only its `body` field is the API request body.
Do not POST the whole preview object. Authentication and submission belong to the
external API client when you choose to generate.

## 6. Check the handoff before generation

The [offline helper](../../scripts/prepare-video-request.mjs) receives your final
prompt and explicit assets. Review the selected mode, model, asset bindings, and
warnings. Dreamina output contains an executable name and separate argument values;
do not turn them into an unquoted shell string or pass them to `eval`.

Request preparation does not authenticate, upload, or submit anything. Use the
external tool's documented task lifecycle to generate and retrieve a result.
A submitted task ID only shows that a task was accepted. For example, Dreamina's
`submit_id` and `query_result` belong to its own workflow; do not assume a Seedance
API uses the same response fields. Call a video generated only after the tool reports
completion and an actual result is available.

## Sources and verification scope

The [official Seedance 2.0 series prompt guide](https://docs.byteplus.com/api/docs/ModelArk/2222480)
is the source for explicit subject/asset binding and chronological shot descriptions.
The motion-first order and optional keep/write behavior are AIGC-Tech conventions.

The requested [Volcengine guide](https://docs.volcengine.com/docs/82379/2607689?lang=zh)
returned a JavaScript shell when retrieved; its full text has not been verified.
This chapter does not claim to reproduce that page or certify Seedance 2.5 support.
CLI observations above come from local help, not from a paid-generation test.
