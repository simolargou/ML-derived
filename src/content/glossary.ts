export const glossary = [
  {
    id: 'vector',
    term: 'Vector',
    symbol: 'x, w',
    lesson: 'vectors',
    definition:
      'An ordered list of numbers. Its dimension is the number of entries. In this course, vectors are columns unless stated otherwise.',
  },
  {
    id: 'dot-product',
    term: 'Dot product',
    symbol: 'wᵀx',
    lesson: 'vectors',
    definition:
      'Multiply matching entries of two equal-length vectors, then add the products. The result is a scalar. Transpose (ᵀ) turns a column into a row.',
  },
  {
    id: 'sum',
    term: 'Summation',
    symbol: 'Σ',
    lesson: 'linear-regression',
    definition:
      'A compact instruction to add terms. Σᵢ₌₁ⁿ aᵢ means a₁ + a₂ + … + aₙ. The index i labels a term; n is the number of terms.',
  },
  {
    id: 'mean',
    term: 'Mean',
    symbol: 'x̄',
    lesson: 'linear-regression',
    definition:
      'Add all values and divide by how many values there are. The sample mean describes the center of the observed values.',
  },
  {
    id: 'residual',
    term: 'Residual',
    symbol: 'rᵢ',
    lesson: 'linear-regression',
    definition:
      'In this notebook, prediction minus observed target: rᵢ = ŷᵢ − yᵢ. Squared residuals do not depend on this sign convention.',
  },
  {
    id: 'derivative',
    term: 'Derivative',
    symbol: 'dJ/dw, ∂J/∂w',
    lesson: 'gradient-descent',
    definition:
      'The local rate of change. For a tiny input change h, the output changes by approximately derivative × h. A partial derivative varies one parameter while keeping others fixed.',
  },
  {
    id: 'gradient',
    term: 'Gradient',
    symbol: '∇J',
    lesson: 'gradient-descent',
    definition:
      'The vector of all partial derivatives. It points toward the steepest local increase in a Euclidean parameter space. Its negative is a descent direction.',
  },
  {
    id: 'chain-rule',
    term: 'Chain rule',
    symbol: 'dL/dx',
    lesson: 'neural-network',
    definition:
      'For a composition L = f(g(x)), multiply the local rates of change: dL/dx = f′(g(x))g′(x). Add contributions when several computational paths depend on x.',
  },
  {
    id: 'probability',
    term: 'Probability',
    symbol: 'p',
    lesson: 'logistic-regression',
    definition:
      'A number between 0 and 1 representing a model’s probability for an event. A model output is an estimate, not a guarantee or automatically a calibrated probability.',
  },
  {
    id: 'logarithm',
    term: 'Natural logarithm',
    symbol: 'log',
    lesson: 'logistic-regression',
    definition:
      'The inverse of the exponential eˣ. It turns products into sums. This course always uses the natural logarithm, with base e.',
  },
  {
    id: 'logit',
    term: 'Logit',
    symbol: 'z',
    lesson: 'logistic-regression',
    definition:
      'The unbounded score before a sigmoid. When 0 < p < 1, z = log(p/(1 − p)), the log odds.',
  },
  {
    id: 'covariance',
    term: 'Covariance',
    symbol: 'C',
    lesson: 'pca',
    definition:
      'A matrix describing joint variation of centered features. Sample covariance divides summed outer products by n − 1. Diagonal entries are sample variances.',
  },
  {
    id: 'eigenvector',
    term: 'Eigenvector',
    symbol: 'u, λ',
    lesson: 'pca',
    definition:
      'A nonzero vector whose direction is preserved by a matrix: Cu = λu. The scalar λ is its eigenvalue. For a covariance matrix, orthogonal eigenvectors describe variance directions.',
  },
  {
    id: 'projection',
    term: 'Projection',
    symbol: 't = uᵀx',
    lesson: 'pca',
    definition:
      'For a unit direction u, the dot product gives a signed coordinate along that direction. Multiplying this score by u reconstructs the component of x along the axis.',
  },
  {
    id: 'norm',
    term: 'Euclidean norm',
    symbol: '‖x‖₂',
    lesson: 'k-means',
    definition:
      'The length of a vector: square every component, add them, and take the square root. Squared Euclidean distance sums squared coordinate differences.',
  },
  {
    id: 'centroid',
    term: 'Centroid',
    symbol: 'μ',
    lesson: 'k-means',
    definition:
      'The coordinate-wise mean of the observations assigned to a cluster. It need not coincide with an observed point.',
  },
  {
    id: 'activation',
    term: 'Activation',
    symbol: 'h',
    lesson: 'neural-network',
    definition:
      'The output of a neuron after its nonlinearity. Here hidden units use tanh(a), which maps a real number into (−1, 1) and has derivative 1 − tanh²(a).',
  },
  {
    id: 'affine',
    term: 'Affine transformation',
    symbol: 'Wx + b',
    lesson: 'neural-network',
    definition:
      'A matrix multiplication followed by a bias. Each row of W forms a weighted sum of inputs. A nonlinearity is needed between layers to go beyond one affine map.',
  },
  {
    id: 'loss',
    term: 'Objective / loss',
    symbol: 'J',
    lesson: 'linear-regression',
    definition:
      'A scalar measuring how well a model fits a chosen criterion. We minimize mean losses for supervised models and a sum of squared distances for K-means.',
  },
] as const;
export const references = [
  {
    title: 'Linear algebra review and reference',
    author: 'Zico Kolter, updated by Chuong Do · Stanford CS229',
    url: 'https://cs229.stanford.edu/section/cs229-linalg.pdf',
    detail: 'Vector products, norms, gradients, least squares, and symmetric eigenproblems.',
  },
  {
    title: 'Principal components analysis notes',
    author: 'Andrew Ng · Stanford CS229',
    url: 'https://cs229.stanford.edu/notes2020spring/cs229-notes10.pdf',
    detail:
      'Projection, variance maximization, and eigenvectors. We explicitly choose sample covariance (n − 1) instead of the 1/n convention in these notes.',
  },
  {
    title: 'The K-means clustering algorithm',
    author: 'Andrew Ng · Stanford CS229',
    url: 'https://cs229.stanford.edu/notes2020spring/cs229-notes7a.pdf',
    detail: 'The alternating minimization derivation and its local-optimum limitation.',
  },
  {
    title: 'LogisticRegression reference',
    author: 'scikit-learn contributors',
    url: 'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html',
    detail:
      'Regularization defaults and current unpenalized-model configuration. Fixed-parameter comparisons avoid differences between fitting algorithms.',
  },
  {
    title: 'Supervised learning',
    author: 'Andrew Ng · Stanford CS229',
    url: 'https://cs229.stanford.edu/summer2023/cs229-notes1.pdf',
    detail:
      'Linear prediction, least squares, optimization, and logistic likelihood. Our MSE uses 1/n; some source derivations use 1/(2n).',
  },
  {
    title: 'Deep learning and backpropagation',
    author: 'Andrew Ng, Kian Katanforoosh, Anand Avati · Stanford CS229',
    url: 'https://cs229.stanford.edu/summer2022/cs229-notes-deep_learning.pdf',
    detail:
      'Forward computation, chain rule, and backpropagation. This app specializes the general method to a 2–2–1 tanh network.',
  },
  {
    title: 'Clustering and principal components',
    author: 'Stanford STATS 202',
    url: 'https://web.stanford.edu/class/stats202/notes/Unsupervised/Unsupervised.html',
    detail: 'Unsupervised learning objectives and alternating centroid/assignment updates.',
  },
  {
    title: 'PCA reference',
    author: 'scikit-learn contributors',
    url: 'https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html',
    detail:
      'Centering, singular-value decomposition, component directions, and explained variance with n − 1 degrees of freedom.',
  },
  {
    title: 'KMeans reference',
    author: 'scikit-learn contributors',
    url: 'https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html',
    detail: 'Inertia, initialization, multiple starts, and practical convergence behavior.',
  },
  {
    title: 'Least-squares solver',
    author: 'NumPy contributors',
    url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html',
    detail: 'Least-squares and minimum-norm solutions when a matrix is rank deficient.',
  },
];
