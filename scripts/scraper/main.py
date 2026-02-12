"""
CRM Kluster - Lead Scraper
Scrapes local business data from Google Maps via Serper.dev and SerpAPI.
Can be run manually or via GitHub Actions cron.
"""

import os
import sys
from datetime import datetime, timezone

from serper_client import SerperClient
from serpapi_client import SerpAPIClient
from supabase_client import SupabaseClient


def scrape_job(supabase: SupabaseClient, job: dict):
    """Process a single scrape job."""
    job_id = job["id"]
    query = job["query"]
    city = job["city"]

    print(f"Processing job {job_id}: '{query}' in {city}")

    # Update job status
    supabase.update_job(
        job_id,
        {"status": "running", "started_at": datetime.now(timezone.utc).isoformat()},
    )

    try:
        # Try Serper first (more free credits)
        serper = SerperClient()
        results = serper.search(query, city)
        api_used = "serper"

        # Fallback to SerpAPI
        if not results:
            print("Serper returned no results, trying SerpAPI...")
            serpapi = SerpAPIClient()
            results = serpapi.search(query, city)
            api_used = "serpapi"

        if not results:
            print("No results found from either API")
            supabase.update_job(
                job_id,
                {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                    "results_count": 0,
                    "api_used": api_used,
                },
            )
            return 0

        # Insert results into database
        count = 0
        for result in results:
            company_data = {
                "name": result.get("name", "Sans nom"),
                "business_type": query,
                "city": city,
                "address": result.get("address") or None,
                "phone": result.get("phone") or None,
                "website": result.get("website") or None,
                "google_maps_url": result.get("link") or None,
                "rating": result.get("rating"),
                "review_count": result.get("reviews", 0),
                "source_api": api_used,
                "scraped_at": datetime.now(timezone.utc).isoformat(),
                "created_by": job.get("created_by"),
            }

            if supabase.create_company(company_data):
                count += 1

        # Update job as completed
        supabase.update_job(
            job_id,
            {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "results_count": count,
                "api_used": api_used,
            },
        )

        print(f"Successfully scraped {count} companies for '{query}' in {city}")
        return count

    except Exception as e:
        print(f"Error scraping job {job_id}: {e}")
        supabase.update_job(
            job_id,
            {
                "status": "failed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "error_message": str(e),
            },
        )
        return 0


def main():
    supabase = SupabaseClient()

    # If a job ID is provided, process only that job
    job_id = sys.argv[1] if len(sys.argv) > 1 else os.getenv("SCRAPE_JOB_ID")

    if job_id:
        job = supabase.get_job(job_id)
        if job:
            scrape_job(supabase, job)
        else:
            print(f"Job {job_id} not found")
            sys.exit(1)
    else:
        # Process all pending jobs
        jobs = supabase.get_pending_jobs()
        if not jobs:
            print("No pending jobs found")
            return

        print(f"Found {len(jobs)} pending jobs")
        total = 0
        for job in jobs:
            total += scrape_job(supabase, job)

        print(f"Total: {total} companies scraped from {len(jobs)} jobs")


if __name__ == "__main__":
    main()
