---
title: Theory Exercise RT2 – Lighting and Light Rays
---

# Theory Exercise Homework 2 (RT2)

## Lighting and Light Rays

### Derivation of the Iterative Formula

Given the recursive relationship\
$c_b = (1 - \alpha_0)c_0 + \alpha_0 c^1$\
$c^i = (1 - \alpha_i)c_i + \alpha_i c^{i+1}$\

We must show that:\
$c_b = \Sigma_{i = 0}^{+\infty}(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k) c_i$\

If we take the iterative formula and take out its first element out of the sum we can reformulate:\
$c_b = (1 - \alpha_0)c_0 + \Sigma_{i = 1}^{+\infty}(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k) c_i$\
$c_b = (1 - \alpha_0)c_0 + \alpha_0(\Sigma_{i = 1}^{+\infty}(1 - \alpha_i)(\prod_{k = 1}^{i -1} a_k) c_i)$\

We can observe that $c_b$ contains the next reflections pixel iterative formula, to clairify this we can rename it to $c^0$\
$c^0 = (1 - \alpha_0)c_0 + \alpha_0(\Sigma_{i = 1}^{+\infty}(1 - \alpha_i)(\prod_{k = 1}^{i -1} a_k) c_i)$\

Since the sum within $c^0$ is the formula if we were observing the reflection from the first intersection therefore we can replace the sum with $c^1$
$c^0 = (1 - \alpha_0)c_0 + \alpha_0 c^1$\

Therefore we have obtained the recursive relationship from the iterative formula thus showing equivalent.
### Simplification for $N$ Reflections

For N reflections, we can limit our formula to sum up to $c_n$, since $c_i$ is the color of the i-th reflected pixel giving us.\

Therefore we should calculate for N reflections:\
$c_{bn} = \Sigma_{i = 0}^{n}(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k) c_i$