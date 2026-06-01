import LibraryContent from "@/components/LibraryContent";

export default function LibreriaPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
          La Mia Libreria
        </h1>
        <p className="text-lg text-gray-500">
          I libri che hai salvato nella tua collezione
        </p>
      </div>
      <LibraryContent />
    </main>
  );
}
