# DSH Running Sessions

**一眼查看正在运行的 DSH 对话，一键跳转到对应会话。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![DSH](https://img.shields.io/badge/DSH-%E2%89%A50.2.2--rc.3%20%3C0.3.0-blue)
![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen)

`dsh-running-sessions` 是 DeepSeek Harness 的 Web UI 插件。在同时进行多个对话时，它把活动会话集中到一个实时列表，帮助你快速找到仍在执行任务或等待交互的对话。

[功能](#功能) · [安装](#安装) · [使用](#使用) · [工作原理](#工作原理) · [开发](#开发与测试) · [English](#english)

## 功能

| 功能 | 说明 |
| --- | --- |
| 实时活动数量 | 左侧栏底部显示「运行会话」入口和活动会话数量 |
| 会话信息 | 展示标题、状态、工作目录、更新时间及完整会话 ID |
| 一键跳转 | 点击会话整行，在 DSH 中打开对应对话 |
| 快速筛选 | 按标题、工作目录或会话 ID 筛选活动列表 |
| 等待交互提示 | 区分「运行中」与「等待交互」，避免遗漏等待答复的任务 |
| 子会话信息 | 显示会话目录中已列出的活动子会话及其父会话 ID |
| 折叠侧栏支持 | 侧栏折叠后保留图标和活动数量 |
| 主题与语言 | 使用 DSH 主题 tokens，提供中文和英文界面文本 |
| 键盘操作 | 支持 Escape 关闭、Tab 焦点约束及关闭后的焦点恢复 |

零第三方运行时依赖，无额外服务，也无需构建步骤。

## 环境要求

- DeepSeek Harness **Web UI**。
- 声明的 DSH 兼容范围：`>=0.2.2-rc.3 <0.3.0`。
- 当前安装与 API 核实基于 **DSH 0.2.2-rc.3**；兼容范围内其他版本未逐一验证。
- 运行本地测试需要 Node.js；插件本身使用 DSH 提供的 React 运行时。

## 安装

### 1. 克隆仓库

```bash
git clone https://github.com/tk553521/dsh-running-sessions.git
cd dsh-running-sessions
```

### 2. 在 DSH 中添加插件

打开 DSH 的 **插件 / Plugins** 管理页面，选择 **添加插件 / Add plugin**，以本地目录方式安装刚克隆的 `dsh-running-sessions` 目录，并确认插件已启用。

此项目以本地 bundle 目录安装，**无需执行 `npm install` 或构建命令**。它不是一个已发布到 npm 的安装包。

> 本地目录安装会引用该目录。安装后请保留目录；移动或删除它之前，应先从 DSH 中移除插件。

## 使用

1. 在 DSH 左侧栏底部找到 **运行会话**。
2. 点击入口，打开实时活动会话列表。
3. 查看会话标题、运行状态、目录、更新时间和会话 ID。
4. 在搜索框输入标题、目录片段或 ID，缩小列表范围。
5. 点击目标会话整行，跳转到对应对话。

按 **Escape**、点击 **关闭** 或点击弹窗外部，均可关闭列表。

### 活动状态如何计算？

- **运行中**：DSH 报告该会话正在执行。
- **等待交互**：DSH 报告该会话有待处理的用户交互，即使此时未处于执行状态，也会保留在列表中。
- 入口数量包含以上两种活动状态。
- 列表按会话元数据的更新时间倒序排列；更新时间不是任务开始时间或运行时长。

### 覆盖范围

列表覆盖**当前 DSH Host 会话目录**中的活动会话，不汇总其他独立运行的 DSH Host。子会话展示依赖它是否已出现在当前目录中。

插件只读取会话元数据并执行界面导航，不修改对话内容、不取消任务，也不更改模型或权限配置。

## 工作原理

```text
DSH 会话目录与实时状态
          │
          ├── useSessions
          └── useSessionStatus
                    │
                    ▼
             活动会话筛选与排序
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    侧栏入口和数量       弹窗列表与搜索
                              │ 点击
                              ▼
                  uiWorkspace.openSession
```

- 通过 DSH 的 selector hooks 订阅会话目录和状态，**不使用定时轮询**。
- 实时状态优先于目录缓存；实时 running 值未知时回退到目录值。
- 不扫描磁盘，不读取每个会话的完整历史，也不为展示列表保留未选中的会话。
- 使用 `sidebar.footer.action` 和 `shell.overlay` 的附加插槽，不替换 DSH 应用根节点或内置面板。
- 注册和组件资源随插件卸载或插槽卸载清理。

## 开发与测试

```bash
# JavaScript 语法检查
node --check index.js
node --check client.js

# 回归测试
node --test test/client.test.cjs
```

现有 7 项测试覆盖：

- 活动会话筛选与更新时间排序；
- 实时状态覆盖旧目录状态；
- 未知实时状态的回退；
- 等待交互的活动计数；
- 子会话与空列表；
- 同时间会话的确定性排序；
- 插槽、语言资源的注册及清理。

**验证边界：**安装生效和实时插槽注册已核实，以上回归测试已通过；测试未覆盖真实浏览器渲染、会话点击跳转、键盘焦点及明暗主题视觉效果。这些行为仍应在已认证的 DSH 页面中进行交互验证。

### 项目结构

```text
dsh-running-sessions/
├── client.js           # Web UI、活动筛选、列表和导航
├── index.js            # Host 入口
├── cordis.patch.yml    # DSH bundle 注册
├── package.json        # 包声明和资源导出
├── icon.svg            # 原创插件图标
├── locale/
│   ├── en.json         # 英文插件介绍
│   └── zh.json         # 中文插件介绍
├── test/
│   └── client.test.cjs # 回归测试
├── LICENSE             # MIT 开源协议
└── README.md
```

### 更新

```bash
git pull --ff-only
```

更新本地目录后，重启 DSH 以确保已安装包加载新的 JavaScript 模块，再检查插件是否保持启用。仅拉取文件不保证当前页面已经加载新版代码。

## 反馈与贡献

欢迎通过 [Issues](https://github.com/tk553521/dsh-running-sessions/issues) 提交问题或功能建议，也欢迎提交 Pull Request。

报告问题时请提供 DSH 版本、复现步骤、预期行为和实际行为。附带日志或截图前，请移除会话内容及私人路径等信息。

## 开源协议

本项目采用 **[MIT License](LICENSE)**，允许使用、修改和分发，包括商业用途；分发时请保留版权声明和协议文本。

Copyright © 2026 tk553521.

---

## English

**See active DSH conversations at a glance and jump to any session with one click.**

DSH Running Sessions is a lightweight DeepSeek Harness Web UI plugin. It adds a sidebar action with a live count and a searchable list of running or interaction-pending conversations.

### Features

- Live activity count, including conversations awaiting user interaction.
- Session title, status, working directory, update time and full session ID.
- One-click navigation through DSH's `uiWorkspace.openSession` API.
- Filtering by title, directory or ID.
- Catalog-listed subagent sessions with parent IDs.
- Chinese and English UI text and host theme tokens.
- No third-party runtime dependencies, polling, extra server or build step.

### Install

```bash
git clone https://github.com/tk553521/dsh-running-sessions.git
```

In DSH, open **Plugins → Add plugin**, install the cloned directory as a local bundle and enable it. Keep the directory after installation. No `npm install` is required, and this project is not published to npm.

Declared compatibility: `>=0.2.2-rc.3 <0.3.0`. Installation and API contracts were verified on DSH **0.2.2-rc.3**, not on every version in that range.

### Use

Click **Running sessions** at the sidebar foot. Filter the list if needed, then click a session row to open its conversation. Press Escape, click Close or click outside the dialog to dismiss it.

The list covers the current DSH Host's session catalog, not separate DSH Hosts. “Updated” is a metadata timestamp, not elapsed execution time. The plugin does not modify conversations or stop tasks.

### Tests and verification

```bash
node --test test/client.test.cjs
```

Seven regression tests cover selection, live-status precedence, fallback, pending interactions, subagent rows, sorting and registration cleanup. Installation and live slot registration were verified. Real-browser rendering, navigation, focus behavior and light/dark appearance still require verification in an authenticated DSH page.

### License

[MIT](LICENSE) © 2026 tk553521.
