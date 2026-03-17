from uuid import UUID
from typing import Optional, List
from app.dependencies.supabase import supabase
from app.schemas import MasterCreate, MasterUpdate


class MastersRepository:
    def get_all(self) -> list[dict]:
        result = supabase.table("masters").select("*").execute()
        return result.data or []

    def get_by_id(self, master_id: UUID) -> Optional[dict]:
        result = (
            supabase.table("masters")
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
            supabase.table("masters")
            .select("*")
            .eq("user_id", str(user_id))
            .limit(1)
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def create(self, payload: MasterCreate) -> dict:
        result = (
            supabase.table("masters").insert(payload.model_dump(mode="json")).execute()
        )
        return result.data[0]

    def update(self, master_id: UUID, payload: MasterUpdate) -> Optional[dict]:
        update_data = payload.model_dump(exclude_unset=True, mode="json")

        if not update_data:
            return self.get_by_id(master_id)

        result = (
            supabase.table("masters")
            .update(update_data)
            .eq("id", str(master_id))
            .execute()
        )

        if not result.data:
            return None

        return result.data[0]

    def search(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        min_rating: Optional[float] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict], int]:
        master_ids_filter: Optional[List[str]] = None
        if category:
            svc_result = (
                supabase.table("master_services")
                .select("master_id, services!inner(name)")
                .ilike("services.name", f"%{category}%")
                .execute()
            )
            master_ids_filter = list({
                row["master_id"] for row in (svc_result.data or [])
            })
            if not master_ids_filter:
                return [], 0

        select_fields = "*"

        # --- count query ---
        count_q = supabase.table("masters").select(select_fields, count="exact")
        # --- data query ---
        data_q = supabase.table("masters").select(select_fields)

        # Apply shared filters to both queries
        for q in [count_q, data_q]:
            if location:
                q = q.ilike("location", f"%{location}%")
            if min_rating is not None:
                q = q.gte("avg_rating", min_rating)
            if master_ids_filter is not None:
                q = q.in_("id", master_ids_filter)
            if query:
                q = q.ilike("description", f"%{query}%")

            if q is count_q:
                count_q = q
            else:
                data_q = q

        count_result = count_q.execute()
        total = count_result.count if count_result.count is not None else len(count_result.data or [])

        data_q = data_q.order("avg_rating", desc=True)
        data_q = data_q.range(offset, offset + limit - 1)
        data_result = data_q.execute()

        masters = data_result.data or []

        # Enrich each master with user metadata from auth.users
        for master in masters:
            master["_user"] = self._get_user_metadata(master["user_id"])

        return masters, total

    def get_by_id_with_relations(self, master_id: UUID) -> Optional[dict]:
        result = (
            supabase.table("masters")
            .select("*")
            .eq("id", str(master_id))
            .limit(1)
            .execute()
        )
        if not result.data:
            return None

        master = result.data[0]
        master["_user"] = self._get_user_metadata(master["user_id"])

        svc_result = (
            supabase.table("master_services")
            .select("services(name)")
            .eq("master_id", str(master_id))
            .execute()
        )
        master["_services"] = [
            row["services"]["name"]
            for row in (svc_result.data or [])
            if row.get("services") and row["services"].get("name")
        ]

        return master

    def _get_user_metadata(self, user_id: str) -> dict:
        try:
            response = supabase.auth.admin.get_user_by_id(user_id)
            if response and response.user:
                meta = response.user.user_metadata or {}
                return {
                    "full_name": meta.get("full_name"),
                    "email": response.user.email,
                    "phone": meta.get("phone"),
                    "avatar_url": meta.get("avatar_url"),
                }
        except Exception:
            pass
        return {}

    def delete(self, master_id: UUID) -> bool:
        result = supabase.table("masters").delete().eq("id", str(master_id)).execute()
        return bool(result.data)