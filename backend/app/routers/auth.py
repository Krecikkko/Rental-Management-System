from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app import models, auth, database, i18n

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(request: Request, username: str, password: str, role: str = "tenant", db: Session = Depends(database.get_db)):
    lang = i18n.get_lang(request)
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(status_code=400, detail=i18n.t("errors.user_exists", lang))
    if role not in ["owner", "tenant", "admin"]:
        raise HTTPException(status_code=400, detail=i18n.t("errors.invalid_role", lang))
    hashed_password = auth.get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": i18n.t("messages.register_success", lang)}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.username, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}
