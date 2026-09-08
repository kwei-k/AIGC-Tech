import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { prepareVideoRequest } from "../scripts/prepare-video-request.mjs";

const base = { target: "dreamina", prompt: "Slow dolly-in; the subject walks forward.",
  model: "seedance2.0", duration: 5, resolution: "720p" };
const asset = (roles, type = "image", source = "./reference.png") => ({ type, source, roles });
const prepare = (changes = {}) => prepareVideoRequest({ ...base, ...changes });

test("no assets selects text2video with verified flag names", () => {
  assert.deepEqual(prepare({ ratio: "16:9" }).args, [
    "text2video", "--prompt", base.prompt, "--model_version", "seedance2.0",
    "--duration", "5", "--video_resolution", "720p", "--ratio", "16:9"
  ]);
});

test("one composition image stays a semantic reference, not a first frame", () => {
  const result = prepare({ assets: [asset(["composition_reference"])] });
  assert.equal(result.mode, "multimodal2video");
  assert.equal(result.executable, "dreamina");
  assert.deepEqual(result.bindings, [{ label: "Image 1", source: "./reference.png", roles: ["composition_reference"] }]);
  assert.deepEqual(result.args.slice(-2), ["--image", "./reference.png"]);
});

test("explicit frame anchors select matching modes and preserve their identity roles", () => {
  const first = asset(["first_frame", "character_identity"], "image", "./first.png");
  const last = asset(["final_frame"], "image", "./last.png");
  assert.equal(prepare({ assets: [first] }).mode, "image2video");
  const result = prepare({ assets: [last, first] });
  assert.equal(result.mode, "frames2video");
  assert.deepEqual(result.args.slice(-4), ["--first", "./first.png", "--last", "./last.png"]);
  assert.deepEqual(result.bindings, [
    { label: "Image 1", source: "./first.png", roles: ["first_frame", "character_identity"] },
    { label: "Image 2", source: "./last.png", roles: ["final_frame"] }
  ]);
});

test("mixed references have deterministic type order and repeated individual flags", () => {
  const result = prepare({ assets: [asset(["audio_reference"], "audio", "./sound.wav"),
    asset(["action_reference"], "video", "./move.mp4"), asset(["character_identity"], "image", "./a.png"),
    asset(["look_reference"], "image", "./b.png")] });
  assert.deepEqual(result.bindings.map(({ label }) => label), ["Image 1", "Image 2", "Video 1", "Audio 1"]);
  assert.deepEqual(result.args.slice(-8), ["--image", "./a.png", "--image", "./b.png", "--video", "./move.mp4", "--audio", "./sound.wav"]);
});

test("prompt, whitespace and shell metacharacters remain literal argument values", () => {
  const prompt = "  中文 camera move\n'quotes' $(touch SHOULD_NOT_EXIST); `whoami`  ";
  const source = "./references/a 'space' $(whoami); `id`.png";
  const result = prepare({ prompt, assets: [asset(["composition_reference"], "image", source)] });
  assert.equal(result.args[result.args.indexOf("--prompt") + 1], prompt);
  assert.equal(result.args.at(-1), source);
  assert.equal(result.bindings[0].source, source);
});

