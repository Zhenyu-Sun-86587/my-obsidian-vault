---
theme: black
highlightTheme: monokai
transition: slide
slideNumber: true
---

<!-- slide bg="#1e1e2e" -->

# 🚀 深度学习大模型前沿研究
### —— 计算机系周度组会汇报

<br>

<div class="reset-margin" style="font-size: 0.8em; opacity: 0.85;">
  <p>👨‍💻 <b>汇报人：</b> 孙振宇 &nbsp;&nbsp;|&nbsp;&nbsp; 🏫 <b>指导老师：</b> 导师团队 &nbsp;&nbsp;|&nbsp;&nbsp; 📅 <b>2026 年秋</b></p>
</div>

---

<!-- slide bg="#181825" -->

## 🔬 注意力机制演进与创新

<split left="55" right="45" gap="2">

#### 📐 数学理论推导

改进后的缩放点积注意力定义：

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V
$$

其中 $M \in \mathbb{R}^{L \times L}$ 为因果掩码矩阵。

$$\tau = \sqrt{\frac{d_k}{\log L}}$$

---

#### 💡 核心设计与创新

::: block {style="background: rgba(137, 180, 250, 0.15); border-left: 5px solid #89b4fa; padding: 15px; border-radius: 8px; text-align: left;"}
**动态温度自适应缩放：**
- 引入超参数 $\tau$ 抑制长序列熵坍塌
- 相比标准 Softmax，外推能力提升 **34%**
:::

::: block {style="background: rgba(166, 227, 161, 0.15); border-left: 5px solid #a6e3a1; padding: 15px; border-radius: 8px; text-align: left; margin-top: 15px;"}
**硬件友好感知：**
- 针对 FlashAttention-3 优化分块算子
- 显存访存开销降低至 $O(\sqrt{N})$
:::

</split>

---

<!-- slide bg="#11111b" -->

## 💻 核心算子实现 vs 架构比对

<split left="55" right="45" gap="2">

```python
class ScaledAttention(nn.Module):
    def __init__(self, d_k: int):
        super().__init__()
        self.scale = 1.0 / (d_k ** 0.5)

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1))
        scores = scores * self.scale
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        return torch.matmul(F.softmax(scores, dim=-1), v)
```

---

#### 📊 阶段消融成果

| 架构变体 | 延迟 (ms) | 显存占用 | 准确率 |
| :--- | :--- | :--- | :--- |
| **Baseline** | 42.5ms | 14.2GB | 78.4% |
| **Custom-Dense** | 38.2ms | 13.8GB | 81.6% |
| **Custom-MoE** | **29.1ms** | **9.4GB** | **83.9%** |

<br>

- [x] 完成百亿级 Token 预压测
- [ ] 开展 128k 超长上下文外推

</split>

---

<!-- slide bg="#1e1e2e" -->

# 💡 汇报完毕 · 敬请指正
### Q & A Session
