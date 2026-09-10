// Fonction serveur (Netlify Function) qui cache la clé API Pexels.
// A deployer sous netlify/functions/pexels-search.js a la racine du projet.
// La cle elle-meme ne va JAMAIS dans ce fichier : elle se configure sur
// Netlify > Site configuration > Environment variables, sous le nom
// PEXELS_API_KEY. Ainsi aucun visiteur du site ne peut la voir.

exports.handler = async (event) => {
  const API_KEY = process.env.PEXELS_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "PEXELS_API_KEY n'est pas configuree sur le serveur." })
    };
  }

  const params = event.queryStringParameters || {};
  const query = params.query;
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: "Parametre 'query' manquant." }) };
  }

  const search = new URLSearchParams({ query, per_page: params.per_page || '12' });
  if (params.orientation) search.set('orientation', params.orientation);

  try {
    const res = await fetch('https://api.pexels.com/v1/search?' + search.toString(), {
      headers: { Authorization: API_KEY }
    });
    const body = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Impossible de contacter Pexels.' }) };
  }
};
