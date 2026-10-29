"""Scalar least squares. Core method uses only the Python standard library.
Run locally: python linear-regression.py
Optional comparison: pip install numpy
"""
def fit(points):
    if not points:
        raise ValueError("At least one observation is required")
    n = len(points)
    mean_x = sum(x for x, y in points) / n
    mean_y = sum(y for x, y in points) / n
    denominator = sum((x - mean_x) ** 2 for x, y in points)
    constant = all(x == points[0][0] for x, y in points) or denominator == 0
    # Constant input leaves slope unidentifiable; choose zero explicitly.
    w = (sum((x - mean_x) * (y - mean_y) for x, y in points)
         / denominator) if not constant else 0.0
    return w, mean_y - w * mean_x

def loss_and_gradient(points, w, b):
    if not points:
        raise ValueError("At least one observation is required")
    residuals = [w * x + b - y for x, y in points]
    n = len(points)
    return (sum(r*r for r in residuals) / n,
            2 * sum(x*r for (x, y), r in zip(points, residuals)) / n,
            2 * sum(residuals) / n)

if __name__ == "__main__":
    points = [(1, 2), (2, 3)]
    w, b = fit(points)
    print("w, b:", w, b)
    print("MSE, dw, db:", loss_and_gradient(points, w, b))
    try:
        import numpy as np
        X = np.array([[x, 1] for x, y in points])
        theta, *_ = np.linalg.lstsq(X, [y for x, y in points], rcond=None)
        print("NumPy least squares:", theta)
    except ImportError:
        print("Optional NumPy comparison skipped.")
