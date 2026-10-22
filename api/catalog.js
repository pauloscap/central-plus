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
  1899:"Max",15:"Hulu",386:"Peacock"
};
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
    provider_names: []
  };
}
async function providers(type, id, auth) {
  try {
    const data = await tmdb("/" + type + "/" + id + "/watch/providers", {}, auth);
    const br = data.results && data.results.BR;
    if (!br) return [];
    const list = [].concat(br.flatrate || [], br.rent || [], br.buy || []);
    const names = [...new Set(list.map(p => p.provider_name).filter(Boolean))];
    return names.slice(0, 5);
  } catch (_) { return []; }
}
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=21600");
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
      normalized.provider_names = await providers(type, id, auth);
      normalized.runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]) || null;
      return res.status(200).json({ item: normalized, source: "TMDB", region: "BR", updatedAt: new Date().toISOString() });
    }
    if (section === "search") {
      const query = String(q.query || "").trim().slice(0,120);
      if (!query) return res.status(400).json({ error: "Informe query para pesquisar." });
      data = await tmdb("/search/" + type, { query, language: lang, region: "BR", include_adult: "false", page: 1 }, auth);
    } else {
      const routes = type === "tv"
        ? { trending:"/trending/tv/week", popular:"/tv/popular", top_rated:"/tv/top_rated", upcoming:"/tv/on_the_air", now_playing:"/tv/airing_today", new:"/tv/on_the_air" }
        : { trending:"/trending/movie/week", popular:"/movie/popular", top_rated:"/movie/top_rated", upcoming:"/movie/upcoming", now_playing:"/movie/now_playing", new:"/movie/now_playing" };
      const route = routes[section] || routes.trending;
      const params = { language: lang, page: Math.max(1, Math.min(5, Number(q.page) || 1)) };
      if (type === "movie" && ["upcoming","now_playing","new"].includes(section)) params.region = "BR";
      if (type === "tv" && ["upcoming","now_playing","new"].includes(section)) params.timezone = "America/Sao_Paulo";
      data = await tmdb(route, params, auth);
    }
    const items = (data.results || []).filter(x => x.poster_path).map(x => normalize(x, type));
    const enrich = String(q.providers || "true") !== "false";
    if (enrich) {
      await Promise.all(items.slice(0, 12).map(async item => { item.provider_names = await providers(type, item.id, auth); }));
    }
    return res.status(200).json({
      items, page: data.page || 1, total_pages: data.total_pages || 1,
      source: "TMDB", region: "BR", updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Central+ TMDB catalog error:", error && error.message ? error.message : error);
    return res.status(502).json({ error: "Não foi possível consultar o catálogo TMDB agora." });
  }
};
