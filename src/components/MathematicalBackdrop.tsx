import { memo } from 'react';
import { MathView } from './ui';
import type { LessonId } from '../math/parameters';

const equations: Record<LessonId, [string, string]> = {
  vectors: ['\\hat y=w^Tx+b', 'w^Tx=\\|w\\|\\|x\\|\\cos\\theta'],
  'linear-regression': ['\\hat y_i=wx_i+b', 'J=\\frac{1}{n}\\sum_i(\\hat y_i-y_i)^2'],
  'gradient-descent': ['Av=\\lambda v', '\\hat y=wx+b'],
  'logistic-regression': ['\\sigma(z)=\\frac{1}{1+e^{-z}}', '\\nabla_wJ=\\frac{X^T(p-y)}{n}'],
  pca: ['Cu=\\lambda u', 't_i=u^Tq_i'],
  'k-means': ['J=\\sum_i\\|x_i-\\mu_{c_i}\\|_2^2', '\\mu_j=\\frac{1}{|S_j|}\\sum_{i\\in S_j}x_i'],
  'neural-network': ['h=\\tanh(Wx+b)', '\\frac{\\partial\\ell}{\\partial z}=p-y'],
};

// These fixed schematics establish the visual setting; they never consume experiment state.
function Motif({ lesson }: { lesson: LessonId }) {
  switch (lesson) {
    case 'linear-regression':
      return (
        <>
          <path d="M50 350H510M75 375V75" />
          <path className="motif-accent" d="M90 320 470 110" />
          <path
            className="motif-amber"
            strokeDasharray="4 6"
            d="M140 300V292M215 215V251M295 240V207M370 140V165M445 155V124"
          />
          {[
            [140, 300],
            [215, 215],
            [295, 240],
            [370, 140],
            [445, 155],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5" />
          ))}
        </>
      );
    case 'gradient-descent':
      return (
        <g transform="translate(300 225) rotate(-26)">
          {[1, 0.78, 0.55, 0.3].map((scale) => (
            <ellipse key={scale} rx={215 * scale} ry={120 * scale} />
          ))}
          <path className="motif-amber" d="m-155-65 235 113-112-77 47 29-20-7 8 2" />
          <path className="motif-accent" d="M-9 0H9M0-9V9" />
        </g>
      );
    case 'logistic-regression':
      return (
        <>
          <path d="M55 350H520M90 380V65" />
          <path strokeDasharray="3 7" d="M90 210H505" />
          <path
            className="motif-accent"
            strokeWidth="1.5"
            d="M95 337C180 337 202 330 237 281S283 137 329 103 420 86 510 85"
          />
        </>
      );
    case 'pca':
      return (
        <g transform="translate(300 225)">
          <ellipse rx="205" ry="78" transform="rotate(-30)" />
          <path className="motif-accent" d="M-220 127 220-127" />
          <path className="motif-amber" strokeDasharray="5 6" d="m-72-125 144 250" />
          {[
            [-145, 88],
            [-110, 37],
            [-62, 60],
            [-14, -8],
            [45, -2],
            [90, -70],
            [151, -70],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="4" />
          ))}
        </g>
      );
    case 'k-means':
      return (
        <>
          {[
            [150, 270],
            [410, 270],
            [290, 120],
          ].map(([x, y], i) => (
            <g key={x} className={i === 1 ? 'motif-amber' : undefined}>
              <circle cx={x} cy={y} r="69" strokeDasharray="3 8" />
              <path d={'M' + (x - 9) + ' ' + y + 'h18M' + x + ' ' + (y - 9) + 'v18'} />
              {[
                [-28, -15],
                [20, 30],
                [-10, 34],
                [33, -19],
                [-36, 20],
              ].map(([dx, dy]) => (
                <circle key={dx} cx={x + dx} cy={y + dy} r="3" className="motif-point" />
              ))}
            </g>
          ))}
        </>
      );
    case 'neural-network':
      return (
        <>
          {[
            [100, 120, 290, 120],
            [100, 310, 290, 310],
            [100, 120, 290, 310],
            [100, 310, 290, 120],
            [290, 120, 480, 215],
            [290, 310, 480, 215],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
          {[
            [100, 120],
            [100, 310],
            [290, 120],
            [290, 310],
            [480, 215],
          ].map(([x, y], i) => (
            <circle
              key={i}
              className="motif-accent"
              cx={x}
              cy={y}
              r="24"
              fill="var(--background)"
            />
          ))}
        </>
      );
    default:
      return (
        <>
          <path d="M85 350H505M290 385V65" />
          <path className="motif-accent" d="m290 350 145-215m-145 215-145-140" />
          <path className="motif-amber" strokeDasharray="4 6" d="m145 210 290-75M290 350l65-95" />
          <circle cx="290" cy="350" r="4" className="motif-point" />
        </>
      );
  }
}

export const MathematicalBackdrop = memo(function MathematicalBackdrop({
  lesson,
}: {
  lesson: LessonId;
}) {
  const [primary, secondary] = equations[lesson];
  return (
    <div className="mathematical-backdrop" aria-hidden="true" inert data-motif={lesson}>
      <span className="decor-equation decor-primary">
        <MathView inline math={primary} />
      </span>
      <span className="decor-fragment">
        <MathView
          inline
          math={lesson === 'gradient-descent' ? '\\nabla J(\\theta)' : '\\mathbb R^2'}
        />
      </span>
      <span className="decor-equation decor-secondary">
        <MathView inline math={secondary} />
      </span>
      <svg className="decor-motif" viewBox="0 0 600 450" aria-hidden="true" focusable="false">
        <Motif lesson={lesson} />
      </svg>
    </div>
  );
});
