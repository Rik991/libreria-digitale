"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GutendexBook, GutendexSearchResponse } from "@/types";
import BookCard from "./BookCard";

interface SearchBooksProps {
  initialPopularBooks?: GutendexBook[];
}

export default function SearchBooks({ initialPopularBooks = [] }: SearchBooksProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState<GutendexBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(!!initialQuery);

  const abortRef = useRef<AbortController | null>(null);

  // Update URL on query change (con debounce per non intasare la history)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        router.replace(`/?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      } else {
        router.replace("/", { scroll: false });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, router]);

  // Gestisce la ricerca vera e propria con fetch
  useEffect(() => {
    if (!query.trim()) {
      setBooks([]);
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const encoded = encodeURIComponent(query.trim());
        const res = await fetch(
          `https://gutendex.com/books?search=${encoded}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`Errore API: ${res.status}`);

        const data: GutendexSearchResponse = await res.json();
        setBooks(data.results);
        setSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        setError(err instanceof Error ? err.message : "Errore sconosciuto");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const showPopular = !query.trim() && !searched;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8 max-w-xl">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo, autore, argomento..."
          className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-base outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      </div>

      {/* Search Status */}
      {loading && (
        <div className="mb-6 flex items-center gap-3 text-gray-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          Ricerca in corso...
        </div>
      )}

      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && searched && books.length === 0 && (
        <p className="mb-6 italic text-gray-400">
          Nessun risultato per &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Results or Popular Catalog */}
      {showPopular ? (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Catalogo Popolari</h2>
          {initialPopularBooks?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
              {initialPopularBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nessun libro trovato nel catalogo generale.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
