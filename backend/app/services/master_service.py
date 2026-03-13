from uuid import UUID
from typing import Optional
from fastapi import HTTPException

from app.repositories.master_repository import MastersRepository
from app.schemas import (
    MasterSearchParams,
    MasterListItem,
    MasterListResponse,
    MasterDetailResponse,
)


class MasterService:
    def __init__(self):
        self.repository = MastersRepository()

    def search_masters(self, params: MasterSearchParams) -> MasterListResponse:
        """Search and filter masters with pagination."""
        try:
            results, total = self.repository.search(
                query=params.query,
                category=params.category,
                location=params.location,
                min_rating=params.min_rating,
                limit=params.limit,
                offset=params.offset,
            )

            masters = [self._to_list_item(row) for row in results]

            return MasterListResponse(
                masters=masters,
                total=total,
                limit=params.limit,
                offset=params.offset,
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Failed to search masters: {str(e)}",
            )

    def get_master_detail(self, master_id: UUID) -> MasterDetailResponse:
        """Get full detail for a single master."""
        try:
            master = self.repository.get_by_id_with_relations(master_id)
            if not master:
                raise HTTPException(status_code=404, detail="Master not found")
            return self._to_detail(master)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get master detail: {str(e)}",
            )

    # ---- private helpers ----

    def _to_list_item(self, row: dict) -> MasterListItem:
        user = row.get("users") or {}
        return MasterListItem(
            id=row["id"],
            user_id=row["user_id"],
            full_name=user.get("full_name"),
            description=row.get("description"),
            location=row["location"],
            avg_rating=row.get("avg_rating", 0),
            response_time=row.get("response_time"),
            avatar_url=user.get("avatar_url"),
            services=row.get("_services", []),
        )

    def _to_detail(self, row: dict) -> MasterDetailResponse:
        user = row.get("users") or {}
        return MasterDetailResponse(
            id=row["id"],
            user_id=row["user_id"],
            full_name=user.get("full_name"),
            email=user.get("email"),
            phone=user.get("phone"),
            description=row.get("description"),
            location=row["location"],
            avg_rating=row.get("avg_rating", 0),
            response_time=row.get("response_time"),
            avatar_url=user.get("avatar_url"),
            services=row.get("_services", []),
        )
