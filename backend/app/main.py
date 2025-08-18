from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.routers import properties as properties_router, auth as auth_router  # dopasuj nazwę do pliku
from sqlmodel import SQLModel, create_engine

# Initialize the database
SQLModel.metadata.create_all(bind=database.engine)

app = FastAPI()

# Dołącz routery
app.include_router(properties_router.router)
app.include_router(auth_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
