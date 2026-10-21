"""Ensamblado ponderado, métricas secundarias y auto-evaluación (backtesting)."""
import math
import numpy as np
from . import models

DEFAULT_WEIGHTS = {"markov2": 0.25, "markov3": 0.2, "recency": 0.25, "mlp": 0.3}


def validate(seq):
    seq = list(seq)
    if not 10 <= len(seq) <= 15:
        raise ValueError("La muestra debe tener entre 10 y 15 números")
    if any(isinstance(n, bool) or not isinstance(n, int) or not 1 <= n <= 20 for n in seq):
        raise ValueError("Todos los números deben ser enteros entre 1 y 20")
    return seq


def shannon_entropy(seq) -> dict:
    counts = np.bincount(np.asarray(seq) - 1, minlength=20)
    p = counts[counts > 0] / len(seq)
    h = float(-(p * np.log2(p)).sum())
    mx = math.log2(20)
    return {"bits": round(h, 4), "max_bits": round(mx, 4), "normalizada": round(h / mx, 4)}


def component_probs(seq, weights=None) -> dict:
    return {
        "markov2": models.markov(seq, 2),
        "markov3": models.markov(seq, 3),
        "recency": models.recency_frequency(seq),
        "mlp": models.mlp(seq),
    }


def ensemble(seq, weights=None):
    weights = weights or DEFAULT_WEIGHTS
    comps = component_probs(seq)
    tw = sum(weights.values())
    p = sum(weights[k] * comps[k] for k in comps) / tw
    return p / p.sum(), comps


def predict(seq, top_k: int = 5, weights=None) -> dict:
    seq = validate(seq)
    p, comps = ensemble(seq, weights)
    order = np.argsort(-p, kind="stable")[:top_k]
    # Acuerdo entre modelos: 1 - dispersión media (0..1) como trazabilidad
    return {
        "muestra": seq,
        "predicciones": [
            {"numero": int(i + 1), "confianza_pct": round(float(p[i]) * 100, 2),
             "por_modelo_pct": {k: round(float(v[i]) * 100, 2) for k, v in comps.items()}}
            for i in order
        ],
        "par_impar": {"par_pct": round(float(p[1::2].sum()) * 100, 2),
                      "impar_pct": round(float(p[0::2].sum()) * 100, 2)},
        "rangos": {"1-10_pct": round(float(p[:10].sum()) * 100, 2),
                   "11-20_pct": round(float(p[10:].sum()) * 100, 2)},
        "entropia": shannon_entropy(seq),
        "pesos": weights or DEFAULT_WEIGHTS,
        "aviso": "Si la fuente es aleatoria uniforme, ningún modelo supera el azar (5% por número).",
    }


def backtest(history, window: int = 12, top_k: int = 5) -> dict:
    """Validación walk-forward: para cada t predice history[t] usando los `window`
    previos. Métricas: top-1, top-k, log-loss, Brier, comparadas con el azar."""
    history = list(history)
    hits1 = hitsk = n = 0
    ll = br = 0.0
    for t in range(window, len(history)):
        p, _ = ensemble(history[t - window:t])
        y = history[t] - 1
        n += 1
        hits1 += int(np.argmax(p) == y)
        hitsk += int(y in np.argsort(-p, kind="stable")[:top_k])
        ll += -math.log(max(p[y], 1e-12))
        e = -p.copy(); e[y] += 1
        br += float((e ** 2).sum())
    if n == 0:
        raise ValueError("Historial insuficiente para backtesting")
    return {"evaluaciones": n, "top1": hits1 / n, f"top{top_k}": hitsk / n,
            "log_loss": ll / n, "brier": br / n,
            "baseline_azar": {"top1": 1 / 20, f"top{top_k}": top_k / 20, "log_loss": math.log(20)}}
