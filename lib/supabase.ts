import { createBrowserClient } from "@supabase/ssr";

// Singleton: un'unica istanza del client Supabase per tutta l'app.
// Evita ri-creazioni nei useEffect e previene loop infiniti nelle deps.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
