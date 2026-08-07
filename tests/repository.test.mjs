import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function trackedMarkdownFiles() {
  return execFileSync("git", ["ls-files", "*.md"], {
    cwd: repoRoot,
    encoding: "utf8"
  })
    .trim()
    .split("\n")
    .filter(Boolean);
}

test("all relative Markdown links resolve", () => {
  const broken = [];

  for (const relativePath of trackedMarkdownFiles()) {
    const source = read(relativePath);
    const links = source.matchAll(/\[[^\]]*]\(([^)]+)\)/g);

    for (const match of links) {
      const target = match[1].split("#", 1)[0];
      if (!target || /^(?:https?:|mailto:)/.test(target)) continue;

      const absoluteTarget = path.resolve(
        repoRoot,
        path.dirname(relativePath),
        decodeURIComponent(target)
      );

      if (!existsSync(absoluteTarget)) {
        broken.push(`${relativePath} -> ${target}`);
      }
    }
  }

  assert.deepEqual(broken, []);
});

test("English and Chinese playbooks have matching filenames", () => {
  const list = (locale) =>
    readdirSync(path.join(repoRoot, "docs", locale))
      .filter((name) => name.endsWith(".md"))
      .sort();

  assert.deepEqual(list("en"), list("zh"));
});

test("repository uses the standard 白模 terminology", () => {
  const legacyTypo = "\u767d\u819c";
  const misspellings = trackedMarkdownFiles().filter((relativePath) =>
    read(relativePath).includes(legacyTypo)
  );

  assert.deepEqual(misspellings, []);
});

test("Agent Skills have minimal valid frontmatter", () => {
  const skillsRoot = path.join(repoRoot, "skills");

  for (const folder of readdirSync(skillsRoot)) {
    const skillPath = path.join(skillsRoot, folder, "SKILL.md");
    assert.ok(existsSync(skillPath), `${folder} is missing SKILL.md`);

    const source = readFileSync(skillPath, "utf8");
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(frontmatter, `${folder} is missing YAML frontmatter`);

    const metadataLines = frontmatter[1].split("\n");
    const keys = metadataLines
      .map((line) => line.match(/^([a-z][a-z0-9-]*):/))
      .filter(Boolean)
      .map((match) => match[1]);
    const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const descriptionIndex = metadataLines.findIndex((line) =>
      line.startsWith("description:")
    );
    const inlineDescription = metadataLines[descriptionIndex]
      ?.slice("description:".length)
      .trim();
    const description =
      inlineDescription && !/^[>|][-+]?$/.test(inlineDescription)
        ? inlineDescription
        : metadataLines
            .slice(descriptionIndex + 1)
            .filter((line) => /^\s+/.test(line))
            .map((line) => line.trim())
            .join(" ");

    assert.deepEqual(keys.sort(), ["description", "name"]);
    assert.equal(name, folder);
    assert.ok(description.length >= 40, `${folder} needs a useful description`);
    assert.ok(source.split("\n").length < 500, `${folder} should stay under 500 lines`);
  }
});

test("README Skill badge matches the loadable Skill count", () => {
  const skillsRoot = path.join(repoRoot, "skills");
  const skillCount = readdirSync(skillsRoot).filter((folder) =>
    existsSync(path.join(skillsRoot, folder, "SKILL.md"))
  ).length;

  assert.match(
    read("README.md"),
    new RegExp(`agent%20skills-${skillCount}-green`)
  );
  assert.match(
    read("README.zh-CN.md"),
    new RegExp(`agent%20skills-${skillCount}-green`)
  );
});

test("motion-first prompt contract is typed, ordered, and implicitly loadable", () => {
  const contract = read(
    "skills/compile-video-prompt/references/motion-first-contract.md"
  );
  const metadata = read("skills/compile-video-prompt/agents/openai.yaml");
  const canonicalOrder = [
    "CAMERA MOVEMENT",
    "SUBJECT MOTION",
    "SCENE MOTION",
    "LOOK AND CAPTURE CHARACTER"
  ];

  let previousIndex = -1;
  for (const clause of canonicalOrder) {
    const index = contract.indexOf(clause);
    assert.ok(index > previousIndex, `${clause} is out of canonical order`);
    previousIndex = index;
  }

  for (const role of [
    "first_frame",
    "middle_frame",
    "final_frame",
    "composition_reference",
    "camera_reference",
    "action_reference",
    "look_reference",
    "character_identity",
    "wardrobe_reference",
    "ui_packaging_reference"
  ]) {
    assert.match(contract, new RegExp(`\\b${role}\\b`));
  }

  assert.match(contract, /composition_reference.*MUST NOT become a frame anchor/i);
  assert.match(contract, /Negative:/);
  assert.match(metadata, /allow_implicit_invocation:\s*true/);

  const example = contract.slice(contract.indexOf("Default English rendering:"));
  let exampleIndex = -1;
  for (const phrase of [
    "slow steady dolly-in",
    "a poised young woman walks",
    "hair and soft fabric respond",
    "soft directional key light"
  ]) {
    const index = example.indexOf(phrase);
    assert.ok(index > exampleIndex, `${phrase} is out of order in the worked example`);
    exampleIndex = index;
  }
});

test("README describes empty workflow and asset directories honestly", () => {
  const readme = read("README.md");
  const chineseReadme = read("README.zh-CN.md");
  const workflowJson = readdirSync(path.join(repoRoot, "workflows")).filter((name) =>
    name.endsWith(".json")
  );
  const assetMedia = readdirSync(path.join(repoRoot, "assets")).filter((name) =>
    /\.(?:png|jpe?g|webp)$/i.test(name)
  );

  if (workflowJson.length === 0) {
    assert.doesNotMatch(readme, /example ComfyUI workflow JSONs \+ notes/i);
    assert.doesNotMatch(chineseReadme, /ComfyUI 工作流 JSON 示例/i);
  }

  if (assetMedia.length === 0) {
    assert.doesNotMatch(readme, /diagrams and stills/i);
    assert.doesNotMatch(chineseReadme, /示意图与静帧/i);
  }
});

test("routing documentation treats duration and interaction as composable constraints", () => {
  const framework = read("docs/en/00-decision-framework.md");
  const readme = read("README.md");

  assert.match(framework, /duration wrapper/i);
  assert.match(framework, /evaluate all six constraints/i);
  assert.doesNotMatch(framework, /B -- Yes --> T5/);
  assert.doesNotMatch(readme, /B -- Yes --> T5/);
});

test("P1 denoise guidance has one canonical safe envelope", () => {
  const canonical = read("docs/en/05-comfyui-integration.md");
  const planner = read("skills/multistep-video-planner/SKILL.md");
  const denoiseSkill = read("skills/comfyui-denoise-pass/SKILL.md");

  for (const source of [canonical, planner, denoiseSkill]) {
    const normalized = source.replace(/\s+/g, " ");
    assert.match(normalized, /safe envelope[^.]*0\.15–0\.4/i);
    assert.match(normalized, /default starting point[^.]*0\.25/i);
  }
});
