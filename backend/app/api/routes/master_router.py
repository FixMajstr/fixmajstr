from fastapi import APIRouter, Query
from uuid import UUID
from typing import Optional

from app.services.master_service import MasterService
from app.schemas import (
    MasterSearchParams,
    MasterListResponse,
    MasterDetailResponse,
)

master_router = APIRouter(prefix="/masters", tags=["Masters"])


@master_router.get(
    "/search",
    response_model=MasterListResponse,
    summary="Search masters",
    description=(
        "Search and filter the list of masters (mojstri). "
        "Supports free-text search across name and description, "
        "filtering by service category, location, and minimum rating. "
        "Results are sorted by rating (descending) and paginated."
    ),
    responses={
        200: {
            "description": "Paginated list of masters matching the filters.",
            "content": {
                "application/json": {
                    "example": {
                        "masters": [
                            {
                                "id": "a1b2c3d4-0000-0000-0000-000000000001",
                                "user_id": "a1b2c3d4-0000-0000-0000-000000000002",
                                "full_name": "Janez Novak",
                                "description": "Izkusen vodovodar z 10-letnimi izkusnjami.",
                                "location": "Ljubljana",
                                "avg_rating": 4.8,
                                "response_time": "2h",
                                "avatar_url": None,
                                "services": ["Vodovod", "Ogrevanje"],
                            }
                        ],
                        "total": 1,
                        "limit": 20,
                        "offset": 0,
                    }
                }
            },
        },
    },
)
def search_masters(
    query: Optional[str] = Query(
        None,
        description="Free-text search across master name and description.",
        examples=["vodovodar"],
    ),
    category: Optional[str] = Query(
        None,
        description="Filter by service category name (partial match).",
        examples=["Vodovod"],
    ),
    location: Optional[str] = Query(
        None,
        description="Filter by location (partial match).",
        examples=["Ljubljana"],
    ),
    min_rating: Optional[float] = Query(
        None,
        ge=0,
        le=5,
        description="Minimum average rating (0-5).",
        examples=[4.0],
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
        description="Number of results per page.",
    ),
    offset: int = Query(
        0,
        ge=0,
        description="Number of results to skip (for pagination).",
    ),
):
    service = MasterService()
    params = MasterSearchParams(
        query=query,
        category=category,
        location=location,
        min_rating=min_rating,
        limit=limit,
        offset=offset,
    )
    return service.search_masters(params)


@master_router.get(
    "/{master_id}",
    response_model=MasterDetailResponse,
    summary="Get master detail",
    description=(
        "Get full profile information for a single master, "
        "including contact details and list of services offered."
    ),
    responses={
        200: {"description": "Master detail with services."},
        404: {"description": "Master not found."},
    },
)
def get_master_detail(master_id: UUID):
    service = MasterService()
    return service.get_master_detail(master_id)
