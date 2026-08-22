# dsh-model-search 🔍

DSH (DeepSeek Harness) plugin — adds cross-provider model search filtering to the model selector.

Users who configured multiple model sources (e.g. Shangtang, Bailian, Xiaomi, local) often face a long, hard-to-scan model list when switching. This plugin adds a search button to the input toolbar: click it, type a keyword, and all models across all providers are filtered in real time — select one to switch the current session instantly.

## ✨ Features

- 🔍 **Cross-provider search**: covers all configured model sources (Shangtang, Bailian, Xiaomi, local, etc.)
- ⚡ **Real-time filtering**: instant match on both provider name and model name
- 🚀 **One-click switch**: selecting a model applies it to the current chat session immediately
- 💬 **Provider-Model display**: each item shows `Provider  Model` on a single line, e.g. `商汤  deepseek-v4-flash`
- 🌙 **Theme-aware**: uses DSH CSS variables, auto-adapts to light/dark themes
- 📦 **Zero-config**: appears in the input toolbar automatically after install

## 📦 Installation

### From GitHub

```bash
dsh plugin --profile web add github:fanfan6/dsh-model-search
```

After install, restart DSH:

```bash
npx @deepseek-ai/dsh web
```

## 🚀 Usage

1. After restarting DSH, open any chat session
2. Find the 🔍 search button at the bottom-right of the input bar (left of the send button)
3. Click it to open the search panel
4. Type a keyword (e.g. `qwen3.8`, `glm`, or a provider name like `百炼`)
5. The list filters in real time — only matching `Provider  Model` entries are shown
6. Click the target model to switch the current session's model

## 🧩 How it works

```
┌─────────────────────────────────────────────────┐
│                   Browser (Client)               │
│                                                 │
│  ┌─────────────┐     ┌─────────────────────┐    │
│  │ 🔍 Button    │────▶│ Search Panel (React) │    │
│  └─────────────┘     └──────────┬──────────┘    │
│                                 │               │
│                  fetch('/model-search/api/')    │
└────────────────────────────────┼────────────────┘
                                 ▼
┌─────────────────────────────────────────────────┐
│                  DSH Host (Host)                │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  GET  /model-search/api/models           │   │
│  │  POST /model-search/api/switch-model     │   │
│  └─────────────────────┬───────────────────┘   │
│                        │                       │
│  ┌─────────────────────▼───────────────────┐   │
│  │  settings service (reads all providers) │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

- **Host** (`index.js`): registers HTTP API endpoints, reads the full model list from all providers via the `settings` service (`llm-pi-ai.providers`)
- **Client** (`client.js`): registers a search button in the `conversation.input.right` slot, renders the search panel, calls `connection.api.sessions.selectModel` to switch the current session's model

## 🔧 Development

```bash
# Clone
git clone https://github.com/fanfan6/dsh-model-search.git
cd dsh-model-search

# Syntax check
npm run check

# Local install for testing
dsh plugin --profile web add /path/to/dsh-model-search
```

### Project structure

```
dsh-model-search/
├── index.js            # Host: HTTP API (model list, model switch)
├── client.js           # Client: search button + search panel UI
├── cordis.patch.yml    # Cordis plugin registration
├── package.json        # Package metadata
├── README.md           # This document
└── LICENSE             # MIT License
```

## 📄 License

[MIT](LICENSE) © 2025

## 🙏 Acknowledgements

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — the DSH platform
