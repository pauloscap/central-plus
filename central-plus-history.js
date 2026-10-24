/* Central+ local activity history. Compatible with legacy browsers and Fire TV WebView. */
(function(){
  "use strict";
  var MEDIA_KEY="centralplus-continue-watching-v1";
  var APPS_KEY="centralplus-recent-apps-v1";
  function read(key){try{var v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch(_){return[]}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
  function text(el){return (el&&(el.innerText||el.textContent)||"").replace(/\s+/g," ").trim()}
  function titleFrom(card){var n=card.querySelector("h1,h2,h3,.cp-api-title,.cp-film-wide-copy strong,.cp-series-wide-copy strong,.poster-title,[class*=title]");return text(n)||text(card).split(" • ")[0].slice(0,100)}
  function imageFrom(card){var img=card.querySelector("img");if(img)return img.currentSrc||img.src||"";var bg=(card.querySelector("[style*=background-image]")||card).style.backgroundImage||"";var m=bg.match(/url\(["']?(.*?)["']?\)/);return m?m[1]:""}
  function recordMedia(card){
    var title=titleFrom(card);if(!title||title.length<2)return;
    var href=card.href||card.getAttribute("href")||"";
    var id=(href.match(/[?&]tmdbId=([^&]+)/)||[])[1]||card.getAttribute("data-series")||title.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    var item={id:String(id),title:title,poster:imageFrom(card),href:href,visitedAt:Date.now(),progress:0,kind:/serie|series|tv/i.test(href)?"series":"movie"};
    var list=read(MEDIA_KEY).filter(function(x){return x&&String(x.id)!==item.id&&String(x.title).toLowerCase()!==title.toLowerCase()});
    list.unshift(item);write(MEDIA_KEY,list.slice(0,12));
  }
  function recordApp(card){
    var name=text(card.querySelector(".card-caption span,.app-name,[class*=name]"))||text(card);
    name=name.split("Abrindo")[0].trim();if(!name||name.length>70)return;
    var href=card.href||card.getAttribute("href")||"";
    var item={name:name,url:href||("/apps/?app="+encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g,"-"))),logo:imageFrom(card),fallback:name.slice(0,2).toUpperCase(),visitedAt:Date.now()};
    var list=read(APPS_KEY).filter(function(x){return x&&String(x.name).toLowerCase()!==name.toLowerCase()});
    list.unshift(item);write(APPS_KEY,list.slice(0,12));
  }
  function addStyles(){if(document.getElementById("cp-history-styles"))return;var s=document.createElement("style");s.id="cp-history-styles";s.textContent="#continue-row .cp-history-card,#apps-row .cp-history-app{flex-shrink:0;scroll-snap-align:start;text-decoration:none;color:inherit}#continue-row .cp-history-card{width:148px;display:block}#continue-row .cp-history-card img{width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:#171a22}#continue-row .cp-history-card strong{display:block;font-size:12px;margin-top:7px;line-height:1.3}#continue-row .cp-history-progress{height:3px;background:#ffffff25;border-radius:8px;margin-top:7px;overflow:hidden}#continue-row .cp-history-progress span{display:block;width:0;height:100%;background:#fff}#apps-row .cp-history-app{width:72px;display:flex;flex-direction:column;align-items:center;gap:8px}#apps-row .cp-history-app .cp-history-logo{width:64px;height:64px;border-radius:18px;background:#191b23;border:1px solid #ffffff20;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:16px;font-weight:800}#apps-row .cp-history-app img{width:100%;height:100%;object-fit:contain}#apps-row .cp-history-app span:last-child{font-size:11px;color:#ffffffa0;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
  document.head.appendChild(s)}
  function render(){
    addStyles();
    var cr=document.querySelector("#continue-row"),ar=document.querySelector("#apps-row");
    if(cr){
      var track=cr.querySelector(".flex.gap-3,.flex.gap-4,[class*=overflow-x-auto]")||cr;
      read(MEDIA_KEY).slice(0,8).reverse().forEach(function(item){
        if(!item||!item.title||Array.prototype.some.call(track.querySelectorAll("[data-history-id]"),function(el){return el.getAttribute("data-history-id")===String(item.id)}))return;
        var a=document.createElement("a");a.className="cp-history-card";a.setAttribute("data-history-id",String(item.id));a.href=item.href||"#";
        var img=document.createElement("img");img.loading="lazy";img.alt=item.title;img.src=item.poster||"";img.onerror=function(){this.style.display="none"};
        var t=document.createElement("strong");t.textContent=item.title;
        var bar=document.createElement("div");bar.className="cp-history-progress";var fill=document.createElement("span");bar.appendChild(fill);
        a.appendChild(img);a.appendChild(t);a.appendChild(bar);
        a.addEventListener("click",function(e){if(!item.href||item.href==="#"){e.preventDefault()}});
        track.insertBefore(a,track.firstChild);
      });
    }
    if(ar){
      var appTrack=ar.querySelector(".flex.gap-3,.flex.gap-4,[class*=overflow-x-auto]")||ar;
      read(APPS_KEY).slice(0,8).reverse().forEach(function(item){
        if(!item||!item.name||Array.prototype.some.call(appTrack.querySelectorAll("[data-history-app]"),function(el){return el.getAttribute("data-history-app")===item.name}))return;
        var a=document.createElement("a");a.className="cp-history-app";a.href=item.url||"/apps/";
        a.setAttribute("data-history-app",item.name);var logo=document.createElement("div");logo.className="cp-history-logo";
        if(item.logo){var img=document.createElement("img");img.src=item.logo;img.alt="";img.onerror=function(){this.style.display="none";logo.textContent=item.fallback||item.name.slice(0,2)};logo.appendChild(img)}else logo.textContent=item.fallback||item.name.slice(0,2);
        var label=document.createElement("span");label.textContent=item.name;a.appendChild(logo);a.appendChild(label);appTrack.insertBefore(a,appTrack.firstChild);
      });
    }
  }
  document.addEventListener("click",function(e){
    var app=e.target.closest("#apps-row [data-app-id],#apps-row .app-card,#apps-row [data-app],#apps-row a,#apps-row .group");
    if(app){recordApp(app);return}
    var media=e.target.closest("#continue-row a,#filmes-row a,#series-row a,#fav-row a,.cp-api-card,.cp-film-wide,.cp-series-wide,.film-tile,.series-tile");
    if(media)recordMedia(media);
  },true);
  function start(){render();window.addEventListener("pageshow",render);window.addEventListener("storage",function(e){if(e.key===MEDIA_KEY||e.key===APPS_KEY)render()})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();