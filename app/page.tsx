import { Suspense } from "react";
import SearchBooks from "@/components/SearchBooks";
import type { GutendexBook } from "@/types";

async function getPopularBooks(): Promise<GutendexBook[]> {
  try {
    const res = await fetch("https://gutendex.com/books", {
      next: { revalidate: 3600 }, // Cache valida per 1 ora
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // Fetch eseguito lato server (e cachato in fase di build)
  const popularBooks = await getPopularBooks();

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
          La tua Libreria Digitale
        </h1>
        <p className="text-lg text-gray-500">
          Cerca tra migliaia di libri del catalogo Gutenberg
        </p>
      </div>
      <Suspense fallback={<div className="py-10 text-center text-gray-400">Caricamento interfaccia...</div>}>
        <SearchBooks initialPopularBooks={popularBooks} />
      </Suspense>
    </main>
  );
}
