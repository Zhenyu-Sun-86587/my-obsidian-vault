# Personal Obsidian Vault

A streamlined, robust, and keyboard-driven Obsidian vault customized with LazyVim-style modal mechanics and zero syntax lock-in.

## Architecture Highlights
- **Vim Mode & LazyVim Keybindings**: Built on `obsidian-vimrc-support` with Leader key (`<Space>`), `jk` fast escape, and `<Space>ff` navigation.
- **Pure Markdown**: WikiLinks disabled by default in favor of standard markdown relative links `[text](path.md)`.
- **Organized Attachments**: Auto-routed to `./assets`.
- **Fast Inputs**: Integrated with Slash Commander (`/`), Outliner, and URL-into-selection.
- **Deep Search**: Powered by Omnisearch (fuzzy matching + indexing).
- **Tokyo Night￼￼: Desktop acrylic through the editor and sidebars, bkiokyo Night**: Desktop acrylic through the editor and sidebars, blue accents, and bright text via the enabled `tokyo-night-glass` CSS snippet. Translucency is enabled in both app and appearance settings; `translucent-bg` requests native acrylic. Each pane gets one translucent tint; the plugin's additional dark overlay is set to zero to avoid stacking tints.
- **Typography**: Maple Mono NF CN (the installed font's family name) across the interface, notes, code, and Vim indicators. Install this font on other machines; monospace is the fallback.
- **Vim status**: Vim starts enabled. A full-width desktop footer shows the mode at bottom left and pending command keys beside it. The command indicator appears only while a key sequence is pending and the editor has focus.

Editing Toolbar is enabled, with a rounded dark glass top bar, light icons, blue hover states, and visible keyboard focus. Its commands and position settings are retained. Fully quit and restart Obsidian after syncing these settings. Open a note in editing mode and check `i` / Escape, a pending `3` or `g`, and Vim off/on using Vim Toggle. The badge should return when Vim is re-enabled. The installed Tokyo Night manifest requires Obsidian 1.13.0 or later.

## Windows acrylic verification

The installed plugin uses Electron's native `setBackgroundMaterial("acrylic")`, which requires **Windows 11 22H2 or later** ([Electron documentation](https://www.electronjs.org/docs/latest/api/browser-window#winsetbackgroundmaterialmaterial-windows)). CSS `backdrop-filter` frosts webview content; native acrylic supplies the actual desktop backdrop. This repository was edited on Linux, so Windows compositor behavior still needs verification on the target machine.

1. Enable Windows Settings → Accessibility → Visual effects → Transparency effects. Restart Obsidian with community plugins enabled and confirm Translucent BG and Editing Toolbar are loaded.
2. In a normal, non-fullscreen window, place a bright wallpaper or another window behind Obsidian. Confirm the blurred background shows through both a note and each sidebar in editing and reading modes. The installed plugin intentionally makes its overlay opaque in fullscreen or when its material is set to `none`.
3. Check the top toolbar, its dropdowns, hover/focus states, and formatting actions. Resize the window; toolbar buttons should wrap inside the rounded bar.
4. Focus an editor: check `i` / Escape and a pending `3` or `g`. The mode badge belongs at bottom left, with the gold pending-command stack immediately beside it. Toggle Vim off/on with Ctrl+Alt+V and confirm the badge returns.

If the native backdrop is absent, check Translucent BG notices for an unavailable Electron window/material API and verify the Windows version. Semi-transparent CSS alone cannot supply native desktop acrylic.
