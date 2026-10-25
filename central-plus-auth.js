(() => {
  "use strict";
  const SUPABASE_URL = "https://bdprhaxyarmxkwdvfqab.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eZlq5PTGsThQNZsxqsrXEg_S9ZrbH0x";
  const $ = id => document.getElementById(id);
  const text = (id, value) => { const el=$(id); if(el) el.textContent=value; };
  const show = (id, visible) => { const el=$(id); if(el) el.hidden=!visible; };
  const safe = value => String(value || "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  async function init() {
    const authPanel = $("authPanel");
    const profilePanel = $("profilePanel");
    const form = $("authForm");
    const profileForm = $("profileForm");
    const nameField = $("authName");
    const usernameField = $("authUsername");
    const emailField = $("authEmail");
    const passwordField = $("authPassword");
    const modeLabel = $("authSubmit");
    const modeToggle = $("authModeToggle");
    let mode = "signup";
    let client;
    let currentUser = null;
    let loadingProfile = false;
    const setStatus = (message, kind) => {
      const profileVisible=profilePanel&&!profilePanel.hidden;
      const status=profileVisible?$("accountStatusProfile"):$("accountStatus");
      if(!status) return;
      status.textContent=message||"";
      status.dataset.kind=kind||"info";
      status.hidden=!message;
    };
    const setMode = next => {
      mode=next;
      const signup=mode==="signup";
      show("authNameWrap",signup);
      show("authUsernameWrap",signup);
      if(nameField)nameField.required=signup;
      if(modeLabel)modeLabel.textContent=signup?"Criar minha conta":"Entrar";
      if(modeToggle)modeToggle.textContent=signup?"Já tenho uma conta · Entrar":"Ainda não tenho conta · Criar perfil";
      text("authEyebrow",signup?"COMECE SUA JORNADA":"BEM-VINDO DE VOLTA");
      text("authHeading",signup?"Crie seu perfil Central+":"Entre na sua Central+");
      text("authDescription",signup?"Salve filmes, acompanhe séries e personalize sua experiência.":"Entre para acessar seu perfil e continuar de onde parou.");
      if(passwordField)passwordField.autocomplete=signup?"new-password":"current-password";
      setStatus("");
    };
    const initials = value => {
      const parts=String(value||"CP").trim().split(/\s+/).filter(Boolean);
      return (parts.length>1?parts[0][0]+parts[parts.length-1][0]:parts[0].slice(0,2)).toUpperCase();
    };
    const updateAvatarPreview = () => {
      const url=$("profileAvatarUrl")?.value.trim()||"";
      const img=$("profileAvatarPreview");
      const initialsNode=$("profileAvatarInitials");
      if(!img||!initialsNode)return;
      if(url && /^https?:\/\//i.test(url)){
        img.src=url;img.hidden=false;initialsNode.hidden=true;
      }else{
        img.removeAttribute("src");img.hidden=true;initialsNode.hidden=false;
        initialsNode.textContent=initials($("profileName")?.value||currentUser?.email||"CP");
      }
    };
    const showProfile = async user => {
      currentUser=user;
      show("authPanel",false);show("profilePanel",true);
      text("profileEmail",user.email||"Conta autenticada");
      text("profileAvatarInitials",initials(user.user_metadata?.name||user.email||"CP"));
      if(loadingProfile)return;
      loadingProfile=true;
      try{
        const {data,error}=await client.from("profiles").select("display_name,avatar_url").eq("id",user.id).maybeSingle();
        if(error)throw error;
        const displayName=data?.display_name||user.user_metadata?.display_name||user.user_metadata?.full_name||user.user_metadata?.name||"";
        if($("profileName"))$("profileName").value=displayName;
        text("profileHeading",displayName.trim()||"Seu espaço");
        if($("profileUsername"))$("profileUsername").value=user.user_metadata?.username||"";
        if($("profileAvatarUrl"))$("profileAvatarUrl").value=data?.avatar_url||user.user_metadata?.avatar_url||user.user_metadata?.picture||"";
        let extras={};
        try{extras=JSON.parse(localStorage.getItem("centralPlusProfileExtras:"+user.id)||"{}");}catch(_){}
        if($("profileUsername"))$("profileUsername").value=extras.username||user.user_metadata?.username||"";
        if($("profileBio"))$("profileBio").value=extras.bio||"";
        if(!data){
          const {error:insertError}=await client.from("profiles").upsert({
            id:user.id,
            display_name:user.user_metadata?.display_name||user.user_metadata?.full_name||user.user_metadata?.name||null,
            avatar_url:user.user_metadata?.avatar_url||null
          },{onConflict:"id"});
          if(insertError)throw insertError;
        }
        updateAvatarPreview();
        setStatus("Perfil conectado ao Supabase. Suas alterações serão salvas na sua conta.","success");
      }catch(error){
        setStatus("Sua conta está conectada, mas não foi possível carregar o perfil: "+(error.message||"tente novamente."),"error");
      }finally{loadingProfile=false;}
    };
    try{
      const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
      client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
      });
      const {data,error}=await client.auth.getUser();
      if(error && error.name!=="AuthSessionMissingError")console.warn("Central+ Auth:",error.message);
      if(data?.user)await showProfile(data.user);
      else{show("authPanel",true);show("profilePanel",false);setMode("signup");}
      client.auth.onAuthStateChange((_event,session)=>{
        if(session?.user)showProfile(session.user);
        else{currentUser=null;show("profilePanel",false);show("authPanel",true);setMode("login");}
      });
    }catch(error){
      show("authPanel",true);show("profilePanel",false);
      setStatus("Não foi possível iniciar a conexão com o Supabase. Recarregue a página ou tente novamente mais tarde.","error");
      console.error("Central+ Supabase initialization:",error);
      return;
    }
    const googleButton=$("googleSignIn");
    if(googleButton)googleButton.addEventListener("click",async()=>{
      if(!client){setStatus("Conectando ao serviço de conta…","info");return;}
      googleButton.disabled=true;setStatus("Abrindo o acesso seguro do Google…","info");
      try{
        const {error}=await client.auth.signInWithOAuth({
          provider:"google",
          options:{redirectTo:"https://central-plus-roan.vercel.app/central-plus-conta.html"}
        });
        if(error)throw error;
      }catch(error){
        setStatus(error.message||"Não foi possível iniciar o login com Google.","error");
        googleButton.disabled=false;
      }
    });
    if(modeToggle)modeToggle.addEventListener("click",()=>setMode(mode==="signup"?"login":"signup"));
    if(form)form.addEventListener("submit",async event=>{
      event.preventDefault();
      if(!client)return;
      const email=emailField.value.trim(),password=passwordField.value;
      const name=nameField.value.trim(),username=usernameField.value.trim().replace(/^@/,"");
      if(password.length<8){setStatus("Use uma senha com pelo menos 8 caracteres.","error");return;}
      modeLabel.disabled=true;setStatus(mode==="signup"?"Criando sua conta…":"Entrando…","info");
      try{
        if(mode==="signup"){
          const {data,error}=await client.auth.signUp({
            email,password,
            options:{data:{display_name:name,full_name:name,name,username:username||null}}
          });
          if(error)throw error;
          if(data.session&&data.user){
            await showProfile(data.user);
            if($("profileName")&&!$("profileName").value)$("profileName").value=name;
            if($("profileUsername")&&!$("profileUsername").value)$("profileUsername").value=username;
            setStatus("Conta criada! Seu perfil já está conectado.","success");
          }else{
            setMode("login");
            setStatus("Cadastro iniciado. Confira seu e-mail para confirmar a conta; depois volte aqui para entrar.","success");
          }
        }else{
          const {data,error}=await client.auth.signInWithPassword({email,password});
          if(error)throw error;
          if(data.user)await showProfile(data.user);
          setStatus("Login realizado com sucesso.","success");
        }
      }catch(error){
        setStatus(error.message||"Não foi possível concluir a operação.","error");
      }finally{modeLabel.disabled=false;}
    });
    if(profileForm)profileForm.addEventListener("submit",async event=>{
      event.preventDefault();
      if(!currentUser){setStatus("Entre na sua conta antes de salvar o perfil.","error");return;}
      const username=($("profileUsername")?.value||"").trim().replace(/^@/,"");
      const name=($("profileName")?.value||"").trim();
      const avatar=($("profileAvatarUrl")?.value||"").trim();
      const bio=($("profileBio")?.value||"").trim();
      if(username && !/^[a-zA-Z0-9._-]{3,24}$/.test(username)){
        setStatus("O nome de usuário deve ter de 3 a 24 caracteres: letras, números, ponto, hífen ou sublinhado.","error");return;
      }
      const save=$("profileSave");if(save)save.disabled=true;
      setStatus("Salvando seu perfil…","info");
      try{
        const {error}=await client.from("profiles").upsert({
          id:currentUser.id,
          display_name:name||null,
          avatar_url:avatar&&/^https?:\/\//i.test(avatar)?avatar:null,
        },{onConflict:"id"});
        if(error)throw error;
        text("profileHeading",name||"Seu espaço");
        try{localStorage.setItem("centralPlusProfileExtras:"+currentUser.id,JSON.stringify({username,bio}));}catch(_){}
        setStatus("Nome e avatar salvos na sua conta. Nome de usuário e bio ficam salvos neste dispositivo.","success");
        updateAvatarPreview();
      }catch(error){
        const message=error.code==="23505"?"Esse nome de usuário já está em uso. Escolha outro.":(error.message||"Não foi possível salvar o perfil.");
        setStatus(message,"error");
      }finally{if(save)save.disabled=false;}
    });
    $("profileName")?.addEventListener("input",updateAvatarPreview);
    $("profileAvatarUrl")?.addEventListener("input",updateAvatarPreview);
    $("signOutBtn")?.addEventListener("click",async()=>{
      if(!client)return;
      const {error}=await client.auth.signOut();
      if(error)setStatus(error.message,"error");
      else setStatus("Você saiu da sua conta.","success");
    });
    setMode("signup");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();