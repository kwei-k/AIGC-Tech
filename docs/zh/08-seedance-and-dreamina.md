# 08 — Seedance 与即梦工具适配

[English version](../en/08-seedance-and-dreamina.md)

先用[决策框架](00-decision-framework.md)选择制作技术，再把提示词和素材对应到
工具实际支持的输入。Seedance 是模型系列；Seedance API 与即梦 CLI 各自使用
不同的模型标识、参数和任务流程。CLI 模型别名不能直接当作 API 模型 ID。

本章说明一次工具交接：按需写一条提示词、明确素材角色，再准备请求。
具体调用和离线整理步骤见[使用指南](09-usage-guide.md)。

## 1. 根据参考素材的角色选择模式

| 输入与用途 | 即梦命令 | 离线整理工具 |
|---|---|---|
| 只有提示词，没有素材 | `dreamina text2video` | 支持 |
| 一张明确作为开场画面的图 | `dreamina image2video --image` | 支持 |
| 分别提供首帧和尾帧 | `dreamina frames2video --first … --last …` | 支持 |
| 人物、服装、构图、影调、动作或混合媒体参考 | `dreamina multimodal2video` | 支持 |
| 用多张图片串联故事 | `dreamina multiframe2video` | 手动工作流，整理工具未实现 |
| 必须精确落在某个中间时点的帧锚点 | 查所选工具的当前文档 | 整理工具会拒绝 |

图片的用途比数量更重要。即使只有一张构图参考，也应该进入参考素材工作流。
传给 `image2video --image` 会让它成为开场画面，改变原本的导演需求。

整理工具也会拒绝“只有尾帧，没有首帧”和“帧锚点混入额外语义参考素材”。
这是本工具支持模式的边界，不代表所有模型都有相同限制。镜头需要其他组合时，
应按文档选择相应的手动工作流。

## 2. 把每份素材的创作用途写清楚

整理请求前，先说明每份素材控制什么：

```text
Image 1 定义人物身份；Image 2 只定义服装；
Image 3 只参考构图；Video 1 提供摄影机路径。
```

这些是有顺序的素材标签，不是已经上传的资产 ID，也不代表所有界面都支持
相同的引用标记。工具有专用引用语法时，遵循其文档，并保持提示词标签与
实际素材顺序一致。

- `character_identity` 不会自动复制服装或背景。
- `composition_reference` 不隐含 `first_frame` 或 `final_frame`。
- 动作视频可以只提供动作或运镜，不引入原视频中的人物。
- 音频参考需要说明用途，例如声音、音乐或节奏。
- 产品或 UI 参考用于指定设计，不保证生成片段中的文字始终精确。

整理工具输出的 `bindings` 会列出实际标签与输入顺序。提交前，用它核对最终
提示词。工具会保留提示词原文，不会自动修正写错的素材标签。

## 3. 选择是否写提示词

用户已经给出定稿时，**沿用**原文。用户需要写作帮助时，按
[运动优先模板](07-motion-first-video-prompt-template.md)，从当前需求**写一次**。

首帧镜头重点写画面如何从开场状态运动起来；首尾帧镜头写两个状态之间连续的
动作过渡；参考素材镜头先绑定人物、服装、动作和影调，再描述镜头。
每个镜头内部使用“摄影机 → 主体 → 场景 → 影调”，这是本仓库的写作约定，
不是 API 强制语法。

只有需求明确时才增加时间点、对白或声音关系。提示词里写了声音，不代表所选
接口一定提供音频生成开关。模型、时长、分辨率和画幅应放在请求参数中；
在正文里写某个分辨率，不能开启工具不支持的输出规格。

### Negative 怎样处理？

通用写作模板会为读者单列一行 `Negative:`。这个格式不代表 API 存在
`negative_prompt` 字段，也不代表 CLI 有对应参数。已检查的即梦命令没有
独立的负面提示词参数。

新写的工具提示词，尽量把约束改成正向表达；剩余限制若没有文档支持的接收
位置，就作为人工备注，并说明哪些备注没有传入工具。沿用用户定稿时，原有的
`Negative:` 行保留在文本里，但它只是普通提示词文本，不声称具有独立的
负面条件控制作用。

## 4. 即梦 CLI 适配范围

本地检查的版本报告为 `1dcd265-dirty`，提交号 `1dcd265`，构建时间
`2026-04-22T08:12:54Z`；帮助信息核对日期为 **2026-09-08**。

整理工具支持已检查的 `seedance2.0`、`seedance2.0fast`、`seedance2.0_vip`、
`seedance2.0fast_vip` 别名，时长为 4–15 秒整数，分辨率为 `720p`。
模型别名和账号权限仍需以实际安装的 CLI 为准。这是已支持的请求整理范围，
不保证每个账号都能用全部别名生成视频。

命令参数使用 `--prompt`、`--model_version`、`--duration` 和
`--video_resolution`。文生视频和多模态模式还可使用 `--ratio`，取值为
`1:1`、`3:4`、`16:9`、`4:3`、`9:16` 或 `21:9`。首帧和首尾帧模式根据
图片确定画幅，因此相应的整理输入应省略 `ratio`。

