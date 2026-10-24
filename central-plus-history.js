/* Central+ history: device cache + per-account Supabase sync. */
(function(){
 "use strict";
 var URL="https://bdprhaxyarmxkwdvfqab.supabase.co", KEY="sb_publishable_eZlq5PTGsThQNZsxqsrXEg_S9ZrbH0x";
 var MEDIA="centralplus-continue-watching-v1", APPS="centralplus-recent-apps-v1";
 var client=null,user=null,remoteReady=false;
 function read(k){try{var v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}}
 function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
 function norm(v){return String(v||"").replace(/\s+/g," ").trim()}
 function text(el){return norm(el&&(el.innerText||el.textContent)||"")}
 function image(el){var im=el&&el.querySelector("img");if(im)return im.currentSrc||im.src||im.getAttribute("src")||"";var bg=el&&(el.querySelector("[style*=background-image]")||el).style.backgroundImage||"",m=bg.match(/url\(["']?(.*?)["']?\)/);return m?m[1]:""}
 function mediaTitle(el){return norm(el.getAttribute("data-title")||text(el.querySelector(".series-tile-title,.film-tile-title,.cp-film-wide-copy strong,.cp-series-wide-copy strong,.series-tile-title,.poster-title,[class*=title]"))||text(el).split(" · ")[0]).slice(0,180)}
 function unique(list,key){var seen={};return list.filter(function(x){var k=String(x&&x[key]||"").toLowerCase();if(!k||seen[k])return false;seen[k]=1;return true})}
 function localRecord(kind,item){
  var key=kind==="recent_app"?APPS:MEDIA, list=read(key);
  list=list.filter(function(x){return String(x.id||x.name).toLowerCase()!==String(item.id||item.name).toLowerCase()&&String(x.title||x.name).toLowerCase()!==String(item.title||item.name).toLowerCase()});
  list.unshift(item);write(key,list.slice(0,12));
  window.dispatchEvent(new CustomEvent("centralplus:history-updated",{detail:{type:kind}}));
  if(user)syncItem(kind,item);
 }
 function recordMedia(el){
  var title=mediaTitle(el);if(!title||title.length<2)return;
  var href=el.href||el.getAttribute("href")||"",m=href.match(/[?&]tmdbId=([^&]+)/),type=/tipo=tv|detalhe-serie|series/i.test(href)||el.classList.contains("series-tile")||el.classList.contains("cp-series-wide")?"series":"movie";
  var id=m?decodeURIComponent(m[1]):(el.getAttribute("data-series")||title.toLowerCase().replace(/[^a-z0-9]+/g,"-"));
  localRecord("continue_watching",{id:String(id),title:title,poster:image(el),href:href,visitedAt:Date.now(),progress:0,duration:0,kind:type});
 }
 function recordApp(el){
  var name=norm(el.getAttribute("data-title")||text(el.querySelector(".card-caption span,.app-name,[class*=name]"))||text(el)).split("Abrindo")[0].trim().slice(0,100);
  if(!name||name.length<2||name.length>100)return;
  var href=el.href||el.getAttribute("href")||"",item={id:name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),name:name,title:name,url:href,logo:image(el),fallback:name.slice(0,2).toUpperCase(),visitedAt:Date.now(),kind:"app"};
  localRecord("recent_app",item);
 }
 function syncItem(activity,item){
  if(!client||!user||!item)return Promise.resolve();
  var row={user_id:user.id,activity_type:activity,media_type:activity==="recent_app"?"app":(item.kind==="series"?"series":"movie"),media_id:String(item.id||item.name),title:String(item.title||item.name||"").slice(0,180),poster_url:item.poster||item.logo||null,target_url:item.href||item.url||null,progress_seconds:Number(item.progress)||0,duration_seconds:Number(item.duration)||0,metadata:{kind:item.kind||null,fallback:item.fallback||null},last_opened_at:new Date(Number(item.visitedAt)||Date.now()).toISOString()};
  return client.from("tv_activity_history").upsert(row,{onConflict:"user_id,activity_type,media_type,media_id"}).then(function(r){if(r.error)console.warn("Central+ histórico remoto:",r.error.message)});
 }
 function syncLocal(){
  if(!client||!user)return Promise.resolve();
  var all=[];
  read(MEDIA).forEach(function(x){all.push(syncItem("continue_watching",x))});
  read(APPS).forEach(function(x){all.push(syncItem("recent_app",x))});
  return Promise.all(all).then(loadRemote);
 }
 function loadRemote(){
  if(!client||!user)return Promise.resolve();
  return client.from("tv_activity_history").select("*").in("activity_type",["continue_watching","recent_app"]).order("last_opened_at",{ascending:false}).limit(24).then(function(res){
   if(res.error){console.warn("Central+ histórico remoto:",res.error.message);return}
   var media=[],apps=[];
   (res.data||[]).forEach(function(r){
    var item={id:r.media_id,title:r.title,poster:r.poster_url||"",href:r.target_url||"",url:r.target_url||"",visitedAt:new Date(r.last_opened_at).getTime(),progress:r.progress_seconds||0,duration:r.duration_seconds||0,kind:r.media_type,fallback:(r.metadata&&r.metadata.fallback)||r.title.slice(0,2).toUpperCase(),name:r.title,logo:r.poster_url||""};
    if(r.activity_type==="recent_app")apps.push(item);else media.push(item);
   });
   var localM=read(MEDIA),localA=read(APPS);
   write(MEDIA,unique(media.concat(localM),"id").slice(0,12));
   write(APPS,unique(apps.concat(localA),"name").slice(0,12));
   remoteReady=true;render();
  });
 }
 function styles(){if(document.getElementById("cp-history-styles"))return;var s=document.createElement("style");s.id="cp-history-styles";s.textContent="#cp-api-home-continue .cp-history-card{flex:0 0 148px;display:block;text-decoration:none;color:inherit}#cp-api-home-continue .cp-history-card img{width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:12px;background:#171a22}#cp-api-home-continue .cp-history-card strong{display:block;font-size:12px;margin-top:7px;line-height:1.3}#cp-api-home-continue .cp-history-progress{height:3px;background:#ffffff25;border-radius:8px;margin-top:7px;overflow:hidden}#cp-api-home-continue .cp-history-progress span{display:block;height:100%;background:#fff}#cp-api-home-apps .cp-history-app{flex:0 0 72px;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;color:inherit}#cp-api-home-apps .cp-history-logo{width:64px;height:64px;border-radius:18px;background:#191b23;border:1px solid #ffffff20;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:16px;font-weight:800}#cp-api-home-apps .cp-history-logo img{width:100%;height:100%;object-fit:contain}#cp-api-home-apps .cp-history-app span{font-size:11px;color:#ffffffa0;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
  document.head.appendChild(s)}
 function render(){
  styles();var cr=document.querySelector("#cp-api-home-continue"),ar=document.querySelector("#cp-api-home-apps");
  if(cr){var ms=read(MEDIA).slice(0,8);if(ms.length){cr.innerHTML="";ms.slice().reverse().forEach(function(x){var a=document.createElement("a");a.className="cp-history-card";a.setAttribute("data-history-id",x.id);a.href=x.href||"#";var im=document.createElement("img");im.loading="lazy";im.alt=x.title;im.src=x.poster||"";im.onerror=function(){this.style.display="none"};var t=document.createElement("strong");t.textContent=x.title;var p=document.createElement("div");p.className="cp-history-progress";var f=document.createElement("span");f.style.width=(x.duration?Math.min(100,Math.round((x.progress||0)/x.duration*100)):0)+"%";p.appendChild(f);a.appendChild(im);a.appendChild(t);a.appendChild(p);cr.insertBefore(a,cr.firstChild)})}}
  if(ar){var apps=read(APPS).slice(0,8);if(apps.length){ar.innerHTML="";apps.slice().reverse().forEach(function(x){var a=document.createElement("a");a.className="cp-history-app";a.href=x.url||"/central-plus-apps.html";var l=document.createElement("div");l.className="cp-history-logo";if(x.logo){var im=document.createElement("img");im.src=x.logo;im.alt="";im.onerror=function(){l.textContent=x.fallback||x.name.slice(0,2)};l.appendChild(im)}else l.textContent=x.fallback||x.name.slice(0,2);var t=document.createElement("span");t.textContent=x.name||x.title;a.appendChild(l);a.appendChild(t);ar.insertBefore(a,ar.firstChild)})}}
 }
 document.addEventListener("click",function(e){
  var app=e.target.closest("#cp-api-home-apps a,#cp-api-home-apps [data-app-id],#cp-api-home-apps [data-app],#apps-row a.app-card,a.app-card");
  if(app){recordApp(app);return}
  var media=e.target.closest("#cp-api-home-continue a,.film-tile,.series-tile,.cp-film-wide,.cp-series-wide,.cp-api-card");
  if(media)recordMedia(media);
 },true);
 function initAuth(){
  import("https://esm.sh/@supabase/supabase-js@2").then(function(mod){
   client=mod.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   return client.auth.getSession();
  }).then(function(res){user=res.data&&res.data.session&&res.data.session.user||null;if(user)syncLocal()})
  .catch(function(e){console.warn("Central+ histórico/auth:",e.message)});
  if(client&&client.auth)client.auth.onAuthStateChange(function(_event,session){user=session&&session.user||null;if(user)syncLocal()});
 }
 function start(){render();initAuth();window.addEventListener("pageshow",render);window.addEventListener("storage",function(e){if(e.key===MEDIA||e.key===APPS)render()})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();