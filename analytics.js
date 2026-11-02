/* Bdesh minimal-consent product analytics. Never collect private inputs. */
(()=>{'use strict';
const config=window.BDESH_ANALYTICS||{};
const key=String(config.projectKey||'');
const host=String(config.apiHost||'');
const configured=/^phc_[A-Za-z0-9_-]+$/.test(key)&&/^https:\/\/(?:us|eu)\.i\.posthog\.com$/.test(host);
const storageKey='bdesh_analytics_consent_v1';
const validEvents=new Set(['bdesh_page_viewed','bdesh_section_viewed','bdesh_lesson_viewed','bdesh_lesson_completed','bdesh_application_added','bdesh_profile_saved']);
const validSections=new Set(['prepare','discover','apply','overview','academics','activities','honors','writing','brag','review']);
const pages={'/':'home','/index.html':'home','/learn.html':'learn','/workspace.html':'workspace','/profile.html':'profile'};
const page=pages[location.pathname]||null;
let active=false,queue=[];
function consent(){try{return localStorage.getItem(storageKey)}catch{return null}}
function remember(value){try{localStorage.setItem(storageKey,value)}catch{}}
function sanitize(name,props){
 if(!validEvents.has(name))return null;
 const safe={};
 if(props?.section&&validSections.has(props.section))safe.section=props.section;
 if(Number.isInteger(props?.chapter_index)&&props.chapter_index>=1&&props.chapter_index<=30)safe.chapter_index=props.chapter_index;
 if(name==='bdesh_page_viewed'&&page)safe.page=page;
 if(!page)return null;
 return safe;
}
window.bdeshTrack=(name,props={})=>{
 const safe=sanitize(name,props);
 if(!safe||!configured||!active)return;
 if(window.posthog?.capture)window.posthog.capture(name,safe);
 else queue.push([name,safe]);
};
function boot(){
 if(!configured||active)return;
 active=true;
 // Official PostHog async bootstrap. SDK initializes only after affirmative opt-in.
 !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture opt_out_capturing opt_in_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
 window.posthog.init(key,{
  api_host:host,
  autocapture:false,
  capture_pageview:false,
  capture_pageleave:false,
  disable_session_recording:true,
  disable_surveys:true,
  person_profiles:'never',
  persistence:'memory',
  mask_all_text:true,
  mask_all_element_attributes:true,
  capture_performance:false,
  // Do not allow any SDK-added page URL or referrer into PostHog.
  before_send:(event)=>{
   if(!validEvents.has(event?.event))return null;
   for(const prop of ['$current_url','$referrer','$initial_referrer','$initial_current_url','$pathname','$host','$url','$referring_domain']){
    if(event.properties)delete event.properties[prop];
   }
   return event;
  },
  disable_external_dependency_loading:true,
  defaults:'2026-08-30'
 });
 if(page)window.bdeshTrack('bdesh_page_viewed',{});
 for(const [name,props] of queue)window.bdeshTrack(name,props);
 queue=[];
}
function panel(){
 if(!configured||consent()!==null||!page)return;
 const section=document.createElement('section');section.className='bdesh-analytics-consent';
 section.setAttribute('role','region');section.setAttribute('aria-label','Optional anonymous analytics');
 const text=document.createElement('p');
 text.textContent='Help us improve Bdesh? With your permission, we count page visits and completed steps. We never send your form answers, essays, name or email to analytics.';
 const buttons=document.createElement('div');buttons.className='bdesh-analytics-consent-actions';
 for(const [choice,label] of [['no','Not now'],['yes','Allow anonymous analytics']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;
  b.addEventListener('click',()=>{
   remember(choice);section.remove();
   if(choice==='yes')boot();
  });
  buttons.append(b);
 }
 section.append(text,buttons);
 document.body.append(section);
}
// A choice made in another Bdesh tab takes effect immediately in this tab.
window.addEventListener('storage',event=>{
 if(event.key===storageKey&&event.newValue!=='yes'){
  active=false;queue=[];window.posthog?.opt_out_capturing?.();
 }else if(event.key===storageKey&&event.newValue==='yes')boot();
});
if(configured&&consent()==='yes')boot();
window.addEventListener('hashchange',()=>{
 const section=location.hash.replace(/^#/,'');
 if(validSections.has(section))window.bdeshTrack('bdesh_section_viewed',{section});
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',panel,{once:true});else panel();
})();