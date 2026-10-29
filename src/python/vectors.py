"""Vector prediction, using only the standard library.
Run locally: python vectors.py. Optional comparison: pip install numpy
"""
from math import acos, degrees, sqrt

def dot(w, x):
    if len(w) != len(x):
        raise ValueError("Dimensions must agree")
    return sum(wj * xj for wj, xj in zip(w, x))

def angle(w, x):
    length = sqrt(dot(w, w)) * sqrt(dot(x, x))
    if length == 0:
        return None  # A zero vector has no direction.
    return degrees(acos(max(-1, min(1, dot(w, x) / length))))

if __name__ == "__main__":
    x, w, b = [2, 1], [2, 1], 3
    print("Contributions:", [wj*xj for wj, xj in zip(w, x)])
    print("Prediction:", dot(w, x) + b)
    print("Angle in degrees:", angle(w, x))
    try:
        import numpy as np
        print("NumPy prediction:", np.array(w) @ np.array(x) + b)
    except ImportError:
        print("Optional NumPy comparison skipped.")
