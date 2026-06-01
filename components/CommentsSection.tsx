"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { type User } from "@supabase/supabase-js";
import type { Comment } from "@/types";
import StarRating from "@/components/StarRating";

interface CommentsSectionProps {
  bookId: number;
}

export default function CommentsSection({ bookId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`id, content, rating, created_at, user_id, profiles ( username )`)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as unknown as Comment[]);
    }
  }, [bookId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await fetchComments();
      setLoading(false);
    };
    init();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          book_id: bookId,
          user_id: currentUser.id,
          content: newComment,
          rating,
        },
      ])
      .select(`id, content, rating, created_at, user_id, profiles ( username )`)
      .single();

    if (!error && data) {
      setNewComment("");
      setRating(5);
      setComments([data as unknown as Comment, ...comments]);
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-400">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        Caricamento commenti...
      </div>
    );
  }

  return (
    <div className="mt-10 w-full">
      <h2 className="mb-6 border-b border-gray-100 pb-2 text-2xl font-bold text-gray-900">
        Recensioni dei Lettori
      </h2>

      {/* Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-sm font-semibold text-gray-800">
            Lascia la tua recensione
          </label>

          <div className="mb-4">
            <StarRating value={rating} onChange={setRating} interactive />
          </div>

          <textarea
            className="w-full resize-none rounded-md border border-gray-200 bg-white p-4 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/15"
            rows={4}
            placeholder="Cosa ne pensi di questo libro? Scrivi qui..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Pubblica
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Devi loggarti per poter lasciare un commento e un voto.
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="italic text-gray-400">Nessuna recensione per questo libro. Sii il primo!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">
                    {comment.profiles?.username || "Utente Anonimo"}
                  </span>
                  <span className="mt-0.5 text-xs text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString("it-IT", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {comment.rating ? (
                  <StarRating value={comment.rating} size="sm" />
                ) : (
                  <span className="text-sm text-gray-300">-</span>
                )}
              </div>

              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {comment.content}
              </p>

              {currentUser && currentUser.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="mt-4 text-xs font-semibold text-danger transition-colors hover:text-danger-hover"
                >
                  Elimina recensione
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
