import { useState } from 'react';
import { Copy } from 'lucide-react';
import { MathView, copyText } from '../ui';
import { useParameterFocus } from './ParameterFocus';

const terms = [
  {
    id: 'theta',
    math: '\\theta',
    name: 'Parameters',
    explanation:
      'θ contains the slope w and intercept b. Each update changes both using the same old parameter pair.',
  },
  {
    id: 'alpha',
    math: '\\alpha',
    name: 'Learning rate',
    explanation:
      'α scales the step. A larger rate moves farther, but it can overshoot the valley. Focus the learning-rate slider to find α in the update rule.',
  },
  {
    id: 'gradient',
    math: '\\nabla J',
    name: 'Gradient',
    explanation:
      '∇J contains the two partial derivatives. It points toward the steepest local increase in loss, so we subtract it.',
  },
];
const snippet = 'loss, dw, db = loss_gradient(points, w, b)\nw, b = w - alpha * dw, b - alpha * db';
export function GradientGuide() {
  const [selected, setSelected] = useState('theta');
  const [feedback, setFeedback] = useState('');
  const focus = useParameterFocus();
  const term = terms.find((item) => item.id === selected)!;
  const alpha = focus?.focused === 'alpha' ? '\\boxed{\\alpha}' : '\\alpha';
  return (
    <section className="gradient-guide" aria-label="The gradient update rule">
      <p className="eyebrow">01 / The update rule</p>
      <h2>
        The gradient points uphill.
        <br />
        Move in the opposite direction to reduce the loss.
      </h2>
      <div className="formula-card update-rule">
        <MathView math={'\\theta_{t+1}=\\theta_t-' + alpha + '\\nabla J(\\theta_t)'} />
      </div>
      <div className="equation-terms" aria-label="Explore the equation">
        {terms.map((item) => (
          <button
            key={item.id}
            className={'term-' + item.id}
            aria-pressed={selected === item.id}
            onClick={() => setSelected(item.id)}
            onFocus={() => focus?.setFocused(item.id)}
            onBlur={() => focus?.setFocused(null)}
          >
            <i aria-hidden="true" />
            <MathView inline math={item.math} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <p className="term-explanation" role="status">
        {term.explanation}
      </p>
      <h3>One step, explained</h3>
      <ol className="update-steps">
        <li>
          <strong>Measure the error</strong>
          <span>Compute the current loss J.</span>
        </li>
        <li>
          <strong>Calculate the gradient</strong>
          <span>Find ∇J at this parameter pair.</span>
        </li>
        <li>
          <strong>Update the parameters</strong>
          <span>Subtract α∇J, then measure again.</span>
        </li>
      </ol>
      <div className="update-code">
        <div>
          <span>Inside the Python loop</span>
          <button
            onClick={async () => {
              try {
                await copyText(snippet);
                setFeedback('Update code copied.');
              } catch {
                setFeedback('Copy failed. Select the update code and copy it manually.');
              }
            }}
          >
            <Copy size={13} /> Copy
          </button>
        </div>
        <pre tabIndex={0}>
          <code>{snippet}</code>
        </pre>
        <p role="status">{feedback}</p>
      </div>
    </section>
  );
}
