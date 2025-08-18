from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app import models, auth, database, i18n

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(request: Request, username: str, password: str, role: str = "tenant", db: Session = Depends(database.get_db)):
    # Get current language
    lang = i18n.get_lang(request)

    if auth.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail=i18n.t("errors.user_exists", lang))
    if role not in models.Roles.ALL:
        raise HTTPException(status_code=400, detail=i18n.t("errors.invalid_role", lang))

    hashed_password = auth.get_password_hash(password)
    new_user = models.User(username=username, hashed_password=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": i18n.t("messages.register_success", lang, role=role)}

@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    lang = i18n.get_lang(request)

    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=i18n.t("errors.invalid_credentials", lang))

    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_user_me(request: Request, current_user: models.User = Depends(auth.get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

@router.put("/change-password")
def change_password(
    request: Request,
    new_password: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    lang = i18n.get_lang(request)

    if not new_password:
        raise HTTPException(status_code=400, detail=i18n.t("errors.empty_password", lang))
    
    hashed_password = auth.get_password_hash(new_password)
    current_user.hashed_password = hashed_password
    db.commit()
    return {"message": i18n.t("messages.password_changed", lang)}
