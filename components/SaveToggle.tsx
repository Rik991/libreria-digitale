"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import type { GutendexBook } from "@/types";

interface SaveToggleProps {
  book: GutendexBook;
  coverImage: string | null;
}

export default function SaveToggle({ book, coverImage }: SaveToggleProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkIfSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("saved_books")
        .select("id")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .single();

      if (data) setIsSaved(true);
      setLoading(false);
    };

    checkIfSaved();
  }, [book.id]);

  const toggleSave = async () => {
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

  if (loading) {
    return <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />;
  }

  return (
    <button
      onClick={toggleSave}
      className={`flex shrink-0 items-center justify-center rounded-full p-3 transition-all ${
        isSaved
          ? "bg-danger text-white shadow-md hover:bg-danger/90"
          : "bg-muted text-muted-foreground hover:bg-background hover:text-danger hover:shadow-sm border border-transparent hover:border-danger/30"
      }`}
      title={isSaved ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
    >
      <Heart
        className="h-6 w-6 transition-transform hover:scale-110"
        fill={isSaved ? "currentColor" : "none"}
      />
    </button>
  );
}
