"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import type { Book } from "@/types";
import BookCard from "./BookCard";
import { RAPID_API_HOST, RAPID_HEADERS } from "@/app/book/[id]/page";

// Cache in memoria per i libri popolari (evita troppe chiamate alla RapidAPI)
let popularBooksCache: Book[] | null = null;

export default function SearchBooks() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Fetch libri popolari via RapidAPI (con cache in memoria)
  useEffect(() => {
    if (popularBooksCache) {
      setPopularBooks(popularBooksCache);
      return;
    }
    fetch(`https://${RAPID_API_HOST}/books`, { headers: RAPID_HEADERS })
      .then((res) => res.json())
      .then((data) => {
        const books: Book[] = (data.results || []).slice(0, 30);
        popularBooksCache = books;
        setPopularBooks(books);
      })
      .catch(() => {});
  }, []);

  // Fetch dei libri salvati
  useEffect(() => {
    const fetchSavedIds = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setSavedIds(new Set());
        return;
      }
      const { data } = await supabase.from("saved_books").select("book_id").eq("user_id", user.id);
      if (data) {
        setSavedIds(new Set(data.map((row) => row.book_id)));
      }
    };

    fetchSavedIds();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      fetchSavedIds();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch ricerca con debounce
  useEffect(() => {
    if (!query.trim()) {
      abortRef.current?.abort();
      setBooks([]);
      setNextUrl(null);
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timerId = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const encoded = encodeURIComponent(query.trim());
        const res = await fetch(`https://${RAPID_API_HOST}/books?title=${encoded}`, { headers: RAPID_HEADERS, signal: controller.signal });
        if (!res.ok) throw new Error(`Errore API: ${res.status}`);
        const data = await res.json();
        setBooks(data.results || []);
        setNextUrl(data.next ?? null);
        setSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Errore sconosciuto");
        setBooks([]);
        setNextUrl(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [query]);

  const loadMore = async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(nextUrl, { headers: RAPID_HEADERS });
      if (!res.ok) throw new Error(`Errore API: ${res.status}`);
      const data = await res.json();
      setBooks((prev) => [...prev, ...(data.results || [])]);
      setNextUrl(data.next ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il caricamento");
    } finally {
      setLoadingMore(false);
    }
  };

  const showPopular = !query.trim() && !searched;
  const renderableCount = nextUrl ? Math.floor(books.length / 30) * 30 : books.length;
  const renderableBooks = books.slice(0, renderableCount);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo, autore..."
          className="w-full rounded-lg border border-border bg-card text-card-foreground px-4 py-3 pl-12 text-base outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15 placeholder:text-muted-foreground"
        />
      </div>

      {/* Search Status */}
      {loading && (
        <div className="mb-6 flex items-center gap-3 text-muted-foreground">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          Ricerca in corso..
        </div>
      )}

      {error && <p className="mb-6 text-sm text-danger">{error}</p>}

      {!loading && !error && searched && books.length === 0 && <p className="mb-6 italic text-muted-foreground">Nessun risultato per &ldquo;{query}&rdquo;</p>}

      {/* Results or Popular Catalog */}
      {showPopular ? (
        <div>
          <h2 className="mb-4 text-xl font-bold text-foreground">I Classici Più Amati</h2>
          {popularBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
              {popularBooks.map((book) => (
                <BookCard key={book.id} book={book} initialSaved={savedIds.has(book.id)} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
              Caricamento catalogo...
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
            {renderableBooks.map((book) => (
              <BookCard key={book.id} book={book} initialSaved={savedIds.has(book.id)} />
            ))}
          </div>

          {nextUrl && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center rounded-full bg-card border border-border px-8 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                    Caricamento in corso...
                  </>
                ) : (
                  "Carica altri risultati"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
