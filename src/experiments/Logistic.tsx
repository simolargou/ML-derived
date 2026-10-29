import { useState } from 'react';
import { SkipForward, RotateCcw } from 'lucide-react';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { logistic, confusion, sigmoid } from '../math/engines';
import { Plot } from '../visualizations/Plot';
import { NumberControl, Stat, Calculation, fmt, MathView } from '../components/ui';
export default function Logistic({ p, setP }: ExperimentProps) {
  const [steps, setSteps] = useState(0),
    [status, setStatus] = useState('Change the threshold without retraining.');
  const result = logistic(undefined, [p.w, p.w2], p.b),
    m = confusion(result.rows, p.threshold);
  const boundary =
    p.threshold > 0 && p.threshold < 1 ? Math.log(p.threshold / (1 - p.threshold)) - p.b : null;
  const change = (values: Partial<typeof p>) => {
    setP({ ...p, ...values });
    setSteps(0);
  };
  const train = () => {
    const [dw, dw2, db] = result.gradient,
      w = p.w - p.alpha * dw,
      w2 = p.w2 - p.alpha * dw2,
      b = p.b - p.alpha * db;
    if (
      ![w, w2, b].every(Number.isFinite) ||
      Math.max(Math.abs(w), Math.abs(w2), Math.abs(b)) > 10
    ) {
      setStatus(
        'Training stopped at the experiment’s weight limit of 10. Reset before continuing.',
      );
      return;
    }
    setP({ ...p, w, w2, b });
    setSteps(steps + 1);
    setStatus('Full-dataset gradient update ' + (steps + 1) + ' applied. Threshold unchanged.');
  };
  return (
    <>
      <div className="lab-equation">
        <MathView
          inline
          math={'p=\\sigma(' + fmt(p.w, 2) + 'x_1+' + fmt(p.w2, 2) + 'x_2+' + fmt(p.b, 2) + ')'}
        />
      </div>
      <Plot
        title="Sigmoid probability surface from dark navy for zero to teal for one. Circles are observed class 0 and squares class 1. Orange crosses mark classification errors."
        xDomain={[-3, 3]}
        yDomain={[-3, 3]}
        xLabel="x₁"
        yLabel="x₂"
      >
        {({ sx, sy }) => (
          <>
            {Array.from({ length: 30 * 30 }, (_, i) => {
              const x = -3 + (i % 30) * 0.2,
                y = -3 + Math.floor(i / 30) * 0.2;
              return (
                <rect
                  key={i}
                  x={sx(x)}
                  y={sy(y + 0.2)}
                  width={12.1}
                  height={7.6}
                  fill="var(--plot-prediction)"
                  opacity={sigmoid(p.w * (x + 0.1) + p.w2 * (y + 0.1) + p.b) * 0.6}
                />
              );
            })}
            {boundary !== null &&
              (Math.abs(p.w2) > 1e-10 ? (
                <line
                  x1={sx(-3)}
                  x2={sx(3)}
                  y1={sy((boundary + 3 * p.w) / p.w2)}
                  y2={sy((boundary - 3 * p.w) / p.w2)}
                  stroke="var(--plot-prediction)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              ) : Math.abs(p.w) > 1e-10 ? (
                <line
                  x1={sx(boundary / p.w)}
                  x2={sx(boundary / p.w)}
                  y1={sy(-3)}
                  y2={sy(3)}
                  stroke="var(--plot-prediction)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              ) : null)}
            {result.rows.map((r, i) => (
              <g key={i}>
                {r.label === 0 ? (
                  <circle
                    cx={sx(r.x)}
                    cy={sy(r.y)}
                    r="5"
                    fill="var(--plot-bg)"
                    stroke="var(--plot-target)"
                    strokeWidth="1.5"
                  />
                ) : (
                  <rect
                    x={sx(r.x) - 5}
                    y={sy(r.y) - 5}
                    width="10"
                    height="10"
                    fill="var(--plot-target)"
                    stroke="var(--plot-bg)"
                    strokeWidth="1.5"
                  />
                )}
                {Number(r.p >= p.threshold) !== r.label && (
                  <path
                    d={'M' + (sx(r.x) + 7) + ',' + (sy(r.y) - 8) + 'l5 5m0 -5l-5 5'}
                    stroke="var(--plot-error)"
                    strokeWidth="1.8"
                  />
                )}
                <title>
                  {'Observed ' +
                    r.label +
                    ', probability ' +
                    fmt(r.p) +
                    ', prediction ' +
                    Number(r.p >= p.threshold)}
                </title>
              </g>
            ))}
          </>
        )}
      </Plot>
      <div className="plot-legend">
        <span>○ Class 0</span>
        <span>■ Class 1</span>
        <span>× Misclassified</span>
        <span>
          <i className="line teal dashed" />
          Boundary
        </span>
      </div>
      <div className="probability-scale">
        <span>p = 0</span>
        <i />
        <span>p = 1</span>
      </div>
      {(boundary === null || (p.w === 0 && p.w2 === 0)) && (
        <p className="small-note">
          No finite decision line:{' '}
          {boundary === null
            ? 'the threshold is an endpoint.'
            : 'both weights are zero, so probability is constant.'}
        </p>
      )}
      <div className="lab-controls">
        <NumberControl
          label="Weight · w₁"
          min={-4}
          max={4}
          value={p.w}
          onChange={(w) => change({ w })}
        />
        <NumberControl
          label="Weight · w₂"
          min={-4}
          max={4}
          value={p.w2}
          onChange={(w2) => change({ w2 })}
        />
      </div>
      <NumberControl
        label="Bias · b"
        min={-4}
        max={4}
        value={p.b}
        onChange={(b) => change({ b })}
      />
      <div className="lab-spaced">
        <NumberControl
          label="Decision threshold · τ"
          min={0}
          max={1}
          step={0.01}
          value={p.threshold}
          onChange={(threshold) => setP({ ...p, threshold })}
        />
      </div>
      <table className="confusion">
        <caption>Confusion matrix · prediction is 1 when p ≥ τ</caption>
        <thead>
          <tr>
            <th>Actual ↓ / Predicted →</th>
            <th>0</th>
            <th>1</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>0</th>
            <td>TN {m.tn}</td>
            <td>FP {m.fp}</td>
          </tr>
          <tr>
            <th>1</th>
            <td>FN {m.fn}</td>
            <td>TP {m.tp}</td>
          </tr>
        </tbody>
      </table>
      <div className="stats-row">
        <Stat label="Precision" value={m.precision} />
        <Stat label="Recall" value={m.recall} />
      </div>
      <div className="lab-equation">
        <span>Mean cross-entropy</span>
        <strong className="mono">{fmt(result.loss)}</strong>
      </div>
      <div className="lab-spaced">
        <NumberControl
          label="Training rate · α"
          min={0.01}
          max={1}
          step={0.01}
          value={p.alpha}
          onChange={(alpha) => setP({ ...p, alpha })}
        />
      </div>
      <div className="button-row">
        <button className="primary" onClick={train}>
          <SkipForward size={14} />
          Train one step
        </button>
        <button
          onClick={() => {
            setP(defaults('logistic-regression'));
            setSteps(0);
            setStatus('Reset to the initial model.');
          }}
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
      <p className="feedback" role="status">
        {status}
      </p>
      <Calculation>
        <p>
          Current mean gradients: dw₁ = {fmt(result.gradient[0])}; dw₂ = {fmt(result.gradient[1])};
          db = {fmt(result.gradient[2])}.
        </p>
        <p>
          Precision = {m.tp} / ({m.tp} + {m.fp}) = {fmt(m.precision)}. Recall = {m.tp} / ({m.tp} +{' '}
          {m.fn}) = {fmt(m.recall)}.
        </p>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>Probabilities and thresholded predictions</caption>
            <thead>
              <tr>
                <th>Point</th>
                <th>y</th>
                <th>z</th>
                <th>p</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.label}</td>
                  <td>{fmt(r.z)}</td>
                  <td>{fmt(r.p)}</td>
                  <td>{Number(r.p >= p.threshold)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Calculation>
    </>
  );
}
