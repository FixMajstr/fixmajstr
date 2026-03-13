from uuid import UUID
from typing import Optional

from app.dependencies.supabase import supabase
from app.schemas import InquiryCreate, InquiryUpdate


class InquiriesRepository:
    def get_all(self) -> list[dict]:
        result = supabase.table("inquiries").select("*").execute()
        return result.data or []

    def get_by_id(self, inquiry_id: UUID) -> Optional[dict]:
        result = (
            supabase.table("inquiries")
            .select("*")
            .eq("id", str(inquiry_id))
            .limit(1)
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def get_by_master_id(self, master_id: UUID) -> list[dict]:
        result = (
            supabase.table("inquiries")
            .select("*")
            .eq("master_id", str(master_id))
            .execute()
        )

        return result.data or []

    def get_by_client_id(self, client_id: UUID) -> list[dict]:
        result = (
            supabase.table("inquiries")
            .select("*")
            .eq("client_id", str(client_id))
            .execute()
        )

        return result.data or []

    def create(self, payload: InquiryCreate) -> dict:
        result = (
            supabase.table("inquiries")
            .insert(payload.model_dump(mode="json"))
            .execute()
        )

        return result.data[0]

    def update(self, inquiry_id: UUID, payload: InquiryUpdate) -> Optional[dict]:
        update_data = payload.model_dump(exclude_unset=True, mode="json")

        if not update_data:
            return self.get_by_id(inquiry_id)

        result = (
            supabase.table("inquiries")
            .update(update_data)
            .eq("id", str(inquiry_id))
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def delete(self, inquiry_id: UUID) -> bool:
        result = (
            supabase.table("inquiries").delete().eq("id", str(inquiry_id)).execute()
        )

        return bool(result.data)
