---
theme: black
highlightTheme: monokai
transition: slide
slideNumber: true
---

# 🚀 深度学习大模型前沿研究与复现
### —— 计算机系周度组会汇报

**汇报人：** 孙振宇  
**指导老师：** 导师团队  
**日期：** 2026 年秋

---

## 🎯 汇报大纲

- 1. 研究背景与核心痛点
- 2. 模型核心架构与数学推导
- 3. 算法实现关键代码
- 4. 实验对比与下一步计划

---

## 🔬 1. 注意力机制数学推导

我们改进后的缩放点积注意力公式定义如下：

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V
$$

其中 $M \in \mathbb{R}^{L \times L}$ 为因果掩码矩阵。

> [!tip] 核心创新点
> 引入了动态温度自适应缩放系数 $\tau$，大幅降低了长文本外推时的注意力熵坍塌！

---

## 💻 2. 核心算法实现 (PyTorch)

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.scale = 1.0 / (d_k ** 0.5)

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = F.softmax(scores, dim=-1)
        return torch.matmul(attn, v), attn
```

---

## 📊 3. 实验对比消融分析

| 实验组别 | 骨干网络 | 参数量 | 推理延迟 (ms) | 准确率 (Acc@1) |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline** | LLaMA-7B | 6.7B | 42.5ms | 78.4% |
| **Ours (Dense)**| Custom-7B | 6.8B | 38.2ms | **81.6%** |
| **Ours (MoE)**  | Custom-8x7B| 12.4B| **29.1ms** | **83.9%** |

- [x] 完成基线模型与当前方案的吞吐量压测
- [ ] 正在进行下一轮 128k 极长上下文泛化性验证

---

# 💡 Q & A
### 感谢各位老师与师兄指正！
