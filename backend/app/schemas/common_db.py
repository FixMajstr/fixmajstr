<<<<<<< HEAD:backend/app/schemas/common_db.py
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from .common_io import UserBase
=======
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
>>>>>>> 29b7b6a (FM-91/implementacija-sistema-ocen):backend/app/schemas/schemas.py


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
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class RatingCreate(RatingBase):
    pass


class RatingUpdate(BaseModel):
    score: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = None


class RatingRead(RatingBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
<<<<<<< HEAD:backend/app/schemas/common_db.py
=======


class RatingSummary(BaseModel):
    average_score: float
    total_ratings: int
>>>>>>> 29b7b6a (FM-91/implementacija-sistema-ocen):backend/app/schemas/schemas.py
