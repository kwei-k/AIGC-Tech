import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const models = new Set([
  "seedance2.0", "seedance2.0fast", "seedance2.0_vip", "seedance2.0fast_vip"
]);
const apiModels = new Set(["doubao-seedance-2-0-260128", "doubao-seedance-2-0-fast-260128"]);
// A deliberately small interoperability profile, not the vendor's full capability catalog.
const apiEndpoint = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";
const ratios = new Set(["1:1", "3:4", "16:9", "4:3", "9:16", "21:9"]);
const rolesByType = {
  image: new Set([
    "first_frame", "final_frame", "composition_reference", "camera_reference",
    "action_reference", "look_reference", "character_identity",
    "wardrobe_reference", "ui_packaging_reference"
  ]),
  video: new Set(["camera_reference", "action_reference", "look_reference"]),
  audio: new Set(["audio_reference"])
};
const types = ["image", "video", "audio"];

function checkObject(value, keys, location) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new Error(`${location} must be a plain object.`);
  }
  const allowed = new Set(keys);
  for (const key of Reflect.ownKeys(value)) {
    if (!allowed.has(key)) throw new Error(`Unknown ${location} field: ${String(key)}.`);
  }
}

function checkText(value, location) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0")) {
    throw new Error(`${location} must be a nonempty string without NUL characters.`);
  }
}

function checkAsset(asset, index, api) {
  const location = `assets[${index}]`;
  checkObject(asset, ["type", "source", "roles"], location);
  if (!types.includes(asset.type)) throw new Error(`${location}.type must be image, video, or audio.`);
  checkText(asset.source, `${location}.source`);
  if (api) {
    let url;
    try { url = new URL(asset.source); } catch { /* Report a scoped validation error below. */ }
    if (!url || url.protocol !== "https:" || !url.hostname || url.username || url.password ||
        /\s/.test(asset.source) || !asset.source.startsWith("https://")) {
      throw new Error(`${location}.source must be an HTTPS URL without embedded credentials for seedance-api; upload local files separately.`);
    }
  } else if (asset.source.trimStart().startsWith("-") ||
      /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(asset.source.trimStart())) {
    throw new Error(`${location}.source must be a local path, not a URL or flag-like value.`);
  }
  if (!Array.isArray(asset.roles) || asset.roles.length === 0) {
    throw new Error(`${location}.roles must explicitly describe this asset's purpose.`);
  }
  for (const role of asset.roles) {
    if (role === "middle_frame") {
      throw new Error("middle_frame is unsupported by this adapter; choose a supported mode explicitly.");
    }
    if (!rolesByType[asset.type].has(role)) {
      throw new Error(`Unsupported role ${String(role)} for ${location}.type ${asset.type}.`);
    }
  }
  if (new Set(asset.roles).size !== asset.roles.length) throw new Error(`${location}.roles contains duplicates.`);
  if (asset.roles.includes("first_frame") && asset.roles.includes("final_frame")) {
    throw new Error("first_frame and final_frame must be separate assets.");
  }
  return { type: asset.type, source: asset.source, roles: [...asset.roles] };
}

/**
 * Prepare an offline request preview from an already finalized prompt.
 * No files are uploaded, no commands are executed, and no generation is run.
 * Sources are not opened: Dreamina needs real local files, and the API needs
 * accessible HTTPS media URLs at execution. Neither credentials nor media are read.
 */
