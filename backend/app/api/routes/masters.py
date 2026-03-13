from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Query

from app.schemas.schemas import MasterRankingRead
from app.services.master_service import MasterService


master_router = APIRouter(
    prefix="/masters",
    tags=["Masters"],
)


@master_router.get(
    "/ranked",
    response_model=list[MasterRankingRead],
    summary="List masters sorted by ranking score",
    description="Ranks masters by average rating, total number of ratings, and response time.",
)
def get_ranked_masters(
    category_id: Optional[UUID] = None,
    min_avg_rating: Optional[float] = Query(default=None, ge=0, le=5),
):
    service = MasterService()
    return service.get_ranked_masters(
        category_id=category_id,
        min_avg_rating=min_avg_rating,
    )
