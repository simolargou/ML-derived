"""Check the downloadable examples without installing optional libraries."""
import importlib.util
import math
from pathlib import Path
import subprocess
import sys
import unittest

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "src" / "python"


def load(name):
    spec = importlib.util.spec_from_file_location(name, EXAMPLES / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class PythonExamples(unittest.TestCase):
    def test_every_example_runs_in_isolation(self):
        for example in sorted(EXAMPLES.glob("*.py")):
            with self.subTest(example=example.name):
                result = subprocess.run(
                    [sys.executable, "-I", "-S", str(example)],
                    capture_output=True, text=True, timeout=20, check=False,
                )
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_vectors_and_zero_direction(self):
        module = load("vectors")
        self.assertEqual(module.dot([2, -1], [3, 4]), 2)
        self.assertIsNone(module.angle([0, 0], [1, 2]))

    def test_regression_worked_example_and_small_scale(self):
        module = load("linear-regression")
        self.assertEqual(module.fit([(1, 2), (2, 3)]), (1, 1))
        self.assertEqual(module.loss_and_gradient([(1, 2), (2, 3)], 1, 0), (1, -3, -2))
        self.assertEqual(module.fit([(.1, 1), (.1, 2), (.1, 3)]), (0, 2))
        w, b = module.fit([(1e-8, 2e-8), (2e-8, 4e-8), (3e-8, 6e-8)])
        self.assertAlmostEqual(w, 2, places=12)
        self.assertAlmostEqual(b, 0, places=12)

    def test_gradient_descent_update_and_safety(self):
        module = load("gradient-descent")
        w, b, history = module.train([(1, 2), (2, 3)], 1, 0, .1, 1)
        self.assertAlmostEqual(w, 1.3, places=12)
        self.assertAlmostEqual(b, .2, places=12)
        self.assertAlmostEqual(history[0], .145, places=12)
        with self.assertRaises(ArithmeticError):
            module.train([(1, 2), (2, 3)], 1e10, 1e10, 2, 1)

    def test_stable_logistic_loss_and_threshold(self):
        module = load("logistic-regression")
        for z in [-1000, 0, 1000]:
            self.assertTrue(math.isfinite(module.sigmoid(z)))
            for y in [0, 1]:
                self.assertTrue(math.isfinite(module.binary_loss(z, y)))
        metrics = module.metrics(module.DATA, [1, 1], 0, 1)
        self.assertIsNone(metrics["precision"])
        loss, gradient = module.evaluate(module.DATA, [1, 1], 0)
        self.assertAlmostEqual(loss, .2494122142365398, places=12)
        self.assertAlmostEqual(gradient[2], -.018894621022128577, places=12)

    def test_sample_pca_and_degenerate_clouds(self):
        module = load("pca")
        result = module.pca([(-1, -1), (0, 0), (1, 1)])
        self.assertEqual(result["values"], [2, 0])
        self.assertAlmostEqual(result["error"], 0, places=12)
        self.assertIsNone(module.pca([(2, 2), (2, 2)], True)["explained"])
        self.assertFalse(module.pca([(-1e-8, 0), (0, 0), (1e-8, 0)])["non_unique"])

    def test_kmeans_example_empty_cluster_and_descent(self):
        module = load("k-means")
        centers, labels, loss = module.fit([(0, 0), (2, 0), (8, 0), (10, 0)], 2)
        self.assertEqual(centers, [(1, 0), (9, 0)])
        self.assertEqual(labels, [0, 0, 1, 1])
        self.assertEqual(loss, 4)
        self.assertEqual(module.update([(0, 0)], [(0, 0), (8, 8)], [0]), [(0, 0), (8, 8)])

    def test_manual_neural_gradients(self):
        module = load("neural-network")
        theta = module.INITIAL[:]
        _, gradient = module.evaluate(theta)
        epsilon = 1e-5
        # Finite differences are approximate; six decimal places suit O(1) values.
        for j in range(9):
            plus, minus = theta[:], theta[:]
            plus[j] += epsilon
            minus[j] -= epsilon
            numerical = (module.evaluate(plus)[0] - module.evaluate(minus)[0]) / (2 * epsilon)
            self.assertAlmostEqual(gradient[j], numerical, places=6)


if __name__ == "__main__":
    unittest.main(verbosity=2)
