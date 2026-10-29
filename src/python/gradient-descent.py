"""Batch gradient descent with 1/n MSE and simultaneous updates.
Run locally: python gradient-descent.py. Optional: pip install numpy
"""
from math import isfinite

def loss_gradient(points, w, b):
    if not points:
        raise ValueError("At least one observation is required")
    n = len(points)
    rows = [(x, w*x+b-y) for x, y in points]
    return (sum(r*r for x, r in rows)/n,
            2*sum(x*r for x, r in rows)/n,
            2*sum(r for x, r in rows)/n)

def train(points, w, b, alpha=0.1, steps=100):
    history = []
    for _ in range(steps):
        loss, dw, db = loss_gradient(points, w, b)
        next_w, next_b = w-alpha*dw, b-alpha*db
        next_loss, _, _ = loss_gradient(points, next_w, next_b)
        if not all(map(isfinite, [next_w, next_b, next_loss])) or next_loss >= 1e12:
            raise ArithmeticError("Divergence safety stop, not convergence")
        w, b = next_w, next_b
        history.append(next_loss)
    return w, b, history

if __name__ == "__main__":
    data = [(1, 2), (2, 3)]
    w, b, history = train(data, 1, 0, steps=500)
    print("Parameters:", w, b, "MSE:", history[-1])
    try:
        import numpy as np
        X = np.array([[x, 1] for x, y in data])
        y = np.array([y for x, y in data])
        theta = np.array([1.0, 0.0])
        for _ in range(500):
            theta -= 0.1 * 2 * X.T @ (X @ theta-y) / len(y)
        print("Equivalent NumPy batch updates:", theta)
    except ImportError:
        print("Optional NumPy comparison skipped.")
