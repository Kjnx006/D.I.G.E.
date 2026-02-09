# AGENTS.md

本文档为 AI Agent（Cursor、Copilot、Codex 等）提供项目级开发规范。  
Agent 在处理本项目代码时 **必须** 遵循以下规则。

---

## 项目概览

- **名称**：D.I.G.E.（Dijiang Integrated Generator Efficiency）
- **用途**：明日方舟：终末地（Arknights: Endfield）热能池最优发电方案计算器
- **技术栈**：React 19 + Vite + Tailwind CSS v4 + Chart.js
- **包管理**：pnpm
- **支持语言**：中文 (zh)、英文 (en)、日文 (ja)、韩文 (ko)、俄文 (ru)、法文 (fr)、德文 (de)

---

## i18n 多语言翻译（强制规则）

### 翻译工具

项目提供命令行翻译工具 `scripts/i18n-translate.ts`。  
**任何涉及新增、修改、删除翻译 key 的操作，必须通过此工具完成，禁止手动编辑 locale JSON 文件。**

### 命令

```bash
# 检查各语言的同步状态
pnpm run i18n:translate

# 新增 / 更新翻译（必须同时提供 7 种语言）
pnpm run i18n:translate add <key> --zh "中文" --en "English" --ja "日本語" --ko "한국어" --ru "Русский" --fr "Français" --de "Deutsch"

# 批量新增（一条命令添加多个 key）
pnpm run i18n:translate add <key1> --zh "..." --en "..." --ja "..." --ko "..." --ru "..." --fr "..." --de "..." \
                         add <key2> --zh "..." --en "..." --ja "..." --ko "..." --ru "..." --fr "..." --de "..."

# 删除 key
pnpm run i18n:translate delete <key1> [<key2> ...]

# 清理代码中未使用的 key
pnpm run i18n:prune --write
```

### 工作流

1. 确定需要新增的 key 名称（camelCase，语义清晰）
2. 翻译为全部 7 种语言
3. 使用 `pnpm run i18n:translate add` 命令一次性写入
4. 脚本会自动校验同步状态，确认输出 `All locale files are in sync`

### 翻译规范

| 规则 | 说明 |
|------|------|
| Source of truth | **zh (中文)** 为基准，其他语言以 zh 的 key 集合为标准 |
| 语言完整性 | 每个 key 必须同时提供 zh / en / ja / ko / ru / fr / de 七种翻译，缺一不可 |
| 翻译质量 | 符合游戏（明日方舟：终末地）语境，简洁专业 |
| 术语一致 | 保持各语言间术语统一（如 震荡发电 → Oscillating → 振動 → 진동） |
| Key 命名 | camelCase，语义清晰，如 `fuelConsumption`、`minBatteryPercent` |
| 文件格式 | 扁平 key-value JSON，禁止嵌套结构 |

### 禁止事项

- ❌ 手动编辑 `locales.*.json` 文件来添加/修改翻译
- ❌ 只添加部分语言（必须 7 语言齐全）
- ❌ 使用嵌套结构
- ❌ 留下未翻译的占位符（如 `"TODO"`、空字符串）

### 文件结构

```
src/i18n/
├── index.jsx          # I18nProvider + useI18n hook
├── locales.js         # locale 文件导入汇总
├── locales.zh.json    # 中文 (source of truth)
├── locales.en.json    # 英文
├── locales.ja.json    # 日文
├── locales.ko.json    # 韩文
├── locales.ru.json    # 俄文
├── locales.fr.json    # 法文
└── locales.de.json    # 德文

scripts/
├── i18n-translate.ts  # 一键翻译命令行工具
└── i18n-prune.ts      # 未使用 key 清理工具
```

---

## 通用开发规范

### 代码风格

- 组件使用 `.jsx` 文件，函数式组件 + Hooks
- 样式使用 Tailwind CSS 实用类，不写自定义 CSS
- 工具脚本使用 TypeScript (`.ts`)，通过 `tsx` 运行

### 响应式设计

- 移动端优先，使用 Tailwind 的 `sm:` / `md:` 断点
- 侧边栏在移动端为抽屉式叠加，桌面端为固定面板

### 提交前检查

- 运行 `pnpm run i18n:translate` 确认翻译同步
- 确保无 linter 错误
- 不提交包含 secrets 的文件
