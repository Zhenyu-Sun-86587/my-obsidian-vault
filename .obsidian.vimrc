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

" <leader>ff : Find file / Switcher (or Omnisearch)
exmap quickOpen obcommand switcher:open
nmap <Space>ff :quickOpen<CR>

" <leader>/ : Global Search
exmap globalSearch obcommand global-search:open
nmap <Space>/ :globalSearch<CR>

" <leader>s : Omnisearch fuzzy search modal
exmap omniSearch obcommand omnisearch:show-modal
nmap <Space>ss :omniSearch<CR>

" <leader>e : Toggle File Explorer sidebar
exmap toggleFileExplorer obcommand app:toggle-left-sidebar
nmap <Space>e :toggleFileExplorer<CR>

" <leader>w : Save current file
exmap saveFile obcommand editor:save-file
nmap <Space>w :saveFile<CR>

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

" Surroundings (Markdown syntax helpers)
exmap surroundWiki surround [[ ]]
map [[ :surroundWiki<CR>

exmap surroundBold surround ** **
map <Space>mb :surroundBold<CR>

exmap surroundHighlight surround == ==
map <Space>mh :surroundHighlight<CR>

exmap surroundCode surround ` `
map <Space>mc :surroundCode<CR>

exmap toggleVim obcommand editor:toggle-vim-mode
nmap <Space>tv :toggleVim<CR>
