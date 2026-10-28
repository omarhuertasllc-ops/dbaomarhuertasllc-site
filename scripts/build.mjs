#!/usr/bin/env node
// Renders every public page of dbaomarhuertasllc.com into the repo root (the deployable sources).
// Concept D "Albena family" (2026-10-11): the design system shared with albena.ai (tokens, 56px blur nav, pill buttons,
// gradient display type, tilted product stage, 16px bento cards, statement, four-column footer, family bar), with the LLC's
// green accent and the calm facet light behind the home hero. Fonts: Geist + Geist Mono only. Styles: assets/site.css.
// Content for the document pages (legal, privacy, terms, accessibility, lexicon) lives in src/content/*.json.
// Every page works without JavaScript; JS adds the menu, the reveal, the facet light, the palette and the form sender.
import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='https://dbaomarhuertasllc.com';
const EMAIL='omar@dbaomarhuertasllc.com';
const WEB3FORMS_KEY='6ea6366a-77ee-4e88-9767-deb9aabd4d29';
const CITY='Greensboro, North Carolina';
const STUDIO='https://webdesign.dbaomarhuertasllc.com/';
const APPS_ORIGIN='https://appleapps.dbaomarhuertasllc.com';
const APPS_URL=APPS_ORIGIN+'/'; // the App Store apps live on their own subdomain (dist-appleapps/)
import {createHash} from 'node:crypto';
const CSSV=createHash('sha1').update(await readFile(join(ROOT,'assets/site.css'))).update(await readFile(join(ROOT,'assets/snapps.css'))).digest('hex').slice(0,8); // cache-buster: _headers caches css for a month
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
import {CAPS,PROOF} from './home-proof.mjs';
import {loadApps,spotlightApp,homeStage,snAppBody,snAppMeta,hubBody,homeStrip,homeAnnounce,listedApps,appUrl} from './snapps.mjs';
export {spotlightApp};
let SNAPPS=[]; // src/content/servicenow-apps.json, loaded before rendering
const json=async n=>JSON.parse(await readFile(join(ROOT,'src/content',n+'.json'),'utf8'));

