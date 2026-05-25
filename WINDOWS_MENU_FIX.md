# Windows Per-Window Menu Diagnosis

## Root Cause

In `src/layout.tsx` line 52:

```tsx
{isMainWindow && renderTitleBar()}
```

The `isMainWindow` guard means tool windows (proxylist, breakpoint, etc.) never render any TitleBar.

## Why macOS Works but Windows Doesn't

### macOS
`tauri.conf.json` sets `"titleBarStyle": "Transparent"`. This means the native traffic light buttons (close/minimize/maximize) are embedded **inside** the webview content area. They are always visible and functional regardless of what the React app renders. The `w-20` spacer we add (`{isMac && <div className="w-20 ...">}`) only prevents content from overlapping the buttons — it is not required for the buttons to work.

So even when `{isMainWindow && renderTitleBar()}` skips the TitleBar, macOS tool windows still have working traffic lights and are closable/movable.

### Windows
Standard window decorations place the title bar with minimize/maximize/close buttons in a native frame **above** the webview. The React TitleBar renders **inside** the webview and provides:

1. **Drag region** (`data-tauri-drag-region`) — without it, the visible area of the window has no drag handle
2. **Platform controls** (`TitleBarPlatformControls`) — a secondary set of min/max/close buttons rendered inside the webview
3. **React menu** (`TitleBarCustomMenuTool`) — the hamburger menu with File, Edit, View, etc.

When `{isMainWindow && renderTitleBar()}` skips the TitleBar, none of these render. The window cannot be dragged or closed via the webview area.

## Fix

Remove the `isMainWindow` guard so `renderTitleBar()` runs on **all** windows:

```diff
- {isMainWindow && renderTitleBar()}
+ {renderTitleBar()}
```

## Secondary Issue: Duplicate Menus on Main Window

After fixing the above, the Windows main window will show **both** the native per-window menu (from Rust) AND the React hamburger menu. To fix:

1. Add `isMainWindowAtom` to `trafficAtoms.ts`
2. Set it once in `Layout.tsx`
3. In `TitleBarCustomMenuTool`, skip rendering on the main window:

```tsx
const [os] = useAtom(osAtom);
const [isMainWindow] = useAtom(isMainWindowAtom);
if (os === 'macos' || isMainWindow) return null;
```

This way:
- **macOS** — never show React menu (native global menu covers everything)
- **Windows/Linux main window** — never show React menu (has native per-window menu)
- **Windows/Linux tool windows** — show React menu (no native menu available)
