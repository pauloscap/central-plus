/* Central+ account avatar and navigation shared across sections. */
(function(){
 "use strict";
 const URL="https://bdprhaxyarmxkwdvfqab.supabase.co";
 const KEY="sb_publishable_eZlq5PTGsThQNZsxqsrXEg_S9ZrbH0x";
 function findTrigger(){
  return document.getElementById("profile-button") ||
   Array.prototype.find.call(document.querySelectorAll("div"),function(n){
    return n.textContent.trim()==="A" && n.className && String(n.className).indexOf("rounded-full bg-white text-black")>=0;
   });
 }
 function setPhoto(trigger,url){
  if(!trigger)return;
  let img=trigger.querySelector("img[data-central-profile-photo]");
  if(!url || !/^https?:\/\//i.test(url)){
   if(img)img.remove();
   const svg=trigger.querySelector("svg");if(svg)svg.style.display="";
   trigger.style.backgroundImage="";
   return;
  }
  if(!img){
   img=document.createElement("img");img.dataset.centralProfilePhoto="true";img.alt="Foto do perfil";
   img.style.cssText="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block";
   trigger.appendChild(img);
  }
  img.src=url;img.onerror=function(){img.remove();const svg=trigger.querySelector("svg");if(svg)svg.style.display="";};
  const svg=trigger.querySelector("svg");if(svg)svg.style.display="none";
  trigger.style.overflow="hidden";
  trigger.setAttribute("aria-label","Abrir perfil e conta");
  trigger.title="Perfil e conta";
 }
 async function boot(){
  const trigger=findTrigger();
  if(trigger){
   trigger.setAttribute("aria-label","Abrir perfil e conta");
   trigger.title="Perfil e conta";
   trigger.style.cursor="pointer";
   trigger.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();window.location.href="/central-plus-conta.html";},true);
   if(trigger.tagName!=="BUTTON"){trigger.setAttribute("role","link");trigger.setAttribute("tabindex","0");trigger.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();window.location.href="/central-plus-conta.html";}});}
  }
  try{
   const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
   const client=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
   async function refresh(session){
    if(!session||!session.user){setPhoto(trigger,"");return;}
    let photo=session.user.user_metadata?.avatar_url||session.user.user_metadata?.picture||"";
    try{
     const {data}=await client.from("profiles").select("avatar_url").eq("id",session.user.id).maybeSingle();
     if(data?.avatar_url)photo=data.avatar_url;
    }catch(_){}
    setPhoto(trigger,photo);
   }
   const {data}=await client.auth.getSession();await refresh(data?.session);
   client.auth.onAuthStateChange((_event,session)=>{refresh(session);});
  }catch(error){console.warn("Central+ profile avatar:",error?.message||error);}
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();