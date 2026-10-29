import { useEffect, useState } from 'react';
import type { ExperimentProps } from './types';
import { defaults } from '../math/parameters';
import { regression, regressionStep, regressionGeometry } from '../math/engines';
export type GradientEntry = { w: number; b: number; loss: number };
export function useGradientDescent({ p, setP }: ExperimentProps) {
  const [running, setRunning] = useState(false),
    [path, setPath] = useState<GradientEntry[]>(() => [
      { w: p.w, b: p.b, loss: regression(p.points, p.w, p.b).loss },
    ]),
    [status, setStatus] = useState('Ready. One step updates both parameters together.');
  const [last, setLast] = useState<{
    w: number;
    b: number;
    dw: number;
    db: number;
    alpha: number;
  } | null>(null);
  const r = regression(p.points, p.w, p.b);
  const boundary = regressionGeometry(p.points).rateBoundary;
  const step = () => {
    if (path.length > 250) {
      setRunning(false);
      setStatus('Stopped at the 250-step teaching limit. Reset to start a new run.');
      return;
    }
    const next = regressionStep(p.points, p.w, p.b, p.alpha);
    if (!next.safe) {
      setRunning(false);
      setStatus(
        'Divergence safety stop: the next loss or parameter is non-finite or reaches the 10¹² safety limit. The last valid parameters are retained. Reduce the learning rate and reset.',
      );
      return;
    }
    setLast({ w: p.w, b: p.b, dw: r.dw, db: r.db, alpha: p.alpha });
    setP({ ...p, w: next.w, b: next.b });
    setPath((old) => [...old, { w: next.w, b: next.b, loss: next.loss }]);
    if (Math.hypot(next.dw, next.db) < 1e-6) {
      setRunning(false);
      setStatus('Stopped: gradient norm below 10⁻⁶ on this dataset.');
    } else
      setStatus(
        next.loss > r.loss
          ? 'Loss increased on this step. Watch for overshooting or divergence.'
          : 'Loss decreased. The gradient will be recomputed for the next step.',
      );
  };
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(step, 120);
    return () => clearTimeout(timer);
  }, [running, step]);
  const reset = (alpha = p.alpha) => {
    setRunning(false);
    const start = defaults('gradient-descent');
    setP({ ...p, w: start.w, b: start.b, alpha });
    setPath([{ w: start.w, b: start.b, loss: regression(p.points, start.w, start.b).loss }]);
    setLast(null);
    setStatus('Reset to reproducible starting parameters.');
  };

  return { running, setRunning, path, status, last, r, boundary, step, reset };
}
