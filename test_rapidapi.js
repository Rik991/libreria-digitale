const RAPID_API_KEY = "8c4e7c2e5amsh078be79eba07031p1e5aa4jsne9c744d51d13";
const RAPID_API_HOST = "project-gutenberg-free-books-api1.p.rapidapi.com";

fetch(`https://${RAPID_API_HOST}/books/1342`, {
  headers: {
    "X-RapidAPI-Key": RAPID_API_KEY,
    "X-RapidAPI-Host": RAPID_API_HOST
  }
})
  .then(res => res.json().then(data => console.log(JSON.stringify(data, null, 2))))
  .catch(console.error);
