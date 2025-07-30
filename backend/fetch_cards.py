import requests
import json
import time
import os

API_KEY = os.getenv("POKEMON_API_KEY")
BASE_URL = "https://api.pokemontcg.io/v2/cards"
HEADERS = {
    "X-Api_key": API_KEY
}

all_cards = []
page = 1
page_size = 250

while True:
    print(f"Obteniendo pagina {page}...")
    response = requests.get(f"{BASE_URL}?page={page}&pageSize={page_size}", headers=HEADERS)

    if response.status_code != 200:
        print(f"Error {response.status_code} al obtener página {page}")
        break

    cards = response.json().get("data", [])
    if not cards:
        break

    for card in cards:
        all_cards.append({
            "id": card.get("id"),
            "name": card.get("name"),
            "image": card.get("images", {}).get("small"),
            "types": card.get("types", [])
        })

    page += 1
    time.sleep(0.3)

output_path = os.path.join("data", "cards.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump({ "data": all_cards }, f, indent=2, ensure_ascii=False)

print(f"✅ Guardado en {output_path} ({len(all_cards)} cartas)")