const invalidCases = [
  ["unknown target", { target: "unknown-service" }, /Supported target/],
  ["unsupported model", { model: "seedance3.0" }, /Unsupported Dreamina model/],
  ["empty prompt", { prompt: "  " }, /prompt must/],
  ["NUL prompt", { prompt: "hello\0" }, /NUL/],
  ["short duration", { duration: 3 }, /duration/],
  ["long duration", { duration: 16 }, /duration/],
  ["fractional duration", { duration: 4.5 }, /duration/],
  ["string duration", { duration: "5" }, /duration/],
  ["unsupported resolution", { resolution: "1080p" }, /resolution/],
  ["unknown ratio", { ratio: "auto" }, /ratio/],
  ["non-array assets", { assets: null }, /assets must/],
  ["missing roles", { assets: [{ type: "image", source: "./a.png" }] }, /roles/],
  ["empty roles", { assets: [asset([])] }, /roles/],
  ["unknown role", { assets: [asset(["anything"])] }, /Unsupported role/],
  ["middle frame", { assets: [asset(["middle_frame"])] }, /middle_frame is unsupported/],
  ["video anchor", { assets: [asset(["first_frame"], "video")] }, /Unsupported role/],
  ["audio image role", { assets: [asset(["character_identity"], "audio")] }, /Unsupported role/],
  ["duplicate role", { assets: [asset(["look_reference", "look_reference"])] }, /duplicates/],
  ["final only", { assets: [asset(["final_frame"])] }, /requires.*first_frame/],
  ["one asset as both anchors", { assets: [asset(["first_frame", "final_frame"])] }, /separate assets/],
  ["duplicate anchors", { assets: [asset(["first_frame"]), asset(["first_frame"])] }, /Only one/],
  ["anchor mixed with reference", { assets: [asset(["first_frame"]), asset(["look_reference"])] }, /cannot be mixed/],
  ["anchor ratio", { ratio: "16:9", assets: [asset(["first_frame"])] }, /omit ratio/],
  ["all audio", { assets: [asset(["audio_reference"], "audio")] }, /at least one image or video/],
  ["URL source", { assets: [asset(["look_reference"], "image", "https://example.com/a.png")] }, /local path/],
  ["data source", { assets: [asset(["look_reference"], "image", "data:image/png;base64,AA")] }, /local path/],
  ["flag source", { assets: [asset(["look_reference"], "image", "--help")] }, /local path/],
  ["unknown API field", { negative_prompt: "blur" }, /Unknown input field/],
  ["unknown asset field", { assets: [{ ...asset(["look_reference"]), purpose: "first" }] }, /Unknown assets\[0\] field/]
];
for (const [name, changes, expected] of invalidCases) {
  test(`rejects ${name}`, () => assert.throws(() => prepare(changes), expected));
}

test("only supported model variants are retained without downgrade", () => {
  for (const model of ["seedance2.0", "seedance2.0fast", "seedance2.0_vip", "seedance2.0fast_vip"]) {
    const result = prepare({ model });
    assert.equal(result.args[result.args.indexOf("--model_version") + 1], model);
  }
  assert.equal(prepare({ duration: 4 }).mode, "text2video");
  assert.equal(prepare({ duration: 15 }).mode, "text2video");
});

test("reference count limits are per type", () => {
  for (const [type, role, limit] of [["image", "look_reference", 9], ["video", "action_reference", 3], ["audio", "audio_reference", 3]]) {
    const refs = Array.from({ length: limit }, (_, i) => asset([role], type, `./asset-${i}`));
    if (type === "audio") refs.push(asset(["look_reference"]));
    assert.equal(prepare({ assets: refs }).mode, "multimodal2video");
    assert.throws(() => prepare({ assets: [...refs, asset([role], type)] }), new RegExp(`At most ${limit} ${type}`));
  }
});

test("unknown prototype-related fields and sparse assets are rejected", () => {
  for (const field of ["__proto__", "constructor", "toString"]) {
    const input = JSON.parse(JSON.stringify(base).replace(/}$/, `,"${field}":{}}`));
    assert.throws(() => prepareVideoRequest(input), /Unknown input field/);
  }
  assert.throws(() => prepareVideoRequest(Object.create(base)), /plain object/);
  assert.throws(() => prepare({ assets: Array(1) }), /plain object/);
});

