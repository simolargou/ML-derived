import { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { neural, neuralStep, NET_NAMES, XOR } from '../math/engines';
import { Trace } from '../visualizations/Plot';
import { NumberControl, Stat, Calculation, fmt } from '../components/ui';
export default function Neural({ p, setP }: ExperimentProps) {
  const result = neural(p.params),
    sample = result.rows[p.sample];
  const [iterations, setIterations] = useState(0),
    [remaining, setRemaining] = useState(0),
    [history, setHistory] = useState(() => [result.loss]),
    [status, setStatus] = useState('Inspect a sample, then update using all four observations.');
  const tick = (count = 1) => {
    let params = [...p.params];
    let stopped = false;
    const losses: number[] = [];
    for (let j = 0; j < count; j++) {
      const next = neuralStep(params, p.alpha);
      if (
        !next.params.every((v) => Number.isFinite(v) && Math.abs(v) <= 100) ||
        !Number.isFinite(next.result.loss)
      ) {
        stopped = true;
        setRemaining(0);
        setStatus(
          'Stopped: a non-finite value or parameter beyond the safety limit of 100 was detected. Last valid values retained.',
        );
        break;
      }
      params = next.params;
      losses.push(next.result.loss);
    }
    setP({ ...p, params });
    setHistory((old) => [...old, ...losses].slice(-2001));
    setIterations((i) => i + losses.length);
    setRemaining((old) => Math.max(0, old - losses.length));
    if (losses.length && !stopped)
      setStatus('Updated all nine parameters with the mean gradient of all four XOR samples.');
  };
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => tick(Math.min(20, remaining)), 30);
    return () => clearTimeout(timer);
  });
  const reset = () => {
    setRemaining(0);
    setP(defaults('neural-network'));
    setIterations(0);
    setHistory([neural(defaults('neural-network').params).loss]);
    setStatus('Reset to the nine reproducible initial parameters.');
  };
  const nodes = [
    { x: 45, y: 85, label: 'x₁', value: sample.x },
    { x: 45, y: 190, label: 'x₂', value: sample.y },
    { x: 205, y: 85, label: 'h₁', value: sample.h[0] },
    { x: 205, y: 190, label: 'h₂', value: sample.h[1] },
    { x: 365, y: 137, label: 'p', value: sample.p },
  ];
  return (
    <>
      <label className="select-control">
        Inspect one XOR observation
        <select
          aria-label="XOR observation"
          value={p.sample}
          onChange={(e) => setP({ ...p, sample: Number(e.target.value) })}
        >
          {XOR.map((r, i) => (
            <option key={i} value={i}>
              [{r.x}, {r.y}] → y = {r.label}
            </option>
          ))}
        </select>
      </label>
      <svg
        className="network"
        viewBox="0 0 410 265"
        role="img"
        aria-label="Two input values feed two tanh hidden units and one sigmoid output. Edge labels show actual weights."
      >
        <title>Actual forward-pass values for the selected XOR sample</title>
        {[
          [0, 2, 0],
          [1, 2, 1],
          [0, 3, 2],
          [1, 3, 3],
          [2, 4, 6],
          [3, 4, 7],
        ].map(([from, to, j]) => (
          <g key={j}>
            <line
              x1={nodes[from].x + 22}
              y1={nodes[from].y}
              x2={nodes[to].x - 23}
              y2={nodes[to].y}
              stroke={p.params[j] >= 0 ? 'var(--plot-prediction)' : 'var(--plot-error)'}
              strokeWidth={Math.min(3.5, 1 + Math.abs(p.params[j]) * 0.2)}
              strokeDasharray={p.params[j] < 0 ? '4 3' : ''}
            />
            <rect
              x={(nodes[from].x + nodes[to].x) / 2 - 18}
              y={
                (nodes[from].y + nodes[to].y) / 2 + (j === 1 || j === 2 ? (j === 1 ? -23 : 13) : -7)
              }
              width="38"
              height="16"
              fill="var(--surface)"
            />
            <text
              x={(nodes[from].x + nodes[to].x) / 2}
              y={
                (nodes[from].y + nodes[to].y) / 2 + (j === 1 || j === 2 ? (j === 1 ? -11 : 25) : 5)
              }
              textAnchor="middle"
            >
              {fmt(p.params[j], 2)}
            </text>
          </g>
        ))}
        {nodes.map((n) => (
          <g key={n.label}>
            <circle
              cx={n.x}
              cy={n.y}
              r="23"
              fill={n.label === 'p' ? 'var(--accent-wash)' : 'var(--plot-node)'}
              stroke="var(--plot-contour)"
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="node-label">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 43} textAnchor="middle" className="node-value">
              {fmt(n.value)}
            </text>
          </g>
        ))}
        <text x="45" y="24" textAnchor="middle">
          INPUT
        </text>
        <text x="205" y="24" textAnchor="middle">
          TANH HIDDEN
        </text>
        <text x="365" y="24" textAnchor="middle">
          SIGMOID
        </text>
        <text x="205" y="254" textAnchor="middle">
          b = [{fmt(p.params[4], 2)}, {fmt(p.params[5], 2)}]
        </text>
        <text x="365" y="254" textAnchor="middle">
          c = {fmt(p.params[8], 2)}
        </text>
      </svg>
      <p className="small-note">
        Solid edges are nonnegative; dashed edges are negative. Labels are actual weights, rounded
        for display.
      </p>
      <div className="stats-row">
        <Stat label="Full-dataset mean loss" value={result.loss} />
        <Stat digits={0} label="Training steps" value={iterations} />
      </div>
      <NumberControl
        label="Learning rate · α"
        min={0.01}
        max={2}
        step={0.01}
        value={p.alpha}
        onChange={(alpha) => {
          setRemaining(0);
          setP({ ...p, alpha });
        }}
      />
      <div className="button-row lab-spaced">
        <button className="primary" disabled={remaining > 0} onClick={() => tick()}>
          <SkipForward size={14} />
          One step
        </button>
        <button
          onClick={() => {
            if (remaining > 0) {
              setRemaining(0);
              setStatus('Training paused.');
            } else {
              setRemaining(1000);
              setStatus('Running a bounded session of 1,000 full-dataset steps.');
            }
          }}
        >
          {remaining > 0 ? <Pause size={14} /> : <Play size={14} />}{' '}
          {remaining > 0 ? 'Pause' : 'Train 1,000'}
        </button>
        <button onClick={reset}>
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
      <p className="feedback" role={remaining > 0 ? undefined : 'status'}>
        {remaining > 0 ? remaining + ' steps remaining. ' : ''}
        {status}
      </p>
      <Trace
        values={history}
        startIndex={Math.max(0, iterations - history.length + 1)}
        label="Full-dataset loss (latest 2,000 steps)"
      />
      <details className="data-details">
        <summary>Inspect or edit all nine parameters</summary>
        <p className="small-note">
          Edits pause training and restart the loss trace. The table shows mean gradients over all
          four samples, evaluated at the current parameters.
        </p>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>Trainable parameters and full-dataset gradients</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>∂J / ∂θⱼ</th>
              </tr>
            </thead>
            <tbody>
              {NET_NAMES.map((name, j) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>
                    <input
                      className="weight-input"
                      aria-label={'Parameter ' + name}
                      type="number"
                      step=".05"
                      min="-100"
                      max="100"
                      value={Number(p.params[j].toFixed(6))}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;
                        if (!Number.isFinite(value) || Math.abs(value) > 100) {
                          setStatus('Parameter must be a finite number between −100 and 100.');
                          return;
                        }
                        const params = p.params.map((v, k) => (k === j ? value : v));
                        setRemaining(0);
                        setP({ ...p, params });
                        setIterations(0);
                        setHistory([neural(params).loss]);
                      }}
                    />
                  </td>
                  <td>{fmt(result.gradient[j], 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <Calculation>
        <p>
          <strong>
            Selected sample only: [{sample.x}, {sample.y}], y = {sample.label}
          </strong>
        </p>
        <p>
          a = [{sample.a.map((v) => fmt(v, 5)).join(', ')}]<br />h = tanh(a) = [
          {sample.h.map((v) => fmt(v, 5)).join(', ')}]<br />z = {fmt(sample.z, 5)}; p ={' '}
          {fmt(sample.p, 5)}
        </p>
        <p>
          Local sigmoid derivative p(1 − p) = {fmt(sample.p * (1 - sample.p), 6)}
          <br />
          Combined output derivative δ = p − y = {fmt(sample.dz, 6)}
          <br />
          Local tanh derivatives 1 − h² = [{sample.dh.map((v) => fmt(v, 6)).join(', ')}]<br />
          Hidden derivatives g = [{sample.da.map((v) => fmt(v, 6)).join(', ')}]
        </p>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>One-sample vs. full-dataset gradients</caption>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>∂ℓ / ∂θⱼ</th>
                <th>∂J / ∂θⱼ</th>
              </tr>
            </thead>
            <tbody>
              {NET_NAMES.map((name, j) => (
                <tr key={j}>
                  <th>{name}</th>
                  <td>{fmt(sample.gradient[j], 6)}</td>
                  <td>{fmt(result.gradient[j], 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Every update uses the right-hand mean-gradient column, computed before any parameter
          changes.
        </p>
      </Calculation>
      <div className="table-scroll" tabIndex={0}>
        <table>
          <caption>All XOR predictions at the current weights</caption>
          <thead>
            <tr>
              <th>x₁</th>
              <th>x₂</th>
              <th>y</th>
              <th>p</th>
              <th>p ≥ 0.5</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r, i) => (
              <tr key={i}>
                <td>{r.x}</td>
                <td>{r.y}</td>
                <td>{r.label}</td>
                <td>{fmt(r.p)}</td>
                <td>{Number(r.p >= 0.5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
