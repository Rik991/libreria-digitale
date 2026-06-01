"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LibraryBig } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SavedBook } from "@/types";

export default function LibraryContent() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyBooks = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase.from("saved_books").select("*").eq("user_id", user.id);

      if (!error) {
        setBooks(data || []);
      }
      setLoading(false);
    };

    fetchMyBooks();
  }, [router]);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the book link
    e.stopPropagation();

    const { error } = await supabase.from("saved_books").delete().eq("id", id);
    if (!error) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        Caricamento della tua collezione...
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <LibraryBig className="mb-6 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">La tua collezione è vuota</h2>
        <p className="max-w-md text-base">Esplora il catalogo e inizia ad aggiungere le tue prossime letture a questo scaffale digitale.</p>
        <Link href="/" className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover">
          Scopri i grandi classici
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/book/${book.book_id}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
            {book.cover_image ? (
              <Image
                src={book.cover_image}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Nessuna copertina</div>
            )}

            {/* Heart Button overlay to remove book */}
            <button
              onClick={(e) => handleRemove(e, book.id)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-danger text-white shadow-md transition-all hover:bg-white hover:text-danger hover:border hover:border-danger"
              title="Rimuovi dai preferiti"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-card-foreground">{book.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
