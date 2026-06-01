### Installazione

cd libreria-digitale

npm install

Crea un file `.env.local` nella root del progetto. Includerò le chiavi in file di testo separato nella mail, so che non è un metodo sicuro, ma è il metodo più semplice per condividerele dato che il repository è pubblico.

npm run dev

## Stack

- Next.js
- TypeScript
- Tailwind
- Supabase

## Funzionalità

- Ricerca libri con debounce (500ms)
- Dettaglio libro con copertina, categorie, sinossi
- Salvataggio nella collezione personale
- Recensioni con voto (1-5 stelle)
- Autenticazione (login + registrazione)
- Layout responsive
