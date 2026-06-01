"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { GutendexBook } from "@/types";

interface SaveToggleProps {
  book: GutendexBook;
  coverImage: string | null;
}

export default function SaveToggle({ book, coverImage }: SaveToggleProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />;
  }

  return (
    <button
      onClick={toggleSave}
      className={`flex shrink-0 items-center justify-center rounded-full p-3 transition-colors ${
        isSaved
          ? "bg-danger-light text-danger"
          : "bg-gray-100 text-gray-400 hover:bg-danger-light hover:text-danger"
      }`}
      title={isSaved ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
