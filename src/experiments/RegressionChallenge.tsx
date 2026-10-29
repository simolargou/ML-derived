import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { REGRESSION_DATA, regression } from '../math/engines';
import type { ExperimentProps } from './types';
import { fmt } from '../components/ui';

export function RegressionChallenge({ p, setP }: ExperimentProps) {
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState('');
  const sameData =
    p.points.length === REGRESSION_DATA.length &&
    p.points.every(
      (point, index) =>
        point.x === REGRESSION_DATA[index].x && point.y === REGRESSION_DATA[index].y,
    );
  const loss = regression(p.points, p.w, p.b).loss;
  // Completion records a real achievement, independently of later parameter exploration.
  useEffect(() => {
    if (active && sameData && loss <= 0.3 && !completed) {
      setCompleted(true);
      setNotice('Target reached on the example dataset. You can keep exploring or restart.');
    }
  }, [active, sameData, loss, completed]);
  const start = () => {
    setP({ ...p, w: 0, b: 0, points: REGRESSION_DATA.map((point) => ({ ...point })) });
    setActive(true);
    setCompleted(false);
    setNotice('Challenge started from w = 0 and b = 0.');
  };
  return (
    <details className="challenge" data-complete={completed}>
      <summary>
        {completed && <Check size={14} aria-hidden="true" />} Optional: fit the line
      </summary>
      <p>
        Can you reach MSE ≤ 0.30? Starting loads the eight example points and sets slope and
        intercept to zero. Change the sliders, or use Fit best line to reveal a solution.
      </p>
      {active && (
        <p className="challenge-result">
          {completed ? 'Completed. ' : ''}Current MSE: {fmt(loss)}. Target: ≤ 0.300.
          {!sameData && ' The dataset changed. Restart to assess the original challenge.'}
        </p>
      )}
      <div className="button-row">
        <button onClick={start}>{active ? 'Restart challenge' : 'Start challenge'}</button>
        {active && (
          <button
            onClick={() => {
              setActive(false);
              setCompleted(false);
              setNotice('Challenge ended. Your current experiment is unchanged.');
            }}
          >
            Leave challenge
          </button>
        )}
      </div>
      <p role="status">{notice}</p>
    </details>
  );
}
