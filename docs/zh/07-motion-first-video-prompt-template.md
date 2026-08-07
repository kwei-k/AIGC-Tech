# 运动优先的视频提示词写作模板

## 用途

本章定义一套只负责单次写作的视频生成提示词模板。它把当前导演意图、分镜和
参考图整理成一段简洁、可直接复制的文本。

它不是提示词迭代系统：不检查生成结果，不诊断模型失败，不比较多个版本，
不把成功条款保存成状态，也不管理优化循环。

```mermaid
flowchart LR
    A["当前导演意图"] --> T["运动优先的写作模板"]
    B["分镜与参考图角色"] --> T
    T --> P["一段可直接复制的提示词"]
    T --> N["一行 Negative"]
```

这份模板横跨全部 T0–T5。技术阶梯决定镜头怎样生产；模板只负责写当前生成步骤
所需的提示词。

## 1. 默认模板

按照以下顺序填写：

```text
[参考图绑定，如有]
[摄影机运动]；
[主体运动]；
[场景运动]；
[影调与完成度]；
[连续性，仅在必要时]。
Negative: [紧凑的失败限制]
```

最终渲染成一整段正文，后接一行 `Negative:`，不要输出方括号里的字段名。

这个顺序是有意设计的：摄影机运动先确定移动视点；主体运动定义视点中的主要
动作；场景运动补充环境反馈；影调只负责完成一个已经连贯的镜头。

## 2. 把意图变成可见指令

简短创意词通常只表达印象，还不是物理镜头：

```text
一位优雅的女孩，电影感，动态运镜。
```

把每个有意义的词转换成可见结果：

| 抽象意图 | 可见指令 |
|---|---|
| 优雅 | 挺拔但放松的体态、克制步速、受控重心转移、平静眼神 |
| 有能量 | 更快的摄影机加速度、更长步幅、更明确的身体投入、活跃环境 |
| 高级 | 克制运镜、受控高光、真实材质、干净构图 |
| 亲密 | 更近景别、更短摄影机距离、细微表情、浅层空间分离 |

每个保留的修饰词都应该对应一种可见变化。删除不会改变镜头的背景故事和
装饰性同义词。

## 3. 给每张参考图明确身份

每张参考图都必须拥有明确角色：

| 参考图角色 | 控制内容 |
|---|---|
| 首帧 / 中间帧 / 尾帧 | 镜头中特定时点的规定状态 |
| 构图参考 | 布局、平衡与 blocking |
| 机位参考 | 视点、高度、镜头感或摄影机路径 |
| 动作参考 | 姿势、手势、步态或运动路径 |
| 影调参考 | 灯光、色彩、反差、质感或完成度 |
| 人物绑定 | 面部、身体身份、轮廓或角色设计 |
| 服装参考 | 服装、造型、配饰或材质 |
| UI / 包装参考 | 界面、产品包装、标签、Logo 或图形系统 |

一张图可以拥有多个角色，但每个角色都必须写明。构图参考不是首帧、中间帧或
尾帧，除非导演明确额外赋予它帧锚点身份。

绑定范围要窄：

- 人物参考不会自动带入背景或服装；
- 服装参考不会重新定义面部或身体；
- 影调参考不会重新定义构图或产品设计；
- UI / 包装参考只控制被点名的图形或产品元素。

存在参考图时，用紧凑的角色说明开场：

```text
参考图 A 定义人物身份与服装；参考图 B 只控制构图；参考图 C 定义灯光与色彩。
```

## 4. 先写摄影机运动

只选择真正决定这个镜头的摄影机变量：

- 机位高度与角度；
- 景别与镜头感；
- 路径、轴线与画面方向；
- 速度与加速度；
- 稳定方式；
- 推、拉、摇、移、升降、环绕、跟拍或甩镜；
- 有意使用的手持幅度、footstep bounce、horizon roll 和 motion blur。

