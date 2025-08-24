# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from app import database
from app.routers import (
    properties as properties_router, 
    auth as auth_router, 
    users as users_router, 
    assignments as assignments_router,
    invoices as invoices_router,
    tags as tags_router
)

def create_db_and_tables():
    SQLModel.metadata.create_all(database.engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database and tables...")
    create_db_and_tables()
    yield
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan)

# Dołącz routery
app.include_router(properties_router.router)
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(assignments_router.router)
app.include_router(invoices_router.router)
app.include_router(tags_router.router) # DODANY ROUTER

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)