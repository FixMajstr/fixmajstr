from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass

class UserRegister(UserCreate):
    password: str

class UserRead(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MasterBase(BaseModel):
    user_id: UUID
    category_id: Optional[UUID] = None
    description: Optional[str] = None
    location: Optional[str] = None
    avg_rating: Optional[float] = None
    response_time: Optional[str] = None


class MasterCreate(MasterBase):
    pass


class MasterUpdate(BaseModel):
    category_id: Optional[UUID] = None
    description: Optional[str] = None
    location: Optional[str] = None
    avg_rating: Optional[float] = None
    response_time: Optional[str] = None


class MasterRead(MasterBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MasterWithRelations(MasterRead):
    user: Optional[UserRead] = None
    category: Optional[CategoryRead] = None

    model_config = ConfigDict(from_attributes=True)



class InquiryBase(BaseModel):
    client_id: UUID
    master_id: UUID
    message: Optional[str] = None
    status: Optional[str] = None


class InquiryCreate(InquiryBase):
    pass


class InquiryUpdate(BaseModel):
    message: Optional[str] = None
    status: Optional[str] = None


class InquiryRead(InquiryBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class RatingBase(BaseModel):
    client_id: UUID
    master_id: UUID
    score: int
    comment: Optional[str] = None


class RatingCreate(RatingBase):
    pass


class RatingUpdate(BaseModel):
    score: Optional[int] = None
    comment: Optional[str] = None


class RatingRead(RatingBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)