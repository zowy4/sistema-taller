from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from . import ensemble

app = FastAPI(title="Motor predictivo 1-20")


class Muestra(BaseModel):
    numeros: List[int]


class Historial(BaseModel):
    historial: List[int]
    ventana: int = 12


@app.post("/predict")
def predict(m: Muestra):
    try:
        return ensemble.predict(m.numeros)
    except ValueError as e:
        raise HTTPException(422, str(e))


@app.post("/backtest")
def backtest(h: Historial):
    try:
        return ensemble.backtest(h.historial, h.ventana)
    except ValueError as e:
        raise HTTPException(422, str(e))
