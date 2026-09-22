" ==============================================================================
" Obsidian LazyVim-Style .obsidian.vimrc Configuration
" Tailored for seamless modal editing, Leader navigation, and markdown synergy
" ==============================================================================

" --- 1. Clipboard & Esc Escaping ---
" Sync with system clipboard (y/p directly with Windows clipboard)
set clipboard=unnamed

" jk to quickly escape Insert mode back to Normal mode
imap jk <Esc>

" Release Space so it can be safely used as Leader key
unmap <Space>

" --- 2. LazyVim Core Leader Key Mappings ---

" <leader>ff : Find file / Switcher
exmap quickOpen obcommand switcher:open
nmap <Space>ff :quickOpen<CR>

" <leader>fr : Recent files (LazyVim: Recent Files)
exmap recentFiles obcommand recent-files-obsidian:open-recent-modal
nmap <Space>fr :recentFiles<CR>

" <leader>/ : Global Search
exmap globalSearch obcommand global-search:open
nmap <Space>/ :globalSearch<CR>

" <leader>ss : Omnisearch fuzzy search modal
exmap omniSearch obcommand omnisearch:show-modal
nmap <Space>ss :omniSearch<CR>

" <leader>e : Toggle File Explorer sidebar
exmap toggleFileExplorer obcommand app:toggle-left-sidebar
nmap <Space>e :toggleFileExplorer<CR>

" <leader>w : Save current file (automatically triggers Linter format on save!)
exmap saveFile obcommand editor:save-file
nmap <Space>w :saveFile<CR>

" <leader>cf : Format current file with Linter manually
exmap lintFile obcommand obsidian-linter:lint-file
nmap <Space>cf :lintFile<CR>

" <leader>| and <leader>- : Window Splits (LazyVim style)
exmap splitVertical obcommand workspace:split-vertical
nmap <Space>| :splitVertical<CR>

exmap splitHorizontal obcommand workspace:split-horizontal
nmap <Space>- :splitHorizontal<CR>

" <leader>bd / <leader>c : Close current tab
exmap closeTab obcommand workspace:close
nmap <Space>bd :closeTab<CR>
nmap <Space>c :closeTab<CR>

" Navigate between splits (standard Vim window navigation)
exmap focusRight obcommand editor:focus-right
nmap <C-l> :focusRight<CR>

exmap focusLeft obcommand editor:focus-left
nmap <C-h> :focusLeft<CR>

exmap focusTop obcommand editor:focus-top
nmap <C-k> :focusTop<CR>

exmap focusBottom obcommand editor:focus-bottom
nmap <C-j> :focusBottom<CR>

" Visual line movement (j/k honors soft-wrapped visual lines)
nmap j gj
nmap k gk

" --- 3. Markdown Formatting Fast Actions ---
" Fold / Unfold current heading
exmap toggleFold obcommand editor:toggle-fold
nmap <Space>za :toggleFold<CR>

exmap foldAll obcommand editor:fold-all
nmap <Space>zm :foldAll<CR>

exmap unfoldAll obcommand editor:unfold-all
nmap <Space>zr :unfoldAll<CR>

" Toggle Markdown checkbox task item (- [ ] / - [x])
exmap toggleCheckbox obcommand editor:toggle-checklist-status
nmap <Space>x :toggleCheckbox<CR>

" --- 4. Surroundings (Vim-Surround in Visual Mode) ---
" 选中文本后按 S 加对应字符包裹
exmap surroundWiki surround [[ ]]
vmap S[ :surroundWiki<CR>

exmap surroundBold surround ** **
vmap S* :surroundBold<CR>
vmap Sb :surroundBold<CR>

exmap surroundHighlight surround == ==
vmap S= :surroundHighlight<CR>
vmap Sh :surroundHighlight<CR>

exmap surroundCode surround ` `
vmap S` :surroundCode<CR>
vmap Sc :surroundCode<CR>

exmap surroundQuote surround " "
vmap S" :surroundQuote<CR>

exmap surroundSingleQuote surround ' '
vmap S' :surroundSingleQuote<CR>

exmap surroundParentheses surround ( )
vmap S( :surroundParentheses<CR>
vmap S) :surroundParentheses<CR>

" Normal Mode Leader 包裹快捷键
nmap <Space>mb :surroundBold<CR>
nmap <Space>mh :surroundHighlight<CR>
nmap <Space>mc :surroundCode<CR>

" Toggle Vim
exmap toggleVim obcommand vim-toggle:toggle-vim
nmap <Space>tv :toggleVim<CR>

exmap cycleMaterial obcommand translucent-bg:cycle-material
nmap <Space>tm :cycleMaterial<CR>
