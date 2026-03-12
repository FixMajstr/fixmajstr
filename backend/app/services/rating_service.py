from fastapi import HTTPException

from app.repositories.rating_repository import RatingRepository
from app.schemas.schemas import RatingCreate, RatingSummary, RatingRead


class RatingService:
    def __init__(self):
        self.repository = RatingRepository()

    def create_rating(self, payload: RatingCreate) -> RatingRead:
        created_rows = self.repository.create_rating(payload.model_dump(mode="json"))

        if not created_rows:
            raise HTTPException(status_code=500, detail="Rating could not be created.")

        summary = self.get_master_rating_summary(payload.master_id)
        self.repository.update_master_average_rating(
            payload.master_id,
            summary.average_score,
        )

        return RatingRead.model_validate(created_rows[0])

    def get_ratings_for_master(self, master_id):
        rows = self.repository.get_ratings_for_master(master_id)
        return [RatingRead.model_validate(row) for row in rows]

    def get_master_rating_summary(self, master_id) -> RatingSummary:
        rows = self.repository.get_master_rating_summary(master_id)

        if not rows:
            return RatingSummary(average_score=0.0, total_ratings=0)

        total_score = sum(row["score"] for row in rows)
        average_score = round(total_score / len(rows), 2)

        return RatingSummary(
            average_score=average_score,
            total_ratings=len(rows),
        )
