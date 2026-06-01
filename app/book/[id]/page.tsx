import { Suspense } from "react";
import Image from "next/image";
import SaveToggle from "@/components/SaveToggle";
import CommentsSection from "@/components/CommentsSection";
import type { GutendexBook } from "@/types";

async function getBook(id: string): Promise<GutendexBook | null> {
  // Timeout di 10 secondi per non bloccare il rendering all'infinito
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`https://gutendex.com/books/${id}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// Componente asincrono che fetcha e renderizza il libro
async function BookContent({ id }: { id: string }) {
  const book = await getBook(id);

  if (!book) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-500">
        <p className="mb-4 text-4xl">📖</p>
        <p className="mb-2 text-lg font-semibold">Libro non trovato</p>
        <p className="text-sm">
          L&apos;API potrebbe essere temporaneamente non disponibile. Riprova tra
          qualche istante.
        </p>
      </div>
    );
  }

  const coverImage = book.formats["image/jpeg"] || null;
  const summary =
    book.summaries?.[0] || "Nessuna trama disponibile per questo libro.";

  return (
    <>
      <div className="mb-10 flex flex-col gap-8 md:flex-row">
        {/* Cover */}
        <div className="w-full shrink-0 md:w-[260px]">
          {coverImage ? (
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-md">
              <Image
                src={coverImage}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 260px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              Nessuna copertina
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">
              {book.title}
            </h1>
            <SaveToggle book={book} coverImage={coverImage} />
          </div>

          <p className="mb-6 text-xl text-gray-500">
            di {book.authors[0]?.name || "Autore Ignoto"}
          </p>

          {/* Categories */}
          {book.subjects.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Categorie
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects.slice(0, 5).map((subject, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-badge-bg px-3 py-1 text-xs font-medium text-badge-text"
                  >
                    {subject.split("--")[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Sinossi
            </h3>
            <p className="leading-relaxed text-gray-600">{summary}</p>
          </div>
        </div>
      </div>

      <CommentsSection bookId={book.id} />
    </>
  );
}

// Loading fallback
function BookLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <span className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      Caricamento dettagli del libro...
    </div>
  );
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-8 py-8">
      <Suspense fallback={<BookLoading />}>
        <BookContent id={id} />
      </Suspense>
    </main>
  );
}