多模态模式通过重复的 `--image`、`--video`、`--audio` 传入素材。整理工具
要求本地素材路径；存在音频时，至少还要有一张图片或一段视频。最多接收
九张图片、三段视频、三段音频，不读取媒体文件检查时长、格式或尺寸。

更换 CLI 版本后，先通过帮助信息核对参数：

```bash
dreamina --version
dreamina image2video --help
dreamina multimodal2video --help
```

`multiframe2video` 是独立工作流，不能当作多模态参考的另一个名字，也不能
假定它接收相同的模型和分辨率参数。

## 5. Seedance API 适配范围

把 `target` 设为 `seedance-api`。整理工具会准备发往以下地址的 `POST` 请求：

```text
https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
```

地址和请求字段依据官方 SDK 的
[任务客户端](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/resources/content_generation/tasks.py)
与[区域接口地址定义](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/_constants.py)。

支持的 API 模型 ID 是 `doubao-seedance-2-0-260128` 和
`doubao-seedance-2-0-fast-260128`，与上面的 CLI 别名不同。两个 ID 均来自官方
[Ark CLI 模型场景表](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-models/references/arkcli-models-scenario-table.md)。本工具对两个目标
都采用 4–15 秒、`720p` 的有限整理范围。这不是原生 API 的完整能力列表，
也不表示账号已经获得两个模型的使用权限。

输出包含接口地址和请求正文；正文使用 `model`、`content`、`duration`、
`resolution`，以及可选的 `ratio`。`content` 的第一项是
`{"type":"text","text":"<原样保留的最终提示词>"}`，后续为媒体项：

| 创作输入 | API 内容类型 | API 角色 |
|---|---|---|
| `first_frame` 图片 | `image_url` | `first_frame` |
| `final_frame` 图片 | `image_url` | `last_frame` |
| 人物、服装、构图、动作或影调图片参考 | `image_url` | `reference_image` |
| 动作、运镜或影调视频参考 | `video_url` | `reference_video` |
| `audio_reference` 音频 | `audio_url` | `reference_audio` |

例如，图片项使用 `image_url: {"url": "<素材 HTTPS 地址>"}`。服装、构图等
创作角色仍由提示词说明，不擅自变成 API 角色值。`final_frame` 是本工具的
输入术语，输出时会映射为 API 的 `last_frame`。

这些媒体结构和原生角色依据官方
[SDK 内容类型](https://github.com/volcengine/volcengine-python-sdk/blob/bd7d94433803d213a85f918ff2eb049067655eff/volcenginesdkarkruntime/types/content_generation/create_task_content_param.py)
与 [Ark CLI 生成输入说明](https://github.com/volcengine/ark-cli/blob/a1206b859b8837146b6102c6f378a117be496dc2/skills/arkcli-gen/references/arkcli-gen.md)，
核对日期为 2026-09-08。这里引用 Ark CLI 是为了核实原生 API 输入；它与即梦
CLI 是不同工具。

本工具的 API 素材**只接收 HTTPS 地址**，不上传本地文件、不解析资产 ID，
也不编码 base64。这些是本工具的整理边界，不代表原生服务禁止其他输入方式。
各类型上限为九张图片、三段视频和三段音频；工具不访问这些地址，也不验证
媒体本身的属性。

API 请求结构包含 `ratio` 字段，因此整理工具允许在 API 帧模式中选填画幅；
实际输出行为仍以所选模型和服务为准。这个范围与已检查的 CLI 帧命令不同。
本工具支持的结构不输出独立的 `negative_prompt` 字段；用户定稿中原有的
`Negative:` 仍属于普通文本项。

可以在无认证、无网络访问的情况下整理示意 API 请求：

```bash
node scripts/prepare-video-request.mjs --input examples/seedance-api-request.json
```

这会打印请求预览；提交 API 时使用其中的 `body` 字段，不要发送整个预览对象。
决定生成时，再由外部 API 客户端负责认证和提交。

## 6. 生成前检查交接内容

[离线整理工具](../../scripts/prepare-video-request.mjs)接收最终提示词和角色明确的
素材。检查它选出的模式、模型、素材绑定与警告。即梦输出包含可执行程序名和
彼此独立的参数值，不要把它们直接拼成没有正确引用的 shell 字符串，也不要
交给 `eval`。

整理请求不会认证、上传或提交。真正生成和获取结果，需要继续遵循外部工具的
任务流程。拿到任务 ID 只代表任务已被接收。例如，即梦的 `submit_id` 和
`query_result` 属于它自己的流程，不能假定 Seedance API 也返回相同字段。
只有工具报告完成并且实际结果存在时，才能说视频已经生成。

## 来源与验证范围

[官方 Seedance 2.0 系列提示词指南](https://docs.byteplus.com/api/docs/ModelArk/2222480)
为明确主体与素材绑定、按时间顺序描述镜头提供依据。运动优先顺序和可选的
沿用/写作模式属于 AIGC-Tech 的方法约定。

本次尝试读取用户提供的[火山引擎指南](https://docs.volcengine.com/docs/82379/2607689?lang=zh)，
只返回 JavaScript 页面框架，全文尚未核实。本章不声称复述了该页规则，也不
认证 Seedance 2.5 支持。上面的 CLI 结论来自本地帮助信息，不是付费生成实测。
