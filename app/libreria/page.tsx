import LibraryContent from "@/components/LibraryContent";

export default function LibreriaPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-10">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-extrabold text-foreground">
          Il Tuo Scaffale
        </h1>
        <p className="text-lg text-muted-foreground">
          I classici che hai scelto di tenere con te. Leggi, recensisci, colleziona.
        </p>
      </div>
      <LibraryContent />
    </main>
  );
}
