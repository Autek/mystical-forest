---
title: Theory Exercise RT2 – Lighting and Light Rays
---

# Theory Exercise Homework 2 (RT2)

## Lighting and Light Rays

### Derivation of the Iterative Formula

We have established that the iterative formulas as such.\
$c_b = (1 - \alpha_0)c_0 + \alpha_0 c^1$
$c^i = (1 - \alpha_i)c_i + \alpha_i c^{i+1}$

If we develop out $c_0$ and $c_1$ :\
$c_b = (1 - \alpha_0)c_0 + \alpha_0 (1 - \alpha_1)c_1 + \alpha_0\alpha_1 c^2$\

$c_b = (1 - \alpha_0)c_0 + \alpha_0 (1 - \alpha_1)c_1 + \alpha_0\alpha_1(1 - \alpha_2)c_2 + \alpha_0\alpha_1\alpha_2 c^3$

We can observe that $c_b$ is the sum of $c_i$ multiplied by a series of coefficients. can observe that $c_i$ is multiplied by:\

$(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k)$\

Therefore we can calculate:\
$c_b = \Sigma_{i = 0}^{+\infty}(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k) c_i$\

### Simplification for $N$ Reflections

For N reflections, we can limit our formula to sum up to $c_n$, since $c_i$ is the color of the i-th reflected pixel giving us.\

Therefore we should calculate for N reflections:\
$c_{bn} = \Sigma_{i = 0}^{n}(1 - \alpha_i)(\prod_{k = 0}^{i -1} a_k) c_i$