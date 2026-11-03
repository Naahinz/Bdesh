/* Homepage roadmap: anonymous progress is isolated from authenticated accounts.
   The Supabase user-owned records are authoritative once a student signs in. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ring=$('journey-ring'),count=$('journey-progress-count'),note=$('journey-progress-note');
if(!ring||!count)return;
const stages=[false,false,false,false,false];
let userId=null,generation=0;
function draw(){
 const n=stages.filter(Boolean).length;
 ring.style.setProperty('--journey-percent',String(n*20)+'%');
 ring.setAttribute('aria-valuenow',String(n));
 count.replaceChildren(document.createTextNode(String(n)));
 const suffix=document.createElement('span');suffix.textContent='/5';count.append(suffix);
 ['learn','prepare-step','profile-step','discover-step','apply-step'].forEach((id,i)=>$(id)?.classList.toggle('journey-started',stages[i]));
}
function reset(){stages.fill(false)}
function anonymousProgress(){
 if(userId)return;
 reset();
 try{
  const data=JSON.parse(localStorage.getItem('bdesh-learning-v1')||'{}');
  stages[0]=Array.isArray(data.done)&&data.done.length>0;
 }catch{}
 draw();
 if(note)note.textContent='Sign in to see progress saved to your own account.';
}
async function refresh(user){
 if(!user?.id){userId=null;generation++;anonymousProgress();return}
 if(userId===user.id)return;
 userId=user.id;const request=++generation;
 reset();draw();
 if(note)note.textContent='Checking your saved progress…';
 const sb=window.bdeshSupabase;
 if(!sb){if(note)note.textContent='Account service unavailable. Reload to see saved progress.';return}
 const results=await Promise.allSettled([
  sb.from('student_readiness').select('milestone_id,state').eq('user_id',user.id),
  sb.from('student_admissions_profiles').select('school_name,intended_majors').eq('user_id',user.id).maybeSingle(),
  sb.from('student_applications').select('status').eq('user_id',user.id)
 ]);
 if(generation!==request||userId!==user.id)return;
 const read=i=>results[i].status==='fulfilled'&&!results[i].value.error?results[i].value.data:null;
 const progress=read(0),profile=read(1),apps=read(2);
 if(progress){
  stages[0]=progress.some(p=>p.milestone_id.startsWith('lesson-')&&p.state==='done');
  stages[1]=progress.some(p=>!p.milestone_id.startsWith('lesson-')&&['done','in_progress'].includes(p.state));
 }
 if(profile)stages[2]=Boolean(profile.school_name||profile.intended_majors);
 if(apps){
  stages[3]=apps.length>0;
  stages[4]=apps.some(a=>['preparing','submitted','decision_received'].includes(a.status));
 }
 draw();
 if(note)note.textContent=results.some(x=>x.status==='rejected'||x.value?.error)
  ?'Some saved progress could not be loaded. Please retry after checking your connection.'
  :'Stages started based on activity saved to your account. Open the workspace for detailed progress.';
}
anonymousProgress();
document.addEventListener('bdesh:auth-change',e=>refresh(e.detail.user).catch(()=>{
 if(note)note.textContent='Could not load your account progress. Please retry.';
}));
setTimeout(()=>{
 const sb=window.bdeshSupabase;
 sb?.auth.getSession().then(({data})=>{
  if(data?.session?.user)refresh(data.session.user).catch(()=>{});
 }).catch(()=>{});
},0);
window.addEventListener('storage',e=>{
 if(e.key==='bdesh-learning-v1'&&!userId)anonymousProgress();
});
})();