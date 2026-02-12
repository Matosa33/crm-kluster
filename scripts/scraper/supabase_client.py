import os
from supabase import create_client


class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_KEY", "")
        self.client = create_client(url, key)

    def get_pending_jobs(self) -> list[dict]:
        response = (
            self.client.table("scrape_jobs")
            .select("*")
            .eq("status", "pending")
            .order("created_at")
            .execute()
        )
        return response.data or []

    def get_job(self, job_id: str) -> dict:
        response = (
            self.client.table("scrape_jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )
        return response.data

    def update_job(self, job_id: str, data: dict):
        self.client.table("scrape_jobs").update(data).eq("id", job_id).execute()

    def create_company(self, data: dict) -> bool:
        try:
            self.client.table("companies").upsert(
                data, on_conflict="name,city"
            ).execute()
            return True
        except Exception as e:
            print(f"Error inserting company: {e}")
            return False
