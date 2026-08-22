# dsh-model-search 🔍

DSH (DeepSeek Harness) 模型搜索插件 — 为多平台模型选择提供快速搜索过滤功能。

配置了多个模型源（如商汤、百炼、小米、本地等）的用户，在切换模型时经常面对大量模型难以快速定位的问题。本插件在输入框右侧添加搜索按钮，点击后可通过关键词实时过滤所有平台的模型，并一键切换到当前会话。

## ✨ 功能特性

- 🔍 **跨平台搜索**：搜索覆盖所有配置的模型源（商汤、百炼、小米、本地等）
- ⚡ **实时过滤**：输入关键词即时筛选模型，支持平台名和模型名匹配
- 🚀 **一键切换**：选中模型后直接应用到当前聊天会话
- 💬 **平台-模型显示**：列表以 `平台  模型名` 格式单行展示，如 `商汤  deepseek-v4-flash`
- 🌙 **主题适配**：使用 DSH CSS 变量，自动适配亮色/暗色主题
- 📦 **即装即用**：安装后自动出现在输入框工具条，无需额外配置

## 📦 安装

### 通过 GitHub 安装

```bash
dsh plugin --profile web add github.com/<你的用户名>/dsh-model-search
```

### 通过 dshmarket 安装（发布后）

```bash
dsh plugin --profile web add dsh-model-search
```

安装后重启 DSH：

```bash
npx @deepseek-ai/dsh web
```

## 🚀 使用方法

1. 重启 DSH 后，打开任意聊天会话
2. 在输入框右下角（发送按钮左侧）找到 🔍 搜索按钮
3. 点击按钮打开搜索面板
4. 输入关键词（如 `qwen3.8`、`glm` 或平台名 `百炼`）
5. 列表会实时过滤，只显示匹配的 `平台  模型名`
6. 点击目标模型即可切换当前会话的模型

## 🧩 工作原理

```
┌─────────────────────────────────────────────────┐
│                   浏览器 (Client)               │
│                                                 │
│  ┌─────────────┐     ┌─────────────────────┐    │
│  │ 🔍 搜索按钮  │────▶│ 搜索面板 (React UI)  │    │
│  └─────────────┘     └──────────┬──────────┘    │
│                                 │               │
│                  fetch('/model-search/api/')    │
└────────────────────────────────┼────────────────┘
                                 ▼
┌─────────────────────────────────────────────────┐
│                  DSH 后端 (Host)                │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  GET  /model-search/api/models           │   │
│  │  POST /model-search/api/switch-model     │   │
│  └─────────────────────┬───────────────────┘   │
│                        │                       │
│  ┌─────────────────────▼───────────────────┐   │
│  │  settings 服务 (读取全部模型配置)         │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

- **Host 端** (`index.js`)：注册 HTTP API 端点，从 `settings` 服务读取所有模型源（`llm-pi-ai.providers`）的完整模型列表
- **Client 端** (`client.js`)：通过 `conversation.input.right` 插槽注册搜索按钮，渲染搜索面板，调用 `connection.api.sessions.selectModel` 切换当前会话模型

## 🔧 开发

```bash
# 克隆仓库
git clone https://github.com/<你的用户名>/dsh-model-search.git
cd dsh-model-search

# 语法检查
npm run check

# 本地安装测试
dsh plugin --profile web add /path/to/dsh-model-search
```

### 项目结构

```
dsh-model-search/
├── index.js            # Host 端：HTTP API（模型列表、切换模型）
├── client.js           # Client 端：搜索按钮 + 搜索面板 UI
├── cordis.patch.yml    # Cordis 插件注册配置
├── package.json        # 包元数据
├── README.md           # 本文档
└── LICENSE             # MIT 许可证
```

## 📄 许可证

[MIT](LICENSE) © 2025

## 🙏 致谢

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — DSH 平台