import { useEffect, useRef, useState } from "react";
import { fetchCards } from "./services/cards";
import type { Card } from "./services/cards";

export default function App() {
  // 🔎 búsqueda con debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // 📦 datos + paginado
  const [cards, setCards] = useState<Card[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 24;
  const [hasMore, setHasMore] = useState(true);

  // ⏳ UI
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 👀 sentinela para infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 🚀 primer lote (y al cambiar de búsqueda)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setCards([]);
        setOffset(0);
        setHasMore(true);

        const res = await fetchCards({ search: debouncedSearch, offset: 0, limit });
        setCards(res.items);
        setOffset(res.nextOffset);
        setHasMore(res.hasMore);
      } catch (e: any) {
        console.error("[DEBUG] loadFirst error", e);
        setErr(e?.message ?? "Error cargando cartas");
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch]);

  // 📥 cargar más (reutilizable para botón y observer)
  const loadMore = async () => {
    if (!hasMore || loading) return;
    try {
      setLoading(true);
      const res = await fetchCards({ search: debouncedSearch, offset, limit });
      setCards((prev) => [...prev, ...res.items]); // 👈 acumulamos
      setOffset(res.nextOffset);
      setHasMore(res.hasMore);
    } catch (e: any) {
      console.error("[DEBUG] loadMore error", e);
      setErr(e?.message ?? "Error cargando más cartas");
    } finally {
      setLoading(false);
    }
  };

  // 📌 IntersectionObserver para auto-cargar
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sentinelRef.current, hasMore, loading, offset, debouncedSearch]); // deps

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Topbar */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Poké Cards</h1>
          {/* Panelcito debug para ver estado en vivo */}
          <div className="text-xs text-zinc-400">
            items: {cards.length} · offset: {offset} · hasMore: {String(hasMore)}
          </div>
        </div>
      </header>

      {/* Buscador */}
      <section className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o id… (ej. charizard)"
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            onClick={() => setDebouncedSearch(search.trim())}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Buscar
          </button>
        </div>

        {/* Estados */}
        {err && <p className="mt-3 text-red-400">Error: {err}</p>}
        {!err && !loading && cards.length === 0 && (
          <p className="mt-3 text-zinc-400">No hay resultados.</p>
        )}
      </section>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {cards.map((c) => (
            <div key={c.id} className="bg-zinc-900 rounded-2xl p-3 shadow border border-zinc-800">
              {c.images?.small && (
                <img
                  src={c.images.small}
                  alt={c.name}
                  className="w-full rounded-xl mb-2 object-cover"
                  loading="lazy"
                />
              )}
              <div className="text-sm font-medium">{c.name}</div>
              {c.types?.length ? (
                <div className="text-xs text-zinc-400 mt-1">{c.types.join(", ")}</div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Sentinela */}
        <div ref={sentinelRef} className="h-12" />

        {/* Botón manual por si el observer no dispara (útil para probar) */}
        {hasMore && !loading && (
          <div className="py-6 text-center">
            <button
              onClick={loadMore}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
            >
              Cargar más
            </button>
          </div>
        )}

        {/* Indicadores */}
        {loading && <div className="py-6 text-center text-zinc-400">Cargando…</div>}
        {!loading && !hasMore && cards.length > 0 && (
          <div className="py-6 text-center text-zinc-500">No hay más resultados.</div>
        )}
      </main>
    </div>
  );
}
