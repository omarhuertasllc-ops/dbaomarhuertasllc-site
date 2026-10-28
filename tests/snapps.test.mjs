import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {spotlightApp,snAppBody,hubBody,homeStrip,homeAnnounce,loadApps,counts} from '../scripts/snapps.mjs';
const R=new URL('../',import.meta.url).pathname;const read=f=>readFileSync(R+f,'utf8');
const apps=await loadApps(R);const by=s=>apps.find(a=>a.slug===s);
test('spotlight picks Update Center; ties go to the lowest order; nothing listed means no spotlight',()=>{
 assert.equal(spotlightApp(apps).slug,'update-center');
 const mk=(slug,order,d)=>({slug,order,status:'listed',store:{live:true,certified_at:d}});
 assert.equal(spotlightApp([mk('a',2,'2026-10-01'),mk('b',1,'2026-10-01'),mk('c',3,'2026-09-01')]).slug,'b');
 assert.equal(spotlightApp([mk('a',2,'2026-10-01'),mk('b',1,'2026-09-01')]).slug,'a');
 assert.equal(spotlightApp(apps.filter(a=>a.status!=='listed')),null);
 assert.equal(spotlightApp([{...mk('x',1,'2026-10-01'),status:'in_review'}]),null);
});
test('an in-review app never says Certified and has no Store button',()=>{
 const a=by('azure-inventory');assert.equal(a.status,'in_review');
 const h=snAppBody(a);
 assert.doesNotMatch(h,/certified/i);assert.doesNotMatch(h,/store\.servicenow\.com/);assert.doesNotMatch(h,/Get it on the ServiceNow Store|View on the ServiceNow Store/);
 assert.match(h,/In ServiceNow certification review/);assert.match(h,/href="\/contact\.html\?app=azure-inventory"/);assert.match(h,/Get notified/);
 assert.match(h,/uc-stage/);
 const f=read('servicenow/azure-inventory.html');assert.doesNotMatch(f,/store\.servicenow\.com/);assert.doesNotMatch(f,/ServiceNow Certified/);
});
test('coming-soon apps use the notify button and skip empty sections and steps',()=>{
 for(const s of ['domain-certificate-inventory','contracts-and-procurement']){const h=snAppBody(by(s));assert.match(h,/Coming soon/);assert.match(h,/Get notified/);assert.doesNotMatch(h,/certified|store\.servicenow\.com|uc-split|uc-steps/i)}
});
test('the listed app shows the Store button, version and certification from the data',()=>{
 const h=snAppBody(by('update-center'));assert.match(h,/Now on the ServiceNow Store/);assert.match(h,/href="https:\/\/store\.servicenow\.com\/store\/app\/b9c2a33b47001f14fd025e45d36d43bb"/);assert.match(h,/Version <b>1\.0\.4/);assert.match(h,/ServiceNow Certified<\/b> October 2026/);assert.match(h,/\/assets\/snapps\/update-center\/dashboard\.webp/);
 const un=structuredClone(by('update-center'));un.store.certified=false;assert.doesNotMatch(snAppBody(un),/certified/i);
 for(const n of ['dashboard','guardrails','instances','records'])assert.ok(existsSync(R+`assets/snapps/update-center/${n}.webp`),n);
});
test('hub lists all four apps with honest counts and the spotlight',()=>{
 const h=hubBody(apps);for(const a of apps)assert.ok(h.includes(`href="/servicenow/${a.slug}.html"`),a.slug);
 assert.equal(counts(apps),'1 on the Store, 1 in review, 2 coming soon');assert.match(h,/1 on the Store, 1 in review, 2 coming soon/);
 assert.match(h,/Latest on the Store/);assert.match(h,/October 2026/);assert.match(h,/On the Store/);assert.match(h,/In review/);
 assert.equal((h.match(/store\.servicenow\.com/g)||[]).length,1);
 const page=read('servicenow-apps.html');assert.match(page,/Apps we build for/);assert.match(page,/snapps\.css/);
});
test('home: dynamic announce, Store strip after the hero, nav, footer, palette and sitemap',()=>{
 assert.match(homeAnnounce(apps).text,/New on the ServiceNow Store: Update Center 1\.0\.4/);
 assert.match(homeAnnounce(apps.filter(a=>a.status!=='listed')).text,/Registered ServiceNow Build/);
 assert.equal(homeStrip(apps.filter(a=>a.status!=='listed')),'');
 const h=read('index.html');assert.ok(h.indexOf('class="hero"')<h.indexOf('class="uc-strip"')&&h.indexOf('class="uc-strip"')<h.indexOf('class="works"'));
 assert.match(h,/New on the ServiceNow Store: Update Center 1\.0\.4/);assert.match(h,/<li><a href="\/servicenow-apps\.html">Store apps<\/a><\/li>/);
 assert.match(h,/<a href="\/servicenow\/update-center\.html">Update Center<\/a>/);assert.match(h,/data-k="update center, servicenow app/);
 const sm=read('sitemap.xml');for(const u of ['servicenow-apps.html',...apps.map(a=>`servicenow/${a.slug}.html`)])assert.ok(sm.includes(`/${u}</loc><lastmod>2026-10-27`),u);
 assert.ok(!existsSync(R+'update-center.html'));assert.match(read('_redirects'),/\/update-center\.html \/servicenow\/update-center 301/);
});
test('generated app pages carry no Elite, inline styles or serif faces',()=>{
 for(const f of ['servicenow-apps.html',...apps.map(a=>`servicenow/${a.slug}.html`)]){const h=read(f);assert.doesNotMatch(h,/\bElite\b/,f);assert.doesNotMatch(h,/ style="/,f);assert.doesNotMatch(h.replace(/sans-serif/g,''),/serif/i,f)}
 assert.doesNotMatch(read('assets/snapps.css'),/serif|Elite/i);
});
