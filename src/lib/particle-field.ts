export const PARTICLE_COUNT = 24200;

/** Deterministic particle targets. Shape changes are evaluated on the GPU. */
export function createParticleField(count: number) {
  const ring=new Float32Array(count*3),orb=new Float32Array(count*3),galaxy=new Float32Array(count*3),seeds=new Float32Array(count*3);
  let state=84217;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<count;i++) {
    const angle=(i%220)/220*Math.PI*2+Math.floor(i/220)*.017,layer=Math.floor(i/220)/Math.ceil(count/220)*Math.PI*2;
    const radius=2.65+Math.cos(layer)*.24+Math.sin(angle*5+layer*2)*.15;
    ring.set([Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(layer)*.42],i*3);
    const z=1-random()*2,phi=random()*Math.PI*2,span=Math.sqrt(1-z*z)*2.55;
    // Ordered latitude strands and a smaller interior population reveal volume.
    // Keep random sampling order unchanged so the accepted opening ring stays identical.
    const latitude=(Math.floor(i/220)+.5)/Math.ceil(count/220)*Math.PI;
    const longitude=(i%220)/220*Math.PI*2+Math.sin(latitude*3)*.12;
    const shell=2.45+Math.sin(longitude*3+latitude*4)*.09;
    if(i%7===0){const core=.18+Math.abs(z)*1.55;orb.set([Math.cos(phi)*span/2.55*core,z*core,Math.sin(phi)*span/2.55*core],i*3);}
    else orb.set([Math.cos(longitude)*Math.sin(latitude)*shell,Math.cos(latitude)*shell,Math.sin(longitude)*Math.sin(latitude)*shell],i*3);
    const distance=Math.pow(random(),.68)*3.65,arm=i%3,spin=distance*1.48+arm*Math.PI*2/3+(random()-.5)*.5;
    galaxy.set([Math.cos(spin)*distance,Math.sin(spin)*distance*.63+(random()-.5)*.15,Math.sin(spin)*distance*.42+(random()-.5)*.18],i*3);
    seeds.set([random(),random(),angle/(Math.PI*2)],i*3);
  }
  return {ring,orb,galaxy,seeds};
}
export function particleIntensity(pathname: string) {
  if(pathname==='/')return .88;
  if(pathname.includes('/docs')||pathname.startsWith('/privacy'))return .32;
  if(pathname.startsWith('/downloads'))return .46;
  return .55;
}

/** Sample the same full field into three SVG paths, rather than thousands of DOM nodes. */
export function createParticlePreview() {
  const {ring,seeds}=createParticleField(PARTICLE_COUNT);
  const paths=["","",""];
  for(let i=0;i<PARTICLE_COUNT;i+=3){
    const angle=seeds[i*3+2]*Math.PI*2;
    const ripple=1+Math.sin(angle*7)*.045+Math.cos(angle*4+seeds[i*3]*4)*.025;
    const x=(500+ring[i*3]*ripple*144).toFixed(1),y=(500-ring[i*3+1]*ripple*144).toFixed(1);
    paths[Math.min(2,Math.floor(seeds[i*3+1]*3))]+="M"+x+" "+y+"h.01";
  }
  return paths;
}
