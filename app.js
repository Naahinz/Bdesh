const plans={
'9':{title:'Explore the possibilities',desc:'For Classes 9–10: build habits, explore subjects, and find out how undergraduate study abroad works.',steps:[['Learn how undergraduate admissions work','Start by understanding what universities need and when applications happen.'],['Focus on your SSC foundation','Keep up with your current subjects and understand the NCTB pathway.'],['Build English habits','Read, write, and practice explaining your ideas.'],['Explore one real interest','Try a project or activity that matters to you.']]},
'11':{title:'Build your foundation',desc:'For Class 11: explore scholarships while keeping your HSC studies and interests growing.',steps:[['Plan your HSC goals','Work out a sustainable academic schedule.'],['Understand testing requirements','Learn about IELTS, DET, SAT, and universities that do not require them.'],['Understand full funding','Compare tuition, housing, meals, insurance, travel, and personal expenses.'],['Keep an activities record','Save real projects, volunteering, stories, and creative work.']]},
'12':{title:'Prepare for applications',desc:'For Class 12: identify an intake, build a shortlist, and prepare admission and aid materials.',steps:[['Choose the appropriate intake','Match your graduation schedule to each institution’s eligibility rules.'],['Research universities and funding','Confirm international eligibility and actual costs, not just advertised scholarships.'],['Prepare writing and references','Start essays early and ask recommenders with sufficient notice.'],['Track aid and admissions separately','Record different deadlines for forms, recommendations, and applications.']]},
'gap':{title:'Make your applications count',desc:'For HSC graduates and gap-year students: turn preparation into complete applications.',steps:[['Organize academic records','Collect SSC/HSC records and check whether translations are required.'],['Verify all funding conditions','Confirm international policies and any remaining family contribution.'],['Finalize essays and recommendations','Explain genuine interests, experiences, and your time after HSC.'],['Submit and confirm receipt','Track both application and financial-aid materials.']]},
};
const sources=[['Berea College','United States','Review undergraduate admissions, funding policies and eligibility at the source.','https://www.berea.edu/admissions'],['Sewanee: The University of the South','United States','Explore undergraduate admissions and international aid information.','https://new.sewanee.edu/admission-aid/'],['Soka University of America','United States','Explore international student admissions and financial aid.','https://www.soka.edu/admission'],['University of Chicago','United States','Read undergraduate admissions and financial-aid information.','https://collegeadmissions.uchicago.edu/'],['University of Hong Kong','Hong Kong','Read non-local undergraduate admission and entrance scholarship details.','https://admissions.hku.hk/'],['Türkiye Scholarships','Türkiye','Explore the government scholarship programme and check current undergraduate eligibility.','https://www.turkiyeburslari.gov.tr/']];
const $=id=>document.getElementById(id),stage=$('stage');
/* Keep anonymous progress and each authenticated student's browser cache separate.
   The database remains the authoritative source for signed-in accounts. */
const scopedKey=name=>window.bdeshCurrentUserId
  ? 'bdesh-user-'+window.bdeshCurrentUserId+'-'+name
  : 'bdesh-'+name;
const getLocal=name=>localStorage.getItem(scopedKey(name));
const setLocal=(name,value)=>localStorage.setItem(scopedKey(name),value);
const removeLocal=name=>localStorage.removeItem(scopedKey(name));
const restoreLocal=()=>{
 stage.value=getLocal('stage')||'11';
 for(const id of ['group','intake']){
  const saved=getLocal(id),field=$(id);
  field.value=saved&&[...field.options].some(o=>o.value===saved)?saved:field.options[0].value;
 }
 redraw();
};
stage.value=getLocal('stage')||'11';['group','intake'].forEach(id=>{const item=getLocal(id);if(item&&[...$(id).options].some(o=>o.value===item))$(id).value=item;$(id).addEventListener('change',e=>(setLocal(id,e.target.value),document.dispatchEvent(new CustomEvent('bdesh:profile-change'))))});
function redraw(){const p=plans[stage.value],list=$('task-list');$('task-title').textContent=p.title;$('task-desc').textContent=p.desc;list.replaceChildren();p.steps.forEach(([name,desc],i)=>{const row=document.createElement('label');row.className='taskrow';const cb=document.createElement('input');cb.type='checkbox';cb.checked=getLocal(stage.value+'-'+i)==='1';cb.addEventListener('change',()=>{setLocal(stage.value+'-'+i,cb.checked?'1':'0');progress();document.dispatchEvent(new CustomEvent('bdesh:task-change',{detail:{task_id:stage.value+'-'+i,is_complete:cb.checked}}))});const div=document.createElement('div'),b=document.createElement('strong'),small=document.createElement('p');b.textContent=name;small.textContent=desc;div.append(b,small);row.append(cb,div);list.append(row)});progress()}
function progress(){let done=$('task-list').querySelectorAll('input:checked').length;$('step-count').textContent=done+' / 4';$('track-fill').style.width=done*25+'%'}
stage.addEventListener('change',()=>{setLocal('stage',stage.value);redraw();document.dispatchEvent(new CustomEvent('bdesh:profile-change'))});$('reset').addEventListener('click',()=>{for(let i=0;i<4;i++)removeLocal(stage.value+'-'+i);redraw();document.dispatchEvent(new CustomEvent('bdesh:reset',{detail:{stage:stage.value}}))});
function show(q=''){const wrap=$('opportunities');wrap.replaceChildren();sources.filter(x=>x.join(' ').toLowerCase().includes(q.toLowerCase())).forEach(([name,country,description,url])=>{let card=document.createElement('article');card.className='opportunity';const location=document.createElement('span');location.className='country';location.textContent=country.toUpperCase();const title=document.createElement('h3');title.textContent=name;const p=document.createElement('p');p.textContent=description;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Visit official website ↗';card.append(location,title,p,a);wrap.append(card)});if(!wrap.children.length)wrap.textContent='Nothing matched your search.'}$('search').addEventListener('input',e=>show(e.target.value));show();redraw();
let bangla=false;
const copy={
  eyebrow:['YOUR UNDERGRADUATE JOURNEY, MADE CLEARER','বিদেশে স্নাতক পড়ার যাত্রা এবার আরও সহজ'],
  headline:['Big dreams need a clear plan.','বড় স্বপ্নের জন্য চাই পরিষ্কার পরিকল্পনা।'],
  hero:['From understanding what a full ride takes to submitting your final application—Bdesh helps Bangladeshi students learn, build their profiles, discover universities and track every step in one free workspace.','ফুল রাইড পাওয়ার প্রস্তুতি থেকে শেষ আবেদন পর্যন্ত—Bdesh তোমাকে শিখতে, নিজের প্রোফাইল গড়তে, বিশ্ববিদ্যালয় খুঁজতে এবং প্রতিটি ধাপ ট্র্যাক করতে সাহায্য করে।'],
  promise:['Free for students. No consultancy fees. No admission guarantees.','শিক্ষার্থীদের জন্য বিনামূল্যে। কোনো কনসালটেন্সি ফি বা ভর্তির নিশ্চয়তা নেই।']
};
$('language').addEventListener('click',()=>{
  bangla=!bangla;
  for(const [key,values] of Object.entries(copy)){
    const target=document.querySelector('[data-i18n="'+key+'"]');
    if(target)target.textContent=values[bangla?1:0];
  }
  document.documentElement.lang=bangla?'bn':'en';
});

// Refresh the visible stage, group and tasks after Google account transitions.
document.addEventListener('bdesh:auth-change',restoreLocal);
