from pydantic import BaseModel, ConfigDict, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthenticatedUser(BaseModel):
    id: UUID
    email: EmailStr
    role: Optional[str] = None


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MasterBase(BaseModel):
    user_id: UUID
    description: Optional[str] = None
    location: str
    avg_rating: float = 0
    response_time: Optional[str] = None


class MasterCreate(MasterBase):
    pass


class MasterUpdate(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    response_time: Optional[str] = None


class MasterRead(MasterBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MasterWithRelations(MasterRead):
    user: Optional[UserRead] = None
    category: Optional[CategoryRead] = None

    model_config = ConfigDict(from_attributes=True)


class MasterRankingRead(MasterRead):
    total_ratings: int = 0
    ranking_score: float


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
    master_id: UUID
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class RatingCreate(RatingBase):
    client_id: Optional[UUID] = None


class RatingUpdate(BaseModel):
    score: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = None


class RatingRead(RatingBase):
    id: UUID
    client_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RatingSummary(BaseModel):
    average_score: float
    total_ratings: int
