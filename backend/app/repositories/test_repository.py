from app.integrations.supabase import supabase


class TestRepository:
    def get_healthcheck(self):
        result = (
            supabase
            .table("healthcheck")
            .select("message")
            .limit(1)
            .execute()
        )
        return result.data