/* Hello World: the homepage of chiemjanssen.nl as a small DS-style RPG world. */
/* Procedural DS-era sprite renderer for the Chiem character.
   Parts are lit primitives (ellipses, capsules, superellipses) quantised to 4-tone ramps,
   then given material-coloured outlines and occlusion lines. */
(function(){
const RAMP={
 skin:["#b06e50","#d9976f","#f1bb91","#fdd9b6"],
 cap:["#4a4e58","#6b717c","#9096a1","#bcc1ca"],
 navy:["#151d38","#233360","#344b84","#4f6aab"],
 orange:["#a3451a","#e06a24","#ff9040","#ffc085"],
 pants:["#24242a","#34343c","#484852","#606070"],
 shoe:["#9ba1ae","#c9ced8","#e9ecf2","#ffffff"],
 hair:["#2a1c13","#3f2b1d","#59402b","#74563b"],
 beard:["#4a3222","#664530","#7f5a3f","#94704f"],
 bag:["#16161c","#23232b","#33333d","#4a4a58"],
 zip:["#8e97aa","#b9c1d2","#d7deea","#f2f5fa"],
 white:["#d9dce4","#eceef3","#f8f9fb","#ffffff"]};
const OUT={skin:"#6e3a2b",cap:"#25272e",navy:"#0b1022",orange:"#5a220d",pants:"#121216",shoe:"#4b4f5b",hair:"#160e09",beard:"#2a1b11",bag:"#09090c",zip:"#3c4250",white:"#5a5e6a"};
const Lx=-.5,Ly=-.72,Lz=.48,Ln=Math.hypot(Lx,Ly,Lz),LX=Lx/Ln,LY=Ly/Ln,LZ=Lz/Ln;
function tone(nx,ny,nz,bias){const s=Math.max(0,nx*LX+ny*LY+nz*LZ)*.9+.12+(bias||0);return s<.38?0:s<.64?1:s<.88?2:3}
function cover(p,x,y){
 if(p.clip&&((p.clip.ymax!=null&&y>p.clip.ymax)||(p.clip.ymin!=null&&y<p.clip.ymin)||(p.clip.xmin!=null&&x<p.clip.xmin)||(p.clip.xmax!=null&&x>p.clip.xmax)))return null;
 if(p.t==="e"){const dx=(x-p.x)/p.rx,dy=(y-p.y)/p.ry,d=dx*dx+dy*dy;if(d>1)return null;return[dx,dy,Math.sqrt(1-d)]}
 if(p.t==="s"){const dx=(x-p.x)/p.rx,dy=(y-p.y)/p.ry,f=dx**4+dy**4;if(f>1)return null;let nx=Math.sign(dx)*Math.abs(dx)**3,ny=Math.sign(dy)*Math.abs(dy)**3,nz=Math.sqrt(1-f)*.9+.1;const n=Math.hypot(nx,ny,nz);return[nx/n,ny/n,nz/n]}
 if(p.t==="c"){const vx=p.x2-p.x,vy=p.y2-p.y,l2=vx*vx+vy*vy;let t=((x-p.x)*vx+(y-p.y)*vy)/l2;t=Math.max(0,Math.min(1,t));const cx=p.x+vx*t,cy=p.y+vy*t,dx=(x-cx)/p.r,dy=(y-cy)/p.r,d=dx*dx+dy*dy;if(d>1)return null;return[dx,dy,Math.sqrt(1-d)]}
 return null}
const E=(x,y,rx,ry,m,o)=>({t:"e",x,y,rx,ry,m,...o}),C=(x,y,x2,y2,r,m,o)=>({t:"c",x,y,x2,y2,r,m,...o}),S=(x,y,rx,ry,m,o)=>({t:"s",x,y,rx,ry,m,...o});

function parts(dir,ph){
 const by=ph%2?1:0, st=ph===1?1:ph===3?-1:0; // stride sign
 const P=[];
 if(dir==="down"||dir==="up"){
  const back=dir==="up",fl=back?-st:st,fr=-fl;
  P.push(E(12.4,44.4+fl*.8,3.4,2.1,"shoe",{g:"ll"}),E(19.6,44.4+fr*.8,3.4,2.1,"shoe",{g:"rl"}));
  P.push(C(12.6,31+by,12.4,42.6+fl*.8,3.3,"pants",{g:"ll"}),C(19.4,31+by,19.6,42.6+fr*.8,3.3,"pants",{g:"rl"}));
  if(back)P.push(S(9.4,31.6+by,2.7,2.3,"bag"));
  P.push(S(16,25.6+by,7.3,7.8,"navy",{g:"body"}));
  if(!back)P.push(C(16,18.6+by,16,32.6+by,.42,"zip",{g:"body",flat:2}));
  P.push(back?C(21.6,19.4+by,10.4,31+by,1.15,"orange",{g:"strap"}):C(10.4,19.4+by,21.6,31+by,1.15,"orange",{g:"strap"}));
  if(!back)P.push(S(22.5,31.6+by,2.8,2.4,"bag",{g:"bag"}));
  const ay=st*1.2;
  P.push(C(8.7,20+by,8.1,30+by-ay,2.45,"navy",{g:"la"}),C(23.3,20+by,23.9,30+by+ay,2.45,"navy",{g:"ra"}));
  P.push(E(8.1,31.3+by-ay,1.9,1.9,"skin",{g:"la"}),E(23.9,31.3+by+ay,1.9,1.9,"skin",{g:"ra"}));
  P.push(E(16,18.1+by,4.7,2,"navy",{g:"collar"}));
  P.push(E(9.3,13+by,1.5,2,"skin",{g:"head",bias:.15}),E(22.7,13+by,1.5,2,"skin",{g:"head",bias:.15}));
  if(back){
   P.push(E(16,12.2+by,6.8,6.8,"hair",{g:"head",bias:.18}));
   P.push(E(16,8.4+by,7.2,5.6,"cap",{g:"cap",clip:{ymax:12+by}}));
  }else{
   P.push(E(16,12.2+by,6.8,6.8,"skin",{g:"head",bias:.14}));
   P.push(E(16,16.4+by,6.4,3,"beard",{g:"head",clip:{ymin:15.6+by},dither:1,bias:.25}));
   P.push(E(10.2,11+by,1.5,2.6,"hair",{g:"head",clip:{ymax:13.6+by}}),E(21.8,11+by,1.5,2.6,"hair",{g:"head",clip:{ymax:13.6+by}}));
   P.push(E(16,18.4+by,2.5,1.4,"beard",{g:"head"}));
   P.push(E(16,7.9+by,6.8,4.5,"cap",{g:"cap",clip:{ymax:9+by}}));
   P.push(E(16,9.4+by,7.9,2.2,"cap",{g:"cap",clip:{ymin:8.9+by},bias:.1}));
  }
 }else{ // left (right = mirrored)
  const a=st*3.6;
  P.push(C(16,31+by,16+a,42.6,3,"pants",{g:"fl",shade:-1}),E(15.2+a,44.5,3.6,2,"shoe",{g:"fl",shade:-1}));
  P.push(C(15.5,21+by,15.8-a*.7,30+by,2.3,"navy",{g:"fa",shade:-1}),E(15.8-a*.7,31.2+by,1.8,1.8,"skin",{g:"fa",shade:-1}));
  P.push(S(17.6,31.4+by,2.4,2.4,"bag",{g:"bag"}));
  P.push(S(16.2,25.6+by,5.4,7.8,"navy",{g:"body"}));
  P.push(C(13.4,19.6+by,17.6,30.4+by,1.1,"orange",{g:"strap"}));
  P.push(C(16,31+by,16-a,42.6,3.1,"pants",{g:"nl"}),E(15.2-a,44.5,3.6,2,"shoe",{g:"nl"}));
  P.push(C(16.6,20.6+by,16.6+a*.7,30+by,2.4,"navy",{g:"na"}),E(16.6+a*.7,31.3+by,1.9,1.9,"skin",{g:"na"}));
  P.push(E(16.2,18.2+by,3.6,1.9,"navy",{g:"collar"}));
  P.push(E(15.4,12.2+by,6,6.8,"skin",{g:"head",bias:.14}));
  P.push(E(19.4,11.8+by,2.6,3.6,"hair",{g:"head",clip:{xmin:18.6,ymax:15.4+by}}));
  P.push(E(9.6,14.2+by,1,1.1,"skin",{g:"head"}));
  P.push(E(13.4,16.6+by,4.6,2.8,"beard",{g:"head",clip:{ymin:15.6+by,xmax:17.4},dither:1,bias:.25}));
  P.push(E(11.3,18.2+by,2.2,1.4,"beard",{g:"head"}));
  P.push(E(17.8,13.2+by,1.3,1.9,"skin",{g:"head"}));
  P.push(E(16.2,7.9+by,6.6,4.5,"cap",{g:"cap",clip:{ymax:9.3+by}}));
  P.push(E(10.2,9.6+by,4.9,1.4,"cap",{g:"cap",clip:{xmax:14.5},bias:.1}));
 }
 return{P,by};
}
function feats(dir,ph,by,dot){
 const y=by;
 if(dir==="down"){
  [[12.6,14.2],[19.4,14.2]].forEach(([x,yy])=>{dot(x-1,yy+y,"#2b1d2e");dot(x,yy-1+y,"#2b1d2e");dot(x+1,yy+y,"#2b1d2e")});
  for(let x=14;x<=18;x++)dot(x,15.4+y,"#664530");
  for(let x=14;x<=18;x++)dot(x,16.4+y,x===14||x===18?"#6a2626":"#ffffff");for(let x=15;x<=17;x++)dot(x,17.4+y,"#6a2626");
  [[13,6],[14,5],[15,6],[16,5],[17,5],[18,6]].forEach(([a,b])=>dot(a,b+y,"#f6f3ec"));
  dot(16,3.6+y,"#80868f");
 }
 if(dir==="up"){for(let x=14;x<=18;x++)dot(x,11.4+y,"#3f2b1d");dot(15,10.4+y,"#59402b");dot(16,10.4+y,"#59402b");dot(17,10.4+y,"#59402b");dot(16,3.6+y,"#80868f")}
 if(dir==="left"){dot(11.4,14.2+y,"#2b1d2e");dot(12.4,13.2+y,"#2b1d2e");dot(13.4,14.2+y,"#2b1d2e");
  dot(10.6,16.4+y,"#6a2626");dot(11.6,16.4+y,"#ffffff");dot(12.6,16.4+y,"#ffffff");dot(13.4,16+y,"#6a2626");dot(11.6,15.4+y,"#664530");dot(12.6,15.4+y,"#664530");
  [[11,6],[12,5],[13,6],[14,5]].forEach(([a,b])=>dot(a,b+y,"#f6f3ec"))}
}
function render(dir,ph,K){
 K=K||1;const flip=dir==="right";if(flip)dir="left";
 const W=32*K,H=48*K,{P,by}=parts(dir,ph),col=new Array(W*H),pid=new Int16Array(W*H).fill(-1),pm=new Array(W*H);
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){const x=(px+.5)/K,y=(py+.5)/K;
  for(let i=0;i<P.length;i++){const p=P[i],n=cover(p,x,y);if(!n)continue;if(p.dither&&(K>1?(((Math.floor(px/2)*73856093)^(Math.floor(py/2)*19349663))>>>0)%100<55:(px+py)%2))continue;
   let tn=p.flat!=null?p.flat:tone(n[0],n[1],n[2],p.bias);if(p.shade)tn=Math.max(0,tn+p.shade);
   const k=py*W+px;col[k]=RAMP[p.m][tn];pid[k]=i;pm[k]=p.m}}
 const out=col.slice(),g=i=>P[i]&&(P[i].g||i);
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){const k=py*W+px;
  if(pid[k]<0){let best=-1;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx,dy])=>{const X=px+dx,Y=py+dy;if(X<0||Y<0||X>=W||Y>=H)return;const q=pid[Y*W+X];if(q>best)best=q});if(best>=0)out[k]=OUT[P[best].m];continue}
  for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const X=px+dx,Y=py+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const q=pid[Y*W+X];if(q>pid[k]&&g(q)!==g(pid[k])&&!P[q].dither){out[k]=K>1?RAMP[pm[k]][0]:OUT[pm[k]];break}}}
 const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");
 for(let k=0;k<W*H;k++)if(out[k]){c.fillStyle=out[k];c.fillRect(k%W,(k/W)|0,1,1)}
 if(K===1)feats(dir,ph,by,(x,y,color)=>{c.fillStyle=color;c.fillRect(Math.floor(x)*K,Math.floor(y)*K,K,K)});
 if(!flip)return cv;const f=document.createElement("canvas");f.width=W;f.height=H;const fc=f.getContext("2d");fc.translate(W,0);fc.scale(-1,1);fc.drawImage(cv,0,0);return f}

