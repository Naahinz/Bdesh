/* Bdesh beta accounts. The key below is a public Supabase publishable key, not a secret. */
(() => {
'use strict';
const apiURL='https://xeqixwmulwonvhifcmvn.supabase.co';
const publicKey="sb_publishable_2Jp14PFt4_mLDT4cpqLfUw_d-tDSnwj";
const client=globalThis.supabase?.createClient(apiURL,publicKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
if(client) globalThis.bdeshSupabase=client;
// This beta uses Google OAuth exclusively; no browser-side email registration or password flows.
const el=id=>document.getElementById(id);
const panel=el('auth-panel'), msg=el('auth-message'), toggle=el('account-toggle');
if(!client){toggle.textContent='Account service unavailable';toggle.addEventListener('click',()=>{panel.hidden=false;msg.textContent='The account library did not load. Please refresh the page and try again.'});return}
let user=null, suppress=false, syncUserId=null;
const scoped=name=>user?'bdesh-user-'+user.id+'-'+name:'bdesh-'+name;
toggle.textContent='Checking session…';toggle.disabled=true;
const notify=(text,error=false)=>{msg.textContent=text;msg.classList.toggle('error',error)};
const open=()=>{panel.hidden=false;el('google-signin').focus();};
const requestedNext=new URLSearchParams(location.search).get('next');
const returnPath=requestedNext==='/workspace.html'||requestedNext==='/workspace.html#profile'?'/workspace.html':null;
const goToWorkspace=()=>{if(returnPath&&location.pathname!=='/workspace.html')location.assign(returnPath)};
if(new URLSearchParams(location.search).get('signin')==='1')open();
const close=()=>{panel.hidden=true;notify('')};
toggle.addEventListener('click',async()=>{if(user){const {error}=await client.auth.signOut();if(error)notify(error.message,true);else{user=null;toggle.textContent='Beta sign in';document.dispatchEvent(new CustomEvent('bdesh:auth-change',{detail:{user:null}}));open();notify('Signed out.')}return;}open()});
el('auth-close').addEventListener('click',close);
el('google-signin').addEventListener('click',async()=>{const button=el('google-signin');button.disabled=true;notify('Redirecting to Google…');try{const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+(returnPath||location.pathname)}});if(error)throw error}catch(e){notify('Google sign-in is not ready: '+(e?.message||'Please try again.'),true);button.disabled=false}});
const stages={Science:'science','Business Studies':'business',Humanities:'humanities','Not selected yet':'undecided'};
const names={science:'Science',business:'Business Studies',humanities:'Humanities',undecided:'Not selected yet'};
const intakes={'2027':2027,'2028':2028,'2029':2029};
async function saveProfile(){if(!user||suppress)return;let v=el('intake').value, n=intakes[v]||parseInt(v,10)||null;
if(n===2030) n=2030;
const {error}=await client.from('student_profiles').upsert({user_id:user.id,academic_stage:el('stage').value,nctb_group:stages[el('group').value]||'undecided',target_intake:n,preferred_language:document.documentElement.lang==='bn'?'bn':'en',updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)notify('Could not save profile: '+error.message,true)}
async function saveTask(task_id,is_complete){if(!user||suppress)return;const {error}=await client.from('student_progress').upsert({user_id:user.id,task_id,is_complete,updated_at:new Date().toISOString()},{onConflict:'user_id,task_id'});if(error)notify('Could not save progress: '+error.message,true)}
async function synchronize(currentUser){if(!currentUser)return;if(syncUserId===currentUser.id)return;syncUserId=currentUser.id;user=currentUser;toggle.textContent='Sign out ('+(user.email||'account')+')';window.bdeshCurrentUserId=currentUser.id;const [{data:profile,error:pErr},{data:progress,error:tErr}]=await Promise.all([client.from('student_profiles').select('*').eq('user_id',user.id).maybeSingle(),client.from('student_progress').select('task_id,is_complete').eq('user_id',user.id)]);if(pErr||tErr){syncUserId=null;window.bdeshCurrentUserId=null;notify('Unable to load your saved data. '+(pErr||tErr).message,true);return}
suppress=true;
// Reset to safe defaults for an account without a saved profile. Never adopt
// another student's legacy browser-wide task state as this account's data.
if(!profile){
 el('stage').value='11';el('group').value='Not selected yet';
 el('intake').value=[...el('intake').options].some(o=>o.value==='2027')?'2027':el('intake').options[0].value;
 localStorage.setItem(scoped('stage'),el('stage').value);
 localStorage.setItem(scoped('group'),el('group').value);
 localStorage.setItem(scoped('intake'),el('intake').value);
}
if(profile){localStorage.setItem(scoped('stage'),profile.academic_stage);el('stage').value=profile.academic_stage;if(profile.nctb_group){el('group').value=names[profile.nctb_group]||'Not selected yet';localStorage.setItem(scoped('group'),el('group').value)}if(profile.target_intake){const value=String(profile.target_intake);if([...el('intake').options].some(o=>o.value===value)){el('intake').value=value;localStorage.setItem(scoped('intake'),value)}}}
for(const stage of ['9','11','12','gap'])for(let i=0;i<4;i++)localStorage.removeItem(scoped(stage+'-'+i));
for(const t of progress||[])localStorage.setItem(scoped(t.task_id),t.is_complete?'1':'0');
el('stage').dispatchEvent(new Event('change'));suppress=false; if(!profile)await saveProfile();document.dispatchEvent(new CustomEvent('bdesh:auth-change',{detail:{user:{id:user.id,email:user.email||''}}}));// Preserve anonymous legacy progress locally; do not auto-attach it to a signed-in account.
if(returnPath)goToWorkspace();
}
document.addEventListener('bdesh:task-change',e=>saveTask(e.detail.task_id,e.detail.is_complete));
document.addEventListener('bdesh:profile-change',saveProfile);
document.addEventListener('bdesh:reset',async e=>{if(!user||suppress)return;const tasks=Array.from({length:4},(_,i)=>({user_id:user.id,task_id:e.detail.stage+'-'+i,is_complete:false}));const {error}=await client.from('student_progress').upsert(tasks,{onConflict:'user_id,task_id'});if(error)notify(error.message,true)});
function signedOut(){user=null;syncUserId=null;window.bdeshCurrentUserId=null;toggle.disabled=false;toggle.textContent='Beta sign in';document.dispatchEvent(new CustomEvent('bdesh:auth-change',{detail:{user:null}}))}
client.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'){signedOut();return}
  if(event==='PASSWORD_RECOVERY'){open();notify('Email-password recovery is paused during the Google-only beta. Please sign in with Google instead.',true)}
  if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='TOKEN_REFRESHED'){
    toggle.disabled=false;
    if(session?.user){
      toggle.textContent='Sign out ('+(session.user.email||'account')+')';
      // Deferred so async profile fetches never block Supabase auth event handling.
      Promise.resolve().then(()=>synchronize(session.user).catch(e=>notify('Could not restore account data: '+e.message,true)));
    }else if(event==='INITIAL_SESSION')signedOut();
  }
});
// getSession loads a saved session locally, avoiding unnecessary getUser network calls on refresh.
client.auth.getSession().then(({data,error})=>{
  if(error){notify('Could not restore your session: '+error.message,true);signedOut();return}
  toggle.disabled=false;
  if(data?.session?.user){toggle.textContent='Sign out ('+(data.session.user.email||'account')+')';synchronize(data.session.user).catch(e=>notify(e.message,true))}
  else if(!user)signedOut();
}).catch(e=>{notify('Could not check session: '+e.message,true);signedOut()});
})();