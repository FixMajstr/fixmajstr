from __future__ import annotations

import re
from typing import Optional
from uuid import UUID

from app.repositories.master_repository import MasterRepository
from app.repositories.rating_repository import RatingRepository
from app.schemas.schemas import MasterRankingRead


class MasterService:
    def __init__(self):
        self.master_repository = MasterRepository()
        self.rating_repository = RatingRepository()

    def get_ranked_masters(
        self,
        category_id: Optional[UUID] = None,
        min_avg_rating: Optional[float] = None,
    ) -> list[MasterRankingRead]:
        masters = self.master_repository.get_masters(category_id=category_id)
        ratings = self.rating_repository.get_rating_scores()

        ratings_by_master: dict[str, list[int]] = {}
        for rating in ratings:
            master_id = rating["master_id"]
            ratings_by_master.setdefault(master_id, []).append(rating["score"])

        ranked_masters: list[MasterRankingRead] = []
        for row in masters:
            master_id = row["id"]
            master_ratings = ratings_by_master.get(master_id, [])
            total_ratings = len(master_ratings)
            avg_rating = row.get("avg_rating")

            if avg_rating is None:
                avg_rating = round(sum(master_ratings) / total_ratings, 2) if total_ratings else 0.0

            if min_avg_rating is not None and avg_rating < min_avg_rating:
                continue

            response_time_hours = self._parse_response_time_hours(row.get("response_time"))
            responsiveness_bonus = 0.0 if response_time_hours is None else max(0.0, 5.0 - min(response_time_hours, 120.0) / 24.0)
            popularity_bonus = min(total_ratings, 25) * 0.08
            ranking_score = round(avg_rating * 2.0 + popularity_bonus + responsiveness_bonus, 2)

            payload = {
                **row,
                "avg_rating": avg_rating,
                "total_ratings": total_ratings,
                "ranking_score": ranking_score,
            }
            ranked_masters.append(MasterRankingRead.model_validate(payload))

        ranked_masters.sort(
            key=lambda master: (
                master.ranking_score,
                master.avg_rating or 0.0,
                master.total_ratings,
            ),
            reverse=True,
        )
        return ranked_masters

    def master_exists(self, master_id: UUID) -> bool:
        return bool(self.master_repository.get_master_by_id(master_id))

    @staticmethod
    def _parse_response_time_hours(response_time: Optional[str]) -> Optional[float]:
        if not response_time:
            return None

        normalized = response_time.strip().lower()
        match = re.search(r"(\d+(?:[.,]\d+)?)", normalized)
        if not match:
            return None

        value = float(match.group(1).replace(",", "."))

        if "min" in normalized:
            return value / 60.0
        if "day" in normalized or "dan" in normalized:
            return value * 24.0
        if "week" in normalized or "teden" in normalized:
            return value * 24.0 * 7
        return value