/* Portrait: high-res bust for dialog boxes. Features are drawn as vectors, then hard-thresholded to pixels. */
function portrait(){
 const K=4,big=render("down",0,K),W=32*K,H=28*K,cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");c.drawImage(big,0,0);
 const t=document.createElement("canvas");t.width=W;t.height=H;const x=t.getContext("2d");x.scale(K,K);x.lineCap="round";x.lineJoin="round";
 const stroke=(col,w,f)=>{x.strokeStyle=col;x.lineWidth=w/K;x.beginPath();f();x.stroke()},fill=(col,f)=>{x.fillStyle=col;x.beginPath();f();x.fill()};
 fill("rgba(240,150,125,.75)",()=>{x.ellipse(11.4,16.1,1.3,.7,0,0,7);x.ellipse(20.6,16.1,1.3,.7,0,0,7)});
 [12.6,19.4].forEach(cx=>{stroke("#2b1d2e",3,()=>x.arc(cx,15,1.45,Math.PI*1.08,Math.PI*1.92));stroke("#3f2b1d",3,()=>{x.moveTo(cx-1.7,12.5);x.lineTo(cx+1.5,12.2)})});
 stroke("#c98a65",2,()=>{x.moveTo(16.5,14.4);x.quadraticCurveTo(16.9,15.4,16.2,15.7)});
 stroke("#664530",3.5,()=>{x.moveTo(13.8,16.2);x.quadraticCurveTo(16,15.4,18.2,16.2)});
 const mouth=()=>{x.moveTo(13.9,16.6);x.quadraticCurveTo(16,19.6,18.1,16.6);x.closePath()};
 fill("#6a2626",mouth);x.save();x.beginPath();mouth();x.clip();x.fillStyle="#fff";x.fillRect(13,16.4,6,.9);x.fillStyle="#c2504a";x.beginPath();x.ellipse(16,18.4,1.3,.8,0,0,7);x.fill();x.restore();
 stroke("#f6f3ec",3,()=>{x.moveTo(13.3,6.4);x.bezierCurveTo(14.2,4.6,14.8,7.2,15.6,5.6);x.bezierCurveTo(16.3,4.4,16.9,6.9,17.6,5.5);x.lineTo(18.7,5.2)});
 const d=x.getImageData(0,0,W,H),a=d.data;for(let i=3;i<a.length;i+=4)a[i]=a[i]>110?255:0;x.putImageData(d,0,0);
 c.drawImage(t,0,0);return cv}
function blob(W,H,P,ramps,outs){const col=new Array(W*H),pid=new Int16Array(W*H).fill(-1),pm=new Array(W*H);
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){const x=px+.5,y=py+.5;for(let i=0;i<P.length;i++){const p=P[i],n=cover(p,x,y);if(!n)continue;let tn=p.flat!=null?p.flat:tone(n[0],n[1],n[2],p.bias);if(p.shade)tn=Math.max(0,tn+p.shade);const k=py*W+px;col[k]=ramps[p.m][tn];pid[k]=i;pm[k]=p.m}}
 const out=col.slice(),g=i=>P[i]&&(P[i].g||i);
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){const k=py*W+px;
  if(pid[k]<0){let best=-1;[[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx,dy])=>{const X=px+dx,Y=py+dy;if(X<0||Y<0||X>=W||Y>=H)return;const q=pid[Y*W+X];if(q>best)best=q});if(best>=0)out[k]=outs[P[best].m];continue}
  for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const X=px+dx,Y=py+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const q=pid[Y*W+X];if(q>pid[k]&&g(q)!==g(pid[k])){out[k]=ramps[pm[k]][0];break}}}
 const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");for(let k=0;k<W*H;k++)if(out[k]){c.fillStyle=out[k];c.fillRect(k%W,(k/W)|0,1,1)}return cv}
window.Hero={render,portrait,blob,E,C,S,RAMP};
})();
(()=>{
const hw=document.getElementById("hw");if(!hw||!window.Hero||!document.createElement("canvas").getContext)return;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;let running=false,rafOn=false;
const T=24,MW=56,MH=40;
const cv=document.getElementById("world"),g=cv.getContext("2d");
let zoom=3,VW=480,VH=300;
function resize(){zoom=Math.max(2,Math.min(4,Math.floor(Math.min(innerWidth/600,innerHeight/360))));VW=Math.ceil(innerWidth/zoom);VH=Math.ceil(innerHeight/zoom);cv.width=VW;cv.height=VH;cv.style.width=VW*zoom+"px";cv.style.height=VH*zoom+"px";g.imageSmoothingEnabled=false}
addEventListener("resize",resize);resize();
/* ---------- noise ---------- */
const hash=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295};
const vnoise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,s=t=>t*t*(3-2*t),a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf)};
/* ---------- terrain ---------- */
const ter=new Array(MW*MH),at=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?"W":ter[y*MW+x],put=(x,y,c)=>{if(x>=0&&y>=0&&x<MW&&y<MH)ter[y*MW+x]=c};
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const nx=(x+.5-28)/25.5,ny=(y+.5-20)/18.6,d=nx**4+ny**4+(vnoise(x*.35,y*.35)-.5)*.22;ter[y*MW+x]=d<.74?"G":d<1?"B":"W"}
const land=(x,y)=>"GB".includes(at(x,y));
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(y<=11&&at(x,y)==="G")put(x,y,"H");if((y===12||y===13)&&at(x,y)==="G")put(x,y,"c")}
const rect=(c,x0,y0,x1,y1,only)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(!only||only.includes(at(x,y)))put(x,y,c)};
// pond, river, waterfall, canal
for(let y=3;y<=9;y++)for(let x=16;x<=23;x++)if(((x+.5-19.5)/3)**2+((y+.5-6)/2.4)**2<1)put(x,y,"W");
rect("W",20,8,21,11);rect("f",20,12,21,13);rect("W",20,14,21,39,"GBW");
// stairs + paths
rect("s",27,12,28,13);
const path=(x0,y0,x1,y1)=>rect("P",x0,y0,x1,y1,"GHB");
path(27,9,28,11);path(27,14,28,16);path(9,19,24,20);path(31,19,44,20);path(27,23,28,34);path(10,29,27,30);path(29,31,45,32);path(44,14,44,18);path(11,21,11,23);
for(let y=15;y<=24;y++)for(let x=23;x<=32;x++)if(((x+.5-28)/3.9)**2+((y+.5-20)/3.9)**2<1)put(x,y,"S");
rect("D",20,19,21,20);rect("D",20,29,21,30);rect("D",44,33,45,39);
rect("T",22,23,25,27,"G");rect("T",30,24,34,28,"G");rect("F",4,32,14,35,"G");
/* ---------- objects / solids ---------- */
const solid=new Uint8Array(MW*MH),bump={},step={};
const S=(x,y)=>{if(x>=0&&y>=0&&x<MW&&y<MH)solid[y*MW+x]=1};
const B=[
 {id:"localeo",x:24,y:4,w:8,h:6,kind:"tower"},
 {id:"debugged",x:41,y:14,w:7,h:5,kind:"brick"},
 {id:"fitness",x:8,y:14,w:7,h:5,kind:"gym"},
 {id:"dcare",x:8,y:24,w:7,h:5,kind:"barn"},
 {id:"reef",x:40,y:27,w:5,h:4,kind:"hut"}];
