import type { Lesson } from './lessons';
export const gradientLesson: Lesson = {
  id: 'gradient-descent',
  title: 'Gradient descent',
  short: 'Gradient descent',
  subtitle: 'Find a better fit, one careful step at a time.',
  group: 'Learning from error',
  question:
    'How can we improve parameters when we cannot, or do not want to, solve for them directly?',
  experiment: {
    action:
      'Press Step and inspect the update calculation. Then compare the three rate presets from the same starting pair.',
    observe:
      'Use Show the calculation to follow one update from the old parameters. Reset keeps the dataset and chosen learning rate, so you can compare paths fairly. The rate presets restart from the same pair.',
  },
  prerequisites: ['derivative', 'gradient', 'chain-rule'],
  tags: [
    '∇',
    '∂J',
    'θ',
    'α',
    'optimization',
    'gradient',
    'partial derivative',
    'learning rate',
    'alpha',
    'α',
    'θ',
    'contour',
    'divergence',
  ],
  formula: '\\theta_{t+1}=\\theta_t-\\alpha\\nabla J(\\theta_t)',
  formulaLabel: 'A step in the downhill direction',
  symbols: [
    ['\\theta=(w,b)^T', 'Parameter vector with two entries: slope and intercept.'],
    ['t', 'Iteration index, starting at zero.'],
    ['\\alpha>0', 'Learning rate: the size multiplier for each update.'],
    ['\\nabla J', 'Column vector of the two partial derivatives of J.'],
    ['n,\\,x_i,\\,y_i', 'Observation count, input, and target, as in regression.'],
    ['r_i,\\,J', 'Residual wxᵢ + b − yᵢ, and mean squared error.'],
    ['h', 'A small scalar perturbation used to define a derivative.'],
  ],
  intuition: [
    'Imagine standing on a smooth landscape of loss. Your coordinates are the slope and intercept, and your elevation is mean squared error. A contour connects parameter pairs with equal loss. Moving perpendicular to the contours takes you most steeply up or down.',
    'The gradient measures the uphill direction locally. Subtracting it moves downhill if the step is small enough. A learning rate that is too large can overshoot the valley, oscillate across it, or send the parameters farther away.',
  ],
  assumptions:
    'This lab uses the same deterministic observations and 1/n MSE as the regression lesson. Both parameters update simultaneously using the gradient at the old pair. The loss is a convex quadratic, but convergence still depends on the learning rate.',
  steps: [
    {
      title: 'Start with a local rate of change',
      body: 'A derivative compares the output change to an increasingly small input change. For one parameter w, it is the slope of the loss curve at the current value. The limiting operation is what distinguishes a derivative from a large finite move.',
      formula: '\\frac{dJ}{dw}=\\lim_{h\\to0}\\frac{J(w+h)-J(w)}{h}',
    },
    {
      title: 'Hold the other coordinate fixed',
      body: 'With two parameters, take one partial derivative for slope and one for intercept. Collect them into a vector. These are exactly the MSE derivatives derived in the previous lesson.',
      formula:
        '\\nabla J(w,b)=\\begin{bmatrix}\\frac{2}{n}\\sum_i x_i r_i\\\\\\frac{2}{n}\\sum_i r_i\\end{bmatrix}',
    },
    {
      title: 'Take a step against the gradient',
      body: 'A positive partial derivative means increasing that parameter increases loss locally. Subtract a positive multiple of it. Calculate both new values before replacing either old value.',
      formula:
        'w_{t+1}=w_t-\\alpha\\frac{\\partial J}{\\partial w},\\quad b_{t+1}=b_t-\\alpha\\frac{\\partial J}{\\partial b}',
    },
    {
      title: 'Measure again, then repeat',
      body: 'Recompute predictions, residuals, loss, and gradient at the new parameters. A good step is assessed through the actual objective. Small gradients indicate a locally flat objective, not necessarily good predictions on new data.',
      formula: 'J_{t+1}=\\frac{1}{n}\\sum_i(w_{t+1}x_i+b_{t+1}-y_i)^2',
    },
  ],
  worked: {
    body: 'For points (1, 2), (2, 3), start with w = 1, b = 0. The residuals are −1, −1, giving gradients −3 and −2. At α = 0.1, the next pair is (1.3, 0.2). Loss drops from 1 to 0.145.',
    formula: 'w_1=1-0.1(-3)=1.3,\\quad b_1=0-0.1(-2)=0.2',
  },
  deeper: [
    {
      title: 'Why can a small step reduce the loss?',
      body: 'The first-order approximation replaces the loss by a local plane. Substituting the negative-gradient step reduces this approximation by α times the squared gradient length. Curvature controls how close the approximation is to reality.',
      formula: 'J(\\theta-\\alpha\\nabla J)\\approx J(\\theta)-\\alpha\\|\\nabla J\\|_2^2',
    },
    {
      title: 'A precise stability boundary for this quadratic',
      body: 'Let H be the Hessian, the matrix of second derivatives. For a positive-definite quadratic, a constant rate strictly between 0 and 2/λmax(H) converges. Near the upper boundary, the steepest direction alternates slowly across the valley. The lab presets compute this boundary from the actual dataset. Changing the dataset changes the safe range.',
      formula:
        'H=\\frac{2}{n}\\begin{bmatrix}\\sum_i x_i^2&\\sum_i x_i\\\\\\sum_i x_i&n\\end{bmatrix}',
    },
  ],
  library:
    'NumPy can express a batch gradient as 2 * X.T @ (X @ theta - y) / n with a bias column in X. Scikit-learn’s SGDRegressor adds conventions and defaults such as regularization and learning schedules, so it is not a drop-in numerical comparison to this fixed-rate batch experiment.',
  limitations: [
    'The negative gradient is a local direction; a large step can increase the loss.',
    'A small change in loss may reflect a tiny learning rate, rather than reaching the optimum.',
    'Feature scales affect curvature. This bounded teaching lab stops after 250 steps or when a non-finite or excessively large value is detected. It reports the stop instead of claiming convergence.',
  ],
  recap:
    'Differentiate, subtract a scaled gradient, and measure again. The same dataset defines the contours, the path, and every numerical update.',
  quiz: [
    {
      prompt: 'If ∂J/∂w is positive, what does a small gradient descent step do to w?',
      options: ['Increases it', 'Decreases it', 'Sets it to zero'],
      correct: 1,
      explanations: [
        'Increasing w would move uphill locally.',
        'Correct. Subtracting a positive derivative decreases w.',
        'The update depends on the derivative and learning rate, not a rule to set w to zero.',
      ],
    },
    {
      prompt: 'Should we use the updated slope to compute the same step’s intercept gradient?',
      options: [
        'Yes, always',
        'No, both gradients use the old parameters',
        'Only when the learning rate is large',
      ],
      correct: 1,
      explanations: [
        'That would be a different sequential-update method.',
        'Correct. Batch gradient descent updates all coordinates from the same old parameter vector.',
        'The learning rate does not change the simultaneous-update definition.',
      ],
    },
    {
      prompt: 'The loss grows on successive steps. What is a reasonable first check?',
      options: [
        'Check whether the learning rate is too large',
        'Mark the lesson as converged',
        'Silently clamp the displayed loss',
      ],
      correct: 0,
      explanations: [
        'Correct. Overshooting is a common cause; also check the gradient and feature scales.',
        'Growth in loss is not evidence of convergence.',
        'Clipping a number hides the problem and misrepresents the algorithm.',
      ],
    },
  ],
};