export function prepareVideoRequest(input) {
  checkObject(input, ["target", "prompt", "model", "duration", "resolution", "ratio", "assets"], "input");
  if (!["dreamina", "seedance-api"].includes(input.target)) {
    throw new Error("Supported targets: dreamina, seedance-api.");
  }
  const api = input.target === "seedance-api";
  checkText(input.prompt, "prompt");
  if (!(api ? apiModels : models).has(input.model)) {
    throw new Error(`Unsupported ${api ? "Seedance API" : "Dreamina"} model: ${String(input.model)}.`);
  }
  if (!Number.isInteger(input.duration) || input.duration < 4 || input.duration > 15) {
    throw new Error("duration must be an integer from 4 through 15 for this adapter profile.");
  }
  if (input.resolution !== "720p") throw new Error("resolution must be 720p for this adapter profile.");
  if (Object.hasOwn(input, "ratio") && !ratios.has(input.ratio)) {
    throw new Error(`ratio must be one of: ${[...ratios].join(", ")}.`);
  }
  if (Object.hasOwn(input, "assets") && !Array.isArray(input.assets)) throw new Error("assets must be an array.");
  const assets = Array.from(input.assets ?? [], (asset, index) => checkAsset(asset, index, api));
  const first = assets.filter((asset) => asset.roles.includes("first_frame"));
  const last = assets.filter((asset) => asset.roles.includes("final_frame"));
  if (first.length > 1 || last.length > 1) throw new Error("Only one first_frame and one final_frame are supported.");
  if (last.length && !first.length) throw new Error("final_frame requires a separate first_frame asset.");
  if (first.length && assets.length !== first.length + last.length) {
    throw new Error("Frame anchors cannot be mixed with separate reference assets in this adapter.");
  }
  const mode = first.length ? (last.length ? "frames2video" : "image2video") :
    assets.length ? "multimodal2video" : "text2video";
  if (!api && first.length && Object.hasOwn(input, "ratio")) {
    throw new Error("Frame modes infer their ratio from the input image; omit ratio.");
  }
  if (assets.length && assets.every((asset) => asset.type === "audio")) {
    throw new Error("Audio references require at least one image or video reference.");
  }
  const grouped = Object.fromEntries(types.map((type) => [type, assets.filter((asset) => asset.type === type)]));
  for (const [type, limit] of [["image", 9], ["video", 3], ["audio", 3]]) {
    if (grouped[type].length > limit) throw new Error(`At most ${limit} ${type} references are supported.`);
  }
  // Bindings follow actual CLI/API input order, including explicit frame anchors.
  const bindingGroups = first.length ? { image: [...first, ...last], video: [], audio: [] } : grouped;
  const bindings = types.flatMap((type) => bindingGroups[type].map((asset, index) => ({
    label: `${type[0].toUpperCase()}${type.slice(1)} ${index + 1}`,
    source: asset.source,
    roles: [...asset.roles]
  })));
  if (api) {
    const body = {
      model: input.model,
      content: [
        { type: "text", text: input.prompt },
        ...types.flatMap((type) => bindingGroups[type].map((asset) => ({
          type: `${type}_url`,
          [`${type}_url`]: { url: asset.source },
          role: asset.roles.includes("first_frame") ? "first_frame" :
            asset.roles.includes("final_frame") ? "last_frame" : `reference_${type}`
        })))
      ],
      duration: input.duration,
      resolution: input.resolution
    };
    if (Object.hasOwn(input, "ratio")) body.ratio = input.ratio;
    return {
      target: input.target, mode, method: "POST", endpoint: apiEndpoint,
      body, bindings,
      warnings: [
        "Offline request only: no API call, authentication, upload, or generation was performed.",
        "This adapter deliberately supports a subset: two Seedance 2.0 models, 4–15 seconds, 720p, HTTPS media URLs. Verify current model access and supported parameters before submitting.",
        "Specific creative roles in bindings are notes, not separate API controls. Describe them in the final prompt; this helper does not rewrite or inject binding text.",
        "Only request structure is checked; URL accessibility and media duration, dimensions, formats, and service limits are not checked."
      ]
    };
  }
  const args = [mode, "--prompt", input.prompt, "--model_version", input.model,
    "--duration", String(input.duration), "--video_resolution", input.resolution];
  if (Object.hasOwn(input, "ratio")) args.push("--ratio", input.ratio);
  if (mode === "image2video") args.push("--image", first[0].source);
  else if (mode === "frames2video") args.push("--first", first[0].source, "--last", last[0].source);
  else for (const type of types) {
    for (const asset of grouped[type]) args.push(`--${type}`, asset.source);
  }
  return {
    target: input.target,
    mode,
    executable: "dreamina",
    args,
    bindings,
    warnings: [
      "Adaptation is based on local Dreamina CLI help (1dcd265-dirty); verify your installed version and model access.",
      "Offline preview only: no generation was run. Supply real local files when executing with an argument array.",
      "Creative roles in bindings are notes, not CLI flags. Describe them in the final prompt; this helper does not rewrite or inject binding text.",
      "Only request structure is checked; file existence and media duration, dimensions, and formats are not checked."
    ]
  };
}

async function main(args) {
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
    process.stdout.write("Usage: node scripts/prepare-video-request.mjs --input <request.json>\n" +
      "Emit an offline Dreamina or Seedance API request preview as JSON; no uploads or generation.\n" +
      "The prompt is preserved exactly. Dreamina uses local paths; seedance-api uses HTTPS media URLs.\n");
    return;
  }
  if (args.length !== 2 || args[0] !== "--input" || !args[1]) {
    throw new Error("Usage: node scripts/prepare-video-request.mjs --input <request.json>");
  }
  const input = JSON.parse(await readFile(args[1], "utf8"));
  process.stdout.write(`${JSON.stringify(prepareVideoRequest(input), null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`prepare-video-request: ${error.message}\n`);
    process.exitCode = 1;
  });
}