B.forEach(b=>{rect("G",b.x,b.y,b.x+b.w-1,b.y+b.h-1,"P");for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)S(x,y);const dx=b.x+Math.floor(b.w/2);b.door=[dx,b.y+b.h-1];bump[dx+","+(b.y+b.h-1)]=b.id;if(b.w%2===0)bump[(dx-1)+","+(b.y+b.h-1)]=b.id;path(dx-(b.w%2?0:1),b.y+b.h,dx,b.y+b.h)});
path(41,31,42,31);path(27,10,28,11);
const objs=[];
// fountain, mailbox, sign, windmill, silo, pen, sensors, rocks
[[27,19],[28,19],[27,20],[28,20]].forEach(([x,y])=>{S(x,y);bump[x+","+y]="fountain"});
S(31,23);bump["31,23"]="mail";S(24,22);bump["24,22"]="sign";S(36,22);S(37,22);S(36,23);S(37,23);bump["36,23"]="mill";bump["37,23"]="mill";
S(5,26);S(6,26);for(let x=15;x<=19;x++){S(x,24);S(x,28)}for(let y=24;y<=28;y++){S(15,y);S(19,y)}
step["44,39"]="reef";step["45,39"]="reef";
const W8=x=>x;
/* walkability */
const walk=(x,y)=>{const c=at(x,y);return"GHPSBDTFs".includes(c)&&!solid[y*MW+x]};
/* trees */
const trees=[];const near=(x,y,r,fn)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(fn(at(x+i,y+j),x+i,y+j))return true;return false};
const busy=(x,y)=>near(x,y,1,(c,X,Y)=>"PSDWfsTFc".includes(c)||solid[Y*MW+X]);
const keepClear=(x,y)=>(x>=14&&x<=20&&y>=23&&y<=29)||(x>=34&&x<=39&&y>=20&&y<=25)||(x>=2&&x<=8&&y>=24&&y<=27);
for(let y=2;y<MH-1;y++)for(let x=1;x<MW-1;x++){const c=at(x,y);if(!(c==="G"||c==="H"))continue;if(busy(x,y)||keepClear(x,y))continue;
 const nx=(x+.5-28)/25.5,ny=(y+.5-20)/18.6,d=nx**4+ny**4,edge=d>.35,dense=vnoise(x*.25+9,y*.25)>.55;
 const p=(c==="H"?.42:0)+(edge?.3:.04)+(dense?.25:0);if(hash(x,y,7)<p&&!trees.some(t=>Math.abs(t.x-x)<2&&Math.abs(t.y-y)<2)){trees.push({x,y,v:hash(x,y,3)<.28?1:0});S(x,y)}}
const bushes=[],lamps=[];
for(let y=14;y<MH-2;y++)for(let x=2;x<MW-2;x++){if(at(x,y)!=="G"||solid[y*MW+x]||busy(x,y)||keepClear(x,y))continue;if(hash(x,y,31)<.05&&!trees.some(t=>Math.abs(t.x-x)<2&&Math.abs(t.y-y)<2)&&!bushes.some(b=>Math.abs(b.x-x)<2&&Math.abs(b.y-y)<2)){bushes.push({x,y,v:hash(x,y,32)<.5});S(x,y)}}
[[10,18],[16,18],[23,18],[33,18],[39,18],[26,25],[26,32],[29,27],[13,28],[25,31],[36,33]].forEach(([x,y])=>{if((at(x,y)==="G")&&!solid[y*MW+x]){lamps.push({x,y});S(x,y)}});
/* ---------- sprites ---------- */
const H=window.Hero,E=H.E,Cc=H.C,Sx=H.S;
const PR={leaf:["#25603a","#33803f","#4fa448","#7cc95a"],leaf2:["#1e5236","#2a6e42","#3f8d4a","#64b25a"],bark:["#4a2e1c","#6a4228","#8a5a36","#a8744a"],stone:["#6e6a72","#8e8a92","#b0acb2","#d2ced2"],pink:["#c46a7a","#e88c9c","#f8b0bc","#ffd0d8"],silo:["#7a8590","#9aa6b0","#c0cad2","#e2e8ee"],red:["#6e1c1c","#9a2a26","#c43e32","#e0604a"],
 white:["#b8bcc8","#d8dce4","#eef0f4","#ffffff"],teal:["#1e6e70","#2a9294","#3ab6b4","#6ad8cc"]};
const PO={leaf:"#143a24",leaf2:"#10301f",bark:"#2a1a10",stone:"#3e3a42",pink:"#7a3a48",silo:"#3e4650",red:"#3a0e0e",white:"#6a6e7a",teal:"#0e3a3c"};
const treeA=H.blob(52,66,[Cc(26,50,26,62,3.6,"bark"),E(14,38,11,9,"leaf",{g:1}),E(38,38,11,9,"leaf",{g:2}),E(26,31,18,15,"leaf",{g:3}),E(19,19,10,9,"leaf",{g:4}),E(33,20,10,9,"leaf",{g:5}),E(26,12,8,7,"leaf",{g:6,bias:.05})],PR,PO);
const treeB=H.blob(40,68,[Cc(20,54,20,64,3,"bark"),E(20,50,17,8,"leaf2",{g:1}),E(20,40,14,8,"leaf2",{g:2}),E(20,30,11,7,"leaf2",{g:3}),E(20,21,8,6,"leaf2",{g:4}),E(20,13,5,5,"leaf2",{g:5})],PR,PO);
const bush=[0,1].map(v=>H.blob(32,24,[E(16,14,13,8.5,"leaf",{g:1}),E(8,15,7,6,"leaf",{g:2}),E(24,15,7,6,"leaf",{g:3}),E(16,9,8,5,"leaf",{g:4,bias:.08})],PR,PO));
const rock=H.blob(26,20,[E(14,12,10,7,"stone",{g:1}),E(8,13,5,4,"stone",{g:2})],PR,PO);
const silo=H.blob(30,74,[Sx(15,48,11,24,"silo",{g:1}),E(15,22,11,9,"red",{g:2,clip:{ymax:22}})],PR,PO);
const pigF=[0,1].map(b=>{const c=H.blob(22,16,[E(10,9-b*.5,7,4.6,"pink",{g:1}),E(16.5,7.5-b*.5,3.6,3.4,"pink",{g:2}),E(19,8.6-b*.5,1.6,1.3,"pink",{g:3,flat:1}),E(15.2,4.4,1.6,1.9,"pink",{g:6,bias:.1}),E(5,14,1.4,1.6+b*.4,"pink",{g:4}),E(13,14,1.4,2-b*.4,"pink",{g:5})],PR,PO),x=c.getContext("2d");x.fillStyle="#2b1d2e";x.fillRect(13,4,4,5);x.fillStyle="#ffd23a";x.fillRect(14,5,2,3);x.fillStyle="#fff3a0";x.fillRect(14,5,1,1);return c});
PR.shark=["#22344c","#34506e","#4c6e92","#6e90b2"];PO.shark="#0e1826";
const sharkF=[-1.8,0,1.8,0].map(sw=>{const c=H.blob(72,26,[E(64,13+sw,2.6,7,"shark",{g:6}),Cc(46,13,61,13+sw*.8,3.3,"shark",{g:3}),E(34,13,19,7.2,"shark",{g:1}),E(14,13,11.5,8.2,"shark",{g:2}),E(24,4.4,7,2.8,"shark",{g:4}),E(24,21.6,7,2.8,"shark",{g:5}),E(37,13,3.4,1.7,"shark",{g:7,bias:.25})],PR,PO),x=c.getContext("2d");
 for(let i=0;i<90;i++){const sx=5+Math.floor(hash(i,1,77)*52),sy=6+Math.floor(hash(i,2,77)*14);if(((sx-34)/19)**2+((sy-13)/7.2)**2<.72||((sx-14)/11.5)**2+((sy-13)/8.2)**2<.62){x.fillStyle=hash(i,3,77)<.7?"#e6f0fa":"#b8cce0";x.fillRect(sx,sy,1,1)}}
 x.fillStyle="rgba(230,240,250,.45)";x.fillRect(20,10,30,1);x.fillRect(20,16,30,1);x.fillStyle="#0e1826";x.fillRect(3,9,1,8);x.fillRect(7,6,2,1);x.fillRect(7,20,2,1);return c});
