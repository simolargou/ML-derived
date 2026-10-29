"""Stable logistic regression. Core method uses only the standard library.
Run locally: python logistic-regression.py. Optional: pip install numpy
"""
from math import exp, log1p

DATA = [(-2,-1,0),(-1.4,.3,0),(-.7,-1.7,0),(.4,-.9,0),
        (.8,.6,1),(1.7,.1,1),(.2,1.8,1),(-.6,.8,1)]

def sigmoid(z):
    if z >= 0:
        return 1 / (1 + exp(-z))
    e = exp(z)
    return e / (1 + e)

def binary_loss(z, y):
    return max(z, 0) - y*z + log1p(exp(-abs(z)))

def evaluate(data, w, b):
    gradient = [0.0, 0.0, 0.0]
    loss = 0.0
    for x1, x2, y in data:
        z = w[0]*x1 + w[1]*x2 + b
        p = sigmoid(z)
        loss += binary_loss(z, y) / len(data)
        for j, feature in enumerate([x1, x2, 1]):
            gradient[j] += (p-y)*feature / len(data)
    return loss, gradient

def metrics(data, w, b, threshold=.5):
    tp = tn = fp = fn = 0
    for x1, x2, y in data:
        positive = sigmoid(w[0]*x1+w[1]*x2+b) >= threshold
        tp += positive and y == 1
        fp += positive and y == 0
        tn += not positive and y == 0
        fn += not positive and y == 1
    return dict(tp=tp, tn=tn, fp=fp, fn=fn,
                precision=tp/(tp+fp) if tp+fp else None,
                recall=tp/(tp+fn) if tp+fn else None)

if __name__ == "__main__":
    w, b = [1.0, 1.0], 0.0
    print("Initial loss and gradient:", evaluate(DATA, w, b))
    try:
        import numpy as np
        X = np.array([[x1, x2, 1] for x1, x2, y in DATA])
        z = X @ np.array([*w, b])
        print("NumPy fixed-parameter probabilities:", np.exp(-np.logaddexp(0, -z)))
    except ImportError:
        print("Optional NumPy comparison skipped.")
    for _ in range(100):
        loss, g = evaluate(DATA, w, b)
        w, b = [w[0]-.2*g[0], w[1]-.2*g[1]], b-.2*g[2]
    print("Trained:", w, b, evaluate(DATA, w, b)[0])
    print("Metrics:", metrics(DATA, w, b))
