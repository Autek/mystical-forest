import numpy as np

o = np.array([0.05, 0, 0])
d = np.array([0.5, 0.3, 1.0])
d = d / np.linalg.norm(d)
c = np.array([0.0, 0.0, 1.0])
a = np.array([0.0, 0.0, 1.0])
r = 0.1
h = 0.5

U = np.cross(o - c, a)
V = np.cross(d, a)

delta = (2 * np.dot(U, V)) ** 2 - 4 * (np.dot(U, U) - r ** 2) * (np.dot(V, V))

t = (-2 * np.dot(U, V) + np.sqrt(delta)) / (2 * np.dot(V, V))
i = o + t * d
n = U + V * t #marche presque
n2 = np.cross(i, a)
n2 = n2 / np.linalg.norm(n2) #marche presque aussi

tmp = i - c
n3 = (np.dot(tmp, a) * a) - tmp 
print(t, i, n3)