const deepW=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(at(x,y)==="W"&&!near(x,y,2,q=>q!=="W"))deepW.push([x,y]);
const shark={x:0,y:0,vx:0,a:0,st:"hidden",t:5,seen:false,ph:0};
function sharkSpawn(){const pool=deepW.filter(([x,y])=>{const d=Math.hypot(x-P.x,y-P.y);return d>4&&d<12});const list=pool.length?pool:deepW.filter(([x,y])=>y>34&&x>30);const[x,y]=list[Math.floor(Math.random()*list.length)];shark.x=x*T+T/2;shark.y=y*T+T/2;shark.vx=(Math.random()<.5?-1:1)*13;shark.st="up";shark.t=0}
function drawShark(dt,t,cx,cy){const s=shark;
 if(started){if(s.st==="hidden"){s.t-=dt;if(s.t<=0)sharkSpawn()}else if(s.st==="up"){s.a=Math.min(.92,s.a+dt*.45);if(s.a>=.92){s.st="swim";s.t=12+Math.random()*8}}else if(s.st==="swim"){s.t-=dt;if(s.t<=0)s.st="down"}else{s.a-=dt*.4;if(s.a<=0){s.a=0;s.st="hidden";s.t=16+Math.random()*14}}}
 if(s.st==="hidden")return;const nose=s.x+Math.sign(s.vx)*40,tx=Math.floor(nose/T),ty=Math.floor(s.y/T);if(at(tx,ty)!=="W"||near(tx,ty,1,q=>q!=="W"))s.vx*=-1;s.x+=s.vx*dt;s.y+=Math.sin(t*.6)*3*dt;
 const img=sharkF[Math.floor(t*3)%4],px=Math.round(s.x-36-cx),py=Math.round(s.y-13-cy);if(px<-80||px>VW+80||py<-40||py>VH+40)return;
 g.save();g.globalAlpha=s.a*.95;if(s.vx>0){g.translate(px+72,py);g.scale(-1,1);g.drawImage(img,0,0)}else g.drawImage(img,px,py);g.restore();
 g.fillStyle="rgba(150,210,255,"+(.28*s.a).toFixed(2)+")";for(let i=0;i<4;i++){const o=Math.round((t*14+i*19)%72);g.fillRect(px+o-6,py+4+i*5,10,1)}
 if(s.st==="up"||s.st==="down"){for(let k=0;k<2;k++){const r=10+((t*18+k*14)%30);g.strokeStyle="rgba(232,246,255,"+(.5*(1-r/40)).toFixed(2)+")";g.beginPath();g.ellipse(s.x-cx,s.y-cy,r*1.6,r*.6,0,0,7);g.stroke()}}
 if(s.a>.6&&Math.floor(t*2)%3===0)R("#ffffff",Math.round(s.x-cx+(s.vx<0?-30:30)),Math.round(s.y-cy-6+Math.sin(t*5)*2),2,2,g)}
function spotShark(){if(!shark.seen){shark.seen=true;toast(L10.toastShark)}say("shark")}
const hero={};["down","up","left","right"].forEach(d=>hero[d]=[0,1,2,3].map(p=>H.render(d,p)));
const pf=H.portrait();["face","dPf","menuPf"].forEach(id=>{const c=document.getElementById(id);c.getContext("2d").drawImage(pf,0,0)});
/* ---------- ground prerender ---------- */
const ground=document.createElement("canvas");ground.width=MW*T;ground.height=MH*T;const gg=ground.getContext("2d");
const R=(c,x,y,w,h,ctx=gg)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
const COL={G:["#5fae43","#72c24d","#88d45a","#a6e472"],H:["#6cb84a","#80cc55","#96dc62","#b4ec7e"],P:["#c9a066","#dcb87e","#ead09a","#f6e2b6"],S:["#9c968e","#b8b2a8","#cec8be","#e2ddd2"],B:["#e2c27e","#efd496","#f7e2ae","#fff0c8"],F:["#7a4a2c","#8e5a36","#a06a42","#4fa040"]};
const grassy=c=>c==="G"||c==="H";
function grassTile(px,py,c){const p=COL[c];R(p[1],px,py,T,T);
 for(let i=0;i<14;i++){const x=px+Math.floor(hash(px+i,py,1)*T),y=py+Math.floor(hash(px,py+i,2)*T);const k=hash(x,y,5);R(k<.45?p[0]:k<.85?p[2]:p[3],x,y,k<.45?1:2,k<.45?2:1)}
 if(hash(px,py,9)<.09){const x=px+4+Math.floor(hash(px,py,4)*14),y=py+4+Math.floor(hash(py,px,4)*14),fc=["#fff","#ffe14a","#ff7aa8","#a8c8ff"][Math.floor(hash(x,y)*4)];R(fc,x,y,2,2);R(fc,x+3,y+2,2,2);R("#3d8a34",x+1,y+2,1,2)}
 if(hash(px,py,11)<.07){const x=px+6,y=py+10;R(p[0],x,y,1,3);R(p[0],x+2,y-1,1,4);R(p[0],x+4,y,1,3);R(p[3],x+2,y-1,1,1)}}
function speckTile(px,py,c,n){const p=COL[c];R(p[1],px,py,T,T);for(let i=0;i<n;i++){const x=px+Math.floor(hash(px+i,py,3)*T),y=py+Math.floor(hash(px,py+i,6)*T),k=hash(x,y,8);R(k<.5?p[0]:p[2],x,y,k<.2?2:1,1)}}
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const c=at(x,y),px=x*T,py=y*T;
 if(grassy(c)||c==="S")grassTile(px,py,grassy(c)?c:"G");
 else if(c==="P")speckTile(px,py,"P",12);
 else if(c==="B"){speckTile(px,py,"B",8);if(near(x,y,1,q=>q==="W"))R("rgba(160,120,60,.18)",px,py,T,T)}
 else if(c==="T"){R("#7a4a2c",px,py,T,T);for(let r=0;r<3;r++){R("#5e3820",px,py+r*8+6,T,2);const fc=[["#ff3a4a","#c81e30"],["#ffd23a","#d8a010"],["#ff8ad0","#d04a9a"],["#fff","#d8d8e8"]][(y*3+r+(x>28?2:0))%4];for(let i=0;i<4;i++){const tx=px+2+i*6,ty=py+r*8;R("#3d8a34",tx+1,ty+3,1,4);R("#58a840",tx+2,ty+5,2,1);R(fc[0],tx,ty,3,3);R(fc[1],tx,ty+2,3,1);R(fc[1],tx+1,ty,1,1)}}}
 else if(c==="F"){R(COL.F[1],px,py,T,T);for(let r=0;r<4;r++){R(COL.F[0],px,py+r*6+4,T,2);if(hash(x,r)<.8)for(let i=0;i<4;i++){R(COL.F[3],px+3+i*6,py+r*6+1,2,2);R("#7cc95a",px+3+i*6,py+r*6+1,1,1)}}}
 else if(c==="c"){const top=at(x,y-1)!=="c";R(top?"#a8805a":"#8e6a48",px,py,T,T);for(let i=0;i<5;i++){const sx=px+Math.floor(hash(x,i,y)*T);R("#6e5034",sx,py+(top?6:0),1,T-(top?6:0));R("#c49a6c",sx+1,py+(top?7:1),1,6)}
  if(top){R(COL.H[1],px,py,T,4);for(let i=0;i<T;i+=3)R(COL.H[1],px+i,py+4,2,1+Math.floor(hash(px+i,py)*3));R("#3d6e2c",px,py+5,T,1)}else{R("rgba(0,0,0,.18)",px,py+T-4,T,4)}}
 else if(c==="s"){R("#9c968e",px,py,T,T);for(let i=0;i<4;i++){R("#cec8be",px,py+i*6,T,4);R("#e2ddd2",px,py+i*6,T,1);R("#6e6a62",px,py+i*6+4,T,1)}}
 else R("#2f86d8",px,py,T,T);
}
// grass edges onto paths / sand / plaza
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const c=at(x,y);if(!grassy(c))continue;const px=x*T,py=y*T,p=COL[c];
 const nb=[[0,-1],[0,1],[-1,0],[1,0]].map(([dx,dy])=>{const q=at(x+dx,y+dy);return"PBTFs".includes(q)});
 if(nb[0])for(let i=0;i<T;i++){const h=hash(px+i,py,13)<.3?1:0;R("#3f8a30",px+i,py-h,1,1)}
 if(nb[1])for(let i=0;i<T;i++){const h=1+Math.floor(hash(px+i,py,14)*2.4);R(p[1],px+i,py+T,1,h-1);R("#3f8a30",px+i,py+T+h-1,1,1)}
 if(nb[2])for(let i=0;i<T;i++){R("#3f8a30",px-1,py+i,1,1)}
 if(nb[3])for(let i=0;i<T;i++){R("#3f8a30",px+T,py+i,1,1)}}
