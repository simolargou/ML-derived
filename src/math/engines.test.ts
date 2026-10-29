import { describe, it, expect } from 'vitest';
import { regression, leastSquares, REGRESSION_DATA } from './engines';
// h=1e-5 balances truncation and floating-point cancellation for these O(1) inputs.
// Compare to six decimal places: finite differences are approximate, not identities.
const central = (f: (v: number) => number, x: number, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
describe('least squares', () => {
  it('fits the known line y = 2x + 1', () => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ];
    const fit = leastSquares(data);
    expect(fit.w).toBeCloseTo(2, 12);
    expect(fit.b).toBeCloseTo(1, 12);
    expect(regression(data, fit.w, fit.b).loss).toBeCloseTo(0, 12);
  });
  it('chooses a defined convention for constant input', () => {
    expect(
      leastSquares([
        { x: 2, y: 1 },
        { x: 2, y: 3 },
      ]),
    ).toEqual({ w: 0, b: 2, constant: true });
  });
  it('matches both analytical gradients to central differences', () => {
    const w = 0.7,
      b = -0.3,
      r = regression(REGRESSION_DATA, w, b);
    expect(r.dw).toBeCloseTo(
      central((v) => regression(REGRESSION_DATA, v, b).loss, w),
      6,
    );
    expect(r.db).toBeCloseTo(
      central((v) => regression(REGRESSION_DATA, w, v).loss, b),
      6,
    );
  });
  it('rejects an empty dataset', () => {
    expect(() => leastSquares([])).toThrow();
    expect(() => regression([], 0, 0)).toThrow();
  });
});
