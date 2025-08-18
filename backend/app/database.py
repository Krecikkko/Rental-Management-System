from sqlmodel import SQLModel, create_engine, Session

SQLALCHEMY_DATABASE_URL = "sqlite:///./rental.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

def get_db():
    with Session(engine) as session:
        yield session
