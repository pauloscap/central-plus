/* Central+ cross-device data sync: favorites stored in Supabase per authenticated user. */
(function(){
 "use strict";
 const URL="https://bdprhaxyarmxkwdvfqab.supabase.co";
 const KEY="sb_publishable_eZlq5PTGsThQNZsxqsrXEg_S9ZrbH0x";
 const slug=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);
 function titleOf(card){
  return card?.dataset?.title||card?.querySelector(".poster-title,.channel-name,.card-title,h3")?.textContent?.trim()||card?.querySelector(".card-caption")?.textContent?.trim()||"";
 }
 function posterOf(card){
  const img=card?.querySelector(".poster-art img,.poster img,.poster-art,.channel-artwork,img");
  if(img?.tagName==="IMG"&&img.currentSrc)return img.currentSrc;
  const bg=img&&getComputedStyle(img).backgroundImage;
  const m=bg&&bg.match(/url\(["']?(.*?)["']?\)/);
  return m?.[1]||null;
 }
 function typeOf(card){
  const section=card?.closest("section[id]")?.id||"";
  if(section==="series")return "series";
  if(section==="apps"||card?.classList.contains("app-card"))return "app";
  if(section==="ao-vivo")return "channel";
  if(section==="noticias")return "other";
  return "movie";
 }
 function notify(message){
  const n=document.createElement("div");n.textContent=message;
  n.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;background:#f5f5f7;color:#111;padding:11px 16px;border-radius:999px;font:600 13px system-ui;box-shadow:0 8px 28px #0008";
  document.body.appendChild(n);setTimeout(()=>n.remove(),2600);
 }
 async function boot(){
  let client,user;
  try{
   const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
   client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   const {data,error}=await client.auth.getUser();if(error&&error.name!=="AuthSessionMissingError")throw error;user=data?.user||null;
  }catch(e){console.warn("Central+ sync:",e?.message||e);return;}
  const rail=document.getElementById("favorites-rail");
  let rows=[];
  async function load(){
   if(!user){rows=[];if(rail)rail.innerHTML='<div style="color:#aeb4c2;font-size:13px;padding:18px 0">Entre na sua conta para sincronizar sua lista entre dispositivos.</div>';return;}
   const {data,error}=await client.from("tv_favorites").select("id,media_type,media_id,title,poster_url,metadata,created_at").eq("user_id",user.id).order("created_at",{ascending:false});
   if(error){console.warn("Central+ favorites:",error.message);if(rail)rail.innerHTML='<div style="color:#aeb4c2;font-size:13px;padding:18px 0">Não foi possível carregar sua lista. Tente atualizar a página.</div>';return;}
   rows=data||[];
   document.querySelectorAll(".poster-fav").forEach(btn=>{
    const card=btn.closest(".card"),title=titleOf(card),type=typeOf(card),id=slug(card?.dataset?.title||title);
    const exists=rows.some(r=>r.media_type===type&&r.media_id===id);
    btn.classList.toggle("is-fav",exists);btn.setAttribute("aria-label",exists?"Remover da minha lista":"Adicionar à minha lista");
   });
   renderRail();
  }
  function renderRail(){
   if(!rail)return;
   if(!user){rail.innerHTML='<div style="color:#aeb4c2;font-size:13px;padding:18px 0">Entre na sua conta para sincronizar sua lista entre dispositivos.</div>';return;}
   if(!rows.length){rail.innerHTML='<div style="color:#858a97;font-size:13px;padding:18px 0">Sua lista está vazia. Use o ícone de marcador nos títulos para guardar favoritos.</div>';return;}
   rail.innerHTML="";
   rows.forEach(row=>{
    const card=document.createElement("article");card.className="card";card.style.cssText="flex:0 0 190px;min-width:0;border-radius:12px;overflow:hidden;background:#141720;border:1px solid #ffffff18";
    const art=document.createElement("div");art.style.cssText="aspect-ratio:16/10;background:#222936 center/cover no-repeat;display:flex;align-items:end;padding:12px";
    if(row.poster_url)art.style.backgroundImage="linear-gradient(0deg,#05070dcc,transparent),url("+JSON.stringify(row.poster_url)+")";
    const title=document.createElement("div");title.textContent=row.title||"Título salvo";title.style.cssText="font-weight:700;font-size:14px;line-height:1.25;color:white;text-shadow:0 1px 8px #000";
    art.appendChild(title);card.appendChild(art);
    const meta=document.createElement("div");meta.textContent=({movie:"Filme",series:"Série",channel:"Canal",app:"Aplicativo",other:"Outro"})[row.media_type]||"Favorito";meta.style.cssText="padding:10px 12px;color:#b9c0cd;font-size:11px";
    const remove=document.createElement("button");remove.type="button";remove.textContent="Remover da lista";remove.style.cssText="margin:0 12px 12px;padding:7px 10px;border:1px solid #ffffff22;border-radius:999px;background:#ffffff0c;color:#fff;font-size:11px;cursor:pointer";
    remove.addEventListener("click",async()=>{remove.disabled=true;const {error}=await client.from("tv_favorites").delete().eq("user_id",user.id).eq("id",row.id);if(error){notify("Não foi possível remover o favorito.");remove.disabled=false;return;}await load();notify("Favorito removido.");});
    card.append(meta,remove);rail.appendChild(card);
   });
  }
  document.addEventListener("click",async event=>{
   const btn=event.target.closest?.(".poster-fav");if(!btn)return;
   event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
   if(!user){notify("Entre na sua conta para sincronizar seus favoritos.");return;}
   const card=btn.closest(".card"),title=titleOf(card),type=typeOf(card),id=slug(card?.dataset?.title||title);
   if(!title||!id){notify("Não foi possível identificar este título.");return;}
   btn.disabled=true;
   try{
    const existing=rows.find(r=>r.media_type===type&&r.media_id===id);
    if(existing){
     const {error}=await client.from("tv_favorites").delete().eq("user_id",user.id).eq("id",existing.id);if(error)throw error;
    }else{
     const {error}=await client.from("tv_favorites").insert({user_id:user.id,media_type:type,media_id:id,title,poster_url:posterOf(card),metadata:{source:"central-plus"}});if(error)throw error;
    }
    await load();notify(existing?"Removido da sua lista.":"Favorito sincronizado com sua conta.");
   }catch(e){console.error("Central+ favorite save:",e);notify("Não foi possível salvar. Verifique sua conexão.");}
   finally{btn.disabled=false;}
  },true);
  client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;load();});
  await load();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();