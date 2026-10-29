import type { Lesson } from './lessons';
export const vectorLesson: Lesson = {
  id: 'vectors',
  title: 'Vectors & dot products',
  short: 'Vectors & predictions',
  subtitle: 'Turn a list of features into a prediction.',
  group: 'The foundations',
  question: 'How do several measurements combine into a single prediction?',
  experiment: {
    action:
      'Keep the weights fixed and move the feature vector. Try a perpendicular direction, then change only the bias.',
    observe:
      'A perpendicular pair has dot product 0, so the prediction equals b. Each contribution still comes from its matching weight and feature. Changing b shifts the prediction without moving either vector.',
  },
  prerequisites: ['sum', 'norm'],
  tags: [
    'wᵀx',
    '‖x‖',
    'x₁',
    'x₂',
    'vectors',
    'dimensions',
    'dot product',
    'weights',
    'bias',
    'transpose',
    'x',
    'w',
    'ŷ',
  ],
  formula: '\\hat y=w^Tx+b=\\sum_{j=1}^{d}w_jx_j+b',
  formulaLabel: 'The building block of prediction',
  symbols: [
    ['x\\in\\mathbb R^d', 'Feature column vector with d real-number entries.'],
    ['w\\in\\mathbb R^d', 'Weight column vector with the same dimension as x.'],
    ['d,\\,j', 'Number of features and feature index, respectively.'],
    ['w^T', 'The transpose of w: the same entries arranged as a row.'],
    ['b,\\,\\hat y', 'Scalar bias and scalar predicted target.'],
    ['\\|x\\|_2,\\,\\theta', 'Euclidean length of x and the angle between two nonzero vectors.'],
  ],
  intuition: [
    'A vector is a list with an order. For a small delivery, x might record [distance in km, number of parcels]. The two entries measure different things. A model gives each feature a weight, multiplies matching entries, and adds the contributions.',
    'If the illustrative weights are [2, 1], every kilometer contributes 2 units of predicted cost and every parcel contributes 1. A bias adds a fixed starting cost. A dot product is precisely the multiply-and-add part of this rule.',
  ],
  assumptions:
    'Inputs and weights must have equal dimensions and matching feature order. In the lab d = 2. The geometric angle assumes ordinary Euclidean coordinates; changing feature units changes that geometry. A prediction rule alone is not a trained model.',
  steps: [
    {
      title: 'Name the entries',
      body: 'A two-dimensional vector has two components. Subscripts identify positions, not powers. The first weight must multiply the first feature.',
      formula:
        'x=\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix},\\quad w=\\begin{bmatrix}w_1\\\\w_2\\end{bmatrix}',
    },
    {
      title: 'Compute the contributions',
      body: 'Multiply each feature by its matching weight. Each product is a scalar contribution to the score. A negative weight reverses the feature’s contribution.',
      formula: 'c_1=w_1x_1,\\quad c_2=w_2x_2',
    },
    {
      title: 'Add, then shift',
      body: 'The dot product adds the contributions. Add the bias once, after summing, to obtain the final prediction. The bias need not be zero when every feature is zero.',
      formula: 'w^Tx=c_1+c_2,\\qquad \\hat y=c_1+c_2+b',
    },
    {
      title: 'Connect arithmetic to geometry',
      body: 'For nonzero vectors, the same dot product equals the product of their lengths times the cosine of their angle. Aligned directions contribute positively; perpendicular directions give zero; opposing directions contribute negatively.',
      formula: 'w^Tx=\\|w\\|_2\\|x\\|_2\\cos\\theta',
    },
  ],
  worked: {
    body: 'Use x = [2, 1], w = [2, 1], and b = 3. The contributions are 4 and 1. Their dot product is 5; the bias shifts the prediction to 8.',
    formula: '\\hat y=2\\cdot2+1\\cdot1+3=8',
  },
  deeper: [
    {
      title: 'A zero vector has no direction',
      body: 'If either vector is zero, the dot product is zero. Its angle with the other vector is undefined because the cosine formula would divide by zero. The lab shows “Undefined” instead of inventing an angle.',
    },
    {
      title: 'Why is a prediction called affine?',
      body: 'The dot product alone is linear: it preserves addition and scaling. Adding a nonzero bias creates an affine map. In machine learning, “linear model” commonly includes this intercept.',
    },
  ],
  library:
    'NumPy expresses the core computation as w @ x + b. Its arrays must have compatible shapes. The standard-library example makes every multiplication visible before showing this optional equivalent.',
  limitations: [
    'A larger dot product is not automatically a better prediction. It depends on the task and units.',
    'Swapping feature order without swapping weights changes the prediction.',
    'Angles across features with different units need a deliberate scaling convention.',
  ],
  recap:
    'Features are an ordered vector. Weights set each feature’s contribution. The dot product adds those contributions, and the bias shifts the result.',
  quiz: [
    {
      prompt: 'For w = [2, −1] and x = [3, 4], what is wᵀx?',
      options: ['2', '10', '[6, −4]'],
      correct: 0,
      explanations: [
        'Correct. 2 × 3 + (−1) × 4 = 2.',
        'This ignores the negative sign of the second weight.',
        'Those are the component contributions. Add them to obtain the scalar dot product, 2.',
      ],
    },
    {
      prompt: 'What does increasing the bias by 2 do?',
      options: [
        'Rotates the feature vector',
        'Adds 2 to every prediction',
        'Doubles every prediction',
      ],
      correct: 1,
      explanations: [
        'The bias does not change the features or weights.',
        'Correct. The bias is added once to the weighted sum.',
        'An additive change does not multiply the prediction.',
      ],
    },
    {
      prompt: 'What is the angle between a zero vector and a nonzero vector?',
      options: ['Always 0°', 'Always 90°', 'Undefined'],
      correct: 2,
      explanations: [
        'A zero vector has no direction. Its angle is not 0°.',
        'A zero dot product does not imply a 90° angle when a vector has zero length.',
        'Correct. Dividing by the product of lengths would divide by zero.',
      ],
    },
  ],
};
