"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      router.push("/login?redirect=true");
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
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Cover + Heart overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Nessuna copertina
          </div>
        )}

        {/* Heart button */}
        {checked && (
          <button
            onClick={handleToggleSave}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all ${
              isSaved
                ? "bg-danger text-white"
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-danger"
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
        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-card-foreground">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{author}</p>
      </div>
    </Link>
  );
}
