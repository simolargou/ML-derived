import { RotateCcw, Eye } from 'lucide-react';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { pca, project, CLOUD } from '../math/engines';
import { Plot } from '../visualizations/Plot';
import { NumberControl, Stat, Calculation, fmt, MathView } from '../components/ui';

const cloudPresets = {
  correlated: CLOUD,
  isotropic: [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ],
  constant: Array.from({ length: 4 }, () => ({ x: 2, y: 2 })),
};
type CloudPreset = keyof typeof cloudPresets;
export default function PCA({ p, setP }: ExperimentProps) {
  const result = pca(p.points, p.standardize),
    candidate = project(result.points, p.angle),
    optimal = project(result.points, result.angle);
  const selectedCloud =
    (Object.keys(cloudPresets) as CloudPreset[]).find((key) => {
      const preset = cloudPresets[key];
      return (
        p.points.length === preset.length &&
        p.points.every((point, i) => point.x === preset[i].x && point.y === preset[i].y)
      );
    }) ?? 'custom';
  const extent = Math.max(3.5, ...result.points.map((q) => Math.hypot(...q))) * 1.12;
  return (
    <>
      <div className="lab-equation">
        <span>{p.standardize ? 'Centered + sample-standardized' : 'Centered coordinates'}</span>
        <span>n = {p.points.length}</span>
      </div>
      <Plot
        equalAspect
        title="Centered point cloud. Dashed orange segments connect each original point to its projection on the candidate axis. Principal axes can be revealed."
        xDomain={[-extent, extent]}
        yDomain={[-extent, extent]}
        xLabel="q₁"
        yLabel="q₂"
      >
        {({ sx, sy }) => (
          <>
            <line
              x1={sx(-candidate.u[0] * extent * 2)}
              x2={sx(candidate.u[0] * extent * 2)}
              y1={sy(-candidate.u[1] * extent * 2)}
              y2={sy(candidate.u[1] * extent * 2)}
              stroke="var(--plot-error)"
              strokeWidth="2"
            />
            {p.reveal &&
              [result.u, result.v].map((u, i) => (
                <g key={i}>
                  <line
                    x1={sx(-u[0] * extent * 2)}
                    x2={sx(u[0] * extent * 2)}
                    y1={sy(-u[1] * extent * 2)}
                    y2={sy(u[1] * extent * 2)}
                    stroke="var(--plot-prediction)"
                    strokeWidth={i === 0 ? 2 : 1}
                    strokeDasharray={i === 1 ? '4 4' : ''}
                  />
                  <text
                    x={sx(u[0] * extent * 0.8) + 6}
                    y={sy(u[1] * extent * 0.8) - 7}
                    style={{ fill: 'var(--plot-prediction)' }}
                  >
                    PC{i + 1}
                  </text>
                </g>
              ))}
            {result.points.map((q, i) => {
              const rec = candidate.reconstruction[i];
              return (
                <g key={i}>
                  <line
                    x1={sx(q[0])}
                    x2={sx(rec[0])}
                    y1={sy(q[1])}
                    y2={sy(rec[1])}
                    stroke="var(--plot-error)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <circle
                    cx={sx(q[0])}
                    cy={sy(q[1])}
                    r="4"
                    fill="var(--plot-bg)"
                    stroke="var(--plot-target)"
                    strokeWidth="1.5"
                  />
                  <rect
                    x={sx(rec[0]) - 2.5}
                    y={sy(rec[1]) - 2.5}
                    width="5"
                    height="5"
                    fill="var(--plot-error)"
                  />
                  <title>{'Point ' + (i + 1) + ', score ' + fmt(candidate.scores[i])}</title>
                </g>
              );
            })}
          </>
        )}
      </Plot>
      <div className="plot-legend">
        <span>○ Centered point</span>
        <span>▪ Projection</span>
        <span>
          <i className="line orange" />
          Candidate axis
        </span>
      </div>
      <NumberControl
        label="Candidate axis angle"
        min={-180}
        max={180}
        step={1}
        value={p.angle}
        onChange={(angle) => setP({ ...p, angle })}
      />
      <div className="toggle-row">
        <label>
          <input
            type="checkbox"
            checked={p.standardize}
            onChange={(e) => setP({ ...p, standardize: e.target.checked })}
          />
          Standardize features
        </label>
      </div>
      <div className="stats-row">
        <Stat label="Projected sample variance" value={candidate.variance} />
        <Stat label="Reconstruction error · mean" value={candidate.error} />
      </div>
      <div className="button-row">
        <button className="primary" onClick={() => setP({ ...p, reveal: !p.reveal })}>
          <Eye size={14} />
          {p.reveal ? 'Hide' : 'Reveal'} principal axes
        </button>
        <button onClick={() => setP({ ...p, angle: result.angle, reveal: true })}>Use PC1</button>
      </div>
      {p.reveal && (
        <div className="pca-results">
          <p>
            λ₁ = <strong>{fmt(result.values[0])}</strong> · λ₂ ={' '}
            <strong>{fmt(result.values[1])}</strong>
          </p>
          <p>
            PC1 explained variance:{' '}
            <strong>
              {result.explained === null ? 'Undefined' : fmt(result.explained * 100, 1) + '%'}
            </strong>
          </p>
          <p>
            PC1 reconstruction error: <strong>{fmt(optimal.error)}</strong>
          </p>
          <p>
            Candidate excess error: <strong>{fmt(candidate.error - optimal.error)}</strong>
          </p>
        </div>
      )}
      {result.nonUnique && (
        <p className="feedback">
          Equal eigenvalues: a principal direction is non-unique.{' '}
          {result.explained === null
            ? 'Total variance is zero, so the explained-variance ratio is undefined.'
            : ''}
        </p>
      )}
      {p.standardize && result.sd.some((s) => s === 0) && (
        <p className="small-note">
          A constant feature has zero standard deviation. Its scale is set to 1 after centering.
        </p>
      )}
      <label className="select-control">
        Point cloud
        <select
          aria-label="Point cloud"
          value={selectedCloud}
          onChange={(e) => {
            const key = e.target.value;
            if (key === 'custom') return;
            const points = cloudPresets[key as CloudPreset].map((point) => ({ ...point }));
            setP({ ...p, points });
          }}
        >
          {selectedCloud === 'custom' && (
            <option value="custom" disabled>
              Custom shared cloud
            </option>
          )}
          <option value="correlated">Correlated example</option>
          <option value="isotropic">Equal-variance example</option>
          <option value="constant">Zero-variance example</option>
        </select>
      </label>
      <Calculation>
        <MathView
          math={
            'C=\\begin{bmatrix}' +
            fmt(result.covariance[0]) +
            '&' +
            fmt(result.covariance[1]) +
            '\\\\' +
            fmt(result.covariance[1]) +
            '&' +
            fmt(result.covariance[2]) +
            '\\end{bmatrix}'
          }
        />
        <p>
          Mean = [{result.mean.map((v) => fmt(v)).join(', ')}]; scale = [
          {result.scale.map((v) => fmt(v)).join(', ')}].
        </p>
        <p>
          Unit axis u = [{candidate.u.map((v) => fmt(v)).join(', ')}]. Variance divides by n − 1 ={' '}
          {p.points.length - 1}; mean reconstruction error divides by n = {p.points.length}.
        </p>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>Projection and reconstruction in displayed units</caption>
            <thead>
              <tr>
                <th>i</th>
                <th>q₁</th>
                <th>q₂</th>
                <th>t</th>
                <th>Rebuilt q₁</th>
                <th>Rebuilt q₂</th>
              </tr>
            </thead>
            <tbody>
              {result.points.map((q, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{fmt(q[0], 2)}</td>
                  <td>{fmt(q[1], 2)}</td>
                  <td>{fmt(candidate.scores[i], 2)}</td>
                  <td>{fmt(candidate.reconstruction[i][0], 2)}</td>
                  <td>{fmt(candidate.reconstruction[i][1], 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Calculation>
      <div className="button-row lab-spaced">
        <button onClick={() => setP(defaults('pca'))}>
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </>
  );
}
