import type { Lesson } from './lessons';
export const logisticLesson: Lesson = {
  id: 'logistic-regression',
  title: 'Logistic regression',
  short: 'Logistic regression',
  subtitle: 'From a linear score to a probability.',
  group: 'Supervised learning',
  question: 'How can a weighted sum express a probability for one of two classes?',
  experiment: {
    action:
      'Move the decision threshold while keeping the weights fixed. Compare predicted classes, precision, and recall.',
    observe:
      'The threshold changes the decision line and confusion matrix while leaving the probabilities and cross-entropy unchanged. Train one step to change the weights instead, then inspect the probability table.',
  },
  prerequisites: ['dot-product', 'probability', 'logarithm', 'chain-rule'],
  tags: [
    'σ',
    'τ',
    '∇',
    'z',
    'sigmoid',
    'logit',
    'binary cross-entropy',
    'classification',
    'precision',
    'recall',
    'threshold',
    'probability',
    'p',
  ],
  formula: 'z=w^Tx+b,\\qquad p=\\sigma(z)=\\frac{1}{1+e^{-z}}',
  formulaLabel: 'An unbounded score, a bounded probability',
  symbols: [
    ['n,\\,i,\\,j', 'Observation count, observation index, and feature index j = 1, 2.'],
    ['X\\in\\mathbb R^{n\\times2}', 'Feature matrix with one observation per row.'],
    ['x_i,\\,w\\in\\mathbb R^2', 'Two-feature input and two weights, both column vectors.'],
    ['b,\\,z_i', 'Scalar bias and scalar logit for observation i.'],
    ['y_i\\in\\{0,1\\},\\,p_i', 'Observed binary label and predicted probability of class 1.'],
    ['\\sigma,\\,\\tau', 'Sigmoid function and decision threshold, respectively.'],
    ['\\ell_i,\\,J', 'One-observation negative log likelihood and its mean.'],
    [
      '\\nabla_w J,\\,\\partial J/\\partial b',
      'Two-entry weight gradient and scalar bias gradient.',
    ],
  ],
  intuition: [
    'A linear score can be any real number. A sigmoid maps that score smoothly into a number between zero and one. A score of zero gives probability 0.5; positive scores favor class 1 and negative scores favor class 0.',
    'A probability is separate from a decision. We label an observation class 1 when its probability is at least the chosen threshold. Move the threshold without changing any weights: the probabilities stay fixed, but decisions and the confusion matrix can change. Circles and squares encode the observed classes in the lab.',
  ],
  assumptions:
    'Each example has two real-valued features and a label 0 or 1. The log odds are assumed affine in the features. Training minimizes mean binary cross-entropy over independent observations. No regularization is used in this illustration.',
  steps: [
    {
      title: 'Make a score, then a probability',
      body: 'Multiply the two features by their weights, add the bias, and apply sigmoid. The negative exponent is essential: increasing the score must increase the probability.',
      formula: 'z_i=w^Tx_i+b,\\qquad p_i=\\frac{1}{1+e^{-z_i}}',
    },
    {
      title: 'Write the likelihood of the observed label',
      body: 'A label of 1 contributes p; a label of 0 contributes 1 − p. Powers combine these cases in one expression. Take the negative natural logarithm to make a loss we minimize.',
      formula:
        '\\ell_i=-\\log\\left(p_i^{y_i}(1-p_i)^{1-y_i}\\right)=-y_i\\log p_i-(1-y_i)\\log(1-p_i)',
    },
    {
      title: 'Differentiate with respect to probability',
      body: 'The derivative of log(p) is 1/p. Applying the chain rule to log(1 − p) contributes a minus sign. This yields the loss sensitivity before accounting for sigmoid.',
      formula: '\\frac{\\partial\\ell_i}{\\partial p_i}=-\\frac{y_i}{p_i}+\\frac{1-y_i}{1-p_i}',
    },
    {
      title: 'Pass through sigmoid',
      body: 'Sigmoid has derivative p(1 − p). Multiplying the previous expression by it cancels the denominators: −y(1 − p) + (1 − y)p = p − y. Since ∂z/∂wⱼ = xⱼ, multiply by the input to get each weight derivative.',
      formula:
        '\\frac{\\partial\\ell_i}{\\partial z_i}=p_i-y_i,\\qquad \\frac{\\partial\\ell_i}{\\partial w_j}=(p_i-y_i)x_{ij}',
    },
    {
      title: 'Average all observations',
      body: 'The mean loss divides by n. Stacking the probabilities and labels into n-entry column vectors lets the matrix transpose collect each feature’s contributions. The bias derivative uses ∂z/∂b = 1.',
      formula:
        'J=\\frac{1}{n}\\sum_i\\ell_i,\\quad\\nabla_w J=\\frac{X^T(p-y)}{n},\\quad\\frac{\\partial J}{\\partial b}=\\frac{1}{n}\\sum_i(p_i-y_i)',
    },
  ],
  worked: {
    body: 'For x = [1, 0], w = [1, 1], b = 0, the logit is 1. Sigmoid gives about 0.731. If y = 1, the loss is about 0.313 and the logit derivative is about −0.269.',
    formula: 'z=1,\\quad p\\approx0.731,\\quad\\ell=-\\log p\\approx0.313',
  },
  deeper: [
    {
      title: 'Compute the loss without log(0)',
      body: 'Directly taking logarithms of a rounded sigmoid can overflow or reach log(0). The implementation uses this equivalent softplus expression on the original logit. Sigmoid itself uses separate positive and negative branches to avoid exponentiating a large positive number.',
      formula: '\\ell(z,y)=\\max(z,0)-yz+\\log(1+e^{-|z|})',
    },
    {
      title: 'The threshold moves the boundary',
      body: 'For a threshold strictly between zero and one, the decision boundary is the line where the logit equals log(τ/(1 − τ)). At thresholds 0 and 1 there is no finite-logit boundary. With both weights zero the probability is constant everywhere.',
      formula: 'w^Tx+b=\\log\\frac{\\tau}{1-\\tau}',
    },
  ],
  library:
    'Scikit-learn LogisticRegression normally uses regularization. In current versions, use C=np.inf to disable it (older versions use penalty=None), and fit to convergence for an unregularized comparison on a dataset with a finite optimum. The Python companion also compares logits and probabilities at fixed parameters with NumPy, avoiding solver-default differences.',
  limitations: [
    'Precision = TP/(TP + FP); recall = TP/(TP + FN). A zero denominator is explicitly undefined.',
    'A linear decision boundary cannot represent every class pattern. A probability estimate is not automatically calibrated.',
    'Perfectly separable data can drive unregularized weights toward infinity; a finite training demonstration is not evidence of a finite optimum.',
  ],
  recap:
    'The model learns probabilities using cross-entropy. The threshold turns those probabilities into decisions, without retraining.',
  quiz: [
    {
      prompt: 'What is σ(0)?',
      options: ['0', '0.5', '1'],
      correct: 1,
      explanations: [
        'Sigmoid approaches 0 for very negative logits, not at zero.',
        'Correct. 1 / (1 + exp(0)) = 1/2.',
        'Sigmoid approaches 1 for very positive logits.',
      ],
    },
    {
      prompt: 'What changes when only the threshold changes?',
      options: ['The learned weights', 'The probabilities', 'The predicted classes, potentially'],
      correct: 2,
      explanations: [
        'Thresholding is a decision rule; it does not update weights.',
        'Probabilities depend on weights, bias, and inputs, which did not change.',
        'Correct. An unchanged probability can land on a different side of the new threshold.',
      ],
    },
    {
      prompt: 'There are no predicted positives. What is precision?',
      options: [
        'Automatically 1',
        'Undefined because its denominator is zero',
        'The same as recall',
      ],
      correct: 1,
      explanations: [
        'There are no positive predictions to assess, so this app does not invent perfect precision.',
        'Correct. TP + FP is zero. We display Undefined.',
        'Recall has a different denominator: the number of actual positives.',
      ],
    },
  ],
};
