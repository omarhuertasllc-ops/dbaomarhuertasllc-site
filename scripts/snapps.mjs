// ServiceNow Store apps: pure renderers driven by src/content/servicenow-apps.json (imported by build.mjs and the tests).
// Status copy is honest by construction: listing, version and "ServiceNow Certified" appear only when the data says so.
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const SUPPORT_EMAIL='support@dbaomarhuertasllc.com';
const STATUS={
 listed:{badge:'Now on the ServiceNow Store',chip:'On the Store',cls:''},
 in_review:{badge:'In ServiceNow certification review',chip:'In review',cls:' review'},
 coming_soon:{badge:'Coming soon',chip:'Coming soon',cls:' soon'}
};
const ICONS={
 list:'<path d="M4 6h16M4 12h16M4 18h10"/>',
 shield:'<path d="M12 3l8 4v5c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V7z"/>',
 wave:'<path d="M4 12h4l3-8 4 16 3-8h2"/>',
 refresh:'<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>',
 lock:'<path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z"/>',
 record:'<path d="M9 4h6l1 3h4v13H4V7h4zM12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>'
};
// Only these statuses render anywhere on the site. Other entries (coming_soon) stay in the json as the source of truth.
export const RENDERED=new Set(['listed','in_review']);
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine'];
const monthYear=d=>new Date(d+'T00:00:00Z').toLocaleString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});

export const isListed=a=>a.status==='listed'&&!!a.store?.live&&!!a.store_url;
export const isCertified=a=>isListed(a)&&!!a.store?.certified;
const byOrder=(a,b)=>(a.order??1e9)-(b.order??1e9);
// Newest store.certified_at among listed + live apps wins; ties by `order`. Returns null when nothing is on the Store.
export function spotlightApp(apps){
 const c=(apps||[]).filter(a=>a.status==='listed'&&a.store?.live);
 c.sort((a,b)=>{const x=a.store.certified_at||'',y=b.store.certified_at||'';return x===y?byOrder(a,b):(x<y?1:-1)});
 return c[0]||null;
}
export const appUrl=a=>`/servicenow/${a.slug}.html`;
export const listedApps=apps=>apps.filter(isListed).sort(byOrder);
export const sortedApps=apps=>[...apps].sort(byOrder);
export function counts(apps){
 const n=s=>apps.filter(a=>a.status===s).length;
 const parts=[[n('listed'),'on the Store'],[n('in_review'),'in review'],[n('coming_soon'),'coming soon']].filter(p=>p[0]).map(p=>`${p[0]} ${p[1]}`);
 return parts.join(', ');
}
// Home announce pill: the spotlight app when a certified listing exists, otherwise the standing Partner line.
export function homeAnnounce(apps){
 const s=spotlightApp(apps);
 if(s&&isCertified(s))return {href:appUrl(s),text:`New on the ServiceNow Store: ${esc(s.name)}${s.store.version?' '+esc(s.store.version):''}`};
 return {href:'/services.html',text:'Registered ServiceNow Build &amp; Consulting Partner'};
}

// Read the json and attach pixel sizes of every referenced screenshot (keeps width/height honest, no layout shift).
export async function loadApps(root){
 const data=JSON.parse(await readFile(join(root,'src/content/servicenow-apps.json'),'utf8'));
 for(const a of data.apps){
  a._dims={};
  for(const n of [a.hero_image,...(a.sections||[]).map(s=>s.image)].filter(Boolean)){
   try{a._dims[n]=webpSize(await readFile(join(root,'assets/snapps',a.slug,n+'.webp')))}catch{}
  }
 }
 return data.apps.filter(a=>RENDERED.has(a.status));
}
function webpSize(b){
 if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw new Error('not webp');
 const t=b.toString('ascii',12,16);
 if(t==='VP8 ')return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
 if(t==='VP8X')return {w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3)};
 if(t==='VP8L'){const v=b.readUInt32LE(21);return {w:(v&0x3fff)+1,h:((v>>14)&0x3fff)+1}}
 throw new Error('webp');
}

const img=(a,name,alt,opts={})=>{
 const d=a._dims?.[name];
 return `<img src="/assets/snapps/${a.slug}/${name}.webp"${d?` width="${d.w}" height="${d.h}"`:''} alt="${esc(alt)}"${opts.eager?' fetchpriority="high"':' loading="lazy"'} decoding="async">`;
};
const ic=k=>`<span class="uc-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]||ICONS.record}</svg></span>`;
const arrow='<span aria-hidden="true">&rarr;</span>';

// Primary action: Store button only for a real, live listing; otherwise "Get notified".
export function primaryCta(a,label){
 if(isListed(a))return `<a class="uc-btn uc-btn-g" href="${esc(a.store_url)}" rel="noopener">${label||'Get it on the ServiceNow Store'} ${arrow}</a>`;
 return `<a class="uc-btn uc-btn-g" href="/contact.html?app=${encodeURIComponent(a.slug)}">Get notified ${arrow}</a>`;
}

