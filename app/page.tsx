import { Suspense } from "react";
import SearchBooks from "@/components/SearchBooks";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-10">
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Libreria Digitale</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">Esplora migliaia di grandi classici dal catalogo.</p>
      </div>
      <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Caricamento...</div>}>
        <SearchBooks />
      </Suspense>
    </main>
  );
}
