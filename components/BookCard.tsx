"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { GutendexBook } from "@/types";

interface BookCardProps {
  book: GutendexBook;
  initialSaved?: boolean;
}

export default function BookCard({ book, initialSaved }: BookCardProps) {
  const coverImage = book.formats["image/jpeg"] || null;
  const author = book.authors[0]?.name || "Autore sconosciuto";
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [checked, setChecked] = useState(initialSaved !== undefined);

  // Se non ci viene detto dall'esterno, controlliamo noi
  useEffect(() => {
    if (initialSaved !== undefined) return;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecked(true); return; }

      const { data } = await supabase
        .from("saved_books")
        .select("id")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsSaved(!!data);
      setChecked(true);
    };
    check();
  }, [book.id, initialSaved]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Devi fare il login per salvare i libri!");
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from("saved_books")
        .delete()
        .eq("book_id", book.id)
        .eq("user_id", user.id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase.from("saved_books").insert([
        {
          user_id: user.id,
          book_id: book.id,
          title: book.title,
          cover_image: coverImage,
          author: book.authors[0]?.name || "Autore Ignoto",
        },
      ]);
      if (!error) setIsSaved(true);
    }
  };

  return (
    <Link
      href={`/book/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Cover + Heart overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage}
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

        {/* Heart button */}
        {checked && (
          <button
            onClick={handleToggleSave}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all ${
              isSaved
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500"
            }`}
            title={isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-gray-900">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{author}</p>
      </div>
    </Link>
  );
}
