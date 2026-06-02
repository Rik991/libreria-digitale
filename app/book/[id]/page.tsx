"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { BookX } from "lucide-react";
import SaveToggle from "@/components/SaveToggle";
import CommentsSection from "@/components/CommentsSection";
import type { Book } from "@/types";

//chiavi pubbliche rapidapi, non le metto negli env per praticità
const RAPID_API_KEY = "8c4e7c2e5amsh078be79eba07031p1e5aa4jsne9c744d51d13";
const RAPID_API_HOST = "project-gutenberg-free-books-api1.p.rapidapi.com";
const RAPID_HEADERS = {
  "X-RapidAPI-Key": RAPID_API_KEY,
  "X-RapidAPI-Host": RAPID_API_HOST
};

// Fetcha il singolo libro via RapidAPI e lo normalizza nel tipo Book
async function fetchBook(id: string): Promise<Book | null> {
  try {
    const res = await fetch(`https://${RAPID_API_HOST}/books/${id}`, { headers: RAPID_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const bookData = data.results && data.results[0];
    if (!bookData) return null;

    return bookData as Book;
  } catch {
    return null;
  }
}

export default function BookPage() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchBook(id)
      .then((data) => setBook(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[900px] flex-1 px-8 py-10">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <span className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
          Caricamento del volume...
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="mx-auto w-full max-w-[900px] flex-1 px-8 py-10">
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <BookX className="mb-6 h-16 w-16 text-muted-foreground/50" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Libro non trovato</h2>
          <p className="max-w-md text-base">Sembra che questo volume sia andato perduto negli archivi digitali. Riprova più tardi.</p>
        </div>
      </main>
    );
  }

  const coverImage = book.cover_image || null;
  const summary = book.summary || "Nessuna sinossi disponibile per questo titolo.";
  const author = book.authors?.[0]?.name || "Autore Ignoto";

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-8 py-10">
      <div className="mb-10 flex flex-col gap-8 md:flex-row">
        {/* Cover */}
        <div className="w-full shrink-0 md:w-[260px]">
          {coverImage ? (
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg border border-border">
              <Image src={coverImage} alt={book.title} fill sizes="(max-width: 768px) 100vw, 260px" className="object-cover" priority />
            </div>
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border">
              Nessuna copertina
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-4xl font-extrabold leading-tight text-foreground">{book.title}</h1>
            <SaveToggle bookId={book.id} title={book.title} author={author} coverImage={coverImage} />
          </div>

          <p className="mb-6 text-xl text-muted-foreground">di {author}</p>

          {/* Categories */}
          {(book.subjects?.length ?? 0) > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Categorie</h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects!.slice(0, 5).map((subject, idx) => (
                  <span key={idx} className="rounded-full bg-badge-bg px-3 py-1 text-xs font-medium text-badge-text">
                    {subject.split("--")[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sinossi</h3>
            <p className="leading-relaxed text-muted-foreground">{summary}</p>
          </div>
        </div>
      </div>

      <CommentsSection bookId={book.id} />
    </main>
  );
}