// round off convex corners (grass over path/sand, land over water)
{const rank=c=>c==="W"||c==="f"?0:c==="B"?1:c==="P"?1.5:c==="G"||c==="H"||c==="S"?2:-1,low={W:"#3a92e2",f:"#3a92e2",B:COL.B[1],P:COL.P[1]};
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const c=at(x,y),r=rank(c);if(r<1)continue;
  for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const a=at(x+sx,y),b=at(x,y+sy);if(a!==b||!low[a]||rank(a)>=r||at(x+sx,y+sy)!==a)continue;
   const ox=x*T+(sx<0?0:T-8),oy=y*T+(sy<0?0:T-8),ccx=sx<0?x*T+8:x*T+T-8,ccy=sy<0?y*T+8:y*T+T-8;
   for(let j=0;j<8;j++)for(let i=0;i<8;i++){const px=ox+i,py=oy+j,d=Math.hypot(px+.5-ccx,py+.5-ccy);if(d>8)R(low[a],px,py,1,1);else if(d>7&&r===2)R("#3f8a30",px,py,1,1)}}}}
// round cobbled plaza
{const pcx=28*T,pcy=20*T,rr=3.9*T;for(let y=Math.floor(pcy-rr-2);y<pcy+rr+2;y++)for(let x=Math.floor(pcx-rr-2);x<pcx+rr+2;x++){const dx=x+.5-pcx,dy=y+.5-pcy,d=Math.hypot(dx,dy);if(d>rr+1)continue;
 if(d>rr){R("#3f8a30",x,y,1,1);continue}if(d>rr-3){R(d>rr-1?"#8a847c":"#b0aaa0",x,y,1,1);continue}
 const ring=Math.floor(d/7),seg=Math.floor((Math.atan2(dy,dx)+Math.PI)/(Math.PI*2)*(6+ring*6)+(ring%2)*.5),inR=d-ring*7,k=hash(ring,seg,4);
 const mortar=inR<1||Math.abs(((Math.atan2(dy,dx)+Math.PI)/(Math.PI*2)*(6+ring*6)+(ring%2)*.5)%1)<(.9/Math.max(1,d))*3;R(mortar?"#a29c92":k<.33?"#c6c0b6":k<.66?"#d2ccc2":"#dcd6cc",x,y,1,1);if(!mortar&&inR<2)R("#e8e3da",x,y,1,1)}}
// cliff contact shadow on lower ground
for(let x=0;x<MW;x++)if(at(x,13)==="c"&&at(x,14)!=="c")R("rgba(0,0,0,.2)",x*T,14*T,T,3);
const isWater=(x,y)=>{const c=at(x,y);return c==="W"||c==="f"};
/* ---------- buildings ---------- */
function sign(ctx,text,cx,y,bg,fg){ctx.font="8px 'Press Start 2P'";const w=Math.ceil(ctx.measureText(text).width);R("#2b1d2e",cx-w/2-5,y-2,w+10,14,ctx);R(bg,cx-w/2-4,y-1,w+8,12,ctx);ctx.fillStyle=fg;ctx.fillText(text,Math.round(cx-w/2),y+9)}
function win(ctx,x,y,w,h,lit){R("#2b1d2e",x-1,y-1,w+2,h+2,ctx);R(lit?"#ffe9a0":"#7fc4f0",x,y,w,h,ctx);R(lit?"#ffd060":"#5aa4dc",x,y+h/2,w,h/2,ctx);R("rgba(255,255,255,.7)",x+1,y+1,2,h-2,ctx);R("#2b1d2e",x+Math.floor(w/2),y,1,h,ctx);R("#e8e2d8",x-1,y+h+1,w+2,2,ctx)}
function roofRows(ctx,x,y,w,h,cols){for(let r=0;r<h;r+=4){const inset=Math.round((h-r)*.06);R(cols[(r/4)%2?1:0],x+inset,y+r,w-inset*2,4,ctx);for(let i=x+inset+((r/4)%2?3:0);i<x+w-inset;i+=7)R(cols[2],i,y+r+3,1,1,ctx);R(cols[3],x+inset,y+r,w-inset*2,1,ctx)}R("#2b1d2e",x,y+h,w,2,ctx)}
function drawBuilding(b){const W=b.w*T,Hh=b.h*T+28,c=document.createElement("canvas");c.width=W;c.height=Hh;const x=c.getContext("2d"),oy=28;
 const wall=(col,col2,y0)=>{R("#2b1d2e",1,y0-1,W-2,Hh-y0+1,x);R(col,2,y0,W-4,Hh-y0-1,x);R(col2,2,Hh-6,W-4,5,x)};
 const door=(col)=>{const dx=Math.floor(b.w/2)*T-(b.w%2?-T/2:0)-9;R("#2b1d2e",dx-1,Hh-27,20,27,x);R(col,dx,Hh-26,18,26,x);R("rgba(255,255,255,.18)",dx+2,Hh-24,2,22,x);R("#ffd23a",dx+14,Hh-14,2,2,x);R("#8e8a82",dx-3,Hh-2,24,2,x)};
 if(b.kind==="tower"){const ry=oy+18;R("#2b1d2e",4,oy-2,W-8,22,x);R("#8a6ad8",6,oy,W-12,18,x);R("#b49af0",6,oy,W-12,3,x);R("#6a4ab8",6,oy+15,W-12,3,x);
  wall("#f4f2fa","#cfcbe0",ry);for(let fl=0;fl<3;fl++)for(let i=0;i<5;i++){const wx=12+i*((W-24)/5),wy=ry+8+fl*24;R("#2b1d2e",wx-1,wy-1,((W-24)/5)-4,16,x);const gr=x.createLinearGradient(0,wy,0,wy+14);gr.addColorStop(0,"#bfe6ff");gr.addColorStop(1,"#5aa0e0");x.fillStyle=gr;x.fillRect(wx,wy,((W-24)/5)-6,14);R("rgba(255,255,255,.75)",wx+2,wy+2,2,8,x);R("rgba(255,255,255,.5)",wx+5,wy+2,1,5,x)}
  R("#8a6ad8",2,Hh-36,W-4,4,x);door("#5a3ea8");
  R("#fff",W/2-14,2,28,18,x);R("#2b1d2e",W/2-15,1,30,1,x);R("#2b1d2e",W/2-15,20,30,1,x);R("#2b1d2e",W/2-15,1,1,20,x);R("#2b1d2e",W/2+14,1,1,20,x);R("#fff",W/2-6,21,6,4,x);R("#2b1d2e",W/2-6,24,6,1,x);x.font="8px 'Press Start 2P'";x.fillStyle="#6a4ab8";x.fillText("Aa",W/2-8,15);
  sign(x,"LOCALEO",W/2,oy+4,"#fff","#5a3ea8")}
 if(b.kind==="brick"){const ry=oy+30;roofRows(x,0,oy-8,W,38,["#4a4e5c","#3a3e4a","#2a2e38","#6a6e7e"]);wall("#b0573a","#8a4028",ry);for(let r=ry+2;r<Hh-6;r+=5)for(let i=4+((r/5)%2?4:0);i<W-6;i+=9)R("#8e4430",i,r,7,1,x);
  [[10,ry+10],[W-40,ry+10]].forEach(([wx,wy])=>{R("#2b1d2e",wx-1,wy-1,32,22,x);R("#1a2a4a",wx,wy,30,20,x);R("#3ad0ff",wx+3,wy+4,10,7,x);R("#9a6aff",wx+16,wy+5,10,6,x);R("#2b1d2e",wx+7,wy+12,2,4,x);R("#2b1d2e",wx+20,wy+12,2,4,x);R("rgba(255,255,255,.35)",wx+1,wy+1,2,18,x)});
  door("#3a2e2a");R("#2b1d2e",W/2-20,ry-2,40,14,x);x.font="8px 'Press Start 2P'";x.fillStyle="#7dff8a";x.shadowColor="#7dff8a";x.shadowBlur=4;x.fillText("</>",W/2-12,ry+9);x.shadowBlur=0;sign(x,"DEBUGGED",W/2,oy+2,"#ffd7a8","#5a2a10")}
 if(b.kind==="gym"){const ry=oy+26;roofRows(x,0,oy-6,W,32,["#2a78d8","#1e60b8","#14489a","#5aa0f0"]);wall("#f2f2f6","#cfd2dc",ry);win(x,12,ry+12,26,18);win(x,W-38,ry+12,26,18);door("#2a4a8a");
  R("#2b1d2e",W/2-16,ry+4,32,8,x);R("#9aa0aa",W/2-10,ry+7,20,2,x);R("#3a3a42",W/2-14,ry+5,4,6,x);R("#3a3a42",W/2+10,ry+5,4,6,x);sign(x,"FITNESS",W/2,oy,"#fff","#1e60b8")}
 if(b.kind==="barn"){const ry=oy+30;R("#2b1d2e",0,oy-10,W,42,x);for(let r=0;r<40;r+=4){const inset=Math.max(0,Math.round(20-r*.9));R(r%8?"#7a2a20":"#8e3428",inset,oy-9+r,W-inset*2,4,x)}R("#f2eee4",W/2-6,oy+2,12,12,x);R("#2b1d2e",W/2-5,oy+3,10,10,x);R("#e0c060",W/2-4,oy+4,8,8,x);
  wall("#b83a2e","#8a2a20",ry);for(let i=6;i<W-6;i+=6)R("#9a2e24",i,ry,1,Hh-ry-6,x);R("#f2eee4",2,ry,W-4,2,x);
  const dx=W/2-16,dy=Hh-30;R("#2b1d2e",dx-1,dy-1,34,31,x);R("#f2eee4",dx,dy,32,30,x);R("#b83a2e",dx+3,dy+3,12,24,x);R("#b83a2e",dx+17,dy+3,12,24,x);x.strokeStyle="#f2eee4";x.lineWidth=2;x.beginPath();x.moveTo(dx+3,dy+3);x.lineTo(dx+15,dy+27);x.moveTo(dx+15,dy+3);x.lineTo(dx+3,dy+27);x.moveTo(dx+17,dy+3);x.lineTo(dx+29,dy+27);x.moveTo(dx+29,dy+3);x.lineTo(dx+17,dy+27);x.stroke();
  win(x,10,ry+10,16,14);win(x,W-26,ry+10,16,14);sign(x,"D-CARE",W/2,oy+16,"#7cf2d4","#0e4a40")}
 if(b.kind==="hut"){const ry=oy+22;roofRows(x,0,oy-4,W,26,["#e8c070","#d0a050","#a87a30","#f8dc90"]);wall("#3ab6b4","#2a9294",ry);for(let i=4;i<W-4;i+=5)R("#2a9294",i,ry,1,Hh-ry-6,x);win(x,8,ry+8,16,14);door("#1e6e70");
  R("#ff7a8a",W-26,ry+6,4,10,x);R("#ff7a8a",W-30,ry+8,4,3,x);R("#ff7a8a",W-22,ry+9,4,3,x);sign(x,"REEF",W/2,oy+2,"#fff","#1e6e70")}
 return c}
