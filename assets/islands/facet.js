// Facet: the signature green-on-navy light field. WebGPU first, WebGL2 second, otherwise the CSS gradient stays.
// Reacts to the cursor (light direction) and scroll (field drift). Paused when off-screen or hidden.
const WGSL=`struct U{res:vec2f,mouse:vec2f,time:f32,scroll:f32,fade:f32,_p:f32};@group(0)@binding(0)var<uniform>u:U;
struct O{@builtin(position)p:vec4f,@location(0)uv:vec2f};
@vertex fn vs(@builtin(vertex_index)i:u32)->O{var q=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));var o:O;o.p=vec4f(q[i],0,1);o.uv=q[i]*.5+.5;return o;}
fn h2(p:vec2f)->vec2f{return fract(sin(vec2f(dot(p,vec2f(127.1,311.7)),dot(p,vec2f(269.5,183.3))))*43758.5453);}
fn hs(p:f32)->f32{return fract(sin(p*78.233)*43758.5453);}
@fragment fn fs(i:O)->@location(0)vec4f{let asp=u.res.x/u.res.y;var p=vec2f(i.uv.x*asp,1.-i.uv.y);p=p*4.2+vec2f(u.time*.03,u.scroll*1.2);
let n=floor(p);let f=fract(p);var d1=8.;var d2=8.;var id=0.;var c1=vec2f(0);
for(var j=-1;j<=1;j++){for(var k=-1;k<=1;k++){let g=vec2f(f32(k),f32(j));let o=h2(n+g);let oo=.5+.38*sin(u.time*.25+6.2831*o);let r=g+oo-f;let d=dot(r,r);if(d<d1){d2=d1;d1=d;id=dot(n+g,vec2f(1.,57.));c1=r;}else if(d<d2){d2=d;}}}
let edge=1.-smoothstep(0.,.016,sqrt(d2)-sqrt(d1));
let nrm=normalize(vec2f(hs(id)-.5,hs(id+3.1)-.5)+1e-3);
let m=vec2f(u.mouse.x*asp,1.-u.mouse.y);let dir=normalize(m-vec2f(i.uv.x*asp,1.-i.uv.y));
let lit=clamp(dot(nrm,dir)*.5+.5,0.,1.);let ds=exp(-length(m-vec2f(i.uv.x*asp,1.-i.uv.y))*1.6);
let deep=vec3f(.012,.19,.28);let em=vec3f(.384,.847,.306);let ice=vec3f(.76,.92,.96);let champ=vec3f(.72,.93,.62);
var c=mix(deep,em,pow(lit,2.2)*(.55+.45*hs(id+9.)));c=mix(c,ice,pow(lit,9.)*.5*ds+.08*ds);c=mix(c,champ,edge*(.35+.45*ds));
var a=.1+.3*pow(lit,2.4)+edge*(.12+.55*ds)+ds*.2;
let y=i.uv.y;a*=smoothstep(.05,.55,y)*(.3+.7*smoothstep(0.,.75,i.uv.x))*u.fade;
a+= (hs(i.p.x+i.p.y*917.+u.time)-.5)*.02;a=clamp(a,0.,1.);return vec4f(c*a,a);}`;
const GLSL=`#version 300 es
precision highp float;uniform vec2 res,mouse;uniform float time,scroll,fade;out vec4 O;
vec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float hs(float p){return fract(sin(p*78.233)*43758.5453);}
void main(){vec2 uv=gl_FragCoord.xy/res;float asp=res.x/res.y;vec2 p=vec2(uv.x*asp,1.-uv.y);p=p*4.2+vec2(time*.03,scroll*1.2);
vec2 n=floor(p),f=fract(p);float d1=8.,d2=8.,id=0.;
for(int j=-1;j<=1;j++)for(int k=-1;k<=1;k++){vec2 g=vec2(k,j);vec2 o=h2(n+g);vec2 oo=.5+.38*sin(time*.25+6.2831*o);vec2 r=g+oo-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;id=dot(n+g,vec2(1.,57.));}else if(d<d2)d2=d;}
float edge=1.-smoothstep(0.,.016,sqrt(d2)-sqrt(d1));vec2 nrm=normalize(vec2(hs(id)-.5,hs(id+3.1)-.5)+1e-3);
vec2 m=vec2(mouse.x*asp,1.-mouse.y),q=vec2(uv.x*asp,1.-uv.y);vec2 dir=normalize(m-q);
float lit=clamp(dot(nrm,dir)*.5+.5,0.,1.),ds=exp(-length(m-q)*1.6);
vec3 deep=vec3(.012,.19,.28),em=vec3(.384,.847,.306),ice=vec3(.76,.92,.96),champ=vec3(.72,.93,.62);
vec3 c=mix(deep,em,pow(lit,2.2)*(.55+.45*hs(id+9.)));c=mix(c,ice,pow(lit,9.)*.5*ds+.08*ds);c=mix(c,champ,edge*(.35+.45*ds));
float a=.1+.3*pow(lit,2.4)+edge*(.12+.55*ds)+ds*.2;float y=uv.y;a*=smoothstep(.05,.55,y)*(.3+.7*smoothstep(0.,.75,uv.x))*fade;
a+=(hs(gl_FragCoord.x+gl_FragCoord.y*917.+time)-.5)*.02;a=clamp(a,0.,1.);O=vec4(c*a,a);}`;
export default async function facet(el,ctx){
 if(ctx.reduce)return;const cv=el.querySelector('canvas')||el.appendChild(Object.assign(document.createElement('canvas'),{ariaHidden:'true'}));
 const S={w:0,h:0,mx:.5,my:.45,gx:.5,gy:.45,t0:performance.now(),scroll:0,fade:0,loop:0,visible:true,ok:false};
 const scale=Math.min(devicePixelRatio||1,1.5)*.5;
 const size=()=>{S.w=Math.max(2,Math.round(cv.clientWidth*scale));S.h=Math.max(2,Math.round(cv.clientHeight*scale));if(cv.width!==S.w||cv.height!==S.h){cv.width=S.w;cv.height=S.h;return true}return false};
 let draw;
 try{draw=await gpu(cv,S)}catch{try{draw=gl2(cv,S)}catch{draw=null}}
 if(!draw)return;el.dataset.renderer=draw.kind;size();
 const src=el.closest('[data-facet-src]')||el;
 src.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();S.gx=(e.clientX-r.left)/r.width;S.gy=(e.clientY-r.top)/r.height},{passive:true});
 const onScroll=()=>{S.scroll=Math.min(1,scrollY/Math.max(1,innerHeight))};addEventListener('scroll',onScroll,{passive:true});
 const live=()=>S.visible&&!document.hidden;
 const step=now=>{S.loop=0;if(!live())return;if(size())draw.resize();S.mx+=(S.gx-S.mx)*.06;S.my+=(S.gy-S.my)*.06;S.fade=Math.min(1,S.fade+.02);draw.frame((now-S.t0)/1000);S.loop=requestAnimationFrame(step)};
 const go=()=>{if(!S.loop&&live())S.loop=requestAnimationFrame(step)};
 new IntersectionObserver(es=>{S.visible=es[0].isIntersecting;go()}).observe(el);
 if('ResizeObserver' in window)new ResizeObserver(go).observe(cv);
 go();el.classList.add('on');
 return {pause(){cancelAnimationFrame(S.loop);S.loop=0},resume:go};
}
async function gpu(cv,S){
 if(!navigator.gpu)throw 0;const ad=await navigator.gpu.requestAdapter({powerPreference:'low-power'});if(!ad)throw 0;const dev=await ad.requestDevice();
 const c=cv.getContext('webgpu');if(!c)throw 0;const fmt=navigator.gpu.getPreferredCanvasFormat();
 const conf=()=>c.configure({device:dev,format:fmt,alphaMode:'premultiplied'});conf();
 const mod=dev.createShaderModule({code:WGSL});const info=await mod.getCompilationInfo();if(info.messages.some(m=>m.type==='error'))throw 0;
 const pipe=await dev.createRenderPipelineAsync({layout:'auto',vertex:{module:mod,entryPoint:'vs'},fragment:{module:mod,entryPoint:'fs',targets:[{format:fmt,blend:{color:{srcFactor:'one',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}}}]}});
 const ub=dev.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
 const bg=dev.createBindGroup({layout:pipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ub}}]});
 const u=new Float32Array(8);
 dev.lost.then(()=>{cv.closest('.on')?.classList.remove('on')});
 return {kind:'webgpu',resize:conf,frame(t){u.set([S.w,S.h,S.mx,S.my,t,S.scroll,S.fade,0]);dev.queue.writeBuffer(ub,0,u);const enc=dev.createCommandEncoder();const pass=enc.beginRenderPass({colorAttachments:[{view:c.getCurrentTexture().createView(),loadOp:'clear',clearValue:[0,0,0,0],storeOp:'store'}]});pass.setPipeline(pipe);pass.setBindGroup(0,bg);pass.draw(3);pass.end();dev.queue.submit([enc.finish()])}};
}
function gl2(cv,S){
 const gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,powerPreference:'low-power'});if(!gl)throw 0;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,GLSL));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw 0;gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
 const U=n=>gl.getUniformLocation(pr,n),uR=U('res'),uM=U('mouse'),uT=U('time'),uS=U('scroll'),uF=U('fade');
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 cv.addEventListener('webglcontextlost',e=>{e.preventDefault();cv.closest('.on')?.classList.remove('on')});
 return {kind:'webgl2',resize(){gl.viewport(0,0,S.w,S.h)},frame(t){gl.uniform2f(uR,S.w,S.h);gl.uniform2f(uM,S.mx,S.my);gl.uniform1f(uT,t);gl.uniform1f(uS,S.scroll);gl.uniform1f(uF,S.fade);gl.drawArrays(gl.TRIANGLES,0,3)}};
}