// Generated stage for apps without a screenshot: navy panel with the app name, scope and category.
function placeholder(a){
 const lines=[];for(let i=1;i<10;i++)lines.push(`<path class="ln" d="M${i*104} 0V420"/>`);for(let i=1;i<5;i++)lines.push(`<path class="ln" d="M0 ${i*84}H1040"/>`);
 return `<svg viewBox="0 0 1040 420" role="img" aria-label="${esc(a.name)}, ${esc(a.category)}, scope ${esc(a.scope)}">${lines.join('')}<rect class="pn" x="64" y="64" width="912" height="292" rx="16"/><text class="m" x="104" y="130" font-size="22" letter-spacing="3">${esc(a.category.toUpperCase())}</text><text x="104" y="226" font-size="${a.name.length>22?52:64}" font-weight="700">${esc(a.name)}</text><text class="g" x="104" y="290" font-size="24">${esc(a.scope)}</text><text class="m" x="104" y="330" font-size="20">${esc(STATUS[a.status]?.badge||'')}</text></svg>`;
}

// ----- one app page body -----
export function snAppBody(a){
 const st=STATUS[a.status]||STATUS.coming_soon,listed=isListed(a),cert=isCertified(a);
 const sents=a.tagline.split(/(?<=\.)\s+/);
 const h1=sents.length>1?`${esc(sents[0])} <em>${esc(sents.slice(1).join(' '))}</em>`:esc(a.tagline);
 const meta=[
  
  listed&&a.store.version?`<span>Version <b>${esc(a.store.version)}</b></span>`:'',
  cert?`<span><b>ServiceNow Certified</b>${a.store.certified_at?' '+monthYear(a.store.certified_at):''}</span>`:'',
  `<span>${esc(a.category)}</span>`,
  `<span>Built by <b>Omar Huertas LLC</b></span>`
 ].filter(Boolean).join('');
 const stage=a.hero_image
  ?`<div class="uc-shot"><div class="uc-bar" aria-hidden="true"><i></i><i></i><i></i></div>${img(a,a.hero_image,a.hero_alt||a.name+' screenshot',{eager:true})}</div>`
  :`<div class="uc-shot uc-stage">${placeholder(a)}</div>`;
 const hero=`<section class="uc-hero" aria-labelledby="h1"><div class="uc-wrap">
<span class="uc-badge"><i></i>ServiceNow Build Partner &middot; ${st.badge}</span>
<h1 id="h1">${h1}</h1>
<p class="uc-lead">${esc(a.summary)}</p>
<div class="uc-cta">${primaryCta(a)}<a class="uc-btn uc-btn-o" href="#features">See how it works</a></div>
<p class="uc-meta">${meta}</p>
${stage}
</div></section>`;
 const feats=(a.features||[]).length?`<div class="uc-grid">${a.features.map(f=>`<div class="uc-card">${ic(f.icon)}<h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join('')}</div>`:'';
 const splits=(a.sections||[]).map((s,i)=>{
  const txt=`<div><p class="uc-kicker">${esc(s.kicker)}</p><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${(s.bullets||[]).length?`<ul>${s.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}</div>`;
  const pic=s.image?img(a,s.image,s.alt||s.title):'';
  return `<div class="uc-split${i%2?' rev':''}">${i%2?pic+txt:txt+pic}</div>`;
 }).join('\n');
 const main=`<section class="uc-sec" id="features" aria-labelledby="f-h"><div class="uc-wrap">
<p class="uc-kicker">Why ${esc(a.name)}</p>
<h2 id="f-h">The problem it takes off your plate.</h2>
<p class="uc-sub">${esc(a.problem)}</p>
${feats}
${splits}
</div></section>`;
 const n=(a.steps||[]).length;
 const steps=n?`<section class="uc-sec alt" aria-labelledby="s-h"><div class="uc-wrap">
<p class="uc-kicker">${listed?'Get started':'How it will work'}</p><h2 id="s-h">${listed?`Up and running in ${WORDS[n]||n} steps.`:`${WORDS[n]?WORDS[n][0].toUpperCase()+WORDS[n].slice(1):n} steps from install to value.`}</h2>
<ol class="uc-steps">${a.steps.map(s=>`<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join('')}</ol>
</div></section>`:'';
 const finalP=listed
  ?`${esc(a.name)} is built and supported by Omar Huertas LLC, a Registered ServiceNow Build &amp; Consulting Partner. Questions, or want it tuned for your estate? We answer fast.`
  :`${esc(a.name)} is built by Omar Huertas LLC, a Registered ServiceNow Build &amp; Consulting Partner. ${a.status==='in_review'?'It is in ServiceNow&rsquo;s review process and not yet listed on the Store.':'It is not yet on the ServiceNow Store.'} Tell us you are interested and we will write when it is available.`;
 const final=`<section class="uc-final" aria-labelledby="c-h"><div class="uc-wrap">