let bImgs={};const buildImgs=()=>B.forEach(b=>bImgs[b.id]=drawBuilding(b));buildImgs();document.fonts&&document.fonts.ready.then(buildImgs);
/* ---------- state ---------- */
const P={x:27,y:23,fx:27,fy:23,dir:"down",moving:false,tx:0,ty:0,walkT:0,path:[],after:null};
const L10=JSON.parse(document.getElementById("hw-data").textContent),INFO=L10.info,LINKS=L10.links,QUESTS=new Set(["localeo","debugged","dcare","fitness","reef","mail"]);
const visited=new Set();
const dlg=document.getElementById("dlg"),dTx=document.getElementById("dTx"),dCh=document.getElementById("dCh");let typing=null,talking=false,full="",cur=null;
function choices(){const d=cur;if(!d)return;const ext=/^https?:/.test(d.u||"");
 dCh.innerHTML=d.u?`<a class="go" href="${d.u}"${ext?' target="_blank" rel="noopener"':""}>${d.cta} ▶</a><button type="button">${L10.later}</button>`:`<button type="button" class="go">${L10.ok}</button>`;dCh.querySelectorAll("button").forEach(b=>b.onclick=close)}
function finishTyping(){clearInterval(typing);typing=null;dTx.textContent=full;choices()}
function say(id){const d={...INFO[id],u:LINKS[id],q:QUESTS.has(id)};cur=d;full=d.t;talking=true;dlg.classList.add("on");dTx.textContent="";dCh.innerHTML="";clearInterval(typing);let i=0;
 if(RM){typing=1;finishTyping()}else typing=setInterval(()=>{i+=2;dTx.textContent=full.slice(0,i);if(i>=full.length)finishTyping()},16);
 if(d.q&&!visited.has(id)){visited.add(id);document.getElementById("cnt").textContent=visited.size+"/6";renderQuests();if(visited.size===6)toast(L10.toastAll)}}
function close(){dlg.classList.remove("on");talking=false}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2600)}
function tryMove(dx,dy){if(P.moving||talking)return;P.dir=dx>0?"right":dx<0?"left":dy>0?"down":"up";const nx=P.x+dx,ny=P.y+dy;
 if(walk(nx,ny)){P.tx=nx;P.ty=ny;P.moving=true;return true}const b=bump[nx+","+ny];if(b){P.path=[];say(b)}return false}
function bfs(goals){const k=(x,y)=>y*MW+x,prev=new Int32Array(MW*MH).fill(-2),q=[[P.x,P.y]];prev[k(P.x,P.y)]=-1;let hit=null;
 while(q.length){const[x,y]=q.shift();if(goals.some(([gx,gy])=>gx===x&&gy===y)){hit=[x,y];break}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||prev[k(nx,ny)]!==-2||!walk(nx,ny))continue;prev[k(nx,ny)]=k(x,y);q.push([nx,ny])}}
 if(!hit)return[];const out=[];let c=k(...hit);while(prev[c]!==-1){out.unshift([c%MW,(c/MW)|0]);c=prev[c]}return out}
function goTo(tx,ty){close();let id=bump[tx+","+ty];const b=B.find(b=>tx>=b.x&&tx<b.x+b.w&&ty>=b.y&&ty<b.y+b.h);if(b){id=b.id;[tx,ty]=b.door}
 if(id||!walk(tx,ty)){const goals=[[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy])=>[tx+dx,ty+dy]).filter(([x,y])=>walk(x,y)||(x===P.x&&y===P.y));P.path=bfs(goals);P.after=id?[tx,ty]:null}
 else{P.path=bfs([[tx,ty]]);P.after=null}}
cv.addEventListener("pointerdown",e=>{if(menuOpen)return;if(!started)return start();const wx=e.clientX/zoom+cam.x,wy=e.clientY/zoom+cam.y;if(shark.a>.35&&Math.abs(wx-shark.x)<40&&Math.abs(wy-shark.y)<18){spotShark();return}const tx=Math.floor((e.clientX/zoom+cam.x)/T),ty=Math.floor((e.clientY/zoom+cam.y)/T);goTo(tx,ty)});
const keys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],W:[0,-1],S:[0,1],A:[-1,0],D:[1,0]};const held=[];
addEventListener("keydown",e=>{if(hw.hidden||e.ctrlKey||e.metaKey||e.altKey)return;
 const ae=document.activeElement,onCtl=!!(ae&&ae!==document.body&&ae.closest&&ae.closest("a,button"));
 if(!started){if(e.key==="Tab"||e.key==="Shift"||onCtl)return;e.preventDefault();start();return}
 if(e.key==="Escape"){if(menuOpen)toggleMenu(false);else close();return}
 if(e.key==="m"||e.key==="M"){toggleMenu();return}
 if(menuOpen)return;
 if(keys[e.key]){e.preventDefault();if(onCtl)ae.blur();if(!held.includes(e.key))held.push(e.key);P.path=[];if(talking&&!typing)close()}
 if(e.key==="Enter"||e.key===" "||e.key==="e"||e.key==="E"){if(onCtl&&(e.key==="Enter"||e.key===" "))return;e.preventDefault();
  if(talking){if(typing)finishTyping();else{const a=dCh.querySelector(".go");if(a&&a.tagName==="A")a.click();close()}}
  else{const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[P.dir];const b=bump[(P.x+d[0])+","+(P.y+d[1])];if(b)say(b)}}});
