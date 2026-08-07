# Motion-First Video Prompt Contract

This document is normative. The keywords **MUST**, **SHOULD**, and **MAY** express
requirement levels.

## 1. Compilation model

A prompt is a rendered control sequence, not prose. Compile the request through this
language-neutral intermediate representation:

```text
ShotIntent {
  communication_goal
  shot_function
  duration_and_format
  camera_motion
  subject_motion
  scene_motion
  look
  continuity
  reference_bindings[]
  hard_constraints[]
  soft_preferences[]
  observed_model_failures[]
}
```

The compiler MUST preserve hard constraints, MAY infer soft details, and MUST NOT
invent a reference binding.

## 2. Intent resolution

Interpret the user's words by their visible consequence:

- Convert mood adjectives into observable behavior, composition, timing, light, and
  material response.
- Separate the communication goal from the literal objects in the request.
- Distinguish a shot requirement from a preference.
- Preserve approved facts from the storyboard, director note, reference, and previous
  successful generation.
- Convert model feedback into the smallest responsible revision. Face drift changes
  identity/continuity controls; weak motion changes motion clauses; a wrong viewpoint
  changes the camera clause.

If a missing fact would alter the physical shot or misuse a reference, ask one concise
question. Otherwise use conservative defaults and continue.

## 3. Reference-role type system

Every supplied reference MUST have at least one explicit role:

| Role | Meaning | Binding rule |
|---|---|---|
| `first_frame` | Exact or close opening state | Controls opening pose, framing, and spatial state |
| `middle_frame` | Required intermediate state | Controls a timed transition point, not the opening |
| `final_frame` | Exact or close ending state | Controls destination pose, framing, and spatial state |
| `composition_reference` | Layout, balance, or blocking only | MUST NOT become a frame anchor implicitly |
| `camera_reference` | Viewpoint, height, lens feel, or camera path | Does not bind identity or wardrobe |
| `action_reference` | Pose, gesture, gait, or motion path | Does not bind appearance unless separately assigned |
| `look_reference` | Lighting, palette, contrast, texture, or finish | Does not bind composition unless separately assigned |
| `character_identity` | Face, body identity, silhouette, or design | Preserve across all generated frames |
| `wardrobe_reference` | Garment, styling, accessories, or material | Bind independently from character identity |
| `ui_packaging_reference` | Interface, product pack, label, logo, or graphic system | Preserve legibility, orientation, and placement as specified |

One image MAY carry multiple roles, but each role MUST be stated. If the role is
unknown, use `unresolved` internally and ask before generation. Never relabel
`composition_reference` as `first_frame` or `final_frame` without user evidence.

## 4. Canonical clause order

Render positive prompt clauses in this order:

```text
REFERENCE BINDINGS
→ CAMERA MOVEMENT
→ SUBJECT MOTION
→ SCENE MOTION
→ LOOK AND CAPTURE CHARACTER
→ CONTINUITY / DELIVERY CONSTRAINTS
```

### 4.1 Camera movement

The camera clause MUST make the viewpoint executable. Select only the attributes that
matter:

- camera height and angle;
- shot size and lens feel;
- path and axis;
- screen direction;
- speed and acceleration;
- stabilization character;
- pan, tilt, roll, dolly, truck, crane, orbit, follow, or whip behavior;
- handheld amplitude, footstep bounce, horizon roll, and motion blur when intentional.

Combine only physically compatible operations. Prefer one dominant move plus one
supporting behavior. Describe a static camera explicitly when the camera must not move.

### 4.2 Subject motion

The subject clause SHOULD specify:

- travel direction and speed;
- step length, rhythm, balance, and center-of-gravity shift;
- hand, arm, leg, torso, head, facial, and eye behavior that matters;
- start state, transition, and end state;
- interaction timing and continuity across the shot.

Use visible verbs. Replace "acts elegantly" with concrete posture, gait, gaze, timing,
and fabric behavior.

### 4.3 Scene motion

Describe secondary motion independently from the subject:

- wind, fabric, hair, smoke, rain, dust, reflections, crowds, vehicles, screens, or
  product elements;
- parallax and foreground/background response to the camera;
- contact effects and environmental reactions;
- relative timing and intensity.

Do not let ambient motion contradict the subject or camera speed.

### 4.4 Look and capture character

Add look only after motion is solved:

- light direction, softness, contrast, exposure behavior, palette, and atmosphere;
- lens characteristics, depth of field, shutter feel, motion blur, grain, and texture;
- commercial finish, material fidelity, skin treatment, product readability, and
  continuity requirements.

Avoid redundant aesthetic synonyms. Every modifier SHOULD change a visible property.

## 5. Positive and negative allocation

The positive paragraph SHOULD describe the desired state. Convert a prohibition into a
positive alternative when possible:

```text
Avoid: "no shaky camera"
Prefer: "stable low-amplitude handheld follow"
```

Keep only failure-oriented constraints in a final `Negative:` line. Typical categories
include identity drift, anatomy corruption, unintended cuts, temporal flicker, frame
warping, unreadable text, duplicate limbs, unwanted camera shake, and reference-role
leakage. Do not repeat positive direction in `Negative:`.

## 6. Language rendering

The intermediate representation has no natural-language preference.

- Render in the language explicitly requested by the user.
- If none is requested, mirror the user's working language while preserving established
  production terms in English where they reduce ambiguity.
- MAY render fully in English when the target model or user workflow benefits from it.
- Keep reference roles, camera physics, motion timing, and constraints semantically
  identical across languages.
- Do not translate stable model syntax, parameter names, asset filenames, or tokens that
  the target system expects verbatim.

## 7. Default output grammar

```text
<one copy-ready positive prompt paragraph>
Negative: <compact comma-separated failure constraints>
```

The positive paragraph MUST remain in the canonical clause order. It MAY include
reference bindings as its opening sentence. Do not emit the intermediate
representation, rationale, alternatives, or model settings unless requested.

## 8. Validation gates

Before returning the prompt, verify:

1. Every supplied reference has an explicit role.
2. A composition reference was not promoted to a frame anchor.
3. Camera movement appears before subject and scene motion.
4. Camera operations are physically compatible.
5. Subject action has direction, timing, and continuity.
6. Scene motion is distinct from subject motion.
7. Look modifiers do not replace motion instructions.
8. Hard constraints survived compression.
9. The positive paragraph contains no large prohibition list.
10. `Negative:` contains only observed or high-risk failure modes.
11. The result can be copied directly without editing out commentary.

## 9. Minimal-brief example

Input:

```text
非常优雅的女孩
```

Resolved intent: elegance must be visible through controlled camera speed, posture,
gait, gaze, balance, fabric response, and restrained light—not through repeated
adjectives.

Default English rendering:

```text
Eye-level medium full shot, a slow steady dolly-in with subtle lateral tracking, clean horizon and restrained motion blur; a poised young woman walks diagonally toward camera at a measured pace, shoulders relaxed, spine tall, short even steps, controlled weight transfer, one hand lightly guiding her skirt, calm expression and focused gaze continuing smoothly through the shot; her hair and soft fabric respond gently to the movement while the background holds slow natural parallax; soft directional key light, refined neutral palette, delicate highlight roll-off, shallow depth of field, polished luxury-advertising finish.
Negative: identity drift, stiff gait, foot sliding, abrupt gesture changes, exaggerated posing, camera jitter, horizon wobble, temporal flicker, warped hands, duplicate limbs
```
