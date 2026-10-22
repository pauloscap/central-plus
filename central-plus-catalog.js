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
      try{
        const [items,featured]=await Promise.all([fetchItems(type,"trending"),fetchItems(type,"popular",false)]);
        renderCatalogGrid(items,type);updateFeature(featured[0]||items[0],type);
        const dots=$(isSeriesPage?".series-feature-dots":".film-feature-dots");if(dots)dots.innerHTML="";
      }catch(error){
        const grid=$(isSeriesPage?"#series-grid":"#film-grid");
        if(grid){const note=document.createElement("p");note.className="cp-api-status";note.textContent="O catálogo automático precisa da chave TMDB nas variáveis da Vercel. "+error.message;grid.prepend(note)}
      }
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
    // Home React shell: add API-fed rails after the app, without disturbing its existing state tree.
    if($("#root")){
      const root=$("#root"),mount=document.createElement("div");mount.id="cp-api-home";
      root.insertAdjacentElement("afterend",mount);
      mount.innerHTML='<section class="cp-api-live"><h2>Filmes em alta</h2><div class="cp-api-sub">Atualizado pelo TMDB · catálogo de filmes</div><div class="cp-api-rails" id="cp-api-home-movies"><span class="cp-api-status">Carregando filmes…</span></div></section><section class="cp-api-live"><h2>Séries em alta</h2><div class="cp-api-sub">Atualizado pelo TMDB · catálogo de séries</div><div class="cp-api-rails" id="cp-api-home-series"><span class="cp-api-status">Carregando séries…</span></div></section><section class="cp-api-live"><h2>Novidades para descobrir</h2><div class="cp-api-sub">Filmes e séries recentes para explorar</div><div class="cp-api-rails" id="cp-api-home-new"><span class="cp-api-status">Carregando novidades…</span></div></section><div class="cp-api-sub" style="padding:10px 24px 24px">This product uses the TMDB API but is not endorsed or certified by TMDB.</div>';
      try{
        const [movies,series,newMovies,newSeries]=await Promise.all([fetchItems("movie","trending"),fetchItems("tv","trending"),fetchItems("movie","now_playing",false),fetchItems("tv","upcoming",false)]);
        $("#cp-api-home-movies",mount).innerHTML=movies.slice(0,18).map(x=>card(x,"home")).join("");
        $("#cp-api-home-series",mount).innerHTML=series.slice(0,18).map(x=>card(x,"home")).join("");
        $("#cp-api-home-new",mount).innerHTML=newMovies.slice(0,8).concat(newSeries.slice(0,8)).map(x=>card(x,"home")).join("");
      }catch(error){mount.querySelectorAll(".cp-api-rails").forEach(el=>el.innerHTML='<div class="cp-api-status">Para carregar pôsteres e metadados atualizados, configure TMDB_BEARER_TOKEN nas variáveis de ambiente da Vercel.</div>')}
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fillPage,{once:true});else fillPage();
})();