import type { Lesson } from './lessons';
export const pcaLesson: Lesson = {
  id: 'pca',
  title: 'Principal component analysis',
  short: 'Principal components',
  subtitle: 'Find the direction that keeps the most variation.',
  group: 'Unsupervised learning',
  question: 'If we must compress two features into one number, which direction should we keep?',
  experiment: {
    action:
      'Rotate the candidate axis and compare its variance and reconstruction error. Reveal PC1, then try Use PC1.',
    observe:
      'On the same centered cloud, the axis with greater projected variance has less reconstruction error. Standardization changes the coordinate system, so compare errors within one scaling choice. Equal eigenvalues give no unique best axis.',
  },
  prerequisites: ['mean', 'covariance', 'eigenvector', 'projection'],
  tags: [
    'λ',
    'Σ',
    'C',
    'uᵀq',
    'PCA',
    'eigenvalues',
    'eigenvectors',
    'covariance',
    'projection',
    'variance',
    'standardization',
    'λ',
    'u',
  ],
  formula: 't_i=u^Tq_i,\\qquad \\mathrm{Var}(t)=u^TCu,\\quad \\|u\\|_2=1',
  formulaLabel: 'Keep the variation along an axis',
  symbols: [
    ['x_i,\\,m\\in\\mathbb R^2', 'Observation i and the vector of feature means.'],
    ['n\\ge2,\\,j', 'Observation count and feature index j = 1, 2.'],
    [
      's_j,\\,q_i',
      'Sample standard deviation of feature j; centered, optionally scaled observation.',
    ],
    ['C\\in\\mathbb R^{2\\times2}', 'Sample covariance matrix, divided by n − 1.'],
    ['u,\\,t_i', 'Unit projection direction and scalar projection score.'],
    [
      '\\lambda_1\\ge\\lambda_2\\ge0',
      'Ordered eigenvalues: variance along the corresponding principal axes.',
    ],
    [
      '\\tilde q_i,\\,E',
      'One-axis reconstruction and mean squared Euclidean reconstruction error.',
    ],
    ['a,\\,c,\\,d', 'Entries of the symmetric covariance matrix [[a, c], [c, d]].'],
    [
      'R,\\,\\mathrm{tr}(C)',
      'PC1 explained-variance fraction, and the sum of the covariance diagonal entries.',
    ],
  ],
  intuition: [
    'A slanted cloud of points may have two coordinates but vary mostly along one direction. Think of casting a shadow onto a line. Rotate the line: some shadows spread out, while others nearly overlap.',
    'PCA chooses the direction with the largest projected variance. This preserves the most variation in one coordinate and minimizes squared reconstruction error in that same coordinate system. No target labels enter this calculation.',
  ],
  assumptions:
    'The lab uses two real features and at least two observations. All points are centered. Sample covariance and optional standardization both use n − 1. Reconstruction error is a mean squared Euclidean distance, measured in the displayed centered/scaled coordinates.',
  steps: [
    {
      title: 'Center each feature',
      body: 'Compute each feature mean mⱼ and subtract it. If standardization is on, also divide by that feature’s sample standard deviation sⱼ. A zero standard deviation uses scale 1, leaving a centered zero column.',
      formula: 'q_{ij}=x_{ij}-m_j\\quad\\text{or}\\quad q_{ij}=\\frac{x_{ij}-m_j}{s_j}',
    },
    {
      title: 'Measure joint variation',
      body: 'For each centered point, its outer product is a 2 × 2 matrix of pairwise products. Sum those matrices and divide by n − 1, the sample covariance convention. The diagonal entries are feature variances.',
      formula: 'C=\\frac{1}{n-1}\\sum_iq_iq_i^T=\\begin{bmatrix}a&c\\\\c&d\\end{bmatrix}',
    },
    {
      title: 'Write the variance of a shadow',
      body: 'A unit vector u defines an axis. The dot product tᵢ gives each point’s signed coordinate on it. Since the data are centered, the scores have zero mean. Expanding their squared sum produces the quadratic form.',
      formula: '\\frac{1}{n-1}\\sum_i t_i^2=\\frac{1}{n-1}\\sum_i(u^Tq_i)^2=u^TCu',
    },
    {
      title: 'Find the maximizing direction',
      body: 'Maximize uᵀCu subject to uᵀu = 1. A Lagrange multiplier λ enforces this length constraint. Differentiating the objective minus λ(uᵀu − 1) gives 2Cu − 2λu = 0. Thus the optimal axis is an eigenvector, with variance λ. Choose the largest eigenvalue.',
      formula: 'Cu=\\lambda u,\\qquad \\lambda_{1,2}=\\frac{a+d\\pm\\sqrt{(a-d)^2+4c^2}}{2}',
    },
    {
      title: 'Reconstruct and account for what was lost',
      body: 'Multiply the scalar score by the unit axis to reconstruct a point in the displayed coordinates. To return to original units, multiply by feature scales and add the mean. The leading eigenvalue divided by total variance is the explained fraction.',
      formula:
        '\\tilde q_i=t_iu,\\quad E=\\frac{1}{n}\\sum_i\\|q_i-\\tilde q_i\\|_2^2,\\quad R=\\frac{\\lambda_1}{\\lambda_1+\\lambda_2}',
    },
  ],
  worked: {
    body: 'For points (−1, −1), (0, 0), (1, 1), the mean is zero and sample covariance is [[1, 1], [1, 1]]. Its eigenvalues are 2 and 0. The diagonal unit axis [1/√2, 1/√2] retains all variation and reconstructs every point exactly.',
    formula:
      'C\\begin{bmatrix}1/\\sqrt2\\\\1/\\sqrt2\\end{bmatrix}=2\\begin{bmatrix}1/\\sqrt2\\\\1/\\sqrt2\\end{bmatrix}',
  },
  deeper: [
    {
      title: 'Equal eigenvalues and zero variance',
      body: 'If both eigenvalues are equal, every unit direction captures the same variance; there is no unique leading axis. If all points coincide, both eigenvalues are zero and an explained-variance ratio is undefined. Changing an eigenvector’s sign never changes the projection line or reconstruction.',
    },
    {
      title: 'Why minimizing reconstruction equals maximizing variance',
      body: 'Orthogonal projection splits squared length into retained and perpendicular parts. Total centered variation is fixed, so keeping more leaves less to reconstruct. The n versus n − 1 normalizations explain the factor in this identity.',
      formula: 'E=\\frac{n-1}{n}\\left(\\mathrm{tr}(C)-u^TCu\\right)',
    },
  ],
  library:
    'Scikit-learn PCA centers but does not automatically standardize features. Its explained_variance_ uses n − 1. NumPy’s symmetric eigensolver eigh returns orthogonal eigenvectors. The companion compares the analytical two-dimensional solution with eigh; eigenvector signs may differ.',
  limitations: [
    'High variance can be noise, and low variance can carry predictive signal. PCA does not optimize prediction.',
    'Scaling changes the geometry and may change which axis is principal. Errors before and after standardization have different units.',
    'PCA only represents linear directions and can be influenced by outliers.',
  ],
  recap:
    'Center the cloud, measure covariance, and keep its leading eigenvector. Projection trades dimensions for reconstruction error without using labels.',
  quiz: [
    {
      prompt: 'Does PCA need a target label y?',
      options: [
        'Yes, to find the best classifier',
        'No, it uses only the feature variation',
        'Only for centering',
      ],
      correct: 1,
      explanations: [
        'PCA optimizes variance, not classification accuracy.',
        'Correct. It is an unsupervised method.',
        'Centering uses feature means, not labels.',
      ],
    },
    {
      prompt: 'Why must the candidate projection direction have unit length?',
      options: [
        'Otherwise scaling u can arbitrarily increase uᵀCu',
        'To make all feature values positive',
        'To remove outliers',
      ],
      correct: 0,
      explanations: [
        'Correct. The length constraint makes directions comparable.',
        'Unit length does not determine the signs of the data.',
        'Normalizing an axis does not remove or reduce outliers.',
      ],
    },
    {
      prompt: 'Both covariance eigenvalues are equal. Which leading direction is uniquely best?',
      options: ['The x-axis', 'The y-axis', 'No unique direction'],
      correct: 2,
      explanations: [
        'The x-axis is one possible choice, not a unique optimum.',
        'The y-axis ties with all other unit directions.',
        'Correct. All unit directions have the same projected variance.',
      ],
    },
  ],
};
