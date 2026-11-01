/* Bdesh admissions workspace — student-owned data and zero-cost rule-based guidance. */
(() => {
'use strict';
const URL='https://xeqixwmulwonvhifcmvn.supabase.co',KEY='sb_publishable_2Jp14PFt4_mLDT4cpqLfUw_d-tDSnwj';
const sb=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
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
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
function fail(error){note('Save failed — your last change may not have been stored. '+(error?.message||String(error)));console.error('Bdesh:',error)}
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
function renderDeadlineCenter(){
 const list=$('deadline-list');if(!list)return;list.replaceChildren();
 const today=new Date();today.setHours(0,0,0,0);
 const daysUntil=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;const d=new Date(value+'T00:00:00');return Number.isNaN(d.getTime())?null:Math.round((d-today)/86400000)};
 const entries=[];
 for(const app of applications){
  const submitted=['submitted','decision_received'].includes(app.status);
  if(!submitted&&app.application_deadline)entries.push({name:'Application deadline',college:app.institution_name,date:app.application_deadline,appId:app.id});
  if(app.aid_deadline&&!app.checklist?.financial_aid)entries.push({name:'Financial aid deadline',college:app.institution_name,date:app.aid_deadline,appId:app.id});
  const requirements=Array.isArray(app.checklist?.additional_requirements)?app.checklist.additional_requirements:[];
  for(const r of requirements){if(r.deadline&&!['submitted','received','accepted','waived'].includes(r.status))entries.push({name:r.name||'Additional requirement',college:app.institution_name,date:r.deadline,appId:app.id})}
 }
 const valid=entries.map(e=>({...e,days:daysUntil(e.date)})).filter(e=>e.days!==null);
 $('deadline-overdue').textContent=String(valid.filter(e=>e.days<0).length);
 $('deadline-week').textContent=String(valid.filter(e=>e.days>=0&&e.days<=7).length);
 $('deadline-month').textContent=String(valid.filter(e=>e.days>=0&&e.days<=30).length);
 const filter=$('deadline-filter').value;
 const visible=valid.filter(e=>filter==='overdue'?e.days<0:filter==='week'?e.days>=0&&e.days<=7:filter==='month'?e.days>=0&&e.days<=30:true).sort((a,b)=>a.days-b.days).slice(0,60);
 if(!visible.length){const empty=document.createElement('p');empty.className='deadline-empty';empty.textContent='No deadlines match this view. Add or update dates in your applications.';list.append(empty);return}
 for(const e of visible){const row=document.createElement('article');row.className='deadline-entry';const content=document.createElement('div');const label=document.createElement('strong');label.textContent=e.college+' — '+e.name;const sub=document.createElement('span');sub.textContent=appDate(e.date);content.append(label,sub);const due=document.createElement('span');due.className='deadline-due'+(e.days<0?' is-overdue':'');due.textContent=e.days<0?Math.abs(e.days)+' days overdue':e.days===0?'Due today':e.days===1?'Due tomorrow':e.days+' days left';const open=document.createElement('button');open.type='button';open.textContent='Open college ↗';open.addEventListener('click',()=>{expandedApplications.add(e.appId);setTab('apply');renderApplications();document.querySelectorAll('.application-card').forEach(card=>{if(card.dataset.applicationId===String(e.appId))card.scrollIntoView({behavior:'smooth',block:'start'})})});row.append(content,due,open);list.append(row)}
}
$('deadline-filter').addEventListener('change',renderDeadlineCenter);
function renderNextActions(){
 const target=$('next-actions');if(!target)return;
 target.replaceChildren();
 const items=[],today=new Date();today.setHours(0,0,0,0);
 const ms=86400000;
 if(!profile?.school_name||!profile?.intended_majors)items.push({priority:3,title:'Build your student profile',detail:'Add your school and academic interests so your planning stays organized.',link:'/profile.html',cta:'Open profile'});
 const unfinished=milestones.filter(([id])=>!['done','not_applicable'].includes(readiness.get(id)?.state));
 if(unfinished.length){const [id,title]=unfinished[0];items.push({priority:4,title:'Continue preparation: '+title,detail:'One unfinished milestone from your preparation tracker.',link:'#prepare',cta:'View milestone'});}
 for(const app of applications){
  for(const [field,label] of [['application_deadline','Admission'],['aid_deadline','Financial aid']]){
   if(!app[field])continue;
   const date=new Date(app[field]+'T00:00:00');
   if(Number.isNaN(date.valueOf()))continue;
   const days=Math.round((date-today)/ms);
   if(days>=0&&days<=30&&app.status!=='decision_received'){
    items.push({priority:days,title:label+' deadline: '+app.institution_name,detail:days===0?'Date entered as today':days===1?'Date entered as tomorrow':'In '+days+' days',link:'#apply',cta:'Review application'});
   }
  }
  const requirements=Array.isArray(app.checklist?.additional_requirements)?app.checklist.additional_requirements:[];
  for(const req of requirements){
   if(['submitted','received','accepted','waived'].includes(req.status)||!req.deadline)continue;
   const due=new Date(req.deadline+'T00:00:00');if(Number.isNaN(due.valueOf()))continue;
   const days=Math.round((due-today)/ms);
   if(days>=0&&days<=30)items.push({priority:days,title:(req.name||'Additional document')+': '+app.institution_name,detail:days===0?'Document due today':days===1?'Document due tomorrow':'Additional document due in '+days+' days',link:'#apply',cta:'Update requirement'});
  }
  if(!app.application_deadline||!app.aid_deadline)items.push({priority:35,title:'Verify deadlines: '+app.institution_name,detail:'At least one admission or aid deadline is missing. Confirm directly with the university.',link:'#apply',cta:'Edit deadlines'});
 }
 if(!applications.length)items.push({priority:5,title:'Start your application board',detail:'Add a researched institution and record admission and financial aid deadlines separately.',link:'#discover',cta:'Discover universities'});
 items.sort((a,b)=>a.priority-b.priority);
 const selected=items.slice(0,5);
 if(!selected.length){const p=document.createElement('p');p.textContent='You are up to date with the information saved here. Check university portals for new requests.';target.append(p);return}
 selected.forEach((item,i)=>{
  const row=document.createElement('article');row.className='next-action';
  const num=document.createElement('span');num.className='next-action-number';num.textContent=String(i+1).padStart(2,'0');
  const body=document.createElement('div');const h=document.createElement('h3');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.detail;body.append(h,p);
  const a=document.createElement('a');a.href=item.link;a.textContent=item.cta+' ↗';
  if(item.link.startsWith('#')){a.dataset.tab=item.link.slice(1);a.addEventListener('click',event=>{event.preventDefault();setTab(a.dataset.tab);document.getElementById(a.dataset.tab)?.scrollIntoView({behavior:'smooth',block:'start'})})}
  row.append(num,body,a);target.append(row);
 });
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
 select.value=rec.state;select.addEventListener('change',async()=>{const state=select.value;select.disabled=true;const {error}=await sb.from('student_readiness').upsert({user_id:user.id,milestone_id:id,state,updated_at:new Date().toISOString()},{onConflict:'user_id,milestone_id'});select.disabled=false;if(error){fail(error);select.value=rec.state;return}readiness.set(id,{state});stats();renderNextActions();note('Preparation saved')});
 article.append(content,select);holder.append(article);
 }stats();renderNextActions();
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
 const selected=filter.value;
 const selectivity=$('selectivity-filter')?.value||'',funding=$('funding-filter')?.value||'',searchTerm=$('research-search')?.value.trim().toLowerCase()||'';
 const band=o=>o.eligibility_notes?.match(/Selectivity context: (Exceptionally selective|Highly selective|Selective)/)?.[1]||'Unclassified';
 const route=o=>/scholar|merit|woodruff|karsh|johnson|belk|ingram/i.test(o.funding_notes||'')?'merit':'need';
 const order={'Selective':0,'Highly selective':1,'Exceptionally selective':2,'Unclassified':3};
 const visible=opportunities.filter(o=>(!selected||o.country===selected)&&(!selectivity||band(o)===selectivity)&&(!funding||route(o)===funding)&&(!searchTerm||o.title.toLowerCase().includes(searchTerm))).sort((a,b)=>(order[band(a)]-order[band(b)])||a.title.localeCompare(b.title));
 $('research-count').textContent=visible.length+' funding leads shown · '+opportunities.length+' listed · lower selectivity band first (not an admission probability)';
 const insight=$('matching-insight');insight.textContent=(profile?.countries?.length?'Based on your stated country preferences: '+profile.countries.join(', ')+'. ':'Add country preferences in your profile for more useful research prompts. ')+'These are not personalized admission-chance ratings. The directory is a small editorial starting list.';
 const wrap=$('research-list');wrap.replaceChildren();
 for(const o of visible){const fit=researchFit(o);const card=document.createElement('article');card.className='research-card';
 const country=document.createElement('div');country.className='eyebrow';country.textContent=o.country+' · '+band(o)+' · '+(route(o)==='merit'?'Scholarship / merit route':'Need-based funding route');
 const title=document.createElement('h3');title.textContent=o.title;const para=document.createElement('p');para.textContent=o.funding_notes||'Read funding information at the source.';const verified=document.createElement('p');verified.className='research-verification';verified.textContent=o.verified_at?'Source reviewed: '+appDate(o.verified_at.slice(0,10))+' · Recheck for the current cycle':'Research lead · Funding policy not yet individually verified';
 const ul=document.createElement('ul');[...fit.reasons,...fit.warnings].forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.append(li)});
 const actions=document.createElement('div');actions.className='cardactions';const a=document.createElement('a');a.href=o.official_url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Official website ↗';
 const btn=document.createElement('button');btn.type='button';btn.textContent='Add to application tracker';btn.addEventListener('click',()=>addApplication(o.title,o.id));
 actions.append(a,btn);card.append(country,title,para,verified,ul,actions);wrap.append(card)}
 if(!visible.length)wrap.textContent='No opportunities in that country yet. Our directory is being expanded.';
}
async function addApplication(name,opportunityId=null,round='undecided',deadline=null,aidDeadline=null){
 if(applications.some(x=>(opportunityId&&x.opportunity_id===opportunityId)||x.institution_name.trim().toLowerCase()===name.trim().toLowerCase())){note('This institution is already on your application board');setTab('apply');return false}
 note('Adding application…');
 const payload={user_id:user.id,institution_name:name,opportunity_id:opportunityId,application_round:round,application_deadline:deadline,aid_deadline:aidDeadline};
 const {data,error}=await sb.from('student_applications').insert(payload).select().single();
 if(error){fail(error);return false}applications.unshift(data);renderApplications();stats();renderNextActions();renderDeadlineCenter();note('Application added');setTab('apply');return true;
}
function appDate(v){return v?new Date(v+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Not entered'}
async function patchApplication(id,updates){const {data,error}=await sb.from('student_applications').update({...updates,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id).select().single();if(error){fail(error);return false}applications=applications.map(a=>a.id===id?data:a);stats();renderNextActions();renderDeadlineCenter();note('Application saved');return true}
// Post-submission requirements are stored inside each application checklist JSON,
// preserving per-user RLS and avoiding new public tables.
const requirementSuggestions=['CSS Profile','ISFAA','University-specific financial aid form','Financial documents','Video portfolio','Supplemental essay','Interview','Official test scores','Final transcript','Other'];
function renderFollowupTracker(application,article){
 const wrap=document.createElement('section');wrap.className='followup-tracker';
 const heading=document.createElement('div');heading.className='followup-heading';
 const title=document.createElement('h4');title.textContent='Additional documents & portal requests';
 const existing=Array.isArray(application.checklist?.additional_requirements)?application.checklist.additional_requirements:[];
 const done=existing.filter(x=>['submitted','received','accepted','waived'].includes(x.status)).length;
 const count=document.createElement('span');count.textContent=done+' / '+existing.length+' sent, received or resolved';
 heading.append(title,count);wrap.append(heading);
 const info=document.createElement('p');info.className='followup-info';info.textContent='Add only requirements confirmed by this college. These statuses are your records, not confirmation from its admissions office.';wrap.append(info);
 const items=document.createElement('div');items.className='followup-items';wrap.append(items);
 async function save(next){
  const checklist={...(application.checklist||{}),additional_requirements:next};
  const ok=await patchApplication(application.id,{checklist});
  if(ok){application.checklist=checklist;renderApplications()}
  return ok;
 }
 existing.forEach((req,i)=>{
  const item=document.createElement('div');item.className='followup-item';
  const body=document.createElement('div');const h=document.createElement('strong');h.textContent=req.name||'Requirement';
  const meta=document.createElement('p');meta.textContent=(req.deadline?'Due '+appDate(req.deadline):'No deadline entered')+(req.submitted_at?' · Sent '+appDate(req.submitted_at):'')+(req.note?' · '+req.note:'');body.append(h,meta);if(req.portal_url){try{const url=new URL(req.portal_url);if(['https:','http:'].includes(url.protocol)){const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open college portal ↗';a.className='followup-portal';body.append(a)}}catch{}}
  const controls=document.createElement('div');controls.className='followup-controls';
  const status=document.createElement('select');status.setAttribute('aria-label','Status of '+req.name);
  [['not_started','Not started'],['in_progress','In progress'],['submitted','Submitted'],['received','Confirmed received'],['accepted','Accepted / complete'],['needs_correction','Needs correction'],['waived','Waived / not required']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;status.append(o)});
  status.value=req.status||'not_started';
  status.addEventListener('change',async()=>{status.disabled=true;const next=existing.map((x,j)=>j===i?{...x,status:status.value,submitted_at:status.value==='submitted'&&!x.submitted_at?new Date().toISOString().slice(0,10):x.submitted_at}:x);if(!await save(next))status.disabled=false});
  const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.addEventListener('click',()=>{form.hidden=false;name.value=req.name;deadline.value=req.deadline||'';note.value=req.note||'';portal.value=req.portal_url||'';form.dataset.editIndex=String(i);name.focus()});
  const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='Remove';remove.addEventListener('click',async()=>{if(!confirm('Remove this requirement from your tracker?'))return;await save(existing.filter((_,j)=>j!==i))});
  controls.append(status,edit,remove);item.append(body,controls);items.append(item);
 });
 if(!existing.length){const p=document.createElement('p');p.className='followup-empty';p.textContent='No additional requests recorded yet. Add a CSS Profile, ISFAA, supplemental essay, video portfolio, or another college-specific item.';items.append(p)}
 const form=document.createElement('form');form.className='followup-form';form.hidden=true;
 const nameLabel=document.createElement('label');nameLabel.textContent='Requirement';const name=document.createElement('input');name.required=true;name.maxLength=120;name.setAttribute('list','requirement-suggestions');name.placeholder='e.g. ISFAA or video portfolio';const suggestions=document.createElement('datalist');suggestions.id='requirement-suggestions-'+application.id;name.setAttribute('list',suggestions.id);requirementSuggestions.forEach(x=>{const o=document.createElement('option');o.value=x;suggestions.append(o)});nameLabel.append(name,suggestions);
 const deadlineLabel=document.createElement('label');deadlineLabel.textContent='Submission deadline';const deadline=document.createElement('input');deadline.type='date';deadlineLabel.append(deadline);
 const portalLabel=document.createElement('label');portalLabel.textContent='College portal URL (optional)';const portal=document.createElement('input');portal.type='url';portal.placeholder='https://admissions.example.edu/portal';portal.maxLength=500;portalLabel.append(portal);
 const noteLabel=document.createElement('label');noteLabel.textContent='Portal / submission notes (optional)';const note=document.createElement('input');note.maxLength=350;note.placeholder='Where to submit, required format, or confirmation';noteLabel.append(note);
 const submit=document.createElement('button');submit.className='button';submit.type='submit';submit.textContent='Save requirement';
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';cancel.addEventListener('click',()=>{form.hidden=true;form.reset();delete form.dataset.editIndex});
 form.append(nameLabel,deadlineLabel,portalLabel,noteLabel,submit,cancel);
 form.addEventListener('submit',async e=>{e.preventDefault();const value=name.value.trim();if(!value)return;submit.disabled=true;
  const index=form.dataset.editIndex===undefined?-1:Number(form.dataset.editIndex);
  const item={name:value,deadline:deadline.value||null,note:note.value.trim(),portal_url:portal.value.trim(),status:index>=0?(existing[index]?.status||'not_started'):'not_started',submitted_at:index>=0?(existing[index]?.submitted_at||null):null};
  const next=index>=0?existing.map((x,j)=>j===index?item:x):[...existing,item];
  if(!await save(next))submit.disabled=false;
 });
 const add=document.createElement('button');add.type='button';add.className='followup-add';add.textContent='+ Add document or requirement';add.addEventListener('click',()=>{form.hidden=false;form.reset();delete form.dataset.editIndex;name.focus()});
 wrap.append(add,form);
 article.append(wrap);
}
const expandedApplications=new Set();
function applicationNeedsAttention(a){
 const now=new Date();now.setHours(0,0,0,0);
 const overdue=d=>d&&new Date(d+'T00:00:00')<now;
 const tasks=Array.isArray(a.checklist?.additional_requirements)?a.checklist.additional_requirements:[];
 return tasks.some(r=>r.status==='needs_correction'||(r.deadline&&!['submitted','received','accepted','waived'].includes(r.status)&&overdue(r.deadline)))||(!['submitted','decision_received'].includes(a.status)&&overdue(a.application_deadline))||(!a.checklist?.financial_aid&&overdue(a.aid_deadline));
}
function renderApplications(){
 const holder=$('application-list');holder.replaceChildren();
 if(!applications.length){const div=document.createElement('div');div.className='empty';div.textContent='No applications yet. Discover a university or add one above.';holder.append(div);return}
 const boardSearch=$('application-board-search')?.value.trim().toLowerCase()||'';
 const boardFilter=$('application-board-filter')?.value||'all';
 const shown=applications.filter(a=>(!boardSearch||a.institution_name.toLowerCase().includes(boardSearch))&&(boardFilter==='all'||(boardFilter==='attention'?applicationNeedsAttention(a):a.status===boardFilter)));
 $('application-board-count').textContent=shown.length+' of '+applications.length+' universities';
 if(!shown.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No applications match your filters.';holder.append(empty)}
 shown.slice().sort((a,b)=>(a.application_deadline||'9999').localeCompare(b.application_deadline||'9999')).forEach(a=>{
 const article=document.createElement('article');article.className='application-card';article.dataset.applicationId=String(a.id);const header=document.createElement('div');header.className='application-header';
 const head=document.createElement('div');const title=document.createElement('h3');title.textContent=a.institution_name;const dates=document.createElement('p');dates.textContent='Admission: '+appDate(a.application_deadline)+' · Aid: '+appDate(a.aid_deadline)+' · '+a.application_round;head.append(title,dates);const tasks=Array.isArray(a.checklist?.additional_requirements)?a.checklist.additional_requirements:[];const finished=taskKeys.filter(k=>Boolean(a.checklist?.[k])).length;const pending=tasks.filter(r=>!['submitted','received','accepted','waived'].includes(r.status)).length;const summary=document.createElement('p');summary.className='application-compact-summary';summary.textContent=finished+' / '+taskKeys.length+' checklist tasks · '+pending+' additional requirements pending'+(applicationNeedsAttention(a)?' · Needs attention':'');head.append(summary);
 const status=document.createElement('select');status.setAttribute('aria-label','Application status for '+a.institution_name);
 for(const [value,label] of [['researching','Researching'],['shortlisted','Shortlisted'],['preparing','Preparing'],['submitted','Submitted'],['decision_received','Decision received']]){const o=document.createElement('option');o.value=value;o.textContent=label;status.append(o)}status.value=a.status;status.addEventListener('change',async()=>{const previous=a.status;status.disabled=true;const saved=await patchApplication(a.id,{status:status.value});if(!saved)status.value=previous;status.disabled=false});
 const toggle=document.createElement('button');toggle.type='button';toggle.className='application-toggle';toggle.setAttribute('aria-expanded',String(expandedApplications.has(a.id)));toggle.textContent=expandedApplications.has(a.id)?'Hide details −':'Show details +';toggle.addEventListener('click',()=>{if(expandedApplications.has(a.id))expandedApplications.delete(a.id);else expandedApplications.add(a.id);toggle.setAttribute('aria-expanded',String(expandedApplications.has(a.id)));toggle.textContent=expandedApplications.has(a.id)?'Hide details −':'Show details +';details.hidden=!expandedApplications.has(a.id)});header.append(head,status,toggle);article.append(header);const details=document.createElement('div');details.className='application-details';details.hidden=!expandedApplications.has(a.id);article.append(details);
 const grid=document.createElement('div');grid.className='mini-checklist';for(let i=0;i<taskKeys.length;i++){const key=taskKeys[i];const label=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.checked=Boolean(a.checklist?.[key]);cb.addEventListener('change',async()=>{cb.disabled=true;const next={...(a.checklist||{}),[key]:cb.checked};const ok=await patchApplication(a.id,{checklist:next});if(!ok)cb.checked=!cb.checked;else a.checklist=next;cb.disabled=false});label.append(cb,document.createTextNode(taskLabels[i]));grid.append(label)}details.append(grid);
 const row=document.createElement('div');row.className='application-footer';const edit=document.createElement('button');edit.textContent='Edit deadlines';edit.addEventListener('click',()=>{const editor=article.querySelector('.date-editor');editor.hidden=!editor.hidden});const remove=document.createElement('button');remove.className='danger';remove.textContent='Remove';remove.addEventListener('click',async()=>{if(!confirm('Remove '+a.institution_name+' from your tracker?'))return;const {error}=await sb.from('student_applications').delete().eq('id',a.id).eq('user_id',user.id);if(error)return fail(error);applications=applications.filter(x=>x.id!==a.id);renderApplications();stats();renderNextActions();renderDeadlineCenter();note('Application removed')});row.append(edit,remove);details.append(row);
 const editor=document.createElement('form');editor.className='date-editor';editor.hidden=true;editor.innerHTML='<label>Admission deadline <input name="application_deadline" type="date"></label><label>Aid deadline <input name="aid_deadline" type="date"></label><button class="button" type="submit">Save deadlines</button>';editor.elements.application_deadline.value=a.application_deadline||'';editor.elements.aid_deadline.value=a.aid_deadline||'';editor.addEventListener('submit',async e=>{e.preventDefault();const ok=await patchApplication(a.id,{application_deadline:editor.elements.application_deadline.value||null,aid_deadline:editor.elements.aid_deadline.value||null});if(ok)renderApplications()});details.append(editor);renderFollowupTracker(a,details);holder.append(article)
 });
}
$('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(!user)return;const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;let payload;try{payload=formPayload()}catch(err){fail(err);button.disabled=false;return}
 const {data,error}=await sb.from('student_admissions_profiles').upsert(payload,{onConflict:'user_id'}).select().single();button.disabled=false;if(error){fail(error);$('profile-message').textContent=error.message;return}profile=data;stats();renderNextActions();renderResearch();note('Profile saved');$('profile-message').textContent='Saved to your private account.'});
let selectedCollege=null;
const collegeSearch=$('college-search-input'),collegeResults=$('college-search-results'),applicationForm=$('application-form');
function renderCollegeSearch(){
 const query=collegeSearch.value.trim().toLocaleLowerCase();
 collegeResults.replaceChildren();
 applicationForm.hidden=true;selectedCollege=null;
 if(!query){const p=document.createElement('p');p.textContent='Start typing a university name to find it in our database.';collegeResults.append(p);return}
 const matches=opportunities.filter(x=>x.title.toLocaleLowerCase().includes(query)).sort((a,b)=>Number(!a.title.toLowerCase().startsWith(query))-Number(!b.title.toLowerCase().startsWith(query))||a.title.localeCompare(b.title)).slice(0,12);
 if(matches.length){
  const info=document.createElement('p');info.textContent=matches.length===12?'Showing the first 12 matches. Keep typing to narrow the results.':'Select a matching university:';collegeResults.append(info);
  for(const o of matches){
   const button=document.createElement('button');button.type='button';button.className='college-search-result';
   const title=document.createElement('strong');title.textContent=o.title;const country=document.createElement('span');country.textContent=o.country;
   button.append(title,country);
   button.addEventListener('click',()=>chooseCollege(o));collegeResults.append(button);
  }
 }else{
  const p=document.createElement('p');p.textContent='No university matching "'+collegeSearch.value.trim()+'" is in this directory.';collegeResults.append(p);
  const manual=document.createElement('button');manual.type='button';manual.className='college-manual';manual.textContent='Add "'+collegeSearch.value.trim()+'" manually';
  manual.addEventListener('click',()=>chooseCollege(null,collegeSearch.value.trim()));collegeResults.append(manual);
 }
}
function chooseCollege(college,manualName=''){
 selectedCollege=college;
 applicationForm.elements.institution_name.value=college?.title||manualName;
 applicationForm.elements.institution_name.readOnly=Boolean(college);
 applicationForm.hidden=false;
 collegeResults.replaceChildren();
 const status=document.createElement('p');status.className='college-chosen';status.textContent=college?'Selected from Bdesh: '+college.title:'Manual entry: not in database';collegeResults.append(status);
 applicationForm.elements.application_round.focus();
}
collegeSearch.addEventListener('input',renderCollegeSearch);
$('cancel-college-selection').addEventListener('click',()=>{applicationForm.reset();renderCollegeSearch();collegeSearch.focus()});
$('application-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f);const name=String(fd.get('institution_name')||'').trim();if(!name)return;const button=f.querySelector('button[type=submit]');button.disabled=true;const saved=await addApplication(name,selectedCollege?.id||null,String(fd.get('application_round')||'undecided'),String(fd.get('application_deadline')||'')||null,String(fd.get('aid_deadline')||'')||null);button.disabled=false;if(saved){f.reset();collegeSearch.value='';renderCollegeSearch()}});
$('research-search').addEventListener('input',renderResearch);$('country-filter').addEventListener('change',renderResearch);$('application-board-search').addEventListener('input',renderApplications);$('application-board-filter').addEventListener('change',renderApplications);$('selectivity-filter').addEventListener('change',renderResearch);$('funding-filter').addEventListener('change',renderResearch);
$('export-workspace').addEventListener('click',()=>{
 if(!user)return;
 const exportData={exported_at:new Date().toISOString(),source:'Bdesh',scope:'Admissions workspace records',student_profile:profile,preparation:[...readiness.entries()].map(([milestone_id,details])=>({milestone_id,...details})),applications};
 const blob=new Blob([JSON.stringify(exportData,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='bdesh-admissions-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 note('Your admissions workspace backup was downloaded. Keep it somewhere private.');
});
$('signout').addEventListener('click',async()=>{await sb.auth.signOut();location.href='/'});
async function initialize(session){
 user=session.user;$('not-signed-in').hidden=true;$('workspace').hidden=false;$('signout').hidden=false;$('session-status').textContent=user.email||'Signed in';
 note('Loading your workspace…');
 const responses=await Promise.all([
 sb.from('student_admissions_profiles').select('*').eq('user_id',user.id).maybeSingle(),
 sb.from('student_profiles').select('academic_stage').eq('user_id',user.id).maybeSingle(),
 sb.from('student_readiness').select('milestone_id,state,notes').eq('user_id',user.id),
 sb.from('student_applications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
 sb.from('opportunities').select('id,title,country,official_url,funding_notes,eligibility_notes,deadline_notes,verified_at').eq('published',true).eq('country','United States').order('title')]);
 const errors=responses.filter(x=>x.error).map(x=>x.error.message);
 if(errors.length)note('Some data could not load: '+errors.join(' / '));else note('All changes save to your Bdesh account');
 profile=responses[0].data||null;academicStage=responses[1].data?.academic_stage||'11';readiness=new Map((responses[2].data||[]).map(x=>[x.milestone_id,x]));applications=responses[3].data||[];opportunities=responses[4].data||[];
 fillProfile();renderReadiness();renderResearch();renderCollegeSearch();renderApplications();stats();renderNextActions();renderDeadlineCenter();setTab(location.hash.slice(1)||'prepare');
}
if(!sb){$('session-status').textContent='Account library unavailable';$('not-signed-in').hidden=false;showAuthError('Authentication library unavailable. Please reload.');return}
sb.auth.getSession().then(({data,error})=>{if(error||!data?.session){$('session-status').textContent='Not signed in';$('not-signed-in').hidden=false;if(error)showAuthError(error.message);else if(location.hash.includes('error'))showAuthError('The sign-in redirect was rejected. Check Supabase redirect URL settings.');return}initialize(data.session).catch(fail)}).catch(fail);
})();