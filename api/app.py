from typing import List
from fastapi import FastAPI, HTTPException
from api.config import settings
from api.db import fetch_all
from api.routers.column_router import col_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "*",
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def get_all():
    
    cols , tasks= await fetch_all()
    return {
        "columns":cols,
        "tasks":tasks
    }


app.include_router(col_router)
