# AI MT5 Studio

A local-first desktop-style AI coding environment for MQL5 Expert Advisor and Pine Script development.

## Features

- **Monaco Editor** with MQL5 syntax highlighting and autocomplete
- **AI-powered code generation** via OpenRouter API (streaming)
- **Multi-file workspace** with tabs (create, rename, delete, duplicate)
- **Prompt templates** for common tasks (Build EA, Convert Pine Script, Debug, etc.)
- **Structured AI output** — files are automatically created in the workspace
- **Import/Export** — .mq5, .mqh, .pine, .txt files + ZIP export
- **Persistent state** — workspace and conversation saved in localStorage

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

### 4. Add your API key
- Click the **⚙ Settings** button (top right)
- Paste your [OpenRouter API key](https://openrouter.ai/keys)
- Choose a model (default: `cohere/north-mini-code:free` — free tier)
- Click **Save Settings**

## Usage

### Building an EA
1. Click **"Build EA"** in the left sidebar
2. Describe your strategy in the prompt bar
3. The AI generates a complete `.mq5` file
4. Files appear automatically in the editor tabs

### Converting Pine Script
1. Click **"Pine Script → MQL5"** template
2. Paste your Pine Script code into the prompt
3. The AI outputs a complete MQL5 equivalent

### Debugging
1. Open your MQL5 file in the editor
2. Click **"Debug Compiler Errors"** template
3. Paste the error messages from MetaEditor
4. The AI analyzes and fixes the errors in your file

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send prompt |
| `Shift+Enter` | New line in prompt |
| `Ctrl+G` | Go to line (in editor) |
| Right-click tab | Rename / Duplicate / Delete |

## Tech Stack

- React 18 + Vite
- TailwindCSS
- Monaco Editor (`@monaco-editor/react`)
- OpenRouter API (streaming)
- JSZip (for ZIP export)
- react-markdown (chat rendering)

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── chat/          # ChatPanel, ChatMessage, PromptBar, PromptInjector
│   ├── editor/        # CodeEditor, FileTabs, EditorToolbar
│   ├── layout/        # TopBar, SettingsModal
│   └── sidebar/       # Sidebar with templates
├── context/
│   └── WorkspaceContext.jsx   # Central state management
├── hooks/
│   ├── useChat.js             # AI interaction logic
│   └── useFileManager.js      # Import/export logic
├── services/
│   └── openrouter.js          # API calls + streaming
├── utils/
│   └── templates.js           # Prompt templates
└── styles/
    └── globals.css
```
