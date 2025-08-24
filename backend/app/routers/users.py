# backend/app/routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from typing import List
from app import models, auth, database

# The tag is now "Users" for better clarity
router = APIRouter(prefix="/users", tags=["Users"])

def get_admin_user(current_user: models.User = Depends(auth.get_current_user)) -> models.User:
    """Dependency to ensure the user is an administrator."""
    if current_user.role != models.Roles.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrator access required"
        )
    return current_user

@router.get("/", response_model=List[models.UserRead])
def get_all_users(
    role: str | None = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user) # ZMIANA: Usunięto zależność admina
):
    """
    Get a list of all users.
    - Admins can get all users or filter by any role.
    - Owners can get users with 'owner' or 'tenant' roles.
    - Other roles are denied.
    """
    statement = select(models.User)

    # Sprawdzenie uprawnień
    if current_user.role == models.Roles.ADMIN:
        # Admin może wszystko
        pass
    elif current_user.role == models.Roles.OWNER:
        # Właściciel może widzieć tylko innych właścicieli i najemców
        allowed_roles_to_view = [models.Roles.OWNER, models.Roles.TENANT]
        if role and role not in allowed_roles_to_view:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view owners and tenants.")
        statement = statement.where(models.User.role.in_(allowed_roles_to_view))
    else:
        # Inne role (np. najemca) nie mogą listować użytkowników
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to list users.")

    # Filtrowanie po roli, jeśli została podana
    if role:
        if role not in models.Roles.ALL:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role: {role}")
        statement = statement.where(models.User.role == role)
    
    users = db.exec(statement).all()
    return users


@router.get("/{user_id}", response_model=models.UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Retrieves information about a single user with advanced permission logic."""
    db_user = db.get(models.User, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # A user can view their own profile
    if current_user.id == user_id:
        return db_user
    
    # An administrator can view anyone
    if current_user.role == models.Roles.ADMIN:
        return db_user
    
    # An owner can view tenants in their properties
    if current_user.role == models.Roles.OWNER:
        # We collect the IDs of all tenants assigned to the owner's properties
        owned_tenant_ids = {
            assignment.tenant_id
            for prop in current_user.owned_properties
            for assignment in prop.tenants
        }
        if user_id in owned_tenant_ids:
            return db_user
            
    # In all other cases, deny the request
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN, 
        detail="You do not have permission to view this profile"
    )

@router.post("/", response_model=models.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_create: models.UserCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user) # <-- Creating users is admin-only
):
    """Creates a new user (admin only)."""
    if auth.get_user_by_username(db, user_create.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already registered")
    
    if auth.get_user_by_email(db, user_create.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    
    if user_create.role not in models.Roles.ALL:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified")

    hashed_password = auth.get_password_hash(user_create.password)
    user_data = user_create.model_dump(exclude={"password"})
    new_user = models.User(**user_data, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=models.UserRead)
def update_user(
    user_id: int,
    user_update: models.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Updates user data."""
    db_user = db.get(models.User, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Permission check: only admin or the profile owner
    if db_user.id != current_user.id and current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to edit this user")

    # A non-admin user cannot change their role
    if user_update.role and current_user.role != models.Roles.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only an administrator can change roles")
    
    # Check if the new username is already taken
    if user_update.username and user_update.username != db_user.username:
        if auth.get_user_by_username(db, user_update.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken")

    # Check if the new email is already taken
    if user_update.email and user_update.email != db_user.email:
        if auth.get_user_by_email(db, user_update.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already taken")

    # Update the data
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(get_admin_user)
):
    """Deletes a user (admin only)."""
    user_to_delete = db.get(models.User, user_id)
    if not user_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user_to_delete.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An administrator cannot delete their own account")

    db.delete(user_to_delete)
    db.commit()
    # We return an empty response, which is standard for DELETE operations
    return Response(status_code=status.HTTP_204_NO_CONTENT)