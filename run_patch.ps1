
$themePath = "C:\Users\SZY\Desktop\Obsidian\.obsidian\themes\AbsolutelyGlass\theme.css"
$content = [System.IO.File]::ReadAllText($themePath, [System.Text.Encoding]::UTF8)

# 1. 彻底将 AbsolutelyGlass 内写死的宋体/Times New Roman 替换为 Obsidian 变量
$old1 = '--font-text-theme: ui-serif, Georgia, Cambria, "Times New Roman", serif;'
$new1 = '--font-text-theme: var(--font-text);'
if ($content.Contains($old1)) {
    $content = $content.Replace($old1, $new1)
    Write-Output "Replaced serif font in AbsolutelyGlass!"
}

$old2 = '--font-text-theme: Inter;'
$new2 = '--font-text-theme: var(--font-text);'
if ($content.Contains($old2)) {
    $content = $content.Replace($old2, $new2)
    Write-Output "Replaced Inter font in AbsolutelyGlass!"
}

[System.IO.File]::WriteAllText($themePath, $content, [System.Text.Encoding]::UTF8)

# 2. 移除粗暴的 maple-font-enforce.css
$snippetFont = "C:\Users\SZY\Desktop\Obsidian\.obsidian\snippets\maple-font-enforce.css"
if (Test-Path $snippetFont) {
    Remove-Item $snippetFont
    Write-Output "Removed brute-force maple-font-enforce.css"
}

# 3. 部署通用优雅的展开动画 (覆盖 **加粗**、#标题、==高亮==)
$animPath = "C:\Users\SZY\Desktop\Obsidian\.obsidian\snippets\smooth-syntax-reveal.css"
$animCss = @"
/* 优雅通用的 Markdown 语法平滑淡入展开 (零形变，零跳动) */
.cm-formatting {
  opacity: 0 !important;
  display: inline !important;
  color: var(--text-faint) !important;
  transition: opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1), color 0.16s ease !important;
}

/* 光标进入当前行时，所有格式化标记平滑浮现 */
.cm-active .cm-formatting,
.cm-formatting-header,
.cm-formatting-strong,
.cm-formatting-em,
.cm-formatting-highlight,
.cm-formatting-strikethrough {
  opacity: 0.85 !important;
}

.cm-formatting-strong,
.cm-formatting-header {
  color: var(--interactive-accent, #7aa2f7) !important;
  font-weight: 600 !important;
}
"@
[System.IO.File]::WriteAllText($animPath, $animCss, [System.Text.Encoding]::UTF8)

# 4. 更新 appearance.json
$appPath = "C:\Users\SZY\Desktop\Obsidian\.obsidian\appearance.json"
$app = Get-Content $appPath | ConvertFrom-Json
$app.enabledCssSnippets = @("workspace-integration", "smooth-folding", "smooth-syntax-reveal")
$app | ConvertTo-Json -Depth 5 | Set-Content $appPath -Encoding UTF8

git -C "C:\Users\SZY\Desktop\Obsidian" add .
git -C "C:\Users\SZY\Desktop\Obsidian" commit -m "refactor: elegantly patch theme.css font variables directly and deploy universal syntax reveal animation"
git -C "C:\Users\SZY\Desktop\Obsidian" push origin main
