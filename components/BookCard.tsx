"use client";

import Link from "next/link";
import Image from "next/image";
import type { GutendexBook } from "@/types";
import SaveToggle from "./SaveToggle";

interface BookCardProps {
  book: GutendexBook;
  initialSaved?: boolean;
}

export default function BookCard({ book, initialSaved }: BookCardProps) {
  const coverImage = book.formats["image/jpeg"] || null;
  const author = book.authors[0]?.name || "Autore sconosciuto";

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

        {/* Reusable Heart Button */}
        <SaveToggle
          variant="icon"
          bookId={book.id}
          title={book.title}
          author={author}
          coverImage={coverImage}
          initialSaved={initialSaved}
        />
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
