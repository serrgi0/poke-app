// Servicio de cartas con LOGS de depuración y normalización robusta
import { api } from "../lib/api";

export type Card = {
  id: string;
  name: string;
  images?: { small?: string; large?: string };
  types?: string[];
};

type BackendCard = { id: string; name: string; image?: string; types?: string[] };
type BackendResp = {
  total?: number;
  offset?: number;
  limit?: number;
  results?: BackendCard[];
  hasMore?: boolean;
};

export async function fetchCards(opts: { search: string; offset: number; limit: number }) {
  const { search, offset, limit } = opts;

  // LOG: ver a qué URL estamos pegando realmente
  console.log("[API] GET /cards", { search, offset, limit, baseURL: api.defaults.baseURL });

  const { data } = await api.get<BackendResp>("/cards", {
    params: { search, offset, limit },
  });

  // LOG: ver qué devuelve el backend
  console.log("[API] resp /cards ->", data);

  const src = data?.results ?? [];
  const items: Card[] = src.map((c) => ({
    id: c.id,
    name: c.name,
    images: { small: c.image }, // adaptamos "image" -> "images.small"
    types: c.types ?? [],
  }));

  return {
    items,
    total: data?.total ?? items.length,
    hasMore: Boolean(data?.hasMore ?? false),
    nextOffset: (data?.offset ?? 0) + (data?.limit ?? items.length),
  };
}
