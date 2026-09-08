# Seedance writing scenarios

Use this reference only for a new prompt targeting Seedance or Dreamina. The
motion-first template remains the project's writing convention, not a claim that
the model requires one universal sentence order. Keep mode bypasses rewriting.

## Select the scenario from the supplied assets

| Scenario | What to write |
|---|---|
| Text only | Establish the subject and environment briefly; make camera and action physically readable. |
| First frame | Describe what happens from the visible opening state. Avoid re-describing every static detail. |
| First and final frames | Describe the continuous action between both states, direction, timing, and the ending pose. |
| Multiple references | Give each asset an explicit role; keep identity, wardrobe, composition, and look independent. |
| Motion video | Name the camera path or action to borrow and the subject it applies to. Do not implicitly import the source video's cast or setting. |
| Audio reference | State whether it supplies voice, music, or rhythm. Specify only the timing and sound relationships required by the brief. |

Within each shot, use reference bindings followed by camera, subject, scene, and
look. If the user requests multiple shots, organize them chronologically and use
the same motion order inside each shot. A request for one continuous shot must not
silently become several cuts. The default for an ordinary single shot remains one
copy-ready paragraph.

## Bind references before choosing a tool mode

Use stable, ordered labels such as Image 1, Image 2, Video 1, and Audio 1. Keep
those labels consistent with the actual upload/request order. They are readable
labels, not invented API asset IDs or guaranteed UI mention tokens. Follow the
selected tool's documented mention syntax if it supplies one.

For example: Image 1 defines the woman's identity; Image 2 supplies wardrobe only;
Video 1 supplies the walking rhythm and camera path. Then describe the woman's
motion using that same identity throughout.

- A composition image is not a first frame unless the user gives it both roles.
- A desired middle state is a creative requirement, not proof that an API supports
  a middle-frame parameter. Explain an unsupported hard anchor before a handoff.
- An identity-only image does not automatically bind its clothes or background.
- A product/UI reference defines the named design; exact typography or graphics
  may still need a separate finishing step when that precision is required.

## Timing and sound are conditional

Use a short sequence of visible actions when their order matters. Add timing only
where it resolves ambiguity, and fit it inside the selected duration. For a
requested transition, name when it happens and how the outgoing action connects
to the incoming action. Do not add cuts merely to make the text more elaborate.

If sound matters, identify who speaks, the exact dialogue, and relevant effects or
music. Avoid adding a voiceover to a silent brief. A written sound instruction is
not proof that the selected API/CLI exposes an audio generation switch.

Duration, ratio, resolution, and model selection belong in request settings. Keep
their control values separate from creative prose; writing "4K" cannot enable an
unsupported resolution.

## Source boundary

The [official Seedance 2.0 series prompt guide](https://docs.byteplus.com/api/docs/ModelArk/2222480)
supports explicit subject/asset binding and chronological shot descriptions. The
motion-first order and the keep/write behavior above are AIGC-Tech conventions.

The requested [Volcengine guide](https://docs.volcengine.com/docs/82379/2607689?lang=zh)
returned a JavaScript shell during retrieval; its full contents have not been
verified. This reference does not claim to reproduce that guide or certify Seedance
2.5 support. Check the target model's current manual before adding version-specific
capabilities. Source status recorded on 2026-09-08.
