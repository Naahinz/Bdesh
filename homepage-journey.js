/* Homepage roadmap: read-only summary of journey activity. No personal data is published. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ring=$('journey-ring'),count=$('journey-progress-count'),note=$('journey-progress-note');
if(!ring||!count)return;
let userId=null;
const stages=[false,false,false,false,false];
function draw(){
 const n=stages.filter(Boolean).length;ring.style.setProperty('--journey-percent',String(n*20)+'%');ring.setAttribute('aria-valuenow',String(n));
 count.replaceChildren(document.createTextNode(String(n)));const suffix=document.createElement('span');suffix.textContent='/5';count.append(suffix);
 ['learn','prepare-step','profile-step','discover-step','apply-step'].forEach((id,i)=>$(id)?.classList.toggle('journey-started',stages[i]));
}
try{const data=JSON.parse(localStorage.getItem('bdesh-learning-v1')||'{}');stages[0]=Array.isArray(data.done)&&data.done.length>0}catch{}
draw();
async function refresh(user){
 const sb=window.bdeshSupabase;if(!sb||!user?.id)return;
 if(userId===user.id)return;userId=user.id;
 note.textContent='Checking your saved progress…';
 const results=await Promise.allSettled([
 sb.from('student_readiness').select('milestone_id,state').eq('user_id',user.id),
 sb.from('student_admissions_profiles').select('school_name,intended_majors').eq('user_id',user.id).maybeSingle(),
 sb.from('student_applications').select('status').eq('user_id',user.id)
 ]);
 const read=i=>results[i].status==='fulfilled'&&!results[i].value.error?results[i].value.data:null;
 const progress=read(0),profile=read(1),apps=read(2);
 if(progress){stages[0] ||= progress.some(p=>p.milestone_id.startsWith('lesson-')&&p.state==='done');stages[1]=progress.some(p=>!p.milestone_id.startsWith('lesson-')&&['done','in_progress'].includes(p.state))}
 if(profile)stages[2]=Boolean(profile.school_name||profile.intended_majors);
 if(apps){stages[3]=apps.length>0;stages[4]=apps.some(a=>['preparing','submitted','decision_received'].includes(a.status))}
 draw();
 note.textContent='Stages started, based on activity saved to your account. Open the workspace for detailed progress.';
}
document.addEventListener('bdesh:auth-change',e=>refresh(e.detail.user).catch(()=>{note.textContent='Your local reading activity is shown. Cloud status is temporarily unavailable.'}));
// Restore an existing signed-in session even if the auth event fired earlier.
setTimeout(()=>{const sb=window.bdeshSupabase;sb?.auth.getSession().then(({data})=>{if(data?.session?.user)refresh(data.session.user)}).catch(()=>{})},0);
window.addEventListener('storage',()=>{try{const d=JSON.parse(localStorage.getItem('bdesh-learning-v1')||'{}');stages[0] ||= Array.isArray(d.done)&&d.done.length>0;draw()}catch{}});
})();