const { Plugin, PluginSettingTab, Setting } = require("obsidian");

// ponytail: plain JS, no build step — Obsidian loads main.js directly

const DEFAULT_SETTINGS = {
  enabled: false,
  spareSidebars: false,
  followMode: "caret", // caret | mouse | auto (most recent input wins)
  radius: 280,
  darkness: 0.97,
  intensity: 1,
  color: "#ff963c",
  flicker: true,
  speed: 0.22, // lerp factor: how fast the torch chases its target
  caretWidth: 3,
  emberCaret: true, // gradient flame caret like the reference video
};

module.exports = class TorchCursorPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.x = this.tx = window.innerWidth / 2;
    this.y = this.ty = window.innerHeight / 2;
    this.overlay = null;
    this.raf = 0;
    this.lastCaret = null;
    this.lastCaretMove = 0;
    this.mouseX = this.x;
    this.mouseY = this.y;
    this.lastMouseMove = 0;

    this.registerDomEvent(document, "mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.lastMouseMove = Date.now();
    });

    this.addCommand({
      id: "toggle",
      name: "Toggle torch mode",
      callback: () => this.toggle(),
    });
    this.addSettingTab(new TorchSettingTab(this.app, this));

    this.app.workspace.onLayoutReady(() => {
      if (this.settings.enabled) this.enable();
    });
  }

  onunload() {
    this.disable();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyStyle();
  }

  toggle() {
    this.overlay ? this.disable() : this.enable();
    this.settings.enabled = !!this.overlay;
    this.saveSettings();
  }

  applyStyle() {
    const s = this.settings;
    const b = document.body;
    b.style.setProperty("--torch-radius", s.radius + "px");
    b.style.setProperty("--torch-darkness", String(s.darkness));
    b.style.setProperty("--torch-intensity", String(s.intensity));
    b.style.setProperty("--torch-warm", hexToRgb(s.color));
    b.style.setProperty("--torch-caret-width", s.caretWidth + "px");
    b.classList.toggle("torch-no-flicker", !s.flicker);
    b.classList.toggle("torch-ember-caret", s.emberCaret);
  }

  enable() {
    if (this.overlay) return;
    this.applyStyle();
    document.body.classList.add("torch-cursor-active");
    this.overlay = document.body.createDiv({ cls: "torch-cursor-overlay" });
    this.overlay.createDiv({ cls: "torch-cursor-glow" });
    // Obsidian uses the native browser caret (no .cm-cursor element), so we
    // draw our own and hide the native one via CSS while torch mode is on
    this.caretEl = this.overlay.createDiv({ cls: "torch-cursor-caret" });

    const tick = () => {
      this.updateTarget();
      const lerp = this.settings.speed;
      this.x += (this.tx - this.x) * lerp;
      this.y += (this.ty - this.y) * lerp;
      this.overlay.style.setProperty("--torch-x", this.x.toFixed(1) + "px");
      this.overlay.style.setProperty("--torch-y", this.y.toFixed(1) + "px");
      this.overlay.style.clipPath = this.settings.spareSidebars
        ? this.editorClip()
        : "";
      const c = this.lastCaret;
      if (c && c.focused) {
        this.caretEl.style.display = "";
        this.caretEl.style.transform = `translate(${c.x}px, ${c.top}px)`;
        this.caretEl.style.height = c.bottom - c.top + "px";
      } else {
        this.caretEl.style.display = "none";
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  disable() {
    cancelAnimationFrame(this.raf);
    document.body.classList.remove("torch-cursor-active");
    this.overlay?.remove();
    this.overlay = null;
  }

  // clip the darkness to the root (editor) split so sidebars stay lit
  editorClip() {
    const r = this.app.workspace.rootSplit?.containerEl?.getBoundingClientRect();
    if (!r) return "";
    return `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px)`;
  }

  updateTarget() {
    const mode = this.settings.followMode;
    // always read caret coords: the drawn caret needs them in every mode
    const caret = this.caretCoords();
    if (caret) {
      if (!this.lastCaret || caret.x !== this.lastCaret.x || caret.y !== this.lastCaret.y) {
        this.lastCaretMove = Date.now();
      }
      this.lastCaret = caret;
    }
    const useMouse =
      mode === "mouse" ||
      (mode === "auto" && (this.lastMouseMove > this.lastCaretMove || !this.lastCaret));
    if (useMouse) {
      this.tx = this.mouseX;
      this.ty = this.mouseY;
    } else if (this.lastCaret) {
      this.tx = this.lastCaret.x;
      this.ty = this.lastCaret.y;
    }
  }

  caretCoords() {
    // .cm is the CodeMirror 6 EditorView behind Obsidian's Editor
    const view = this.app.workspace.activeEditor?.editor?.cm;
    if (!view) return null;
    try {
      const c = view.coordsAtPos(view.state.selection.main.head, -1);
      return c
        ? {
            x: c.left,
            y: (c.top + c.bottom) / 2,
            top: c.top,
            bottom: c.bottom,
            focused: view.hasFocus,
          }
        : null;
    } catch {
      return null; // caret off-screen or view mid-update
    }
  }
};

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

class TorchSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();
    const set = (key) => async (v) => {
      this.plugin.settings[key] = v;
      await this.plugin.saveSettings();
    };

    new Setting(this.containerEl)
      .setName("Follow")
      .setDesc("What the torch follows. Auto uses whichever moved last.")
      .addDropdown((d) =>
        d
          .addOptions({ caret: "Text cursor", mouse: "Mouse pointer", auto: "Auto" })
          .setValue(this.plugin.settings.followMode)
          .onChange(set("followMode"))
      );

    new Setting(this.containerEl)
      .setName("Torch radius")
      .setDesc("Size of the lit area, in pixels.")
      .addSlider((s) =>
        s
          .setLimits(100, 600, 10)
          .setValue(this.plugin.settings.radius)
          .setDynamicTooltip()
          .onChange(set("radius"))
      );

    new Setting(this.containerEl)
      .setName("Darkness")
      .setDesc("How dark everything outside the torch gets.")
      .addSlider((s) =>
        s
          .setLimits(0.5, 1, 0.01)
          .setValue(this.plugin.settings.darkness)
          .setDynamicTooltip()
          .onChange(set("darkness"))
      );

    new Setting(this.containerEl)
      .setName("Glow intensity")
      .setDesc("Strength of the warm glow. 0 gives a pure spotlight.")
      .addSlider((s) =>
        s
          .setLimits(0, 1, 0.05)
          .setValue(this.plugin.settings.intensity)
          .setDynamicTooltip()
          .onChange(set("intensity"))
      );

    new Setting(this.containerEl)
      .setName("Glow color")
      .setDesc("Tint of the torch light and the caret glow.")
      .addColorPicker((c) =>
        c.setValue(this.plugin.settings.color).onChange(set("color"))
      );

    new Setting(this.containerEl)
      .setName("Flicker")
      .setDesc("Subtle candle-like flicker of the glow.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.flicker).onChange(set("flicker"))
      );

    new Setting(this.containerEl)
      .setName("Torch speed")
      .setDesc("How quickly the torch chases the cursor. Lower is floatier.")
      .addSlider((s) =>
        s
          .setLimits(0.05, 1, 0.05)
          .setValue(this.plugin.settings.speed)
          .setDynamicTooltip()
          .onChange(set("speed"))
      );

    new Setting(this.containerEl)
      .setName("Cursor width")
      .setDesc("Thickness of the text cursor, in pixels.")
      .addSlider((s) =>
        s
          .setLimits(1, 8, 1)
          .setValue(this.plugin.settings.caretWidth)
          .setDynamicTooltip()
          .onChange(set("caretWidth"))
      );

    new Setting(this.containerEl)
      .setName("Ember cursor")
      .setDesc("Replace the plain cursor with a glowing flame-gradient bar.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.emberCaret).onChange(set("emberCaret"))
      );

    new Setting(this.containerEl)
      .setName("Keep sidebars lit")
      .setDesc("Only darken the editor area. Sidebars, ribbon and status bar stay unaffected.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.spareSidebars).onChange(set("spareSidebars"))
      );
  }
}

/* nosourcemap */