const NAV=[['/services.html','ServiceNow'],['/servicenow-apps.html','Store apps'],[STUDIO,'Web Design'],[APPS_URL,'Apps'],['/about.html','About'],['/contact.html','Contact']];
const LAB=[['/operations-platform.html','Obvera','In development','IT operations with a change record behind every action.'],['/#albena','Albena','Coming soon','A private AI assistant for your own hardware.'],['/#agentgate','AgentGate','Research preview','Approval-bound AI agents, measured.']];
const PAL=[['/services.html','ServiceNow services',''],[APPS_URL,'Apps, our App Store apps','iphone ipad mac ios'],['/industries.html','Industries',''],['/about.html','About, our story',''],['/servicenow-lexicon/','The ServiceNow Lexicon','96 chapters'],['/support.html','Support',''],['/contact.html','Contact',''],['/services.html#cmdb','CMDB and CSDM strategy','service'],['/services.html#itom','ITOM Discovery and Service Mapping','service'],['/services.html#integration','Integrations and Scripted REST APIs','service'],['/services.html#digital','Websites, apps and digital transformation','digital studio'],['/#story','Our story','home'],['/#tribute','Michael Lombardo tribute','home'],['/support.html#support-form','Open a support request','support'],['/security.html','Trust and security',''],['/privacy-policy.html','Privacy policy','legal'],['/terms.html','Terms and conditions','legal'],['/legal.html','Legal notices','legal'],['/accessibility.html','Accessibility statement',''],[STUDIO,'Web Design Studio','webdesign.dbaomarhuertasllc.com'],['/#albena','Albena, in development, coming soon','albena.ai'],['/operations-platform.html','Obvera, in development, coming soon','obvera platform'],['/#agentgate','AgentGate, research preview, coming soon','agentgate'],['https://albena.ai/waitlist','Join the Albena waitlist','albena.ai waitlist early access']];
const MARK=(id,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="mk-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8be878"/><stop offset="1" stop-color="#2e9e1f"/></linearGradient><mask id="mkm-${id}"><rect width="32" height="32" fill="#fff"/><g stroke="#000" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M10 21.5 16 9l6 12.5"/><path d="M12.6 16.5h6.8"/></g></mask></defs><circle cx="16" cy="16" r="14" fill="url(#mk-${id})" mask="url(#mkm-${id})"/></svg>`;
const stamp=(t='In development',cls='amber')=>`<span class="chip ${cls}">${t}</span>`;
const stampFor=s=>s==='Research preview'?stamp(s,'acc'):stamp(s,'amber');
const btn=(h,t,cls='btn')=>`<a class="${cls}" href="${h}">${t}</a>`;
const pic=(slug,alt,sizes='(max-width:760px) 92vw, 560px',opts={})=>`<picture><source type="image/avif" srcset="/assets/work/${slug}-c600.avif 600w, /assets/work/${slug}-c1200.avif 1200w" sizes="${sizes}"><img src="/assets/work/${slug}-c1200.webp" srcset="/assets/work/${slug}-c600.webp 600w, /assets/work/${slug}-c1200.webp 1200w" sizes="${sizes}" width="1200" height="750" alt="${esc(alt)}" loading="${opts.eager?'eager':'lazy'}" decoding="async"${opts.eager?' fetchpriority="high"':''}></picture>`;
const head=(eyebrow,h2,sub,id)=>`<div class="head reveal">${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}<h2 class="h-section"${id?` id="${id}"`:''}>${h2}</h2>${sub?`<p class="sub">${sub}</p>`:''}</div>`;
const sec=(id,inner,opts={})=>`<section${id?` id="${id}"`:''} class="sec${opts.cls?' '+opts.cls:''}"${opts.label?` aria-labelledby="${opts.label}"`:''}${opts.aria?` aria-label="${opts.aria}"`:''}><div class="wrap${opts.wrap?' '+opts.wrap:''}">${inner}</div></section>`;
const closing=(h2,p,label='Start a conversation',href='/contact.html')=>`<section class="sec cta-sec" aria-labelledby="cl-h"><div class="cta-glow" aria-hidden="true"></div><div class="wrap center"><h2 id="cl-h" class="h-section reveal">${h2}</h2><p class="sub reveal">${p}</p><div class="cta reveal">${btn(href,label,'btn btn-primary')}${btn('/services.html','See what we build','btn btn-ghost')}</div><a class="mail" href="mailto:${EMAIL}">${EMAIL}</a></div></section>`;

// ----- the shell -----
// `site` is set only for the Apple apps build: its canonical origin, and every main-site link becomes absolute to ORIGIN.
function page({path,title,description,body,script,css,bodyClass='',ogImage=`${ORIGIN}/assets/knowledge/k_2026_a.jpg`,site=''}){
 const url=(site||ORIGIN)+path.replace(/index\.html$/,'');
 const schema={"@context":"https://schema.org","@type":"ProfessionalService","name":"Omar Huertas LLC","url":ORIGIN,"email":EMAIL,"description":"Registered ServiceNow Build, Consulting & Implementation Partner: CMDB, ITAM, ITSM, ITOM, integrations, AI and automation, plus websites and custom applications.","founder":{"@type":"Person","name":"Omar Huertas"},"address":{"@type":"PostalAddress","addressLocality":"Greensboro","addressRegion":"NC","addressCountry":"US"},"sameAs":["https://www.linkedin.com/company/omar-huertas-llc","https://www.linkedin.com/in/omarhuertas"]};
 const html=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#02202f">
<meta name="color-scheme" content="dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Omar Huertas LLC">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/Geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/site.css?v=${CSSV}">${css?`\n<link rel="stylesheet" href="/assets/${css}.css?v=${CSSV}">`:''}
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
<script>document.documentElement.classList.add('js')</script>
<script type="module" src="/assets/rt.js"></script>
<script src="/assets/app.js" defer></script>${script?`\n<script type="module" src="/assets/${script}.js"></script>`:''}
</head>
<body${bodyClass?` class="${bodyClass}"`:''}>
<a class="skip" href="#main">Skip to content</a>
${header(path,site)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(path,site)}
${cmd()}
</body>
</html>
`;
 return site?absolutize(html):html;
}
const absolutize=h=>h.replace(/(href|action)="\/(?!\/|assets\/)/g,(m,a)=>`${a}="${ORIGIN}/`);

// ----- nav: brand, four links, the "In development" menu, Cmd-K and the call -----
function header(path,site=''){
 const cur=h=>(path===h||(site&&h===APPS_URL))?' aria-current="page"':'';
 const nav=site?[['/','&larr; Omar Huertas LLC'],...NAV]:NAV;
 return `<header class="nav" data-nav>
<div class="nav-in">
<a class="brand" href="/" aria-label="Omar Huertas LLC home">${MARK('nav')}<span>Omar Huertas LLC</span></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Menu" data-nav-toggle><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg></button>
<div class="nav-panel" id="nav-panel">
<nav aria-label="Primary"><ul class="links">${nav.map(([h,t])=>`<li><a href="${h}"${cur(h)}>${t}</a></li>`).join('')}<li class="lab"><details data-lab><summary>In development</summary><div class="lab-menu">${LAB.map(([h,t,s,d])=>`<a href="${h}"><b>${t}</b>${stampFor(s)}<span>${d}</span></a>`).join('')}</div></details></li></ul></nav>
<div class="nav-cta"><button type="button" class="btn btn-sm btn-ghost cmdk" data-open-island="cmd" aria-label="Search the site, Command K"><span class="kbd">&#8984;K</span></button>${btn('/contact.html','Talk to us','btn btn-sm btn-primary')}</div>
</div>
</div>
</header>`;
}

// ----- family bar, then the four-column footer -----
function footer(path,site=''){
 return `<nav class="family" aria-label="Omar Huertas LLC sites"><div class="family-in"><span>A company of Omar Huertas LLC</span><a href="/"${path==='/index.html'&&!site?' aria-current="page"':''}><i class="llc"></i>dbaomarhuertasllc.com</a><a href="https://albena.ai/" rel="noopener"><i class="alb"></i>albena.ai</a><a href="${STUDIO}" rel="noopener"><i class="stu"></i>Web Design Studio</a></div></nav>
<footer class="foot"><div class="foot-in">
<div class="foot-brand"><a class="brand" href="/" aria-label="Omar Huertas LLC home">${MARK('foot',20)}<span>Omar Huertas LLC</span></a><p>Registered ServiceNow Build &amp; Consulting Partner. A web design studio. Makers of Obvera, Albena and AgentGate, all in development.</p><p class="fine">${CITY}. <a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
<nav class="fcols" aria-label="Footer">
<div><h2>ServiceNow</h2><a href="/services.html">Services</a><a href="/servicenow-apps.html">Store apps</a>${listedApps(SNAPPS).map(a=>`<a href="${appUrl(a)}">${esc(a.name)}</a>`).join('')}<a href="/services.html#cmdb">CMDB and CSDM</a><a href="/services.html#itom">ITOM and discovery</a><a href="/services.html#integration">Integrations</a><a href="/industries.html">Industries</a><a href="/servicenow-lexicon/">The ServiceNow Lexicon</a></div>
<div><h2>In development</h2><a href="/operations-platform.html">Obvera ${stamp('In development')}</a><a href="/#albena">Albena ${stamp('Coming soon')}</a><a href="/#agentgate">AgentGate ${stamp('Research preview','acc')}</a><a href="https://albena.ai/waitlist" rel="noopener">Join the Albena waitlist</a></div>
<div><h2>Company</h2><a href="${APPS_URL}">Apps</a><a href="/about.html">About, our story</a><a href="${STUDIO}" rel="noopener">Web Design Studio</a><a href="/support.html">Support</a><a href="/contact.html">Contact</a><a href="https://www.linkedin.com/company/omar-huertas-llc" rel="noopener">LinkedIn</a></div>
<div><h2>Trust and legal</h2><a href="/security.html">Trust and security</a><a href="/privacy-policy.html">Privacy policy</a><a href="/terms.html">Terms and conditions</a><a href="/legal.html">Legal notices</a><a href="/accessibility.html">Accessibility</a><a href="/sitemap.xml">Sitemap</a></div>
</nav></div>
<div class="foot-bot"><p>&copy; <span data-year>${new Date().getFullYear()}</span> Omar Huertas LLC. All rights reserved.</p><p>In honor of <a href="/#tribute">Michael Lombardo</a>, the Mayor of ServiceNow (1987&ndash;2024). <a href="https://www.joeandruzzifoundation.org" rel="noopener">#LombardoLegacy</a></p><p>No trackers. Set in Geist.</p></div>
<p class="foot-dis">ServiceNow and the ServiceNow logo are registered trademarks of ServiceNow, Inc. Omar Huertas LLC is an independent ServiceNow partner and is not affiliated with or endorsed by ServiceNow, Inc.</p></footer>`;
}

let LEX_PAL=[];
function cmd(){
 const items=[['/','Home',''],...PAL,['/servicenow-apps.html','ServiceNow Store apps','apps we build store'],...SNAPPS.map(a=>[appUrl(a),`${a.name}, ServiceNow app`,`${a.category} ${a.status.replace('_',' ')}`.toLowerCase()]),...LEX_PAL];
 return `<div id="cmd" popover data-island="palette" data-lazy="never"><div class="cmd-in"><div class="cmd-box"><label><span>Go to</span><input type="search" placeholder="Search pages, services, lexicon chapters" autocomplete="off" aria-label="Search pages and lexicon chapters"></label><ul role="list">${items.map(([h,t,m])=>`<li data-k="${esc((t+' '+m).toLowerCase())}"><a href="${h}">${esc(t)}<small>${esc(m)}</small></a></li>`).join('')}</ul><p class="cmd-empty" hidden>Nothing matches. Try a page name, a service or a ServiceNow term.</p><div class="cmd-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div></div></div></div>`;
}

const form=(opts={})=>`<form class="inquiry" data-contact-form action="https://api.web3forms.com/submit" method="post"><input type="hidden" name="access_key" value="${WEB3FORMS_KEY}">${opts.subject?`<input type="hidden" name="subject" value="${esc(opts.subject)}">`:''}<input type="hidden" name="redirect" value="${ORIGIN}${opts.redirect||'/contact.html'}?sent=1"><div class="honeypot" aria-hidden="true"><input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off"></div>
<div class="f-row"><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label></div>
<label>${opts.org||'Company'}<input name="company" autocomplete="organization"></label>
${opts.priority?`<label>Priority <small>(optional)</small><select name="priority"><option value="">Choose one</option><option>General question</option><option>Active project / client</option><option>Urgent / production-down</option></select></label>`:''}
<label>${opts.msgLabel||'What do you need help with?'}<textarea name="message" rows="6" required placeholder="${esc(opts.placeholder||'Tell me what you need help with')}"></textarea></label>
<div class="form-actions"><button type="submit" class="btn btn-primary">${opts.submit||'Send message'}</button><p class="form-note">${opts.note||'Your message sends straight to our inbox. We reply within a business day.'}</p></div>
<p class="form-status" role="status" aria-live="polite"></p></form>`;

// ----- shared content -----
const STORY_BODY=`<p>I was born into technology. I built my first computer at seven, while my stepfather worked for Wang, Northern Telecom, and Oxford. Growing up Puerto Rican on Long Island, I learned early what it means to be underestimated. The aptitude was always there; the world just needed convincing.</p>
<p>So I set out to prove it. At 31 I went back to school and earned an Associate of Applied Science in Network Technology, then stacked the certifications to back it: Cisco CCNA, CompTIA A+, Lean Six Sigma, ServiceNow, and Microsoft. Not because the work needed them, but because the world asked for proof.</p>
<p>A few people saw it before the paper did: <strong>Deena</strong>, <strong>Brian</strong>, and many others who bet on me early. Deena believed in me long before I had any proof. Brian gave me my first real opportunity. <strong>Mike Lombardo</strong>, the Mayor of ServiceNow, showed me the standard, and the GlideFast community he built showed me what it means to treat people right. I&rsquo;ve carried that into every engagement since, delivering on billion-dollar enterprise platforms.</p>
<p>Now I&rsquo;ve started my own: Omar Huertas LLC. Not for the biggest logo in the room, but for honest work, done right, for the people and teams the industry overlooks. <strong>Skill first. Honest work always.</strong></p>`;
const SIGN=`<p class="sign"><span class="sig">Omar Huertas</span><span class="role">Founder &amp; ServiceNow Architect</span></p>`;
const knowledge=[['k_2017_a','Knowledge 2017, Orlando','2017','Orlando'],['k_2017_b','Knowledge 2017, Orlando','2017','Orlando'],['k_2018_a','Knowledge 2018 expo hall, Las Vegas','2018','Las Vegas'],['k_2018_b','Knowledge 2018, Las Vegas','2018','Las Vegas'],['k_2019_a','Knowledge 2019 keynote, Las Vegas','2019','Las Vegas'],['k_2019_b','Knowledge 2019, Las Vegas','2019','Las Vegas'],['k_2022_a','Knowledge 2022, Las Vegas','2022','Las Vegas'],['k_2022_b','Knowledge 2022, Las Vegas','2022','Las Vegas'],['k_2023_a','Knowledge 2023 keynote, Las Vegas','2023','Las Vegas'],['k_2023_b','ARIA at Knowledge 2023, Las Vegas','2023','ARIA, Las Vegas'],['k_2026_b','Knowledge 2026 keynote, Las Vegas','2026','Las Vegas']];
const photo=([f,a,y,c])=>`<li><figure><img src="/assets/knowledge/${f}.jpg" alt="${esc(a)}" loading="lazy" decoding="async" width="800" height="533"><figcaption><b>${y}</b>${c}</figcaption></figure></li>`;
const expertise=[['CMDB &amp; CSDM','Class models, relationships, data quality, governance, and reconciliation that hold up.'],['ITSM','Incident, problem, change, request, and service portals tuned to how your teams actually work.'],['ITOM &amp; Discovery','Discovery readiness, MID Servers, credentials, cloud discovery, and service mapping.'],['HAM &amp; SAM','Hardware and software asset lifecycle, normalization, license optimization, audit readiness.'],['Source-to-Pay','Requests, approvals, POs, receiving, vendor lifecycle, and finance integration.'],['AI &amp; GenAI','Now Assist, virtual agent, and AI-driven workflows applied where they pay off.'],['Flow Designer','Flows, Script Includes, event-driven design, and automation that removes manual work.'],['Integrations &amp; APIs','REST/SOAP, IntegrationHub, spokes, and resilient integration architecture.'],['Service Mapping','Application service maps, traffic-based discovery, and dependency visibility for real service awareness.'],['Event Management','Event ingestion, alert correlation, and noise reduction tied to healthy CMDB and service models.'],['App Portfolio Management (APM)','Application rationalization, business capability mapping, and technology risk, aligned to CSDM.'],['Platform Governance','Standards, instance health, upgrade safety, technical debt, and scalable build practices.'],['SecOps','Security Operations: security incident response, vulnerability response, and CMDB-driven prioritization.']];
const RESULT=`<figure class="result" aria-labelledby="rs-cap"><div class="bars"><div class="bar"><span class="v">15<small>of 300</small></span><span class="k">Simulated attacks executed, no gate</span><span class="track"><i class="w5"></i></span></div><div class="bar zero"><span class="v">0<small>of 300</small></span><span class="k">Simulated attacks executed, with AgentGate</span><span class="track"><i class="w0"></i></span></div></div><figcaption id="rs-cap">Research preview, not a released product. AgentGate v0 baseline. One local model (gpt-oss:20b), 300 synthetic cases, non-adaptive attacks, one run per case. The gate&rsquo;s zero is measured with a simulated owner who approves only what the user asked for. Five percent is a weak-attacker number; adaptive attacks are expected to do more.</figcaption></figure>`;

const TRIBUTE=()=>sec('tribute',`<div class="tribute"><figure class="shot reveal"><video controls muted loop playsinline preload="none" aria-label="Tribute footage: Michael Lombardo, the Mayor of ServiceNow, dancing at ARIA during ServiceNow Knowledge" poster="/assets/tribute/mike_aria.jpg"><source src="/assets/tribute/mike_aria.mp4" type="video/mp4"><track kind="captions" src="/assets/tribute/mike_aria.vtt" srclang="en" label="English" default></video></figure>
<div class="reveal"><p class="eyebrow">In loving memory</p><h2 id="tb-h" class="h-section">Michael Vincent Lombardo</h2><p class="tr-role">The Mayor of ServiceNow, 1987&ndash;2024</p><div class="prose"><p>Mike didn&rsquo;t just build GlideFast. He built a <strong>community</strong>, and he made room in it for people like me. Completely self-made, impossibly generous, he gave talent a chance and made everyone feel like they mattered. I knew him. I learned from him. I carry what he gave me into everything I build.</p><p><strong>&ldquo;Our Mayor. Forever. We love you, Mike.&rdquo;</strong></p><p><strong>This company, and everything I build, is for his legacy.</strong> Mike, you gave so many of us the one chance we needed to become someone and shine in this space. We love you, we miss you, and you&rsquo;ll always be our Mayor, wherever we may land.</p></div><p class="sign"><span class="sig">Omar Huertas</span></p><div class="act"><span class="tag">#LombardoLegacy</span>${btn('https://www.joeandruzzifoundation.org','Support the Lombardo Legacy Fund')}</div></div></div>`,{label:'tb-h'});

// ----- the ServiceNow bento (home and services share it) -----
const BENTO=(links=true)=>{const L=(id,t)=>links?`<a class="stretch" href="/services.html#${id}">${t}</a>`:t;return `<div class="bento">
<article class="bcard span7 b-scoped reveal"><div class="ill ill-incl" aria-hidden="true"><ul class="incl"><li>Tables and ACLs</li><li>Flows and Flow Designer</li><li>ATF test suite</li><li>Update set</li><li>Docs and handover</li></ul></div><div class="txt"><h3>${L('development','Scoped applications')}</h3><p>Custom apps on the Now Platform, built in their own scope with proper tables, roles, ACLs and flows, covered by ATF suites and ready for Store or internal release.</p></div></article>
<article class="bcard span5 reveal"><div class="ill ill-mem" aria-hidden="true"><svg viewBox="0 0 220 150"><path d="M110 26 60 70M110 26 110 70M110 26 160 70M60 70 36 118M60 70 84 118M110 70 110 118M160 70 136 118M160 70 184 118M60 70 110 70M110 70 160 70"/><circle class="c" cx="110" cy="26" r="7"/><circle cx="60" cy="70" r="5"/><circle cx="110" cy="70" r="5"/><circle cx="160" cy="70" r="5"/><circle cx="36" cy="118" r="4"/><circle cx="84" cy="118" r="4"/><circle cx="110" cy="118" r="4"/><circle cx="136" cy="118" r="4"/><circle cx="184" cy="118" r="4"/><text class="lbl" x="122" y="30">Business service</text><text x="14" y="142">Servers</text><text x="100" y="142">Databases</text><text x="172" y="142">Network</text></svg></div><div class="txt"><h3>${L('cmdb','CMDB and discovery')}</h3><p>CSDM-aligned classes, identification and reconciliation rules, and service maps that show what depends on what.</p></div></article>
<article class="bcard span6 reveal"><div class="txt"><h3>${L('itom','ITSM and ITOM')}</h3><p>Incident, problem, change and event management shaped around your real process, and discovery that keeps the picture current.</p><ul class="pts"><li>Incident and problem</li><li>Change and release</li><li>Event management</li><li>Discovery and service mapping</li></ul></div></article>
<article class="bcard span6 reveal"><div class="ill ill-conn" aria-hidden="true"><span class="ring"></span><span class="ring r2"></span><span class="hub">ServiceNow</span><span class="n n1">REST</span><span class="n n2">MID server</span><span class="n n3">IntegrationHub</span><span class="n n4">Identity</span><span class="n n5">Cloud</span></div><div class="txt"><h3>${L('integration','Integrations')}</h3><p>REST and IntegrationHub spokes, MID servers and data pipelines, monitored, logged and documented.</p></div></article>
<article class="bcard span12 b-impl reveal"><div class="txt"><h3>${L('method','Implementation')}</h3><p>From discovery workshops to a clean go-live, with a handover your team can actually run.</p><ul class="pts"><li>Discovery</li><li>Build</li><li>Test</li><li>Go-live</li><li>Runbook and handover</li></ul></div></article>
</div>`};

// ----- HOME -----
function home(){
 const ann=homeAnnounce(SNAPPS);
 const body=`<section class="hero" id="top">
<div class="field" data-island="field" data-lazy="now" aria-hidden="true"><canvas></canvas></div>
<div class="grid-bg" aria-hidden="true"></div>
<div class="hero-in">
<a class="announce reveal" href="${ann.href}"><span class="dot" aria-hidden="true"></span>${ann.text}</a>
<h1 class="h-display reveal">ServiceNow,<br class="br"> <span class="ul">built properly.</span></h1>
<p class="lead reveal">Omar Huertas LLC designs and builds on the Now Platform: scoped applications, a CMDB you can trust, ITSM and ITOM that fit how your teams work, and integrations that survive the next upgrade.<span class="hide-s"> In scope, tested and documented before it goes live.</span></p>
<div class="cta reveal">${btn('/contact.html','Free 30-minute architecture review','btn btn-primary')}${btn('/servicenow-apps.html','ServiceNow Store apps','btn btn-ghost')}</div>
<p class="cta-note reveal">No cost, no commitment. You leave with notes on what we would change, whether or not we work together.</p>
<ol class="rail reveal" aria-label="Our delivery standard"><li class="i0"><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5"/></svg></i>Scoped</li><li class="i1"><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5"/></svg></i>Tested</li><li class="i2"><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5"/></svg></i>Documented</li><li class="i3"><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5"/></svg></i>Approved by you</li></ol>
</div>
${homeStage(SNAPPS)}
</section>

${homeStrip(SNAPPS)}

<section class="works" aria-label="What we work with"><div class="wrap"><p class="works-h">Working across the Now Platform</p><ul class="works-list"><li>Scoped applications</li><li>CMDB and CSDM</li><li>ITSM</li><li>ITOM and Discovery</li><li>IntegrationHub</li><li>Automated Test Framework</li><li>Store readiness</li><li><a href="/services.html">All services</a></li></ul></div></section>

${sec('services',`${head('ServiceNow','What we build on the Now Platform','Four kinds of work, one standard: in scope, tested, documented, and handed over so your team can run it without us.','sv-h')}${BENTO()}
<ol class="ledger" aria-label="Facts about the company"><li class="reveal"><b>2017</b><span>At ServiceNow Knowledge every year since</span></li><li class="reveal"><b>20<small>+</small></b><span>Years in IT and on the platform</span></li><li class="reveal"><b>6<small>+</small></b><span>ServiceNow certifications</span></li></ol>
<p class="note">Built by a ServiceNow architect who has delivered for some of the largest telecom carriers in the world. Engaged by leading ServiceNow partners for enterprise and government clients; clients are kept confidential by design. <a href="/services.html">All services</a>, <a href="/industries.html">industries</a>.</p>`,{label:'sv-h'})}

${CAPS}

${sec('how',`<p class="eyebrow reveal">How we work</p><p class="statement reveal" id="how-h">Small team, direct access. <b>Everything is built in scope</b> so upgrades stay boring. <b>Every change is tested</b> before it reaches production. <b>Nothing goes live without your approval</b>, and the documentation is part of the work, not an extra.</p>
<ul class="ways reveal"><li><a href="#webdesign"><strong>Web Design Studio</strong><span>Fast, accessible websites for small businesses, built and hosted with the same care.</span></a></li><li><a href="#lab"><strong>In development</strong><span>Obvera (IT operations platform), Albena (private local AI assistant) and AgentGate.</span></a></li><li><a href="/contact.html"><strong>Start a conversation</strong><span>Tell us what you are trying to get done on ServiceNow. We reply within a business day.</span></a></li></ul>`,{label:'how-h'})}

${PROOF}

${sec('webdesign',`<div class="split"><div class="head reveal"><p class="eyebrow">Web Design Studio</p><h2 id="wd-h" class="h-section">Websites, made with the same care</h2><p class="sub">Websites for small businesses, built with the discipline of our ServiceNow work: fast, accessible, secure, and scoped in writing before anything is built. Browse the live demos, see the price first, then start.</p>
<ol class="steps"><li><span class="num">1</span><div><h3>Start from a live demo</h3><p>Browse 54 live demo sites and pick the direction closest to your business.</p></div></li><li><span class="num">2</span><div><h3>See the price first</h3><p>Plans and an instant estimate before you commit to anything.</p></div></li><li><span class="num">3</span><div><h3>Scope agreed in writing</h3><p>Fast, accessible, secure sites on Cloudflare, with the scope settled up front.</p></div></li></ol>
<div class="act">${btn(STUDIO,'Visit the studio','btn btn-primary')}<a class="more" href="${STUDIO}demos">Browse the demos</a><a class="more" href="${STUDIO}work">See our work</a></div></div>
<div class="reveal"><figure class="shot">${pic('studio-work','The Web Design Studio: our work','(max-width:900px) 92vw, 600px')}</figure></div></div>`,{label:'wd-h'})}

${sec('lab',`${head('In development','One rule for AI that acts: nothing runs until you approve it','Three projects from our own lab. Real names, real status, nothing released yet. Each one is built around the same rule.','lab-h')}
<div class="lab-grid">
<article class="dossier wide reveal" id="obvera" aria-labelledby="ob-h"><div><p class="d-head"><span>Project 01</span>${stamp('In development')}</p><h3 id="ob-h">Obvera</h3><p class="lead">IT operations with a change record behind every action. Coming soon.</p><ul class="d-list"><li><b>One service for IT.</b><span>ITSM, MDM, procurement, security and data, instead of five tools.</span></li><li><b>Nothing changes off the record.</b><span>Requested, approved, executed, closed. Every write audited.</span></li><li><b>Built for small teams.</b><span>Small businesses, non-profits and growing teams.</span></li></ul><div class="act">${btn('/contact.html','Request early access','btn btn-primary')}<a class="more" href="/operations-platform.html">About Obvera</a></div></div>
<figure class="shot frosted">${stamp('In development')}${pic('obvera','Obvera, in development, shown behind frosted glass','(max-width:900px) 92vw, 560px')}</figure></article>
<article class="dossier reveal" id="albena" aria-labelledby="alb-h"><div><p class="d-head"><span>Project 02</span>${stamp('Coming soon')}</p><h3 id="alb-h">Albena</h3><p class="lead">A private AI assistant for your own hardware. It asks before anything that matters.</p><ul class="d-list"><li><b>Private by design.</b><span>Runs on your own Mac or NVIDIA hardware.</span></li><li><b>Asks before it acts.</b><span>Anything that spends, sends or unlocks waits for your yes.</span></li><li><b>Say it or click it.</b><span>Voice or portal. Same assistant, same rules.</span></li></ul><div class="act">${btn('https://albena.ai/waitlist','Request access','btn btn-primary')}<a class="more" href="https://albena.ai/">albena.ai</a></div></div></article>
<article class="dossier reveal" id="agentgate" aria-labelledby="ag-h"><div><p class="d-head"><span>Project 03</span>${stamp('Research preview','acc')}</p><h3 id="ag-h">AgentGate</h3><p class="lead">Prompt injection makes an agent act on text anyone can write. AgentGate makes being fooled harmless.</p><ul class="d-list"><li><b>Tiers come from a manifest.</b><span>Risk tiers are set in advance, never by the model.</span></li><li><b>Approval bound to the exact action.</b><span>One signed token, one payload, five minutes.</span></li><li><b>An independent check.</b><span>A separate verifier re-reads every write against the log.</span></li></ul>${RESULT}<p class="d-note">v0 research preview. Defensive only, run in a sandbox with synthetic data. Not yet released.</p><div class="act">${btn('/contact.html','Request research briefing')}</div></div></article>
</div>`,{label:'lab-h'})}

${sec('story',`<div class="split even"><div class="reveal"><p class="eyebrow">Our story</p><blockquote class="q" id="st-h">I was told no more times than I can count. The one yes that mattered didn&rsquo;t see a r&eacute;sum&eacute;. It saw a person. I&rsquo;ve carried that ever since.<cite>Omar Huertas, founder</cite></blockquote></div>
<div class="reveal">${SIGN}<p class="sub">Skill first. Honest work always. Former architect at top-tier ServiceNow partners, delivering on $1B+ platforms.</p><div class="act"><a class="more" href="/about.html">The full story, the values, and the road</a></div>
<details class="kmore" id="trusted"><summary>Partners, organizations and industries served</summary><dl class="rows-dl"><div><dt>Delivered for</dt><dd><ul class="inline-list"><li>Fortune 500 telecom</li><li>State government</li><li>Leading ServiceNow partners</li></ul><p>Platform-aligned guidance, proven build patterns, and a single accountable owner from design through delivery. Clients are kept confidential by design.</p></dd></div><div><dt>Partners &amp; organizations</dt><dd><ul class="inline-list"><li>ServiceNow</li><li><a href="https://blackwallstreetllc.org/" rel="noopener">Black Wall Street</a></li><li>Racial Equity Institute</li><li>Greensboro Civil Rights Museum</li><li>Local government</li></ul></dd></div><div><dt>Industries served</dt><dd><ul class="inline-list"><li>Telecommunications</li><li>Industrial distribution</li><li>Healthcare systems</li><li>Higher education</li><li>Manufacturing</li><li>Financial services &amp; banking</li><li>Building products distribution</li><li>Health insurance</li><li>Legal</li><li>Public sector</li></ul></dd></div></dl></details></div></div>`,{label:'st-h'})}

${TRIBUTE()}
${closing('Let&rsquo;s build something honest.','Start with a free 30-minute architecture review: bring a CMDB, integration or release problem and we will tell you plainly what we would do. No cost, no commitment.','Book the free review')}`;
 return page({path:'/index.html',bodyClass:'home',css:'snapps',title:'Omar Huertas LLC | ServiceNow, built properly',description:'Omar Huertas LLC is a Registered ServiceNow Build & Consulting Partner: scoped apps, CMDB, ITSM, ITOM and integrations. Plus a web design studio, and three projects in development: Obvera, Albena and AgentGate.',body});
}

// ----- the inner page opener -----
const phero=({eyebrow,h1,lead,aside='',act='',center=false})=>`<section class="phero${center?' center':''}" aria-labelledby="h1"><div class="wrap${aside?' has-aside':''}"><div>${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}<h1 id="h1" class="h-display">${h1}</h1>${lead?`<p class="lead">${lead}</p>`:''}${act?`<div class="act">${act}</div>`:''}</div>${aside?`<div class="aside">${aside}</div>`:''}</div></section>`;
const jump=items=>`<nav class="jump" aria-label="On this page">${items.map(([h,t])=>`<a href="#${h}">${t}</a>`).join('')}</nav>`;

// ----- SERVICES -----
function services(){
 const svc=[['cmdb','CMDB and CSDM Strategy','Define classes, relationships, ownership, data quality rules, lifecycle governance, reconciliation patterns, and reporting that make the CMDB useful.',['CMDB assessment and remediation plan','CSDM alignment and service modeling','Identification and reconciliation guidance']],['itom','ITOM Discovery and Service Mapping','Improve infrastructure visibility across servers, networks, cloud resources, applications, and services.',['MID Server and credential troubleshooting','Discovery schedule and pattern support','Service Mapping readiness and dependency strategy']],['integration','Integrations and Scripted REST APIs','Build safer inbound and outbound integrations with clear logging, header redaction, structured payloads, error handling, and supportable design.',['Scripted REST resources and Script Includes','Flow Designer and RESTMessageV2 automation','Event-driven and API-driven workflows']],['architecture','Platform Architecture and Health','Review platform design, reduce technical debt, improve maintainability, and document reusable architecture patterns.',['Design review and technical-debt map','Upgrade safety and instance health','Reusable architecture patterns']],['development','Custom Development','Build custom tables, applications, UI actions, business rules, flow actions, transform logic, and data processing tools.',['Scoped applications and tables','UI actions, business rules, flow actions','Transform logic and data tools']],['advisory','Advisory and Staff Augmentation','Provide senior-level guidance for projects, workshops, solution reviews, delivery planning, and complex technical troubleshooting.',['Workshops and solution reviews','Delivery planning','Complex troubleshooting']]];
 const entry=([id,h,p,ul])=>`<article class="bcard reveal" id="${id}"><div class="txt"><h2 class="h3">${h}</h2><p>${p}</p><ul class="pts">${ul.map(x=>`<li>${x}</li>`).join('')}</ul></div></article>`;
 const body=`${phero({eyebrow:'ServiceNow services',h1:'ServiceNow and IT services for enterprise delivery.',lead:'Engagements can be advisory, implementation-focused, troubleshooting-focused, or ongoing platform support. One senior architect, accountable end to end.',act:btn('/contact.html','Scope the work','btn btn-primary')+btn('#expertise','Thirteen disciplines','btn btn-ghost'),aside:jump([['areas','Service areas'],['cmdb','CMDB'],['itom','ITOM'],['integration','Integrations'],['development','Development'],['expertise','Expertise'],['method','Method'],['cost','Cost'],['digital','Digital studio']])})}
${sec('areas',`${head('Six service areas','What an engagement can cover','Each area stands alone, and they fit together. A clean CMDB makes event management meaningful; a scoped app is only useful if the data under it can be trusted.','ar-h')}<div class="bento">${svc.map(entry).join('')}</div>`,{label:'ar-h',cls:'first'})}
${sec('build',`${head('On the Now Platform','What we build','Four kinds of work, one standard: in scope, tested, documented, and handed over so your team can run it without us.','bd-h')}${BENTO(false)}`,{label:'bd-h'})}
${sec('expertise',`<div class="split"><div class="head reveal"><p class="eyebrow">Expertise</p><h2 id="ex-h" class="h-section">One platform, mastered end to end</h2><p class="sub">Deep, architect-led ServiceNow delivery across the thirteen disciplines that actually move the needle.</p><p class="note">Beyond the platform: Microsoft &amp; Windows Server, Active Directory, Linux, VMware, Cisco &amp; networking, CompTIA A+, software development, cloud (AWS &amp; Azure), scripting &amp; automation, and enterprise architecture. <a href="/about.html#roots">See the full foundation</a></p></div><dl class="rows-dl two reveal">${expertise.map(([t,d])=>`<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></div>`,{label:'ex-h'})}
${sec('method',`<div class="split"><div class="head reveal"><p class="eyebrow">How we work</p><h2 id="me-h" class="h-section">A method built on accountability</h2><p class="sub">From first assessment to long-term governance: one accountable partner, the whole way.</p></div>
<ol class="steps"><li class="reveal"><span class="num">1</span><div><h3>Assess</h3><p>We listen, audit the platform, and find what&rsquo;s really blocking value.</p></div></li><li class="reveal"><span class="num">2</span><div><h3>Architect</h3><p>CSDM-aligned, upgrade-safe design grounded in real implementation experience.</p></div></li><li class="reveal"><span class="num">3</span><div><h3>Automate</h3><p>We build: clean, documented, and engineered to last past go-live.</p></div></li><li class="reveal"><span class="num">4</span><div><h3>Govern</h3><p>Data quality, standards, and ownership that keep the platform healthy for years.</p></div></li></ol></div>
<h3 class="sr">Outcomes: what honest work delivers</h3><dl class="rows-dl cols outcomes reveal"><div><dt>Trust</dt><dd><h4>Configuration data you can rely on</h4>A CMDB that reflects reality, so every decision downstream is built on truth.</dd></div><div><dt>Speed</dt><dd><h4>Service-aware operations</h4>Automation and visibility that cut noise and shrink time-to-resolution.</dd></div><div><dt>Years</dt><dd><h4>Platforms that sustain value</h4>Built to stay healthy and scale, not to break at the next upgrade.</dd></div></dl>`,{label:'me-h'})}
${sec('cost',`${head('The cost of the wrong partner','Outsourcing is where value goes to die.','Billable armies and offshore handoffs quietly drain budget into overhead, coordination, and rework. <strong>We don&rsquo;t outsource, ever.</strong> One senior expert, accountable end to end.','co-h')}
<div class="cmp">${[['Budget that reaches real delivery','Outsourced / billable army','~40%',40,'~95%',95],['Senior experts on your actual work','Outsourced / offshore','~30%',30,'100%',100],['Knowledge that stays with you','Outsourced / churned teams','~45%',45,'~98%',98]].map(([h,a,av,aw,bv,bw])=>`<div class="reveal"><h3>${h}</h3><div class="cmp-row"><div class="top"><span>${a}</span><span class="v">${av}</span></div><span class="cmp-bar"><span class="bad w${aw}"></span></span></div><div class="cmp-row"><div class="top"><span>Omar Huertas LLC</span><span class="v">${bv}</span></div><span class="cmp-bar"><span class="good w${bw}"></span></span></div></div>`).join('')}</div>
<p class="note">Illustrative of the pattern we&rsquo;re repeatedly brought in to fix: no offshore handoffs, no junior churn, no lost knowledge.</p>
<ol class="ledger" aria-label="How we staff engagements"><li class="reveal"><b>0<small>%</small></b><span>Outsourced, ever</span></li><li class="reveal"><b>100<small>%</small></b><span>Senior, hands-on the work</span></li><li class="reveal"><b>1</b><span>Accountable owner, end to end</span></li></ol>`,{label:'co-h'})}
${sec('digital',`${head('Digital Studio','Websites, custom apps &amp; digital transformation','Beyond the ServiceNow platform, Omar Huertas LLC designs and builds the digital products businesses run on: fast, secure, accessible websites, native and web applications, and the assessments that chart the path forward.','dg-h')}
<div class="bento">
<article class="bcard reveal" id="web-design"><div class="ill ill-shot">${pic('studio-home','The Omar Huertas LLC Web Design Studio home page','(max-width:760px) 92vw, 400px')}</div><div class="txt"><h3><a class="stretch" href="${STUDIO}">Website Design &amp; Development</a></h3><p>Modern, high-performance sites built to enterprise standards, the way this one is. Custom design, no cookie-cutter templates.</p><ul class="pts"><li>Responsive, mobile-first design</li><li>WCAG 2.1 AA accessibility built in</li><li>SEO, performance &amp; security headers</li><li>Static or React / Next.js / TypeScript</li></ul></div></article>
<article class="bcard reveal" id="app-dev"><div class="ill ill-lock" aria-hidden="true"><svg viewBox="0 0 48 56"><rect x="6" y="22" width="36" height="30" rx="7"/><path d="M14 22v-6a10 10 0 0 1 20 0v6"/><circle cx="24" cy="37" r="3.5"/></svg><div class="lock-rows"><span>Native Apple apps</span><span>Secure cloud backends</span><span>App Store lifecycle</span></div></div><div class="txt"><h3>Custom App Development</h3><p>From idea to the App Store or the browser: native Apple apps and custom web applications, designed, built, and shipped.</p><ul class="pts"><li>Native iOS / iPadOS / macOS (SwiftUI)</li><li>Secure cloud backends &amp; integrations</li><li>Web apps &amp; internal business tools</li><li>App Store submission &amp; lifecycle</li></ul></div></article>
<article class="bcard reveal" id="dx-assessment"><div class="txt"><h3>Digital Transformation Assessments</h3><p>A clear-eyed review of your tools, processes, and data, with a prioritized roadmap and quick wins you can act on.</p><ul class="pts"><li>Current-state &amp; tool-sprawl analysis</li><li>Process, data &amp; automation opportunities</li><li>Platform &amp; architecture strategy</li><li>Prioritized roadmap with ROI</li></ul></div></article>
</div><div class="act">${btn('/contact.html','Scope a project','btn btn-primary')}<a class="more" href="${STUDIO}">Browse the studio and its 54 live demos</a></div>`,{label:'dg-h'})}
${closing('Scope the work, then we start.','A focused assessment, an integration design, a CMDB review or an advisory conversation.')}`;
 return page({path:'/services.html',bodyClass:'p-services',title:'Services | Omar Huertas LLC',description:'ServiceNow CMDB, ITOM, integrations, automation, platform architecture, and advisory services.',body});
}

// ----- ABOUT -----
function about(){
 const tl=[['Age 7','Built my first computer','My stepfather worked for Wang, Northern Telecom, and Oxford. Tech was in the house before I knew it was rare, on Long Island, where a Puerto Rican kid was told he didn&rsquo;t belong.'],['2004','Where it began: Deena','The real start, long before ServiceNow. Deena was the beginning of everything that came after.'],['Age 31','Back to school: degree and certifications','Earned an Associate of Applied Science in Network Technology, plus CCNA, A+, Lean Six Sigma, ServiceNow, and Microsoft. Proof on paper of what was always there.'],['2015','The first chance: Brian at DD','Brian didn&rsquo;t see where I came from. He saw the CCNA and the work, and took me for real. The first yes. I&rsquo;ve never forgotten it.'],['2017','First ServiceNow Knowledge, Orlando','Walked in as a nobody and fell in love with the platform and the community. Never missed a year since.'],['2018&ndash;2023','Architect at two top-tier ServiceNow partners','CMDB, ITOM, ITSM, integrations, and automation, delivered at real enterprise scale, year over year.'],['The mentor','Learned the standard from the Mayor','In the GlideFast community, Mike Lombardo, the Mayor of ServiceNow, gave talent a chance and treated everyone like they mattered. That became my standard.'],['$1B+','Trusted at carrier scale','Brought in by leading partners to deliver on billion-dollar platforms for some of the largest telecom carriers in the world.'],['2026, today','Founded Omar Huertas LLC','Registered ServiceNow Build Partner. Just registered, just beginning: betting on myself, and carrying the legacy forward.']];
 const values=[['Skill over stamps','The standard comes before the certifications. Talent earns the seat, nothing more, nothing less.'],['Honest, always','Blunt truth over comfortable lies. The true advisor who tells you what you need to hear, never the yes-man.'],['Get back up','Every fall is fuel. Quitting was never a luxury we had, and never will be.'],['Heart in the work','We give our whole heart, for the families and futures behind every project, not just the balance sheet.'],['Open the door','Someone bet on us when no one else would. Now we do the same: opportunity on merit, for the overlooked.'],['Results, not hours','One honest expert who delivers beats a room of billables. Proof over polish, every time.']];
 const body=`${phero({eyebrow:'Our story',h1:'From the back of the room to building my own.',lead:'The honest version: the pain, the people, and the purpose behind Omar Huertas LLC.',aside:jump([['story','The story'],['movement','The movement'],['values','Values'],['journey','The road'],['roots','Roots'],['advisor','The advisor'],['gratitude','Gratitude'],['knowledge','Knowledge'],['tribute','Mike']])})}
${sec('story',`<div class="split even"><div class="prose big reveal">${STORY_BODY}${SIGN}</div>
<div class="reveal" id="movement"><p class="eyebrow">Why we exist</p><h2 class="h-section" id="mv-h">More than a company. A movement.</h2><p class="sub">I was meant for this. Everything that tried to take me out failed, because there was purpose in it.</p><div class="prose"><p>Omar Huertas LLC isn&rsquo;t just consulting. It&rsquo;s a movement: to help the helpless, mentor the overlooked, and give hope to the ones who stopped believing they had it, because the world made them doubt their own truth and talent.</p><p>I started this because I&rsquo;ve watched it up close: a friend who outworks everyone, more than skilled, with a visa sponsorship held over his head like a leash, denied the break he earned. Talent should never be hostage to status, a name, or where you came from.</p><p><strong>We back the deserving. We give the shot. On skill, nothing more, nothing less.</strong></p></div>
<dl class="rows-dl"><div><dt>Help the helpless</dt><dd>Show up for the people the system leaves behind.</dd></div><div><dt>Mentor the overlooked</dt><dd>Lift the ones with the talent but not the break.</dd></div><div><dt>Give hope</dt><dd>Remind people their truth and talent are real.</dd></div><div><dt>Opportunity on merit</dt><dd>The shot goes to who earned it, not who holds the leverage.</dd></div></dl></div></div>`,{aria:'The story',cls:'first'})}
${sec('values',`${head('What we stand by','Core values, earned the hard way','Not a poster on a wall: values forged in the story behind this company.','val-h')}<div class="bento">${values.map(([t,d])=>`<article class="bcard reveal"><div class="txt"><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div>`,{label:'val-h'})}
${sec('journey',`<div class="split"><div class="head reveal"><p class="eyebrow">The journey</p><h2 id="jr-h" class="h-section">The road, honestly</h2><p class="sub">Nine moments that made the standard. Growth isn&rsquo;t a straight line.</p></div><ol class="steps tl">${tl.map(([n,h,p])=>`<li class="reveal"><span class="num yr">${n}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div>`,{label:'jr-h'})}
${sec('roots',`${head('Beyond ServiceNow','I grew up in IT','ServiceNow is where I specialize, but the foundation runs deep. Servers, networks, virtualization, and code, long before the platform. I didn&rsquo;t realize not everyone grew up with computers until I was nearly 30.','ro-h')}<ul class="pills reveal"><li>Microsoft / Windows Server</li><li>Active Directory</li><li>Linux</li><li>VMware</li><li>Cisco / Networking</li><li>CompTIA A+</li><li>Software development</li><li>Cloud (AWS &amp; Azure)</li><li>Scripting &amp; automation</li><li>Systems administration</li><li>Virtualization</li><li>Enterprise architecture</li></ul>`,{label:'ro-h'})}
${sec('advisor',`<div class="split even"><div class="reveal"><p class="eyebrow">Why me</p><h2 id="ad-h" class="h-section">Not your typical consultant</h2><div class="prose" style-note=""><p>People might look at me twice. My spelling isn&rsquo;t perfect, my grammar&rsquo;s off, and I don&rsquo;t own the fanciest suit. I&rsquo;m just me: <strong>real, blunt, and honest.</strong> Not the yes-man. The true advisor who tells you what you actually need to hear.</p><p>But when you see the digital transformation, the vision, the solution working, you&rsquo;ll know you made the right call. You don&rsquo;t need a room full of billable consultants to prove a solution. You need the <strong>right person</strong> who can architect it live, in a workshop, remote and focused, and get the mission done.</p></div><blockquote class="q">I&rsquo;m your guy. Proof that one honest expert beats a room of hours. Unorthodox? Maybe. Effective? Every time.</blockquote></div>
<div class="reveal"><p class="sub">I&rsquo;m not the norm, and that&rsquo;s exactly the point.</p><dl class="rows-dl"><div><dt>Never a yes-man</dt><dd>A blunt, honest advisor.</dd></div><div><dt>Remote-first</dt><dd>Laser-focused, no travel theatre.</dd></div><div><dt>Vision to solution</dt><dd>Turned into a working solution, not a deck.</dd></div><div><dt>No room of billables</dt><dd>One accountable expert.</dd></div><div><dt>Live, in a workshop</dt><dd>Solutioning right there, on the instance.</dd></div><div><dt>Mission-first</dt><dd>Every engagement.</dd></div></dl></div></div>`,{label:'ad-h'})}
${sec('gratitude',`${head('Gratitude','I didn&rsquo;t get here alone','The ones who opened doors and showed me the standard. I carry every one of you forward.','gr-h')}<ul class="people reveal"><li><b>Brian</b><span>The first yes, 2015</span></li><li><b>Deena</b><span>Where it began. Believed when it counted</span></li><li><b>Ryan</b><span>Believed when it counted</span></li><li><b>Rob</b><span>Believed when it counted</span></li><li><b>Benker</b><span>The challenge that sharpened me</span></li><li><b>David</b><span>Believed when it counted</span></li><li class="mike"><a href="#tribute"><b>Mike Lombardo</b><span>The Mayor of ServiceNow</span></a></li></ul>`,{label:'gr-h'})}
${sec('knowledge',`${head('In the community since 2017','At ServiceNow Knowledge, every year','Not a logo on a page: in the room. From Orlando 2017 to Las Vegas 2026, learning the platform where it&rsquo;s shaped.','kn-h')}
<figure class="kfeature reveal"><img src="/assets/knowledge/k_2026_a.jpg" alt="ServiceNow Knowledge 2026 keynote, Las Vegas" loading="lazy" decoding="async" width="1600" height="1067"><figcaption><b>ServiceNow Knowledge 2026,</b> Las Vegas. Back from the platform&rsquo;s biggest stage: AI, the Now Platform, and where ServiceNow is headed next.</figcaption></figure>
<ul class="photos reveal">${knowledge.slice(0,3).map(photo).join('')}</ul><details class="kmore"><summary>All ${knowledge.length} photos, 2017 to 2026</summary><ul class="photos">${knowledge.slice(3).map(photo).join('')}</ul></details>`,{label:'kn-h'})}
${TRIBUTE()}
${closing('Let&rsquo;s build something honest.','Start with a free 30-minute architecture review: bring a CMDB, integration or release problem and we will tell you plainly what we would do. No cost, no commitment.','Book the free review')}`.replace(' style-note=""','');
 return page({path:'/about.html',bodyClass:'p-about',title:'Our Story | Omar Huertas LLC',description:'The story behind Omar Huertas LLC: skill first, honest work, and the people who opened doors. WCAG 2.1 AA, keyboard support, captions, and a built-in accessibility toolbar.',body});
}

// ----- OBVERA (in development) -----
function obvera(){
 const body=`${phero({eyebrow:`Obvera ${stamp('In development')}`,h1:'IT operations with a change record behind every action.',lead:'One service for ITSM, MDM, procurement, security and data, built for small businesses, non-profits and growing teams. In development; not yet generally available. Coming soon.',act:btn('/contact.html','Request early access','btn btn-primary')+btn('/services.html','Our ServiceNow services','btn btn-ghost'),aside:`<figure class="shot frosted">${stamp('In development')}${pic('obvera','Obvera, in development, shown behind frosted glass','(max-width:960px) 92vw, 560px',{eager:true})}</figure>`})}
${sec('how',`<div class="split"><div class="head reveal"><p class="eyebrow">How it works</p><h2 id="ob-h" class="h-section">Nothing changes off the record</h2><p class="sub">Each change is requested, approved by a person, executed once and closed, and every write is audited. The record is not a report written afterwards; it is the thing that lets the change run at all.</p></div>
<ol class="steps"><li class="reveal"><span class="num">1</span><div><h3>Request</h3><p>Risk and rollback are written down before anything moves.</p></div></li><li class="reveal"><span class="num">2</span><div><h3>Approve</h3><p>A person says yes. High-risk actions also need a PIN.</p></div></li><li class="reveal"><span class="num">3</span><div><h3>Execute</h3><p>Once, exactly as approved. Change one character and it fails.</p></div></li><li class="reveal"><span class="num">4</span><div><h3>Audit</h3><p>Recorded, closed, and reviewable later by anyone with the right role.</p></div></li></ol></div>`,{label:'ob-h',cls:'first'})}
${sec('covers',`${head('What it covers','One service instead of five tools','Obvera works alongside ServiceNow, which remains our core practice.','ob2-h')}<div class="bento">${[['ITSM','Incidents, requests and changes in one place.'],['MDM','Endpoint and device management.'],['Procurement','Requests, approvals and purchasing.'],['Security','Controls and evidence that stay with the record.'],['Data','One source of truth for assets and people.'],['Status','In development. Not yet generally available.']].map(([t,d],i)=>`<article class="bcard reveal"><div class="txt"><h3>${t}${i===5?' '+stamp('Coming soon'):''}</h3><p>${d}</p></div></article>`).join('')}</div>`,{label:'ob2-h'})}
${closing('Want early access to Obvera?','Tell us about your team and what you run today. We will reply personally.','Request early access')}`;
 return page({path:'/operations-platform.html',bodyClass:'p-obvera',title:'Obvera | IT operations platform, in development | Omar Huertas LLC',description:'Obvera is our IT operations platform, in development: ITSM, MDM, procurement, security and data with a change record behind every action. Early access coming soon.',body});
}

// ----- INDUSTRIES -----
function industries(){
 const ind=[['Government and Public Sector','CMDB governance, secure workflows, documentation, asset visibility, and service delivery patterns for accountable operations.',['Accountability','Secure workflows','Asset visibility']],['Healthcare','Platform support for operational resilience, incident response, service visibility, and structured data management.',['Resilience','Incident response','Structured data']],['Financial and Legal Services','Workflow discipline, auditability, asset tracking, integration controls, and reliable reporting for service operations.',['Auditability','Integration controls','Reporting']],['Enterprise Technology','Architecture support for complex environments with integrations, cloud resources, MID Servers, and large-scale CMDB requirements.',['Integrations','Cloud resources','Large-scale CMDB']]];
 const body=`${phero({eyebrow:'Industries',h1:'Support for organizations that depend on strong IT operations.',lead:'ServiceNow work is most valuable when it matches the way each industry manages risk, compliance, assets, services, and operational change.'})}
${sec('environments',`<div class="bento">${ind.map(([h,p,t])=>`<article class="bcard span6 reveal"><div class="txt"><h2 class="h3">${h}</h2><p>${p}</p><ul class="pts">${t.map(x=>`<li>${x}</li>`).join('')}</ul></div></article>`).join('')}</div><p class="note">Also served: telecommunications, industrial distribution, higher education, manufacturing, building products distribution, and health insurance.</p>`,{aria:'Industries',cls:'first'})}
${closing('Need a ServiceNow partner for a specialized environment?','Engagements can be shaped around assessments, project delivery, technical leadership, or platform rescue work.','Discuss your environment')}`;
 return page({path:'/industries.html',bodyClass:'p-ind',title:'Industries | Omar Huertas LLC',description:'ServiceNow consulting for government, healthcare, financial, legal, and enterprise technology environments.',body});
}

// ----- APPS: the App Store showcase (data: src/content/apps.json; icons and previews are self-hosted in assets/apps) -----
async function apps(site=''){
 const list=await json('apps');
 const genres=[...new Set(list.map(a=>a.genre))];
 const gid=g=>'g-'+g.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const card=a=>{const nm=esc(a.name);return `<li class="app" data-genre="${gid(a.genre)}"><article class="app-card"><div class="app-top"><img class="app-ico" src="/assets/apps/${a.id}.jpg" width="96" height="96" alt="${nm} app icon" loading="lazy" decoding="async"><div><h3>${nm}</h3><p class="app-genre">${esc(a.genre)}</p></div></div><p class="app-desc">${esc(a.desc)}</p>${a.video?`<video class="app-vid" muted playsinline loop controls preload="none" poster="/assets/apps/video/${a.id}.jpg" width="332" height="720" aria-label="${nm} app preview video, no audio"><source src="/assets/apps/video/${a.id}.mp4" type="video/mp4">Your browser cannot play this preview. <a href="${a.url}">See it on the App Store</a>.</video>`:''}<a class="btn btn-sm app-dl" href="${a.url}" rel="noopener" aria-label="Download on the App Store: ${nm}">Download on the App Store</a></article></li>`};
 const chips=`<div class="chips" role="group" aria-label="Filter apps by category" data-chips hidden><button type="button" class="fchip" aria-pressed="true" data-g="all">All <span>${list.length}</span></button>${genres.map(g=>`<button type="button" class="fchip" aria-pressed="false" data-g="${gid(g)}">${esc(g)} <span>${list.filter(a=>a.genre===g).length}</span></button>`).join('')}</div>`;
 const jumpNav=`<nav class="jump nojs-only" aria-label="Categories">${genres.map(g=>`<a href="#${gid(g)}">${esc(g)}</a>`).join('')}</nav>`;
 const groups=genres.map(g=>`<section class="app-group" id="${gid(g)}" data-group="${gid(g)}" aria-labelledby="${gid(g)}-h"><h2 class="h3" id="${gid(g)}-h">${esc(g)}</h2><ul class="app-grid" role="list">${list.filter(a=>a.genre===g).map(card).join('')}</ul></section>`).join('');
 const body=`${phero({eyebrow:'Apps',h1:'Apps we have shipped to the App Store.',lead:`${list.length} apps for iPhone, iPad and Mac, built and published by Omar Huertas LLC. No trackers on this page; every icon and preview is hosted here.`})}
${sec('apps',`${chips}${jumpNav}<p class="app-count" role="status" aria-live="polite" data-count hidden></p>${groups}<p class="note">App Store and the Apple logo are trademarks of Apple Inc. Apps listed are live on the App Store at the time of publishing. Availability varies by country.</p>`,{aria:'App catalog',cls:'first'})}
${closing('Need an app built, or a platform behind it?','We design, build and publish apps, and connect them to the systems your business already runs on.','Start a conversation')}`;
 return page({path:site?'/index.html':'/apps.html',bodyClass:'p-apps',script:'apps',title:site?'Apple apps | Omar Huertas LLC':'Apps | Omar Huertas LLC',description:`${list.length} apps from Omar Huertas LLC on the App Store: utilities, developer tools, education, health and more, for iPhone, iPad and Mac.`,body,site});
}

// ----- SUPPORT -----
function support(){
 const body=`${phero({eyebrow:'Support',h1:'Need help? We&rsquo;ve got you.',lead:'Whether you&rsquo;re an active client, evaluating a project, or just stuck on something in ServiceNow, here&rsquo;s how to reach Omar Huertas LLC and what to expect.',center:true})}
<section class="sec first" aria-label="Support"><div class="wrap support-grid"><div>
<div class="ways reveal"><a href="mailto:${EMAIL}?subject=Support%20Request"><strong>Email support</strong><span>Fastest way to reach us. ${EMAIL}</span></a><a href="#support-form"><strong>Open a request</strong><span>Describe your issue and send it straight to our inbox.</span></a><a href="/servicenow-lexicon/"><strong>Self-serve answers</strong><span>Learn the platform and decode the jargon in our free guide.</span></a></div>
<h2 id="faq-h" class="h-section" style-note="">Quick answers</h2>
<details class="faq" open><summary>I&rsquo;m an existing client. How do I get help?</summary><p>Email us at ${EMAIL} with your name, organization, and a description of the issue. Include screenshots or the instance/record where it occurs when you can.</p></details>
<details class="faq"><summary>Do you offer ServiceNow advisory if I&rsquo;m not a client yet?</summary><p>Yes. Start a conversation and we&rsquo;ll scope the right kind of help: build, consulting, implementation, or a quick advisory session.</p></details>
<details class="faq"><summary>What information should I include in a request?</summary><p>What you were doing, what you expected, what actually happened, and any error text. The more context, the faster we can help.</p></details>
<details class="faq"><summary>Where can I learn ServiceNow basics myself?</summary><p>Our free, plain-English <a href="/servicenow-lexicon/">ServiceNow Lexicon</a> explains what the platform is, every major module, and the acronyms. No login required.</p></details>
<div class="times panel" id="response"><h3>Response times</h3><dl class="rows-dl"><div><dt>General questions</dt><dd>Replies typically within <strong>1 business day</strong>.</dd></div><div><dt>Active project &amp; client requests</dt><dd>Prioritized per your engagement, usually <strong>same business day</strong>.</dd></div><div><dt>Production-down / urgent</dt><dd>Mark your email subject <strong>URGENT</strong> and we&rsquo;ll respond as a priority.</dd></div></dl><p class="fine">Hours: Monday&ndash;Friday. Response targets are guidelines, not contractual SLAs unless specified in your engagement agreement.</p></div>
</div>
<aside class="contact" id="support-form" aria-labelledby="sf-h"><h2 id="sf-h">Open a support request</h2><p class="cl">Sends straight to our inbox. For urgent production issues, put <strong>URGENT</strong> in your message.</p>${form({subject:'Support Request — dbaomarhuertasllc.com',org:'Organization',priority:true,msgLabel:'How can we help?',placeholder:'Describe what you need help with: what happened, what you expected, and any error text',submit:'Send support request',redirect:'/support.html',note:'A real person reads every message.'})}</aside>
</div></section>`.replace(' style-note=""','');
 return page({path:'/support.html',bodyClass:'p-support',title:'Support | Omar Huertas LLC',description:'Get support from Omar Huertas LLC: ServiceNow and IT consulting help, response times, FAQs, and a support request form.',body});
}

// ----- CONTACT -----
function contact(){
 const body=`<section class="phero" aria-labelledby="h1"><div class="wrap support-grid"><div><p class="eyebrow">Contact</p><h1 id="h1" class="h-display">Start a ServiceNow or IT consulting conversation.</h1><p class="lead">Use the form to describe your platform challenge, project need, or advisory request. Replies come from Omar, by email.</p>
<dl class="kv"><div><dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div><div><dt>Service areas</dt><dd>ServiceNow architecture, CMDB, ITOM, integrations, automation, and IT consulting.</dd></div><div><dt>Existing clients</dt><dd><a href="/support.html">Support for existing clients</a></dd></div><div><dt>From</dt><dd>${CITY}</dd></div></dl></div>
<div class="contact"><h2 class="sr">Send an inquiry</h2>${form({})}</div></div></section>
<div class="wrap"><p class="note" aria-hidden="true"></p></div>`;
 return page({path:'/contact.html',bodyClass:'p-contact',title:'Contact | Omar Huertas LLC',description:'Contact Omar Huertas LLC for ServiceNow and IT consulting services.',body});
}

// ----- SECURITY -----
function security(){
 const controls=[['Encryption everywhere','TLS 1.2+ in transit and encryption at rest. The website enforces HTTPS with HSTS and a strict set of security headers (CSP, anti-clickjacking, MIME-sniffing protection).'],['Strong access control','Least-privilege access, multi-factor authentication on every critical account, SSH keys over passwords, and secrets kept in a dedicated credential vault, never in code or chat.'],['Backups &amp; recovery','Encrypted, off-host backups of critical systems with restores tested regularly, so data and services can be recovered quickly.'],['Secure development','Version-controlled code with secret scanning, reviewed and tested changes, dependency checks, and least-privilege service accounts.'],['Client-system discipline','On your platform we use your credentials, honor your security policies, take only the access the work requires, and return or rotate it when the engagement ends.'],['Incident response','A documented plan with severity levels, defined breach-notification timelines, and an evidence-preservation runbook, so a bad day is handled, not improvised.']];
 const body=`${phero({eyebrow:'Trust &amp; security',h1:'Your data, handled with care.',lead:'Omar Huertas LLC is built and run by a security-first ServiceNow architect. Security and privacy aren&rsquo;t an afterthought: they&rsquo;re how we work, on our own systems and on yours.',aside:jump([['controls','Controls'],['privacy','Privacy'],['compliance','Compliance'],['disclosure','Disclosure']])})}
${sec('controls',`${head('Security controls','How we protect information','','sc-h')}<div class="bento">${controls.map(([t,d])=>`<article class="bcard reveal"><div class="txt"><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div>`,{label:'sc-h',cls:'first'})}
${sec('privacy',`${head('Privacy &amp; data protection','What we collect, and what we don&rsquo;t','','pv-h')}<dl class="rows-dl two reveal">
<div><dt>Data minimization</dt><dd>We collect only what&rsquo;s needed. Website forms capture just your name, email, and message; our apps are built privacy-first with minimal data.</dd></div>
<div><dt>Payments stay with the processor</dt><dd>Card payments are handled by Stripe&rsquo;s hosted checkout. Raw card data never touches our systems (PCI&nbsp;DSS&nbsp;SAQ&nbsp;A scope).</dd></div>
<div><dt>Your privacy rights</dt><dd>We don&rsquo;t sell or share your personal information. You can request access, correction, or deletion of your data anytime: email <a href="mailto:${EMAIL}?subject=Data%20Request">${EMAIL}</a>.</dd></div>
<div><dt>Children&rsquo;s apps</dt><dd>Our kids&rsquo; education apps are data-minimal: no behavioral advertising, no third-party tracking, and parental consent before any personal data is collected (COPPA-aligned).</dd></div>
<div><dt>Cookies &amp; tracking</dt><dd>This website uses only essential, first-party cookies needed for it to function. We don&rsquo;t use advertising cookies or cross-site tracking, so there&rsquo;s no consent wall to click through.</dd></div></dl>
<p class="note"><a href="/privacy-policy.html">Read the full Privacy Policy</a>, the <a href="/terms.html">Terms</a>, <a href="/legal.html">Legal notices</a> and the <a href="/accessibility.html">Accessibility statement</a>.</p>`,{label:'pv-h'})}
${sec('compliance',`${head('Compliance posture','Standards we hold ourselves to','','cp-h')}<div class="bento">${[['Web security','HTTPS, HSTS, CSP, security headers','In place','green'],['Accessibility','WCAG 2.1 AA','Designed to conform','green'],['Privacy','CCPA/CPRA &amp; GDPR principles','Aligned','green'],['Payments','PCI DSS (SAQ A via Stripe)','In scope &amp; maintained','green'],['Children&rsquo;s privacy','COPPA (kids&rsquo; apps)','Aligned','green'],['SOC 2 / ISO 27001 / NIST 800-171','Control foundation in place; formal attestation available on request for qualifying engagements','On request','amber']].map(([t,d,st,c])=>`<article class="bcard reveal"><div class="txt"><p class="d-head"><span class="chip ${c}">${st}</span></p><h3>${t}</h3><p>${d}</p></div></article>`).join('')}</div>
<p class="note">Our controls are aligned with SOC 2, ISO 27001, and CMMC criteria. We hold no third-party certifications or attestations for these frameworks yet; we maintain the underlying controls and policy documentation and will pursue formal attestation as client engagements require. HIPAA-regulated work is supported only under a signed Business Associate Agreement.</p>`,{label:'cp-h'})}
${sec('disclosure',`<div class="split"><div class="head reveal"><p class="eyebrow">Responsible disclosure</p><h2 id="rd-h" class="h-section">Found a security issue?</h2><p class="sub">We welcome responsible disclosure. If you believe you&rsquo;ve found a vulnerability in our website or apps, please email <a href="mailto:${EMAIL}?subject=Security%20Disclosure">${EMAIL}</a> with the details and steps to reproduce. Please give us a reasonable chance to investigate and remediate before any public disclosure. We&rsquo;re grateful for the help, and we&rsquo;ll keep you updated.</p><div class="act">${btn(`mailto:${EMAIL}?subject=Security%20Disclosure`,'Report a security issue','btn btn-primary')}<a class="more" href="/.well-known/security.txt">security.txt</a></div></div></div>`,{label:'rd-h'})}`;
 return page({path:'/security.html',bodyClass:'p-security',title:'Trust & Security | Omar Huertas LLC',description:'How Omar Huertas LLC protects data: security controls, privacy, and compliance posture for clients and partners.',body});
}

// ----- the old /apps.html: the catalog moved to appleapps.dbaomarhuertasllc.com (_redirects 301s it; this stub is the fallback) -----
const appsMoved=()=>`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#02202f">
<meta name="color-scheme" content="dark">
<meta http-equiv="refresh" content="0; url=${APPS_URL}">
<title>Apps have moved | Omar Huertas LLC</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${APPS_URL}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/site.css?v=${CSSV}">
</head>
<body class="p-err">
<main id="main" tabindex="-1">${sec('',`<div class="center"><h1 class="h-display">Our Apple apps have moved.</h1><p class="lead">The App Store catalog now lives at <a href="${APPS_URL}">appleapps.dbaomarhuertasllc.com</a>.</p><div class="act">${btn(APPS_URL,'Open the Apple apps','btn btn-primary')}${btn('/','Back to Omar Huertas LLC','btn btn-ghost')}</div></div>`,{cls:'first'})}</main>
</body>
</html>
`;

// ----- 404 -----
function notFound(site=''){
 const body=`${phero({eyebrow:'404',h1:'That page could not be found.',lead:'The page may have moved or the address may be incorrect. Try the menu, press <kbd>&#8984;</kbd><kbd>K</kbd> to jump anywhere, or start over at home.',act:btn('/','Return home','btn btn-primary')+`<a class="more" href="/servicenow-lexicon/">Open the ServiceNow Lexicon</a>`,center:true})}
${sec('',`<ul class="ways"><li><a href="/services.html"><strong>ServiceNow services</strong><span>Scoped apps, CMDB, ITSM and ITOM, integrations.</span></a></li><li><a href="/about.html"><strong>About</strong><span>The story behind the standard.</span></a></li><li><a href="/contact.html"><strong>Contact</strong><span>Start a conversation. Replies within a business day.</span></a></li></ul>`,{aria:'Where to go next',cls:'first'})}`;
 return page({path:'/404.html',bodyClass:'p-err',title:'Page Not Found | Omar Huertas LLC',description:'Page not found.',body,site});
}

// ----- DOCUMENT PAGES (legal, privacy, terms, accessibility): a contents rail and the text -----
const slug=s=>s.toLowerCase().replace(/&[a-z]+;/g,'').replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function docPage({path,file,title,description,kind}){
 return async()=>{
  const {pages}=await json(file);
  const cover=pages[0].html;
  const eyebrow=(cover.match(/c-eyebrow">([\s\S]*?)<\/div>/)||[])[1]||'';
  const h1=((cover.match(/<h1>([\s\S]*?)<\/h1>/)||[])[1]||title).replace(/<span class="accent">([\s\S]*?)<\/span>/,'$1');
  const sub=(cover.match(/c-sub">([\s\S]*?)<\/p>/)||[])[1]||'';
  const updated=(cover.match(/cm-rel">([\s\S]*?)<\/div>/)||[])[1]||'';
  const inner=pages.slice(1,-1).filter(p=>!/>Contents<\/h1>/.test(p.html)).map(p=>p.html).join('\n');
  const back=pages[pages.length-1].html;
  let n=0;const toc=[];
  const withIds=inner.replace(/<h2>([\s\S]*?)<\/h2>/g,(m,t)=>{const id=slug(t)||'s'+(++n);const tt=t.replace(/^\s*\d+\.\s*/,'');toc.push([id,tt]);return `<h2 id="${id}">${tt}</h2>`})
   .replace(/<ul>(\s*(?:<li>(?:[^<]|<\/?(?:strong|em|b|i|code)>){3,260}<\/li>\s*){5,})<\/ul>/g,'<ul class="feat">$1</ul>');
  const sections=withIds.split(/(?=<h2 id=)/).map(x=>x.trim()).filter(Boolean).map(x=>`<section class="doc-sec">${x}</section>`).join('\n');
  const end=`<section class="doc-end">${back.replace(/class="bc-cta"/,'class="btn btn-primary"').replace(/<div class="bc-foot">[\s\S]*?<\/div>/,'').replace(/<div class="c-top">[\s\S]*?<\/div>/,'')}</section>`;
  const [k,when]=eyebrow.split('&middot;').map(s=>s.trim());
  const body=`${phero({eyebrow:`${kind||k||'Document'}${when&&/\d{4}/.test(when)?` <span class="chip">${when}</span>`:''}`,h1,lead:sub})}
<div class="wrap doc"><details class="toc"><summary>Contents</summary><ol>${toc.map(([id,t])=>`<li><a href="#${id}">${t}</a></li>`).join('')}</ol><div class="meta"><span>${updated}</span><span>${toc.length} sections</span><span>&copy; ${new Date().getFullYear()} Omar Huertas LLC</span></div></details><script>if(innerWidth>=1100)document.currentScript.previousElementSibling.open=true</script><article class="doc-body">${sections}${end}</article></div>`;
  return page({path,title,description,body,bodyClass:'doc-page'});
 };
}

// ----- THE LEXICON: a reference index with search -----
const GROUPS=[['Foundations',0,12],['CMDB &amp; ITOM',12,24],['ITSM',24,36],['ITAM &amp; Source-to-Pay',36,48],['HR, customer &amp; field service',48,61],['Security, risk &amp; compliance',61,73],['Building on the platform',73,80],['AI &amp; analytics',80,85],['Business &amp; career',85,96],['Glossary',96,98]];
async function lexicon(){
 const {pages}=await json('servicenow-lexicon');
 const cover=pages[0],back=pages[pages.length-1],entries=pages.slice(1,-1);
 const sub=(cover.html.match(/c-sub'>([\s\S]*?)<\/p>/)||[])[1]||'';
 const rel=(cover.html.match(/cm-rel'>([\s\S]*?)<\/div>/)||[])[1]||'';
 const demote=h=>h.replace(/<h3>/g,'<h4>').replace(/<\/h3>/g,'</h4>').replace(/<h2>/g,'<h3>').replace(/<\/h2>/g,'</h3>').replace(/<h1>/g,'<h2>').replace(/<\/h1>/g,'</h2>').replace(/<span class='eyebrow'>([^<]*)<\/span>/g,(m,t)=>`<span class="eyebrow">${t.charAt(0)+t.slice(1).toLowerCase()}</span>`);
 const used=new Set();const ids=entries.map(e=>{let id=slug(e.doc)||'p';let k=id,i=2;while(used.has(k))k=id+'-'+i++;used.add(k);return k});
 const titleOf=e=>((e.html.match(/<h1>([\s\S]*?)<\/h1>/)||[])[1]||e.doc).replace(/<[^>]+>/g,'');
 const groupOf=i=>GROUPS.find(([,a,b])=>i>=a&&i<b)?.[0]||'';
 const toc=GROUPS.map(([g,a,b])=>`<li><b><a href="#g-${slug(g)}">${g}</a></b><ol>${entries.slice(a,b).map((e,j)=>`<li><a href="#${ids[a+j]}">${titleOf(e)}</a></li>`).join('')}</ol></li>`).join('');
 const articles=entries.map((e,i)=>{const g=groupOf(i);const gi=GROUPS.findIndex(x=>x[0]===g);const first=GROUPS[gi]&&GROUPS[gi][1]===i;const inner=demote(e.html).replace(/<h2>[\s\S]*?<\/h2>/,'');return `${first?`<h2 class="lex-group" id="g-${slug(g)}">${g}</h2>`:''}<details class="lex" id="${ids[i]}" data-k="${esc((e.doc+' '+e.html.replace(/<[^>]+>/g,' ')).toLowerCase().replace(/\s+/g,' ').slice(0,320))}"${i===0?' open':''}><summary><span class="lex-doc">${titleOf(e)}</span><span class="lex-title">${e.doc.charAt(0)+e.doc.slice(1).toLowerCase()}</span><span class="lex-n">${i+1}</span></summary><div class="lex-paper">${inner}</div></details>`}).join('\n');
 const backHtml=back.html.replace("<a class='bc-cta'>Work with us &rarr;</a>",`<p>${btn('/contact.html','Work with us','btn btn-primary')}</p>`).replace(/<h2>/,'<h2 id="end">');
 const body=`${phero({eyebrow:'The field guide',h1:'The ServiceNow Lexicon',lead:sub,center:true,aside:''})}
<div class="wrap"><form class="lex-search" role="search" data-lexicon-search><label for="lex-q">Find a term</label><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/></svg><input id="lex-q" type="search" placeholder="CMDB, CSDM, MID Server, Now Assist…" autocomplete="off"><p class="small" data-lexicon-count>${entries.length} chapters. Type to filter; press <kbd>/</kbd> to jump here.</p><p class="small doc-meta">An educational guide by Omar Huertas LLC. ${rel}.</p></form></div>
<div class="wrap lex-layout"><details class="lex-toc"><summary>Chapters</summary><ol class="lex-groups">${toc}</ol></details><script>if(innerWidth>=1100)document.currentScript.previousElementSibling.open=true</script><div class="lex-body">${articles}<p class="lex-empty" hidden>No chapter matches. Try a shorter word, like &ldquo;asset&rdquo; or &ldquo;flow&rdquo;.</p><section class="lex-back" aria-labelledby="end">${backHtml}</section></div></div>`;
 LEX_PAL=entries.map((e,i)=>['/servicenow-lexicon/#'+ids[i],titleOf(e),'lexicon']);
 return page({path:'/servicenow-lexicon/index.html',script:'lexicon',title:'The ServiceNow Lexicon | Omar Huertas LLC',description:'What ServiceNow is, what it does, every acronym and module decoded, and why your company needs it. In plain English. A free guide by Omar Huertas LLC.',body,bodyClass:'doc-page'});
}

// ----- ServiceNow Store apps (data-driven) -----
const snApp=a=>()=>{const m=snAppMeta(a);return page({path:appUrl(a),bodyClass:'p-uc',css:'snapps',title:m.title,description:m.description,body:snAppBody(a),...(m.ogImage?{ogImage:m.ogImage}:{})})};
const snHub=()=>page({path:'/servicenow-apps.html',bodyClass:'p-uc',css:'snapps',title:'ServiceNow Store apps | Omar Huertas LLC',description:'Apps Omar Huertas LLC builds for the Now Platform, with honest status: on the ServiceNow Store, in certification review, or coming soon.',body:hubBody(SNAPPS)});
SNAPPS=await loadApps(ROOT);
await mkdir(join(ROOT,'servicenow'),{recursive:true});

// ----- write everything -----
const LEX=await lexicon();
const out=[['index.html',home],['about.html',about],['services.html',services],['industries.html',industries],['apps.html',appsMoved],['support.html',support],['contact.html',contact],['operations-platform.html',obvera],['security.html',security],['404.html',notFound],
 ['legal.html',docPage({path:'/legal.html',file:'legal',kind:'Legal notices',title:'Legal Notices & Disclaimers | Omar Huertas LLC',description:'Trademarks, affiliations, disclaimers, intellectual property, and liability terms for Omar Huertas LLC and the Services we provide.'})],
 ['privacy-policy.html',docPage({path:'/privacy-policy.html',file:'privacy-policy',kind:'Privacy policy',title:'Privacy Policy | Omar Huertas LLC',description:'How Omar Huertas LLC collects, uses, shares, and protects information across our website, our consulting and implementation services, and the applications we develop and publish.'})],
 ['terms.html',docPage({path:'/terms.html',file:'terms',kind:'Terms &amp; conditions',title:'Terms & Conditions | Omar Huertas LLC',description:'The terms that govern your use of the Omar Huertas LLC website, our consulting and implementation services, and our applications.'})],
 ['accessibility.html',docPage({path:'/accessibility.html',file:'accessibility',kind:'Accessibility',title:'Accessibility | Omar Huertas LLC',description:'Our accessibility commitment: WCAG 2.1 AA, keyboard support, captions, and a built-in accessibility toolbar.'})],
 ['servicenow-lexicon/index.html',()=>LEX],
 ['servicenow-apps.html',snHub],...SNAPPS.map(a=>[`servicenow/${a.slug}.html`,snApp(a)])];
await mkdir(join(ROOT,'servicenow-lexicon'),{recursive:true});
for(const [f,fn] of out){const html=await fn();if(/\bElite\b/.test(html))throw new Error(f+': "Elite" must not appear');if(/ style="/.test(html))throw new Error(f+': inline style');if(/Fraunces|serif/i.test(html.replace(/sans-serif/g,'')))throw new Error(f+': a serif face is named');await writeFile(join(ROOT,f),html);console.log('wrote',f,(html.length/1024).toFixed(0)+'KB')}

// ----- dist-appleapps/: the Apple apps site (appleapps.dbaomarhuertasllc.com), its own Worker. Same shell; main-site links are absolute. -----
const AA=join(ROOT,'dist-appleapps');
await rm(AA,{recursive:true,force:true});
await mkdir(join(AA,'assets'),{recursive:true});
for(const f of ['site.css','snapps.css','app.js','rt.js','apps.js','favicon.svg','fonts','islands','apps'])await cp(join(ROOT,'assets',f),join(AA,'assets',f),{recursive:true});
{
 const idx=await apps(APPS_ORIGIN),nf=notFound(APPS_ORIGIN);
 for(const [f,html] of [['index.html',idx],['404.html',nf]]){if(/\bElite\b/.test(html)||/ style="/.test(html))throw new Error('appleapps '+f+': Elite or inline style');await writeFile(join(AA,f),html)}
 await writeFile(join(AA,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${APPS_URL}sitemap.xml\n`);
 await writeFile(join(AA,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${APPS_URL}</loc><lastmod>${new Date().toISOString().slice(0,10)}</lastmod><priority>1.0</priority></url>\n</urlset>\n`);
 let hd=await readFile(join(ROOT,'_headers'),'utf8');
 hd=hd.split('\n# gated areas')[0].trimEnd()+'\n';
 await writeFile(join(AA,'_headers'),hd);
 console.log('wrote dist-appleapps/ (index.html, 404.html, assets, _headers, robots.txt, sitemap.xml)');
}
