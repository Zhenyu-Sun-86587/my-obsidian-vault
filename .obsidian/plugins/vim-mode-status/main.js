var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VimModeStatusPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

var DEFAULT_SETTINGS = {
  showInStatusBar: true
};

var VimModeStatusPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.currentMode = null;
    this.keyBuffer = "";
    this.clearTimer = null;
  }

  async onload() {
    await this.loadSettings();
    
    // 1. 创建 NORMAL 模式状态胶囊
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass("vim-mode-status-item");
    if (this.statusBarItem.parentElement) {
      this.statusBarItem.parentElement.prepend(this.statusBarItem);
    }
    
    // 2. 创建 Neovim 纯正按键栈胶囊 (showcmd)
    this.cmdStackItem = this.addStatusBarItem();
    this.cmdStackItem.addClass("vim-cmd-stack-item");
    this.cmdStackItem.style.display = "none";
    if (this.statusBarItem.parentElement) {
      this.statusBarItem.insertAdjacentElement("afterend", this.cmdStackItem);
    }

    // 3. 注册全局按键捕获 (捕获挂起按键)
    this.registerDomEvent(window, "keydown", (evt) => {
      this.handleKeyDown(evt);
    }, true);

    // 4. 定时更新 Vim 模式
    this.registerInterval(
      window.setInterval(() => {
        this.updateStatus();
      }, 80)
    );
    this.updateStatus();
  }

  handleKeyDown(evt) {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!this.settings.showInStatusBar || !this.app.vault.getConfig("vimMode") ||
        !activeView?.editor?.hasFocus()) {
      this.resetStack();
      return;
    }
    if (this.currentMode !== "NORMAL" && this.currentMode !== "VISUAL") {
      this.resetStack();
      return;
    }

    // 忽略辅助功能键
    if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(evt.key)) {
      return;
    }

    // 按 Esc / Ctrl+[ 强制立即清空指令栈
    if (evt.key === "Escape" || (evt.ctrlKey && evt.key === "[")) {
      this.resetStack();
      return;
    }

    // 忽略带 Ctrl / Alt / Meta 的快捷键组合
    if (evt.ctrlKey || evt.altKey || evt.metaKey) {
      this.resetStack();
      return;
    }

    const key = evt.key;

    // A. 正在输入数字计数器 (如 3, 12)
    if (/^[0-9]$/.test(key)) {
      if (this.keyBuffer === "" && key === "0") {
        this.resetStack();
        return;
      }
      this.keyBuffer += key;
      this.renderStack();
      return;
    }

    // B. 操作符或多键前缀 (Operator / Prefix Pending)
    if (["g", "d", "y", "c", "r", "m", "z", "f", "F", "t", "T", '"', "'", "`"].includes(key) || (this.keyBuffer === "" && key === " ")) {
      const displayKey = (key === " ") ? "<Space>" : key;
      this.keyBuffer += displayKey;
      this.renderStack();
      return;
    }

    // C. 如果当前栈里有挂起的前缀指令或数字，当前按键意味着动作完成！
    if (this.keyBuffer.length > 0) {
      // 动画展示 150ms 提示执行完成，然后优雅清退
      this.keyBuffer += (key === " " ? "<Space>" : key);
      this.cmdStackItem.setText(this.keyBuffer);
      if (this.clearTimer) clearTimeout(this.clearTimer);
      this.clearTimer = setTimeout(() => {
        this.resetStack();
      }, 150);
      return;
    }

    // D. 普通单键移动指令 (如 j, k, h, l, w, b, x, u, p) -> 立即触发，栈不残留
    this.resetStack();
  }

  renderStack() {
    if (!this.keyBuffer) {
      this.cmdStackItem.style.display = "none";
      return;
    }
    this.cmdStackItem.setText(this.keyBuffer);
    this.cmdStackItem.style.display = "inline-block";
    
    // 超时安全保护: 如果用户按了数字后发呆 3 秒没有后续动作，自动清空
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => {
      this.resetStack();
    }, 3000);
  }

  resetStack() {
    this.keyBuffer = "";
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
    this.cmdStackItem.setText("");
    this.cmdStackItem.style.display = "none";
  }

  updateStatus() {
    const isVimEnabled = this.app.vault.getConfig("vimMode");
    if (!isVimEnabled || !this.settings.showInStatusBar) {
      this.currentMode = null;
      this.statusBarItem.setText("");
      this.statusBarItem.style.display = "none";
      this.resetStack();
      return;
    }

    const mode = this.detectMode();
    if (mode !== this.currentMode) {
      this.currentMode = mode;
      this.resetStack(); // 模式发生切换时（如切到 Insert），强制清空残余按键
      this.renderMode(mode);
    }
  }

  detectMode() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!activeView || !activeView.editor) {
      return null;
    }

    const editor = activeView.editor;
    // @ts-ignore
    const cm = editor.cm;
    if (!cm) return null;

    // CM6 exposes the Vim adapter as cm.cm; older editors expose it directly.
    const editorWindow = cm.dom?.ownerDocument?.defaultView || window;
    const vimApi = editorWindow.CodeMirrorAdapter?.Vim;
    for (const adapter of [cm.cm, cm].filter(Boolean)) {
      let apiState;
      try {
        apiState = vimApi?.getVim?.(adapter);
      } catch (e) {
        // Some adapter versions only accept the nested CodeMirror instance.
      }
      for (const vim of [apiState, adapter.state?.vim]) {
        if (!vim) continue;
        if (vim.mode === "insert" || vim.insertMode) return "INSERT";
        if (vim.mode === "visual" || vim.visualMode) return "VISUAL";
        if (vim.mode === "normal") return "NORMAL";
      }
    }

    // An unrecognized state is not proof of NORMAL: try the rendered cursor.
    const dom = cm.dom || cm.getWrapperElement?.();
    const cursor = dom?.querySelector(".cm-cursor, .CodeMirror-cursor");
    if (cursor) {
      if (cursor.classList.contains("cm-vim-cursor-insert")) return "INSERT";
      if (cursor.classList.contains("cm-vim-cursor-visual")) return "VISUAL";
      if (cursor.classList.contains("cm-fat-cursor") || dom.classList.contains("cm-fat-cursor")) return "NORMAL";
      const style = editorWindow.getComputedStyle(cursor);
      // Insert uses a thin caret; normal/visual use a character-width block.
      const width = parseFloat(style.width);
      if (width <= 2 && parseFloat(style.borderLeftWidth) > 0) return "INSERT";
    }

    return "NORMAL";
  }

  renderMode(mode) {
    if (!mode) {
      this.statusBarItem.setText("");
      this.statusBarItem.style.display = "none";
      return;
    }

    this.statusBarItem.setText(mode);
    this.statusBarItem.style.display = "inline-block";
    this.statusBarItem.removeClass("mode-normal", "mode-insert", "mode-visual", "mode-replace");
    this.statusBarItem.addClass(`mode-${mode.toLowerCase()}`);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
    this.statusBarItem.remove();
    this.cmdStackItem.remove();
    this.resetStack();
  }
};
