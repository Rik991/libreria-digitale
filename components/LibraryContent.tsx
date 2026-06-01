"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { SavedBook } from "@/types";

export default function LibraryContent() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyBooks = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("saved_books")
        .select("*")
        .eq("user_id", user.id);

      if (!error) {
        setBooks(data || []);
      }
      setLoading(false);
    };

    fetchMyBooks();
  }, [router]);

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("saved_books").delete().eq("id", id);
    if (!error) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        Caricamento libreria...
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="mb-2 text-4xl">📚</p>
        <p className="text-lg">Non hai ancora salvato nessun libro.</p>
        <p className="text-sm">Torna alla home per cercarne qualcuno!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
      {books.map((book) => (
        <div
          key={book.id}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Link href={`/book/${book.book_id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
            {book.cover_image ? (
              <Image
                src={book.cover_image}
                alt={book.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                Nessuna copertina
              </div>
            )}
          </Link>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-gray-900">
              {book.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{book.author}</p>
            <button
              onClick={() => handleRemove(book.id)}
              className="mt-auto pt-3 text-xs font-semibold text-danger transition-colors hover:text-danger-hover"
            >
              Rimuovi
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
