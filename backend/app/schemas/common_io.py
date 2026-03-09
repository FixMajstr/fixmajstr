from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ErrorResponse(BaseModel):
    detail: str


class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(UserCreate):
    password: str


class AuthResponse(BaseModel):
    message: str
    user_id: UUID
    access_token: str
    token_type: str
    expires_in: int


class RegisterResponse(BaseModel):
    message: str
    user_id: UUID


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_id: UUID


class LogoutResponse(BaseModel):
    message: str


class CurrentUser(BaseModel):
    id: UUID
    email: str | None = None
    role: str | None = None
