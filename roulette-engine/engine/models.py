"""Tres modelos predictivos; cada uno devuelve un vector de probabilidad (20,) que suma 1.
Índice i corresponde al número i+1."""
import numpy as np

N = 20


def _norm(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=float)
    s = v.sum()
    return v / s if s > 0 else np.full(N, 1.0 / N)


def markov(seq, order: int, alpha: float = 0.5) -> np.ndarray:
    """Cadena de Markov de orden `order` con suavizado de Laplace (alpha).
    Cuenta qué número siguió a cada subsecuencia; si el contexto actual nunca
    apareció se hace back-off al orden inferior (orden 0 = uniforme)."""
    seq = list(seq)
    for k in range(min(order, len(seq) - 1), 0, -1):
        ctx = tuple(seq[-k:])
        counts = np.zeros(N)
        hits = 0
        for i in range(len(seq) - k):
            if tuple(seq[i:i + k]) == ctx:
                counts[seq[i + k] - 1] += 1
                hits += 1
        if hits:
            return _norm(counts + alpha)
    return np.full(N, 1.0 / N)


def recency_frequency(seq, half_life: float = 5.0) -> np.ndarray:
    """Frecuencia con decaimiento exponencial: peso = 0.5^(edad/half_life)."""
    seq = np.asarray(seq)
    age = np.arange(len(seq))[::-1]
    w = 0.5 ** (age / half_life)
    out = np.full(N, 0.5)  # suavizado
    np.add.at(out, seq - 1, w)
    return _norm(out)


def _features(window) -> np.ndarray:
    x = np.zeros(len(window) * N)
    for i, n in enumerate(window):
        x[i * N + n - 1] = 1.0  # one-hot por posición
    return x


def mlp(seq, window: int = 3, hidden: int = 16, epochs: int = 150,
        lr: float = 0.1, l2: float = 1e-3, seed: int = 0) -> np.ndarray:
    """MLP (1 capa oculta tanh + softmax) entrenado on-the-fly con descenso de
    gradiente sobre la muestra actual, en NumPy puro. Semilla fija => determinista."""
    seq = list(seq)
    w = min(window, len(seq) - 1)
    if w < 1:
        return np.full(N, 1.0 / N)
    X = np.array([_features(seq[i:i + w]) for i in range(len(seq) - w)])
    Y = np.zeros((len(X), N))
    for i in range(len(X)):
        Y[i, seq[i + w] - 1] = 1.0
    rng = np.random.default_rng(seed)
    W1 = rng.normal(0, 0.1, (X.shape[1], hidden)); b1 = np.zeros(hidden)
    W2 = rng.normal(0, 0.1, (hidden, N)); b2 = np.zeros(N)
    for _ in range(epochs):
        H = np.tanh(X @ W1 + b1)
        Z = H @ W2 + b2
        P = np.exp(Z - Z.max(1, keepdims=True)); P /= P.sum(1, keepdims=True)
        dZ = (P - Y) / len(X)
        dH = (dZ @ W2.T) * (1 - H ** 2)
        W2 -= lr * (H.T @ dZ + l2 * W2); b2 -= lr * dZ.sum(0)
        W1 -= lr * (X.T @ dH + l2 * W1); b1 -= lr * dH.sum(0)
    x = _features(seq[-w:])
    z = np.tanh(x @ W1 + b1) @ W2 + b2
    p = np.exp(z - z.max())
    return _norm(p)
