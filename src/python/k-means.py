"""Lloyd phases with deterministic farthest-first initialization.
Run locally: python k-means.py. Optional comparison: pip install scikit-learn
Empty clusters keep their previous centers. Ties choose the lowest index.
"""
def distance2(a, b):
    return sum((x-y)**2 for x, y in zip(a, b))

def initialize(points, k, start=0):
    if not 1 <= k <= len(points):
        raise ValueError("Require 1 <= k <= n")
    centers = [points[start % len(points)]]
    while len(centers) < k:
        centers.append(max(points, key=lambda p: min(distance2(p,c) for c in centers)))
    return centers

def assign(points, centers):
    return [min(range(len(centers)), key=lambda j: distance2(p, centers[j]))
            for p in points]

def objective(points, centers, labels):
    return sum(distance2(p, centers[label]) for p, label in zip(points, labels))

def update(points, centers, labels):
    next_centers = []
    for j, old in enumerate(centers):
        group = [p for p, label in zip(points, labels) if label == j]
        next_centers.append(tuple(sum(p[d] for p in group)/len(group)
                                  for d in range(2)) if group else old)
    return next_centers

def fit(points, k, start=0, limit=50):
    centers = initialize(points, k, start)
    for _ in range(limit):
        labels = assign(points, centers)
        next_centers = update(points, centers, labels)
        stable = all(distance2(a,b) < 1e-12 for a,b in zip(centers, next_centers))
        centers = next_centers
        if stable:
            break
    labels = assign(points, centers)
    return centers, labels, objective(points, centers, labels)

if __name__ == "__main__":
    points = [(0,0),(2,0),(8,0),(10,0)]
    print("Manual:", fit(points, 2))
    try:
        from sklearn.cluster import KMeans
        model = KMeans(n_clusters=2, init=initialize(points,2),
                       n_init=1, algorithm="lloyd", random_state=0).fit(points)
        print("scikit-learn centers, inertia:", model.cluster_centers_, model.inertia_)
    except ImportError:
        print("Optional scikit-learn comparison skipped.")
