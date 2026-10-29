export type Vec2 = [number, number];
export type Point = { x: number; y: number };
export const REGRESSION_DATA: Point[] = [
  [0.5, 1.8],
  [1.5, 2.1],
  [2, 3.4],
  [3, 3.1],
  [4, 5],
  [5, 4.8],
  [5.8, 6.4],
  [6.5, 6.1],
].map(([x, y]) => ({ x, y }));
export const CLASS_DATA = [
  { x: -2, y: -1, label: 0 },
  { x: -1.4, y: 0.3, label: 0 },
  { x: -0.7, y: -1.7, label: 0 },
  { x: 0.4, y: -0.9, label: 0 },
  { x: 0.8, y: 0.6, label: 1 },
  { x: 1.7, y: 0.1, label: 1 },
  { x: 0.2, y: 1.8, label: 1 },
  { x: -0.6, y: 0.8, label: 1 },
];
export const CLOUD: Point[] = [
  [-2.8, -1.4],
  [-2, -1.8],
  [-1.6, -0.4],
  [-0.8, -0.9],
  [-0.2, 0.3],
  [0.4, -0.1],
  [1, 0.9],
  [1.8, 0.7],
  [2, 1.8],
  [2.8, 1.4],
].map(([x, y]) => ({ x, y }));
export const CLUSTERS: Point[] = [
  [-2.7, -1.8],
  [-2.2, -1.2],
  [-1.7, -2],
  [-2.4, -0.5],
  [-1.4, -1.1],
  [1.2, -1.8],
  [1.9, -1.4],
  [2.5, -2],
  [2.1, -0.7],
  [0.9, 1.2],
  [1.6, 2.2],
  [0.1, 2],
  [0.7, 2.8],
  [-0.5, 1.4],
].map(([x, y]) => ({ x, y }));
export const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export const norm = (v: Vec2) => Math.hypot(...v);
export function angleBetween(a: Vec2, b: Vec2) {
  const denom = norm(a) * norm(b);
  return denom === 0
    ? null
    : (Math.acos(Math.max(-1, Math.min(1, dot(a, b) / denom))) * 180) / Math.PI;
}
export function regression(data: Point[], w: number, b: number) {
  if (!data.length) throw new Error('At least one point is needed.');
  const rows = data.map((p) => {
    const prediction = w * p.x + b;
    const residual = prediction - p.y;
    return { ...p, prediction, residual, squared: residual ** 2 };
  });
  const loss = rows.reduce((s, p) => s + p.squared, 0) / data.length;
  const dw = (2 * rows.reduce((s, p) => s + p.x * p.residual, 0)) / data.length;
  const db = (2 * rows.reduce((s, p) => s + p.residual, 0)) / data.length;
  return { rows, loss, dw, db };
}
export function leastSquares(data: Point[]) {
  if (!data.length) throw new Error('At least one point is needed.');
  const mx = data.reduce((s, p) => s + p.x, 0) / data.length,
    my = data.reduce((s, p) => s + p.y, 0) / data.length;
  const denominator = data.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const constant = data.every((p) => p.x === data[0].x) || denominator === 0;
  const w = constant ? 0 : data.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / denominator;
  return { w, b: my - w * mx, constant };
}
export function regressionStep(data: Point[], w: number, b: number, alpha: number) {
  const r = regression(data, w, b),
    nextW = w - alpha * r.dw,
    nextB = b - alpha * r.db;
  const next = regression(data, nextW, nextB);
  // A display/compute safety limit is a stop, never a clipped successful update.
  const safe =
    [nextW, nextB, next.loss].every(Number.isFinite) &&
    Math.max(Math.abs(nextW), Math.abs(nextB), next.loss) < 1e12;
  return { w: nextW, b: nextB, ...next, safe, previous: r };
}
export function sigmoid(z: number) {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const e = Math.exp(z);
  return e / (1 + e);
}
export function binaryLoss(z: number, y: number) {
  // Softplus identity avoids log(0), exp(large), and subtracting near-equal probabilities.
  return Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));
}
export function logistic(data = CLASS_DATA, w: Vec2 = [1, 1], b = 0) {
  const rows = data.map((p) => {
    const z = w[0] * p.x + w[1] * p.y + b;
    return { ...p, z, p: sigmoid(z) };
  });
  const n = rows.length;
  return {
    rows,
    loss: rows.reduce((s, r) => s + binaryLoss(r.z, r.label), 0) / n,
    gradient: [
      rows.reduce((s, r) => s + (r.p - r.label) * r.x, 0) / n,
      rows.reduce((s, r) => s + (r.p - r.label) * r.y, 0) / n,
      rows.reduce((s, r) => s + r.p - r.label, 0) / n,
    ],
  };
}
export function confusion(rows: { p: number; label: number }[], threshold: number) {
  let tp = 0,
    tn = 0,
    fp = 0,
    fn = 0;
  rows.forEach((r) => {
    if (r.p >= threshold) {
      if (r.label === 1) tp++;
      else fp++;
    } else {
      if (r.label === 0) tn++;
      else fn++;
    }
  });
  return {
    tp,
    tn,
    fp,
    fn,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
  };
}
export function pca(data: Point[], standardize = false) {
  if (data.length < 2) throw new Error('Sample covariance needs at least two points.');
  const n = data.length,
    mean: Vec2 = [data.reduce((s, p) => s + p.x, 0) / n, data.reduce((s, p) => s + p.y, 0) / n];
  const centered: Vec2[] = data.map((p) => [p.x - mean[0], p.y - mean[1]]);
  const sd: Vec2 = [
    Math.sqrt(centered.reduce((s, p) => s + p[0] ** 2, 0) / (n - 1)),
    Math.sqrt(centered.reduce((s, p) => s + p[1] ** 2, 0) / (n - 1)),
  ];
  const scale: Vec2 = standardize ? [sd[0] || 1, sd[1] || 1] : [1, 1];
  const points: Vec2[] = centered.map((p) => [p[0] / scale[0], p[1] / scale[1]]);
  const a = points.reduce((s, p) => s + p[0] ** 2, 0) / (n - 1),
    c = points.reduce((s, p) => s + p[0] * p[1], 0) / (n - 1),
    d = points.reduce((s, p) => s + p[1] ** 2, 0) / (n - 1);
  const delta = Math.hypot(a - d, 2 * c),
    values: Vec2 = [Math.max(0, (a + d + delta) / 2), Math.max(0, (a + d - delta) / 2)];
  const angle = 0.5 * Math.atan2(2 * c, a - d);
  const u: Vec2 = [Math.cos(angle), Math.sin(angle)],
    v: Vec2 = [-u[1], u[0]];
  return {
    mean,
    sd,
    scale,
    points,
    covariance: [a, c, d],
    values,
    u,
    v,
    angle: (angle * 180) / Math.PI,
    explained: a + d > 0 ? values[0] / (a + d) : null,
    nonUnique: delta <= 1e-12 * Math.max(a + d, Number.MIN_VALUE),
  };
}
export function project(points: Vec2[], angle: number) {
  const r = (angle * Math.PI) / 180,
    u: Vec2 = [Math.cos(r), Math.sin(r)];
  const scores = points.map((p) => dot(p, u));
  const reconstruction: Vec2[] = scores.map((s) => [s * u[0], s * u[1]]);
  return {
    u,
    scores,
    reconstruction,
    variance: scores.reduce((s, v) => s + v * v, 0) / (points.length - 1),
    error:
      points.reduce(
        (s, p, i) => s + (p[0] - reconstruction[i][0]) ** 2 + (p[1] - reconstruction[i][1]) ** 2,
        0,
      ) / points.length,
  };
}
export const distance2 = (a: Point, b: Point) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export function initialCentroids(data: Point[], k: number, seed: number) {
  const result = [{ ...data[((seed % data.length) + data.length) % data.length] }];
  while (result.length < k) {
    let best = -1,
      index = 0;
    data.forEach((p, i) => {
      const distance = Math.min(...result.map((c) => distance2(p, c)));
      if (distance > best) {
        best = distance;
        index = i;
      }
    });
    result.push({ ...data[index] });
  }
  return result;
}
export function assign(data: Point[], centroids: Point[]) {
  return data.map((p) => {
    let index = 0;
    centroids.forEach((c, j) => {
      if (distance2(p, c) < distance2(p, centroids[index])) index = j;
    });
    return index;
  });
}
export function objective(data: Point[], centroids: Point[], labels: number[]) {
  return data.reduce((s, p, i) => s + distance2(p, centroids[labels[i]]), 0);
}
export function updateCentroids(data: Point[], centroids: Point[], labels: number[]) {
  const empty: number[] = [];
  const next = centroids.map((old, j) => {
    const group = data.filter((_, i) => labels[i] === j);
    if (!group.length) {
      empty.push(j);
      return { ...old };
    }
    return {
      x: group.reduce((s, p) => s + p.x, 0) / group.length,
      y: group.reduce((s, p) => s + p.y, 0) / group.length,
    };
  });
  return { centroids: next, empty };
}
export const XOR = [
  { x: 0, y: 0, label: 0 },
  { x: 0, y: 1, label: 1 },
  { x: 1, y: 0, label: 1 },
  { x: 1, y: 1, label: 0 },
];
// Layout: W11 W12 W21 W22 b1 b2 v1 v2 c. Hidden units use tanh.
export const INITIAL_NET = [1.2, -0.7, -0.6, 1.1, 0.1, -0.2, 0.8, -1.1, 0.1];
export const NET_NAMES = ['W₁₁', 'W₁₂', 'W₂₁', 'W₂₂', 'b₁', 'b₂', 'v₁', 'v₂', 'c'];
export function forward(params: number[], x: Vec2) {
  const a: Vec2 = [
    params[0] * x[0] + params[1] * x[1] + params[4],
    params[2] * x[0] + params[3] * x[1] + params[5],
  ];
  const h: Vec2 = [Math.tanh(a[0]), Math.tanh(a[1])],
    z = params[6] * h[0] + params[7] * h[1] + params[8],
    p = sigmoid(z);
  return { a, h, z, p };
}
export function neural(params: number[], data = XOR) {
  const gradient = Array<number>(9).fill(0);
  let loss = 0;
  const rows = data.map((r) => {
    const f = forward(params, [r.x, r.y]),
      dz = f.p - r.label;
    const dh: Vec2 = [1 - f.h[0] ** 2, 1 - f.h[1] ** 2],
      da: Vec2 = [dz * params[6] * dh[0], dz * params[7] * dh[1]];
    const g = [
      da[0] * r.x,
      da[0] * r.y,
      da[1] * r.x,
      da[1] * r.y,
      da[0],
      da[1],
      dz * f.h[0],
      dz * f.h[1],
      dz,
    ];
    g.forEach((v, j) => (gradient[j] += v / data.length));
    loss += binaryLoss(f.z, r.label) / data.length;
    return { ...r, ...f, dz, dh, da, gradient: g };
  });
  return { loss, gradient, rows };
}
export function neuralStep(params: number[], alpha: number) {
  const before = neural(params),
    next = params.map((v, j) => v - alpha * before.gradient[j]);
  return { params: next, result: neural(next) };
}

/** For MSE, J(theta) = J(theta*) + delta^T A delta, with Hessian H = 2A. */
export function regressionGeometry(data: Point[]) {
  const n = data.length;
  if (!n) throw new Error('At least one point is needed.');
  const a = data.reduce((s, q) => s + q.x * q.x, 0) / n,
    c = data.reduce((s, q) => s + q.x, 0) / n,
    d = 1;
  const gap = Math.hypot(a - d, 2 * c);
  const eigenvalues: Vec2 = [(a + d + gap) / 2, Math.max(0, (a + d - gap) / 2)];
  return {
    a,
    c,
    d,
    eigenvalues,
    rotation: 0.5 * Math.atan2(2 * c, a - d),
    rateBoundary: 1 / eigenvalues[0],
  };
}