test("CLI help and JSON example work offline; bad arguments fail clearly", () => {
  const script = fileURLToPath(new URL("../scripts/prepare-video-request.mjs", import.meta.url));
  const example = fileURLToPath(new URL("../examples/video-request.json", import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  const help = run("--help");
  assert.equal(help.status, 0);
  assert.match(help.stdout, /offline/);
  const preview = run("--input", example);
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(JSON.parse(preview.stdout).mode, "multimodal2video");
  assert.equal(run("--input").status, 1);
  assert.equal(run("--input", example, "--run").status, 1);
});

const apiBase = { ...base, target: "seedance-api", model: "doubao-seedance-2-0-260128" };
const prepareApi = (changes = {}) => prepareVideoRequest({ ...apiBase, ...changes });
const apiAsset = (roles, type = "image", filename = "reference.png") =>
  asset(roles, type, `https://example.com/${filename}`);

test("Seedance API emits a body with exact prompt and native names, without credentials or a command", () => {
  const prompt = "  原文\nNegative: jitter  ";
  const result = prepareApi({ prompt, ratio: "16:9" });
  assert.equal(result.method, "POST");
  assert.equal(result.endpoint, "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks");
  assert.deepEqual(result.body, { model: apiBase.model, content: [{ type: "text", text: prompt }],
    duration: 5, resolution: "720p", ratio: "16:9" });
  assert.ok(!Object.hasOwn(result, "executable"));
  assert.ok(!Object.hasOwn(result, "headers"));
});

test("API maps creative roles to wire roles without sending a composition reference as a frame", () => {
  const result = prepareApi({ assets: [apiAsset(["composition_reference", "look_reference"]),
    apiAsset(["action_reference"], "video", "motion.mp4"),
    apiAsset(["audio_reference"], "audio", "music.wav")] });
  assert.deepEqual(result.body.content.slice(1), [
    { type: "image_url", image_url: { url: "https://example.com/reference.png" }, role: "reference_image" },
    { type: "video_url", video_url: { url: "https://example.com/motion.mp4" }, role: "reference_video" },
    { type: "audio_url", audio_url: { url: "https://example.com/music.wav" }, role: "reference_audio" }
  ]);
  assert.deepEqual(result.bindings[0].roles, ["composition_reference", "look_reference"]);
});

test("API frame anchors and binding labels use first then final order", () => {
  const first = apiAsset(["first_frame"], "image", "first.png");
  const last = apiAsset(["final_frame"], "image", "last.png");
  const result = prepareApi({ assets: [last, first], ratio: "16:9" });
  assert.deepEqual(result.body.content.slice(1).map(({ role }) => role), ["first_frame", "last_frame"]);
  assert.deepEqual(result.bindings.map(({ source }) => source), [first.source, last.source]);
  assert.equal(prepareApi({ assets: [first] }).body.content[1].role, "first_frame");
});

test("API does not silently accept CLI models, local files, unsupported controls or bad URLs", () => {
  assert.throws(() => prepareApi({ model: "seedance2.0" }), /Unsupported Seedance API model/);
  assert.throws(() => prepareApi({ model: "doubao-seedance-2-5" }), /Unsupported Seedance API model/);
  assert.throws(() => prepareApi({ assets: [asset(["first_frame"])] }), /HTTPS URL/);
  for (const source of ["http://example.com/a.png", "https://", "asset://asset-id",
    "https://user:secret@example.com/a.png", "https://example.com/a b.png"]) {
    assert.throws(() => prepareApi({ assets: [{ ...apiAsset(["look_reference"]), source }] }), /HTTPS URL/);
  }
  assert.throws(() => prepareApi({ negative_prompt: "blur" }), /Unknown input field/);
  assert.throws(() => prepareApi({ assets: [apiAsset(["middle_frame"])] }), /middle_frame/);
  assert.throws(() => prepareApi({ assets: [apiAsset(["final_frame"])] }), /requires/);
  assert.throws(() => prepareApi({ duration: 30 }), /duration/);
  assert.throws(() => prepareApi({ resolution: "1080p" }), /resolution/);
});

test("API preserves signed URL strings, supports the fast model, and its example runs offline", () => {
  const source = "https://example.com/image.png?X-Signature=a%2Bb&expires=123";
  const result = prepareApi({ model: "doubao-seedance-2-0-fast-260128",
    assets: [{ ...apiAsset(["look_reference"]), source }] });
  assert.equal(result.body.content[1].image_url.url, source);
  assert.equal(result.body.model, "doubao-seedance-2-0-fast-260128");
  const example = fileURLToPath(new URL("../examples/seedance-api-request.json", import.meta.url));
  const script = fileURLToPath(new URL("../scripts/prepare-video-request.mjs", import.meta.url));
  const run = spawnSync(process.execPath, [script, "--input", example], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(JSON.parse(run.stdout).body.content[0].type, "text");
});
