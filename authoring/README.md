# 教材构建

课件使用 `@oai/artifact-tool` 创建原生可编辑图形、文本和6张表格。讲义使用 ReportLab。两者读取 `data/tiny_graph.json`，构建时核对课程五节点图，输入改变后会要求同步修改讲解。课件各页均含讲者备注与来源链接。

## 运行

使用 Codex 的 bundled Node、Python 与依赖。设置：

- `RUNTIME_NODE_MODULES`：bundled Node 的 `node_modules` 目录。
- `LESSON8_PRESENTATIONS_SKILL`：已安装 Presentations skill 的绝对目录。
- `LESSON8_PYTHON`：bundled Python 可执行文件。

```sh
node authoring/create_slides.mjs
python3 authoring/export_slides_pdf.py
python3 authoring/build_guide.py
```

运行前按 Presentation/PDF skill 的要求标记一次 artifact operation。PPTX 的导出与验证记录、预览图留在忽略的 `build/materials/`。最终文件写入 `materials/`。

## 验证与预览

本次课件有16页、6张原生表格。finalizer 检查 PPTX 结构、16:9尺寸、文本几何、设计字体、表格所在页及 Artifact Tool 回读。所有课件与讲义页面还需逐页查看 PNG。

本机 bundled Artifact Tool 的直接 PDF 导出缺少 `#standard-fonts/Helvetica`。本机沙箱中的 LibreOffice 还缺少可用的中文字体，视觉检查发现其输出丢字，已弃用。因此 `export_slides_pdf.py` 从 Artifact Tool 的16张高清 PNG 生成对应的 PDF 预览。预览中的文字为图像；PPTX 的文字、图形与表格均保持原生可编辑。

讲义为6页，包含8题练习与完整解析。可通过 `pdfinfo` 检查页数，用 `pdftoppm` 渲染并逐页核对。`materials/CLASSROOM_PLAN.md` 以六分钟视频展示为主，另附可选45分钟拓展流程。
