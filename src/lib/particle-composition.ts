export type ParticleComposition = {x:number;y:number;scale:number;quiet:number};
export type ParticleStop = ParticleComposition & {at:number};
/** Sample stable section boxes only when layout changes, not on every drawing frame. */
export function measureParticleComposition(pathname:string):ParticleStop[] {
 const home = pathname === "/";
 const selectors = home ? [
   {selector:"#the-app",x:.70,y:.43,scale:.72,quiet:.86},
   {selector:"#experience",x:.22,scale:.83,quiet:.62},
   {selector:"#how-it-works",x:.18,scale:.80,quiet:.64},
   {selector:"#together",x:.22,scale:.76,quiet:.58},
   {selector:"#getting-started",x:.82,scale:.74,quiet:.48},
   {selector:"#download",x:.22,scale:.78,quiet:.55},
   {selector:".glass-footer",x:.79,scale:.64,quiet:.52},
 ] : [
   {selector:"main",x:.84,scale:.79,quiet:.78},
   {selector:".glass-footer",x:.80,scale:.62,quiet:.65},
 ];
 const stops:ParticleStop[]=[];
 for(const item of selectors){
   const element=document.querySelector(item.selector);if(!element)continue;
   const box=element.getBoundingClientRect();
   const content=element.classList.contains("container")?element:element.querySelector(".container")??element;
   const bounds=content.getBoundingClientRect();
   const x=(bounds.left+bounds.width*item.x)/innerWidth;
   stops.push({at:box.top+scrollY+Math.min(box.height*.28,innerHeight*.24),x,y:item.y ?? .52,scale:item.scale,quiet:item.quiet});
 }
 return stops.sort((a,b)=>a.at-b.at);
}
export function particleCompositionAt(stops:ParticleStop[],scroll:number):ParticleComposition {
 if(!stops.length)return{x:.70,y:.52,scale:.86,quiet:.8};
 const focus=scroll+innerHeight*.48;
 const next=stops.findIndex(stop=>stop.at>focus);
 if(next===0)return stops[0];
 if(next===-1)return stops[stops.length-1];
 const a=stops[next-1],b=stops[next];
 const t=Math.min(1,Math.max(0,(focus-a.at)/Math.max(1,b.at-a.at)));
 const eased=t*t*(3-2*t);
 return{x:a.x+(b.x-a.x)*eased,y:a.y+(b.y-a.y)*eased,scale:a.scale+(b.scale-a.scale)*eased,quiet:a.quiet+(b.quiet-a.quiet)*eased};
}
