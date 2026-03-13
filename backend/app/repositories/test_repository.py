from app.dependencies.supabase import supabase


class TestRepository:
    def get_healthcheck(self):
        result = supabase.table("healthcheck").select("message").limit(1).execute()
        return result.data[0] if result.data else {"message": "Supabase connected, but healthcheck table is empty."}