addEventListener("keyup",e=>{const i=held.indexOf(e.key);if(i>=0)held.splice(i,1)});
/* ---------- menu ---------- */
let menuOpen=false;const menu=document.getElementById("menu");
function toggleMenu(v){const was=menuOpen;menuOpen=v==null?!menuOpen:v;menu.classList.toggle("on",menuOpen);if(menuOpen&&!was){held.length=0;menu.querySelector(".tabs button[aria-selected=true]").focus()}else if(!menuOpen&&was)document.getElementById("menuBtn").focus()}
document.getElementById("menuBtn").onclick=()=>toggleMenu(true);document.getElementById("menuX").onclick=()=>toggleMenu(false);menu.addEventListener("click",e=>{if(e.target===menu)toggleMenu(false)});
document.querySelectorAll(".tabs button[data-p]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button[data-p]").forEach(o=>o.setAttribute("aria-selected",o===b));document.querySelectorAll(".pane").forEach(p=>p.classList.toggle("on",p.dataset.p===b.dataset.p))});
function renderQuests(){document.querySelectorAll("#hw [data-q]").forEach(e=>e.classList.toggle("is-visited",visited.has(e.dataset.q)))}
/* ---------- minimap ---------- */
const mini=document.getElementById("mini"),mc=mini.getContext("2d");mini.width=MW*3;mini.height=MH*3;
const MCOL={W:"#3a8fe0",f:"#9fdcff",B:"#f2dca0",G:"#6cc04a",H:"#84d05a",c:"#a8805a",P:"#e8cc94",S:"#d0cac0",D:"#b07a44",T:"#ff6a8a",F:"#8e5a36",s:"#d0cac0"};
const miniBase=document.createElement("canvas");miniBase.width=MW*3;miniBase.height=MH*3;const mb=miniBase.getContext("2d");
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){mb.fillStyle=MCOL[at(x,y)]||"#000";mb.fillRect(x*3,y*3,3,3)}trees.forEach(t=>{mb.fillStyle="#2e7a38";mb.fillRect(t.x*3,t.y*3,3,3)});B.forEach(b=>{mb.fillStyle="#2b1d2e";mb.fillRect(b.x*3-1,b.y*3-1,b.w*3+2,b.h*3+2);mb.fillStyle={localeo:"#a88af0",debugged:"#d07a4a",fitness:"#3a8af0",dcare:"#c43e32",reef:"#3ab6b4"}[b.id];mb.fillRect(b.x*3,b.y*3,b.w*3,b.h*3)});
mini.addEventListener("click",e=>{const r=mini.getBoundingClientRect();goTo(Math.floor((e.clientX-r.left)/r.width*MW),Math.floor((e.clientY-r.top)/r.height*MH))});
/* ---------- render loop ---------- */
const cam={x:P.x*T-VW/2,y:P.y*T-VH/2};let started=false,last=performance.now();
const pigs=[{x:16.4*T,y:25.4*T,v:12,d:1},{x:17.6*T,y:27*T,v:-9,d:-1}];
const clouds=[...Array(5)].map((_,i)=>({x:hash(i,1)*MW*T,y:hash(i,2)*MH*T,r:60+hash(i,3)*60}));
function shadow(x,y,w){g.fillStyle="rgba(20,40,20,.22)";for(let i=0;i<4;i++){const ww=Math.round(w*Math.sqrt(1-((i-1.5)/2)**2));g.fillRect(Math.round(x-ww/2),Math.round(y-2+i),ww,1)}}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const t=RM?0:now/1000;
 if(started&&!menuOpen){
  if(!P.moving&&!talking){if(P.path.length){const[nx,ny]=P.path.shift();tryMove(nx-P.x,ny-P.y)}else if(P.after){const[ax,ay]=P.after;P.after=null;tryMove(Math.sign(ax-P.x),Math.sign(ay-P.y))}else if(held.length)tryMove(...keys[held[held.length-1]])}
  if(P.moving){P.walkT+=dt;const sp=5.5*dt,dx=P.tx-P.fx,dy=P.ty-P.fy;if(Math.abs(dx)+Math.abs(dy)<=sp){P.fx=P.x=P.tx;P.fy=P.y=P.ty;P.moving=false;const s=step[P.x+","+P.y];if(s){P.path=[];say(s)}}else{P.fx+=Math.sign(dx)*sp;P.fy+=Math.sign(dy)*sp}}else P.walkT=0;
 }
 const tx=P.fx*T+T/2-VW/2,ty=P.fy*T-VH/2+T*.2;const k=RM?1:Math.min(1,dt*(started?7:1.2));cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
 if(!started){cam.x=tx+Math.sin(t*.15)*120;cam.y=ty-40+Math.cos(t*.12)*50}
 cam.x=Math.max(0,Math.min(MW*T-VW,cam.x));cam.y=Math.max(0,Math.min(MH*T-VH,cam.y));const cx=Math.round(cam.x),cy=Math.round(cam.y);
 g.fillStyle="#2f86d8";g.fillRect(0,0,VW,VH);g.drawImage(ground,-cx,-cy);
 // animated water
 const dq=[];
 const x0=Math.max(0,Math.floor(cx/T)),y0=Math.max(0,Math.floor(cy/T)),x1=Math.min(MW-1,Math.ceil((cx+VW)/T)),y1=Math.min(MH-1,Math.ceil((cy+VH)/T));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=at(x,y),px=x*T-cx,py=y*T-cy;
  if(c==="W"){const deep=!near(x,y,2,q=>q!=="W"&&q!=="f");R(deep?"#2a78d0":"#3a92e2",px,py,T,T,g);
   for(let i=0;i<3;i++){const o=(t*(8+i*3)+hash(x,y,i)*40)%40-8;const yy=py+4+i*7+Math.round(Math.sin(t*2+x+i)*1);R(deep?"#4a9ee8":"#68b8f2",px+o,yy,6,1,g);R(deep?"#4a9ee8":"#68b8f2",px+o+2,yy-1,3,1,g)}
   if(hash(x,y,21)<.12&&Math.sin(t*3+x*7+y)>.85)R("#fff",px+Math.floor(hash(x,y,22)*20),py+Math.floor(hash(x,y,23)*20),2,2,g);
   [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy],k)=>{const q=at(x+dx,y+dy);if(q==="W"||q==="f"||q==="D")return;const f=Math.round(1.5+Math.sin(t*2.2+x*.7+y*.5)*1.5);
    if(k===0)R("#e8f6ff",px,py,T,1+f,g);if(k===1)R("#e8f6ff",px,py+T-1-f,T,1+f,g);if(k===2)R("#e8f6ff",px,py,1+f,T,g);if(k===3)R("#e8f6ff",px+T-1-f,py,1+f,T,g)})}
  if(c==="f"){R("#5ab0f0",px,py,T,T,g);for(let i=0;i<6;i++){const sx=px+i*4,o=((t*60+hash(x,i)*24)%T);R("#e8f6ff",sx,py+o,2,6,g);R("#9fd8ff",sx+2,py+((o+12)%T),1,5,g)}if(at(x,y+1)==="W")for(let i=0;i<5;i++)R("#fff",px+hash(i,Math.floor(t*8))*20,py+T+Math.floor(hash(i,Math.floor(t*8)+1)*4),3,2,g)}
  if(c==="D")dq.push([x,y,px,py]);}
 if(!RM)drawShark(dt,t,cx,cy);
 for(const[x,y,px,py]of dq){{const ov=isWater(x,y)||at(x,y)==="D";R("#2b1d2e",px,py,T,T,g);for(let i=0;i<4;i++){R(i%2?"#a8723e":"#b88048",px,py+i*6,T,5,g);R("#d09a5a",px,py+i*6,T,1,g)}if(y===39||at(x,y+1)!=="D"){R("#6a4228",px+1,py+T-2,3,6,g);R("#6a4228",px+T-4,py+T-2,3,6,g)}}}
 // depth-sorted objects
 const L=[];const vis=(x,y,m=80)=>x>cx-m&&x<cx+VW+m&&y>cy-m&&y<cy+VH+m*2;
 trees.forEach(tr=>{const px=tr.x*T+T/2,py=tr.y*T+T;if(!vis(px,py))return;L.push([py,()=>{const img=tr.v?treeB:treeA,sw=Math.round(Math.sin(t*1.2+tr.x)*0.6);shadow(px-cx,py-cy-3,img.width*.7);g.drawImage(img,Math.round(px-img.width/2-cx+sw*0),Math.round(py-img.height+4-cy))}])});
 B.forEach(b=>{const img=bImgs[b.id],px=b.x*T,py=(b.y+b.h)*T;if(!vis(px+img.width/2,py,img.width))return;L.push([py-2,()=>{R("rgba(20,40,20,.25)",px-cx+4,py-cy,img.width-4,4,g);g.drawImage(img,px-cx,py-img.height-cy)}])});
 L.push([21*T,()=>{const fx=28*T-cx,fy=20*T-cy;const disc=(r,ry,col,oy=0)=>{g.fillStyle=col;for(let y=-ry;y<=ry;y++){const w=Math.round(r*Math.sqrt(1-(y/ry)**2));g.fillRect(fx-w,fy+oy+y,w*2,1)}};
  disc(25,15,"#2b1d2e",4);disc(24,14,"#8a847c",4);disc(24,14,"#b8b2a8",2);disc(23,13,"#d6d0c6",1);disc(19,10,"#2b1d2e",1);disc(18,9,"#3a92e2",1);disc(18,4,"#5aaaf0",-3);
  for(let i=0;i<3;i++){const r=((t*10+i*6)%18);g.strokeStyle="rgba(232,246,255,.7)";g.lineWidth=1;g.beginPath();g.ellipse(fx,fy+1,r,r*.5,0,0,7);g.stroke()}
  R("#2b1d2e",fx-4,fy-16,8,18,g);R("#b8b2a8",fx-3,fy-15,6,16,g);R("#e2ddd2",fx-3,fy-15,2,16,g);disc(6,3,"#2b1d2e",-17);disc(5,2,"#d6d0c6",-17);
  for(let i=0;i<14;i++){const ph=(t*1.4+i/14)%1,a=i/14*Math.PI*2,r=ph*16,h=-22+ph*26-Math.sin(ph*Math.PI)*12;R(ph<.5?"#ffffff":"#bfe6ff",fx+Math.cos(a)*r,fy+h+Math.sin(a)*r*.4,2,2,g)}R("#e8f6ff",fx-1,fy-26,2,9,g)}]);
 L.push([24*T,()=>{const px=31*T-cx,py=23*T-cy;R("#2b1d2e",px+10,py+8,4,16,g);R("#2b1d2e",px+3,py-3,18,14,g);R("#d83a32",px+4,py-2,16,12,g);R("#f0604a",px+4,py-2,16,3,g);R("#2b1d2e",px+7,py+3,10,2,g);R("#ffd23a",px+18,py-8,2,8,g);R("#ffd23a",px+18,py-8,5,3,g)}]);
 L.push([23*T,()=>{const px=24*T-cx,py=22*T-cy;R("#5a3a22",px+10,py+6,4,18,g);R("#2b1d2e",px+1,py-1,22,14,g);R("#c8945a",px+2,py,20,12,g);R("#e0b07a",px+2,py,20,2,g);R("#5a3a22",px+5,py+5,14,1,g);R("#5a3a22",px+5,py+8,10,1,g)}]);
 // windmill
 L.push([24*T,()=>{const px=36*T-cx,py=24*T-cy;R("#2b1d2e",px+5,py-58,40,58,g);for(let i=0;i<56;i++){const inset=Math.round((56-i)*.14);R(i%6<3?"#5a6a4a":"#4a5a3e",px+6+inset,py-57+i,38-inset*2,1,g)}R("#f2eee4",px+4,py-22,42,3,g);R("#2b1d2e",px+19,py-14,12,14,g);R("#8a5a36",px+20,py-13,10,13,g);win(g,px+21,py-44,8,8);
  const hx=px+25,hy=py-52;g.save();g.translate(hx,hy);for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.fillStyle="#2b1d2e";g.fillRect(-1,-1,3,36);g.fillStyle="#f6f2ea";g.fillRect(2,8,8,28);g.fillStyle="#c8c0b0";for(let j=10;j<36;j+=5)g.fillRect(2,j,8,1);g.fillRect(5,8,1,28)}g.restore();R("#2b1d2e",hx-3,hy-3,6,6,g);R("#ffd23a",hx-2,hy-2,4,4,g)}]);
 // farm: silo, pen fence, pigs, sensors
 L.push([27*T,()=>{shadow(6*T-cx,27*T-cy-2,30);g.drawImage(silo,5*T+9-cx,27*T-74-cy)}]);
 const fence=(x,y,horiz)=>{const px=x*T-cx,py=y*T-cy;if(horiz){R("#2b1d2e",px,py+9,T,7,g);R("#c8945a",px,py+10,T,2,g);R("#c8945a",px,py+14,T,1,g);R("#8a5a36",px+2,py+4,4,14,g);R("#b07a44",px+2,py+4,4,2,g)}else{R("#8a5a36",px+10,py,4,T,g);R("#b07a44",px+10,py,2,T,g)}};
 for(let x=15;x<=19;x++){L.push([24*T+T,()=>fence(x,24,1)]);L.push([28*T+T,()=>fence(x,28,1)])}for(let y=25;y<=27;y++){L.push([(y+1)*T,()=>fence(15,y,0)]);L.push([(y+1)*T,()=>fence(19,y,0)])}
 const gateway=(px,py,mast)=>{if(mast){R("#2b1d2e",px-2,py-34,5,34,g);R("#8a8e98",px-1,py-33,3,33,g);R("#c0c4ce",px-1,py-33,1,33,g);R("#2b1d2e",px-5,py-3,11,3,g)}
  const by=py-(mast?46:0);R("#2b1d2e",px-8,by-1,17,15,g);R("#f2f4f8",px-7,by,15,13,g);R("#cdd2dc",px-7,by+10,15,3,g);R("#ffffff",px-7,by,15,1,g);
  R("#2b1d2e",px-6,by-10,3,10,g);R("#2b1d2e",px+4,by-13,3,13,g);R("#5a5e68",px-5,by-9,1,8,g);R("#5a5e68",px+5,by-12,1,11,g);R("#2b1d2e",px-6,by-11,3,1,g);R("#2b1d2e",px+4,by-14,3,1,g);
  const on=Math.floor(t*2.5)%2;R(on?"#4cff7a":"#1a6a30",px-4,by+4,2,2,g);R("#7cf2d4",px,by+4,4,2,g);R("#2b1d2e",px+5,by+4,1,2,g);
  for(let k=0;k<3;k++){const ph=(t*.7+k/3)%1,r=5+ph*24;g.strokeStyle="rgba(124,242,212,"+((1-ph)*.85).toFixed(2)+")";g.lineWidth=1;g.beginPath();g.arc(px+5.5,by-14,r,-Math.PI*.82,-Math.PI*.18);g.stroke()}};
 L.push([29*T+1,()=>gateway(19*T+T/2-cx,28*T+T-2-cy,true)]);
 L.push([29*T-1,()=>gateway(15*T-26-cx,29*T-122-cy,false)]);
 pigs.forEach(pg=>{if(!RM)pg.x+=pg.v*dt;if(pg.x<15.8*T||pg.x>18.4*T){pg.v*=-1}pg.d=pg.v>0?1:-1;L.push([pg.y+14,()=>{const img=pigF[Math.floor(t*4)%2];shadow(pg.x-cx+11,pg.y-cy+15,16);g.save();g.translate(Math.round(pg.x-cx+(pg.d<0?22:0)),Math.round(pg.y-cy));g.scale(pg.d,1);g.drawImage(img,0,0);g.restore()}])});
 L.push([31*T,()=>{const px=43*T+6-cx,py=29*T-cy;R("#2b1d2e",px,py-2,6,28,g);R("#ffd23a",px+1,py-1,4,26,g);R("#ff5a7a",px+1,py+8,4,4,g)}]);
 [[30,22],[13,33],[47,25],[33,6]].forEach(([x,y])=>{if(walk(x,y)||at(x,y)==="G"){L.push([(y+1)*T,()=>g.drawImage(rock,x*T-cx,y*T+4-cy)])}});
 bushes.forEach(b=>{const px=b.x*T-4,py=b.y*T;if(!vis(px,py))return;L.push([py+T,()=>{shadow(px+16-cx,py+T-1-cy,26);g.drawImage(bush[0],px-cx,py-2-cy);if(b.v){R("#e83a4a",px+9-cx,py+6-cy,2,2,g);R("#e83a4a",px+19-cx,py+9-cy,2,2,g);R("#e83a4a",px+14-cx,py+3-cy,2,2,g)}}])});
 lamps.forEach(l=>{const px=l.x*T+T/2-cx,py=l.y*T+T-cy;L.push([l.y*T+T,()=>{shadow(px,py-2,10);R("#2b1d2e",px-2,py-34,5,34,g);R("#4a4a58",px-1,py-33,3,32,g);R("#2b1d2e",px-5,py-42,11,9,g);R("#ffe9a0",px-4,py-41,9,7,g);R("#fff6d0",px-3,py-40,3,3,g);R("#2b1d2e",px-6,py-44,13,2,g);R("#2b1d2e",px-4,py-3,9,3,g)}])});
 // player
 {const fr=P.moving?[1,2,3,0][Math.floor(P.walkT*8)%4]:0,img=hero[P.dir][fr],px=Math.round(P.fx*T+T/2-16-cx),py=Math.round(P.fy*T+T-46-cy);L.push([P.fy*T+T-1,()=>{shadow(px+16,py+46,18);g.drawImage(img,px,py)}])}
 L.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
 // ear tag -> gateway data packets
 if(!RM){const gws=[[19*T+T/2+5,28*T+T-2-46-14],[15*T-26+5,29*T-122-14]];pigs.forEach((pg,i)=>{const tx=pg.x+(pg.d>0?15:7),ty=pg.y+6,ph=(t*.6+i*.5)%1.6;if(ph>1)return;const[gx,gy]=gws[i%2];
  if(ph<.15){g.strokeStyle="rgba(255,210,58,"+(1-ph/.15).toFixed(2)+")";g.beginPath();g.arc(tx-cx,ty-cy,3+ph*40,0,7);g.stroke()}
  for(let k=0;k<3;k++){const q=Math.max(0,ph-k*.05);if(q<=0)continue;const x=tx+(gx-tx)*q,y=ty+(gy-ty)*q-Math.sin(q*Math.PI)*22;R(k?"rgba(124,242,212,.5)":"#7cf2d4",x-cx-1,y-cy-1,k?2:3,k?2:3,g)}})}
 // minimap
 mc.drawImage(miniBase,0,0);const blink=Math.floor(t*3)%2;mc.fillStyle="rgba(255,255,255,.9)";mc.strokeStyle="#fff";mc.lineWidth=1;mc.strokeRect(cx/T*3+.5,cy/T*3+.5,VW/T*3,VH/T*3);mc.fillStyle=blink?"#ff3a4a":"#fff";mc.fillRect(Math.round(P.fx*3)-1,Math.round(P.fy*3)-1,4,4);
  if(running&&!document.hidden)requestAnimationFrame(frame);else rafOn=false}
