import { vectorLesson } from './vectors';
import { gradientLesson } from './gradient';
import { logisticLesson } from './logistic';
import { pcaLesson } from './pca';
import { kmeansLesson } from './kmeans';
import { neuralLesson } from './neural';
import type { LessonId } from '../math/parameters';
export type Question = {
  prompt: string;
  options: string[];
  correct: number;
  explanations: string[];
};
export type Lesson = {
  id: LessonId;
  title: string;
  short: string;
  subtitle: string;
  group: string;
  question: string;
  experiment: { action: string; observe: string };
  prerequisites: string[];
  tags: string[];
  formula: string;
  formulaLabel: string;
  symbols: [string, string][];
  intuition: string[];
  assumptions: string;
  steps: { title: string; body: string; formula: string }[];
  worked: { body: string; formula: string };
  deeper: { title: string; body: string; formula?: string }[];
  library: string;
  limitations: string[];
  recap: string;
  quiz: Question[];
};
const regressionLesson: Lesson = {
  id: 'linear-regression',
  title: 'Linear regression',
  short: 'Linear regression',
  subtitle: 'Find the line that best describes your data.',
  group: 'Supervised learning',
  question: 'How can we predict a number from an input, and measure how far our predictions miss?',
  experiment: {
    action:
      'Set the slope to 0, then increase it while watching the line and MSE. Try Fit best line to compare your choice.',
    observe:
      'With slope 0, every input receives the same prediction b. Changing the slope tilts the line. Compare the residual table with the amber gaps, then check whether a better-looking line also has lower MSE.',
  },
  prerequisites: ['vector', 'sum', 'mean', 'derivative'],
  tags: ['least squares', 'MSE', 'residual', 'slope', 'intercept', 'w', 'b', 'ŷ', 'J'],
  formula: '\\hat y_i = wx_i + b',
  formulaLabel: 'A line becomes a model',
  symbols: [
    ['n', 'Number of observations, at least one.'],
    ['i', 'Observation index, from 1 to n.'],
    ['x_i,\\,y_i', 'Observed input and target, both scalars.'],
    ['w,\\,b', 'Slope (weight) and intercept (bias), both scalars.'],
    ['\\hat y_i', 'Prediction at input xᵢ. The hat means predicted.'],
    ['r_i', 'Residual, defined here as prediction minus target.'],
    ['J', 'Mean squared error (MSE), a nonnegative scalar.'],
    ['\\partial', 'A partial derivative: change one parameter, hold the other fixed.'],
  ],
  intuition: [
    'Imagine predicting a plant’s height from the number of weeks it has grown. A line offers a simple rule: each extra week contributes the same amount, and the intercept sets the starting height. The dots in this lab are illustrative observations, not experimental evidence about plants.',
    'A useful line passes near the observations. The vertical gap from a dot to the line is a residual. Squaring each gap makes positive and negative errors count, and makes large misses matter more. Averaging those squares gives one number to minimize.',
  ],
  assumptions:
    'Each row is one input and one target. The model assumes a straight-line relationship is a useful approximation. Minimizing squared error requires no probability model; interpreting estimates statistically needs additional assumptions about observations and noise.',
  steps: [
    {
      title: 'Write down the error for one point',
      body: 'Subtract the observed target from the prediction. Our residual sign is prediction minus observation; some texts use the opposite convention.',
      formula: 'r_i = \\hat y_i-y_i = wx_i+b-y_i',
    },
    {
      title: 'Turn the errors into one objective',
      body: 'Square each residual, add all n squared errors, and divide by n. We use 1/n throughout, rather than 1/(2n), so the derivative contains a factor of 2.',
      formula: 'J(w,b)=\\frac{1}{n}\\sum_{i=1}^{n}(wx_i+b-y_i)^2',
    },
    {
      title: 'Differentiate the square',
      body: 'The chain rule says: differentiate the outer square, then multiply by the derivative of its inside. For the slope, the inside changes by xᵢ. For the intercept it changes by 1.',
      formula:
        '\\frac{\\partial r_i^2}{\\partial w}=2r_i x_i,\\qquad \\frac{\\partial r_i^2}{\\partial b}=2r_i',
    },
    {
      title: 'Average the individual derivatives',
      body: 'The derivative of a sum is the sum of its derivatives. The constant 1/n stays in front. These two quantities tell us how the loss changes locally.',
      formula:
        '\\frac{\\partial J}{\\partial w}=\\frac{2}{n}\\sum_i x_i r_i,\\qquad \\frac{\\partial J}{\\partial b}=\\frac{2}{n}\\sum_i r_i',
    },
    {
      title: 'Solve for the best line directly',
      body: 'Set both derivatives to zero. The intercept equation gives b = ȳ − w x̄. Substitute this into the slope equation, collect w, and divide by the sum of squared centered inputs when it is positive. Bars denote arithmetic means.',
      formula:
        'w^*=\\frac{\\sum_i(x_i-\\bar x)(y_i-\\bar y)}{\\sum_i(x_i-\\bar x)^2},\\qquad b^*=\\bar y-w^*\\bar x',
    },
  ],
  worked: {
    body: 'Take (x, y) = (1, 2) and (2, 3). With w = 1 and b = 0, predictions are 1 and 2. Both residuals are −1, so both squared errors are 1. The average is 1.',
    formula: 'J(1,0)=\\frac{(1-2)^2+(2-3)^2}{2}=1',
  },
  deeper: [
    {
      title: 'What if every input is identical?',
      body: 'The closed-form denominator is zero. You cannot identify a unique slope and intercept. Any line predicting the mean target at that input minimizes the loss. This app selects w = 0 and b = ȳ as an explicit convention.',
    },
    {
      title: 'From one feature to a matrix',
      body: 'Let X have n rows and d+1 columns, with a final column of ones for the intercept. Let θ contain d weights and one bias, and y contain n targets. Least squares minimizes the squared length of Xθ − y. The normal equations need not have an invertible XᵀX. The Moore–Penrose pseudoinverse X⁺ gives the minimum-norm least-squares solution, including rank-deficient cases. SVD or QR solvers avoid explicitly forming an inverse.',
      formula:
        '\\min_{\\theta\\in\\mathbb R^{d+1}}\\frac{1}{n}\\|X\\theta-y\\|_2^2,\\qquad \\theta^*=X^+y',
    },
  ],
  library:
    'NumPy’s numpy.linalg.lstsq solves matrix least squares and supports rank-deficient inputs. For a nonconstant scalar input its fitted predictions match the centered formula. For constant input, its minimum-norm parameters can differ from our w = 0 convention while predictions agree.',
  limitations: [
    'A small training MSE does not guarantee accurate predictions on new data.',
    'Squared error gives outliers substantial influence. Inspect the data and residuals.',
    'A fitted slope is an association, not evidence of causation. Predictions far beyond the observed inputs are extrapolations.',
  ],
  recap:
    'A linear model makes a prediction. A residual measures a miss. MSE turns all misses into one objective, and least squares finds the line that minimizes it.',
  quiz: [
    {
      prompt: 'The prediction is 5 and the observed target is 8. What is our residual?',
      options: ['−3', '3', '9'],
      correct: 0,
      explanations: [
        'Correct. Our convention is prediction minus target: 5 − 8 = −3.',
        'That uses the opposite residual convention. Here it is 5 − 8 = −3.',
        '9 is the squared residual. The signed residual is −3.',
      ],
    },
    {
      prompt: 'Why square the residuals before averaging?',
      options: [
        'To make positive and negative errors count',
        'To guarantee generalization',
        'To make outliers irrelevant',
      ],
      correct: 0,
      explanations: [
        'Correct. Squaring prevents cancellation and gives large errors more influence.',
        'Training loss alone cannot guarantee accuracy on unseen data.',
        'Squaring increases the influence of large errors, including outliers.',
      ],
    },
    {
      prompt: 'All input values equal 2. Can we identify a unique slope and intercept?',
      options: [
        'Yes, using more optimization steps',
        'No, many parameter pairs make the same best prediction',
        'Only if the mean target is positive',
      ],
      correct: 1,
      explanations: [
        'More steps cannot create information absent from the inputs.',
        'Correct. Every pair satisfying 2w + b = ȳ minimizes the loss.',
        'The sign of the target mean does not fix the rank deficiency.',
      ],
    },
  ],
};
export const lessons: Lesson[] = [
  vectorLesson,
  regressionLesson,
  gradientLesson,
  logisticLesson,
  pcaLesson,
  kmeansLesson,
  neuralLesson,
];
export const getLesson = (id: LessonId) => lessons.find((l) => l.id === id) ?? lessons[0];
