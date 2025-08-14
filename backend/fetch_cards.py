import os
import json
import time
import requests
from typing import List, Dict
from dotenv import load_dotenv


# Cargar variables desde .env
load_dotenv()

API_KEY = os.getenv("POKEMON_API_KEY")
BASE_URL = "https://api.pokemontcg.io/v2/cards"
HEADERS = {"X-Api-Key": API_KEY} if API_KEY else {}

PAGE_SIZE = 250  # máximo permitido por la API
OUT_PATH = os.path.join("data", "cards.json")


def reduce_cards(cards: List[Dict]) -> List[Dict]:
    """Reduce cada carta al esquema mínimo que usas en tu app."""
    reduced = []
    for c in cards:
        reduced.append({
            "id": c.get("id"),
            "name": c.get("name"),
            "image": (c.get("images") or {}).get("small"),
            "types": c.get("types") or []
        })
    return reduced


def fetch_page(session: requests.Session, page: int) -> List[Dict] | None:
    """Descarga una página con reintentos y backoff. Devuelve lista o None si falla duro."""
    max_attempts = 5
    backoff = 1.5

    for attempt in range(max_attempts):
        try:
            r = session.get(
                BASE_URL,
                headers=HEADERS,
                params={"page": page, "pageSize": PAGE_SIZE},
                timeout=30,   # ⬅️ puedes subirlo un poco si la API va lenta
            )

            if r.status_code == 200:
                data = r.json().get("data", [])
                return data

            # Reintentos para 429 y 5xx
            if r.status_code == 429 or 500 <= r.status_code < 600:
                wait = backoff * (attempt + 1)
                print(f"⚠️  {r.status_code} en página {page}. Reintentando en {wait:.1f}s…")
                time.sleep(wait)
                continue

            # Códigos no recuperables
            print(f"❌ Error {r.status_code} al obtener página {page}: {r.text[:200]}")
            return None

        except requests.RequestException as e:
            wait = backoff * (attempt + 1)
            print(f"⚠️  Error de red en página {page}: {e}. Reintentando en {wait:.1f}s…")
            time.sleep(wait)

    print(f"❌ Fallo persistente al obtener página {page}.")
    return None


def main():
    os.makedirs("data", exist_ok=True)

    # Reanudar si existe
    existing: List[Dict] = []
    if os.path.exists(OUT_PATH):
        try:
            with open(OUT_PATH, "r", encoding="utf-8") as f:
                existing = (json.load(f) or {}).get("data", [])
            print(f"🔁 Reanudando. Ya había {len(existing)} cartas en {OUT_PATH}.")
        except Exception as e:
            print(f"⚠️  No se pudo leer {OUT_PATH}: {e}. Se empezará de cero.")

    seen_ids = {c.get("id") for c in existing if c.get("id")}
    # Estimación de página inicial para saltar lo ya descargado
    start_page = max(1, (len(existing) // PAGE_SIZE) + 1)

    all_cards = existing[:]  # acumulador
    empty_pages_in_a_row = 0

    if not API_KEY:
        print("ℹ️  No se encontró POKEMON_API_KEY en el entorno. Intentaré sin clave (puede limitar peticiones).")

    with requests.Session() as session:
        page = start_page
        print("🚀 Iniciando descarga…")
        while True:
            print(f"Obteniendo página {page}…")
            cards = fetch_page(session, page)

            if cards is None:
                # fallo duro → intentar siguiente página para no bloquear toda la corrida
                page += 1
                continue

            if not cards:
                empty_pages_in_a_row += 1
                # si vienen 2 vacías seguidas, damos la colección por terminada
                if empty_pages_in_a_row >= 2:
                    break
                page += 1
                continue

            empty_pages_in_a_row = 0

            # reducir + deduplicar
            reduced = reduce_cards(cards)
            new_items = [c for c in reduced if c.get("id") and c["id"] not in seen_ids]

            if new_items:
                all_cards.extend(new_items)
                for c in new_items:
                    seen_ids.add(c["id"])

                # guardado incremental
                with open(OUT_PATH, "w", encoding="utf-8") as f:
                    json.dump({"data": all_cards}, f, indent=2, ensure_ascii=False)

            page += 1
            # pequeño delay para no saturar la API
            time.sleep(0.4)

    print(f"✅ Guardado en {OUT_PATH} ({len(all_cards)} cartas)")


if __name__ == "__main__":
    main()
