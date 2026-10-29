import { useState } from 'react';
import { SkipForward, RotateCcw } from 'lucide-react';
import type { ExperimentProps } from './types';
import {
  CLUSTERS,
  initialCentroids,
  assign,
  objective,
  updateCentroids,
  distance2,
} from '../math/engines';
import type { Point } from '../math/engines';
import { Plot, Trace } from '../visualizations/Plot';
import { Stat, Calculation, fmt } from '../components/ui';
const colors = [
  'var(--cluster-1)',
  'var(--cluster-2)',
  'var(--cluster-3)',
  'var(--cluster-4)',
  'var(--cluster-5)',
];
export default function KMeans({ p, setP }: ExperimentProps) {
  const [centroids, setCentroids] = useState(() => initialCentroids(CLUSTERS, p.k, p.seed));
  const [labels, setLabels] = useState(() => assign(CLUSTERS, centroids));
  const [phase, setPhase] = useState<'assign' | 'update'>('assign'),
    [stepCount, setStepCount] = useState(0),
    [done, setDone] = useState(false),
    [empty, setEmpty] = useState<number[]>([]),
    [comparisons, setComparisons] = useState<{ seed: number; loss: number; iterations: number }[]>(
      [],
    );
  const [history, setHistory] = useState(() => [objective(CLUSTERS, centroids, labels)]),
    [status, setStatus] = useState('First, assign every point to the nearest initial center.');
  const loss = objective(CLUSTERS, centroids, labels);
  const reset = (k = p.k, seed = p.seed) => {
    const c = initialCentroids(CLUSTERS, k, seed),
      l = assign(CLUSTERS, c);
    setP({ ...p, k, seed });
    setCentroids(c);
    setLabels(l);
    setPhase('assign');
    setStepCount(0);
    setDone(false);
    setEmpty([]);
    setHistory([objective(CLUSTERS, c, l)]);
    setComparisons([]);
    setStatus('Initialization restored. Next phase: assignment.');
  };
  const step = () => {
    let nextC = centroids,
      nextL = labels;
    if (phase === 'assign') {
      nextL = assign(CLUSTERS, centroids);
      setLabels(nextL);
      setPhase('update');
      setStatus('Assigned each point to the nearest centroid. Next: move centers to their means.');
    } else {
      const update = updateCentroids(CLUSTERS, centroids, labels);
      nextC = update.centroids;
      setEmpty(update.empty);
      setCentroids(nextC);
      const converged = nextC.every((c, j) => distance2(c, centroids[j]) < 1e-12);
      setDone(converged);
      setPhase('assign');
      setStatus(
        converged
          ? 'Converged for this initialization: assignments and centroids are stable.'
          : update.empty.length
            ? 'Empty cluster detected; its previous centroid was retained.'
            : 'Centroids moved to cluster means. Next: reassign points.',
      );
    }
    setStepCount(stepCount + 1);
    setHistory((old) => [...old, objective(CLUSTERS, nextC, nextL)]);
  };
  const compare = () => {
    const results = [0, 4, 9].map((seed) => {
      let c: Point[] = initialCentroids(CLUSTERS, p.k, seed),
        iterations = 0;
      for (; iterations < 50; iterations++) {
        const l = assign(CLUSTERS, c),
          next = updateCentroids(CLUSTERS, c, l).centroids;
        if (next.every((v, j) => distance2(v, c[j]) < 1e-12)) {
          c = next;
          iterations++;
          break;
        }
        c = next;
      }
      return { seed, loss: objective(CLUSTERS, c, assign(CLUSTERS, c)), iterations };
    });
    setComparisons(results);
  };
  return (
    <>
      <div className="lab-equation">
        <span>Next: {phase === 'assign' ? 'assign points' : 'update centroids'}</span>
        <span>{stepCount} phases</span>
      </div>
      <Plot
        equalAspect
        title="K-means point cloud. Numbers label cluster membership; large crosses show numbered centroids."
        xDomain={[-3.5, 3.5]}
        yDomain={[-3.5, 3.5]}
      >
        {({ sx, sy }) => (
          <>
            {CLUSTERS.map((q, i) => (
              <g key={i}>
                {stepCount > 0 && (
                  <line
                    x1={sx(q.x)}
                    y1={sy(q.y)}
                    x2={sx(centroids[labels[i]].x)}
                    y2={sy(centroids[labels[i]].y)}
                    stroke={colors[labels[i]]}
                    strokeWidth=".7"
                    opacity=".3"
                  />
                )}
                <circle
                  cx={sx(q.x)}
                  cy={sy(q.y)}
                  r="5"
                  fill={stepCount ? colors[labels[i]] : 'var(--plot-text)'}
                  stroke="var(--plot-bg)"
                  strokeWidth="1"
                />
                {stepCount > 0 && (
                  <text
                    x={sx(q.x) + 7}
                    y={sy(q.y) - 5}
                    style={{ fill: colors[labels[i]], fontSize: 9 }}
                  >
                    {labels[i] + 1}
                  </text>
                )}
              </g>
            ))}
            {centroids.map((q, j) => (
              <g key={j}>
                <path
                  d={'M' + (sx(q.x) - 7) + ',' + (sy(q.y) - 7) + 'l14 14m0 -14l-14 14'}
                  stroke="var(--plot-bg)"
                  strokeWidth="5"
                />
                <path
                  d={'M' + (sx(q.x) - 6) + ',' + (sy(q.y) - 6) + 'l12 12m0 -12l-12 12'}
                  stroke={colors[j]}
                  strokeWidth="2.5"
                />
                <text x={sx(q.x) + 9} y={sy(q.y) + 15} style={{ fill: colors[j], fontSize: 11 }}>
                  {'μ' + (j + 1)}
                </text>
              </g>
            ))}
          </>
        )}
      </Plot>
      <div className="plot-legend">
        <span>● Observation</span>
        <span>× Centroid</span>
        <span>Number = cluster</span>
      </div>
      <div className="lab-controls">
        <label className="select-control">
          Clusters · k
          <select
            aria-label="Number of clusters"
            value={p.k}
            onChange={(e) => reset(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="select-control">
          Initialization
          <select
            aria-label="Initialization"
            value={p.seed}
            onChange={(e) => reset(p.k, Number(e.target.value))}
          >
            {Array.from(new Set([0, 4, 9, p.seed])).map((seed) => (
              <option key={seed} value={seed}>
                Start index {seed}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="stats-row">
        <Stat label="Within-cluster sum · J" value={loss} />
        <Stat digits={0} label="Occupied clusters" value={new Set(labels).size} />
      </div>
      <div className="button-row">
        <button className="primary" disabled={done} onClick={step}>
          <SkipForward size={14} />
          {phase === 'assign' ? 'Assign points' : 'Update centroids'}
        </button>
        <button onClick={() => reset()}>
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
      <p className="feedback" role="status">
        {status}
      </p>
      {empty.length > 0 && (
        <p className="small-note">
          Empty clusters: {empty.map((j) => j + 1).join(', ')}. Previous centroids retained.
        </p>
      )}
      <Trace values={history} label="Objective after each phase" />
      <Calculation>
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>
              Current centers and assigned members{' '}
              {stepCount === 0 ? '(nearest-center preview)' : ''}
            </caption>
            <thead>
              <tr>
                <th>Cluster</th>
                <th>μ₁</th>
                <th>μ₂</th>
                <th>Members</th>
                <th>J contribution</th>
              </tr>
            </thead>
            <tbody>
              {centroids.map((c, j) => (
                <tr key={j}>
                  <td>{j + 1}</td>
                  <td>{fmt(c.x, 2)}</td>
                  <td>{fmt(c.y, 2)}</td>
                  <td>{labels.filter((l) => l === j).length}</td>
                  <td>
                    {fmt(
                      CLUSTERS.reduce((s, q, i) => s + (labels[i] === j ? distance2(q, c) : 0), 0),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          For point 1 [{CLUSTERS[0].x}, {CLUSTERS[0].y}], squared distances to each centroid are{' '}
          {centroids.map((c) => fmt(distance2(CLUSTERS[0], c))).join(', ')}. Their minimum chooses
          cluster {assign([CLUSTERS[0]], centroids)[0] + 1}. Ties choose the lowest index.
        </p>
      </Calculation>
      <button className="text-button lab-spaced" onClick={compare}>
        Compare three deterministic initializations
      </button>
      {comparisons.length > 0 && (
        <div className="table-scroll" tabIndex={0}>
          <table>
            <caption>Same data and k; each run bounded at 50 iterations</caption>
            <thead>
              <tr>
                <th>Start index</th>
                <th>Final J</th>
                <th>Iterations</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((r) => (
                <tr key={r.seed}>
                  <td>{r.seed}</td>
                  <td>{fmt(r.loss)}</td>
                  <td>{r.iterations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
