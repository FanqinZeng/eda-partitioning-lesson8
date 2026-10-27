# 课程与素材来源

## 课程依据

- [教师多路划分模块](https://github.com/yongfu-li/eda-learning/tree/main/courses/learn_partitioning/module03-01-multiway-partition)：主题、五节点图、递归割代价 8 与轮询割代价 18，以及 assignment、cutsize、balance 的报告要求。
- [教师浏览器实现](https://github.com/yongfu-li/eda-learning/blob/main/platform/assets/partitioning-core.js)：最大分区递归切分与按字母轮询逻辑。
- [教师谱二分实现](https://github.com/yongfu-li/eda-learning/blob/main/platform/assets/clustering-core.js)：`core/spectral.mjs` 从其 laplacian、dot、norm、spectralBisection 代码适配，保留迭代次数、移位值与局部面积过滤。新增输入检查、k 路指标、过程记录与独立验证属于本课实现。
- [Issue #16](https://github.com/yongfu-li/eda-learning/issues/16)：Partitioning Module - Lesson 8。读取时未附正文或评论要求。

没有将轮询描述成所有直接多路算法，没有将贪心成对交换描述成完整多路 FM。对本图 90 个可行带标签分配的精确枚举与方法比较见 `data/reference-runs.json`、`tests/multiway.test.mjs`。

- [Spielman《Spectral Graph Theory》Lecture 2，第2.3节](https://cs.yale.edu/homes/spielman/561/lect02-15.pdf)：拉普拉斯二次型、零和与单位范数约束、第二小特征值对应坐标的数学依据。新版网页与视频的矩阵、坐标和候选数据来自本课实际算法追踪。

## 视觉与人物

- 作者上一课：[eda-clustering-lab7-kl](https://github.com/FanqinZeng/eda-clustering-lab7-kl)。本课延续米白、深蓝、青绿、蓝色与橙色的视觉体系，为第三分区补充紫色。
- `film/assets/student-sprites-v3.png` 沿用上一课已公开的透明手绘大学生人物，由内置 ImageGen 依据用户提供的卡通参考图生成。提示词和素材清单一并保留。
- 原始参考图不随仓库或离线包分发；本仓库不对其作者或许可作推断。
- 人物以二维表情帧构成开口、闭口、眨眼动作，非三维或逐音素口型。
- 图、边权、树、比较表与动画由本课代码绘制，没有复制教师视频或其他同学的成片。

## 声音、字体与工具

- Microsoft Edge TTS `zh-CN-YunxiNeural` 提供合成讲解声音；新版速率为 +8%，输出没有额外音频变速，成片音源记录在 `film/media-check.json`。这是合成配音，不是作者本人录音或克隆声音。
- 英文配音使用 [Coqui TTS](https://github.com/coqui-ai/TTS) 0.22.0，在本机运行 `tts_models/en/vctk/vits`，选用预置声音 p226。上游[模型登记表](https://github.com/coqui-ai/TTS/blob/dev/TTS/.models.json)将该模型标为 Apache 2.0；软件仓库采用 MPL-2.0。模型出自 Coqui 官方 [v0.6.1_models 发布](https://github.com/coqui-ai/TTS/releases/tag/v0.6.1_models)，英文语速为固定0.88倍，按自然句间停顿组织约7分36秒的独立时间轴。
- 英文发音前端使用 [eSpeak NG](https://github.com/espeak-ng/espeak-ng) 1.52.0；依赖与模型下载到本地后，合成时不发送课程台词。
- 配乐和提示音由 `scripts/prepare_audio.py` 合成，没有使用第三方音乐录音。
- 网页与影片使用运行机中文系统字体，仓库不分发字体文件。课件和讲义使用 Arial Unicode MS；相关字体子集或字形结果随输出文件保存。
- FFmpeg 由 imageio-ffmpeg 提供；edge-tts 与 Playwright 用于媒体制作。项目不把机器上的依赖目录、浏览器或凭据纳入仓库。

## 数值适用范围

人数平衡只适用于单位节点重量；电路面积需要累计节点重量。相同人数向量并不意味着连接代价相同。递归二分和贪心交换都不保证一般输入的全局最优，最终容量必须实际检查。
