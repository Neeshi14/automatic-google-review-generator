import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, hash_password, make_user_public, verify_password
from app.database import get_db
from app.models import AuthSession, User
from app.schemas import AuthRequest, AuthResponse, SignupRequest, UserPublic


router = APIRouter(prefix="/api/auth", tags=["auth"])


def create_auth_response(db: Session, user: User) -> AuthResponse:
    auth_session = AuthSession(user_id=user.id, token=secrets.token_urlsafe(40))
    db.add(auth_session)
    db.commit()
    return AuthResponse(token=auth_session.token, user=make_user_public(db, user))


@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.scalar(select(User.id).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_auth_response(db, user)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return create_auth_response(db, user)


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserPublic:
    return make_user_public(db, current_user)
