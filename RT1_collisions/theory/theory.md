---
title: Theory Exercise RT1 – Ray-Cylinder Intersection
---

# Theory Exercise Homework 1 (RT1)

## Ray-Cylinder Intersection

![A cylinder with axis $\mathbf{a}$, center $\mathbf{c}$, radius $r$, and height $h$](images/cyl_diagram.png)

**Derive the intersection between a ray and a cylinder. Discuss how to compute the parameter $t$, which solution to pick in case multiple exist, and how to define the cylinder normal.**

**How to compute the parameter $t$**

The implicit representation of an infinite cylinder is:

$$
\|(\mathbf{x} - \mathbf{c}) \times \mathbf{a}\| = r
$$

with $\mathbf{x}$ a position in 3D space, $\mathbf{c}$ the center of the cylinder, $\mathbf{a}$ the central axis of the cylinder and $r$ the radius of the cylinder.

We plug in $\mathbf{x} = (\mathbf{o}+t\mathbf{d})$, distribute out the central axis and group terms in $t$ and terms not in $t$:

$$
\|((\mathbf{o}+t\mathbf{d})-\mathbf{c}) \times \mathbf{a}\| = r
$$

$$
\|((\mathbf{o}-\mathbf{c})+t\mathbf{d}) \times \mathbf{a}\| = r
$$

$$
\|(\mathbf{o}-\mathbf{c}) \times \mathbf{a} + t\mathbf{d} \times \mathbf{a}\| = r
$$

To simplify the notation, we substitute $\mathbf{U} = (\mathbf{o}-\mathbf{c}) \times \mathbf{a}$ and $\mathbf{V} = \mathbf{d} \times \mathbf{a}$. We get:

$$
\|\mathbf{U} + t\mathbf{V}\| = r
$$

We then develop the norm and group like terms:

$$
r^2 = (U_x + V_xt)^2 + (U_y + V_yt)^2 + (U_z + V_zt)^2
$$

$$
r^2 = (U_x^2 + V_x^2t^2 + 2U_xV_xt) + (U_y^2 + V_y^2t^2 + 2U_yV_yt)
+ (U_z^2 + V_z^2t^2 + 2U_zV_zt)
$$

$$
r^2 = (V_x^2 + V_y^2 + V_z^2)t^2 + 2(U_xV_x + U_yV_y + U_zV_z)t + (U_x^2 + U_y^2 + U_z^2)
$$

We recognize the dot products so we simplify the expression according to their rewrite, and transform it to a quadratic:

$$
\mathbf{V}^T\mathbf{V}t^2 + 2\mathbf{U}^T\mathbf{V}t + \mathbf{U}^T\mathbf{U} = r^2
$$

$$
\mathbf{V}^T\mathbf{V}t^2 + 2\mathbf{U}^T\mathbf{V}t + \mathbf{U}^T\mathbf{U} - r^2 = 0
$$

We can solve this form for $t$, finally getting:
![](images/1.jpg)

The point of intersection with the infinite height cylinder is therefore $\mathbf{i} = \mathbf{o} + t\mathbf{d}$.

<!-- @alonso do your thing -->
<!-- Thank you @charlie -->

**Which solutions to pick**

We now need to verify that this point of intersection is within the bounds of the height of the actual cylinder. Therefore we search for the height of the intersection in relation to the center of the cylinder. This is the length of the projection of the vector going from the center to the point of intersection to the cylinder's axis. We denote that vector $i_c$:

$$
\mathbf{i_c} = \mathbf{i} - \mathbf{c}
$$

We then compute $\mathbf{i_p}$, the projection of $\mathbf{i_c}$ on the cylinder's axis $\mathbf{a}$.

![](images/2.jpg)

Finally, we check that the length of the vector is less than half the height using:

$$
2\|\mathbf{i_p}\| \leq \mathbf{h}
$$

If so, it means that we are indeed intersecting with the cyclinder.

Since $t$ could have multiple solutions, we choose the smallest positive $t$ such that the height requirement is met.

**How to compute the cylinder normal**

The cylinder's normal $\mathbf{n}$ at intersecting point $\mathbf{i}$ should be defined as the normal to the part of the cylinder that is facing the camera. We can define it as the normalized vector from the cylinder's axis $\mathbf{c}$ to the intersection point $\mathbf{i}$ without a component of the cylinder's axis.

We have already computed the vector from the center to the intersection point, $\mathbf{i_c}$, so all we have to do is remove its projection to the axis $\mathbf{a}$:

![](images/3.jpg)


This normal points outwards from the center of the cylinder. This is fine most of the time, but we need to take into account the case where we are looking at the inside of the cylinder. Indeed, the normal would point outwards and away from the camera. In this case, we reverse the direction of the vector. The conditions for this are given by:

![](images/4.jpg)

