from __future__ import annotations

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class Healthcheck(BaseModel):
    id: int
    message: Optional[str] = None


class Services(BaseModel):
    id: UUID
    name: str


class Masters(BaseModel):
    id: UUID
    user_id: UUID
    description: Optional[str] = None
    location: str
    avg_rating: float = '0'
    response_time: Optional[str] = None


class Inquiries(BaseModel):
    id: UUID
    created_at: datetime
    client_id: UUID
    master_id: UUID
    message: Optional[str] = None
    status: Optional[str] = None


class MasterServices(BaseModel):
    id: UUID
    master_id: UUID
    service_id: UUID


class Ratings(BaseModel):
    id: UUID
    created_at: datetime
    client_id: UUID
    master_id: UUID
    score: int
    comment: Optional[str] = None
