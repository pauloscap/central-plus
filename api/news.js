const FEEDS = [
  { source: "g1", category: "nacionais", site: "https://g1.globo.com/", feed: "https://g1.globo.com/rss/g1/" },
  { source: "g1 Pará", category: "para", site: "https://g1.globo.com/pa/para/", feed: "https://g1.globo.com/rss/g1/pa/para/" },
  { source: "UOL Notícias", category: "nacionais", site: "https://noticias.uol.com.br/", feed: "https://rss.uol.com.br/feed/noticias.xml" },
  { source: "Estadão", category: "nacionais", site: "https://www.estadao.com.br/", feed: "https://www.estadao.com.br/arc/outboundfeeds/rss/?outputType=xml" },
  { source: "Folha de S.Paulo", category: "nacionais", site: "https://www.folha.uol.com.br/", feed: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml" },
  { source: "BBC News Brasil", category: "nacionais", site: "https://www.bbc.com/portuguese", feed: "https://feeds.bbci.co.uk/portuguese/rss.xml" },
  { source: "Agência Brasil", category: "nacionais", site: "https://agenciabrasil.ebc.com.br/", feed: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml" },
  { source: "CNN Brasil", category: "nacionais", site: "https://www.cnnbrasil.com.br/", feed: "https://www.cnnbrasil.com.br/feed/" },
  { source: "O Globo", category: "nacionais", site: "https://oglobo.globo.com/", feed: "https://oglobo.globo.com/rss/oglobo" },
  { source: "Valor Econômico", category: "nacionais", site: "https://valor.globo.com/", feed: "https://valor.globo.com/rss/valor" },
  { source: "Metrópoles", category: "nacionais", site: "https://www.metropoles.com/", feed: "https://www.metropoles.com/feed" },
  { source: "O Liberal", category: "para", site: "https://www.oliberal.com/", feed: "https://www.oliberal.com/rss" },
  { source: "DOL — Diário Online", category: "para", site: "https://dol.com.br/", feed: "https://dol.com.br/rss" },
  { source: "Agência Pará", category: "para", site: "https://agenciapara.com.br/", feed: "https://agenciapara.com.br/rss" },
  { source: "Omelete", category: "cinema", site: "https://www.omelete.com.br/", feed: "https://www.omelete.com.br/rss" },
  { source: "Jovem Nerd", category: "cinema", site: "https://jovemnerd.com.br/", feed: "https://jovemnerd.com.br/feed/" },
  { source: "Rolling Stone Brasil", category: "celebridades", site: "https://rollingstone.com.br/", feed: "https://rollingstone.com.br/feed/" },
  { source: "Superinteressante", category: "ciencia", site: "https://super.abril.com.br/", feed: "https://super.abril.com.br/feed/" },
  { source: "National Geographic Brasil", category: "ciencia", site: "https://www.nationalgeographicbrasil.com/", feed: "https://www.nationalgeographicbrasil.com/rss.xml" },
  { source: "Pesquisa FAPESP", category: "ciencia", site: "https://revistapesquisa.fapesp.br/", feed: "https://revistapesquisa.fapesp.br/feed/" },
  { source: "Ciência Hoje", category: "ciencia", site: "https://cienciahoje.org.br/", feed: "https://cienciahoje.org.br/feed/" },
  { source: "Canaltech", category: "ia", site: "https://canaltech.com.br/", feed: "https://canaltech.com.br/rss/" },
  { source: "Tecnoblog", category: "ia", site: "https://tecnoblog.net/", feed: "https://tecnoblog.net/feed/" },
  { source: "Olhar Digital", category: "ia", site: "https://olhardigital.com.br/", feed: "https://olhardigital.com.br/feed/" },
  { source: "MIT Technology Review", category: "ia", site: "https://mittechreview.com.br/", feed: "https://www.technologyreview.com/topic/artificial-intelligence/feed/" },
  { source: "The Verge", category: "ia", site: "https://www.theverge.com/", feed: "https://www.theverge.com/rss/index.xml" },
  { source: "OpenAI", category: "ia", site: "https://openai.com/news/", feed: "https://openai.com/news/rss.xml" },
  { source: "Google DeepMind", category: "ia", site: "https://deepmind.google/discover/blog/", feed: "https://deepmind.google/blog/rss.xml" },
  { source: "Agência Pública", category: "jornalismo", site: "https://apublica.org/", feed: "https://apublica.org/feed/" },
  { source: "Meio & Mensagem", category: "jornalismo", site: "https://www.meioemensagem.com.br/", feed: "https://www.meioemensagem.com.br/feed" },
  { source: "Nexo Jornal", category: "jornalismo", site: "https://www.nexojornal.com.br/", feed: "https://www.nexojornal.com.br/rss" },
  { source: "IPHAN", category: "patrimonio", site: "https://www.gov.br/iphan/pt-br", feed: "https://www.gov.br/iphan/pt-br/noticias/RSS" },
  { source: "Museu Paraense Emílio Goeldi", category: "patrimonio", site: "https://www.gov.br/museugoeldi/pt-br", feed: "https://www.gov.br/museugoeldi/pt-br/noticias/RSS" }
];

const FEED_TIMEOUT_MS = 4300;
const USER_AGENT = "CentralPlusNewsroom/1.0 (+https://central-plus-roan.vercel.app)";

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&#x([0-9a-f]+);/gi, function (_, hex) { return String.fromCodePoint(parseInt(hex, 16)); })
    .replace(/&#(\d+);/g, function (_, dec) { return String.fromCodePoint(parseInt(dec, 10)); })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'");
}

function textOnly(value) {
  return decodeEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(xml, tagName) {
  const namespaced = tagName.indexOf(":") >= 0 ? tagName : "(?:[\\w.-]+:)?" + tagName;
  const expression = new RegExp("<" + namespaced + "\\b[^>]*>([\\s\\S]*?)<\\/" + namespaced + "\\s*>", "i");
  const match = xml.match(expression);
  return match ? match[1] : "";
}

function getAttribute(fragment, attribute) {
  const match = fragment.match(new RegExp("\\b" + attribute + "\\s*=\\s*['\"]([^'\"]+)['\"]", "i"));
  return match ? decodeEntities(match[1]).trim() : "";
}

function firstLink(xml) {
  const nodes = xml.match(/<(?:[\w.-]+:)?link\b[^>]*>(?:[\s\S]*?)<\/(?:[\w.-]+:)?link\s*>|<(?:[\w.-]+:)?link\b[^>]*\/?>/gi) || [];
  for (const node of nodes) {
    const rel = getAttribute(node, "rel").toLowerCase();
    if (rel === "self" || rel === "enclosure" || rel === "hub") continue;
    const href = getAttribute(node, "href");
    const body = textOnly(node.replace(/^<[^>]*>/, "").replace(/<\/[^>]*>\s*$/, ""));
    const candidate = href || body;
    if (candidate) return candidate;
  }
  return textOnly(getTag(xml, "link"));
}

function getImage(xml, description) {
  const candidates = [
    /<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/i,
    /<image\b[\s\S]*?<url\b[^>]*>[\s\S]*?<\/url>/i
  ];
  for (const expression of candidates) {
    const match = xml.match(expression);
    if (match) {
      const url = getAttribute(match[0], "url") || textOnly(getTag(match[0], "url"));
      if (/^https?:\/\//i.test(url)) return url;
    }
  }
  const decoded = decodeEntities(description);
  const img = decoded.match(/<img\b[^>]*(?:src|data-src)\s*=\s*['"]([^'"]+)['"][^>]*>/i);
  if (img && /^https?:\/\//i.test(img[1])) return img[1];
  return "";
}

function normalizeUrl(value, base) {
  const candidate = decodeEntities(value).trim();
  if (!candidate) return "";
  try {
    const parsed = new URL(candidate, base);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    parsed.hash = "";
    return parsed.toString();
  } catch (_) {
    return "";
  }
}

function parseDate(value) {
  if (!value) return null;
  const time = Date.parse(textOnly(value));
  if (!Number.isFinite(time) || time > Date.now() + 24 * 60 * 60 * 1000) return null;
  return new Date(time).toISOString();
}

function parseItems(xml, feed) {
  const entries = xml.match(/<(?:item|entry)\b[^>]*>[\s\S]*?<\/(?:item|entry)\s*>/gi) || [];
  const results = [];
  for (const entry of entries.slice(0, 8)) {
    const title = textOnly(getTag(entry, "title"));
    if (!title) continue;
    const rawLink = firstLink(entry) || textOnly(getTag(entry, "guid"));
    const url = normalizeUrl(rawLink, feed.site);
    if (!url || url === feed.site) continue;
    const rawSummary = getTag(entry, "description") || getTag(entry, "summary") || getTag(entry, "content:encoded") || getTag(entry, "content");
    let summary = textOnly(rawSummary);
    if (summary.length > 260) {
      const cutoff = summary.lastIndexOf(" ", 235);
      summary = summary.slice(0, cutoff > 150 ? cutoff : 235).trimEnd() + "…";
    }
    const rawDate = getTag(entry, "pubDate") || getTag(entry, "published") || getTag(entry, "updated") || getTag(entry, "dc:date") || getTag(entry, "date");
    const image = getImage(entry, rawSummary);
    results.push({
      id: feed.source.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Buffer.from(url).toString("base64url").slice(0, 18),
      title: title,
      summary: summary,
      url: url,
      image: image,
      source: feed.source,
      sourceUrl: feed.site,
      category: feed.category,
      publishedAt: parseDate(rawDate)
    });
  }
  return results;
}

async function loadFeed(feed) {
  const response = await fetch(feed.feed, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5"
    },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    redirect: "follow"
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const xml = (await response.text()).slice(0, 1000000);
  if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml) || !/<(?:item|entry)\b/i.test(xml)) {
    throw new Error("Feed XML sem itens reconhecíveis");
  }
  return { feed: feed, items: parseItems(xml, feed) };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido." });
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    const outcomes = await Promise.allSettled(FEEDS.map(loadFeed));
    const successful = [];
    const failedSources = [];
    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i];
      if (outcome.status === "fulfilled") successful.push(outcome.value);
      else failedSources.push(FEEDS[i].source);
    }

    const unique = new Map();
    for (const batch of successful) {
      for (const item of batch.items) {
        const key = item.url.replace(/[?&](utm_[^=]+|fbclid|gclid)=[^&]*/gi, "");
        if (!unique.has(key)) unique.set(key, item);
      }
    }

    const now = Date.now();
    const sortNewest = (a, b) => {
      const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return db - da;
    };
    // Balance the catalog across categories so a high-volume feed cannot hide every slower category.
    const buckets = new Map();
    for (const item of unique.values()) {
      if (!buckets.has(item.category)) buckets.set(item.category, []);
      buckets.get(item.category).push(item);
    }
    const balanced = [];
    for (const categoryItems of buckets.values()) {
      balanced.push(...categoryItems.sort(sortNewest).slice(0, 12));
    }
    const items = balanced.sort(sortNewest);

    const requestedLimit = Number((req.query && req.query.limit) || 96);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(12, Math.round(requestedLimit))) : 96;

    return res.status(200).json({
      updatedAt: new Date(now).toISOString(),
      items: items.slice(0, limit),
      sourceCount: successful.length,
      failedSourceCount: failedSources.length,
      failedSources: failedSources,
      totalItems: items.length,
      refreshMinutes: 10
    });
  } catch (error) {
    console.error("Central+ news feed error:", error && error.message ? error.message : error);
    return res.status(502).json({
      error: "Não foi possível consultar as fontes de notícias neste momento.",
      items: [],
      updatedAt: new Date().toISOString()
    });
  }
};