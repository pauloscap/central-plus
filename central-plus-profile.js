/* Central+ profile navigation: the account flow lives on the profile page. */
(function(){
 "use strict";
 function boot(){
  var avatar=Array.prototype.find.call(document.querySelectorAll("div"),function(n){
   return n.textContent.trim()==="A"&&n.className&&String(n.className).indexOf("rounded-full bg-white text-black")>=0;
  });
  if(!avatar)return;
  avatar.setAttribute("role","link");avatar.setAttribute("tabindex","0");
  avatar.setAttribute("aria-label","Abrir perfil e conta");avatar.style.cursor="pointer";avatar.title="Perfil e conta";
  function go(){window.location.href="/central-plus-conta.html";}
  avatar.addEventListener("click",go);
  avatar.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();