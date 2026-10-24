(() => {
  const API = "/api/catalog";
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
    return '<a class="cp-api-card" href="'+href+'"><div class="cp-api-poster"><img loading="lazy" src="'+esc(item.backdrop_url || img)+'" alt="Imagem de '+title+'" onerror="this.style.opacity=0"></div><div class="cp-api-title">'+title+'</div><div class="cp-api-meta">'+esc([year(item), (item.genres||[]).slice(0,1).join("")].filter(Boolean).join(" · "))+'</div><div class="cp-api-provider">'+esc(provider || "Ver onde assistir")+'</div></a>';
  }
  function ensureStyles(){
    if($("#cp-api-styles")) return;
    const style=document.createElement("style");style.id="cp-api-styles";style.textContent=`
      .cp-film-wide{display:block;flex:0 0 clamp(245px,27vw,390px);min-width:0;color:inherit;text-decoration:none;scroll-snap-align:start;transition:transform .22s}
      .cp-film-wide:hover{transform:translateY(-4px)}
      .cp-film-wide-art{position:relative;aspect-ratio:16/9;border-radius:11px;overflow:hidden;border:1px solid #ffffff16;background:#151923 center/cover no-repeat}
      .cp-film-wide-copy{position:absolute;left:14px;right:12px;bottom:13px;display:flex;flex-direction:column;gap:5px}
      .cp-film-wide-copy strong{font-size:clamp(14px,1.5vw,19px);line-height:1.1;letter-spacing:-.035em}
      .cp-film-wide-kicker{font-size:9px;color:#d0d4df;letter-spacing:.04em}
      .cp-film-wide-badge{position:absolute;left:10px;top:10px;z-index:2;border:1px solid #ffffff38;border-radius:4px;padding:5px 7px;background:#080a10c9;font-size:9px;font-weight:750}
      .cp-film-wide-meta{display:flex;justify-content:space-between;gap:8px;padding:8px 2px 0;font-size:10px;color:#aeb4c2}
      .cp-streaming-rails-heading{padding:34px 0 10px}.cp-streaming-rails-heading h2{font-size:clamp(23px,3vw,34px);letter-spacing:-.05em;margin:8px 0}.cp-streaming-rails-heading p{font-size:12px;color:#aeb4c2}
      .cp-streaming-row{margin:28px 0 34px}.cp-streaming-row-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-right:var(--gutter);margin-bottom:12px}.cp-streaming-row-head h3{margin:0;font-size:clamp(17px,2vw,22px);letter-spacing:-.035em}.cp-streaming-row-head span{font-size:10px;color:#939aaa}
      .cp-streaming-row-track{display:flex;gap:14px;overflow-x:auto;overflow-y:hidden;padding:3px var(--gutter) 18px 3px;scroll-snap-type:x mandatory;scrollbar-width:none}.cp-streaming-row-track::-webkit-scrollbar{display:none}
      .cp-streaming-status{font-size:12px;color:#aeb4c2;padding:12px 0}
      .app[data-page="filmes"] #film-grid{display:flex;gap:14px;overflow-x:auto;overflow-y:hidden;padding:5px var(--gutter) 18px 3px;scroll-snap-type:x mandatory;scrollbar-width:none}
      .app[data-page="filmes"] #film-grid::-webkit-scrollbar{display:none}
      .app[data-page="filmes"] #film-grid .cp-film-wide[hidden]{display:none}
      .app[data-page="filmes"] .film-toolbar{align-items:center}
      @media(max-width:600px){.cp-film-wide{flex-basis:78vw}.cp-streaming-row-head span{display:none}.cp-streaming-row{margin:22px 0}.cp-streaming-rails-heading{padding-top:25px}}
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
    const response=await fetch(API+"?type="+type+"&section="+section+"&providers="+providersEnabled);
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
  const MOVIE_GENRES = [
    [28,"acao","Ação"],[12,"aventura","Aventura"],[16,"animacao","Animação"],
    [35,"comedia","Comédia"],[80,"crime","Crime"],[99,"documentario","Documentário"],
    [18,"drama","Drama"],[10751,"familia","Família"],[14,"fantasia","Fantasia"],
    [27,"terror","Terror"],[9648,"misterio","Mistério"],[10749,"romance","Romance"],
    [878,"ficcao","Ficção científica"],[53,"suspense","Suspense"],[10752,"guerra","Guerra"]
  ];
  // Ordem editorial solicitada para as fileiras de filmes por plataforma.
  const STREAMING_SERVICES = [
    {label:"Netflix",provider:"8"},
    {label:"Disney+",provider:"337"},
    {label:"Prime Video",provider:"119|9"},
    {label:"HBO Max",provider:"384|1899"},
    {label:"Globoplay",provider:"307"},
    {label:"Apple TV",provider:"350|2"},
    {label:"MUBI",provider:"11"},
    {label:"Paramount+",provider:"531"},
    {label:"Crunchyroll",provider:"283"}
  ];
  function movieGenreSlugs(item){
    return (item.genre_ids||[]).map(id=>{const g=MOVIE_GENRES.find(x=>x[0]===id);return g?g[1]:"";}).filter(Boolean).join(" ");
  }
  function horizontalMovieCard(item, serviceLabel){
    const href=detailHref(item), image=poster(item), title=esc(item.title);
    const genres=(item.genres||[]).slice(0,2).join(" · ");
    return '<a class="cp-film-wide" href="'+href+'" data-genre="'+movieGenreSlugs(item)+'" data-title="'+title+'">'+
      '<div class="cp-film-wide-art" style="background-image:linear-gradient(0deg,rgba(4,5,9,.9),rgba(4,5,9,.02) 78%),url(&quot;'+esc(image)+'&quot;)">'+
      '<span class="cp-film-wide-badge">'+esc(serviceLabel||providers(item)||"Streaming")+'</span>'+
      '<div class="cp-film-wide-copy"><span class="cp-film-wide-kicker">'+esc(genres||"Filme")+'</span><strong>'+title+'</strong></div></div>'+
      '<div class="cp-film-wide-meta"><span>'+esc(year(item)||"Filme")+'</span><span>Ver detalhes ↗</span></div></a>';
  }
  async function fetchStreamingProvider(provider){
    const response=await fetch(API+"?type=movie&section=streaming&providers=false&provider="+encodeURIComponent(provider));
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Streaming indisponível");
    return data.items||[];
  }
  async function renderFilmStreamingPage(items, launches){
    const grid=$("#film-grid"),filterRoot=$(".film-filters");
    if(!grid)return;
    const title=$("#filmes .films-intro h1");
    if(title)title.innerHTML='Filmes para <span>assistir agora.</span>';
    const intro=$("#filmes .films-intro p");
    if(intro)intro.textContent="Lançamentos e descobertas disponíveis nos serviços de streaming no Brasil. Escolha um gênero ou explore por plataforma.";

    // O destaque usa seis lançamentos recentes, já filtrados pela disponibilidade de streaming no Brasil.
    const featureItems=[];
    (launches||[]).concat(items||[]).forEach(item=>{
      if(!item||!item.id||featureItems.some(x=>String(x.id)===String(item.id)))return;
      featureItems.push(item);
    });
    const slides=featureItems.slice(0,6);
    const featureNode=$("#film-feature");
    if(slides.length&&featureNode){
      featureNode.hidden=false;
      featureNode.dataset.apiManaged="true";
      const dotsRoot=$(".film-feature-dots");
      if(dotsRoot){
        dotsRoot.hidden=false;
        dotsRoot.innerHTML=slides.map((item,i)=>'<button class="film-feature-dot'+(i===0?' active':'')+'" type="button" data-api-feature-slide="'+i+'" aria-label="Ver destaque: '+esc(item.title)+'" aria-current="'+(i===0?'true':'false')+'"></button>').join("");
      }
      const controls=$(".film-feature-controls");if(controls)controls.hidden=false;
      let current=0,timer=null,paused=false;
      const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderSlide=index=>{
        current=(index+slides.length)%slides.length;
        const item=slides[current];
        updateFeature(item,"movie");
        const kicker=$("#film-feature-kicker");
        if(kicker)kicker.textContent="LANÇAMENTO NO STREAMING · "+(providers(item)||"DISPONÍVEL NO BRASIL");
        const runtime=$("#film-feature-runtime");if(runtime)runtime.textContent="Filme";
        const quality=$("#film-feature-quality");if(quality)quality.textContent=providers(item)||"Streaming";
        const number=$("#film-feature-index-number");if(number)number.textContent=String(current+1).padStart(2,"0");
        if(dotsRoot)dotsRoot.querySelectorAll("[data-api-feature-slide]").forEach((dot,i)=>{
          const active=i===current;dot.classList.toggle("active",active);dot.setAttribute("aria-current",active?"true":"false");
        });
      };
      const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
      const start=()=>{stop();if(!paused&&!reduced&&slides.length>1)timer=setInterval(()=>renderSlide(current+1),5000);};
      const choose=index=>{renderSlide(index);start();};
      if(dotsRoot)dotsRoot.querySelectorAll("[data-api-feature-slide]").forEach(dot=>dot.addEventListener("click",()=>choose(Number(dot.dataset.apiFeatureSlide))));
      const prev=$("#film-feature-prev"),next=$("#film-feature-next");
      if(prev)prev.onclick=()=>choose(current-1);
      if(next)next.onclick=()=>choose(current+1);
      featureNode.onmouseenter=()=>{paused=true;stop();};
      featureNode.onmouseleave=()=>{paused=false;start();};
      featureNode.onfocusin=()=>{paused=true;stop();};
      featureNode.onfocusout=event=>{if(!featureNode.contains(event.relatedTarget)){paused=false;start();}};
      renderSlide(0);start();
    }else if(featureNode){featureNode.hidden=true;}

    grid.innerHTML=(items||[]).map(item=>horizontalMovieCard(item)).join("");
    const genreList=MOVIE_GENRES.filter(g=>(items||[]).some(item=>(item.genre_ids||[]).includes(g[0])));
    if(filterRoot){
      filterRoot.innerHTML='<button class="film-filter active" data-filter="todos" type="button" aria-pressed="true">Todos</button>'+
        genreList.map(g=>'<button class="film-filter" data-filter="'+g[1]+'" type="button" aria-pressed="false">'+g[2]+'</button>').join("");
      filterRoot.setAttribute("aria-label","Filtrar filmes por gênero");
      filterRoot.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
        const selected=button.dataset.filter||"todos";
        grid.querySelectorAll(".cp-film-wide").forEach(tile=>{tile.hidden=selected!=="todos"&&tile.dataset.genre.split(" ").indexOf(selected)<0;});
        filterRoot.querySelectorAll(".film-filter").forEach(b=>{const active=b===button;b.classList.toggle("active",active);b.setAttribute("aria-pressed",active?"true":"false");});
        const count=$("#film-count");if(count)count.textContent=String([...grid.querySelectorAll(".cp-film-wide")].filter(tile=>!tile.hidden).length);
      }));
    }
    const count=$("#film-count");if(count)count.textContent=String((items||[]).length);
    const empty=$("#film-empty");if(empty)empty.hidden=(items||[]).length>0;

    let rails=$("#cp-film-streaming-rails");
    if(!rails){rails=document.createElement("div");rails.id="cp-film-streaming-rails";grid.insertAdjacentElement("afterend",rails);}
    rails.innerHTML='<div class="cp-streaming-rails-heading"><div class="eyebrow">EXPLORE POR PLATAFORMA</div><h2>O que assistir em cada streaming</h2><p>Filmes disponíveis para assistir por assinatura ou gratuitamente no Brasil.</p></div>'+
      STREAMING_SERVICES.map(service=>'<section class="cp-streaming-row" data-service="'+esc(service.label)+'"><div class="cp-streaming-row-head"><h3>'+esc(service.label)+'</h3><span>Disponíveis no Brasil</span></div><div class="cp-streaming-row-track" aria-label="Filmes na plataforma '+esc(service.label)+'"><p class="cp-streaming-status">Carregando filmes…</p></div></section>').join("");
    const disclaimer=$("#filmes .film-disclaimer");
    if(disclaimer)disclaimer.textContent="Catálogo e disponibilidade para o Brasil consultados via TMDB/JustWatch. A oferta pode mudar; confirme no serviço antes de assistir.";

    // Carrega uma fileira por vez para preservar a ordem editorial e não sobrecarregar a API.
    for(const service of STREAMING_SERVICES){
      const row=rails.querySelector('[data-service="'+service.label+'"]');
      const track=row&&row.querySelector(".cp-streaming-row-track");
      if(!track)continue;
      try{
        const titles=await fetchStreamingProvider(service.provider);
        if(!titles.length){
          track.innerHTML='<p class="cp-streaming-status">Nenhum filme disponível nesta plataforma nos resultados atuais do catálogo brasileiro.</p>';
          continue;
        }
        track.innerHTML=titles.slice(0,12).map(item=>horizontalMovieCard(item,service.label)).join("");
      }catch(_){track.innerHTML='<p class="cp-streaming-status">Não foi possível carregar esta fileira agora.</p>';}
    }
  }
  async function fillPage() {
    ensureStyles();
    const path=location.pathname;
    const isFilmPage=path.includes("central-plus-filmes")||path==="/filmes"||path==="/filmes/";
    const isSeriesPage=path.includes("central-plus-series")||path==="/series"||path==="/series/";
    if(isFilmPage||isSeriesPage){
      const type=isSeriesPage?"tv":"movie";
      const grid=$(isSeriesPage?"#series-grid":"#film-grid");
      if(isFilmPage){
        try {
          const results=await Promise.all([fetchItems("movie","streaming"),fetchItems("movie","streaming_new")]);
          renderFilmStreamingPage(results[0],results[1]);
        } catch(error) {
          if(grid){const note=document.createElement("p");note.className="cp-api-status";note.textContent="Não foi possível carregar as opções de streaming: "+error.message;grid.prepend(note)}
        }
        return;
      }
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
          const res=await fetch(API+"?type="+type+"&section=details&id="+encodeURIComponent(id)),data=await res.json();
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
          const renderProviderCartela=()=>{
            let panel=$("#cp-provider-cartela");
            if(!panel){
              panel=document.createElement("section");panel.id="cp-provider-cartela";panel.className="cp-provider-cartela";
              const actions=$(".actions");
              if(actions)actions.insertAdjacentElement("afterend",panel);
              else return;
            }
            const options=Array.isArray(item.provider_options)?item.provider_options:[];
            const officialSearch=name=>{
              const n=String(name||"").toLowerCase();
              if(n.includes("netflix"))return "https://www.netflix.com/search?q=";
              if(n.includes("prime")||n.includes("amazon"))return "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=";
              if(n.includes("disney"))return "https://www.disneyplus.com/search?q=";
              if(n.includes("apple"))return "https://tv.apple.com/br/search?term=";
              if(n.includes("max")||n.includes("hbo"))return "https://play.max.com/search?q=";
              if(n.includes("paramount"))return "https://www.paramountplus.com/search/?query=";
              if(n.includes("crunchyroll"))return "https://www.crunchyroll.com/search?q=";
              if(n.includes("globoplay"))return "https://globoplay.globo.com/busca/?q=";
              if(n.includes("mubi"))return "https://mubi.com/pt/br/search?query=";
              return "";
            };
            const categoryOrder=["Assinatura","Grátis","Grátis com anúncios","Aluguel","Compra"];
            const cards=options.map(p=>{
              const href=officialSearch(p.name),target=href?href+encodeURIComponent(item.title):item.provider_link;
              const logo=p.logo_url?'<img src="'+esc(p.logo_url)+'" alt="" loading="lazy">':'<span class="cp-provider-monogram">'+esc(p.name.slice(0,1))+'</span>';
              return {p,href:target,logo};
            }).filter(x=>x.href);
            const groups=categoryOrder.map(category=>{
              const group=cards.filter(x=>x.p.category===category);
              if(!group.length)return "";
              return '<div class="cp-provider-group"><div class="cp-provider-group-title">'+esc(category)+
                '</div><div class="cp-provider-grid">'+group.map(x=>'<a class="cp-provider-card" href="'+esc(x.href)+
                '" target="_blank" rel="noopener noreferrer" aria-label="Abrir '+esc(x.p.name)+' para buscar '+esc(item.title)+'">'+
                '<span class="cp-provider-logo">'+x.logo+'</span><span class="cp-provider-name">'+esc(x.p.name)+
                '</span><span class="cp-provider-category">'+esc(x.p.category)+'</span><span class="cp-provider-arrow">↗</span></a>').join("")+
                '</div></div>';
            }).join("");
            const fullLink=item.provider_link?'<a class="cp-provider-all" href="'+esc(item.provider_link)+'" target="_blank" rel="noopener noreferrer">Ver todas as opções no JustWatch ↗</a>':"";
            panel.innerHTML='<div class="cp-provider-heading"><div><div class="cp-provider-eyebrow">ONDE ASSISTIR NO BRASIL</div><h2>Escolha seu streaming</h2><p>Opções informadas para este título. A disponibilidade pode mudar.</p></div></div>'+
              (groups||'<p class="cp-provider-empty">Não encontramos opções de streaming para este título no Brasil neste momento.</p>')+
              '<p class="cp-provider-attribution">Disponibilidade fornecida pelo JustWatch via TMDB. Os cards abrem a busca da plataforma quando há um endereço oficial conhecido; caso contrário, use o link de disponibilidade.</p>'+fullLink;
          };
          if(!document.getElementById("cp-provider-cartela-styles")){
            const css=document.createElement("style");css.id="cp-provider-cartela-styles";css.textContent=`
              .cp-provider-cartela{margin:24px 0 8px;padding:22px;border:1px solid #ffffff16;border-radius:18px;background:linear-gradient(145deg,#151923,#0c0e14);color:#f6f7fb}
              .cp-provider-heading h2{margin:5px 0;font-size:clamp(20px,3vw,28px);letter-spacing:-.04em}
              .cp-provider-heading p,.cp-provider-attribution{font-size:12px;line-height:1.5;color:#a8afbd;margin:6px 0 18px}
              .cp-provider-eyebrow{font-size:10px;letter-spacing:.16em;color:#aab6d0;font-weight:800}
              .cp-provider-group{margin-top:18px}.cp-provider-group-title{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#a8afbd;margin-bottom:9px}
              .cp-provider-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px}
              .cp-provider-card{position:relative;display:flex;align-items:center;gap:10px;min-width:0;padding:12px;border:1px solid #ffffff16;border-radius:12px;background:#ffffff06;color:inherit;text-decoration:none;transition:background .2s,border-color .2s}
              .cp-provider-card:hover{background:#ffffff10;border-color:#ffffff40}.cp-provider-logo{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:10px;overflow:hidden;background:#fff}
              .cp-provider-logo img{width:100%;height:100%;object-fit:cover}.cp-provider-monogram{font-size:19px;font-weight:800;color:#151923}
              .cp-provider-name{font-size:12px;font-weight:750;line-height:1.25;overflow-wrap:anywhere}.cp-provider-category{position:absolute;left:64px;bottom:10px;font-size:9px;color:#a8afbd}
              .cp-provider-arrow{margin-left:auto;align-self:flex-start;color:#a8afbd}.cp-provider-empty{color:#c4c9d3;font-size:13px}
              .cp-provider-attribution{margin:18px 0 0;font-size:10px}.cp-provider-all{display:inline-block;margin-top:8px;color:#f3f4f8;font-size:12px;font-weight:750;text-decoration:underline;text-underline-offset:3px}
              @media(max-width:480px){.cp-provider-cartela{padding:15px}.cp-provider-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cp-provider-card{padding:9px;gap:8px}.cp-provider-logo{width:34px;height:34px;flex-basis:34px}.cp-provider-category{left:51px;font-size:8px}}
            `;document.head.appendChild(css);
          }
          renderProviderCartela();
          const stream=$("#streamBtn");
          if(stream){
            const provider=(item.provider_names||[]).find(Boolean)||"";
            const providerLower=provider.toLowerCase();
            const providerSearch=providerLower.includes("netflix")?"https://www.netflix.com/search?q=":
              providerLower.includes("prime")?"https://www.primevideo.com/search/ref=atv_nb_sr?phrase=":
              providerLower.includes("disney")?"https://www.disneyplus.com/search?q=":
              providerLower.includes("apple")?"https://tv.apple.com/br/search?term=":
              providerLower.includes("max")||providerLower.includes("hbo")?"https://play.max.com/search?q=":
              providerLower.includes("paramount")?"https://www.paramountplus.com/search/?query=":
              providerLower.includes("crunchyroll")?"https://www.crunchyroll.com/search?q=":"";
            // Add only verified official episode URLs to this registry. Never infer platform IDs.
            // Shape: TMDB series ID -> { seriesUrl: "...", episodes: { "1": "...", "2": "..." } }
            const directLinks={};
            const progressKey="centralplus-series-progress-v1";
            const seriesKey=String(item.id||item.title).toLowerCase();
            const readEpisode=()=>{try{const saved=JSON.parse(localStorage.getItem(progressKey)||"{}");return Number.isInteger(saved[seriesKey])&&saved[seriesKey]>=0?saved[seriesKey]+1:1}catch(_){return 1}};
            const resolveWatchUrl=()=>{
              const episode=readEpisode(),curated=directLinks[String(item.id)];
              if(curated&&curated.episodes&&curated.episodes[String(episode)])return {url:curated.episodes[String(episode)],exact:true};
              if(curated&&curated.seriesUrl)return {url:curated.seriesUrl,exact:false};
              if(providerSearch)return {url:providerSearch+encodeURIComponent(item.title),exact:false};
              return {url:"",exact:false};
            };
            const renderEpisode=()=>{
              const episode=readEpisode(),target=resolveWatchUrl();
              stream.textContent=type==="tv"?"▶ Assista o episódio "+String(episode).padStart(2,"0"):"▶ Assistir";
              stream.href=target.url||"#";
              stream.dataset.exactEpisode=target.exact?"true":"false";
              stream.title=target.exact?"Abrir episódio exato na plataforma":"Link direto do episódio não verificado; abrir busca/ficha da série";
              stream.setAttribute("aria-label",stream.title);
            };
            if(type==="tv"){
              renderEpisode();
              const watched=$("#episodeWatchedBtn");
              if(watched){
                const updateWatched=()=>{watched.textContent="✓ Marcar episódio "+String(readEpisode()).padStart(2,"0")+" como assistido";};
                updateWatched();
                if(!watched.dataset.progressBound){
                  watched.dataset.progressBound="true";
                  watched.addEventListener("click",()=>{
                    try{
                      const saved=JSON.parse(localStorage.getItem(progressKey)||"{}");
                      saved[seriesKey]=readEpisode();
                      localStorage.setItem(progressKey,JSON.stringify(saved));
                      renderEpisode();updateWatched();
                    }catch(_){}
                  });
                }
              }
              if(!stream.dataset.noticeBound){
                stream.dataset.noticeBound="true";
                stream.addEventListener("click",event=>{
                  if(!stream.getAttribute("href")||stream.getAttribute("href")==="#"){event.preventDefault();return;}
                  if(stream.dataset.exactEpisode!=="true"){
                    const notice=$("#streamNotice");
                    if(notice){notice.textContent="Ainda não há um link oficial verificado para este episódio específico. Abriremos a busca/ficha da série na plataforma.";notice.hidden=false;}
                  }
                });
              }
            }else{
              stream.href=providerSearch?providerSearch+encodeURIComponent(item.title):"#";
              stream.textContent="▶ Assistir";
            }
          }
          const options=$("#watchOptionsBtn");if(options){options.href="#cp-provider-cartela";options.textContent="Ver opções no Brasil";options.addEventListener("click",event=>{event.preventDefault();const panel=$("#cp-provider-cartela");if(panel)panel.scrollIntoView({behavior:"smooth",block:"start"});});}
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
        .cp-home-nav{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:clamp(16px,2.5vw,38px);padding:0 clamp(18px,3.5vw,64px);min-height:76px;background:rgba(7,8,13,.88);backdrop-filter:blur(22px);border-bottom:1px solid #ffffff12}
        .cp-home-brand{font-size:25px;font-weight:850;letter-spacing:-1.2px;white-space:nowrap;text-decoration:none;color:#f7f8fb}.cp-home-brand span{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:8px;border-radius:9px;background:#f4f5f8;color:#090a10;font-size:20px}
        .cp-home-links{display:flex;align-items:center;justify-content:center;gap:clamp(12px,1.8vw,26px);flex:1}.cp-home-links a{font-size:12px;color:#b7bdcb;text-decoration:none;white-space:nowrap;transition:color .2s}.cp-home-links a:hover,.cp-home-links a[aria-current="page"]{color:#fff}
        .cp-home-status{color:#7f8799;font-size:9px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
        .cp-home-news .cp-api-card,.cp-home-continue .cp-api-card{flex-basis:clamp(250px,30vw,390px);scroll-snap-align:start}
        .cp-home-live .cp-home-live-card{display:block;flex:0 0 clamp(240px,27vw,350px);min-width:0;scroll-snap-align:start;color:inherit;text-decoration:none;border:1px solid #ffffff16;border-radius:12px;overflow:hidden;background:#11141c;transition:transform .2s,border-color .2s}.cp-home-live .cp-home-live-card:hover{transform:translateY(-3px);border-color:#ffffff45}.cp-home-live-art{position:relative;aspect-ratio:16/9;background:#171b25 center/cover no-repeat}.cp-home-live-art:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(4,5,9,.78),transparent 72%)}.cp-home-live-status{position:absolute;z-index:1;top:10px;left:10px;padding:5px 7px;border:1px solid #ffffff35;border-radius:4px;background:#08090dcc;font-size:9px;letter-spacing:.06em;text-transform:uppercase}.cp-home-live-status.is-live{border-color:#ff59686b;color:#fff1f2}.cp-home-live-status.is-live:before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#ff5968;margin-right:6px}.cp-home-live-copy{padding:11px 12px 13px}.cp-home-live-title{font-size:13px;font-weight:800}.cp-home-live-meta{font-size:10px;color:#aab1c0;margin-top:5px}.cp-home-live-updated{font-size:9px;color:#cbd3e1;margin-top:7px}
        .cp-home-app-card{flex-basis:clamp(125px,13vw,165px);scroll-snap-align:start}
        .cp-home-app-art{height:88px;position:relative;display:grid;place-items:center;overflow:hidden;border:1px solid #ffffff20;border-radius:13px;background:#1a1d26}
        .cp-home-app-glow{position:absolute;width:100px;height:100px;right:-28px;top:-38px;border-radius:50%;background:#ffffff20}
        .cp-home-app-logo{position:relative;z-index:1;width:52px;height:52px;border-radius:13px;background:#10111635;display:grid;place-items:center;color:#fff;font-size:16px;font-weight:850;text-align:center;overflow:hidden;box-shadow:0 8px 24px #0005}
        .cp-home-app-logo img{width:100%;height:100%;object-fit:contain;padding:8px}
        .cp-home-app-fallback{font-size:11px;font-weight:850;line-height:1.05;overflow-wrap:anywhere}
        .cp-home-app-card:hover .cp-home-app-art{border-color:#ffffff55}
        .cp-home-news .cp-api-poster,.cp-home-continue .cp-api-poster{width:100%;aspect-ratio:16/9;border-radius:12px}
        .cp-home-news .cp-api-title,.cp-home-continue .cp-api-title{font-size:14px}
        .cp-home-news-card{display:block;flex:0 0 clamp(280px,31vw,410px);min-width:0;scroll-snap-align:start;color:inherit;text-decoration:none}
        .cp-home-news-art{position:relative;aspect-ratio:16/9;border:1px solid #ffffff16;border-radius:12px;overflow:hidden;background-color:#151923;background-size:cover;background-position:center;transition:transform .25s,border-color .25s}
        .cp-home-news-card:hover .cp-home-news-art{transform:translateY(-3px);border-color:#ffffff50}
        .cp-home-news-badge{position:absolute;top:10px;left:10px;padding:5px 8px;border:1px solid #ffffff35;border-radius:5px;background:#08090dcc;color:#f5f6fa;font-size:9px;backdrop-filter:blur(8px)}
        .cp-home-news-copy{position:absolute;left:14px;right:12px;bottom:13px}
        .cp-home-news-source{font-size:9px;color:#d4d8e2;margin-bottom:6px;text-shadow:0 1px 8px #000}
        .cp-home-news-title{font-size:clamp(14px,1.2vw,17px);line-height:1.15;font-weight:800;text-shadow:0 2px 12px #000}
        .cp-home-news-summary{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.5;color:#aeb5c4;margin-top:9px}
        .cp-home-news-link{font-size:10px;color:#e1e4ec;margin-top:7px}
        .cp-home-news-actions{display:flex;align-items:center;gap:8px}.cp-home-news-control{display:grid;place-items:center;width:30px;height:30px;border:1px solid #ffffff25;border-radius:50%;background:#ffffff08;color:#f5f6fb;font-size:21px;line-height:1;cursor:pointer}.cp-home-news-control:hover{background:#ffffff18;border-color:#ffffff55}.cp-home-news-control:focus-visible{outline:2px solid #fff;outline-offset:3px}.cp-home-news{scroll-behavior:smooth;scrollbar-width:none}.cp-home-news::-webkit-scrollbar{display:none}
        .cp-home-progress{height:3px;border-radius:4px;background:#ffffff20;margin-top:10px;overflow:hidden}.cp-home-progress span{display:block;height:100%;width:35%;background:#f4f5f8}
        .cp-home-empty{display:flex;align-items:center;gap:14px;min-width:260px;padding:18px 20px;border:1px dashed #ffffff24;border-radius:12px;color:#9da5b5;font-size:12px;line-height:1.6}.cp-home-empty strong{display:block;color:#e3e6ee;font-size:13px;margin-bottom:3px}
        .cp-home-inline-action{font-size:11px;color:#c8cdda;text-decoration:none;white-space:nowrap}.cp-home-inline-action:hover{color:#fff}
        .cp-home-hero{position:relative;min-height:clamp(540px,76vh,760px);display:flex;align-items:flex-end;overflow:hidden;background:#11141d}
        .cp-home-hero-art{position:absolute;inset:0;background-size:cover;background-position:center 30%;opacity:.82;transform:scale(1.02)}
        .cp-home-hero-art:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#07080df7 0%,rgba(7,8,13,.88) 25%,rgba(7,8,13,.35) 62%,rgba(7,8,13,.12) 100%),linear-gradient(0deg,#07080d 0%,transparent 50%),linear-gradient(180deg,rgba(7,8,13,.35),transparent 35%)}
        .cp-home-hero-copy{position:relative;z-index:1;padding:80px clamp(20px,5vw,84px) 72px;max-width:780px}
        .cp-home-eyebrow{display:flex;align-items:center;gap:10px;color:#d0d5e2;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}.cp-home-eyebrow:before{content:"";width:3px;height:18px;border-radius:3px;background:#e9ebf2}
        .cp-home-hero h1{font-size:clamp(48px,7vw,94px);line-height:.91;letter-spacing:-.07em;margin:23px 0 18px;font-weight:850;max-width:760px;text-wrap:balance}
        .cp-home-hero-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;color:#e0e3eb;font-size:12px}.cp-home-chip{border:1px solid #ffffff42;border-radius:4px;padding:5px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase}
        .cp-home-hero p{font-size:14px;line-height:1.8;color:#c2c7d3;max-width:580px;margin:18px 0 24px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .cp-home-slide-controls{position:absolute;right:clamp(20px,4.5vw,76px);bottom:35px;z-index:3;display:flex;align-items:center;gap:8px}.cp-home-slide-btn{width:42px;height:42px;border-radius:50%;border:1px solid #ffffff45;background:#090a10aa;color:#fff;font-size:18px;cursor:pointer}.cp-home-slide-btn:hover{background:#fff;color:#111}.cp-home-slide-count{font-size:10px;letter-spacing:.12em;color:#d4d8e2;padding:0 6px}.cp-home-actions{display:flex;gap:10px;flex-wrap:wrap}.cp-home-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:47px;padding:0 18px;border-radius:8px;background:#f4f5f8;color:#101219;font-size:12px;font-weight:800;text-decoration:none}.cp-home-btn.secondary{background:#ffffff13;border:1px solid #ffffff25;color:#fff;backdrop-filter:blur(10px)}
        .cp-home-section{padding:35px clamp(20px,4.5vw,76px) 6px}.cp-home-section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:16px}.cp-home-section h2{font-size:clamp(20px,2.2vw,28px);font-weight:780;letter-spacing:-.045em;margin:0}.cp-home-section-head p{font-size:11px;color:#8f96a8;margin:6px 0 0}.cp-home-seeall{font-size:11px;color:#c8cdda;text-decoration:none;white-space:nowrap}.cp-home-seeall:hover{color:#fff}
        .cp-home-rail{display:flex;gap:15px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 20px;scrollbar-width:thin;scrollbar-color:#343846 transparent}
        .cp-home-rail .cp-api-card{flex:0 0 clamp(250px,29vw,390px);scroll-snap-align:start}.cp-home-rail .cp-api-poster{border-radius:12px;aspect-ratio:16/9;background:#161a24;overflow:hidden;border:1px solid #ffffff14}.cp-home-rail .cp-api-poster img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}.cp-home-rail .cp-api-card:hover img{transform:scale(1.04)}
        .cp-home-rail .cp-api-title{font-size:12px;line-height:1.3;margin-top:9px;font-weight:750}.cp-home-rail .cp-api-meta,.cp-home-rail .cp-api-provider{font-size:10px;color:#9da5b5;margin-top:5px}
        .cp-home-footer{padding:28px clamp(20px,4.5vw,76px) 34px;border-top:1px solid #ffffff12;color:#737b8d;font-size:10px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:38px}
        .cp-home-error{padding:16px 0;color:#c6cad5;font-size:12px}
        @media(max-width:900px){.cp-home-nav{flex-wrap:wrap;gap:10px;padding-top:12px;padding-bottom:12px}.cp-home-brand{font-size:22px}.cp-home-links{order:3;flex-basis:100%;justify-content:flex-start;gap:clamp(16px,4vw,28px);overflow-x:auto;padding:7px 0 3px}.cp-home-links a{font-size:11px}.cp-home-status{margin-left:auto;font-size:8px}}@media(max-width:650px){.cp-home-nav{min-height:68px}.cp-home-hero{min-height:600px}.cp-home-hero-copy{padding:70px 22px 52px}.cp-home-hero h1{font-size:clamp(44px,12vw,66px)}.cp-home-hero p{-webkit-line-clamp:3}.cp-home-section{padding:27px 20px 0}.cp-home-rail .cp-api-card{flex-basis:min(78vw,340px)}.cp-home-section-head{align-items:center}}
      `;
      document.head.appendChild(homeStyles);
      mount.innerHTML=`
        <nav class="cp-home-nav"><a class="cp-home-brand" href="/"><span>+</span>Central+</a><div class="cp-home-links"><a href="/" aria-current="page">Home</a><a href="/central-plus-filmes.html">Filmes</a><a href="/central-plus-series.html">Séries</a><a href="/central-plus-apps.html">Apps</a><a href="/central-plus-noticias.html">Notícias</a><a href="/central-plus-ao-vivo.html">Ao vivo</a><a href="/central-plus-favoritos.html">Favoritos</a></div><div class="cp-home-status">Seu próximo universo começa aqui</div></nav>
        <section class="cp-home-hero"><div class="cp-home-hero-art" id="cp-home-hero-art"></div><div class="cp-home-slide-controls"><button class="cp-home-slide-btn" id="cp-home-prev" aria-label="Destaque anterior">‹</button><span class="cp-home-slide-count" id="cp-home-slide-count">01 / 06</span><button class="cp-home-slide-btn" id="cp-home-next" aria-label="Próximo destaque">›</button></div><div class="cp-home-hero-copy"><div class="cp-home-eyebrow">Em destaque · catálogo atualizado</div><h1 id="cp-home-hero-title">Descubra sua próxima história</h1><div class="cp-home-hero-meta" id="cp-home-hero-meta"><span class="cp-home-chip">Central+ seleção</span></div><p id="cp-home-hero-overview">Filmes e séries para sua próxima maratona.</p><div class="cp-home-actions"><a class="cp-home-btn" id="cp-home-hero-details" href="/central-plus-filmes.html">＋ Explorar título</a><a class="cp-home-btn secondary" href="/central-plus-filmes.html">Explorar catálogo <span>↗</span></a></div></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Notícias atualizadas</h2><p>Novos títulos e lançamentos do universo do entretenimento</p></div><div class="cp-home-news-actions"><button class="cp-home-news-control" id="cp-home-news-prev" type="button" aria-label="Notícias anteriores">‹</button><button class="cp-home-news-control" id="cp-home-news-next" type="button" aria-label="Próximas notícias">›</button><a class="cp-home-seeall" href="/central-plus-noticias.html">Ver notícias ↗</a></div></div><div class="cp-home-rail cp-home-news" id="cp-api-home-news"><span class="cp-api-status">Carregando atualizações…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Continue assistindo</h2><p>Retome sua próxima maratona</p></div><a class="cp-home-inline-action" href="/central-plus-favoritos.html">Sua lista ↗</a></div><div class="cp-home-rail cp-home-continue" id="cp-api-home-continue"><div class="cp-home-empty"><div><strong>Sua jornada começa aqui</strong>Abra um filme ou série para começar a montar seu histórico.</div></div></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Apps recentes</h2><p>Seus serviços de streaming em um só lugar</p></div><a class="cp-home-seeall" href="/central-plus-apps.html">Ver apps ↗</a></div><div class="cp-home-rail" id="cp-api-home-apps"><a class="cp-api-card" href="/central-plus-apps.html"><div class="cp-api-poster" style="display:grid;place-items:center;font-size:34px;color:#e8eaf1">▶</div><div class="cp-api-title">Explorar aplicativos</div><div class="cp-api-meta">Seus serviços de streaming</div></a><a class="cp-api-card" href="/central-plus-apps.html"><div class="cp-api-poster" style="display:grid;place-items:center;font-size:30px;color:#e8eaf1">＋</div><div class="cp-api-title">Adicionar serviços</div><div class="cp-api-meta">Personalize sua Central+</div></a></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Séries</h2><p>Séries populares para sua próxima maratona</p></div><a class="cp-home-seeall" href="/central-plus-series.html">Ver todas ↗</a></div><div class="cp-home-rail" id="cp-api-home-series"><span class="cp-api-status">Carregando séries…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Filmes</h2><p>Filmes populares para descobrir</p></div><a class="cp-home-seeall" href="/central-plus-filmes.html">Ver todos ↗</a></div><div class="cp-home-rail" id="cp-api-home-movies"><span class="cp-api-status">Carregando filmes…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Ao vivo</h2><p>Canais oficiais — os sinais e prévias atualizados aparecem primeiro</p></div><a class="cp-home-seeall" href="/central-plus-ao-vivo.html">Ver todos os canais ↗</a></div><div class="cp-home-rail cp-home-live" id="cp-api-home-live"><span class="cp-api-status">Atualizando canais…</span></div></section>
        <section class="cp-home-section"><div class="cp-home-section-head"><div><h2>Favoritos</h2><p>Uma área para seus títulos salvos</p></div><a class="cp-home-seeall" href="/central-plus-favoritos.html">Ver favoritos ↗</a></div><div class="cp-home-rail" id="cp-api-home-favorites"><div class="cp-home-empty"><div><strong>Seus favoritos em um só lugar</strong>Explore filmes e séries e abra sua lista de favoritos.</div></div></div></section>
        <footer class="cp-home-footer"><span>Central+ · Descubra o que assistir</span><span>Metadados e imagens fornecidos pelo TMDB. A Central+ não é endossada pelo TMDB.</span></footer>`;
      const RECENT_APPS_KEY="centralplus-recent-apps-v1";
      const appBrandColor=name=>({
        "netflix":"#e50914","prime video":"#0879bd","disney+":"#132f82","hbo max":"#5424a8",
        "globoplay":"#ed2735","apple tv":"#252a32","paramount+":"#1262a5","mubi":"#b5a88a",
        "pluto tv":"#6d39db","crunchyroll":"#f47521","wow presents":"#e94c9a",
        "youtube":"#e62117","amazon music":"#f47521","spotify":"#1d6c42"
      }[String(name||"").toLowerCase()]||"#242936");
      const renderRecentApps=()=>{
        const rail=$("#cp-api-home-apps",mount);if(!rail)return;
        let saved=[];try{const raw=JSON.parse(localStorage.getItem(RECENT_APPS_KEY)||"[]");saved=Array.isArray(raw)?raw.filter(x=>x&&x.name&&/^https:\/\//i.test(x.url||"")):[]}catch(_){}
        if(!saved.length){
          rail.innerHTML='<div class="cp-home-empty"><div><strong>Seus streamings favoritos começam aqui</strong>Abra um card na aba Apps e ele aparecerá nesta seção, do mais recente ao mais antigo.</div></div>';
          return;
        }
        rail.innerHTML=saved.slice(0,8).map(app=>{
          const name=esc(app.name),url=esc(app.url),logo=app.logo?'<img loading="lazy" src="'+esc(app.logo)+'" alt="" onload="this.nextElementSibling.style.display=\'none\'" onerror="this.style.display=\'none\'">':"";
          const fallback=esc((app.fallback||app.name||"?").slice(0,9));
          return '<a class="cp-api-card cp-home-app-card" href="'+url+'" target="_blank" rel="noopener noreferrer" data-app-name="'+name+'"><div class="cp-home-app-art" style="background:'+appBrandColor(app.name)+'"><span class="cp-home-app-glow"></span><span class="cp-home-app-logo">'+logo+'<span class="cp-home-app-fallback">'+fallback+'</span></span></div><div class="cp-api-title">'+name+'</div><div class="cp-api-meta">Aberto recentemente</div></a>';
        }).join("");
      };
      const recordRecentApp=link=>{
        const name=(link.dataset.appName||link.querySelector(".cp-api-title")?.textContent||"").trim(),url=link.href||"";
        if(!name||!/^https:\/\//i.test(url))return;
        const image=link.querySelector(".cp-home-app-logo img");
        const fallback=link.querySelector(".cp-home-app-fallback");
        const entry={name,url,logo:image?(image.getAttribute("src")||""):"",fallback:fallback?(fallback.textContent||"").trim():name.slice(0,1),visitedAt:Date.now()};
        try{const old=JSON.parse(localStorage.getItem(RECENT_APPS_KEY)||"[]");const list=[entry,...(Array.isArray(old)?old:[]).filter(x=>x&&String(x.name).toLowerCase()!==name.toLowerCase())].slice(0,12);localStorage.setItem(RECENT_APPS_KEY,JSON.stringify(list));}catch(_){}
      };
      mount.addEventListener("click",event=>{const link=event.target.closest(".cp-home-app-card");if(link){recordRecentApp(link);if(link.parentElement)link.parentElement.prepend(link);}},true);
      renderRecentApps();
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
      const [movies,series,streamingMovies,streamingSeries]=await Promise.all([
        loadRail("cp-api-home-movies","movie","trending",18),
        loadRail("cp-api-home-series","tv","trending",18),
        fetchItems("movie","streaming_new"),
        fetchItems("tv","streaming_new")
      ]);
      const streamingLaunches=[...streamingMovies,...streamingSeries]
        .filter(item=>item&&(item.provider_names||[]).length>0)
        .sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))
        .filter((item,index,all)=>all.findIndex(other=>String(other.id)===String(item.id)&&other.type===item.type)===index)
        .slice(0,6);
      // Reuse the live RSS newsroom feed from the dedicated News page.
      const newsRail=$("#cp-api-home-news",mount);
      try{
        const response=await fetch("/api/news?limit=100",{headers:{"Accept":"application/json"},cache:"no-store"});
        if(!response.ok)throw new Error("HTTP "+response.status);
        const newsData=await response.json();
        const newsItems=(Array.isArray(newsData.items)?newsData.items:[])
          .filter(item=>item&&item.title&&item.url)
          .sort((a,b)=>new Date(b.publishedAt||0)-new Date(a.publishedAt||0))
          .slice(0,12);
        const newsCategories={nacionais:"Brasil e mundo",para:"Pará e Belém",cinema:"Cinema e séries",celebridades:"Cultura pop",ciencia:"Ciência",ia:"IA e tecnologia",jornalismo:"Jornalismo",patrimonio:"História e patrimônio"};
        const safeUrl=value=>{try{const u=new URL(value,location.origin);return /^https?:$/.test(u.protocol)?u.href:"#"}catch(_){return "#"}};
        const newsDate=value=>{if(!value)return "";const date=new Date(value);if(Number.isNaN(date.getTime()))return "";return date.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})};
        newsRail.innerHTML=newsItems.map(item=>{
          const image=safeUrl(item.image),link=safeUrl(item.url),title=esc(item.title);
          const category=esc(newsCategories[item.category]||"Notícias"),source=esc(item.source||"Fonte jornalística");
          const summary=esc((item.summary||"Leia a matéria completa diretamente no portal de origem.").trim()),date=newsDate(item.publishedAt);
          return '<a class="cp-home-news-card" href="'+link+'" aria-label="Ler notícia: '+title+'"><div class="cp-home-news-art"'+(image!=="#"? ' style="background-image:linear-gradient(0deg,rgba(4,5,9,.95),rgba(4,5,9,.08) 88%),url(&quot;'+esc(image)+'&quot;)"':"")+'><span class="cp-home-news-badge">'+category+'</span><div class="cp-home-news-copy"><div class="cp-home-news-source">'+source+(date?" · "+esc(date):"")+'</div><div class="cp-home-news-title">'+title+'</div></div></div><div class="cp-home-news-summary">'+summary+'</div><div class="cp-home-news-link">Ler matéria original ↗</div></a>';
        }).join("")||'<div class="cp-home-error">As manchetes aparecerão aqui quando o feed estiver disponível.</div>';
        if(newsItems.length>1){
          const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          let pauseUntil=0;
          const pauseAuto=(duration=8000)=>{pauseUntil=Date.now()+duration;};
          const newsStep=()=>{
            const firstCard=newsRail.querySelector(".cp-home-news-card");
            if(!firstCard)return;
            const gap=parseFloat(getComputedStyle(newsRail).gap)||15;
            const step=firstCard.getBoundingClientRect().width+gap;
            const atEnd=newsRail.scrollLeft+newsRail.clientWidth>=newsRail.scrollWidth-12;
            newsRail.scrollTo({left:atEnd?0:newsRail.scrollLeft+step,behavior:reduceMotion?"auto":"smooth"});
          };
          const newsPrev=$("#cp-home-news-prev",mount),newsNext=$("#cp-home-news-next",mount);
          if(newsPrev)newsPrev.onclick=()=>{pauseAuto();const first=newsRail.querySelector(".cp-home-news-card");const gap=parseFloat(getComputedStyle(newsRail).gap)||15;newsRail.scrollBy({left:-((first?first.getBoundingClientRect().width:320)+gap),behavior:reduceMotion?"auto":"smooth"});};
          if(newsNext)newsNext.onclick=()=>{pauseAuto();newsStep();};
          newsRail.addEventListener("pointerenter",()=>pauseAuto(60000));
          newsRail.addEventListener("pointerleave",()=>pauseAuto(2500));
          newsRail.addEventListener("focusin",()=>pauseAuto(60000));
          newsRail.addEventListener("focusout",()=>pauseAuto(2500));
          newsRail.addEventListener("touchstart",()=>pauseAuto(60000),{passive:true});
          newsRail.addEventListener("touchend",()=>pauseAuto(5000),{passive:true});
          newsRail.addEventListener("wheel",()=>pauseAuto(8000),{passive:true});
          if(!reduceMotion)window.setInterval(()=>{if(!document.hidden&&Date.now()>=pauseUntil)newsStep();},5000);
        }
      }catch(error){
        newsRail.innerHTML='<div class="cp-home-error">Não foi possível carregar as notícias agora. <a href="/central-plus-noticias.html">Abrir a central de notícias ↗</a></div>';
        console.warn("Central+ live news:",error);
      }
      // Home Ao vivo shares the channel registry and preview endpoint used by the dedicated Ao vivo page.
      const liveRail=$("#cp-api-home-live",mount);
      const liveChannels=[
        {id:"tv-globo-pa",name:"TV Globo Pará",platform:"Globoplay",url:"https://globoplay.globo.com/tv-globo/ao-vivo/7832875/"},
        {id:"sbt-para",name:"SBT Pará",platform:"SBT ao vivo",url:"https://www.sbt.com.br/ao-vivo"},
        {id:"rbatv",name:"RBATV",platform:"Portal RBA",url:"https://rbatv.dol.com.br/aovivo/"},
        {id:"tv-cultura-pa",name:"TV Cultura do Pará",platform:"Portal Cultura",url:"https://www.portalcultura.com.br/pt-br"},
        {id:"cnn-brasil",name:"CNN Brasil",platform:"YouTube",url:"https://www.youtube.com/@CNNBrasil/live"},
        {id:"globonews",name:"GloboNews",platform:"Globoplay",url:"https://globoplay.globo.com/globonews/ao-vivo/7339101/"},
        {id:"band-jornalismo",name:"Band Jornalismo",platform:"YouTube",url:"https://www.youtube.com/@BandJornalismo/live"},
        {id:"sportv",name:"sportv",platform:"Globoplay",url:"https://globoplay.globo.com/sportv/ao-vivo/9045469/"},
        {id:"cazetv",name:"CazéTV",platform:"YouTube",url:"https://www.youtube.com/@CazeTV/live"},
        {id:"tv-brasil",name:"TV Brasil",platform:"Web TV",url:"https://tvbrasil.ebc.com.br/webtv/"},
        {id:"canal-gov",name:"Canal Gov",platform:"Canal Gov",url:"https://canalgov.ebc.com.br/ao-vivo"},
        {id:"sbt-national",name:"SBT nacional",platform:"+SBT",url:"https://mais.sbt.com.br/"}
      ];
      const liveSafeUrl=value=>{try{const u=new URL(value,location.origin);return /^https?:$/.test(u.protocol)?u.href:"#"}catch(_){return "#"}};
      const renderHomeLive=async()=>{
        if(!liveRail)return;
        try{
          const response=await fetch("/api/live-previews",{headers:{"Accept":"application/json"},cache:"no-store"});
          if(!response.ok)throw new Error("HTTP "+response.status);
          const data=await response.json();
          const previews=Array.isArray(data.items)?data.items:[];
          const previewById=new Map(previews.filter(item=>item&&item.id).map(item=>[item.id,item]));
          const channels=liveChannels.map((channel,index)=>({...channel,index,preview:previewById.get(channel.id)||null}))
            .sort((a,b)=>{
              const aLive=a.preview&&a.preview.kind==="live"?1:0,bLive=b.preview&&b.preview.kind==="live"?1:0;
              if(aLive!==bLive)return bLive-aLive;
              const aTime=Date.parse(a.preview&&a.preview.fetchedAt||0)||0,bTime=Date.parse(b.preview&&b.preview.fetchedAt||0)||0;
              return bTime-aTime||a.index-b.index;
            });
          liveRail.innerHTML=channels.map(channel=>{
            const preview=channel.preview||{},images=Array.isArray(preview.images)?preview.images:[],image=images.find(value=>/^https?:/i.test(value))||"";
            const live=preview.kind==="live",status=live?"Transmissão detectada":(preview.kind==="official"?"Prévia oficial atualizada":"Prévia da página");
            const updated=preview.fetchedAt?new Date(preview.fetchedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"";
            return '<a class="cp-home-live-card" href="'+liveSafeUrl(channel.url)+'" aria-label="Abrir '+esc(channel.name)+' na plataforma oficial" target="_self"><div class="cp-home-live-art"'+(image?' style="background-image:url(&quot;'+esc(image)+'&quot;)"':"")+'><span class="cp-home-live-status'+(live?" is-live":"")+'">'+status+'</span></div><div class="cp-home-live-copy"><div class="cp-home-live-title">'+esc(channel.name)+'</div><div class="cp-home-live-meta">'+esc(channel.platform)+' · Abrir canal oficial ↗</div><div class="cp-home-live-updated">'+(updated?"Prévia consultada às "+esc(updated):"Consulte a transmissão na plataforma oficial")+'</div></div></a>';
          }).join("")||'<div class="cp-home-error">Os canais aparecerão aqui quando as prévias estiverem disponíveis.</div>';
        }catch(error){
          liveRail.innerHTML='<a class="cp-api-card" href="/central-plus-ao-vivo.html"><div class="cp-api-poster" style="display:grid;place-items:center;font-size:30px;color:#f6f7fb;background:radial-gradient(circle at 50% 50%,#373d50,#12141c)">▶</div><div class="cp-api-title">Central+ Ao vivo</div><div class="cp-api-meta">Não foi possível atualizar as prévias. Abrir a lista completa.</div></a>';
          console.warn("Central+ home live channels:",error);
        }
      };
      renderHomeLive();
      window.setInterval(()=>{if(!document.hidden)renderHomeLive()},5*60*1000);
      document.addEventListener("visibilitychange",()=>{if(!document.hidden)renderHomeLive()});
      const featuredItems=streamingLaunches;
      const eyebrow=$(".cp-home-eyebrow",mount);
      if(eyebrow)eyebrow.textContent="Novidades nos streamings · Brasil";
      if(featuredItems.length){
        let activeSlide=0,autoTimer=null;
        const showFeature=(index)=>{
          activeSlide=(index+featuredItems.length)%featuredItems.length;
          const feature=featuredItems[activeSlide];
          const hero=$("#cp-home-hero-art",mount);if(hero)hero.style.backgroundImage='linear-gradient(90deg,rgba(5,7,12,.28),rgba(5,7,12,.06)),url("'+(feature.backdrop_url||feature.poster_url||"")+'")';
          const title=$("#cp-home-hero-title",mount);if(title)title.textContent=feature.title;
          const dateLabel=feature.date?new Date(feature.date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}):year(feature);
          const platforms=(feature.provider_names||[]).slice(0,3).join(" · ");
          const meta=$("#cp-home-hero-meta",mount);if(meta)meta.innerHTML='<span class="cp-home-chip">'+esc(feature.type==="tv"?"Série":"Filme")+'</span><span class="cp-home-chip">'+esc(dateLabel||"Lançamento")+'</span><span>'+esc((feature.genres||[]).slice(0,2).join(" · "))+'</span>'+(platforms?'<span class="cp-home-chip">'+esc(platforms)+'</span>':"");
          const overview=$("#cp-home-hero-overview",mount);if(overview)overview.textContent=feature.overview||"Descubra este lançamento disponível em streaming.";
          const detail=$("#cp-home-hero-details",mount);if(detail){detail.href=detailHref(feature);detail.textContent="Ver título e opções";}
          const count=$("#cp-home-slide-count",mount);if(count)count.textContent=String(activeSlide+1).padStart(2,"0")+" / "+String(featuredItems.length).padStart(2,"0");
        };
        const restartAuto=()=>{if(autoTimer)window.clearInterval(autoTimer);autoTimer=window.setInterval(()=>{if(!document.hidden)showFeature(activeSlide+1)},7000)};
        $("#cp-home-prev",mount).onclick=()=>{showFeature(activeSlide-1);restartAuto()};
        $("#cp-home-next",mount).onclick=()=>{showFeature(activeSlide+1);restartAuto()};
        const heroSection=$(".cp-home-hero",mount);
        if(heroSection){heroSection.addEventListener("mouseenter",()=>{if(autoTimer)window.clearInterval(autoTimer)});heroSection.addEventListener("mouseleave",restartAuto);heroSection.addEventListener("focusin",()=>{if(autoTimer)window.clearInterval(autoTimer)});heroSection.addEventListener("focusout",restartAuto)}
        showFeature(0);restartAuto();
      }else{
        const heroTitle=$("#cp-home-hero-title",mount);if(heroTitle)heroTitle.textContent="Novidades nos streamings em breve";
        const heroOverview=$("#cp-home-hero-overview",mount);if(heroOverview)heroOverview.textContent="Não encontramos lançamentos recentes com disponibilidade confirmada para o Brasil. Tente novamente mais tarde.";
        const controls=$(".cp-home-slide-controls",mount);if(controls)controls.hidden=true;
      }
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fillPage,{once:true});else fillPage();
})();