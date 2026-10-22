const CHANNEL_SOURCES = [
  { id: "tv-globo-pa", url: "https://globoplay.globo.com/tv-globo/ao-vivo/7832875/", kind: "page" },
  { id: "sbt-para", url: "https://www.sbt.com.br/ao-vivo", kind: "sbt" },
  { id: "rbatv", url: "https://rbatv.dol.com.br/aovivo/", kind: "page" },
  { id: "tv-cultura-pa", url: "https://www.portalcultura.com.br/pt-br", kind: "page" },
  { id: "cnn-brasil", url: "https://www.youtube.com/@CNNBrasil/live", kind: "youtube" },
  { id: "globonews", url: "https://globoplay.globo.com/globonews/ao-vivo/7339101/", kind: "page" },
  { id: "band-jornalismo", url: "https://www.youtube.com/@BandJornalismo/live", kind: "youtube" },
  { id: "sportv", url: "https://globoplay.globo.com/sportv/ao-vivo/9045469/", kind: "page" },
  { id: "cazetv", url: "https://www.youtube.com/@CazeTV/live", kind: "youtube" },
  { id: "tv-brasil", url: "https://tvbrasil.ebc.com.br/webtv/", kind: "page" },
  { id: "canal-gov", url: "https://canalgov.ebc.com.br/ao-vivo", kind: "page" },
  { id: "sbt-national", url: "https://www.sbt.com.br/ao-vivo", kind: "sbt" }
];

const TIMEOUT_MS = 4200;
const USER_AGENT = "CentralPlusLivePreview/1.0 (+https://central-plus-roan.vercel.app)";

function decode(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function getAttribute(tag, key) {
  const expression = new RegExp("(?:^|\\s)" + key + "\\s*=\\s*(['\"])(.*?)\\1", "i");
  const match = String(tag || "").match(expression);
  return match ? decode(match[2]).trim() : "";
}

function normalizeImage(value, base) {
  const candidate = decode(value).trim();
  if (!candidate || /^(data:|blob:|javascript:)/i.test(candidate)) return "";
  try {
    const url = new URL(candidate, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (url.username || url.password) return "";
    return url.href;
  } catch (_) {
    return "";
  }
}

function metaImages(html, base) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const results = [];
  for (const tag of tags) {
    const key = (getAttribute(tag, "property") || getAttribute(tag, "name") || getAttribute(tag, "itemprop")).toLowerCase();
    if (!["og:image", "og:image:url", "twitter:image", "twitter:image:src", "thumbnail"].includes(key)) continue;
    const value = getAttribute(tag, "content");
    const url = normalizeImage(value, base);
    if (url && !results.includes(url)) results.push(url);
  }
  return results;
}

function posterImages(html, base) {
  const results = [];
  const tags = html.match(/<(?:video|img|meta)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const values = [
      getAttribute(tag, "poster"),
      getAttribute(tag, "data-poster"),
      getAttribute(tag, "data-src"),
      getAttribute(tag, "data-lazy-src"),
      getAttribute(tag, "src")
    ];
    for (const value of values) {
      const url = normalizeImage(value, base);
      if (!url) continue;
      if (/\.svg(?:[?#]|$)/i.test(url) && !/logo|brand|channel/i.test(url)) continue;
      if (!results.includes(url)) results.push(url);
    }
  }
  return results;
}

function extractVideoId(value) {
  const text = decode(value);
  const patterns = [
    /[?&](?:videoID|videoId|video|vid)=([A-Za-z0-9_-]{6,})/i,
    /(?:youtube\.com\/watch\?(?:[^#]*&)?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
    /"videoId"\s*:\s*"([A-Za-z0-9_-]{6,})"/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  try {
    const url = new URL(text);
    const value = url.searchParams.get("videoID") || url.searchParams.get("videoId") ||
      url.searchParams.get("video") || url.searchParams.get("vid") || url.searchParams.get("v");
    if (value && /^[A-Za-z0-9_-]{6,}$/.test(value)) return value;
  } catch (_) {}
  return "";
}

function isExplicitlyLive(html) {
  return /"isLiveContent"\s*:\s*true|"isLiveNow"\s*:\s*true|"isLiveBroadcast"\s*:\s*true|"isLive"\s*:\s*true|<meta[^>]+itemprop=["']isLiveBroadcast["'][^>]+content=["']true["']/i.test(html);
}

function thumbnailCandidates(videoId) {
  if (!videoId) return [];
  return [
    "https://i.ytimg.com/vi/" + videoId + "/maxresdefault_live.jpg",
    "https://i.ytimg.com/vi/" + videoId + "/hqdefault_live.jpg",
    "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg",
    "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg"
  ];
}

async function fetchPage(source) {
  try {
    const response = await fetch(source.url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const html = (await response.text()).slice(0, 1800000);
    const finalUrl = response.url || source.url;
    let images = [];
    let live = false;
    let title = "";

    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) title = decode(titleMatch[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 150);

    if (source.kind === "youtube") {
      const videoId = extractVideoId(finalUrl) || extractVideoId(html);
      live = Boolean(videoId && isExplicitlyLive(html));
      if (live) images = thumbnailCandidates(videoId);
      if (!images.length) images = metaImages(html, finalUrl);
    } else if (source.kind === "sbt") {
      const iframeTags = html.match(/<(?:iframe|a)\b[^>]*>/gi) || [];
      let videoId = "";
      for (const tag of iframeTags) {
        const candidate = getAttribute(tag, "src") || getAttribute(tag, "href");
        if (/youtube-player\.sbtlab\.io|youtube\.com|youtube-nocookie\.com/i.test(candidate)) {
          videoId = extractVideoId(candidate);
          if (videoId) break;
        }
      }
      if (!videoId) videoId = extractVideoId(html);
      if (videoId) {
        images = thumbnailCandidates(videoId);
        live = true; // SBT embeds this video player from its official Ao Vivo page.
      }
      images = images.concat(metaImages(html, finalUrl));
    } else {
      // Some broadcasters publish a poster for their embedded player; otherwise use
      // the official page artwork rather than inventing a frame from the transmission.
      images = posterImages(html, finalUrl).concat(metaImages(html, finalUrl));
    }

    images = [...new Set(images.map(url => normalizeImage(url, finalUrl)).filter(Boolean))].slice(0, 5);
    return {
      id: source.id,
      images,
      kind: live ? "live" : (images.length ? "official" : "none"),
      title,
      sourceUrl: finalUrl,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: source.id,
      images: [],
      kind: "none",
      error: error && error.message ? error.message : "Fonte indisponível"
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    const previews = await Promise.all(CHANNEL_SOURCES.map(fetchPage));
    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      refreshSeconds: 300,
      items: previews
    });
  } catch (error) {
    console.error("Central+ live preview error:", error && error.message ? error.message : error);
    return res.status(502).json({ error: "Não foi possível consultar as prévias oficiais.", items: [] });
  }
};