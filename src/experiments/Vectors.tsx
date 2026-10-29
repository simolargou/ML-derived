import { DraggableVector } from '../visualizations/DraggableVector';
import { RotateCcw } from 'lucide-react';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { dot, norm, angleBetween } from '../math/engines';
import type { Vec2 } from '../math/engines';
import { NumberControl, Stat, Calculation, MathView, fmt } from '../components/ui';
import { Plot } from '../visualizations/Plot';
export default function Vectors({ p, setP }: ExperimentProps) {
  const x: Vec2 = [p.x1, p.x2],
    w: Vec2 = [p.w, p.w2],
    product = dot(x, w),
    angle = angleBetween(x, w);
  const extent = Math.max(5.5, ...x.map((v) => Math.abs(v) + 1), ...w.map((v) => Math.abs(v) + 1));
  return (
    <>
      <div className="lab-equation">
        <MathView inline math={'\\hat y=' + fmt(product + p.b, 2)} />
        <span>prediction</span>
      </div>
      <Plot
        interactive
        equalAspect
        title="Feature vector x is solid teal; weight vector w is dashed orange. Both start at the origin."
        xDomain={[-extent, extent]}
        yDomain={[-extent, extent]}
      >
        {(plot) => {
          const { sx, sy } = plot;
          return (
            <>
              {[
                { v: x, color: 'var(--plot-prediction)', name: 'x', dash: '' },
                { v: w, color: 'var(--plot-error)', name: 'w', dash: '5 3' },
              ].map(({ v, color, name, dash }) => (
                <g key={name}>
                  <line
                    x1={sx(0)}
                    y1={sy(0)}
                    x2={sx(v[0])}
                    y2={sy(v[1])}
                    stroke={color}
                    strokeWidth="2.5"
                    strokeDasharray={dash}
                  />
                  <DraggableVector
                    x={v[0]}
                    y={v[1]}
                    name={name as 'x' | 'w'}
                    color={color}
                    plot={plot}
                    onMove={(a, b) =>
                      setP(name === 'x' ? { ...p, x1: a, x2: b } : { ...p, w: a, w2: b })
                    }
                  />
                  <text
                    x={sx(v[0]) + 8}
                    y={sy(v[1]) + (name === 'w' ? 18 : -12)}
                    style={{ fill: color, fontSize: 13 }}
                  >
                    {name}
                  </text>
                </g>
              ))}
            </>
          );
        }}
      </Plot>
      <div className="plot-legend">
        <span>
          <i className="line teal" />
          Feature x
        </span>
        <span>
          <i className="line orange dashed" />
          Weights w
        </span>
      </div>
      <p className="vector-instructions" id="vector-instructions">
        Drag the circle (features) or diamond (weights). Use the sliders, or focus an endpoint and
        use arrow keys. Hold Shift for larger steps; Home makes a zero vector.
      </p>
      <div className="lab-controls">
        <NumberControl
          label="Feature · x₁"
          min={-5}
          max={5}
          value={p.x1}
          onChange={(x1) => setP({ ...p, x1 })}
        />
        <NumberControl
          label="Feature · x₂"
          min={-5}
          max={5}
          value={p.x2}
          onChange={(x2) => setP({ ...p, x2 })}
        />
        <NumberControl
          label="Weight · w₁"
          min={-5}
          max={5}
          value={p.w}
          onChange={(w) => setP({ ...p, w })}
        />
        <NumberControl
          label="Weight · w₂"
          min={-5}
          max={5}
          value={p.w2}
          onChange={(w2) => setP({ ...p, w2 })}
        />
      </div>
      <NumberControl
        label="Bias · b"
        min={-5}
        max={5}
        value={p.b}
        onChange={(b) => setP({ ...p, b })}
      />
      <div className="stats-row">
        <Stat label="Dot product · wᵀx" value={product} />
        <Stat label="Angle between vectors" value={angle} unit={angle === null ? '' : '°'} />
      </div>
      {angle === null && (
        <p className="small-note">
          A zero vector has no direction. Its dot product is zero and its angle is undefined.
        </p>
      )}
      <table>
        <caption>Each contribution, before the bias</caption>
        <thead>
          <tr>
            <th>j</th>
            <th>wⱼ</th>
            <th>xⱼ</th>
            <th>wⱼxⱼ</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1].map((j) => (
            <tr key={j}>
              <td>{j + 1}</td>
              <td>{fmt(w[j], 2)}</td>
              <td>{fmt(x[j], 2)}</td>
              <td>{fmt(w[j] * x[j], 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Calculation>
        <p>
          ‖x‖ = {fmt(norm(x))}; ‖w‖ = {fmt(norm(w))}
        </p>
        <MathView
          math={
            '\\hat y=(' +
            fmt(w[0], 2) +
            ')(' +
            fmt(x[0], 2) +
            ')+(' +
            fmt(w[1], 2) +
            ')(' +
            fmt(x[1], 2) +
            ')+(' +
            fmt(p.b, 2) +
            ')=' +
            fmt(product + p.b)
          }
        />
        <p>
          Scale one vector to change magnitude. Reverse its direction to reverse the sign of the dot
          product. Bias changes the prediction but not the angle.
        </p>
      </Calculation>
      <div className="button-row lab-spaced">
        <button onClick={() => setP(defaults('vectors'))}>
          <RotateCcw size={14} />
          Reset
        </button>
        <button onClick={() => setP({ ...p, x1: 0, x2: 0 })}>Try a zero vector</button>
      </div>
    </>
  );
}
