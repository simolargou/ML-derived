import { Plot } from './Plot';
import { leastSquares, regressionGeometry, regression } from '../math/engines';
import type { Point } from '../math/engines';
export function GradientLandscape({
  points,
  w,
  b,
  path,
}: {
  points: Point[];
  w: number;
  b: number;
  path: { w: number; b: number }[];
}) {
  const fit = leastSquares(points);
  const geometry = regressionGeometry(points);
  const minimum = regression(points, fit.w, fit.b).loss;
  const [e1, e2] = geometry.eigenvalues;
  const rotation = geometry.rotation;
  const p = { w, b };
  return (
    <Plot
      height={250}
      title="Contours of the actual regression MSE over slope w and intercept b. The orange path shows all retained optimization steps."
      xDomain={[-1, 3]}
      yDomain={[-2, 4]}
      xLabel="w"
      yLabel="b"
    >
      {({ sx, sy }) => (
        <>
          {[65, 40, 25, 16, 10, 6.5, 4, 2.5, 1.6, 1, 0.6, 0.35, 0.2, 0.1, 0.05, 0.02].map(
            (level) => {
              if (e2 < 1e-12) {
                return [-1, 1].map((sign) => {
                  const centerW = fit.w + sign * Math.sqrt(level / e1) * Math.cos(rotation),
                    centerB = fit.b + sign * Math.sqrt(level / e1) * Math.sin(rotation);
                  return (
                    <line
                      key={level + '-' + sign}
                      x1={sx(centerW - 100 * Math.sin(rotation))}
                      x2={sx(centerW + 100 * Math.sin(rotation))}
                      y1={sy(centerB + 100 * Math.cos(rotation))}
                      y2={sy(centerB - 100 * Math.cos(rotation))}
                      stroke="var(--plot-contour)"
                      strokeWidth="1"
                    >
                      <title>{'MSE = ' + (minimum + level).toPrecision(5)}</title>
                    </line>
                  );
                });
              }
              const pts = Array.from({ length: 121 }, (_, j) => {
                const t = (j / 120) * 2 * Math.PI,
                  q1 = Math.sqrt(level / e1) * Math.cos(t),
                  q2 = e2 > 1e-12 ? Math.sqrt(level / e2) * Math.sin(t) : 0;
                return (
                  sx(fit.w + q1 * Math.cos(rotation) - q2 * Math.sin(rotation)) +
                  ',' +
                  sy(fit.b + q1 * Math.sin(rotation) + q2 * Math.cos(rotation))
                );
              }).join(' ');
              return (
                <polyline
                  key={level}
                  points={pts}
                  fill="var(--plot-prediction)"
                  fillOpacity="0.012"
                  stroke="var(--plot-contour)"
                  strokeWidth="1"
                  opacity=".8"
                >
                  <title>{'MSE = ' + (minimum + level).toPrecision(5)}</title>
                </polyline>
              );
            },
          )}
          <polyline
            points={path.map((q) => sx(q.w) + ',' + sy(q.b)).join(' ')}
            fill="none"
            stroke="var(--plot-error)"
            strokeWidth="1.8"
          />
          {path
            .filter((_, i) => i % Math.max(1, Math.floor(path.length / 25)) === 0)
            .map((q, i) => (
              <circle key={i} cx={sx(q.w)} cy={sy(q.b)} r="2" fill="var(--plot-error)" />
            ))}
          <path
            d={
              'M' +
              (sx(fit.w) - 5) +
              ',' +
              sy(fit.b) +
              'h10M' +
              sx(fit.w) +
              ',' +
              (sy(fit.b) - 5) +
              'v10'
            }
            stroke="var(--plot-prediction)"
            strokeWidth="2"
          />
          <circle
            cx={sx(p.w)}
            cy={sy(p.b)}
            r="4"
            fill="var(--plot-prediction)"
            stroke="var(--plot-bg)"
            strokeWidth="1.5"
          />
        </>
      )}
    </Plot>
  );
}
