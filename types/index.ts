// === API Gutendex ===

export interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  summaries: string[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
  copyright: boolean | null;
  media_type: string;
}

export interface GutendexSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

// === Supabase / App locale ===

export interface SavedBook {
  id: string;
  book_id: number;
  title: string;
  cover_image: string | null;
  author: string;
  user_id: string;
}

export interface Comment {
  id: string;
  book_id: number;
  user_id: string;
  content: string;
  rating: number | null;
  created_at: string;
  profiles: { username: string } | null;
}