function run(){if(rafOn||!running)return;rafOn=true;last=performance.now();requestAnimationFrame(frame)}
document.addEventListener("visibilitychange",run);
/* ---------- start, skip, play, resume ---------- */
const title=document.getElementById("title"),plain=document.getElementById("plain");
function start(){if(started)return;started=true;title.classList.add("off");setTimeout(()=>say("intro"),RM?0:700)}
title.addEventListener("click",e=>{if(e.target.closest("a,button"))return;start()});
const store={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
function showGame(){hw.hidden=false;document.documentElement.classList.add("hw-on");plain.inert=true;plain.setAttribute("aria-hidden","true");running=true;resize();run()}
function hideGame(){close();toggleMenu(false);hw.hidden=true;document.documentElement.classList.remove("hw-on");plain.inert=false;plain.removeAttribute("aria-hidden");running=false;held.length=0}
document.querySelectorAll("[data-skip]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();store.set("hw-skip","1");hideGame();const h=plain.querySelector("h1");h.tabIndex=-1;h.focus();scrollTo(0,0)}));
document.querySelectorAll("[data-play]").forEach(b=>b.addEventListener("click",()=>{store.del("hw-skip");showGame();start()}));
document.querySelectorAll("#hw [data-lang]").forEach(a=>a.addEventListener("click",()=>store.set("hw-resume",JSON.stringify({x:P.x,y:P.y,dir:P.dir,v:[...visited]}))));
{const r=store.get("hw-resume");store.del("hw-resume");
 if(r){try{const s=JSON.parse(r);if(walk(s.x,s.y)){P.x=P.fx=s.x;P.y=P.fy=s.y}P.dir=s.dir||"down";(s.v||[]).forEach(v=>QUESTS.has(v)&&visited.add(v));document.getElementById("cnt").textContent=visited.size+"/6";renderQuests()}catch(e){}
  started=true;title.classList.add("off");title.style.display="none";cam.x=P.fx*T+T/2-VW/2;cam.y=P.fy*T-VH/2}
 if(r||!store.get("hw-skip"))showGame()}
})();
