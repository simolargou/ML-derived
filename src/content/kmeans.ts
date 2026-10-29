import type { Lesson } from './lessons';
export const kmeansLesson: Lesson = {
  id: 'k-means',
  title: 'K-means clustering',
  short: 'K-means clustering',
  subtitle: 'Alternate between belonging and finding the center.',
  group: 'Unsupervised learning',
  question: 'How can we summarize a set of points with k representative centers?',
  experiment: {
    action:
      'Alternate Assign points and Update centroids. Watch J after each phase, then compare the three initializations.',
    observe:
      'Assignment changes cluster membership with centers fixed. Updating moves each center to its members’ mean. Both phases use the same squared-distance sum; comparisons keep the data and k fixed.',
  },
  prerequisites: ['norm', 'mean', 'centroid'],
  tags: [
    'μ',
    '‖x−μ‖²',
    'K-means',
    'centroid',
    'clustering',
    'Euclidean',
    'assignment',
    'objective',
    'μ',
    'local optimum',
  ],
  formula: 'J=\\sum_{i=1}^{n}\\|x_i-\\mu_{c_i}\\|_2^2',
  formulaLabel: 'Nearby points, shared centers',
  symbols: [
    ['n,\\,k', 'Number of observations and chosen number of clusters.'],
    ['x_i\\in\\mathbb R^2', 'Observation i with two real coordinates.'],
    ['\\mu_j\\in\\mathbb R^2', 'Centroid of cluster j, for j = 1, …, k.'],
    ['c_i\\in\\{1,\\ldots,k\\}', 'Index of the cluster assigned to observation i.'],
    ['S_j,\\,|S_j|', 'Set of indices assigned to cluster j, and its size.'],
    ['\\|\\cdot\\|_2^2,\\,J', 'Squared Euclidean length and the within-cluster sum of squares.'],
    ['\\arg\\min', 'The index or parameter value attaining a minimum.'],
  ],
  intuition: [
    'Place k flags in a point cloud. Assign every point to its nearest flag, then move each flag to the average of its assigned points. Repeat. Each phase improves, or preserves, one part of the same objective while holding the other part fixed.',
    'The clusters are groups under this distance rule. They do not automatically represent meaningful real-world categories. Different starting flags can settle at different solutions, so the lab lets you compare deterministic initializations.',
  ],
  assumptions:
    'The lab uses two-feature data and squared Euclidean distances in the displayed units. k is fixed within a run. J is a sum, with no division by n. Equal distances choose the lowest cluster index. Empty clusters keep their previous centroid.',
  steps: [
    {
      title: 'Initialize k centers',
      body: 'Our reproducible farthest-first rule selects the observation at the chosen start index, then repeatedly selects the point farthest from its nearest existing center. This is deterministic, and is distinct from probabilistic k-means++.',
      formula:
        '\\mu_1=x_{\\mathrm{start}},\\quad \\mu_{j+1}=\\arg\\max_{x_i}\\min_{\\ell\\le j}\\|x_i-\\mu_\\ell\\|_2^2',
    },
    {
      title: 'Assign with centers fixed',
      body: 'Compute every point’s squared distance to each center. Give it the cluster index with the smallest distance. Since points contribute independently to J, choosing the smallest contribution cannot increase the objective.',
      formula: 'c_i=\\arg\\min_{j\\in\\{1,\\ldots,k\\}}\\|x_i-\\mu_j\\|_2^2',
    },
    {
      title: 'Differentiate with assignments fixed',
      body: 'For one cluster, sum squared coordinate differences. Differentiating with respect to the centroid gives a vector sum of 2(μⱼ − xᵢ). Set it to zero, move the data sum to the other side, and divide by the cluster size.',
      formula:
        '2\\sum_{i\\in S_j}(\\mu_j-x_i)=0\\quad\\Rightarrow\\quad\\mu_j=\\frac{1}{|S_j|}\\sum_{i\\in S_j}x_i',
    },
    {
      title: 'Repeat the two phases',
      body: 'Reassign points using the new centers, then compute means again. Stop when assignments and centers no longer change, allowing for floating-point tolerance. Neither phase increases J in the ordinary nonempty case.',
      formula:
        'J_{\\mathrm{after\\ assignment}}\\le J_{\\mathrm{before}},\\quad J_{\\mathrm{after\\ update}}\\le J_{\\mathrm{after\\ assignment}}',
    },
  ],
  worked: {
    body: 'For points (0, 0), (2, 0), (8, 0), (10, 0), initialize at (0, 0) and (8, 0). Assignment forms the two nearby pairs. Their means are (1, 0) and (9, 0); updating centers reduces J from 8 to 4.',
    formula: 'J_{\\mathrm{new}}=(0-1)^2+(2-1)^2+(8-9)^2+(10-9)^2=4',
  },
  deeper: [
    {
      title: 'Our empty-cluster policy',
      body: 'The mean of an empty set is undefined. We retain the previous center and display the empty cluster index. Its current contribution is zero. This policy preserves the current fixed-assignment objective, but can leave fewer than k occupied groups. Other implementations may reseed or relocate centers.',
    },
    {
      title: 'Why try more than one initialization?',
      body: 'The joint optimization over assignments and centers is not convex. Alternating exact solutions for each part can stop at a local optimum. Multiple starts give candidate solutions to compare; a lower J on the same data and k is preferable under this objective, but not proof of semantic usefulness.',
    },
  ],
  library:
    'Scikit-learn KMeans calls the squared-distance objective inertia_. Its defaults use k-means++ and may use several starts. For comparison, the Python companion passes explicit initial centers, n_init=1, and algorithm="lloyd". Empty-cluster policies and stopping criteria can still differ.',
  limitations: [
    'Changing feature units changes Euclidean distances. Standardization should reflect the task.',
    'Outliers can drag means far from dense regions. Curved, elongated, or unequal-density groups can be poorly represented.',
    'Increasing k usually lowers training J. This alone does not tell you the appropriate number of clusters.',
  ],
  recap:
    'Fix the centers and choose assignments. Fix assignments and take means. Both phases optimize the same squared-distance objective, but the starting centers matter.',
  quiz: [
    {
      prompt: 'With assignments fixed, where should a nonempty cluster’s center move?',
      options: ['To the mean of its members', 'To its farthest point', 'To the origin'],
      correct: 0,
      explanations: [
        'Correct. The mean minimizes the sum of squared Euclidean distances.',
        'Moving to the farthest point generally increases the objective.',
        'The origin has no special role unless it equals the cluster mean.',
      ],
    },
    {
      prompt: 'What does this app do with an empty cluster?',
      options: [
        'Divides by zero',
        'Keeps the previous center and reports it',
        'Deletes a random point',
      ],
      correct: 1,
      explanations: [
        'The mean is undefined, so division is avoided.',
        'Correct. This explicit policy leaves its current objective contribution at zero.',
        'The observations are not altered to resolve an empty cluster.',
      ],
    },
    {
      prompt: 'Does a lower K-means objective prove the groups are real categories?',
      options: ['Yes', 'Only with k = 3', 'No'],
      correct: 2,
      explanations: [
        'The objective measures distances, not real-world meaning.',
        'The number of clusters cannot certify their interpretation.',
        'Correct. Clustering describes a chosen geometry; domain interpretation needs additional evidence.',
      ],
    },
  ],
};
