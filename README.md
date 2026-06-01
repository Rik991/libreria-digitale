# Libreria Digitale 📚

Una libreria digitale dove puoi cercare libri dal catalogo Project Gutenberg, salvarli nella tua collezione personale, e lasciare recensioni con voto.

## Stack

- **Next.js 16** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS v4** per lo stile
- **Supabase** per autenticazione e persistenza dati
- **Gutendex API** (`gutendex.com`) per il catalogo libri

## Avvio rapido

### Prerequisiti

- Node.js 18+
- Un progetto Supabase con le tabelle `profiles`, `saved_books` e `comments`

### Installazione

```bash
# Clona il repository
git clone <url-repo>
cd libreria-digitale

# Installa le dipendenze
npm install
```

### Variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=<il-tuo-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<la-tua-anon-key>
```

### Avvio in sviluppo

```bash
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000).

### Build di produzione

```bash
npm run build
npm start
```

## Struttura del progetto

```
app/
├── layout.tsx          → Layout globale con Navbar
├── page.tsx            → Home: ricerca libri (Server Component)
├── login/page.tsx      → Login/Registrazione
├── libreria/page.tsx   → Collezione personale
└── book/[id]/page.tsx  → Dettaglio libro (SSR)

components/
├── Navbar.tsx          → Navigazione con stato auth
├── SearchBooks.tsx     → Input ricerca + risultati
├── BookCard.tsx        → Card libro riusabile
├── StarRating.tsx      → Stelline interattive/display
├── LoginForm.tsx       → Form login e registrazione
├── LibraryContent.tsx  → Griglia libri salvati
├── SaveToggle.tsx      → Salva/rimuovi libro
└── CommentsSection.tsx → Recensioni con voto

lib/
└── supabase.ts         → Client Supabase singleton

types/
└── index.ts            → Tutte le interfacce TypeScript
```

## Architettura

- Le **pagine** sono Server Components: nessun `"use client"`, rendering veloce, SEO ottimale
- La pagina dettaglio libro (`/book/[id]`) fetcha i dati **lato server** con cache di 1 ora
- Solo i **componenti interattivi** (form, bottoni, ricerca) usano `"use client"`
- Il client Supabase è un **singleton** esportato da `lib/supabase.ts`
- L'API utilizzata è **Gutendex** (`gutendex.com`): gratuita, senza API key

## Funzionalità

- 🔍 Ricerca libri con debounce (500ms)
- 📖 Dettaglio libro con copertina, categorie, sinossi
- ❤️ Salvataggio nella collezione personale
- ⭐ Recensioni con voto (1-5 stelle)
- 🔐 Autenticazione (login + registrazione)
- 📱 Layout responsive
