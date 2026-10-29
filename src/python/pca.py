"""Analytical two-dimensional PCA, sample covariance (n - 1).
Run locally: python pca.py. Optional comparison: pip install numpy
"""
from math import atan2, cos, sin, sqrt, hypot

def pca(points, standardize=False):
    n = len(points)
    if n < 2:
        raise ValueError("Sample covariance needs n >= 2")
    mean = [sum(p[j] for p in points)/n for j in range(2)]
    centered = [[p[j]-mean[j] for j in range(2)] for p in points]
    sd = [sqrt(sum(p[j]**2 for p in centered)/(n-1)) for j in range(2)]
    scale = [(s or 1) if standardize else 1 for s in sd]
    q = [[p[j]/scale[j] for j in range(2)] for p in centered]
    a = sum(p[0]**2 for p in q)/(n-1)
    c = sum(p[0]*p[1] for p in q)/(n-1)
    d = sum(p[1]**2 for p in q)/(n-1)
    delta = hypot(a-d, 2*c)
    eigenvalues = [max(0, (a+d+delta)/2), max(0, (a+d-delta)/2)]
    angle = .5*atan2(2*c, a-d)
    u = [cos(angle), sin(angle)]
    scores = [sum(p[j]*u[j] for j in range(2)) for p in q]
    rebuilt = [[t*u[j] for j in range(2)] for t in scores]
    error = sum(sum((p[j]-r[j])**2 for j in range(2))
                for p, r in zip(q, rebuilt))/n
    ratio = eigenvalues[0]/(a+d) if a+d > 0 else None
    return dict(mean=mean, scale=scale, covariance=[[a,c],[c,d]],
                values=eigenvalues, axis=u, scores=scores,
                rebuilt=rebuilt, error=error, explained=ratio,
                non_unique=delta <= 1e-12 * max(a+d, 5e-324))

if __name__ == "__main__":
    result = pca([(-1,-1),(0,0),(1,1)])
    print(result)
    try:
        import numpy as np
        values, axes = np.linalg.eigh(result["covariance"])
        print("NumPy descending eigenvalues:", values[::-1])
        print("NumPy axes (sign may differ):", axes[:, ::-1])
    except ImportError:
        print("Optional NumPy comparison skipped.")
