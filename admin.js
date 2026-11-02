(()=>{'use strict';
const $=id=>document.getElementById(id);
const status=$('admin-status'),area=$('admin-content'),btn=$('refresh-metrics');
const projectUrl='https://xeqixwmulwonvhifcmvn.supabase.co';
const key='sb_publishable_2Jp14PFt4_mLDT4cpqLfUw_d-tDSnwj';
const client=window.supabase?.createClient(projectUrl,key,{auth:{persistSession:true,autoRefreshToken:true}});
const setStatus=(value,error=false)=>{status.textContent=value;status.dataset.error=String(error)};
const put=(id,v)=>{$(id).textContent=Number(v||0).toLocaleString()};
const render=payload=>{
 const m=payload.totals||{};
 put('metric-accounts',m.accounts);put('metric-active',m.signed_in_7d);
 put('metric-new',m.new_accounts_30d);put('metric-confirmed',m.confirmed_email_accounts);
 put('metric-apps',m.tracked_applications);put('metric-profiles',m.admissions_profiles);
 put('metric-portfolios',m.profile_portfolios);put('metric-tasks',m.completed_learning_tasks);
 put('metric-verified',m.verified_opportunities);
 $('metric-directory-total').textContent='of '+Number(m.published_opportunities||0).toLocaleString()+' published';
 $('directory-meter').style.width=(m.published_opportunities?Math.min(100,100*m.verified_opportunities/m.published_opportunities):0)+'%';
 $('metrics-updated').textContent='Updated '+new Date(payload.generated_at).toLocaleString();
 const chart=$('signup-chart');chart.replaceChildren();
 const data=Array.isArray(payload.signup_series)?payload.signup_series:[];
 const peak=Math.max(1,...data.map(x=>Number(x.signups)||0));
 for(const entry of data){
  const cell=document.createElement('div');cell.className='bar-group';
  const count=document.createElement('span');count.textContent=String(entry.signups);
  const bar=document.createElement('div');bar.className='bar';bar.style.height=Math.max(3,Math.round(154*Number(entry.signups||0)/peak))+'px';
  const date=document.createElement('small');date.textContent=String(entry.day||'').slice(5);
  cell.title=entry.day+': '+entry.signups+' new accounts';
  cell.append(count,bar,date);chart.append(cell);
 }
 area.hidden=false;
 if(payload.incomplete_auth_count)setStatus('Statistics loaded, but the account directory is larger than the current report limit.',true);
 else setStatus('Aggregate metrics loaded. No personal account details are shown.');
};
async function load(){
 if(!client){setStatus('Account library unavailable. Refresh to try again.',true);return}
 btn.disabled=true;setStatus('Checking secure access…');
 try{
  const {data:identity,error:authError}=await client.auth.getUser();
  if(authError||!identity?.user){area.hidden=true;setStatus('Sign in to Bdesh first, then return to this page.',true);return}
  const {data:sessionData}=await client.auth.getSession();
  const token=sessionData?.session?.access_token;
  if(!token){area.hidden=true;setStatus('Your session expired. Sign in again from Bdesh.',true);return}
  const response=await fetch(projectUrl+'/functions/v1/admin-metrics',{headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'},cache:'no-store'});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok){area.hidden=true;setStatus(response.status===403?'This account is not authorized to view administration metrics.':payload.error||'Statistics are unavailable.',true);return}
  render(payload);
 }catch(e){area.hidden=true;setStatus('Could not load admin metrics. Check the network or try again.',true)}
 finally{btn.disabled=false}
}
btn.addEventListener('click',load);load();
})();