# Python 图解算法

在线体验：<https://python-learning.haizakura.workers.dev>

面向**零基础**的数据结构与算法互动教程。每一课都有图文讲解、可以单步播放的算法动画（同步高亮 Python 代码和变量）、能直接在浏览器里运行的 Python 代码、小测验和自动判题的编程练习。

- 不需要安装任何软件，不需要登录注册
- 学习进度自动保存在浏览器的 `localStorage` 中，下次打开自动回到上次的课程和阅读位置（不跨设备同步）
- 纯静态网站，无构建步骤、无 npm 依赖，可部署到 Cloudflare Workers 或发布为 Claude Artifact

## 课程目录（21 课）

| 部分 | 课程 |
| --- | --- |
| 起步 | 什么是数据结构与算法 · Python 入门（上）（下） · 时间复杂度 |
| 线性数据结构 | 数组 · 链表 · 栈 · 队列 · 哈希表 |
| 算法思想 | 递归 · 二分查找 |
| 排序算法 | 冒泡 · 选择 · 插入 · 归并 · 快速 |
| 树与图 | 二叉树与遍历 · 二叉搜索树 · 堆与优先队列 · 图（BFS / DFS） |
| 总结 | 复杂度速查表 · 排序大比拼 · 进阶路线 |

## 本地运行

需要 Python 3（只用于本地静态服务器和测试）。

```bash
python3 scripts/dev_server.py 8000
```

打开 <http://localhost:8000>。这个开发服务器会禁止浏览器缓存，改完代码刷新即可。也可以用 `npm run dev`。

## 测试

```bash
node tests/check.mjs
```

需要 Node.js 18+ 和 `python3`。它会检查：

- 课程结构（id、内容块类型、测验答案下标、组件名）
- 每个动画动作都能用默认输入和随机输入跑完，代码行标记都能找到
- 五种排序在 1000+ 组随机数据上结果正确，堆始终满足堆性质
- 用本机 CPython 运行全部 Python：示例代码要和标注的输出完全一致，练习的参考答案必须通过测试，初始代码必须不通过

网页里实际运行 Python 的是 Skulpt。要确认课程代码在 Skulpt 中表现一致，打开网站，把 `tests/skulpt-selftest.js` 的内容粘贴到浏览器开发者工具的 Console 中运行。

## 部署

### Cloudflare Workers（纯静态资源）

```bash
npx wrangler@4 login     # 首次
npx wrangler@4 deploy
```

配置在 [wrangler.jsonc](wrangler.jsonc)，直接把 `public/` 目录作为静态资源发布，不需要 Worker 脚本。如果登录的 Cloudflare 账号下有多个 account，先设置环境变量 `CLOUDFLARE_ACCOUNT_ID` 指定要部署到哪一个，否则 wrangler 会停下来让你选。

### Claude Artifacts

```bash
node scripts/build-artifact.mjs
```

生成 `dist/artifact.html`：所有 CSS/JS 内联成一个文件，去掉 `<html>/<head>/<body>` 外壳（Artifacts 会自动加上）。把这个文件发布为 Artifact 即可。

## 项目结构

```
public/                 网站本体（直接部署这个目录）
  index.html            页面骨架，按顺序加载下面的脚本
  css/style.css         全部样式（含明暗两套配色）
  js/core.js            全局命名空间 DSA 与纯函数工具（Node 测试也加载它）
  js/store.js           学习进度的读写（localStorage）
  js/python.js          浏览器内 Python 运行（Skulpt）、错误白话解释、代码高亮
  js/views.js           可视化渲染器：数组/柱状图、栈、链表、哈希表、树、堆、图
  js/player.js          动画播放器：录制步骤、播放控制、代码行高亮、变量表
  js/blocks.js          内容块：图文、提示、代码、测验、编程练习
  js/widgets.js         独立交互组件：猜数字、复杂度曲线、排序大比拼
  js/lessons/*.js       课程内容（纯数据 + 步骤生成器）
  js/app.js             路由、目录、首页、课程页、进度恢复
scripts/
  dev_server.py         本地开发服务器（禁用缓存）
  build-artifact.mjs    打包成单文件 Artifact
tests/
  check.mjs             课程内容自检（Node + CPython）
  skulpt-selftest.js    浏览器内 Skulpt 一致性自检
docs/
  ARCHITECTURE.md       架构、数据模型、进度存储、Python 运行环境
  ADDING_LESSONS.md     如何新增课程、动画和练习
```

## 后续开发

- 新增或修改课程：阅读 [docs/ADDING_LESSONS.md](docs/ADDING_LESSONS.md)
- 理解整体设计：阅读 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
