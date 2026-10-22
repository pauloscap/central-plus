(() => {
  const API = "/api/catalog?providers=true";
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (s) => String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const poster = item => item.poster_url || item.backdrop_url || "";
  const year = item => item.year && item.year !== "—" ? item.year : "";
  const providers = item => (item.provider_names || []).slice(0,2).join(" · ");
  const detailHref = item => (item.type === "tv" ? "/central-plus-detalhe-serie.html" : "/central-plus-detalhe-filme.html") + "?tmdbId=" + encodeURIComponent(item.id) + "&tipo=" + item.type;
  const genreSlug = item => (item.genre_ids || []).map(id => ({878:"ficcao",10765:"ficcao",18:"drama",14:"fantasia",53:"suspense",9648:"suspense",35:"comedia",16:"animacao",80:"crime",12:"aventura",10759:"aventura",28:"acao"}[id] || "")).filter(Boolean).join(" ");
  function card(item, kind) {
    const href = detailHref(item), img = poster(item), title = esc(item.title), meta = [year(item), (item.genres || []).slice(0,2).join(" · ")].filter(Boolean).join(" · ");
    const provider = providers(item);
    if (kind === "series") return '<a class="series-tile" href="'+href+'" data-series="tmdb-'+item.id+'" data-genres="'+genreSlug(item)+'" data-title="'+title+'" data-focusable><div class="series-tile-art" style="background-image:linear-gradient(0deg,rgba(4,5,9,.88),rgba(4,5,9,.05)),url(&quot;'+esc(img)+'&quot;)"><div class="series-tile-copy"><div class="series-tile-kicker">'+esc((item.genres||[]).slice(0,2).join(" · ") || "Série")+'</div><div class="series-tile-title">'+title+'</div></div></div><div class="series-tile-meta"><span>'+esc(meta || "Série")+'</span><span>'+esc(provider || "Ver opções")+'</span></div></a>';
    if (kind === "films") return '<a class="film-tile" href="'+href+'" data-focusable data-genre="'+genreSlug(item)+'" data-title="'+title+'"><div class="poster" style="aspect-ratio:2/3"><img loading="lazy" src="'+esc(img)+'" alt="Pôster de '+title+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"><span class="poster-badge">'+esc(provider || "Catálogo TMDB")+'</span><div class="poster-copy"><div class="poster-kicker">'+esc((item.genres||[]).slice(0,2).join(" · "))+'</div><div class="poster-title">'+title+'</div></div></div><div class="film-tile-meta"><span>'+esc(year(item))+'</span><span>★ '+esc(item.rating)+'</span></div></a>';
    return '<a class="cp-api-card" href="'+href+'"><div class="cp-api-poster"><img loading="lazy" src="'+esc(img)+'" alt="Pôster de '+title+'" onerror="this.style.opacity=0"></div><div class="cp-api-title">'+title+'</div><div class="cp-api-meta">'+esc([year(item), (item.genres||[]).slice(0,1).join("")].filter(Boolean).join(" · "))+'</div><div class="cp-api-provider">'+esc(provider || "Ver onde assistir")+'</div></a>';
  }
  function ensureStyles(){
    if($("#cp-api-styles")) return;
    const style=document.createElement("style");style.id="cp-api-styles";style.textContent=`
      .cp-api-live{padding:32px clamp(18px,4vw,64px);background:#08090d;color:#f6f7fb;font-family:Inter,system-ui,sans-serif}
      .cp-api-live h2{font-size:clamp(20px,2.2vw,28px);letter-spacing:-.04em;margin:0 0 6px;font-weight:750}
      .cp-api-live .cp-api-sub{font-size:12px;color:#9da3b1;margin-bottom:18px}
      .cp-api-rails{display:flex;gap:14px;overflow-x:auto;padding:4px 2px 18px;scrollbar-width:thin}
      .cp-api-card{display:block;flex:0 0 155px;min-width:0;color:inherit;text-decoration:none}
      .cp-api-poster{aspect-ratio:2/3;border-radius:12px;overflow:hidden;background:#171a22;border:1px solid #ffffff16}
      .cp-api-poster img{width:100%;height:100%;object-fit:cover;display:block}
      .cp-api-title{font-size:13px;font-weight:700;margin-top:9px;line-height:1.25}
      .cp-api-meta,.cp-api-provider{font-size:11px;color:#a7adba;margin-top:4px}
      .cp-api-provider{color:#d6d9e1}
      .cp-api-status{font-size:12px;color:#a7adba;padding:12px 0}
      .cp-api-hero{display:flex;gap:20px;align-items:center;padding:22px;margin:20px clamp(18px,4vw,64px);border-radius:18px;background:#12151d;border:1px solid #ffffff12}
      .cp-api-hero img{width:100px;border-radius:10px;flex-shrink:0}
      .cp-api-hero h2{font-size:clamp(24px,4vw,42px);margin:0 0 8px}
      .cp-api-hero p{font-size:13px;line-height:1.55;color:#c3c7d1;max-width:680px}
      .cp-api-hero a{display:inline-block;margin-top:12px;padding:10px 16px;background:#f6f7fb;color:#101116;border-radius:8px;font-weight:700;font-size:12px}
      @media(max-width:560px){.cp-api-card{flex-basis:130px}.cp-api-hero{align-items:flex-start;padding:14px}.cp-api-hero img{width:76px}}
    `;document.head.appendChild(style);
  }
  async function fetchItems(type, section, providersEnabled=true) {
    const response=await fetch(API+"&type="+type+"&section="+section+"&providers="+providersEnabled);
    const data=await response.json();
    if(!response.ok) throw new Error(data.error || "Catálogo indisponível");
    return data.items || [];
  }
  function renderCatalogGrid(items, type) {
    const grid= type==="tv" ? $("#series-grid") : $("#film-grid");
    if(!grid) return false;
    const kind=type==="tv"?"series":"films";
    grid.innerHTML=items.map(item=>card(item,kind)).join("");
    const count=$(type==="tv"?"#series-count":"#film-count");if(count)count.textContent=String(items.length);
    const empty=$(type==="tv"?"#series-empty":"#film-empty");if(empty)empty.hidden=items.length>0;
    // Rebind filters to the live TMDB cards rather than the prototype cards removed above.
    const filterSelector=type==="tv"?"[data-series-filter]":"[data-filter]";
    const filterAttr=type==="tv"?"data-series-filter":"data-filter";
    const filters=[...document.querySelectorAll(filterSelector)];
    const applyFilter=value=>{
      const tiles=[...grid.querySelectorAll(type==="tv"?".series-tile":".film-tile")];
      let visible=0;
      tiles.forEach(tile=>{const genres=(type==="tv"?tile.dataset.genres:tile.dataset.genre)||"";const show=value==="todos"||genres.split(/\\s+/).includes(value);tile.hidden=!show;if(show)visible++});
      filters.forEach(button=>{const active=button.getAttribute(filterAttr)===value;button.classList.toggle("active",active);button.setAttribute("aria-pressed",active?"true":"false")});
      if(count)count.textContent=String(visible);
      if(empty)empty.hidden=visible>0;
    };
    filters.forEach(button=>{button.onclick=()=>applyFilter(button.getAttribute(filterAttr)||"todos")});
    applyFilter("todos");
    const disclaimer=$(type==="tv"?".series-disclaimer":".film-disclaimer");
    if(disclaimer)disclaimer.textContent="Metadados, imagens e pôsteres fornecidos pelo TMDB. Serviços de streaming listados para o Brasil quando informados pela fonte; a disponibilidade pode mudar.";
    return true;
  }
  function updateFeature(item,type) {
    const isTv=type==="tv";
    const art=$(isTv?"#series-feature-art":"#film-feature-art");
    const title=$(isTv?"#series-feature-title":"#film-feature-title");
    if(!art||!title||!item)return;
    const image=item.backdrop_url||item.poster_url;
    if(image)art.style.backgroundImage='linear-gradient(90deg,rgba(5,7,12,.88),rgba(5,7,12,.1)),linear-gradient(0deg,rgba(5,7,12,.35),transparent 60%),url("'+image+'")';
    title.textContent=item.title;
    const yearEl=$(isTv?"#series-feature-year":"#film-feature-year");if(yearEl)yearEl.textContent=year(item);
    const genreEl=$(isTv?"#series-feature-genre":"#film-feature-genre");if(genreEl)genreEl.textContent=(item.genres||[]).slice(0,2).join(" · ");
    const desc=$(isTv?"#series-feature-description":"#film-feature-description");if(desc)desc.textContent=item.overview||"";
    const platform=$(isTv?"#series-feature-platform":"#film-feature-quality");if(platform)platform.textContent=providers(item)||"Explore as opções";
    const play=$(isTv?"#series-feature-play":"#film-feature-play"),more=$(isTv?"#series-feature-details":"#film-feature-details");
    const href=detailHref(item);[play,more].filter(Boolean).forEach(btn=>{btn.onclick=()=>{window.location.href=href}});
  }
  async function fillPage() {
    ensureStyles();
    const path=location.pathname;
    const isFilmPage=path.includes("central-plus-filmes")||path==="/filmes"||path==="/filmes/";
    const isSeriesPage=path.includes("central-plus-series")||path==="/series"||path==="/series/";
    if(isFilmPage||isSeriesPage){
      const type=isSeriesPage?"tv":"movie";
      const grid=$(isSeriesPage?"#series-grid":"#film-grid");
      try {
        const items = await fetchItems(type,"trending");
        renderCatalogGrid(items,type);
      } catch(error) {
        if(grid){const note=document.createElement("p");note.className="cp-api-status";note.textContent="Não foi possível carregar o catálogo: "+error.message;grid.prepend(note)}
      }
      try {
        const featured = await fetchItems(type,"popular",false);
        if(featured.length)updateFeature(featured[0],type);
      } catch(error) {
        console.warn("Central+ destaque TMDB:",error);
      }
      const dots=$(isSeriesPage?".series-feature-dots":".film-feature-dots");if(dots)dots.innerHTML="";
      return;
    }
    if(path.includes("central-plus-detalhe-filme")||path.includes("central-plus-detalhe-serie")){
      const params=new URLSearchParams(location.search),id=params.get("tmdbId"),type=params.get("tipo")==="tv"||path.includes("detalhe-serie")?"tv":"movie";
      if(id){
        try{
          const res=await fetch(API+"&type="+type+"&section=details&id="+encodeURIComponent(id)),data=await res.json();
          if(!res.ok)throw new Error(data.error||"Ficha indisponível");
          const item=data.item;
          const set=(selector,value)=>{const el=$(selector);if(el&&value!==undefined&&value!==null)el.textContent=value};
          set("#title",item.title);set("#posterTitle",item.title);set("#year",item.year);set("#yearFact",item.year);
          set("#genre",(item.genres||[]).join(" · "));set("#genreFact",(item.genres||[]).join(" · "));
          set("#rating",item.rating);set("#synopsis",item.overview);set("#longSynopsis",item.overview);
          if(type==="tv"){set("#seasons",item.seasons?item.seasons+" temporadas":"");set("#seasonsFact",item.seasons?item.seasons+" temporadas":"");}
          else {set("#duration",item.runtime?item.runtime+" min":"");set("#durationFact",item.runtime?item.runtime+" min":"");}
          const hero=$("#heroBg"),posterEl=$("#poster");
          if(hero&&item.backdrop_url)hero.style.backgroundImage='linear-gradient(90deg,rgba(5,6,10,.28),rgba(5,6,10,.08)),url("'+item.backdrop_url+'")';
          if(posterEl&&item.poster_url)posterEl.style.backgroundImage='url("'+item.poster_url+'")';
          set("#platformTag",(item.provider_names||[]).join(" · ")||"Consulte a disponibilidade no Brasil");
          const stream=$("#streamBtn");if(stream){stream.href="https://www.justwatch.com/br/busca?q="+encodeURIComponent(item.title);stream.textContent="▶ Conferir onde assistir";}
          const options=$("#watchOptionsBtn");if(options){options.href="https://www.justwatch.com/br/busca?q="+encodeURIComponent(item.title);options.textContent="Ver opções no Brasil";}
          document.title="Central+ | "+item.title;
        }catch(error){console.warn("Central+ TMDB detail:",error)}
      }
      return;
    }
    // Rebuild the home as a unified cinematic experience instead of appending rails to the legacy React artifact.
    const root=$("#root");
    if(root){
      root.style.display="none";
      document.body.classList.add("cp-home-mode");document.title="Central+ | Descubra o que assistir";
      const mount=document.createElement("main");mount.id="cp-api-home";root.insertAdjacentElement("afterend",mount);
      const homeStyles=document.createElement("style");homeStyles.id="cp-home-redesign";
      homeStyles.textContent=`
        body.cp-home-mode{margin:0;background:#07080d;color:#f5f6fa;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}
        body.cp-home-mode #cp-api-home{min-height:100vh;background:radial-gradient(ellipse at 75% 0%,rgba(69,77,110,.2),transparent 38%),#07080d}
        .cp-home-nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:32px;padding:0 clamp(20px,4.5vw,76px);height:76px;background:rgba(7,8,13,.82);backdrop-filter:blur(22px);border-bottom:1px solid #ffffff12}
        .cp-home-brand{font-size:25px;font-weight:850;letter-spacing:-1.2px;white-space:nowrap}.cp-home-brand span{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:8px;border-radius:9px;background:#f4f5f8;color:#090a10;font-size:20px}
        .cp-home-links{display:flex;align-items:center;gap:clamp(16px,2.3vw,34px)}.cp-home-links a{font-size:12px;color:#b7bdcb;text-decoration:none}.cp-home-links a:hover{color:#fff}
        .cp-home-status{margin-left:auto;color:#7f8799;font-size:10px;letter-spacing:.15em;text-transform:uppercase}
        .cp-home-hero{position:relative;min-height:clamp(540px,76vh,760px);display:flex;align-items:flex-end;overflow:hidden;background:#11141d}
        .cp-home-hero-art{position:absolute;inset:0;background-size:cover;background-position:center 30%;opacity:.82;transform:scale(1.02)}
        .cp-home-hero-art:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#07080df7 0%,rgba(7,8,13,.88) 25%,rgba(7,8,13,.35) 62%,rgba(7,8,13,.12) 100%),linear-gradient(0deg,#07080d 0%,transparent 50%),linear-gradient(180deg,rgba(7,8,13,.35),transparent 35%)}
        .cp-home-hero-copy{position:relative;z-index:1;padding:80px clamp(20px,5vw,84px) 72px;max-width:780px}
        .cp-home-eyebrow{display:flex;align-items:center;gap:10px;color:#d0d5e2;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}.cp-home-eyebrow:before{content:"";width:3px;height:18px;border-radius:3px;background:#e9ebf2}
        .cp-home-hero h1{font-size:clamp(48px,7vw,94px);line-height:.91;letter-spacing:-.07em;margin:23px 0 18px;font-weight:850;max-width:760px;text-wrap:balance}
        .cp-home-hero-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;color:#e0e3eb;font-size:12px}.cp-home-chip{border:1px solid #ffffff42;border-radius:4px;padding:5px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
        .cp-home-hero p{font-size:14px;line-height:1.8;color:#c2c7d3;max-width:580px;margin:18px 0 24px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .cp-home-actions{display:flex;gap:10px;flex-wrap:wrap}.cp-home-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:47px;padding:0 18px;border-radius:8px;background:#f4f5f8;color:#101219;font-size:12px;font-weight:800;text-decoration:none}.cp-home-btn.secondary{background:#ffffff13;border:1px solid #ffffff25;color:#fff;backdrop-filter:blur(10px)}
        .cp-home-section{padding:35px clamp(20px,4.5vw,76px) 6px}.cp-home-section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:16px}.cp-home-section h2{font-size:clamp(20px,2.2vw,28px);font-weight:780;letter-spacing:-.045em;margin:0}.cp-home-section-head p{font-size:11px;color:#8f96a8;margin:6px 0 0}.cp-home-seeall{font-size:11px;color:#c8cdda;text-decoration:none;white-space:nowrap}.cp-home-seeall:hover{color:#fff}
        .cp-home-rail{display:flex;gap:15px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 20px;scrollbar-width:thin;scrollbar-color:#343846 transparent}
        .cp-home-rail .cp-api-card{flex:0 0 clamp(132px,13vw,182px);scroll-snap-align:start}.cp-home-rail .cp-api-poster{border-radius:12px;aspect-ratio:2/3;background:#161a24;overflow:hidden;border:1px solid #ffffff14}.cp-home-rail .cp-api-poster img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}.cp-home-rail .cp-api-card:hover img{transform:scale(1.04)}
        .cp-home-rail .cp-api-title{font-size:12px;line-height:1.3;margin-top:9px;font-weight:750}.cp-home-rail .cp-api-meta,.cp-home-rail .cp-api-provider{font-size:10px;color:#9da5b5;margin-top:5px}
        .cp-home-footer{padding:28px clamp(20px,4.5vw,76px) 34px;border-top:1px solid #ffffff12;color:#737b8d;font-size:10px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:38px}
        .cp-home-error{padding:16px 0;color:#c6cad5;font-size:12px}
        @media(max-width:650px){.cp-home-nav{height:auto;min-height:68px;flex-wrap:wrap;gap:8px;padding-top:12px;padding-bottom:10px}.cp-home-brand{font-size:22px}.cp-home-links{order:3;width:100%;gap:20px;overflow:auto;padding:5px 0}.cp-home-links a{font-size:11px}.cp-home-status{font-size:8px}.cp-home-hero{min-height:600px}.cp-home-hero-copy{padding:70px 22px 52px}.cp-home-hero h1{font-size:clamp(44px,12vw,66px)}.cp-home-hero p{-webkit-line-clamp:3}.cp-home-section{padding:27px 20px 0}.cp-home-rail .cp-api-card{flex-basis:132px}.cp-home-section-head{align-items:center}}
      `;
      document.head.appendChild(homeStyles);
      mount.innerHTML=`
        <nav class="cp-home-nav"><a class="cp-home-brand" href="/"><span>+</span>Central+</a><div class="cp-home-links"><a href="/">Início</a><a href="/central-plus-filmes.html">Filmes</a><a href="/central-plus-series.html">Séries</a><a href="/central-plus-filmes.html?section=now_playing">Novidades</a></div><div class="cp-home-status">Seu próximo universo começa aqui</div></nav>
        <section class="cp-home-hero"><div class="cp-home-hero-art" id="cp-home-hero-art"></div><div class="cp-home-hero-copy"><div class="cp-home-eyebrow">Em destaque · catálogo atualizado</div><h1 id="cp-home-hero-title">Descubra sua próxima história</h1><div class="cp-home-hero-meta" id="cp-home-hero-meta"><span class="cp-home-chip">Central+ seleção</span></div><p id="cp-home-hero-overview">Filmes e séries para sua próxima maratona.</p><div class="cp-home-actions"><a class="cp-home-btn" id="cp-home-hero-details" href="/central-plus-filmes.html">＋ Explorar título</a><a class="cp-home-btn secondary" href="/central-plus-filmes.html">Explorar catálogo <span>↗</span></a></div></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Filmes em alta</h2><p>Histórias que estão chamando atenção</p></div><a class="cp-home-seeall" href="/central-plus-filmes.html">Ver todos ↗</a></div><div class="cp-home-rail" id="cp-api-home-movies"><span class="cp-api-status">Carregando filmes…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Séries em alta</h2><p>Encontre sua próxima série favorita</p></div><a class="cp-home-seeall" href="/central-plus-series.html">Ver todas ↗</a></div><div class="cp-home-rail" id="cp-api-home-series"><span class="cp-api-status">Carregando séries…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Novidades para descobrir</h2><p>Uma seleção para sair do óbvio</p></div><a class="cp-home-seeall" href="/central-plus-filmes.html">Explorar ↗</a></div><div class="cp-home-rail" id="cp-api-home-new"><span class="cp-api-status">Carregando novidades…</span></div></section>
        <footer class="cp-home-footer"><span>Central+ · Descubra o que assistir</span><span>Metadados e imagens fornecidos pelo TMDB. A Central+ não é endossada pelo TMDB.</span></footer>`;
      const loadRail=async(id,type,section,limit=18)=>{
        const rail=$("#"+id,mount);
        try{
          const items=await fetchItems(type,section);
          rail.innerHTML=items.slice(0,limit).map(x=>card(x,"home")).join("")||'<div class="cp-home-error">Nenhum título encontrado nesta seleção.</div>';
          return items;
        }catch(error){
          rail.innerHTML='<div class="cp-home-error">Não foi possível carregar esta seleção. <a href="/api/catalog?type='+type+'&section='+section+'" style="text-decoration:underline">Ver resposta da API</a></div>';
          console.error("Central+ home catalog:",id,error);
          return [];
        }
      };
      const [movies,series,newMovies,newSeries]=await Promise.all([
        loadRail("cp-api-home-movies","movie","trending",18),
        loadRail("cp-api-home-series","tv","trending",18),
        loadRail("cp-api-home-new","movie","now_playing",8),
        fetchItems("tv","upcoming").catch(error=>{console.warn("Central+ upcoming:",error);return []})
      ]);
      const combined=newMovies.slice(0,8).concat(newSeries.slice(0,8));
      $("#cp-api-home-new",mount).innerHTML=combined.map(x=>card(x,"home")).join("")||'<div class="cp-home-error">Novidades indisponíveis no momento.</div>';
      const feature=movies[0]||series[0];
      if(feature){
        const hero=$("#cp-home-hero-art",mount);if(hero)hero.style.backgroundImage='url("'+(feature.backdrop_url||feature.poster_url||"")+'")';
        const title=$("#cp-home-hero-title",mount);if(title)title.textContent=feature.title;
        const meta=$("#cp-home-hero-meta",mount);if(meta)meta.innerHTML='<span class="cp-home-chip">'+esc(year(feature)||"Em destaque")+'</span><span>'+esc((feature.genres||[]).slice(0,3).join(" · "))+'</span><span>★ '+esc(feature.rating||"—")+'</span>';
        const overview=$("#cp-home-hero-overview",mount);if(overview)overview.textContent=feature.overview||"Descubra mais sobre este título no catálogo Central+.";
        const detail=$("#cp-home-hero-details",mount);if(detail)detail.href=detailHref(feature);
      }
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fillPage,{once:true});else fillPage();
})();