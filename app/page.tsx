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
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-10">
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          La Tua Libreria Personale
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Esplora migliaia di grandi classici dal catalogo Gutenberg. Crea la tua collezione perfetta e lascia la tua recensione.
        </p>
      </div>
      <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Caricamento interfaccia...</div>}>
        <SearchBooks initialPopularBooks={popularBooks} />
      </Suspense>
    </main>
  );
}
