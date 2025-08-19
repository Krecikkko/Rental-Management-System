# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app import models, auth, database, i18n

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=models.UserRead)
def register(request: Request, user_create: models.UserCreate, db: Session = Depends(database.get_db)):
    lang = i18n.get_lang(request)

    if auth.get_user_by_username(db, user_create.username):
        raise HTTPException(status_code=400, detail=i18n.t("errors.user_exists", lang))
    if user_create.role not in models.Roles.ALL:
        raise HTTPException(status_code=400, detail=i18n.t("errors.invalid_role", lang))

    hashed_password = auth.get_password_hash(user_create.password)
    # Tworzymy słownik z danymi użytkownika, aby bezpiecznie przekazać go do modelu
    user_data = user_create.model_dump(exclude={"password"})
    new_user = models.User(**user_data, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ... (login, /me, change-password działają podobnie, ale używają nowych modeli)
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=models.UserRead)
def read_user_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user