from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from . import models
from . import database, auth, i18n

# Initialize the database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(request: Request, username: str, password: str, role: str = "tenant", db: Session = Depends(auth.get_db)):
    lang = i18n.get_lang(request)

    if auth.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail=i18n.t("errors.user_exists", lang))
    if role not in ["owner", "tenant"]:
        raise HTTPException(status_code=400, detail=i18n.t("errors.invalid_role", lang))

    hashed_password = auth.get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": i18n.t("messages.register_success", lang, role=role)}

@app.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    lang = i18n.get_lang(request)

    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=i18n.t("errors.invalid_credentials", lang))

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def read_users_me(request: Request, current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "role": current_user.role}
