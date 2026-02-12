import os
import requests


class SerperClient:
    def __init__(self):
        self.api_key = os.getenv("SERPER_API_KEY")
        self.base_url = "https://google.serper.dev/maps"

    def search(self, query: str, city: str) -> list[dict]:
        if not self.api_key:
            return []

        payload = {
            "q": f"{query} {city} France",
            "gl": "fr",
            "hl": "fr",
        }
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                self.base_url, json=payload, headers=headers, timeout=30
            )
            response.raise_for_status()
            data = response.json()
            places = data.get("places", [])

            results = []
            for place in places:
                results.append(
                    {
                        "name": place.get("title", ""),
                        "address": place.get("address", ""),
                        "phone": place.get("phoneNumber", ""),
                        "website": place.get("website", ""),
                        "rating": place.get("rating"),
                        "reviews": place.get("reviews", 0),
                        "link": place.get("link", ""),
                    }
                )

            return results
        except requests.RequestException as e:
            print(f"Serper API error: {e}")
            return []
