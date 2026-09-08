# 09 — 如何使用手册与 Skill

[English version](../en/09-usage-guide.md)

先确定你希望 agent 完成什么任务。仓库包含四个 Skill、技术手册，以及一个
离线整理视频请求的小工具。提示词写作是可选步骤。检查准备好的请求后，
再通过你选择的外部工具生成视频。

## 开始之前

离线工具和测试需要 Node.js 20 或更新版本。先取得完整仓库：

```bash
git clone https://github.com/kwei-k/AIGC-Tech.git
cd AIGC-Tech
node --version
```

项目没有需要安装的第三方依赖。可以运行 `npm test` 检查仓库。
阅读手册、让 agent 使用 Skill 本身不需要 Node。

## 1. 选择合适的 Skill

| 你的任务 | Skill | 得到什么 |
|---|---|---|
| 判断镜头该用哪种技术 | [aigc-technique-router](../../skills/aigc-technique-router/SKILL.md) | T0–T5 技术路线和首次尝试建议 |
| 规划需要分元素生成与合成的镜头 | [multistep-video-planner](../../skills/multistep-video-planner/SKILL.md) | 制作步骤、输入素材、提示词要求和验收关卡 |
| 规划 ComfyUI 降噪或重打光 | [comfyui-denoise-pass](../../skills/comfyui-denoise-pass/SKILL.md) | 节点顺序与参数起始点 |
| 根据当前需求写视频提示词 | [write-video-prompt](../../skills/write-video-prompt/SKILL.md) | 一条参考角色明确、运动先于影调的提示词 |

在仓库目录中，可以明确要求 agent 读取相应 Skill：

```text
读取 skills/aigc-technique-router/SKILL.md，用它规划这个镜头：
六秒产品镜头，缓慢环绕，产品必须与参考图一致。
同时帮我写一次用于即梦 CLI 的提示词。
```

这种方式不要求提前安装 Skill，但 agent 需要能访问完整仓库，才能继续读取
Skill 引用的手册。

## 2. 选择是否需要写提示词

**沿用我的提示词。** 文案已经确定时，直接说明。agent 可以帮助标注素材角色、
整理工具请求，并保持提示词原文不变。

```text
沿用这条提示词，不改写：“平视中景，缓慢推近；人物向镜头走两步，步速克制；
外套随步伐轻摆；柔和侧光。”
目标工具：即梦 CLI。这张图是首帧。只准备请求。
```

**帮我写一次。** 提供当前意图和参考素材角色。写作模板会把需求转成摄影机、
人物、环境和光线的可见指令。

```text
读取 skills/write-video-prompt/SKILL.md，为即梦 CLI 写一条提示词。
意图：非常优雅的女孩走向镜头，克制的高级广告感。
图 A 定义人物，图 B 定义服装，图 C 只参考构图。
五秒，英文，缓慢运镜，动作连续。
```

使用路由或规划 Skill 时，也可以附带这个选择。多步骤计划里，说明这次要为
哪个生成步骤写提示词，例如背景板或人物层。每条提示词只采用当前步骤的
需求和输入素材。

写作模板不评价生成视频、不比较提示词版本，也不运行优化循环。通用复制格式
是一段正向正文加一行紧凑的 `Negative:`；具体工具如何接收这些内容，需要遵循
[工具适配说明](08-seedance-and-dreamina.md)。

## 3. 离线整理请求

先让 agent 写完提示词，或者使用你自己的定稿。复制并编辑示意用的
[请求 JSON](../../examples/video-request.json)，填入目标工具、最终提示词、
模型、参数和素材。在仓库根目录运行：

```bash
node scripts/prepare-video-request.mjs --input examples/video-request.json
```

API 目标可以使用单独的[Seedance 示意请求](../../examples/seedance-api-request.json)：

```bash
node scripts/prepare-video-request.mjs --input examples/seedance-api-request.json
```

工具读取 JSON，输出整理后的请求。它不调用大语言模型、不写提示词、不上传
素材、不提交任务，也不消耗生成额度。离线整理不需要 API 密钥。
沿用或写作的选择由 Skill 处理；整理工具始终接收定稿，不接收写作模式开关。

输入包含：

- `target`：`dreamina` 或 `seedance-api`；
- `prompt`：保留原文的最终提示词；
- `model`、`duration`、`resolution`，以及可选的 `ratio`；
- `assets`：每份素材的 `type`、`source` 和明确的 `roles`。

即梦素材使用本地路径；本工具的 API 素材使用 HTTPS 地址。CLI 别名和 API
模型 ID 不同。支持的取值与媒体映射见 [08](08-seedance-and-dreamina.md)。

使用前先读输出。即梦目标会得到命令参数数组；Seedance API 目标会得到接口
地址和请求正文。提交 API 时只使用预览中的 `body` 字段，不发送整个预览对象。
素材绑定说明每个标签对应哪份参考，警告说明还需注意的地方。
参数数组是结构化数据，不能直接用空格拼接后当作 shell 命令粘贴。

本版支持纯文本、明确的单张首帧、明确的首尾帧组合，以及语义参考素材。
中间帧和 multiframe 工作流需要按工具规则手动处理。具体模式和参考限制见
[08](08-seedance-and-dreamina.md)。

校验只覆盖请求结构，不检查素材文件是否存在，也不读取媒体时长、尺寸或格式。
即梦素材使用相对路径时，以最终执行 CLI 命令的目录为基准，不以 JSON 所在
目录为基准。

工具也无法判断账号是否有模型权限，或成片能否满足导演意图。准备生成时，
继续使用外部工具自己的认证、提交、查询和下载流程。整理好的请求还不是
生成结果。

## 4. 安装时保留参考文档

使用全部四个 Skill，最直接的方式是保留完整仓库。路由、规划和降噪 Skill
会读取各自目录之外的文档，只复制这些 `SKILL.md` 会丢失必要上下文。

提示词写作 Skill 可以独立安装：把完整的 `skills/write-video-prompt/` 目录
复制到 agent 使用的 Skill 目录，保留 `references/` 和 `agents/`。先检查目标
位置是否已有同名安装；替换前比较内容或备份。具体安装位置和识别方式遵循
对应 agent 的说明。

在 Codex 中，安装并被识别后，可以明确调用：

```text
$write-video-prompt 为这个五秒镜头写一条英文提示词。这张图只参考构图。
缓慢推近，人物动作克制。
```

独立安装的写作 Skill 可以用文本给出工具交接说明。它不会安装离线整理工具；
后者应在包含 `scripts/` 和 `examples/` 的完整仓库中运行。

## 5. 先有调用示例，再补视频案例

目前的 JSON 示例用于演示如何整理请求。它们是示意输入，不代表已经付费生成
或完成了真实制作镜头。

后续案例应连起导演需求、素材角色、最终提示词、工具与模型版本、参数，以及
外部托管的实际结果。可以先做纯文生视频、首帧图生视频、首尾帧产品镜头、
多参考素材镜头。记录实际验证范围和可见局限，遵循
[贡献约定](../../CONTRIBUTING.md)。
