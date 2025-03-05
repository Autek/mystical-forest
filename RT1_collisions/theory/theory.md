---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png)



**Derive the intersection between a ray and a cylinder. Discuss how to compute the parameter $t$, which solution to pick in case multiple exist, and how to define the cylinder normal.**


The implicit representation of an infinite cylinder is:
$$
\|(\mathbf{x} - \mathbf{c}) \times \mathbf{a}\| = r
$$
with $\mathbf{x}$ a position in 3D space, $\mathbf{c}$ the center of the cylinder, $\mathbf{a}$ the central axis of the cylinder and $r$ the radius of the cylinder.

We plug in $\mathbf{x} = (\mathbf{o}+t\mathbf{d})$, distribute out the central axis and group terms in $t$ and terms not in $t$:
$$
\begin{align*}
\|((\mathbf{o}+t\mathbf{d})-\mathbf{c}) \times \mathbf{a}\| &= r \\
\|((\mathbf{o}-\mathbf{c})+t\mathbf{d}) \times \mathbf{a}\| &= r \\
\|(\mathbf{o}-\mathbf{c}) \times \mathbf{a} + t\mathbf{d} \times \mathbf{a}\| &= r
\end{align*}
$$

To simplify the notation, we substitute $\mathbf{U} = (\mathbf{o}-\mathbf{c}) \times \mathbf{a}$ and $\mathbf{V} = \mathbf{d} \times \mathbf{a}$. We get:
$$
\|\mathbf{U} + t\mathbf{V}\| = r
$$

We then develop the norm and group like terms:
$$
\begin{align*}
r^2 &= (U_x + V_xt)^2 + (U_y + V_yt)^2 + (U_z + V_zt)^2 \\
&= (U_x^2 + V_x^2t^2 + 2U_xV_xt) \\ 
&\qquad+ (U_y^2 + V_y^2t^2 + 2U_yV_yt) \\
&\qquad+ (U_z^2 + V_z^2t^2 + 2U_zV_zt) \\
&= (V_x^2 + V_y^2 + V_z^2)t^2 + 2(U_xV_x + U_yV_y + U_zV_z)t + (U_x^2 + U_y^2 + U_z^2)
\end{align*}
$$

We recognize the dot products so we simplify the expression according to their rewrite, and transform it to a quadratic:
$$
\begin{align*}
\mathbf{V}^T\mathbf{V}t^2 + 2\mathbf{U}^T\mathbf{V}t + \mathbf{U}^T\mathbf{U} &= r^2 \\
\mathbf{V}^T\mathbf{V}t^2 + 2\mathbf{U}^T\mathbf{V}t + \mathbf{U}^T\mathbf{U} - r^2 &= 0 
\end{align*}
$$

We can solve this form for $t$, finally getting:
$$
\begin{align*}
t = \frac{-2\mathbf{U}^T\mathbf{U} \pm \sqrt{\Delta}}{2\mathbf{V}^T\mathbf{V}}\quad \text{with}\ \Delta = (2\mathbf{U}^T\mathbf{V})^2 - 4\mathbf{V}^T\mathbf{V}(\mathbf{U}^T\mathbf{U} - r^2) 
\end{align*}
$$

The point of intersection with the infinite height cylinder is therefore $\mathbf{i} = \mathbf{o} + t\mathbf{d}$.

<!-- @alonso do your thing -->
<!-- Thank you @charlie -->

To verify that this point of intersection is within the bounds of the height of the actual cylinder. Therefore we search for the height of the intersection in relation to the center of the cylinder. Which would be the length of the projection of the vector going from the center to the point of intersection to the cylinder's axis.

We must by calculate the vector from the center and the intersection, $i_c$.
$$
\begin{align*}
\mathbf{i_c} = \mathbf{i} - \mathbf{c};\;\;\mathbf{i} = \mathbf{o} + t\mathbf{d}
\end{align*}
$$
Then calculate the projection, $i_p$, of $\mathbf{i_c}$ to the cylinder's axis $\mathbf{a}$.
$$
\begin{align*}
\mathbf{i_p} = proj_{\mathbf{a}} \mathbf{i_c}\\
\mathbf{i_p} = \frac{<\mathbf{a}, \mathbf{i_c}>}{<\mathbf{a}, \mathbf{a}>} \mathbf{a}
\end{align*}
$$
Therefore we must check that the length of the vector is less than half the height.
$$
\begin{align*}
2\|\mathbf{i_p}\| \leq \mathbf{h}
\end{align*}
$$

Since $\mathbf{t}$ could have mutliple solutions, we much choose the smallest positif t such that the height requirement is met.

The cylinder's normal, $\mathbf{n}$, at an intersecting point, $\mathbf{i}$, should be defined as the normal of the plane of the cylinder that is facing the camera. We can define it as the normalized vector from the cylinder's axis $\mathbf{c}$ to the intersection point $\mathbf{i}$ without a component of the cylinder's axis.

We have already calculated the vector from the center to the intersection point, $\mathbf{i_c}$, all we have to do is remove its projection to the axis, $\mathbf{a}$.
$$
\mathbf{n} = norm(\mathbf{i_c} - \{\frac{<\mathbf{i_c}, \mathbf{a}>}{\|\mathbf{a}\|^2}\}\mathbf{a})
$$

Unfortunately, this normal points outwards from the center and does not face the camera. Therefore to fix this we can the conditions.
$$
\mathbf{n_c} = \begin{cases}
      <\mathbf{n}, \mathbf{r}> \leq 0 & -n\\
      else & n
    \end{cases} 
$$