"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      pathname === path ? "text-primary" : "text-gray-500"
    }`;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        Libreria Digitale
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className={linkClass("/")}>
          Cerca
        </Link>
        <Link href="/libreria" className={linkClass("/libreria")}>
          La Mia Libreria
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary">
              {user.email?.[0].toUpperCase()}
            </span>
            <button onClick={handleLogout} className="text-sm font-medium text-gray-500 transition-colors hover:text-danger">
              Esci
            </button>
          </div>
        ) : (
          <Link href="/login" className={linkClass("/login")}>
            Accedi
          </Link>
        )}
      </div>
    </nav>
  );
}
