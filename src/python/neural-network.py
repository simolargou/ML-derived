"""A 2-2-1 tanh network with manual backpropagation.
Run locally: python neural-network.py. Optional comparison: pip install torch
Parameter order: W11 W12 W21 W22 b1 b2 v1 v2 c.
Gradients returned by evaluate are full-dataset averages.
"""
from math import tanh, exp, log1p

XOR = [(0,0,0),(0,1,1),(1,0,1),(1,1,0)]
INITIAL = [1.2,-.7,-.6,1.1,.1,-.2,.8,-1.1,.1]

def sigmoid(z):
    if z >= 0:
        return 1/(1+exp(-z))
    e = exp(z)
    return e/(1+e)

def evaluate(theta, data=XOR):
    gradient = [0.0]*9
    loss = 0.0
    for x1, x2, y in data:
        a1 = theta[0]*x1+theta[1]*x2+theta[4]
        a2 = theta[2]*x1+theta[3]*x2+theta[5]
        h1, h2 = tanh(a1), tanh(a2)
        z = theta[6]*h1+theta[7]*h2+theta[8]
        p = sigmoid(z)
        loss += (max(z,0)-y*z+log1p(exp(-abs(z))))/len(data)
        dz = p-y
        g1, g2 = dz*theta[6]*(1-h1*h1), dz*theta[7]*(1-h2*h2)
        one_sample = [g1*x1,g1*x2,g2*x1,g2*x2,g1,g2,dz*h1,dz*h2,dz]
        for j in range(9):
            gradient[j] += one_sample[j]/len(data)
    return loss, gradient

def torch_comparison(theta):
    try:
        import torch
    except ImportError:
        print("Optional PyTorch comparison skipped.")
        return
    t = torch.tensor(theta, dtype=torch.float64, requires_grad=True)
    X = torch.tensor([[x1,x2] for x1,x2,y in XOR], dtype=torch.float64)
    y = torch.tensor([y for x1,x2,y in XOR], dtype=torch.float64)
    W = t[:4].reshape(2,2)
    h = torch.tanh(X @ W.T + t[4:6])
    z = h @ t[6:8] + t[8]
    loss = torch.nn.functional.binary_cross_entropy_with_logits(z, y)
    loss.backward()
    print("PyTorch:", loss.item(), t.grad.tolist())
    print("Manual: ", evaluate(theta))

if __name__ == "__main__":
    theta = INITIAL[:]
    torch_comparison(theta)
    for _ in range(1000):
        loss, gradient = evaluate(theta)
        theta = [v-.5*g for v,g in zip(theta, gradient)]
    print("Final full-dataset loss:", evaluate(theta)[0])
    print("Parameters:", theta)
