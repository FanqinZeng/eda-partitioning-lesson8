# 分成三组，怎样少一点跨组沟通？

FanQin Zeng · EDA Learning / Partitioning Lesson 8。

**[打开课程网站](https://fanqinzeng.github.io/eda-partitioning-lesson8/)** · [教师模块](https://github.com/yongfu-li/eda-learning/tree/main/courses/learn_partitioning/module03-01-multiway-partition) · [作业 Issue #16](https://github.com/yongfu-li/eda-learning/issues/16)

五位同学分成三个项目组，每组最多两人。课程从这个虚构的生活情境出发，讲解多路划分、割代价、容量约束、轮询分配与递归二分，面向会基础编程、刚接触图划分的同学。

## 学习资料

- [中文配音视频](docs/assets/lesson8-full.mp4) · [English voice](docs/assets/lesson8-english.mp4)：九分钟，1080p，中英配音可选、中英双语字幕，沿用上一课的手绘大学生讲师。
- [可编辑课件](materials/Lesson8-lecture.pptx) · [课件 PDF](materials/Lesson8-slides.pdf)
- [自学讲义和八道练习解析](materials/Lesson8-guide.pdf) · [讲义文字版](materials/Lesson8-guide.md)
- [完整离线学习包](docs/assets/lesson8-offline.zip) · [SRT](docs/assets/lesson8-bilingual.srt) · [VTT](docs/assets/lesson8-bilingual.vtt)
- [分镜与完整文字稿](film/STORYBOARD.md) · [课堂使用建议](materials/CLASSROOM_PLAN.md)

播放器上方可以选择“中文 / English”配音。切换保留时间、播放/暂停、倍速、音量和静音状态，字幕下载链接随配音切换；两版均为九分钟。下载区和离线包都包含两种配音。

网站包含视频章节跳转、逐刀的五步谱二分讲解、矩阵行切换、真实坐标迭代记录、可点击的候选切口、十二道网页练习、两种方法对照、递归过程、手动分组、边权与节点面积编辑、参数挑战、自定义 JSON 图及练习解析。纯静态，无账号、后端或外部网页依赖。

## 本地运行

需要 Python 3：

```sh
python3 scripts/serve.py --port 8008
```

打开 http://127.0.0.1:8008 。服务器只绑定本机，支持 MP4 字节范围请求，方便章节跳转。离线包包含同一启动脚本。

## 课程输入与结果

`data/tiny_graph.json`：A、B、C、D、E 五个单位重量节点，无向边 AB=5、AC=1、BC=4、CD=2、DE=5、CE=1。k=3，各区非空且容量为 2。

| 方法 | 分组 | 割代价 |
|---|---|---:|
| 按字母轮询 | AD / BE / C | 18 |
| 递归二分 | AB / C / DE | 8 |
| 轮询后的贪心成对交换 | AB / C / DE（忽略标签） | 8 |

递归过程：ABCDE → ABC / DE，代价 3；再切分 ABC → AB / C，新增代价 5，最终为 8。两条权重为 5 的边 AB、DE 留在组内，解释了 18 与 8 的全部差异。

新版把选择依据放在分组结果之前：

1. ABCDE 是固定输入索引；轮询直接使用它，谱二分会生成新顺序。
2. 由边权构造 `L = D − W`；例如 A 行为 `[6, -5, -1, 0, 0]`。
3. 数值近似 Fiedler 向量，第一刀排序为 E、D、C、B、A。
4. 对四个候选切口计算代价 6、3、5、6，选择 ED｜CBA，新增 3。
5. 选择最大的 ABC，只用内部三条边重新计算；排序 A、B、C，候选代价 6 与 5，新增 5，最终 8。

九分钟视频包含25个场景、72组双语字幕。中文声音沿用 Yunxi，速率为 +8%，没有额外音频变速。英文版采用 Coqui TTS 0.22.0 的 VCTK/VITS 预置声音 p226 在本地合成，按原有场景与章节时间逐句对齐，并重新渲染口型和字幕显示时段。初始与最终坐标、矩阵和候选表全部取自实际代码记录；谱坐标目标值与离散割代价分别解释。

轮询是直接分配的简单基线。成对交换示例只接受保持容量可行的正收益交换，不是完整 k-way FM。递归方法优先切分节点数最多的分区，二分子程序对齐教师的谱方法、80 次迭代和局部 20%–80% 面积过滤。最终 k 路容量另行检查，不能从局部过滤推断最终可行性。

## 算法与验证

需要 Node.js 20 或更新版本，无 npm 运行依赖：

```sh
npm test
npm run data
npm run build
```

`core/` 是唯一手写算法来源。`site/` 是网站来源；构建脚本把算法与数据复制进 `docs/`，用于 GitHub Pages。不要直接修改生成的 `docs/` 文件。

测试独立核对割代价、每次切分新增代价、分区数量、标签置换不变性、面积容量、交换改进与非法输入。含 180 张固定种子随机图的 360 次方法运行，以及本例全部 90 个容量合法的带标签分配枚举。枚举证明本例最小割代价为 8，不证明任意图上算法都最优。

网页支持 2–40 个节点、k≤8，建议用 12 个以内的小图观察。谱二分是教学数值近似；贪心交换最多执行 80 步并报告达到上限。节点面积与连接边权分别用于负载和割代价。

## 制作与复现

成品可直接使用。下载的16页课件和6页基础讲义保留原有多路划分内容；新版谱二分完整推导见网页五步演示和九分钟影片。重新制作影片需要 Node.js、Chrome/Chromium、Python 和项目媒体依赖；PPTX 制作需要 Codex 的 `@oai/artifact-tool` 运行时。教材源文件保存在 `authoring/`。

```sh
python3 -m pip install --target .tools/python edge-tts==7.3.1 imageio-ffmpeg==0.6.0 numpy reportlab
npm install --prefix .tools/node playwright
```

配音命令明确区分外部服务与本机模式：

```sh
# 此命令会将 film/script.json 中的中文教学台词发送至 Microsoft Edge TTS。
python3 scripts/prepare_audio.py --edge
# macOS 可选本机配音，音色会不同。
python3 scripts/prepare_audio.py --offline
```

设置 `L8_NODE_MODULES` 为含 playwright 的 node_modules 目录，`L8_PYTHON` 为 Python 可执行文件，`L8_FFMPEG` 为 FFmpeg 可执行文件，按需设置 `L8_CHROME`，然后运行：

```sh
node scripts/render_film.cjs --stills
node scripts/render_film.cjs
python3 scripts/check_media.py
node scripts/build_site.mjs
python3 scripts/package_offline.py
```

人物是二维透明表情帧插画，按配音音量切换开闭口并眨眼。来源与制作说明见 [SOURCES.md](SOURCES.md)。

## 课程衔接

上一课：[把联系留在组内：KL 图划分实验课](https://fanqinzeng.github.io/eda-clustering-lab7-kl/)。这一课延续人物与教学风格，将给定二分的局部改善扩展到多个分区的构造、比较与容量检查。

## 本地生成英文配音

使用 Python 3.9–3.11，安装 `authoring/coqui-requirements.txt` 中固定的兼容依赖，并确保 `espeak-ng` 在 PATH 中。首次运行会下载 Coqui 的英文 VCTK/VITS 预训练模型，缓存位于项目 `.tools/tts-cache`。无需声音样本，生成期间不上传讲稿。

先保留中文制作得到的 `film/timeline.json`、`film/film-mix.wav` 和 `film/work/narration.wav`，然后运行：

```sh
python scripts/prepare_english_coqui.py --speaker p226
node scripts/render_film.cjs --english
python scripts/check_media.py --english
node scripts/build_site.mjs
python scripts/package_offline.py
```

`L8_FFMPEG` 可指定 FFmpeg 路径；影片渲染使用与中文版相同的 `L8_NODE_MODULES`、`L8_PYTHON` 等环境设置。英文逐句速度与时序记录见 `film/english-alignment.json`，英文字幕单独保存。模型权重与本地构建依赖不随仓库或离线包分发。
