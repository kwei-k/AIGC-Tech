# workflows/

Contribution contract for future ComfyUI workflow JSONs referenced by
[docs/en/05-comfyui-integration.md](../docs/en/05-comfyui-integration.md).

**Current status:** no executable workflow JSON is committed yet. The written P1–P4
recipes are guidance, not a claim that a graph in this directory has been load-tested.

## Convention

- One workflow per pattern, named after the recipe: `p1-denoise-relight.json`,
  `p2-latent-merge.json`, `p3-upscale-detail.json`, `p4-depth-pose-extract.json`.
- Each `.json` ships with a companion `.md` of the same name stating: the pattern it
  implements, required inputs, the checkpoint family it was built against (no version
  pinning — note "as of 2026, check current docs" where behavior is version-sensitive),
  and the approval checklist from the corresponding recipe in doc 05.
- Workflows must load with stock nodes plus, where noted, `comfyui_controlnet_aux`.

Contributions welcome: see [CONTRIBUTING.md](../CONTRIBUTING.md). Remove the current
status notice only after at least one workflow and its companion note pass the loading
check described above.
