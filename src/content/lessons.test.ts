import { it, expect } from 'vitest';
import katex from 'katex';
import { lessons } from './lessons';

it('renders every authored lesson equation and symbol with strict KaTeX', () => {
  for (const lesson of lessons) {
    const expressions = [
      lesson.formula,
      lesson.worked.formula,
      ...lesson.symbols.map(([symbol]) => symbol),
      ...lesson.steps.map((step) => step.formula),
      ...lesson.deeper.flatMap((section) => (section.formula ? [section.formula] : [])),
    ];
    for (const math of expressions) {
      expect(
        () =>
          katex.renderToString(math, {
            throwOnError: true,
            strict: 'error',
            trust: false,
          }),
        lesson.id + ': ' + math,
      ).not.toThrow();
    }
  }
});
