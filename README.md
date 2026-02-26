# Claude Sessions Stream Deck Plugin

一个用于 Stream Deck 的插件，用来显示当前活跃的 Claude Code 会话，并支持一键聚焦到对应的 Ghostty 终端窗口。

## 功能特性

- 在按键上展示会话状态（`working` / `idle` / `permission`）
- 展示项目名与最近活动时间（如 `5m ago`）
- 无会话时显示 `No Session`
- 按下按键后，尝试聚焦包含该项目名的 Ghostty 窗口
- 自动监听会话状态文件变化，实时刷新按键图像

## 技术栈

- Node.js 20（插件清单要求）
- TypeScript
- Rollup
- `@elgato/streamdeck` SDK

## 项目结构

- `src/plugin.ts`：插件入口，注册并连接动作
- `src/actions/claude-session.ts`：Stream Deck 动作实现（显示、刷新、按键响应）
- `src/lib/session-watcher.ts`：监听和读取会话状态文件
- `src/lib/button-renderer.ts`：SVG 按键渲染与 Base64 转换
- `src/lib/terminal-focus.ts`：通过 AppleScript 聚焦 Ghostty
- `com.chris.claude-sessions.sdPlugin/manifest.json`：Stream Deck 插件清单

## 数据来源与约定

插件从以下文件读取会话状态：

- `~/.claude/hooks/streamdeck/sessions.json`

状态文件格式（根据当前代码推断）：

```json
{
  "version": 1,
  "updated_at": 1735660800,
  "sessions": {
    "session-id-1": {
      "project": "my-project",
      "cwd": "/path/to/project",
      "status": "working",
      "started_at": 1735657000,
      "last_event": 1735660700,
      "last_event_type": "message",
      "pid": 12345
    }
  }
}
```

说明：

- `status` 支持：`working`、`idle`、`permission`
- 插件会过滤僵尸会话（默认 10 分钟无事件）
- 若存在 `pid`，插件会检查进程是否存活，死亡进程会被忽略

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 构建

```bash
npm run build
```

产物位置：

- `com.chris.claude-sessions.sdPlugin/bin/plugin.js`

### 3) 开发监听

```bash
npm run watch
```

## 在 Stream Deck 中联调

项目提供了快捷命令：

```bash
npm run link
```

该命令会执行：

- `streamdeck link com.chris.claude-sessions.sdPlugin`

你需要本机已安装可用的 `streamdeck` CLI，且 Stream Deck 软件版本满足清单要求（`>= 6.5`）。

## 使用方式

1. 在 Stream Deck 中添加 `Claude Session` 动作到一个或多个按键。
2. 确保你的 Claude Hook 或外部脚本持续更新 `sessions.json`。
3. 按键会按会话顺序显示状态；空槽位显示 `No Session`。
4. 按下已绑定会话的按键，会尝试聚焦到对应 Ghostty 窗口。

## 已知限制

- 目前仅声明支持 macOS（清单中 `Platform: mac`）
- 终端聚焦逻辑依赖 Ghostty + AppleScript
- 会话数据生产（写入 `sessions.json`）不在本仓库中，需要外部提供

## 常见问题

- 按键一直显示 `No Session`
  - 检查 `~/.claude/hooks/streamdeck/sessions.json` 是否存在并有合法 JSON
  - 检查文件是否持续更新（`updated_at` / `last_event`）
- 按键按下后没有切到终端
  - 确认 Ghostty 正在运行
  - 确认窗口标题包含会话中的 `project` 名称
  - 检查系统辅助功能权限是否允许相关自动化操作

