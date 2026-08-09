# Motion-First Video Prompt Template

This is a writing template for a single prompt. It does not review generated results,
diagnose failures, compare versions, or maintain revision state.

## Contents

1. Template
2. Intent
3. Reference roles
4. Camera movement
5. Subject motion
6. Scene motion
7. Look and finish
8. Positive and Negative
9. Language
10. Validation
11. Examples

## 1. Template

Fill the positive prompt in this order:

```text
[REFERENCE BINDINGS, when references exist]
[CAMERA MOVEMENT];
[SUBJECT MOTION];
[SCENE MOTION];
[LOOK AND FINISH];
[CONTINUITY, only when essential].
Negative: [COMPACT FAILURE RESTRICTIONS]
```

Render the filled fields as one continuous paragraph. Do not print the bracketed field
names.

## 2. Intent

Interpret the user's words by their visible consequence.

- Convert a mood or adjective into observable posture, timing, movement, composition,
  light, and material behavior.
- Preserve explicit director instructions.
- Distinguish required facts from details that may be inferred.
- Remove invisible backstory that does not change the shot.
- Use one visible consequence per retained modifier.

For example, "elegant" should change camera speed, posture, gait, gaze, balance, fabric
response, and light. Repeating "elegant, graceful, refined, sophisticated" does not add
equivalent control.

## 3. Reference roles

Every supplied reference must have at least one explicit role:

| Role | What it means |
|---|---|
| `first_frame` | Opening pose, framing, and spatial state |
| `middle_frame` | Required intermediate state |
| `final_frame` | Ending pose, framing, and spatial state |
| `composition_reference` | Layout, balance, and blocking only |
| `camera_reference` | Viewpoint, height, lens feel, or camera path |
| `action_reference` | Pose, gesture, gait, or motion path |
| `look_reference` | Lighting, palette, contrast, texture, or finish |
| `character_identity` | Face, body identity, silhouette, or design |
| `wardrobe_reference` | Garment, styling, accessories, or material |
| `ui_packaging_reference` | Interface, product pack, label, logo, or graphic system |

One reference may have multiple roles, but each role must be stated. Do not treat a
`composition_reference` as a frame anchor unless the user explicitly assigns both
roles.

When writing bindings:

- say what each reference controls;
- avoid importing unrelated background, clothing, pose, or color from that reference;
- keep character identity separate from wardrobe;
- keep product/UI/packaging identity separate from look.

Use a compact opening clause such as:

```text
Reference A defines character identity and wardrobe; Reference B controls composition
only; Reference C defines lighting and color.
```

## 4. Camera movement

Write the camera clause first. Select only the variables that matter:

- camera height and angle;
- shot size and lens feel;
- path, axis, and screen direction;
- speed and acceleration;
- stabilization character;
- pan, tilt, roll, dolly, truck, crane, orbit, follow, or whip behavior;
- handheld amplitude, footstep bounce, horizon roll, and motion blur when intentional.

Prefer one dominant move plus one supporting behavior. Use physically compatible
operations. State a static camera explicitly when it must not move.

## 5. Subject motion

Describe the subject as a continuous physical action:

- direction and speed;
- step length, rhythm, balance, and center-of-gravity shift;
- relevant hand, arm, leg, torso, head, expression, and gaze behavior;
- opening state, transition, and ending state;
- interaction timing when another person, prop, product, or surface is involved.

Use visible verbs. Do not substitute a performance adjective for body mechanics.

## 6. Scene motion

Describe environmental motion independently from the subject:

- hair, fabric, wind, smoke, rain, dust, reflections, crowds, vehicles, or screens;
- foreground and background parallax;
- contact effects and environmental response;
- timing and intensity relative to camera and subject speed.

Do not add scene motion merely to make the prompt sound cinematic.

## 7. Look and finish

Write look after all motion clauses:

- light direction, softness, contrast, and exposure behavior;
- palette and atmosphere;
- lens character, depth of field, shutter feel, motion blur, grain, and texture;
- skin, fabric, product, UI, or packaging treatment;
- advertising finish and continuity when relevant.

Avoid redundant aesthetic synonyms. Every modifier should change a visible property.

## 8. Positive and Negative

Describe the desired behavior positively whenever possible:

```text
Instead of: no shaky camera
Write: stable low-amplitude handheld follow
```

Put only compact failure restrictions in `Negative:`. Choose risks relevant to the
current shot, such as identity drift, anatomy errors, foot sliding, camera jitter,
unintended cuts, temporal flicker, frame warping, unreadable text, or duplicate limbs.
Do not paste a generic negative list into every prompt.

## 9. Language

- Render in the language explicitly requested by the user.
- If none is requested, mirror the user's working language.
- Keep established camera and production terms in English when they are clearer.
- A fully English prompt is valid.
- Keep asset filenames and required model syntax unchanged.
- Language changes must not alter reference roles or motion order.

## 10. Validation

Before returning the prompt, verify:

1. Every supplied reference has a stated role.
2. A composition reference was not promoted to a frame anchor.
3. Camera movement appears before subject and scene motion.
4. Camera operations are physically compatible.
5. Subject action has direction, timing, and continuity.
6. Scene motion is distinct from subject motion.
7. Look modifiers appear last and do not replace motion instructions.
8. The positive paragraph does not contain a large prohibition list.
9. `Negative:` contains only relevant failure restrictions.
10. The output can be copied directly without removing commentary.

## 11. Examples

### Minimal brief

Input:

```text
非常优雅的女孩
```

Output:

```text
Eye-level medium full shot, a slow steady dolly-in with subtle lateral tracking, clean horizon and restrained motion blur; a poised young woman walks diagonally toward camera at a measured pace, shoulders relaxed, spine tall, short even steps, controlled weight transfer, one hand lightly guiding her skirt, calm expression and focused gaze continuing smoothly through the shot; her hair and soft fabric respond gently to the movement while the background holds slow natural parallax; soft directional key light, refined neutral palette, delicate highlight roll-off, shallow depth of field, polished luxury-advertising finish.
Negative: identity drift, stiff gait, foot sliding, abrupt gesture changes, exaggerated posing, camera jitter, horizon wobble, temporal flicker, warped hands, duplicate limbs
```

### Multiple references

Input roles:

```text
Reference A = character identity + wardrobe
Reference B = composition reference only
Reference C = look reference
```

Prompt opening:

```text
Reference A defines the woman's identity and wardrobe; Reference B controls composition only and is not a frame anchor; Reference C defines soft directional lighting, neutral color, and delicate highlight roll-off.
```
