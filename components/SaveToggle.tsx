"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

interface SaveToggleProps {
  bookId: number;
  title?: string;
  author?: string;
  coverImage?: string | null;
  initialSaved?: boolean;
  variant?: "icon" | "button";
  onToggle?: (isSaved: boolean) => void;
}

export default function SaveToggle({ 
  bookId, 
  title, 
  author, 
  coverImage, 
  initialSaved, 
  variant = "button",
  onToggle 
}: SaveToggleProps) {
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(initialSaved === undefined);
  const router = useRouter();

  // Se initialSaved cambia dalle props (es. ricaricamento parent), aggiorniamo
  useEffect(() => {
    if (initialSaved !== undefined) {
      setIsSaved(initialSaved);
      setLoading(false);
    }
  }, [initialSaved]);

  useEffect(() => {
    if (initialSaved !== undefined) return;

    const checkIfSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("saved_books")
        .select("id")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .single();

      if (data) setIsSaved(true);
      setLoading(false);
    };

    checkIfSaved();
  }, [bookId, initialSaved]);

  const toggleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=true");
      return;
    }

    if (isSaved) {
      // Per il variant icon in libreria che ha bisogno di reattività immediata ottimistica
      const oldState = isSaved;
      setIsSaved(false);
      onToggle?.(false);

      const { error } = await supabase
        .from("saved_books")
        .delete()
        .eq("book_id", bookId)
        .eq("user_id", user.id);

      if (error) {
        setIsSaved(oldState);
        onToggle?.(oldState);
      }
    } else {
      const oldState = isSaved;
      setIsSaved(true);
      onToggle?.(true);

      const { error } = await supabase.from("saved_books").insert([
        {
          user_id: user.id,
          book_id: bookId,
          title: title || "Titolo Sconosciuto",
          cover_image: coverImage || null,
          author: author || "Autore Ignoto",
        },
      ]);

      if (error) {
        setIsSaved(oldState);
        onToggle?.(oldState);
      }
    }
  };

  if (loading && variant === "button") {
    return <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />;
  }
  
  if (loading && variant === "icon") {
    return <div className="absolute right-2 top-2 h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (variant === "icon") {
    return (
      <button
        onClick={toggleSave}
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all ${
          isSaved
            ? "bg-danger text-white hover:bg-white hover:text-danger hover:border hover:border-danger"
            : "bg-background/80 text-muted-foreground hover:bg-background hover:text-danger"
        }`}
        title={isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
      >
        <Heart
          className="h-4 w-4 transition-transform hover:scale-110"
          fill={isSaved ? "currentColor" : "none"}
        />
      </button>
    );
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
