import { describe, it, expect } from 'vitest';
import {
  regression,
  regressionStep,
  regressionGeometry,
  leastSquares,
  REGRESSION_DATA,
  logistic,
  sigmoid,
  binaryLoss,
  confusion,
  pca,
  project,
  dot,
  norm,
  angleBetween,
  assign,
  objective,
  updateCentroids,
  initialCentroids,
  CLUSTERS,
  neural,
  neuralStep,
  INITIAL_NET,
  XOR,
  forward,
} from './engines';
import { defaults, validateParams, readLocation, experimentUrl, LESSON_IDS } from './parameters';
const derivative = (f: (x: number) => number, x: number, h = 1e-5) =>
  (f(x + h) - f(x - h)) / (2 * h);
describe('vector geometry', () => {
  it('connects component contributions and dot product', () => {
    expect(dot([2, -1], [3, 4])).toBe(2);
    expect(norm([3, 4])).toBe(5);
    expect(angleBetween([1, 0], [0, 1])).toBeCloseTo(90, 10);
  });
  it('does not calculate an invalid angle for a zero vector', () => {
    expect(angleBetween([0, 0], [2, 1])).toBeNull();
    expect(angleBetween([0, 0], [0, 0])).toBeNull();
  });
});
describe('gradient descent and shared loss', () => {
  it('performs a simultaneous update with the known worked values', () => {
    const r = regressionStep(
      [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      1,
      0,
      0.1,
    );
    expect(r.w).toBeCloseTo(1.3, 12);
    expect(r.b).toBeCloseTo(0.2, 12);
    expect(r.loss).toBeCloseTo(0.145, 12);
  });
  it('converges towards the least-squares loss with a stable rate', () => {
    let w = 0,
      b = 0;
    for (let i = 0; i < 4000; i++) {
      const r = regressionStep(REGRESSION_DATA, w, b, 0.02);
      expect(r.safe).toBe(true);
      w = r.w;
      b = r.b;
    }
    const fit = leastSquares(REGRESSION_DATA);
    expect(regression(REGRESSION_DATA, w, b).loss).toBeCloseTo(
      regression(REGRESSION_DATA, fit.w, fit.b).loss,
      8,
    );
  });
  it('detects excessive and non-finite updates rather than clamping', () => {
    const r = regressionStep(REGRESSION_DATA, 1e10, 1e10, 2);
    expect(r.safe).toBe(false);
    expect(regressionStep(REGRESSION_DATA, Infinity, 0, 0.1).safe).toBe(false);
  });
});
describe('stable logistic calculation', () => {
  it.each([-1000, -100, 0, 100, 1000])('keeps sigmoid and loss finite for logit %s', (z) => {
    expect(Number.isFinite(sigmoid(z))).toBe(true);
    expect(sigmoid(z)).toBeGreaterThanOrEqual(0);
    expect(sigmoid(z)).toBeLessThanOrEqual(1);
    for (const y of [0, 1]) expect(Number.isFinite(binaryLoss(z, y))).toBe(true);
  });
  it('penalizes confidently incorrect predictions by their logit magnitude', () => {
    expect(binaryLoss(1000, 0)).toBe(1000);
    expect(binaryLoss(-1000, 1)).toBe(1000);
    expect(binaryLoss(1000, 1)).toBe(0);
  });
  it('checks all weight and bias gradients with central differences', () => {
    const theta = [0.3, -0.7, 0.2],
      r = logistic(undefined, [theta[0], theta[1]], theta[2]);
    theta.forEach((v, j) => {
      const f = (next: number) => {
        const t = [...theta];
        t[j] = next;
        return logistic(undefined, [t[0], t[1]], t[2]).loss;
      };
      expect(r.gradient[j]).toBeCloseTo(derivative(f, v), 6);
    });
  });
  it('uses greater-than-or-equal at the decision threshold', () => {
    expect(
      confusion(
        [
          { p: 0.5, label: 1 },
          { p: 0.5, label: 0 },
          { p: 0.2, label: 0 },
          { p: 0.8, label: 1 },
        ],
        0.5,
      ),
    ).toEqual({ tp: 2, tn: 1, fp: 1, fn: 0, precision: 2 / 3, recall: 1 });
  });
  it('changes decisions without changing probabilities or loss', () => {
    const r = logistic(),
      before = r.rows.map((q) => q.p);
    const low = confusion(r.rows, 0),
      high = confusion(r.rows, 1);
    expect(low.tp + low.fp).toBe(8);
    expect(high.tp + high.fp).toBe(0);
    expect(high.precision).toBeNull();
    expect(r.rows.map((q) => q.p)).toEqual(before);
  });
  it('represents recall as undefined if there are no actual positives', () => {
    expect(confusion([{ p: 0.8, label: 0 }], 0.5).recall).toBeNull();
  });
});
describe('two-dimensional PCA', () => {
  const data = [
    { x: -1, y: -1 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ];
  it('has known eigenvalues and orthonormal axes', () => {
    const r = pca(data);
    expect(r.values[0]).toBeCloseTo(2, 12);
    expect(r.values[1]).toBeCloseTo(0, 12);
    expect(dot(r.u, r.v)).toBeCloseTo(0, 12);
    expect(norm(r.u)).toBeCloseTo(1, 12);
    expect(norm(r.v)).toBeCloseTo(1, 12);
    const [a, c, d] = r.covariance;
    expect(a * r.u[0] + c * r.u[1]).toBeCloseTo(r.values[0] * r.u[0], 12);
    expect(c * r.u[0] + d * r.u[1]).toBeCloseTo(r.values[0] * r.u[1], 12);
  });
  it('reconstructs rank-one data exactly along PC1', () => {
    const r = pca(data),
      pr = project(r.points, r.angle);
    expect(pr.variance).toBeCloseTo(2, 12);
    expect(pr.error).toBeCloseTo(0, 12);
    pr.reconstruction.forEach((v, i) => {
      expect(v[0]).toBeCloseTo(data[i].x, 12);
      expect(v[1]).toBeCloseTo(data[i].y, 12);
    });
  });
  it('satisfies the reconstruction/variance identity', () => {
    const r = pca([
        { x: 2, y: -1 },
        { x: 0, y: 3 },
        { x: -1, y: 0 },
        { x: 4, y: 2 },
      ]),
      pr = project(r.points, 37);
    expect(pr.error).toBeCloseTo((3 / 4) * (r.values[0] + r.values[1] - pr.variance), 10);
  });
  it('standardizes using sample standard deviation, retaining constant columns safely', () => {
    const r = pca(
      [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
      ],
      true,
    );
    expect(r.scale).toEqual([1, 1]);
    expect(r.covariance).toEqual([0, 0, 1]);
  });
  it('reports zero total variance and non-unique axes', () => {
    const r = pca(
      [
        { x: 2, y: 2 },
        { x: 2, y: 2 },
      ],
      true,
    );
    expect(r.values).toEqual([0, 0]);
    expect(r.explained).toBeNull();
    expect(r.nonUnique).toBe(true);
    expect(project(r.points, 45).error).toBe(0);
  });
  it('recognizes equal nonzero eigenvalues', () => {
    expect(
      pca([
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ]).nonUnique,
    ).toBe(true);
  });
});
describe('K-means phases', () => {
  it('does not increase the objective in either ordinary phase', () => {
    let centers = initialCentroids(CLUSTERS, 3, 4),
      labels = assign(CLUSTERS, centers),
      loss = objective(CLUSTERS, centers, labels);
    for (let i = 0; i < 12; i++) {
      const nextLabels = assign(CLUSTERS, centers);
      const afterAssign = objective(CLUSTERS, centers, nextLabels);
      expect(afterAssign).toBeLessThanOrEqual(loss + 1e-10);
      labels = nextLabels;
      const update = updateCentroids(CLUSTERS, centers, labels);
      expect(update.empty).toEqual([]);
      centers = update.centroids;
      loss = objective(CLUSTERS, centers, labels);
      expect(loss).toBeLessThanOrEqual(afterAssign + 1e-10);
    }
  });
  it('keeps an empty centroid and chooses the first index for ties', () => {
    const data = [{ x: 0, y: 0 }],
      centers = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ];
    expect(assign(data, centers)).toEqual([0]);
    expect(updateCentroids(data, centers, [0])).toEqual({ centroids: centers, empty: [1] });
  });
  it('is reproducible for the same start index', () => {
    expect(initialCentroids(CLUSTERS, 3, 9)).toEqual(initialCentroids(CLUSTERS, 3, 9));
  });
});
describe('neural-network backpropagation', () => {
  it('matches all nine full-dataset gradients to finite differences', () => {
    const r = neural(INITIAL_NET);
    INITIAL_NET.forEach((v, j) => {
      const numerical = derivative(
        (next) => neural(INITIAL_NET.map((old, k) => (k === j ? next : old))).loss,
        v,
      );
      expect(r.gradient[j]).toBeCloseTo(numerical, 6);
    });
  });
  it('also matches one-sample gradients and their dataset average', () => {
    const r = neural(INITIAL_NET);
    r.rows.forEach((row, i) => {
      INITIAL_NET.forEach((v, j) => {
        const numerical = derivative(
          (next) =>
            neural(
              INITIAL_NET.map((old, k) => (j === k ? next : old)),
              [XOR[i]],
            ).loss,
          v,
        );
        expect(row.gradient[j]).toBeCloseTo(numerical, 6);
      });
    });
    r.gradient.forEach((v, j) =>
      expect(v).toBeCloseTo(
        r.rows.reduce((s, q) => s + q.gradient[j] / 4, 0),
        12,
      ),
    );
  });
  it('shows the actual worked forward values', () => {
    const r = forward(INITIAL_NET, [0, 1]);
    expect(r.a[0]).toBeCloseTo(-0.6, 12);
    expect(r.a[1]).toBeCloseTo(0.9, 12);
    expect(r.p).toBeCloseTo(0.246, 3);
  });
  it('reduces XOR loss in a bounded reproducible training session', () => {
    let params = [...INITIAL_NET];
    for (let i = 0; i < 1000; i++) params = neuralStep(params, 0.5).params;
    expect(neural(params).loss).toBeLessThan(0.05);
    expect(neural(params).rows.map((r) => Number(r.p >= 0.5))).toEqual([0, 1, 1, 0]);
  });
});
describe('untrusted shared parameters', () => {
  it('round trips every supported lesson with full precision', () => {
    for (const id of LESSON_IDS) {
      const p = defaults(id);
      if (id === 'pca') p.angle = 17.123456789;
      else if (id === 'k-means') p.seed = 9;
      else if (id === 'neural-network') p.params[0] = 1.123456789;
      else p.w = 1.123456789;
      const url = experimentUrl(id, p, 'https://example.test/');
      const result = readLocation(new URL(url).search);
      expect(result.id).toBe(id);
      expect(result.params).toEqual(p);
      expect(result.invalid).toBe(false);
    }
  });
  it.each([NaN, Infinity, -Infinity, '2', null, 1000000])(
    'rejects a non-finite, wrong-type or extreme weight: %s',
    (w) => {
      const result = validateParams('vectors', { w });
      expect(result.invalid).toBe(true);
      expect(result.params.w).toBe(defaults('vectors').w);
    },
  );
  it('rejects out-of-range thresholds, fractional clusters, and malformed weights', () => {
    const r = validateParams('pca', { threshold: -0.1, k: 2.5, params: [1, 2], points: [] });
    expect(r.invalid).toBe(true);
    expect(r.params).toEqual(defaults('pca'));
  });
  it('rejects extreme coordinates and unbounded input length', () => {
    expect(
      validateParams('pca', {
        points: [
          { x: Infinity, y: 0 },
          { x: 1, y: 1 },
        ],
      }).invalid,
    ).toBe(true);
    expect(readLocation('?experiment=' + encodeURIComponent(' '.repeat(12001))).invalid).toBe(true);
  });
  it('uses safe defaults for malformed JSON, unknown lessons, or prototype keys', () => {
    expect(readLocation('?lesson=unknown&experiment=nope').invalid).toBe(true);
    expect(readLocation('?experiment=' + encodeURIComponent('{"__proto__":{"w":4}}')).invalid).toBe(
      true,
    );
    expect(validateParams('vectors', JSON.parse('{"toString":3}')).invalid).toBe(true);
  });
});

describe('contour geometry and numerical precision', () => {
  it('uses a quadratic loss surface identical to the regression engine', () => {
    const data = REGRESSION_DATA,
      fit = leastSquares(data),
      g = regressionGeometry(data);
    const optimum = regression(data, fit.w, fit.b).loss;
    for (const [w, b] of [
      [-1, -2],
      [0, 0],
      [2, 3],
      [fit.w, fit.b],
    ]) {
      const dw = w - fit.w,
        db = b - fit.b;
      expect(regression(data, w, b).loss).toBeCloseTo(
        optimum + g.a * dw * dw + 2 * g.c * dw * db + db * db,
        10,
      );
    }
  });
  it('preserves divergent but finite shared optimization parameters', () => {
    const p = defaults('gradient-descent');
    p.w = 12500;
    p.b = -750;
    expect(
      readLocation(new URL(experimentUrl('gradient-descent', p, 'https://example.test')).search)
        .params,
    ).toEqual(p);
  });
});

describe('small-scale data retain their geometry', () => {
  it('fits a varying input even when the feature scale is tiny', () => {
    const fit = leastSquares([
      { x: 1e-8, y: 2e-8 },
      { x: 2e-8, y: 4e-8 },
      { x: 3e-8, y: 6e-8 },
    ]);
    expect(fit.constant).toBe(false);
    expect(fit.w).toBeCloseTo(2, 12);
    expect(fit.b).toBeCloseTo(0, 12);
  });
  it('still identifies exactly repeated decimal inputs', () => {
    expect(
      leastSquares([
        { x: 0.1, y: 1 },
        { x: 0.1, y: 2 },
        { x: 0.1, y: 3 },
      ]),
    ).toEqual({ w: 0, b: 2, constant: true });
  });
  it('does not confuse low variance with equal eigenvalues', () => {
    const r = pca([
      { x: -1e-8, y: 0 },
      { x: 0, y: 0 },
      { x: 1e-8, y: 0 },
    ]);
    expect(r.nonUnique).toBe(false);
    expect(r.explained).toBeCloseTo(1, 12);
  });
});
