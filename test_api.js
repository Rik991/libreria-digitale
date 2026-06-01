const start = Date.now();
fetch('https://gutendex.com/books?search=shakespeare')
  .then(res => {
    const time = (Date.now() - start) / 1000;
    console.log(`Risposta HTTP ${res.status} in ${time} secondi`);
    return res.json();
  })
  .then(data => {
    const time = (Date.now() - start) / 1000;
    console.log(`Dati JSON ricevuti in ${time} secondi. Trovati ${data.count} libri.`);
  })
  .catch(err => {
    console.error("Errore:", err.message);
  });
