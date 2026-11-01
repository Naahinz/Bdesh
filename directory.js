/* Bdesh public directory + user bookmarks, backed by Supabase RLS. */
(() => {
'use strict';
const client=globalThis.bdeshSupabase;
const byId=id=>document.getElementById(id);
const wrap=byId('opportunities'),search=byId('search'),status=byId('directory-status'),dash=byId('student-dashboard');
if(!client||!wrap||!search)return;
let rows=[],saved=new Set(),user=null,initialized=false;
function dashboard(){
  dash.hidden=!user;
  if(!user)return;
  const stage=byId('stage')?.value||'11';
  let done=0;for(let i=0;i<4;i++)if(localStorage.getItem('bdesh-'+stage+'-'+i)==='1')done++;
  byId('dashboard-name').textContent=user.email?' · '+user.email.split('@')[0]:'';
  byId('dashboard-completed').textContent=done+'/4';
  byId('dashboard-saved').textContent=String(saved.size);
  byId('dashboard-summary').textContent='Your '+(stage==='gap'?'gap-year':stage==='9'?'Class 9–10':'Class '+stage)+' roadmap is ready. Changes sync to your account.';
}
function node(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n}
function render(){
  const q=search.value.toLowerCase().trim();
  const visible=rows.filter(r=>[r.title,r.country,r.funding_notes,r.eligibility_notes].join(' ').toLowerCase().includes(q));
  wrap.replaceChildren();
  for(const r of visible){
    const card=node('article','opportunity');
    card.append(node('span','country',r.country.toUpperCase()),node('h3','',r.title));
    card.append(node('p','',r.funding_notes||'Read the official admissions and financial-aid policies.'));
    const source=node('a','', 'View official source ↗');source.href=r.official_url;source.rel='noopener noreferrer';source.target='_blank';card.append(source);
    const bookmark=node('button','bookmark',user?(saved.has(r.id)?'★ Saved':'☆ Save for later'):'Sign in to save');
    bookmark.type='button';bookmark.setAttribute('aria-pressed',String(saved.has(r.id)));bookmark.addEventListener('click',()=>toggleSave(r.id));
    card.append(bookmark);wrap.append(card);
  }
  if(!visible.length)wrap.append(node('p','footnote','No matching opportunities. Try another country or university.'));
  status.textContent=rows.length+' official research starting points. Funding and deadlines must be checked on each institution’s website.';
  dashboard();
}
async function toggleSave(id){
  if(!user){byId('account-toggle')?.click();return}
  const currentlySaved=saved.has(id);
  const query=client.from('saved_opportunities');
  const {error}=currentlySaved?await query.delete().eq('user_id',user.id).eq('opportunity_id',id):await query.insert({user_id:user.id,opportunity_id:id});
  if(error){status.textContent='Could not save this opportunity: '+error.message;return}
  if(currentlySaved)saved.delete(id);else saved.add(id);render();
}
async function loadSaves(){
  saved.clear();if(!user){render();return}
  const {data,error}=await client.from('saved_opportunities').select('opportunity_id').eq('user_id',user.id);
  if(error){status.textContent='Saved opportunities are temporarily unavailable.';return}
  for(const entry of data||[])saved.add(entry.opportunity_id);
  render();
}
async function begin(){
  const {data,error}=await client.from('opportunities').select('id,title,country,official_url,funding_notes,eligibility_notes').eq('published',true).order('title');
  if(error){status.textContent='Directory database is unavailable; please try refreshing.';return}
  rows=data||[];initialized=true;render();
}
search.addEventListener('input',()=>{if(initialized)render()});
document.addEventListener('bdesh:auth-change',event=>{user=event.detail.user||null;loadSaves()});
document.addEventListener('bdesh:task-change',dashboard);
document.addEventListener('bdesh:reset',dashboard);
byId('stage')?.addEventListener('change',dashboard);
client.auth.getSession().then(({data})=>{if(data?.session?.user){user={id:data.session.user.id,email:data.session.user.email||''};loadSaves()}else dashboard()}).catch(()=>{});
begin();
})();