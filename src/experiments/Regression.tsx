import { RegressionChallenge } from './RegressionChallenge';
import { useState } from 'react';
import { RotateCcw, WandSparkles, Plus, Trash2 } from 'lucide-react';
import { regression, leastSquares, REGRESSION_DATA } from '../math/engines';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { Plot } from '../visualizations/Plot';
import { NumberControl, Stat, Calculation, fmt, MathView } from '../components/ui';

export default function Regression({ p, setP }: ExperimentProps) {
  const [resetVersion, setResetVersion] = useState(0);
  const [squares, setSquares] = useState(true),
    [residuals, setResiduals] = useState(true),
    [x, setX] = useState('4'),
    [y, setY] = useState('4'),
    [message, setMessage] = useState('');
  const r = regression(p.points, p.w, p.b),
    fit = leastSquares(p.points);
  const add = (px: number, py: number) => {
    if (p.points.length >= 40) {
      setMessage('This experiment supports up to 40 points.');
      return;
    }
    setP({ ...p, points: [...p.points, { x: px, y: py }] });
    setMessage('Point added.');
  };
  const addForm = () => {
    const px = Number(x),
      py = Number(y);
    if (
      x.trim() === '' ||
      y.trim() === '' ||
      !Number.isFinite(px) ||
      !Number.isFinite(py) ||
      Math.abs(px) > 10 ||
      Math.abs(py) > 10
    ) {
      setMessage('Enter both coordinates between −10 and 10.');
      return;
    }
    add(px, py);
  };
  const domain: [number, number] = [
    Math.min(0, ...p.points.map((p) => p.x)),
    Math.max(8, ...p.points.map((p) => p.x)),
  ];
  const yd: [number, number] = [
    Math.min(0, ...p.points.map((p) => p.y)),
    Math.max(8, ...p.points.map((p) => p.y)),
  ];
  return (
    <>
      <div className="lab-equation">
        <MathView
          math={'\\hat y = ' + fmt(p.w, 2) + 'x ' + (p.b < 0 ? '− ' : '+ ') + fmt(Math.abs(p.b), 2)}
          inline
        />
        <span>live model</span>
      </div>
      <Plot
        title="Regression scatterplot. Observations are circles; the teal line is the model; dashed orange lines are residuals."
        xDomain={domain}
        yDomain={yd}
        onPoint={add}
      >
        {({ sx, sy }) => (
          <>
            {r.rows.map((row, i) => (
              <g key={i}>
                {squares && (
                  <rect
                    x={sx(row.x)}
                    y={Math.min(sy(row.y), sy(row.prediction))}
                    width={Math.abs(sy(row.y) - sy(row.prediction))}
                    height={Math.abs(sy(row.y) - sy(row.prediction))}
                    fill="var(--plot-error)"
                    opacity=".16"
                    stroke="var(--plot-error)"
                    strokeWidth=".7"
                  />
                )}
                {residuals && (
                  <line
                    x1={sx(row.x)}
                    x2={sx(row.x)}
                    y1={sy(row.y)}
                    y2={sy(row.prediction)}
                    stroke="var(--plot-error)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}
              </g>
            ))}
            <line
              x1={sx(domain[0])}
              x2={sx(domain[1])}
              y1={sy(p.w * domain[0] + p.b)}
              y2={sy(p.w * domain[1] + p.b)}
              stroke="var(--plot-prediction)"
              strokeWidth="2.5"
            />
            {r.rows.map((row, i) => (
              <circle
                key={i}
                cx={sx(row.x)}
                cy={sy(row.y)}
                r="4.5"
                fill="var(--plot-bg)"
                stroke="var(--plot-target)"
                strokeWidth="1.8"
              >
                <title>
                  {'Point ' +
                    (i + 1) +
                    ': x ' +
                    fmt(row.x) +
                    ', y ' +
                    fmt(row.y) +
                    ', residual ' +
                    fmt(row.residual)}
                </title>
              </circle>
            ))}
          </>
        )}
      </Plot>
      <div className="plot-legend">
        <span>
          <i className="dot" />
          Observed
        </span>
        <span>
          <i className="line teal" />
          Prediction
        </span>
        <span>
          <i className="line orange dashed" />
          Residual
        </span>
      </div>
      <p className="plot-hint">
        <Plus size={12} /> Click the plot to add a point, or use the fields below.
      </p>
      <div className="toggle-row">
        <label>
          <input
            type="checkbox"
            checked={residuals}
            onChange={(e) => setResiduals(e.target.checked)}
          />{' '}
          Residuals
        </label>
        <label>
          <input type="checkbox" checked={squares} onChange={(e) => setSquares(e.target.checked)} />{' '}
          Squared errors
        </label>
      </div>
      <div className="lab-controls">
        <NumberControl
          label="Slope · w"
          value={p.w}
          min={-2}
          max={3}
          onChange={(w) => setP({ ...p, w })}
        />
        <NumberControl
          label="Intercept · b"
          value={p.b}
          min={-3}
          max={5}
          onChange={(b) => setP({ ...p, b })}
        />
      </div>
      <div className="stats-row">
        <Stat label="Mean squared error" value={r.loss} />
        <Stat digits={0} label="Observations · n" value={p.points.length} />
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            if (
              !Number.isFinite(fit.w) ||
              !Number.isFinite(fit.b) ||
              Math.max(Math.abs(fit.w), Math.abs(fit.b)) > 1e6
            ) {
              setMessage(
                'The exact fit exceeds the parameter limit of one million. Spread or rescale the input values.',
              );
              return;
            }
            setP({ ...p, w: fit.w, b: fit.b });
            setMessage(
              fit.constant
                ? 'Constant inputs: choosing w = 0 and b = mean(y).'
                : 'Least-squares solution applied.',
            );
          }}
        >
          <WandSparkles size={14} /> Fit best line
        </button>
        <button
          onClick={() => {
            setP(defaults('linear-regression'));
            setMessage('Experiment reset.');
            setSquares(true);
            setResiduals(true);
            setX('4');
            setY('4');
            setResetVersion((version) => version + 1);
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      <RegressionChallenge key={resetVersion} p={p} setP={setP} />
      <Calculation>
        <MathView
          math={
            'J=\\frac{' +
            r.rows.map((q) => fmt(q.squared, 2)).join('+') +
            '}{' +
            p.points.length +
            '}=' +
            fmt(r.loss)
          }
        />
        <p>
          Using full-precision residuals internally. Squares are drawn in plot coordinates with
          equal side lengths on screen; shaded areas illustrate squared error.
        </p>
        <p>
          ∂J/∂w = {fmt(r.dw)} · ∂J/∂b = {fmt(r.db)}
        </p>
      </Calculation>
      <details className="data-details">
        <summary>
          Inspect the data <span>{p.points.length} points</span>
        </summary>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>Residual = prediction − target</caption>
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th>ŷ</th>
                <th>r</th>
                <th>r²</th>
                <th>
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((q, i) => (
                <tr key={i}>
                  <td>{fmt(q.x, 2)}</td>
                  <td>{fmt(q.y, 2)}</td>
                  <td>{fmt(q.prediction, 2)}</td>
                  <td>{fmt(q.residual, 2)}</td>
                  <td>{fmt(q.squared, 2)}</td>
                  <td>
                    <button
                      aria-label={'Remove point ' + (i + 1)}
                      disabled={p.points.length <= 1}
                      onClick={() => setP({ ...p, points: p.points.filter((_, j) => i !== j) })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small-note">
          Keep at least one point. Coordinates outside the initial view expand the axes.
        </p>
      </details>
      <div className="point-entry">
        <label>
          x
          <input
            aria-label="New point x"
            type="number"
            min="-10"
            max="10"
            step=".1"
            value={x}
            onChange={(e) => setX(e.target.value)}
          />
        </label>
        <label>
          y
          <input
            aria-label="New point y"
            type="number"
            min="-10"
            max="10"
            step=".1"
            value={y}
            onChange={(e) => setY(e.target.value)}
          />
        </label>
        <button onClick={addForm}>
          <Plus size={14} />
          Add point
        </button>
      </div>
      <button
        className="text-button"
        onClick={() => {
          setP({ ...p, points: REGRESSION_DATA.map((q) => ({ ...q })) });
          setMessage('Deterministic example dataset loaded.');
        }}
      >
        Load example dataset
      </button>
      <p className="feedback" role="status">
        {message}
      </p>
    </>
  );
}
