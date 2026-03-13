from typing import Optional, List
from uuid import UUID

from app.integrations.supabase import supabase
from app.schemas import MasterCreate, MasterUpdate


class MasterRepository:

    def get_all(self) -> List[dict]:
        result = supabase.table("masters").select("*").execute()
        return result.data or []

    def get_by_id(self, master_id: UUID) -> Optional[dict]:
        result = (
            supabase
            .table("masters")
            .select("*")
            .eq("id", str(master_id))
            .limit(1)
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def get_by_user_id(self, user_id: UUID) -> Optional[dict]:
        result = (
            supabase
            .table("masters")
            .select("*")
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def get_masters(self, category_id: Optional[UUID] = None):
        query = (
            supabase
            .table("masters")
            .select("*")
        )

        if category_id is not None:
            query = query.eq("category_id", str(category_id))

        result = query.execute()
        return result.data

    def create(self, payload: MasterCreate) -> dict:
        result = (
            supabase
            .table("masters")
            .insert(payload.model_dump(mode="json"))
            .execute()
        )
        return result.data[0]

    def update(self, master_id: UUID, payload: MasterUpdate) -> Optional[dict]:
        update_data = payload.model_dump(exclude_unset=True, mode="json")

        if not update_data:
            return self.get_by_id(master_id)

        result = (
            supabase
            .table("masters")
            .update(update_data)
            .eq("id", str(master_id))
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def delete(self, master_id: UUID) -> bool:
        result = (
            supabase
            .table("masters")
            .delete()
            .eq("id", str(master_id))
            .execute()
        )
        return bool(result.data)