# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from app import database
from app.routers import properties as properties_router, auth as auth_router

def create_db_and_tables():
    SQLModel.metadata.create_all(database.engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wykonuje się przy starcie aplikacji
    print("Creating database and tables...")
    create_db_and_tables()
    yield
    # Wykonuje się przy zamknięciu aplikacji (można tu dodać logikę czyszczenia)
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan)

# Dołącz routery
app.include_router(properties_router.router)
app.include_router(auth_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Upewnij się, że ten port jest poprawny
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)