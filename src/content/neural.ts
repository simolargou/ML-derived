import type { Lesson } from './lessons';
export const neuralLesson: Lesson = {
  id: 'neural-network',
  title: 'A tiny neural network',
  short: 'Neural networks',
  subtitle: 'Follow a prediction forward. Follow its error back.',
  group: 'Putting it together',
  question:
    'How can a network learn a nonlinear rule, and how does each weight receive its share of the error?',
  experiment: {
    action:
      'Inspect one XOR observation and its calculation, then take One step. Compare its gradients with the full-dataset column.',
    observe:
      'Changing the inspected observation does not train the network. One step averages all four samples before updating every parameter. Watch the selected forward pass change as those shared weights change.',
  },
  prerequisites: ['affine', 'activation', 'chain-rule', 'gradient', 'logit'],
  tags: [
    'σ',
    'δ',
    '∂J',
    '∂ℓ',
    'neural network',
    'backpropagation',
    'XOR',
    'chain rule',
    'tanh',
    'hidden layer',
    'forward pass',
    'W',
    'v',
    'δ',
  ],
  formula: 'h=\\tanh(Wx+b),\\quad z=v^Th+c,\\quad p=\\sigma(z)',
  formulaLabel: 'Two inputs. Two hidden units. One output.',
  symbols: [
    ['x\\in\\mathbb R^2,\\,y\\in\\{0,1\\}', 'One input vector and its observed XOR label.'],
    [
      'W\\in\\mathbb R^{2\\times2},\\,b\\in\\mathbb R^2',
      'Hidden-layer weights and biases. Row j of W belongs to hidden unit j.',
    ],
    ['a,\\,h\\in\\mathbb R^2', 'Hidden preactivations a = Wx + b and activations h = tanh(a).'],
    ['v\\in\\mathbb R^2,\\,c\\in\\mathbb R', 'Output weights and scalar output bias.'],
    ['z,\\,p,\\,\\ell', 'Output logit, sigmoid probability, and one-sample binary cross-entropy.'],
    ['\\delta=p-y,\\,g_j', 'Output logit derivative and hidden preactivation derivative.'],
    ['J,\\,n=4,\\,\\alpha', 'Full-dataset mean loss, XOR observation count, and learning rate.'],
    ['\\theta', 'The nine parameters: four W entries, two hidden biases, two v entries, and c.'],
  ],
  intuition: [
    'XOR outputs 1 when exactly one of its two inputs is 1. A single straight boundary cannot separate its two positive corners from the two negative corners. Two nonlinear hidden units can transform the inputs so the output has a more useful representation.',
    'A forward pass records actual intermediate values. Backpropagation follows the same computation in reverse, multiplying local derivatives along each path. These products tell each parameter how a small change would affect the loss. The diagram shows these computed values.',
  ],
  assumptions:
    'This network has exactly nine parameters, tanh hidden activations, and one sigmoid output. Training uses mean binary cross-entropy over all four deterministic XOR examples. The selected observation displays one-sample derivatives; updates always average all four samples.',
  steps: [
    {
      title: 'Run the hidden affine map',
      body: 'Each hidden unit multiplies a row of W by the input and adds its own bias. Apply tanh separately to both preactivations. Its derivative is 1 − hⱼ², which will be used on the way back.',
      formula:
        'a_j=\\sum_{k=1}^{2}W_{jk}x_k+b_j,\\quad h_j=\\tanh(a_j),\\quad \\frac{dh_j}{da_j}=1-h_j^2',
    },
    {
      title: 'Compute the output and loss',
      body: 'Combine the two hidden activations with v and c, then apply sigmoid. The one-sample loss is the same stable binary cross-entropy used in logistic regression. The label y is fixed, not a trainable parameter.',
      formula: 'z=v_1h_1+v_2h_2+c,\\quad p=\\sigma(z),\\quad\\ell=-y\\log p-(1-y)\\log(1-p)',
    },
    {
      title: 'Start the backward pass at the output',
      body: 'The sigmoid plus cross-entropy derivative simplifies to δ = p − y. The output’s local derivatives are hⱼ for vⱼ, 1 for c, and vⱼ for hⱼ. Multiply each by δ.',
      formula:
        '\\delta=\\frac{\\partial\\ell}{\\partial z}=p-y,\\quad\\frac{\\partial\\ell}{\\partial v_j}=\\delta h_j,\\quad\\frac{\\partial\\ell}{\\partial c}=\\delta',
    },
    {
      title: 'Pass through each hidden activation',
      body: 'The path from hidden preactivation to loss passes through tanh and the output weight. Multiply these local rates by δ. The resulting gⱼ is the sensitivity of loss to aⱼ.',
      formula: 'g_j=\\frac{\\partial\\ell}{\\partial a_j}=\\delta v_j(1-h_j^2)',
    },
    {
      title: 'Reach the first-layer parameters',
      body: 'The derivative of aⱼ with respect to Wⱼₖ is xₖ, and with respect to bⱼ is 1. Multiply gⱼ by these rates. A zero input gives a zero one-sample gradient for that input’s weight, but other samples can still update it.',
      formula:
        '\\frac{\\partial\\ell}{\\partial W_{jk}}=g_jx_k,\\quad\\frac{\\partial\\ell}{\\partial b_j}=g_j',
    },
    {
      title: 'Average, then update every parameter',
      body: 'Compute those nine derivatives for each XOR observation. Average them to form the full-dataset gradient. Subtract the learning rate times that mean gradient, updating all nine parameters simultaneously.',
      formula:
        'J=\\frac{1}{4}\\sum_{i=1}^{4}\\ell_i,\\qquad\\theta_{t+1}=\\theta_t-\\alpha\\frac{1}{4}\\sum_i\\nabla_\\theta\\ell_i',
    },
  ],
  worked: {
    body: 'At the reproducible initialization and input [0, 1], hidden preactivations are −0.6 and 0.9. Their tanh activations are approximately −0.537 and 0.716. Output weights [0.8, −1.1] and bias 0.1 produce z ≈ −1.118 and p ≈ 0.246. Since y = 1, δ ≈ −0.754.',
    formula: 'z=0.8\\tanh(-0.6)-1.1\\tanh(0.9)+0.1\\approx-1.118',
  },
  deeper: [
    {
      title: 'Why a nonlinear hidden layer matters',
      body: 'Two affine maps without a nonlinear activation compose into a single affine map. Tanh changes that: different inputs have different local derivatives, allowing curved decision patterns. The model has enough capacity for XOR, but optimization is still a separate problem.',
    },
    {
      title: 'Gradient checking is a diagnostic',
      body: 'For each parameter θⱼ, perturb only that entry by a small ε and compare the central difference with backpropagation. This is slower than backpropagation but useful in tests. ε = 10⁻⁵ with a tolerance near 10⁻⁶ works for the moderate values in our tests.',
      formula:
        '\\frac{\\partial J}{\\partial\\theta_j}\\approx\\frac{J(\\theta+\\epsilon e_j)-J(\\theta-\\epsilon e_j)}{2\\epsilon}',
    },
  ],
  library:
    'The core Python example computes each derivative explicitly. An optional PyTorch comparison builds the same computation from fixed parameters and compares autograd gradients against the manual full-dataset gradient. PyTorch is not required to run the core example.',
  limitations: [
    'A tiny training loss on four XOR points is an illustration of fitting, not an empirical generalization claim.',
    'Tanh derivatives shrink for large preactivations. This can slow learning.',
    'The objective is nonconvex. Initialization and learning rate matter; a bounded session is not a promise of convergence.',
  ],
  recap:
    'A network is a composition of simple operations. Backpropagation reuses forward values and the chain rule to compute exact derivatives of that composition.',
  quiz: [
    {
      prompt: 'Which gradient does the training step use?',
      options: [
        'Only the selected observation’s gradient',
        'The mean gradient of all four XOR observations',
        'The gradient at the initial parameters',
      ],
      correct: 1,
      explanations: [
        'The selected sample is for inspection; training is full-batch.',
        'Correct. One-sample gradients are averaged before every update.',
        'The gradient is recomputed at the current parameters before every update.',
      ],
    },
    {
      prompt: 'Why insert tanh between two affine layers?',
      options: [
        'To allow nonlinear representations',
        'To make the loss always zero',
        'To avoid needing gradients',
      ],
      correct: 0,
      explanations: [
        'Correct. Without a nonlinearity, the composition remains affine.',
        'A nonlinearity gives capacity, not a guarantee of fitting.',
        'We still need derivatives to train the parameters.',
      ],
    },
    {
      prompt: 'If x₁ = 0, what is the one-sample derivative for Wⱼ₁?',
      options: ['Always 1', 'gⱼ', '0'],
      correct: 2,
      explanations: [
        'The derivative is gⱼx₁, so multiplying by zero gives zero.',
        'This omits the local derivative x₁ of the affine map.',
        'Correct. gⱼ × 0 = 0. Other samples may still contribute to the full gradient.',
      ],
    },
  ],
};
