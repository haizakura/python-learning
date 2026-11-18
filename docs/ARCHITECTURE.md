# 架构说明

## 设计取舍

| 决定 | 原因 |
| --- | --- |
| 纯静态网站，无构建、无 npm 依赖 | 同一份 `public/` 可以直接部署到 Cloudflare Workers；打包脚本只做“内联”就能发布为 Artifact |
| 普通 `<script>`（非 ES Module），共享全局对象 `DSA` | 内联成单文件时不需要打包器；Node 测试可以用 `vm` 直接加载 |
| 课程是数据，动画是生成器 | 新增课程不用改引擎；动画逻辑可以在 Node 里测试 |
| 浏览器内 Python 用 Skulpt | 只需加载两个脚本，不需要 fetch 或 WebAssembly，能在 Artifacts 的 CSP 下运行（Pyodide 需要 fetch wasm，会被拦截） |
| 进度存 `localStorage` | 需求明确不需要登录和跨设备同步 |
| 路由用 `#课程id` | Artifacts 只保留形如 `#name` 的 hash，Workers 上也无需服务端路由 |

## 脚本加载顺序

`index.html` 中的顺序就是依赖顺序：

```
core.js → store.js → python.js → views.js → blocks.js → player.js → widgets.js → lessons/*.js → app.js
```

- `core.js` 定义 `DSA`，加载时不访问 DOM。
- `views.js`、`blocks.js`、`player.js`、`widgets.js` 只注册函数，加载时同样不访问 DOM，所以测试脚本可以加载它们。
- 课程文件调用 `DSA.lesson({...})` 注册课程，**注册顺序就是课程顺序**。
- `app.js` 最后执行，负责渲染页面。

## 全局对象 DSA

| 成员 | 说明 |
| --- | --- |
| `DSA.lessons` | 课程数组 |
| `DSA.lesson(def)` | 注册课程 |
| `DSA.blocks[type](block, ctx)` | 内容块渲染器，返回 DOM 元素 |
| `DSA.views[type](el, data, hl, opts)` | 可视化渲染器 |
| `DSA.widgets[name](el, block, ctx)` | 独立交互组件 |
| `DSA.algo[name]` | 共享的步骤生成器（目前是五种排序） |
| `DSA.record(action, state, arg)` | 运行生成器并录制所有帧 |
| `DSA.parseCode(src)` | 解析 Python 代码里的 `#@标记`，返回 `{text, lines, at}` |
| `DSA.store` | 进度存储 |
| `DSA.py.run(code, opts)` | 运行 Python，返回 `{ok, out, error?, unavailable?}` |
| `DSA.items(values)` | 把值数组变成带唯一 id 的 `[{id, v}]`，供可视化追踪元素移动 |

## 动画模型

```
动作(action) ──run(state, 输入)──▶ 生成器 yield {at, msg, hl, vars}
                                        │
DSA.record 每次 yield 时深拷贝 state ───┘──▶ frames[] = {s, hl, line, msg, vars}
                                                   │
播放器按下标显示某一帧 ◀─────────────────────────────┘
  ├─ views 渲染 frame.s[key]，按 frame.hl 加高亮
  ├─ 代码面板高亮 frame.line（由 #@标记 换算）
  ├─ 说明文字 frame.msg
  └─ 变量表 frame.vars
```

- 所有帧在动作开始时一次性录好，所以可以随意前进、后退。
- 状态必须是纯 JSON（会被 `JSON.parse(JSON.stringify())` 深拷贝）。
- 动作结束后的最终状态会保留，下一个动作在它的基础上继续（例如连续压栈）。`fresh: true` 的动作每次都从 `init()` 重新开始。
- 列表类视图用 FLIP 技术做移动动画：元素按 `id` 复用，位置变化时从旧位置平滑移动到新位置。所以交换元素时要交换整个 `{id, v}` 对象，而不是只交换 `v`。

## 进度存储

键名 `pyalgo-progress-v1`，值为 JSON：

```json
{
  "v": 1,
  "last": "bubble-sort",
  "scroll": { "bubble-sort": 1200 },
  "visited": { "welcome": 1795017282832 },
  "done": { "welcome": 1795017300000 },
  "quiz": { "welcome:4": 1 },
  "ex": { "python-basics-2:13": true },
  "code": { "python-basics-2:13": "def sum_to(n): ..." }
}
```

| 字段 | 含义 |
| --- | --- |
| `last` | 最后打开的课程。打开网站且地址里没有 `#课程id` 时自动跳转到这里 |
| `scroll` | 每课的滚动位置，自动恢复时使用 |
| `visited` / `done` | 打开过 / 点了“完成本课”的时间戳 |
| `quiz` | 测验选择的选项下标，键是 `课程id:块序号` |
| `ex` / `code` | 练习是否通过 / 编辑器里的代码 |

注意事项：

- **块序号是键的一部分**。在已发布课程的中间插入或删除内容块，会让之后测验和练习的已存答案错位。尽量在末尾追加；必须调整时，可以接受旧答案失效，或者升级版本号（`v: 2`）并写迁移。
- 所有读写都包在 try/catch 里。隐私模式或禁用存储时用空进度继续，并在侧边栏提示“进度无法保存”。
- 代码编辑是防抖写入（400ms），页面隐藏或关闭时立即写入。

## Python 运行环境（Skulpt）

- 第一次点击“运行”时才从 jsDelivr 加载 `skulpt@1.2.0`（约 1MB），之后复用。
- `execLimit: 5000` 毫秒：死循环会被自动停止，并给出白话解释；`yieldLimit: 100` 让长时间运行的代码定期让出主线程，页面不会卡死。
- `input()` 被禁用，会提示“请直接给变量赋值”（Artifacts 里 `prompt()` 不可用）。
- Skulpt 自带的 `heapq` 只是占位，`python.js` 里用一份纯 Python 实现替换了它。
- **Skulpt 不支持的语法**：`nonlocal`；缩进错误会被报告为 `SyntaxError`。写课程代码时避开 `nonlocal`，并用 `tests/skulpt-selftest.js` 验证。
- 常见错误（`NameError`、`IndexError`、`TypeError` 等）会附带中文白话解释，见 `python.js` 中的 `FRIENDLY`。
- 运行环境加载失败（网络受限，或安全策略禁止）时，代码块会显示 `out` 字段里的“预期输出”作为替代。

## 外部资源

| 资源 | 用途 | 失败时 |
| --- | --- | --- |
| `cdn.jsdelivr.net/npm/skulpt@1.2.0` | 运行 Python | 显示提示和预期输出，其他功能不受影响 |
| `fonts.googleapis.com` | Space Grotesk、JetBrains Mono 字体 | 由 JS 异步注入，不阻塞渲染，失败时使用系统字体 |

两者都在 Artifacts 的 CSP 白名单内。

## 页面与样式

- 颜色全部是 `:root` 上的 CSS 变量，深色模式在 `prefers-color-scheme: dark` 和 `[data-theme="dark"]` 下重新定义同一组变量。
- 高亮类名统一为 `m-<名称>`，例如 `m-cmp`（黄，比较中）、`m-swap`（红，交换/移动）、`m-done`（绿，完成）、`m-active`（蓝，当前）、`m-dim`（变淡）。
- 代码字体关闭了连字，保证新手看到的是 `!=` 而不是 `≠`。
- 宽度 ≤ 900px 时侧边目录变为抽屉；页面在 375px 宽度下无横向滚动。
- 尊重 `prefers-reduced-motion`：开启时关闭所有过渡动画。
