# Motor predictivo para secuencias 1-20

## Arquitectura
```
JSON (10-15 nums) -> validate -> +-> Markov orden 2 (Laplace, back-off) --+
                                 +-> Markov orden 3                      |
                                 +-> Frecuencia con decaimiento exp.     +-> ensemble (media ponderada)
                                 +-> MLP NumPy (one-hot, tanh, softmax)  |        |
                                                                          v        v
                                                       Top-5 + confianza, par/impar, rangos, entropía Shannon
```
Cada modelo emite un vector de probabilidad de 20 elementos; el ensamble los combina con pesos
(`DEFAULT_WEIGHTS` en `engine/ensemble.py`) y la respuesta incluye la probabilidad de cada modelo (trazabilidad).
Se eligió Python/NumPy puro: el MLP es diminuto, no necesita TensorFlow.js.

## Evaluación
`ensemble.backtest(historial, ventana)` hace validación walk-forward (sin fuga de datos) y reporta top-1, top-5,
log-loss y Brier frente al azar (5 %, 25 %, ln 20). Úsese con datos históricos reales para ajustar pesos.

**Aviso honesto:** si los números son aleatorios independientes (ruleta justa), ninguna técnica puede superar
el azar de forma sostenida; el backtest sirve precisamente para comprobarlo. No hay "máxima precisión" garantizada.

## Despliegue y pruebas
```
cd roulette-engine && pip install -r requirements.txt
pytest
uvicorn engine.api:app --port 8000
curl -X POST localhost:8000/predict -H 'content-type: application/json' \
  -d '{"numeros":[3,7,7,12,3,7,19,3,7,7,12,3]}'
```
