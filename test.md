# 🧪 Obsidian 深度精装验证操练场

> 本文档用于集中测试排版美学、LaTeX 公式渲染、LazyVim 键位流、任务状态机与代码高亮。

---

## 📐 1. 深度学习与数学公式（LaTeX 检验）

行内公式测试：注意力权重分布满足 $\sum_{i=1}^{n} \alpha_i = 1$，其中缩放点积注意力系数计算公式为 $\mathrm{Attention}(Q, K, V)$。

独立块级公式（Transformer Multi-Head Attention）：

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V
$$

高斯分布全概率密度函数与正态积分：

$$
f(x; \mu, \sigma^2) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left( -\frac{(x - \mu)^2}{2\sigma^2} \right)
$$

梯度下降权重更新法则：

$$
\theta_{t+1} = \theta_t - \eta \cdot \nabla_\theta \mathcal{L}(\theta_t)
$$

### test latex
$$ia = b + c \times d$$

---

## ⌨️ 2. LazyVim 动作流实操靶场

在 Normal 模式下把光标移到本节，进行肌肉记忆校准：

- **相对行号跨行跳跃**：扫一眼左侧相对行号，输入 `5j` 或 `8k` 瞬间直达目标行。
- **即时指令栈检验**：敲击数字 `4`（观察左下角是否弹出高贵黑底鎏金微光徽章 `4`），再敲 `j` 瞬间触发跳转并收回徽章。
- **单词修改与撤销**：光标停在 `TARGET_WORD_TO_CHANGE` 上，敲 `ciw` 快速修改，按 `jk` 秒退回 Normal，再敲 `u` 一键撤销。
- **行操作**：光标移动到任意一行，输入 `dd` 剪切当前行，按 `p` 粘贴到下方。
- **环绕语法测试**：按 `v` 选中 `HELLO_WORLD`，敲大写 `S"` 看看是否秒变引号！
- **任务状态翻转**：光标停在下方待办上，输入 `<Space>x` 翻转完成状态：
  - [x] 待办事项 A：体验相对行号上下精准跳行
  - [ ] 待办事项 B：测试选中文字按大写 `S"` 自动套上双引号
  - [x] 待办事项 C：验证底部 Lualine 状态栏胶囊模式联动

---

## 🎨 3. Callout 信息块与多维表格

> [!note] 知识点备忘
> 这是一个标准 Callout 信息卡片。在 Minimal 主题下拥有柔和的圆角与高对比度标签。

> [!tip] 极客操作贴士
> 选中文本直接按 `Ctrl + V`，链接将自动包裹成标准语法，绝不污染纯文本。

### 插件体系与核心快捷键对照表

| 插件名称                | 核心快捷键 / 触发指令                     | 预期效果               | 状态验证   |
| :------------------ | :------------------------------- | :----------------- | :----- |
| **Vim Toggle**      | `Ctrl + Alt + V` / `<Space>tv`   | 双向无缝切换 Vim 模式与普通打字 | 🟢 运行中 |
| **Omnisearch**      | `<Space>ss` 或 `Ctrl + Shift + F` | 全库拼音与模糊纠错搜索        | 🟢 运行中 |
| **Slash Commander** | `/`                              | 呼出斜杠快捷指令菜单         | 🟢 运行中 |
| **Recent Files**    | `<Space>fr`                      | 秒速打开最近历史笔记列表       | 🟢 运行中 |
| **Linter**          | `<Space>w` 或 `<Space>cf`         | 中英文间距自动规整排版        | 🟢 运行中 |

---
## 💻 4. 语法高亮与代码块

```python  
import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:  
    """计算数值稳定的 Softmax 概率分布"""  
    e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))  
    return e_x / np.sum(e_x, axis=-1, keepdims=True)

if __name__ == "__main__":  
    logits = np.array([2.0, 1.0, 0.1])  
    print("Softmax 分布:", softmax(logits))  
    

```
---
adcdxc

---

***
aa
***

AA 
- aa
	- ==bbb====
		- ~~ccc--
***


**AAA**%%%%
