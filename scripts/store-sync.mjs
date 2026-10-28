#!/usr/bin/env node
// Refreshes the `store` block of each app in src/content/servicenow-apps.json from its live ServiceNow Store listing,
// then (when something changed) rebuilds the site and deploys it to the STAGING Worker only. Live is never touched here;
// Omar reviews staging.dbaomarhuertasllc.com and runs `npm run promote`.
//
// Usage: node scripts/store-sync.mjs [--check] [--no-deploy]
//   --check      only print what would change, write nothing
//   --no-deploy  update the json and build, but skip the staging deploy
//
// The Store app page embeds `pageData = {...}` with status, version_details (version, publish_date), price_type,
// compatibility_list and the seller. Store search needs a login, so apps without a store_url stay as they are until
// the URL is added by hand (see docs/STORE-SYNC.md).
import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const DATA=join(ROOT,'src/content/servicenow-apps.json');
const LOG_DIR=join(ROOT,'.build');
const args=new Set(process.argv.slice(2));
const CHECK=args.has('--check'), NO_DEPLOY=args.has('--no-deploy');
const today=new Date().toISOString().slice(0,10);
const UA='Mozilla/5.0 (Macintosh) dbaomarhuertasllc-site store-sync (+https://dbaomarhuertasllc.com)';

function parsePageData(html){
  const i=html.indexOf('pageData = {'); if(i<0) return null;
  // balanced-brace scan from the first '{'
  let d=0,s=html.indexOf('{',i),e=-1,q=null;
  for(let k=s;k<html.length;k++){const c=html[k];
    if(q){ if(c==='\\'){k++;continue} if(c===q) q=null; continue }
    if(c==='"') q=c; else if(c==='{') d++; else if(c==='}'){d--; if(d===0){e=k;break}}
  }
  if(e<0) return null;
  try{ return JSON.parse(html.slice(s,e+1)) }catch{ return null }
}

async function fetchStore(url){
  const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html'},redirect:'follow',signal:AbortSignal.timeout(30000)});
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  const html=await r.text();
  const pd=parsePageData(html); if(!pd?.appInfo) throw new Error('pageData not found (Store markup changed?)');
  const a=pd.appInfo, v=a.version_details||{};
  return {
    live: a.status==='published',
    certified: /certified-app\.svg/.test(html),            // the "ServiceNow Certified App" badge image
    version: v.version||null,
    certified_at: v.publish_date||null,                    // Store shows the publish date of the current version
    pricing: a.price_type==='free'?'Free':(a.price_type?'Paid':null),
    seller: a.company?.name||null,
    scope: a.scope||null,
    releases: (v.compatibility_list||[]).map(c=>c.name),   // e.g. ["Australia"]
    title: a.title||null,
    checked_at: today,
  };
}

const diff=(o,n)=>Object.keys(n).filter(k=>JSON.stringify(o?.[k])!==JSON.stringify(n[k]));

async function main(){
  const data=JSON.parse(await readFile(DATA,'utf8'));
  const changes=[], errors=[];
  for(const app of data.apps){
    if(!app.store_url){ app.store={...(app.store||{}),checked_at:today}; continue }
    let s; try{ s=await fetchStore(app.store_url) }catch(e){ errors.push(`${app.slug}: ${e.message}`); continue }
    if(s.scope && app.scope && s.scope!==app.scope) errors.push(`${app.slug}: Store scope ${s.scope} != ${app.scope} (wrong URL?)`);
    if(s.seller && !/Omar Huertas/i.test(s.seller)) errors.push(`${app.slug}: seller is "${s.seller}", not Omar Huertas LLC`);
    const next={live:s.live,certified:s.certified,version:s.version,certified_at:s.certified_at,pricing:s.pricing,releases:s.releases,checked_at:today};
    const changed=diff(app.store,next).filter(k=>k!=='checked_at');
    if(changed.length) changes.push(`${app.slug}: ${changed.map(k=>`${k} ${JSON.stringify(app.store?.[k])} -> ${JSON.stringify(next[k])}`).join(', ')}`);
    if(s.live && app.status!=='listed'){ changes.push(`${app.slug}: status ${app.status} -> listed (Store says published)`); app.status='listed' }
    if(!s.live && app.status==='listed'){ changes.push(`${app.slug}: status listed -> in_review (Store listing is not published)`); app.status='in_review' }
    app.store=next;
  }
  for(const e of errors) console.error('ERROR',e);
  for(const c of changes) console.log('CHANGE',c);
  if(!changes.length) console.log('no changes');
  if(CHECK) return;
  await mkdir(LOG_DIR,{recursive:true});
  await appendFile(join(LOG_DIR,'store-sync.log'),`${new Date().toISOString()} ${changes.length} change(s) ${errors.length} error(s)\n${[...changes,...errors].map(l=>'  '+l).join('\n')}\n`);
  await writeFile(DATA,JSON.stringify(data,null,2)+'\n');
  if(!changes.length) return;
  const run=(cmd,a)=>execFileSync(cmd,a,{cwd:ROOT,stdio:'inherit'});
  run('npm',['run','build']);
  run('npm',['test']);
  if(NO_DEPLOY) return;
  run('npx',['wrangler','deploy','-c','wrangler.staging.jsonc']);
  try{ run('git',['add','src/content/servicenow-apps.json',...data.apps.map(a=>`servicenow/${a.slug}.html`),'servicenow-apps.html','index.html','sitemap.xml']); run('git',['commit','-q','-m',`store-sync: ${changes.map(c=>c.split(':')[0]).join(', ')} updated from the ServiceNow Store\n\nStaged on staging.dbaomarhuertasllc.com; promote with npm run promote.`]) }catch{}
  try{ execFileSync('ailog',['add','claude',`dbaomarhuertasllc-site store-sync: ${changes.join('; ')}. Built + deployed to STAGING (staging.dbaomarhuertasllc.com), committed locally, NOT live. Omar: review, then npm run promote.`],{stdio:'inherit'}) }catch{}
  try{ execFileSync('osascript',['-e',`display notification "${changes[0].replace(/"/g,'')}" with title "Site staging updated from the ServiceNow Store" subtitle "Review staging.dbaomarhuertasllc.com, then promote"`]) }catch{}
}
main().catch(e=>{console.error(e);process.exit(1)});