通常只用一种主运镜加一种辅助行为。不要粘贴摄影术语清单。物理上互相冲突的
运镜必须在写作前解决。

示例：

```text
Eye-level medium full shot, slow steady dolly-in with subtle lateral tracking.
```

```text
Low handheld follow from behind, brisk walking pace, small footstep bounce, slight
horizon roll, natural directional motion blur.
```

## 5. 再写主体运动

把主体描述成连续的物理动作：

- 方向与速度；
- 步幅、节奏、平衡与重心转移；
- 必要的手、臂、腿、躯干、头部、表情和眼神；
- 开场状态、动作过渡和结束状态；
- 与人物、道具、产品或表面的交互时机。

使用可见动词。不要用“动作优雅”代替让动作显得优雅的身体机制。

## 6. 然后写场景运动

把环境运动与主体运动分开：

- 头发、布料、风、烟、雨、灰尘、反射、人群、车辆和屏幕；
- 前景与背景视差；
- 接触效果和环境反馈；
- 相对于摄影机与主体的时机和强度。

不要为了让提示词听起来更“电影化”而无目的地增加场景运动。

## 7. 最后写影调

动作明确后再加入画面完成度：

- 光线方向、软硬、反差和曝光特征；
- 色彩与氛围；
- 镜头质感、景深、快门感、motion blur、颗粒和纹理；
- 皮肤、布料、产品、UI 或包装处理；
- 广告片完成度和必要的视觉连续性。

避免堆叠同义形容词。每个影调词都应该改变一种可见属性。

## 8. 正向提示词与 Negative

可以正向表达时，优先描述想要的行为：

```text
不要写：no shaky camera
改成：stable low-amplitude handheld follow
```

剩余失败限制统一放进一行紧凑的 `Negative:`。只选择与当前镜头相关的风险，
例如人物漂移、肢体错误、脚底打滑、意外切镜、摄影机抖动、时序闪烁、
画面扭曲、文字不可读或重复肢体。

不要给每条提示词粘贴同一套通用 Negative。

## 9. 语言

模板与输出语言分离：

- 用户明确指定语言时遵循指定；
- 没有指定时，跟随用户当前工作语言；
- 标准摄影和制作术语用英文更清楚时保留英文；
- 可以输出纯英文提示词；
- 素材文件名和模型要求的固定语法保持原样。

改变语言不能改变参考图角色，也不能改变“摄影机 → 主体 → 场景 → 影调”的顺序。

## 10. 最终检查

交付前检查：

1. 每张参考图都有明确角色。
2. 构图参考没有被擅自升级为帧锚点。
3. 摄影机运动写在主体和场景运动之前。
4. 摄影机操作在物理上兼容。
5. 主体动作拥有方向、时机与连续性。
6. 场景运动与主体运动相互独立。
7. 影调最后出现，没有取代运动指令。
8. 正文紧凑，并以正向描述为主。
9. `Negative:` 只包含相关限制。
10. 输出不需要删除说明即可直接复制。

## 11. 示例

输入：

```text
非常优雅的女孩
```

输出：

```text
Eye-level medium full shot, a slow steady dolly-in with subtle lateral tracking, clean horizon and restrained motion blur; a poised young woman walks diagonally toward camera at a measured pace, shoulders relaxed, spine tall, short even steps, controlled weight transfer, one hand lightly guiding her skirt, calm expression and focused gaze continuing smoothly through the shot; her hair and soft fabric respond gently to the movement while the background holds slow natural parallax; soft directional key light, refined neutral palette, delicate highlight roll-off, shallow depth of field, polished luxury-advertising finish.
Negative: identity drift, stiff gait, foot sliding, abrupt gesture changes, exaggerated posing, camera jitter, horizon wobble, temporal flicker, warped hands, duplicate limbs
```

## Agent 实现

可加载的写作模板封装在
[`write-video-prompt`](../../skills/write-video-prompt/SKILL.md) 中。
其内部规范使用英文编写，默认输出不会展示意图理解过程。
