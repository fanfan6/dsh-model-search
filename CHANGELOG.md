# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2025-08-22

### Added

- 🔍 Cross-provider model search: search across all configured model sources (Shangtang, Bailian, Xiaomi, local, etc.)
- ⚡ Real-time filtering by provider name and model name
- 🚀 One-click model switch: calls `session.selectModel` to switch the current session's model immediately
- 💬 Provider-Model single-line display: `Provider  Model` format, e.g. `商汤  deepseek-v4-flash`
- 🌙 Theme-aware UI using DSH CSS variables
- 📦 Zero-config: appears in the input toolbar automatically after install
- 🐛 Pet API handler: silences 404 errors from `@linxin666/dsh-pet` by returning empty responses for `/api/pet/*`
