import { useRef } from 'react';
import type { PlotContext } from './Plot';
import { fmt } from '../components/ui';

export function DraggableVector({
  x,
  y,
  name,
  color,
  plot,
  onMove,
}: {
  x: number;
  y: number;
  name: 'x' | 'w';
  color: string;
  plot: PlotContext;
  onMove: (x: number, y: number) => void;
}) {
  const pointer = useRef<number | null>(null);
  const move = (nextX: number, nextY: number) =>
    onMove(Math.max(-5, Math.min(5, nextX)), Math.max(-5, Math.min(5, nextY)));
  return (
    <g
      className="drag-handle"
      role="button"
      tabIndex={0}
      aria-label={
        'Move ' + (name === 'x' ? 'feature' : 'weight') + ' vector: ' + fmt(x, 2) + ', ' + fmt(y, 2)
      }
      aria-describedby="vector-instructions"
      style={{ color }}
      onPointerDown={(event) => {
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        if (pointer.current !== event.pointerId) return;
        const point = plot.pointAt(event.currentTarget, event.clientX, event.clientY);
        move(point.x, point.y);
      }}
      onPointerUp={(event) => {
        pointer.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 1 : 0.1;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, step],
          ArrowDown: [0, -step],
          Home: [-x, -y],
        };
        if (delta[event.key]) {
          event.preventDefault();
          move(x + delta[event.key][0], y + delta[event.key][1]);
        }
      }}
    >
      <circle
        cx={plot.sx(x)}
        cy={plot.sy(y)}
        r={name === 'x' ? 12 : 6}
        fill="transparent"
        stroke="none"
      />
      {name === 'x' ? (
        <circle
          cx={plot.sx(x)}
          cy={plot.sy(y)}
          r="7"
          fill="var(--plot-bg)"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : (
        <path d={'M' + plot.sx(x) + ' ' + (plot.sy(y) - 5) + 'l5 5-5 5-5-5Z'} fill="currentColor" />
      )}
    </g>
  );
}
