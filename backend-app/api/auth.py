from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.database.database import DatabaseService, get_db
from app.models.user import UserCreate, User
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: DatabaseService = Depends(get_db)):
    db_user = db.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    print("!!!!!!!!!", user.password, "!!!!!!!!!! test2")
    hashed_password = get_password_hash(user.password)
    db_user = db.create_user(user=user, hashed_password=hashed_password)
    return db_user


@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: DatabaseService = Depends(get_db)):
    user = db.get_user_by_email(email=form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        subject=user["email"]
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    # With token-based authentication, "logging out" is typically handled
    # on the client-side by deleting the token.
    # This endpoint is provided for completeness.
    return {"message": "Successfully logged out"}
