from uuid import UUID

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.schemas import CurrentUser, RatingCreate, RatingRead, RatingSummary
from app.services.rating_service import RatingService


rating_router = APIRouter(
    prefix="/ratings",
    tags=["Ratings"],
)


@rating_router.post(
    "",
    response_model=RatingRead,
    summary="Create a new rating for a master",
    description="Allows a client to submit a score from 1 to 5 and an optional comment.",
)
def create_rating(
    payload: RatingCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    service = RatingService()
    return service.create_rating(payload, current_user)


@rating_router.get(
    "/master/{master_id}",
    response_model=list[RatingRead],
    summary="List ratings for a master",
    description="Returns all ratings for the selected master ordered by newest first.",
)
def get_master_ratings(master_id: UUID):
    service = RatingService()
    return service.get_ratings_for_master(master_id)


@rating_router.get(
    "/master/{master_id}/summary",
    response_model=RatingSummary,
    summary="Get rating summary for a master",
    description="Returns the average score and total number of ratings for the selected master.",
)
def get_master_rating_summary(master_id: UUID):
    service = RatingService()
    return service.get_master_rating_summary(master_id)
