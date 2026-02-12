import os
import requests


class SerpAPIClient:
    def __init__(self):
        self.api_key = os.getenv("SERPAPI_API_KEY")
        self.base_url = "https://serpapi.com/search"

    def search(self, query: str, city: str) -> list[dict]:
        if not self.api_key:
            return []

        params = {
            "engine": "google_maps",
            "q": f"{query} {city} France",
            "hl": "fr",
            "gl": "fr",
            "api_key": self.api_key,
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            local_results = data.get("local_results", [])

            results = []
            for place in local_results:
                results.append(
                    {
                        "name": place.get("title", ""),
                        "address": place.get("address", ""),
                        "phone": place.get("phone", ""),
                        "website": place.get("website", ""),
                        "rating": place.get("rating"),
                        "reviews": place.get("reviews", 0),
                        "link": place.get("place_url", ""),
                    }
                )

            return results
        except requests.RequestException as e:
            print(f"SerpAPI error: {e}")
            return []
