import type { Question } from '../content/lessons';
import { useParameterFocus } from './math/ParameterFocus';
import { useState } from 'react';
import type { ReactNode } from 'react';
import katex from 'katex';
import { Check, Copy, Download, ChevronDown } from 'lucide-react';
export const fmt = (n: number | null, digits = 3) =>
  n === null
    ? 'Undefined'
    : !Number.isFinite(n)
      ? 'Not finite'
      : Math.abs(n) >= 1e6
        ? n.toExponential(3)
        : n.toFixed(digits).replace(/^-0\.0+$/, '0.' + '0'.repeat(digits));
export function MathView({ math, inline = false }: { math: string; inline?: boolean }) {
  return (
    <span
      className={inline ? 'math-inline' : 'equation'}
      tabIndex={inline ? undefined : 0}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(math, {
          throwOnError: false,
          displayMode: !inline,
          strict: 'error',
          trust: false,
          output: 'htmlAndMathml',
        }),
      }}
    />
  );
}
export function NumberControl({
  label,
  value,
  onChange,
  min = -10,
  max = 10,
  step = 0.1,
  parameter,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  parameter?: string;
}) {
  const focus = useParameterFocus();
  min = Math.min(min, value);
  max = Math.max(max, value);
  return (
    <label className="control" data-parameter={parameter}>
      <span>
        {label}
        <output>{fmt(value, step < 0.01 ? 4 : 2)}</output>
      </span>
      <input
        type="range"
        onFocus={() => focus?.setFocused(parameter || null)}
        onBlur={() => focus?.setFocused(null)}
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  );
}
export function Stat({
  label,
  value,
  unit,
  digits = 3,
}: {
  label: string;
  value: number | null;
  unit?: string;
  digits?: number;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>
        {fmt(value, digits)}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
export function Calculation({ children }: { children: ReactNode }) {
  return (
    <details className="calculation">
      <summary>
        <ChevronDown size={15} /> Show the calculation
      </summary>
      <div>{children}</div>
    </details>
  );
}
export async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
}
export function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const [feedback, setFeedback] = useState('');
  const copy = async () => {
    try {
      await copyText(code);
      setFeedback('Code copied.');
    } catch {
      setFeedback('Copy failed. Select the code and copy it manually.');
    }
  };
  const download = () => {
    let url = '';
    try {
      url = URL.createObjectURL(new Blob([code], { type: 'text/x-python;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback('Download requested. If no file appears, copy the code below.');
    } catch {
      if (url) URL.revokeObjectURL(url);
      setFeedback('Download failed. Use Copy code, or select and save the code manually.');
    }
  };
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <span className="code-dot" /> {filename}
        </span>
        <div>
          <button onClick={copy}>
            <Copy size={14} /> Copy code
          </button>
          <button onClick={download}>
            <Download size={14} /> .py
          </button>
        </div>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <p className="feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
export function Quiz({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <div className="quiz">
      <p className="eyebrow">Pause & reflect</p>
      <h2>Check your understanding</h2>
      <p>Choose an answer to see the reasoning. You can try again.</p>
      {questions.map((q, i) => (
        <fieldset key={q.prompt}>
          <legend>
            <span className="question-num">0{i + 1}</span>
            {q.prompt}
          </legend>
          {q.options.map((o, j) => (
            <button
              key={o}
              className={
                'answer ' + (answers[i] === j ? (j === q.correct ? 'correct' : 'incorrect') : '')
              }
              aria-pressed={answers[i] === j}
              onClick={() => setAnswers({ ...answers, [i]: j })}
            >
              <span className="answer-letter">{String.fromCharCode(65 + j)}</span>
              {o}
              {answers[i] === j && j === q.correct && <Check size={17} />}
            </button>
          ))}
          {answers[i] !== undefined && (
            <p
              role="status"
              className={
                'answer-explanation ' + (answers[i] === q.correct ? 'correct' : 'incorrect')
              }
            >
              {q.explanations[answers[i]]}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}
