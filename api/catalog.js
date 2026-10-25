const BASE = "https://api.themoviedb.org/3";
const IMAGE = "https://image.tmdb.org/t/p/";
const GENRES = {
  28:"Ação",12:"Aventura",16:"Animação",35:"Comédia",80:"Crime",99:"Documentário",
  18:"Drama",10751:"Família",14:"Fantasia",36:"História",27:"Terror",10402:"Música",
  9648:"Mistério",10749:"Romance",878:"Ficção científica",10770:"Cinema",53:"Suspense",
  10752:"Guerra",37:"Faroeste",10759:"Ação e aventura",10762:"Infantil",10763:"Notícias",
  10764:"Reality",10765:"Ficção científica e fantasia",10766:"Novela",10767:"Talk show",
  10768:"Guerra e política"
};
const PROVIDERS = {
  8:"Netflix",9:"Prime Video",337:"Disney+",350:"Apple TV+",384:"HBO Max",
  531:"Paramount+",119:"Amazon Prime Video",283:"Crunchyroll",2:"Apple TV",
  1899:"Max",307:"Globoplay",11:"MUBI",300:"Pluto TV"
};
// Somente serviços integrados à Central+ e disponibilidade para assistir online.
// Aluguel e compra não entram no catálogo "assistir agora".
const CENTRAL_PLUS_PROVIDER_IDS = new Set([8,9,337,350,384,531,119,283,2,1899,307,11,300]);
function credentials() {
  const bearer = process.env.TMDB_BEARER_TOKEN;
  const key = process.env.TMDB_API_KEY;
  if (bearer) return { Authorization: "Bearer " + bearer, Accept: "application/json" };
  if (key) return { Accept: "application/json", "X-TMDB-Key": key };
  return null;
}
async function tmdb(path, params, auth) {
  const url = new URL(BASE + path);
  Object.entries(params || {}).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v)); });
  if (process.env.TMDB_API_KEY && !process.env.TMDB_BEARER_TOKEN) url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  const response = await fetch(url.toString(), { headers: auth, signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error("TMDB HTTP " + response.status);
  return response.json();
}
function image(path, size) { return path ? IMAGE + (size || "w500") + path : ""; }
function normalize(item, type) {
  const isTv = type === "tv";
  const date = item.release_date || item.first_air_date || "";
  const genreIds = item.genre_ids || (item.genres || []).map(g => g.id);
  return {
    id: item.id, type, title: item.title || item.name || "Sem título",
    original_title: item.original_title || item.original_name || "",
    year: date ? date.slice(0,4) : "—", date,
    overview: item.overview || "Sinopse ainda não disponível.",
    rating: Number(item.vote_average || 0).toFixed(1),
    poster_url: image(item.poster_path, "w500"),
    backdrop_url: image(item.backdrop_path, "w1280"),
    genres: genreIds.map(id => GENRES[id]).filter(Boolean),
    genre_ids: genreIds,
    runtime: item.runtime || (item.episode_run_time && item.episode_run_time[0]) || null,
    seasons: item.number_of_seasons || null,
    episodes: item.number_of_episodes || null,
    tmdb_url: "https://www.themoviedb.org/" + (isTv ? "tv/" : "movie/") + item.id,
    provider_names: [],
    provider_options: [],
    provider_link: ""
  };
}
async function providers(type, id, auth) {
  try {
    const data = await tmdb("/" + type + "/" + id + "/watch/providers", {}, auth);
    const br = data.results && data.results.BR;
    if (!br) return { names: [], options: [], link: "" };
    const categories = [
      ["flatrate", "Assinatura"], ["free", "Grátis"], ["ads", "Grátis com anúncios"]
    ];
    const options = [];
    for (const [key, label] of categories) {
      for (const p of (br[key] || [])) {
        if (!p.provider_name || !CENTRAL_PLUS_PROVIDER_IDS.has(Number(p.provider_id))) continue;
        options.push({
          id: p.provider_id || null,
          name: PROVIDERS[p.provider_id] || p.provider_name,
          logo_url: image(p.logo_path, "w92"),
          category: label,
          category_key: key
        });
      }
    }
    const unique = options.filter((p, i, arr) => arr.findIndex(x => x.id === p.id && x.category_key === p.category_key) === i);
    const names = [...new Set(unique.map(p => p.name))];
    return { names: names.slice(0, 8), options: unique.slice(0, 16), link: br.link || "" };
  } catch (_) { return { names: [], options: [], link: "" }; }
}
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=86400");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }
  const auth = credentials();
  if (!auth) return res.status(503).json({ error: "TMDB não configurado. Adicione TMDB_BEARER_TOKEN nas variáveis de ambiente da Vercel." });
  const q = req.query || {};
  const type = q.type === "tv" || q.type === "series" ? "tv" : "movie";
  const section = String(q.section || "trending").toLowerCase();
  const lang = "pt-BR";
  try {
    let data;
    if (section === "details") {
      const id = Number(q.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "ID inválido." });
      const item = await tmdb("/" + type + "/" + id, { language: lang }, auth);
      const normalized = normalize(item, type);
      const availability = await providers(type, id, auth);
      normalized.provider_names = availability.names;
      normalized.provider_options = availability.options;
      normalized.provider_link = availability.link;
      normalized.runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]) || null;
      return res.status(200).json({ item: normalized, source: "TMDB", region: "BR", updatedAt: new Date().toISOString() });
    }
    if (section === "streaming" || section === "streaming_new") {
      // Restrict results to titles available online in Brazil; cinema-only titles are excluded.
      const today = new Date().toISOString().slice(0, 10);
      const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      // Restrict the catalog to services already integrated into Central+.
      // Without an explicit provider, a monetization-type-only discover query can
      // return titles that are not actually available on the user's streaming apps.
      const centralPlusProviderIds = [...CENTRAL_PLUS_PROVIDER_IDS].join(",");
      const providerIds = String(q.provider || centralPlusProviderIds).split(/[|,]/)
        .map(value => value.trim())
        .filter(value => /^\d+$/.test(value))
        .filter((value, index, all) => all.indexOf(value) === index)
        .join(",");
      const params = {
        language: lang,
        region: "BR",
        watch_region: "BR",
        with_watch_monetization_types: "flatrate,free,ads",
        include_adult: "false",
        sort_by: section === "streaming_new"
          ? (type === "tv" ? "first_air_date.desc" : "primary_release_date.desc")
          : "popularity.desc",
        page: Math.max(1, Math.min(5, Number(q.page) || 1))
      };
      if (section === "streaming_new") params[type === "tv" ? "first_air_date.gte" : "primary_release_date.gte"] = since;
      if (type === "tv") params["first_air_date.lte"] = today;
      else params["primary_release_date.lte"] = today;
      if (providerIds) params.with_watch_providers = providerIds;
      data = await tmdb("/discover/" + type, params, auth);
    } else if (section === "search") {
      const query = String(q.query || "").trim().slice(0,120);
      if (!query) return res.status(400).json({ error: "Informe query para pesquisar." });
      data = await tmdb("/search/" + type, { query, language: lang, region: "BR", include_adult: "false", page: 1 }, auth);
      const candidates = (data.results || []).filter(x => x.poster_path || x.backdrop_path).slice(0, 12);
      const items = await Promise.all(candidates.map(async raw => {
        const item = normalize(raw, type);
        const availability = await providers(type, item.id, auth);
        item.provider_names = availability.names;
        item.provider_options = availability.options;
        item.provider_link = availability.link;
        return item;
      }));
      const available = items.filter(item => item.provider_names.length > 0);
      return res.status(200).json({ items: available, page: data.page || 1, total_pages: data.total_pages || 1, source: "TMDB", region: "BR", updatedAt: new Date().toISOString() });
    } else {
      // Todas as vitrines comuns também partem do catálogo com disponibilidade online no Brasil.
      // Assim, tendências/populares/mais bem avaliados nunca incluem títulos sem serviço de streaming confirmado.
      const today = new Date().toISOString().slice(0, 10);
      const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const providerIds = "8,337,119,9,384,1899,307,350"; // vírgula = qualquer um destes serviços; evita exigir o título em todos os serviços
      const sortBy = section === "top_rated" ? "vote_average.desc"
        : ["new","now_playing","upcoming"].includes(section)
          ? (type === "tv" ? "first_air_date.desc" : "primary_release_date.desc")
          : "popularity.desc";
      const params = {
        language: lang, region: "BR", watch_region: "BR",
        with_watch_monetization_types: "flatrate,free,ads",
        with_watch_providers: providerIds,
        include_adult: "false", sort_by: sortBy,
        page: Math.max(1, Math.min(5, Number(q.page) || 1))
      };
      if (type === "tv") params["first_air_date.lte"] = today;
      else params["primary_release_date.lte"] = today;
      if (["new","now_playing","upcoming"].includes(section)) {
        params[type === "tv" ? "first_air_date.gte" : "primary_release_date.gte"] = since;
      }
      if (section === "top_rated") params["vote_count.gte"] = 100;
      data = await tmdb("/discover/" + type, params, auth);
    }
    // Regra central: nenhum filme/série aparece em listas públicas sem disponibilidade
    // confirmada em pelo menos um serviço integrado na região BR (assinatura/grátis/anúncios).
    const candidates = (data.results || []).filter(x => x.poster_path).map(x => normalize(x, type));
    const requestedProviderIds = String(q.provider || "").split(/[|,]/).map(x => Number(x.trim())).filter(Number.isInteger);
    const items = await Promise.all(candidates.map(async item => {
      const availability = await providers(type, item.id, auth);
      item.provider_names = availability.names;
      item.provider_options = availability.options;
      item.provider_link = availability.link;
      if (requestedProviderIds.length) {
        const matching = item.provider_options.filter(option => requestedProviderIds.includes(Number(option.id)));
        item.provider_options = matching;
        item.provider_names = [...new Set(matching.map(option => option.name))];
      }
      return item;
    }));
    const available = items.filter(item => item.provider_names.length > 0);
    return res.status(200).json({
      items: available, page: data.page || 1, total_pages: data.total_pages || 1,
      source: "TMDB", region: "BR", availabilityFiltered: true, updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Central+ TMDB catalog error:", error && error.message ? error.message : error);
    return res.status(502).json({ error: "Não foi possível consultar o catálogo TMDB agora." });
  }
};
