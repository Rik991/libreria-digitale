import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Ghost className="mb-6 h-20 w-20 text-muted-foreground/50" />
      <h1 className="mb-4 text-5xl font-extrabold text-foreground tracking-tight">404</h1>
      <h2 className="mb-4 text-2xl font-bold text-foreground">Pagina non trovata</h2>
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        Sembra che tu ti sia perso tra gli scaffali. La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        Torna alla Home
      </Link>
    </main>
  );
}
