"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { BookOpen, Search, Library, LogIn, LogOut, Moon, Sun, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isCurrent = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md sm:px-8">
      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-primary transition-colors hover:text-primary-hover">
        <BookOpen className="h-6 w-6 transition-transform group-hover:-rotate-6 group-hover:scale-110" />
        <span className="hidden sm:inline">Libreria Digitale</span>
      </Link>

      {/* Links & Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/"
          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
            isCurrent("/") ? "text-primary" : "text-muted-foreground"
          }`}
          title="Cerca"
        >
          <Search className="h-5 w-5" />
          <span className="hidden sm:inline">Cerca</span>
        </Link>
        <Link
          href="/libreria"
          className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
            isCurrent("/libreria") ? "text-primary" : "text-muted-foreground"
          }`}
          title="La Mia Collezione"
        >
          <Library className="h-5 w-5" />
          <span className="hidden sm:inline">La Mia Collezione</span>
        </Link>

        <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary" title={user.email || "Utente"}>
              <UserIcon className="h-4 w-4" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-danger"
              title="Esci"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              isCurrent("/login") ? "text-primary" : "text-muted-foreground"
            }`}
            title="Accedi"
          >
            <LogIn className="h-5 w-5" />
            <span className="hidden sm:inline">Accedi</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
