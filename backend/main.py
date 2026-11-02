
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, memories, stats
from database import engine, Base
import models

app = FastAPI(title="AFTERGLOW API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Welcome to AFTERGLOW!"}


app.include_router(memories.router)
app.include_router(stats.router)
app.include_router(auth.router)