<h2 id="c-h">${listed?'Built and supported by Omar Huertas LLC.':`Want to hear when ${esc(a.name)} is ready?`}</h2>
<p>${finalP}</p>
<div class="uc-cta">${primaryCta(a,'View on the ServiceNow Store')}<a class="uc-btn uc-btn-o" href="mailto:${SUPPORT_EMAIL}">Contact support</a></div>
</div></section>`;
 return [hero,main,steps,final].filter(Boolean).join('\n');
}
export const snAppMeta=a=>({
 title:`${a.name} for ServiceNow | Omar Huertas LLC`,
 description:`${a.summary}${isListed(a)?' On the ServiceNow Store.':a.status==='in_review'?' In ServiceNow certification review.':' Coming soon.'}`,
 ogImage:a.hero_image?`https://dbaomarhuertasllc.com/assets/snapps/${a.slug}/${a.hero_image}.webp`:undefined
});

// ----- hub body -----
export function hubBody(apps){
 const all=sortedApps(apps),sp=spotlightApp(all),c=counts(all);
 const spot=sp?`<article class="uc-spot" aria-labelledby="sp-h"><div><span class="uc-chip">Latest on the Store</span><h2 id="sp-h">${esc(sp.name)}${sp.store.version?` <small>${esc(sp.store.version)}</small>`:''}</h2><p>${esc(sp.tagline)} ${esc(sp.summary)}</p><p class="uc-meta">${isCertified(sp)?`<span><b>ServiceNow Certified</b>${sp.store.certified_at?' '+monthYear(sp.store.certified_at):''}</span>`:''}</p><div class="uc-cta">${primaryCta(sp)}<a class="uc-btn uc-btn-o" href="${appUrl(sp)}">Learn more</a></div></div>${sp.hero_image?img(sp,sp.hero_image,sp.hero_alt||sp.name+' screenshot',{eager:true}):`<div class="uc-stage">${placeholder(sp)}</div>`}</article>`:'';
 const card=a=>{const st=STATUS[a.status]||STATUS.coming_soon,listed=isListed(a);
  return `<article class="uc-card uc-app"><span class="uc-chip${st.cls}">${st.chip}</span><h3><a href="${appUrl(a)}">${esc(a.name)}</a></h3><p>${esc(a.tagline)}</p><dl><dt>Category</dt><dd>${esc(a.category)}</dd>${listed&&a.store.version?`<dt>Version</dt><dd>Version ${esc(a.store.version)}</dd>`:''}</dl><a class="uc-more" href="${appUrl(a)}">${listed?'See the app':'Read more'} ${arrow}</a></article>`};
 return `<section class="uc-hero hub" aria-labelledby="h1"><div class="uc-wrap">
<span class="uc-badge"><i></i>ServiceNow Build Partner</span>
<h1 id="h1">Apps we build for <em>the Now Platform</em></h1>
<p class="uc-lead">Omar Huertas LLC is a Registered ServiceNow Build &amp; Consulting Partner. We package the tools we wish every platform team had as scoped ServiceNow applications, and say plainly where each one stands.</p>
${c?`<p class="uc-counts">${c}.</p>`:''}
${spot}
</div></section>
<section class="uc-sec" aria-labelledby="all-h"><div class="uc-wrap">
<p class="uc-kicker">All apps</p><h2 id="all-h">${all.length} apps, by status.</h2>
<p class="uc-sub">Only apps marked &ldquo;On the Store&rdquo; can be installed today. The others are in ServiceNow&rsquo;s review process or still being built.</p>
<div class="uc-grid">${all.map(card).join('')}</div>
<p class="uc-note">ServiceNow and the ServiceNow logo are registered trademarks of ServiceNow, Inc. Omar Huertas LLC is an independent ServiceNow partner.</p>
</div></section>`;
}

// ----- compact strip for the home page (after the hero) -----
export function homeStrip(apps){
 const s=spotlightApp(apps);
 if(!s)return '';
 return `<section class="uc-strip" aria-labelledby="uc-strip-h"><div class="wrap"><div class="uc-strip-in"><div class="uc-strip-txt"><span class="uc-chip">Latest on the ServiceNow Store</span><h2 id="uc-strip-h">${esc(s.name)}${s.store.version?' '+esc(s.store.version):''}</h2><p>${esc(s.tagline)}</p></div><div class="uc-cta">${primaryCta(s)}<a class="uc-btn uc-btn-o" href="/servicenow-apps.html">All Store apps</a></div></div></div></section>`;
}

// Home hero stage: the spotlight app's real hero screenshot in the tilted product frame; empty when there is none.
export function homeStage(apps){
 const s=spotlightApp(apps);
 if(!s||!s.hero_image)return '';
 return `<div class="stage"><div class="stage-glow" aria-hidden="true"></div><a class="stage-shot" href="${appUrl(s)}">${img(s,s.hero_image,s.hero_alt||s.name+' screenshot',{eager:true})}</a><div class="stage-fade" aria-hidden="true"></div>${s.slug==='update-center'?'<p class="stage-cap">Update Center: one click updates every instance. Live on the ServiceNow Store.</p>':''}</div>`;
}
