import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import type { ExperimentProps } from './types';
import { regression, leastSquares } from '../math/engines';
import { GradientLandscape } from '../visualizations/GradientLandscape';
import { Trace } from '../visualizations/Plot';
import { NumberControl, Stat, Calculation, fmt, MathView } from '../components/ui';
import { useGradientDescent } from './useGradientDescent';

export default function Gradient(props: ExperimentProps) {
  const { p, setP } = props;
  const { running, setRunning, path, status, last, r, boundary, step, reset } =
    useGradientDescent(props);
  const fit = leastSquares(p.points);
  const outside = path.some((t) => t.w < -1 || t.w > 3 || t.b < -2 || t.b > 4);
  const state = status.startsWith('Divergence')
    ? 'Stopped'
    : running
      ? 'Running'
      : path.length === 1
        ? 'Ready'
        : status.startsWith('Stopped')
          ? 'Stopped'
          : 'Paused';

  return (
    <div className="gradient-experiment">
      <div className="lab-equation">
        <MathView inline math={'\\theta=(' + fmt(p.w, 3) + ',\\ ' + fmt(p.b, 3) + ')'} />
        <span>iteration {path.length - 1}</span>
      </div>
      <GradientLandscape points={p.points} w={p.w} b={p.b} path={path} />
      <div className="plot-legend">
        <span>
          <i className="line blue" /> Equal-loss contour
        </span>
        <span>
          <i className="line orange" /> Update path
        </span>
        <span>
          <i className="dot" /> Current pair · + least squares
        </span>
      </div>
      <div className="gradient-controls">
        <NumberControl
          label="Learning rate · α"
          parameter="alpha"
          min={0.001}
          max={0.2}
          step={0.001}
          value={p.alpha}
          onChange={(alpha) => {
            setRunning(false);
            setP({ ...p, alpha });
          }}
        />
        <div className="button-row">
          <button className="primary" onClick={() => setRunning(!running)}>
            {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Run'}
          </button>
          <button disabled={running} onClick={step}>
            <SkipForward size={14} /> Step
          </button>
          <button onClick={() => reset()}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      <div className="optimization-results">
        <div className="stats-row">
          <Stat label="Iteration" value={path.length - 1} digits={0} />
          <Stat label="MSE · J" value={r.loss} />
          <div className="stat training-state">
            <span>Status</span>
            <strong>{state}</strong>
          </div>
        </div>
        <Trace values={path.map((q) => q.loss)} label="Loss history" logarithmic />
      </div>
      <p className="feedback" role={running ? undefined : 'status'}>
        {status}
      </p>
      <div className="preset-row">
        <span>Try a rate</span>
        <button onClick={() => reset(boundary * 0.3)}>Converge</button>
        <button onClick={() => reset(boundary * 0.98)}>Oscillate</button>
        <button onClick={() => reset(boundary * 1.3)}>Diverge</button>
      </div>
      {outside && (
        <p className="small-note">
          The path has left this fixed contour window. The parameter and loss values remain
          unmodified.
        </p>
      )}
      <Calculation>
        <p>
          Gradient norm: {fmt(Math.hypot(r.dw, r.db))}. Contours show J* + Δ, with Δ ranging from
          0.02 to 65. Hover a contour for its MSE. J* ={' '}
          {fmt(regression(p.points, fit.w, fit.b).loss)}.
        </p>
        {last ? (
          <>
            <p>Most recent update, using the old parameters and α = {fmt(last.alpha, 5)}:</p>
            <MathView
              math={
                'w_{new}=' +
                fmt(last.w) +
                '-(' +
                fmt(last.alpha, 5) +
                ')(' +
                fmt(last.dw) +
                ')=' +
                fmt(p.w)
              }
            />
            <MathView
              math={
                'b_{new}=' +
                fmt(last.b) +
                '-(' +
                fmt(last.alpha, 5) +
                ')(' +
                fmt(last.db) +
                ')=' +
                fmt(p.b)
              }
            />
          </>
        ) : (
          <p>
            At the current pair, ∂J/∂w = {fmt(r.dw)} and ∂J/∂b = {fmt(r.db)}. Press Step to inspect
            the first update.
          </p>
        )}
        <p>
          For this dataset, the strict constant-rate stability range is 0 &lt; α &lt;{' '}
          {fmt(boundary, 5)}. “Oscillate” uses 98% of this boundary; “Diverge” uses 130%.
        </p>
        <p>
          The history plots log₁₀(1 + loss), keeping zero loss finite. The MSE readout above always
          shows the untransformed loss.
        </p>
      </Calculation>
    </div>
  );
}
