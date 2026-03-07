from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
    BigInteger,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    master_profile = relationship("Master", back_populates="user", uselist=False)

    client_inquiries = relationship(
        "Inquiry",
        foreign_keys="Inquiry.client_id",
        back_populates="client"
    )

    client_ratings = relationship(
        "Rating",
        foreign_keys="Rating.client_id",
        back_populates="client"
    )


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)

    masters = relationship("Master", back_populates="category")


class Master(Base):
    __tablename__ = "masters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    avg_rating = Column(Float, nullable=True)
    response_time = Column(Text, nullable=True)

    user = relationship("User", back_populates="master_profile")
    category = relationship("Category", back_populates="masters")
    inquiries = relationship("Inquiry", back_populates="master", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="master", cascade="all, delete-orphan")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    master_id = Column(UUID(as_uuid=True), ForeignKey("masters.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String, nullable=True)

    client = relationship("User", foreign_keys=[client_id], back_populates="client_inquiries")
    master = relationship("Master", back_populates="inquiries")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    master_id = Column(UUID(as_uuid=True), ForeignKey("masters.id", ondelete="CASCADE"), nullable=False)
    score = Column(BigInteger, nullable=False)
    comment = Column(Text, nullable=True)

    client = relationship("User", foreign_keys=[client_id], back_populates="client_ratings")
    master = relationship("Master", back_populates="ratings")