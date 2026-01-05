from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
import os
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from models import User
from auth_utils import get_password_hash, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, get_current_user


class CreateUser(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


from uuid import UUID


class UserRead(BaseModel):
    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/signup", response_model=UserRead)
def signup(user: CreateUser, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(user.password)
    db_user = User(email=user.email, name=user.name, hashed_password=hashed)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(login: LoginRequest, response: Response, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == login.username)
    user = session.exec(statement).first()

    if not user or not verify_password(login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # set HttpOnly cookie for secure server-side access
    max_age = int(access_token_expires.total_seconds())
    secure_flag = True if os.getenv("ENV") == "production" else False
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure_flag,
        samesite="lax",
        max_age=max_age,
        path='/'
    )

    # Do not return the token in the response body in production; cookie is used for auth.
    # For local development we include the token in the response so the client can
    # store it and send an Authorization header when cookies are not available
    # (e.g. different origins over HTTP during dev).
    resp = {"msg": "logged in"}
    if os.getenv("ENV") != "production":
        resp["access_token"] = access_token
    return resp


@router.post("/logout")
def logout(response: Response):
    # Explicitly clear the cookie with the same attributes used when setting it.
    # This ensures browsers receive a Set-Cookie that will remove the HttpOnly cookie
    # even when called from a cross-origin request with credentials.
    secure_flag = True if os.getenv("ENV") == "production" else False
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=secure_flag,
        samesite="lax",
        max_age=0,
        path='/'
    )
    return {"msg": "logged out"}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
