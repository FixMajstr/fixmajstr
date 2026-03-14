from uuid import UUID

from app.dependencies.supabase import supabase


class RatingRepository:
    def create_rating(self, rating_data: dict):
        result = (
            supabase
            .table("ratings")
            .insert(rating_data)
            .execute()
        )
        return result.data

    def get_ratings_for_master(self, master_id: UUID):
        result = (
            supabase
            .table("ratings")
            .select("*")
            .eq("master_id", str(master_id))
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    def get_master_rating_summary(self, master_id: UUID):
        result = (
            supabase
            .table("ratings")
            .select("score")
            .eq("master_id", str(master_id))
            .execute()
        )
        return result.data

    def get_rating_scores(self):
        result = (
            supabase
            .table("ratings")
            .select("master_id, score")
            .execute()
        )
        return result.data

    def update_master_average_rating(self, master_id: UUID, avg_rating: float):
        result = (
            supabase
            .table("masters")
            .update({"avg_rating": avg_rating})
            .eq("id", str(master_id))
            .execute()
        )
        return result.data
