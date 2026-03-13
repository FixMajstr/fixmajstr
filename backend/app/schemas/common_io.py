from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime


class MessageResponse(BaseModel):
    message: str


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


class RefreshResponse(BaseModel):
    user_id: UUID
    access_token: str
    token_type: str
    expires_in: int


class AuthResponse(MessageResponse, RefreshResponse):
    pass


class RegisterResponse(MessageResponse):
    user_id: UUID


class CurrentUser(BaseModel):
    id: UUID
    email: str | None = None
    role: str | None = None
    phone: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None


class InquiryResponse(BaseModel):
    id: UUID
    created_at: datetime
    client_id: UUID
    master_id: UUID
    message: Optional[str] = None
    status: Optional[str] = None
    response: Optional[str] = None
    responded_at: Optional[datetime] = None


class InquiryListResponse(BaseModel):
    inquiries: List[InquiryResponse]
    total: int


class InquiryStatusUpdate(BaseModel):
    status: str


class InquiryResponseUpdate(BaseModel):
    response: str
