var p = require("obsidian");

class VimModeStatusPlugin extends p.Plugin {
  constructor() {
    super(...arguments);
    this.currentCm = null;
    this.currentView = null;
    this.detachFns = [];
    this.hasSeenVimState = false;
    this.keyStack = "";
    this.currentMode = "OFF";
    this.stackTimeout = null;
  }

  async onload() {
    // 状态栏主胶囊 (显示 NORMAL / INSERT / VISUAL)
    this.statusEl = this.addStatusBarItem();
    this.statusEl.addClass("vim-mode-statusbar");
    this.statusEl.hide();

    // 状态栏按键栈胶囊 (显示 3k, 12j, d2w, g, y 等即时按键栈)
    this.stackEl = this.addStatusBarItem();
    this.stackEl.addClass("vim-key-stack-statusbar");
    this.stackEl.hide();

    this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
      this.attachToLeaf(leaf);
    }));

    this.registerEvent(this.app.workspace.on("layout-change", () => {
      let view = this.app.workspace.getActiveViewOfType(p.MarkdownView);
      if (view?.leaf) this.attachToLeaf(view.leaf);
    }));

    this.attachToLeaf(this.app.workspace.getMostRecentLeaf());
  }

  onunload() {
    this.clearAttach();
  }

  clearAttach() {
    for (let fn of this.detachFns) {
      try { fn(); } catch (e) {}
    }
    this.detachFns = [];
  }

  attachToLeaf(leaf) {
    this.clearAttach();
    this.hasSeenVimState = false;
    this.currentCm = null;
    this.currentView = null;
    this.keyStack = "";
    this.updateStackDisplay();

    let view = leaf?.view;
    if (!(view instanceof p.MarkdownView) || view.getMode() === "preview") {
      this.setMode("OFF");
      return;
    }

    this.currentView = view;
    let editor = view.editor;
    let cm = editor?.cm || editor?.cm6 || editor?.editorView || view.sourceMode?.cmEditor?.cm;
    this.currentCm = cm;
    this.refreshMode();

    let contentEl = view.contentEl.querySelector(".cm-editor") || view.contentEl.querySelector(".cm-content") || view.contentEl;

    // 核心按键捕获与栈计算 (Neovim showcmd 逻辑)
    let handleKeyDown = (e) => {
      // 延迟微秒读取 CodeMirror 内部 Vim state
      setTimeout(() => {
        this.inspectVimInternalState(e);
      }, 10);
    };

    let handleKeyUp = (e) => {
      setTimeout(() => {
        this.refreshMode();
      }, 10);
    };

    let handleMouse = () => {
      setTimeout(() => {
        this.refreshMode();
      }, 10);
    };

    contentEl.addEventListener("keydown", handleKeyDown, true);
    contentEl.addEventListener("keyup", handleKeyUp);
    contentEl.addEventListener("mouseup", handleMouse);
    contentEl.addEventListener("click", handleMouse);

    this.detachFns.push(() => {
      contentEl.removeEventListener("keydown", handleKeyDown, true);
      contentEl.removeEventListener("keyup", handleKeyUp);
      contentEl.removeEventListener("mouseup", handleMouse);
      contentEl.removeEventListener("click", handleMouse);
    });
  }

  inspectVimInternalState(event) {
    this.refreshMode();
    if (this.currentMode === "OFF" || this.currentMode === "INSERT") {
      this.keyStack = "";
      this.updateStackDisplay();
      return;
    }

    // 尝试提取 CodeMirror Vim 内部的 inputState
    let vimState = this.getVimState();
    let detectedStack = "";

    if (vimState && vimState.inputState) {
      let is = vimState.inputState;
      let parts = [];
      if (is.prefixRepeat) parts.push(is.prefixRepeat);
      if (is.operator) parts.push(is.operator);
      if (is.motionRepeat) parts.push(is.motionRepeat);
      if (is.motion) parts.push(is.motion);
      if (is.keyBuffer && is.keyBuffer.length > 0) parts.push(is.keyBuffer.join(""));
      detectedStack = parts.join("");
    }

    // 如果 CodeMirror 未及时更新 inputState，利用按键缓冲兜底显示
    if (!detectedStack && event && this.currentMode !== "INSERT") {
      let key = event.key;
      // 忽略单纯的控制键
      if (key && key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        if (/^[0-9ycdrvgmqzZfFtT]$/.test(key) || (this.keyStack && /^[0-9a-zA-Z]$/.test(key))) {
          this.keyStack += key;
          // 2秒未完成指令自动清空
          if (this.stackTimeout) clearTimeout(this.stackTimeout);
          this.stackTimeout = setTimeout(() => {
            this.keyStack = "";
            this.updateStackDisplay();
          }, 2000);
        } else {
          this.keyStack = "";
        }
      } else if (key === "Escape") {
        this.keyStack = "";
      }
    } else if (detectedStack) {
      this.keyStack = detectedStack;
    }

    this.updateStackDisplay();
  }

  updateStackDisplay() {
    if (!this.keyStack || this.currentMode === "OFF" || this.currentMode === "INSERT") {
      this.stackEl.hide();
    } else {
      this.stackEl.setText(this.keyStack);
      this.stackEl.show();
    }
  }

  getVimState() {
    let t = this.currentCm;
    if (!t) return null;
    return t?.state?.vim || t?.cm?.state?.vim || (t?.cm && t?.cm?.state ? t.cm.state.vim : null);
  }

  refreshMode() {
    let vimState = this.getVimState();
    let mode = "OFF";

    if (this.currentView) {
      let panel = this.currentView.contentEl.querySelector(".cm-vim-panel");
      if (panel) {
        let input = panel.querySelector("input");
        if (input?.ownerDocument.activeElement === input) mode = "COMMAND";
      }
    }

    if (mode === "OFF" && vimState) {
      this.hasSeenVimState = true;
      if (vimState.replace) mode = "REPLACE";
      else if (typeof vimState.mode === "string") {
        let m = vimState.mode.toUpperCase();
        if (m.includes("INSERT")) mode = "INSERT";
        else if (m.includes("VISUAL")) mode = "VISUAL";
        else if (m.includes("REPLACE")) mode = "REPLACE";
        else if (m.includes("CMD") || m.includes("COMMAND")) mode = "COMMAND";
        else mode = "NORMAL";
      } else if (vimState.insertMode) mode = "INSERT";
      else if (vimState.visualMode) mode = "VISUAL";
      else mode = "NORMAL";
    } else if (mode === "OFF" && this.hasSeenVimState) {
      mode = "NORMAL";
    }

    this.setMode(mode);

    // 如果处于 NORMAL 且无按键操作，定时检查清空按键栈
    if (this.keyStack && mode === "NORMAL") {
      let is = vimState?.inputState;
      if (!is || (!is.operator && !is.prefixRepeat && !is.motion && (!is.keyBuffer || is.keyBuffer.length === 0))) {
        // 命令已经执行完成（例如 3j 已跑完）
        setTimeout(() => {
          this.keyStack = "";
          this.updateStackDisplay();
        }, 150);
      }
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (mode === "OFF") {
      this.statusEl.hide();
      this.stackEl.hide();
      return;
    }

    this.statusEl.show();
    this.statusEl.setText(mode);
    this.statusEl.removeClass("is-normal", "is-insert", "is-visual", "is-replace", "is-command");

    switch (mode) {
      case "NORMAL": this.statusEl.addClass("is-normal"); break;
      case "INSERT": this.statusEl.addClass("is-insert"); this.keyStack = ""; this.updateStackDisplay(); break;
      case "VISUAL": this.statusEl.addClass("is-visual"); break;
      case "REPLACE": this.statusEl.addClass("is-replace"); break;
      case "COMMAND": this.statusEl.addClass("is-command"); break;
    }
  }
}

module.exports = VimModeStatusPlugin;
