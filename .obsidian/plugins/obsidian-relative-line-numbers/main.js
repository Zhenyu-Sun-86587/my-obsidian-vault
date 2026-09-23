/*
THIS IS A CUSTOM REFACTORED FILE BY HERMES FOR UNIFIED SINGLE-GUTTER RELATIVE LINE NUMBERS
Eliminates redundant absoluteLineNumberGutter to fix Live Preview misalignment and visual jitter.
*/
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __toModule = (module2) => {
  return module2 && module2.__esModule ? module2 : { default: module2 };
};

var main_exports = {};
__export(main_exports, {
  default: () => RelativeLineNumbers
});
module.exports = main_exports;

var import_obsidian = __toModule(require("obsidian"));
var import_view = __toModule(require("@codemirror/view"));
var import_language = __toModule(require("@codemirror/language"));

function linesCharLength(state) {
  return state.doc.lines.toString().length;
}

function relativeLineNumbers(lineNo, state) {
  const charLength = linesCharLength(state);
  const blank = " ".padStart(charLength, " ");
  if (lineNo > state.doc.lines) {
    return blank;
  }
  const cursorLine = state.doc.lineAt(state.selection.main.head).number;
  const start = Math.min(state.doc.line(lineNo).from, state.selection.main.head);
  const stop = Math.max(state.doc.line(lineNo).from, state.selection.main.head);
  const folds = (0, import_language.foldedRanges)(state);
  let foldedCount = 0;
  folds.between(start, stop, (from, to) => {
    let rangeStart = state.doc.lineAt(from).number;
    let rangeStop = state.doc.lineAt(to).number;
    foldedCount += rangeStop - rangeStart;
  });

  // Neovim 经典逻辑：当前活动行原位显示绝对行号，其他行显示相对行号，单列无缝渲染
  if (lineNo === cursorLine) {
    return lineNo.toString().padStart(charLength, " ");
  } else {
    return (Math.abs(cursorLine - lineNo) - foldedCount).toString().padStart(charLength, " ");
  }
}

var showLineNumbers = (0, import_view.lineNumbers)({ 
  formatNumber: relativeLineNumbers 
});

function lineNumbersRelative() {
  // 彻底移除多余的 absoluteLineNumberGutter，只保留原生单列槽
  return [
    showLineNumbers,
    import_view.EditorView.editorAttributes.of({ class: "relative-line-numbers-enabled" })
  ];
}

var RelativeLineNumbers = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.editorExtension = [];
  }
  async onload() {
    this.registerEditorExtension(this.editorExtension);
    const showLineNumber = this.app.vault.getConfig("showLineNumber");
    if (showLineNumber) {
      this.enable();
    }
    this.setupConfigChangeListener();
    this.addCommand({
      id: "toggle-relative-line-numbers",
      name: "Toggle Relative Line Numbers",
      callback: () => {
        if (showLineNumber) {
          if (this.enabled) {
            this.disable();
          } else {
            this.enable();
          }
        }
      }
    });
  }
  onunload() {
    this.disable();
  }
  enable() {
    this.enabled = true;
    this.editorExtension.length = 0;
    this.editorExtension.push(lineNumbersRelative());
    this.app.workspace.updateOptions();
  }
  disable() {
    this.enabled = false;
    this.editorExtension.length = 0;
    this.app.workspace.updateOptions();
  }
  setupConfigChangeListener() {
    const configChangedEvent = this.app.vault.on("config-changed", () => {
      const showLineNumber = this.app.vault.getConfig("showLineNumber");
      if (showLineNumber && !this.enabled) {
        this.enable();
      } else if (!showLineNumber && this.enabled) {
        this.disable();
      }
    });
    configChangedEvent.ctx = this;
    this.registerEvent(configChangedEvent);
  }
};
