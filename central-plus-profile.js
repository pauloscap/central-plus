/* Central+ profile and Google sign-in entry point. */
(function(){
 "use strict";
 var SUPABASE_URL="https://bdprhaxyarmxkwdvfqab.supabase.co";
 var SUPABASE_KEY="sb_publishable_eZlq5PTGsThQNZsxqsrXEg_S9ZrbH0x";
 var client=null,mode="login",busy=false;
 function el(tag,attrs,children){var n=document.createElement(tag);Object.keys(attrs||{}).forEach(function(k){if(k==="text")n.textContent=attrs[k];else if(k==="html")n.innerHTML=attrs[k];else if(k==="style")n.style.cssText=attrs[k];else n.setAttribute(k,attrs[k])});(children||[]).forEach(function(c){n.appendChild(c)});return n}
 function boot(){
  var style=el("style",{text:""});
  style.textContent="#cp-profile-modal{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(12px);font-family:Arial,sans-serif;color:#fff}#cp-profile-box{width:min(420px,100%);background:#151519;border:1px solid #ffffff1c;border-radius:24px;padding:26px;box-shadow:0 25px 90px #000b}#cp-profile-box input{width:100%;height:44px;border:1px solid #ffffff22;border-radius:12px;background:#ffffff09;color:#fff;padding:0 13px;margin:6px 0 12px;box-sizing:border-box;font-size:14px}#cp-profile-box button{cursor:pointer;border:0;border-radius:999px;height:44px;padding:0 16px;font-weight:700;font-size:14px}#cp-google{width:100%;background:#fff;color:#111}#cp-email-submit{width:100%;background:#ffffff16;border:1px solid #ffffff20!important;color:#fff}#cp-profile-close{float:right;background:#ffffff12;color:#fff;width:34px;padding:0}#cp-profile-status{font-size:12px;line-height:1.5;color:#ddd;margin-top:12px;white-space:normal}#cp-profile-box label{font-size:12px;color:#aaa}#cp-profile-switch{background:transparent;color:#ddd;width:100%;margin-top:8px}#cp-profile-box [hidden]{display:none!important}";
  document.head.appendChild(style);
  var avatar=Array.prototype.find.call(document.querySelectorAll("div"),function(n){return n.textContent.trim()==="A"&&n.className&&String(n.className).indexOf("rounded-full bg-white text-black")>=0});
  if(!avatar)return;
  avatar.setAttribute("role","button");avatar.setAttribute("tabindex","0");avatar.setAttribute("aria-label","Perfil e login");avatar.style.cursor="pointer";avatar.title="Entrar / Meu perfil";
  avatar.addEventListener("click",open);avatar.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
  /* O avatar original fica dentro de um grupo hidden md:flex e some em celulares.
     Cria um atalho móvel visível sem alterar o layout principal. */
  var mobileStyle=el("style",{text:""});
  mobileStyle.textContent="@media(max-width:767px){#cp-mobile-profile{display:flex!important}}@media(min-width:768px){#cp-mobile-profile{display:none!important}}";
  document.head.appendChild(mobileStyle);
  var mobile=el("button",{id:"cp-mobile-profile",type:"button","aria-label":"Perfil e login",text:"A",style:"display:none;position:fixed;top:12px;right:64px;z-index:9998;width:32px;height:32px;border-radius:50%;background:#fff;color:#000;font:700 13px Arial,sans-serif;border:1px solid #ffffff40;box-shadow:0 4px 18px #0008;align-items:center;justify-content:center;cursor:pointer"});
  mobile.addEventListener("click",open);
  document.body.appendChild(mobile);
  loadClient();
 }
 function loadClient(){
  function setup(){try{client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){console.error("Central+ login",e)}}
  if(window.supabase&&window.supabase.createClient){setup();return}
  var s=el("script",{src:"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"});s.onload=setup;s.onerror=function(){console.error("Não foi possível carregar o login Central+")};document.head.appendChild(s);
 }
 function open(){
  if(document.getElementById("cp-profile-modal"))return;
  mode="login";
  var modal=el("div",{id:"cp-profile-modal"});
  var box=el("div",{id:"cp-profile-box"});
  var close=el("button",{id:"cp-profile-close",type:"button",text:"×"});
  close.addEventListener("click",function(){modal.remove()});
  var heading=el("h2",{text:"Sua Central+",style:"font-size:24px;font-weight:800;letter-spacing:-.5px;margin:0 0 5px"});
  var intro=el("p",{text:"Entre para guardar seu perfil e sincronizar seu histórico.",style:"font-size:13px;color:#aaa;line-height:1.5;margin:0 0 20px"});
  var google=el("button",{id:"cp-google",type:"button",text:"Continuar com Google"});
  google.addEventListener("click",async function(){if(!client){status.textContent="Conectando ao serviço de conta…";return}google.disabled=true;status.textContent="Redirecionando para o Google…";try{var r=await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+window.location.pathname}});if(r.error)throw r.error}catch(e){status.textContent=e.message||"Não foi possível iniciar o login com Google.";google.disabled=false}});
  var sep=el("p",{text:"ou use seu e-mail",style:"text-align:center;color:#777;font-size:11px;margin:16px 0"});
  var form=el("form",{id:"cp-email-form"});
  var emailLabel=el("label",{text:"E-mail"}),email=el("input",{type:"email",autocomplete:"email",required:"required",placeholder:"voce@exemplo.com"});
  var passLabel=el("label",{text:"Senha"}),pass=el("input",{type:"password",autocomplete:"current-password",required:"required",minlength:"8",placeholder:"Mínimo de 8 caracteres"});
  var submit=el("button",{id:"cp-email-submit",type:"submit",text:"Entrar"});
  form.append(emailLabel,email,passLabel,pass,submit);
  var sw=el("button",{id:"cp-profile-switch",type:"button",text:"Ainda não tenho conta · Criar conta"});
  var status=el("div",{id:"cp-profile-status","aria-live":"polite"});
  sw.addEventListener("click",function(){mode=mode==="login"?"signup":"login";submit.textContent=mode==="login"?"Entrar":"Criar conta";pass.autocomplete=mode==="login"?"current-password":"new-password";sw.textContent=mode==="login"?"Ainda não tenho conta · Criar conta":"Já tenho conta · Entrar";intro.textContent=mode==="login"?"Entre para guardar seu perfil e sincronizar seu histórico.":"Crie sua conta para manter seus dados entre dispositivos.";status.textContent=""});
  form.addEventListener("submit",async function(e){e.preventDefault();if(!client){status.textContent="Conectando ao serviço de conta…";return}submit.disabled=true;status.textContent=mode==="login"?"Entrando…":"Criando sua conta…";try{var r=mode==="login"?await client.auth.signInWithPassword({email:email.value.trim(),password:pass.value}):await client.auth.signUp({email:email.value.trim(),password:pass.value,options:{emailRedirectTo:window.location.origin+window.location.pathname}});if(r.error)throw r.error;if(mode==="signup"&&!r.data.session)status.textContent="Cadastro iniciado. Confira seu e-mail para confirmar a conta.";else{status.textContent="Login realizado! Seu histórico será sincronizado.";setTimeout(function(){modal.remove()},900)}}catch(err){status.textContent=err.message||"Não foi possível concluir o login."}finally{submit.disabled=false}});
  box.append(close,heading,intro,google,sep,form,sw,status);
  modal.appendChild(box);modal.addEventListener("click",function(e){if(e.target===modal)modal.remove()});document.body.appendChild(modal);
  if(client)client.auth.getSession().then(function(r){if(r.data&&r.data.session){intro.textContent="Conectado como "+(r.data.session.user.email||"usuário");google.textContent="Conta conectada";google.disabled=true;submit.hidden=true;form.querySelectorAll("input").forEach(function(n){n.hidden=true});sw.textContent="Sair da conta";sw.onclick=async function(){var out=await client.auth.signOut();if(out.error)status.textContent=out.error.message;else{intro.textContent="Você saiu da sua conta.";modal.remove()}}}});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();