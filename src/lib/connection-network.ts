/** Original human-shaped point surfaces. Projected into SVG: no second GPU context. */
export type NetworkPoint = {x:number;y:number;z:number;side:number};
const TAU = Math.PI * 2;
const points: NetworkPoint[] = [];
function ellipsoid(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number,count:number,side:number,lean=0) {
  for(let i=0;i<count;i++) {
    const y=1-2*(i+.5)/count, radius=Math.sqrt(1-y*y), angle=i*2.3999632297;
    points.push({x:cx+Math.cos(angle)*radius*rx+y*lean,y:cy+y*ry,z:cz+Math.sin(angle)*radius*rz,side});
  }
}
for(const side of [-1,1]) {
  // Head, neck, torso, relaxed arms and legs retain a recognizable human anatomy.
  ellipsoid(0,-117,0,24,31,23,160,side);
  ellipsoid(0,-81,0,10,13,11,36,side);
  ellipsoid(0,-25,0,42,53,22,270,side);
  ellipsoid(0,24,0,29,21,19,70,side);
  for(const limb of [-1,1]) {
    ellipsoid(limb*48,-26,0,11,48,12,85,side,-limb*9);
    ellipsoid(limb*17,91,0,13,57,14,120,side,-limb*3);
  }
}
const joints = [[0,-117,0],[0,-78,0],[0,-24,0],[-36,-65,0],[36,-65,0],[-51,-15,0],[51,-15,0],[-56,18,0],[56,18,0],[-17,30,0],[17,30,0],[-19,91,0],[19,91,0],[-20,145,0],[20,145,0]];
const bones = [[0,1],[1,2],[1,3],[1,4],[3,5],[4,6],[5,7],[6,8],[2,9],[2,10],[9,11],[10,12],[11,13],[12,14]];
export function connectionFrame(progress:number) {
  const p=Math.max(0,Math.min(1,progress)), angle=Math.sin(p*Math.PI)*.35-.16;
  const project=(x:number,y:number,z:number,side:number) => {
    const turn=angle*side, nx=x*Math.cos(turn)+z*Math.sin(turn), nz=z*Math.cos(turn)-x*Math.sin(turn);
    const lens=650/(650-nz), center=side<0?172:548;
    return {x:center+nx*lens,y:245+y*lens,z:nz};
  };
  const layers=Array.from({length:6},()=>"");
  for(const point of points) {
    const q=project(point.x,point.y,point.z,point.side), layer=(point.side<0?0:3)+(q.z>10?2:q.z< -10?0:1);
    // A short round-capped stroke is a particle, batching hundreds into six paths.
    layers[layer]+='M'+q.x.toFixed(1)+','+q.y.toFixed(1)+'h.1';
  }
  const skeletons=[-1,1].map(side=>bones.map(([a,b])=>{
    const from=project(joints[a][0],joints[a][1],joints[a][2],side),to=project(joints[b][0],joints[b][1],joints[b][2],side);
    return 'M'+from.x.toFixed(1)+','+from.y.toFixed(1)+'L'+to.x.toFixed(1)+','+to.y.toFixed(1);
  }).join(''));
  const nodes=Array.from({length:9},(_,i)=>{
    const a=i/9*TAU+p*.8, x=Math.cos(a)*72, z=Math.sin(a)*42;
    const lens=650/(650-z);
    return {x:360+x*lens,y:244+Math.sin(a*2+.3)*34*lens,z};
  });
  const links=nodes.map((n,i)=>'M'+n.x.toFixed(1)+','+n.y.toFixed(1)+'L'+nodes[(i+2)%9].x.toFixed(1)+','+nodes[(i+2)%9].y.toFixed(1)).join('');
  let cloud='';
  for(let i=0;i<180;i++) {
    const a=i/180*TAU*5, z=Math.sin(a)*40, lens=650/(650-z), x=360+Math.cos(a)*83*lens;
    const y=244+Math.sin(a*.6+p*.8)*46*lens;
    cloud+='M'+x.toFixed(1)+','+y.toFixed(1)+'h.1';
  }
  // Direct PC-to-PC route; discovery opens the line, sending moves one packet.
  const discovery=Math.max(0,Math.min(1,(p-.22)/.33));
  const delivery=Math.max(0,Math.min(1,(p-.65)/.25));
  const x=244+delivery*232, y=352-184*delivery*(1-delivery);
  return {layers,skeletons,nodes,links,cloud,discovery,delivery,packet:{x,y}};
}
