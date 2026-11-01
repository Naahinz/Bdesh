/* Bdesh admissions workspace — student-owned data and zero-cost rule-based guidance. */
(() => {
'use strict';
const URL='https://xeqixwmulwonvhifcmvn.supabase.co',KEY='sb_publishable_2Jp14PFt4_mLDT4cpqLfUw_d-tDSnwj';
const sb=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const authError=$('workspace-auth-error');
function showAuthError(message){authError.textContent=message;authError.hidden=false;$('session-status').textContent='Sign-in issue'}
$('workspace-google-signin').addEventListener('click',async()=>{
 const button=$('workspace-google-signin');button.disabled=true;button.textContent='Opening Google…';authError.hidden=true;
 try{
  if(!sb)throw new Error('Authentication library did not load. Refresh this page.');
  const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+'/workspace.html'}});
  if(error)throw error;
 }catch(error){showAuthError(error.message||'Could not start Google sign-in');button.disabled=false;button.textContent='Continue with Google ↗'}
});
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=['prepare','profile','discover','apply'];
const milestones=[
['foundation','Academic foundation','Maintain strong SSC/HSC coursework and obtain accurate transcripts. GPA requirements differ; no fixed GPA guarantees a full ride.'],
['route','Understand your route','Compare countries, admissions pathways, entry qualifications and total cost of attendance.'],
['funding','Identify funding types','Understand need-based aid, merit awards, government scholarships and what a full ride actually covers.'],
['major','Explore academic interests','Identify areas you want to study and how to demonstrate real curiosity.'],
['english','English-language readiness','Check which tests each institution accepts, waivers and minimum scores.'],
['testing','SAT / ACT decision','Check test-required, test-optional and test-blind policies for every target; choose whether to test.'],
['activity','Activities inventory','Document meaningful activities, responsibilities, time commitment and impact without exaggeration.'],
['awards','Honors and achievements','Record awards and achievements honestly; major international awards are not universal requirements.'],
['writing','Personal statement and stories','Gather experiences and develop essays that show reflection and authentic voice.'],
['recommendations','Recommenders','Identify teachers and counselors and learn the process for requesting letters of recommendation.'],
['records','Academic documents','Prepare school records, translations where required, grading context and school reports.'],
['shortlist','Balanced university shortlist','Research eligibility, selectivity, funding availability and affordability if admitted.'],
['aid','Financial aid requirements','List financial aid forms and required evidence for each institution; avoid uploading sensitive documents here.'],
['deadlines','Application timeline','Track application rounds, recommendation deadlines, aid deadlines and separate scholarship timelines.'],
['supplements','College-specific writing','Review supplements and program requirements separately for each application.'],
['submission','Submission verification','Confirm successful receipt of applications and financial aid materials directly with institutions.'],
['decisions','Decision and award review','Compare final award letters, funding gaps, visa feasibility and enrollment conditions.']
];
const taskKeys=['application','essays','recommendations','transcripts','scores','financial_aid','submission'];
const taskLabels=['Application form','Essays / supplements','Recommendations','Transcripts & school documents','Test-score policy / reporting','Financial aid documents','Submission confirmation'];
let user=null,profile=null,academicStage='11',readiness=new Map(),applications=[],opportunities=[],busy=false;
function note(t){$('sync-status').textContent=t}
function fail(error){note('Could not save: '+(error?.message||String(error)));console.error('Bdesh:',error)}
function setTab(tab){if(!sections.includes(tab))tab='prepare';for(const s of sections){const el=$(s);el.hidden=s!==tab}document.querySelectorAll('[data-tab]').forEach(a=>a.classList.toggle('active',a.dataset.tab===tab));location.hash=tab}
document.querySelectorAll('[data-tab]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();setTab(a.dataset.tab)}));
window.addEventListener('hashchange',()=>setTab(location.hash.slice(1)));
function num(value){return value==null?'':String(value)}
function formPayload(){
 const f=new FormData($('profile-form'));const lines=k=>String(f.get(k)||'').split('\n').map(x=>x.trim()).filter(Boolean).slice(0,35);
 const number=k=>{const v=String(f.get(k)||'').trim();return v===''?null:Number(v)};
 return {user_id:user.id,display_name:String(f.get('display_name')||'').trim()||null,school_name:String(f.get('school_name')||'').trim()||null,graduation_year:number('graduation_year'),ssc_gpa:number('ssc_gpa'),hsc_gpa:number('hsc_gpa'),sat_total:number('sat_total'),english_test:String(f.get('english_test')||'none'),english_score:String(f.get('english_score')||'').trim()||null,intended_majors:String(f.get('intended_majors')||'').trim()||null,countries:String(f.get('countries')||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,15),funding_need:String(f.get('funding_need')||'full_ride'),activities:lines('activities'),awards:lines('awards'),updated_at:new Date().toISOString()};
}
function fillProfile(){
 const p=profile||{},form=$('profile-form');
 for(const [k,v] of Object.entries(p)){const el=form.elements.namedItem(k);if(!el||['activities','awards','countries'].includes(k))continue;el.value=num(v)}
 form.elements.namedItem('activities').value=(p.activities||[]).join('\n');
 form.elements.namedItem('awards').value=(p.awards||[]).join('\n');
 form.elements.namedItem('countries').value=(p.countries||[]).join(', ');
}
function stats(){
 const done=[...readiness.values()].filter(x=>x.state==='done').length;
 $('stat-ready').textContent=done+' / '+milestones.length;
 const fields=profile?['school_name','graduation_year','ssc_gpa','intended_majors','activities','funding_need','countries']:[], filled=fields.filter(k=>{const v=profile[k];return Array.isArray(v)?v.length:Boolean(v)}).length;
 $('stat-profile').textContent=Math.round(filled/7*100)+'%';
 $('stat-shortlist').textContent=String(applications.length);
 const dates=applications.flatMap(a=>[a.application_deadline,a.aid_deadline]).filter(d=>d&&d>=new Date().toISOString().slice(0,10)).sort();
 $('stat-deadline').textContent=dates.length?new Date(dates[0]+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'—';
 $('greeting').textContent=profile?.display_name?'Welcome back, '+profile.display_name+'.':'Your journey, in one place.';
}
function renderReadiness(){
 const holder=$('milestone-list');holder.replaceChildren();
 const early=['foundation','route','funding','major','english','activity'];
 const middle=['foundation','route','funding','major','english','testing','activity','awards','records'];
 const final=['funding','records','shortlist','aid','deadlines','writing','recommendations','supplements','submission'];
 const priority=(academicStage==='9'||academicStage==='10')?early:(academicStage==='11')?middle:final;
 const sorted=[...milestones].sort((a,b)=>(priority.includes(b[0])?1:0)-(priority.includes(a[0])?1:0));
 for(const [id,title,description] of sorted){
 const rec=readiness.get(id)||{state:'todo'};
 const article=document.createElement('article');article.className='milestone';
 const content=document.createElement('div');const h=document.createElement('h3');h.textContent=title;if(priority.includes(id)){const marker=document.createElement('span');marker.className='priority-label';marker.textContent='FOCUS NOW';h.append(marker)}const p=document.createElement('p');p.textContent=description;content.append(h,p);
 const select=document.createElement('select');select.setAttribute('aria-label','Status for '+title);
 [['todo','Not started'],['in_progress','In progress'],['done','Completed'],['not_applicable','Not relevant']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o)});
 select.value=rec.state;select.addEventListener('change',async()=>{const state=select.value;select.disabled=true;const {error}=await sb.from('student_readiness').upsert({user_id:user.id,milestone_id:id,state,updated_at:new Date().toISOString()},{onConflict:'user_id,milestone_id'});select.disabled=false;if(error){fail(error);select.value=rec.state;return}readiness.set(id,{state});stats();note('Preparation saved')});
 article.append(content,select);holder.append(article);
 }stats();
}
function researchFit(o){
 const reasons=[],warnings=[];
 const countryPrefs=(profile?.countries||[]).map(x=>x.toLowerCase());
 if(countryPrefs.length){if(countryPrefs.some(c=>o.country.toLowerCase().includes(c)||c.includes(o.country.toLowerCase())))reasons.push('Matches a country you selected');else warnings.push('Outside your selected countries')}
 if(profile?.funding_need==='full_ride')warnings.push('Verify total funding covers housing, meals, travel, insurance and any family contribution');
 if(!profile?.intended_majors)warnings.push('Add intended academic interests to refine your research');
 if(profile?.sat_total)reasons.push('SAT recorded; confirm whether this college accepts or requires a score');
 else reasons.push('Check test-optional and test-required policies');
 return {reasons,warnings};
}
function renderResearch(){
 const filter=$('country-filter'),current=filter.value;filter.replaceChildren();
 const all=document.createElement('option');all.value='';all.textContent='All countries';filter.append(all);
 [...new Set(opportunities.map(x=>x.country))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;filter.append(o)});
 filter.value=current;
 const selected=filter.value,visible=opportunities.filter(o=>!selected||o.country===selected);
 const insight=$('matching-insight');insight.textContent=(profile?.countries?.length?'Based on your stated country preferences: '+profile.countries.join(', ')+'. ':'Add country preferences in your profile for more useful research prompts. ')+'These are not personalized admission-chance ratings. The directory is a small editorial starting list.';
 const wrap=$('research-list');wrap.replaceChildren();
 for(const o of visible){const fit=researchFit(o);const card=document.createElement('article');card.className='research-card';
 const country=document.createElement('div');country.className='eyebrow';country.textContent=o.country;
 const title=document.createElement('h3');title.textContent=o.title;const para=document.createElement('p');para.textContent=o.funding_notes||'Read funding information at the source.';
 const ul=document.createElement('ul');[...fit.reasons,...fit.warnings].forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.append(li)});
 const actions=document.createElement('div');actions.className='cardactions';const a=document.createElement('a');a.href=o.official_url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Official website ↗';
 const btn=document.createElement('button');btn.type='button';btn.textContent='Add to application tracker';btn.addEventListener('click',()=>addApplication(o.title,o.id));
 actions.append(a,btn);card.append(country,title,para,ul,actions);wrap.append(card)}
 if(!visible.length)wrap.textContent='No opportunities in that country yet. Our directory is being expanded.';
}
async function addApplication(name,opportunityId=null,round='undecided',deadline=null,aidDeadline=null){
 if(applications.some(x=>x.institution_name.toLowerCase()===name.toLowerCase())){note('This institution is already on your application board');setTab('apply');return}
 note('Adding application…');
 const payload={user_id:user.id,institution_name:name,opportunity_id:opportunityId,application_round:round,application_deadline:deadline,aid_deadline:aidDeadline};
 const {data,error}=await sb.from('student_applications').insert(payload).select().single();
 if(error){fail(error);return}applications.unshift(data);renderApplications();stats();note('Application added');setTab('apply');
}
function appDate(v){return v?new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Not entered'}
async function patchApplication(id,updates){const {data,error}=await sb.from('student_applications').update({...updates,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id).select().single();if(error){fail(error);return false}applications=applications.map(a=>a.id===id?data:a);stats();note('Application saved');return true}
function renderApplications(){
 const holder=$('application-list');holder.replaceChildren();
 if(!applications.length){const div=document.createElement('div');div.className='empty';div.textContent='No applications yet. Discover a university or add one above.';holder.append(div);return}
 applications.slice().sort((a,b)=>(a.application_deadline||'9999').localeCompare(b.application_deadline||'9999')).forEach(a=>{
 const article=document.createElement('article');article.className='application-card';const header=document.createElement('div');header.className='application-header';
 const head=document.createElement('div');const title=document.createElement('h3');title.textContent=a.institution_name;const dates=document.createElement('p');dates.textContent='Admission: '+appDate(a.application_deadline)+' · Aid: '+appDate(a.aid_deadline)+' · '+a.application_round;head.append(title,dates);
 const status=document.createElement('select');status.setAttribute('aria-label','Application status for '+a.institution_name);
 for(const [value,label] of [['researching','Researching'],['shortlisted','Shortlisted'],['preparing','Preparing'],['submitted','Submitted'],['decision_received','Decision received']]){const o=document.createElement('option');o.value=value;o.textContent=label;status.append(o)}status.value=a.status;status.addEventListener('change',async()=>{status.disabled=true;await patchApplication(a.id,{status:status.value});status.disabled=false});
 header.append(head,status);article.append(header);
 const grid=document.createElement('div');grid.className='mini-checklist';for(let i=0;i<taskKeys.length;i++){const key=taskKeys[i];const label=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.checked=Boolean(a.checklist?.[key]);cb.addEventListener('change',async()=>{cb.disabled=true;const next={...(a.checklist||{}),[key]:cb.checked};const ok=await patchApplication(a.id,{checklist:next});if(!ok)cb.checked=!cb.checked;else a.checklist=next;cb.disabled=false});label.append(cb,document.createTextNode(taskLabels[i]));grid.append(label)}article.append(grid);
 const row=document.createElement('div');row.className='application-footer';const edit=document.createElement('button');edit.textContent='Edit deadlines';edit.addEventListener('click',()=>{const editor=article.querySelector('.date-editor');editor.hidden=!editor.hidden});const remove=document.createElement('button');remove.className='danger';remove.textContent='Remove';remove.addEventListener('click',async()=>{if(!confirm('Remove '+a.institution_name+' from your tracker?'))return;const {error}=await sb.from('student_applications').delete().eq('id',a.id).eq('user_id',user.id);if(error)return fail(error);applications=applications.filter(x=>x.id!==a.id);renderApplications();stats();note('Application removed')});row.append(edit,remove);article.append(row);
 const editor=document.createElement('form');editor.className='date-editor';editor.hidden=true;editor.innerHTML='<label>Admission deadline <input name="application_deadline" type="date"></label><label>Aid deadline <input name="aid_deadline" type="date"></label><button class="button" type="submit">Save deadlines</button>';editor.elements.application_deadline.value=a.application_deadline||'';editor.elements.aid_deadline.value=a.aid_deadline||'';editor.addEventListener('submit',async e=>{e.preventDefault();const ok=await patchApplication(a.id,{application_deadline:editor.elements.application_deadline.value||null,aid_deadline:editor.elements.aid_deadline.value||null});if(ok)renderApplications()});article.append(editor);holder.append(article)
 });
}
$('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(!user)return;const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;let payload;try{payload=formPayload()}catch(err){fail(err);button.disabled=false;return}
 const {data,error}=await sb.from('student_admissions_profiles').upsert(payload,{onConflict:'user_id'}).select().single();button.disabled=false;if(error){fail(error);$('profile-message').textContent=error.message;return}profile=data;stats();renderResearch();note('Profile saved');$('profile-message').textContent='Saved to your private account.'});
$('application-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f);const name=String(fd.get('institution_name')||'').trim();if(!name)return;await addApplication(name,null,String(fd.get('application_round')||'undecided'),String(fd.get('application_deadline')||'')||null,String(fd.get('aid_deadline')||'')||null);f.reset()});
$('country-filter').addEventListener('change',renderResearch);
$('signout').addEventListener('click',async()=>{await sb.auth.signOut();location.href='/'});
async function initialize(session){
 user=session.user;$('not-signed-in').hidden=true;$('workspace').hidden=false;$('signout').hidden=false;$('session-status').textContent=user.email||'Signed in';
 note('Loading your workspace…');
 const responses=await Promise.all([
 sb.from('student_admissions_profiles').select('*').eq('user_id',user.id).maybeSingle(),
 sb.from('student_profiles').select('academic_stage').eq('user_id',user.id).maybeSingle(),
 sb.from('student_readiness').select('milestone_id,state,notes').eq('user_id',user.id),
 sb.from('student_applications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
 sb.from('opportunities').select('id,title,country,official_url,funding_notes,eligibility_notes,deadline_notes').eq('published',true).eq('country','United States').order('title')]);
 const errors=responses.filter(x=>x.error).map(x=>x.error.message);
 if(errors.length)note('Some data could not load: '+errors.join(' / '));else note('All changes save to your Bdesh account');
 profile=responses[0].data||null;academicStage=responses[1].data?.academic_stage||'11';readiness=new Map((responses[2].data||[]).map(x=>[x.milestone_id,x]));applications=responses[3].data||[];opportunities=responses[4].data||[];
 fillProfile();renderReadiness();renderResearch();renderApplications();stats();setTab(location.hash.slice(1)||'prepare');
}
if(!sb){$('session-status').textContent='Account library unavailable';$('not-signed-in').hidden=false;showAuthError('Authentication library unavailable. Please reload.');return}
sb.auth.getSession().then(({data,error})=>{if(error||!data?.session){$('session-status').textContent='Not signed in';$('not-signed-in').hidden=false;if(error)showAuthError(error.message);else if(location.hash.includes('error'))showAuthError('The sign-in redirect was rejected. Check Supabase redirect URL settings.');return}initialize(data.session).catch(fail)}).catch(fail);
})();