import { useId } from 'react';
import type { ReactNode, MouseEvent } from 'react';
export type PlotContext = {
  sx: (x: number) => number;
  sy: (y: number) => number;
  pointAt: (element: SVGElement, clientX: number, clientY: number) => { x: number; y: number };
};
export function Plot({
  title,
  children,
  xDomain = [0, 8],
  yDomain = [0, 8],
  onPoint,
  xLabel = 'x',
  yLabel = 'y',
  equalAspect = false,
  height = 286,
  interactive = false,
}: {
  title: string;
  children: (p: PlotContext) => ReactNode;
  xDomain?: [number, number];
  yDomain?: [number, number];
  onPoint?: (x: number, y: number) => void;
  xLabel?: string;
  yLabel?: string;
  equalAspect?: boolean;
  height?: number;
  interactive?: boolean;
}) {
  const bottom = height - 38;
  const innerHeight = height - 66;
  if (equalAspect) {
    const center = (xDomain[0] + xDomain[1]) / 2;
    const half = ((yDomain[1] - yDomain[0]) * 354) / innerHeight / 2;
    xDomain = [center - half, center + half];
  }
  const id = useId().replace(/:/g, '');
  const sx = (x: number) => 42 + ((x - xDomain[0]) / (xDomain[1] - xDomain[0])) * 354;
  const sy = (y: number) => bottom - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;
  const ticks = (d: [number, number]) =>
    Array.from({ length: 5 }, (_, i) => d[0] + ((d[1] - d[0]) * i) / 4);
  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (!onPoint) return;
    const r = e.currentTarget.getBoundingClientRect(),
      x = ((e.clientX - r.left) / r.width) * 420,
      y = ((e.clientY - r.top) / r.height) * height;
    if (x < 42 || x > 396 || y < 28 || y > bottom) return;
    onPoint(
      xDomain[0] + ((x - 42) / 354) * (xDomain[1] - xDomain[0]),
      yDomain[0] + ((bottom - y) / innerHeight) * (yDomain[1] - yDomain[0]),
    );
  };
  const pointAt: PlotContext['pointAt'] = (element, clientX, clientY) => {
    const bounds = element.ownerSVGElement!.getBoundingClientRect();
    const x = ((clientX - bounds.left) / bounds.width) * 420;
    const y = ((clientY - bounds.top) / bounds.height) * height;
    return {
      x: xDomain[0] + ((x - 42) / 354) * (xDomain[1] - xDomain[0]),
      y: yDomain[0] + ((bottom - y) / innerHeight) * (yDomain[1] - yDomain[0]),
    };
  };
  return (
    <svg
      className={'plot ' + (onPoint ? 'clickable' : '')}
      viewBox={'0 0 420 ' + height}
      role={interactive ? 'group' : 'img'}
      aria-label={title}
      onClick={click}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={id}>
          <rect x="42" y="28" width="354" height={innerHeight} />
        </clipPath>
      </defs>
      {ticks(xDomain).map((t) => (
        <g key={'x' + t}>
          <line className="grid-line" x1={sx(t)} x2={sx(t)} y1={28} y2={bottom} />
          <text x={sx(t)} y={height - 20} textAnchor="middle">
            {Number(t.toFixed(1))}
          </text>
        </g>
      ))}
      {ticks(yDomain).map((t) => (
        <g key={'y' + t}>
          <line className="grid-line" x1={42} x2={396} y1={sy(t)} y2={sy(t)} />
          <text x={32} y={sy(t) + 4} textAnchor="end">
            {Number(t.toFixed(1))}
          </text>
        </g>
      ))}
      <line
        className="axis-line"
        x1={42}
        x2={396}
        y1={sy(Math.max(yDomain[0], Math.min(yDomain[1], 0)))}
        y2={sy(Math.max(yDomain[0], Math.min(yDomain[1], 0)))}
      />
      <line
        className="axis-line"
        x1={sx(Math.max(xDomain[0], Math.min(xDomain[1], 0)))}
        x2={sx(Math.max(xDomain[0], Math.min(xDomain[1], 0)))}
        y1={28}
        y2={bottom}
      />
      <g clipPath={'url(#' + id + ')'}>{children({ sx, sy, pointAt })}</g>
      <text x={407} y={height - 4} textAnchor="end" className="axis-label">
        {xLabel}
      </text>
      <text x={17} y={16} className="axis-label">
        {yLabel}
      </text>
    </svg>
  );
}
export function Trace({
  values,
  label,
  startIndex = 0,
  logarithmic = false,
}: {
  values: number[];
  label: string;
  startIndex?: number;
  logarithmic?: boolean;
}) {
  const max = Math.max(1e-6, ...values.filter(Number.isFinite)),
    log = logarithmic || max > 100;
  const mapped = values.map((v) => (log ? Math.log10(1 + Math.max(0, v)) : v)),
    top = Math.max(1e-6, ...mapped);
  return (
    <div className="trace">
      <div>
        <span>
          {label}
          {log ? ' · log₁₀(1 + loss) scale' : ''}
        </span>
        <span>{startIndex + values.length - 1} steps</span>
      </div>
      <svg viewBox="0 0 400 88" role="img" aria-label={label + ' over iterations'}>
        <path d="M10 8V72H390" fill="none" stroke="var(--plot-axis)" />
        <polyline
          fill="none"
          stroke="var(--trace-color, var(--plot-error))"
          strokeWidth="2"
          points={mapped
            .map(
              (v, i) =>
                10 + (i / Math.max(1, mapped.length - 1)) * 380 + ',' + (72 - (v / top) * 60),
            )
            .join(' ')}
        />
        <text x="10" y="86">
          {startIndex}
        </text>
        <text x="390" y="86" textAnchor="end">
          iteration {startIndex + values.length - 1}
        </text>
      </svg>
    </div>
  );
}
