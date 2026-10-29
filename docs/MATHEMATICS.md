# Mathematical conventions

The website and Python companions use the same objectives and feature ordering. JavaScript uses IEEE 754 double precision. Displayed rounding is separate from computation.

## Notation and dimensions

Vectors are columns. Subscript i identifies an observation, and j identifies a feature or hidden unit. A superscript T denotes transpose. A hat denotes a prediction. The bias is separate from the weights unless a matrix formulation explicitly adds a column of ones.

For regression, x, y, w, and b are scalars for each observation. Logistic regression has two features, X of shape n × 2, w of shape 2, a scalar bias, and binary targets. PCA and K-means use two-dimensional observations without targets.

The neural network has W of shape 2 × 2, hidden bias b of shape 2, output weights v of shape 2, and scalar output bias c. Parameter order is W11, W12, W21, W22, b1, b2, v1, v2, c. Hidden activations use tanh; the output uses sigmoid.

## Objectives

- Regression defines residual as prediction minus target: r_i = wx_i + b − y_i. J is the mean of r_i², using 1/n. Its derivatives therefore contain 2/n.
- The gradient-descent contour matrix is A = [[mean(x²), mean(x)], [mean(x), 1]]. Its Hessian is H = 2A. The contours and parameter updates use the same dataset and loss.
- Logistic regression and the network minimize mean negative binary log likelihood. The scalar loss is max(z, 0) − yz + log1p(exp(−abs(z))). Sigmoid uses separate sign branches. These choices avoid exponentiating large positive values and taking log(0).
- PCA centers features and uses sample covariance, divided by n − 1. Optional standardization uses the sample standard deviation as well. Projection variance uses n − 1; reconstruction error is a mean squared Euclidean distance, divided by n. These quantities differ by the documented factor (n − 1)/n.
- K-means uses a sum of squared distances, without division by n. Each assignment and centroid update acts on this same objective.

The classification rule is p ≥ threshold. Changing the threshold does not update probabilities or weights. Precision and recall are null, displayed as Undefined, when their respective denominators are zero.

## Degenerate cases and limits

A zero vector has dot product zero and no angle. The application does not calculate an angle by dividing by its zero norm.

Exactly constant regression inputs cannot identify a unique slope and intercept. The selected convention is w = 0 and b = mean(y). Small but varying inputs are not treated as constant just because their units are small. If centered squared differences underflow to zero, the same fallback is used. Extremely ill-conditioned fits remain limited by floating-point arithmetic. Fitted parameters outside the lab's magnitude limit are reported rather than silently clipped. The matrix explanation uses the pseudoinverse and does not assume XᵀX is invertible.

PCA requires at least two observations. A zero-variance feature is centered and uses scale 1 when standardization is enabled. Total variance zero makes the explained-variance ratio undefined. Eigenvalue equality uses a relative tolerance of 10⁻¹² times the covariance trace, so changing feature units alone does not turn an anisotropic cloud into an equal-eigenvalue case. Either sign of an eigenvector represents the same line.

K-means ties choose the first cluster index. Farthest-first initialization is deterministic, not probabilistic k-means++. Start indices wrap modulo the number of observations. Empty clusters keep their old centers and are reported; fewer than k clusters may remain occupied. Comparing starts holds the data and k fixed.

Gradient descent uses simultaneous updates. A run stops after 250 steps, gradient norm below 10⁻⁶, or a proposed non-finite/excessive update (loss or parameter magnitude at least 10¹²). The last valid state remains visible. A fixed contour window may not contain a divergent path; the values are not clipped to that window. The gradient history displays log₁₀(1 + loss), while the numerical MSE readout retains the original loss. Zero loss therefore remains finite on the trace. For the quadratic, the constant-rate stability boundary is 2/λmax(H). Presets use 30%, 98%, and 130% of that boundary.

Network training averages all four XOR sample gradients before every update. The selected sample is for inspection only. Each run is bounded at 1,000 steps. Edited or trained parameters must remain finite and within ±100. The trace retains the latest 2,000 steps and shows their correct iteration indices.

Shared-state parsing rejects non-finite values, wrong types, unknown fields, out-of-range controls, oversized arrays, and JSON larger than 12,000 characters. At most 40 points are accepted, with coordinates in [−10, 10]. Scalar regression parameters are bounded at ±10⁶. Other weight controls are bounded at ±10. The URL format is an inspectable query string, not a private data store.

## Numerical checks

Central finite differences use h = 10⁻⁵ for moderate test inputs. A comparison at roughly six decimal places allows truncation and floating-point cancellation error; it does not require exact binary equality. Exact worked results and geometric identities use tighter tolerances where appropriate.

Tests cover regression and logistic gradients, all nine neural-network gradients for individual samples and their average, a known least-squares solution, extreme logits, threshold metrics, PCA eigenpairs and reconstruction, K-means objective descent without empty-cluster intervention, and shared-state validation.

The Python checker also runs each companion script with optional libraries disabled. Optional library comparisons are readable examples, not a claim that every library combination was exercised.
