# workflows/

Example ComfyUI workflow JSONs referenced by
[docs/en/05-comfyui-integration.md](../docs/en/05-comfyui-integration.md).

## Convention

- One workflow per pattern, named after the recipe: `p1-denoise-relight.json`,
  `p2-latent-merge.json`, `p3-upscale-detail.json`, `p4-depth-pose-extract.json`.
- Each `.json` ships with a companion `.md` of the same name stating: the pattern it
  implements, required inputs, the checkpoint family it was built against (no version
  pinning — note "as of 2026, check current docs" where behavior is version-sensitive),
  and the approval checklist from the corresponding recipe in doc 05.
- Workflows must load with stock nodes plus, where noted, `comfyui_controlnet_aux`.

No workflows are committed yet — this directory establishes the convention.
Contributions welcome: see [CONTRIBUTING.md](../CONTRIBUTING.md).
