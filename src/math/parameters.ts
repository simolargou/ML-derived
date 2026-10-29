import { REGRESSION_DATA, CLOUD, INITIAL_NET } from './engines';
import type { Point } from './engines';
export const LESSON_IDS = [
  'vectors',
  'linear-regression',
  'gradient-descent',
  'logistic-regression',
  'pca',
  'k-means',
  'neural-network',
] as const;
export type LessonId = (typeof LESSON_IDS)[number];
export type Params = {
  w: number;
  b: number;
  w2: number;
  x1: number;
  x2: number;
  alpha: number;
  threshold: number;
  angle: number;
  standardize: boolean;
  reveal: boolean;
  k: number;
  seed: number;
  sample: number;
  params: number[];
  points: Point[];
};
export function defaults(id: LessonId): Params {
  return {
    w: id === 'vectors' ? 2 : id === 'logistic-regression' ? 1 : 0.8,
    b: id === 'linear-regression' ? 1.4 : 0,
    w2: 1,
    x1: 2,
    x2: 1,
    alpha: id === 'neural-network' ? 0.5 : id === 'logistic-regression' ? 0.2 : 0.02,
    threshold: 0.5,
    angle: 0,
    standardize: false,
    reveal: false,
    k: 3,
    seed: 0,
    sample: 1,
    params: [...INITIAL_NET],
    points: (id === 'pca' ? CLOUD : REGRESSION_DATA).map((p) => ({ ...p })),
  };
}
const ranges: Record<string, [number, number, boolean?]> = {
  w: [-10, 10],
  b: [-10, 10],
  w2: [-10, 10],
  x1: [-5, 5],
  x2: [-5, 5],
  alpha: [0.0001, 2],
  threshold: [0, 1],
  angle: [-180, 180],
  k: [1, 5, true],
  seed: [0, 100, true],
  sample: [0, 3, true],
};
export function validateParams(id: LessonId, value: unknown): { params: Params; invalid: boolean } {
  const result = defaults(id);
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { params: result, invalid: true };
  let invalid = false;
  const input = value as Record<string, unknown>;
  for (const key of Object.keys(input)) {
    const v = input[key];
    if (Object.hasOwn(ranges, key)) {
      let [lo, hi, integer] = ranges[key];
      if (
        (id === 'linear-regression' || id === 'gradient-descent') &&
        (key === 'w' || key === 'b')
      ) {
        lo = -1e6;
        hi = 1e6;
      }
      if (
        typeof v === 'number' &&
        Number.isFinite(v) &&
        v >= lo &&
        v <= hi &&
        (!integer || Number.isInteger(v))
      )
        (result as unknown as Record<string, unknown>)[key] = v;
      else invalid = true;
    } else if (key === 'standardize' || key === 'reveal') {
      if (typeof v === 'boolean') result[key] = v;
      else invalid = true;
    } else if (key === 'params') {
      if (
        Array.isArray(v) &&
        v.length === 9 &&
        v.every((n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 100)
      )
        result.params = [...v];
      else invalid = true;
    } else if (key === 'points') {
      const min = id === 'pca' ? 2 : 1;
      if (
        Array.isArray(v) &&
        v.length >= min &&
        v.length <= 40 &&
        v.every(
          (p) =>
            p &&
            typeof p === 'object' &&
            typeof p.x === 'number' &&
            typeof p.y === 'number' &&
            Number.isFinite(p.x) &&
            Number.isFinite(p.y) &&
            Math.abs(p.x) <= 10 &&
            Math.abs(p.y) <= 10,
        )
      )
        result.points = v.map((p) => ({ x: p.x, y: p.y }));
      else invalid = true;
    } else invalid = true;
  }
  return { params: result, invalid };
}
export function readLocation(search: string) {
  const query = new URLSearchParams(search),
    rawId = query.get('lesson');
  const id = LESSON_IDS.includes(rawId as LessonId) ? (rawId as LessonId) : 'linear-regression';
  let params = defaults(id),
    invalid = !!rawId && id !== rawId;
  if (query.has('experiment'))
    try {
      const raw = query.get('experiment')!;
      if (raw.length > 12000) throw new Error('Too long');
      const v = validateParams(id, JSON.parse(raw));
      params = v.params;
      invalid = invalid || v.invalid;
    } catch {
      invalid = true;
    }
  return { id, params, invalid };
}
const sharedKeys: Record<LessonId, (keyof Params)[]> = {
  vectors: ['x1', 'x2', 'w', 'w2', 'b'],
  'linear-regression': ['w', 'b', 'points'],
  'gradient-descent': ['w', 'b', 'alpha', 'points'],
  'logistic-regression': ['w', 'w2', 'b', 'alpha', 'threshold'],
  pca: ['points', 'angle', 'standardize', 'reveal'],
  'k-means': ['k', 'seed'],
  'neural-network': ['params', 'alpha', 'sample'],
};
export function experimentUrl(id: LessonId, params: Params, href = window.location.href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('lesson', id);
  const shared = Object.fromEntries(sharedKeys[id].map((key) => [key, params[key]]));
  url.searchParams.set('experiment', JSON.stringify(shared));
  return url.toString();
}
