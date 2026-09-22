# Personal Obsidian Vault

A streamlined, robust, and keyboard-driven Obsidian vault customized with LazyVim-style modal mechanics and zero syntax lock-in.

## Architecture Highlights
- **Vim Mode & LazyVim Keybindings**: Built on `obsidian-vimrc-support` with Leader key (`<Space>`), `jk` fast escape, and `<Space>ff` navigation.
- **Pure Markdown**: WikiLinks disabled by default in favor of standard markdown relative links `[text](path.md)`.
- **Organized Attachments**: Auto-routed to `./assets`.
- **Fast Inputs**: Integrated with Slash Commander (`/`), Outliner, and URL-into-selection.
- **Deep Search**: Powered by Omnisearch (fuzzy matching + indexing).
- **Tokyo Night**: Dark reading surfaces, blue accents, and restrained frosted menus via the enabled `tokyo-night-glass` CSS snippet. Native window translucency and the `translucent-bg` / `dynamic-theme-background` plugins are disabled for predictable contrast.
- **Typography**: Maple Mono NF CN (the installed font's family name) across the interface, notes, code, and Vim indicators. Install this font on other machines; monospace is the fallback.
- **Vim status**: Vim starts enabled. A full-width desktop footer shows the mode at bottom left and pending command keys beside it. The command indicator appears only while a key sequence is pending and the editor has focus.

Editing Toolbar is disabled to remove the persistent top bar; its configuration is retained. Reload Obsidian after syncing these settings. Open a note in editing mode and check `i` / Escape, a pending `3` or `g`, and Vim off/on using Vim Toggle. The badge should return when Vim is re-enabled. The installed Tokyo Night manifest requires Obsidian 1.13.0 or later.
