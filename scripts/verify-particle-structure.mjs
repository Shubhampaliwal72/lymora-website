/** Structural regressions: original opening, actual connected graph and continuous traffic. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import * as three from 'three';
async function load(file) {
 const source=await fs.readFile(file,'utf8');
 const sandbox={exports:{},require:name=>{assert.equal(name,'three');return three;}};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,sandbox,{filename:file});
 return sandbox.exports;
}
const {createParticleField,PARTICLE_COUNT}=await load('src/lib/particle-field.ts');
const {createParticleNetwork}=await load('src/lib/particle-network.ts');
const field=createParticleField(PARTICLE_COUNT);
const hash=array=>crypto.createHash('sha256').update(Buffer.from(array.buffer)).digest('hex');
assert.equal(PARTICLE_COUNT,24200,'No increase in the particle budget');
assert.equal(hash(field.ring),'f5d041beeaa2d83364179e338fb4f35be79618ef32058de12b813b191d12a49a','Original opening geometry is unchanged');
assert.equal(hash(field.seeds),'557eee26749e9826b1f52abc05ffac6079fe68a5b018a6de45167a4a006a91fa','Opening randomness is unchanged');
for(const values of Object.values(field))assert(Array.from(values).every(Number.isFinite),'All positions are finite');
const radii=Array.from({length:PARTICLE_COUNT},(_,i)=>Math.hypot(...field.orb.subarray(i*3,i*3+3)));
const inner=radii.filter(radius=>radius<1.8).length;
assert(inner>PARTICLE_COUNT*.1&&inner<PARTICLE_COUNT*.2,'Orb has both a volumetric interior and a structured shell');
const depth=Array.from({length:PARTICLE_COUNT},(_,i)=>field.orb[i*3+2]);
assert(Math.max(...depth)-Math.min(...depth)>4.5,'Orb occupies real depth');
const network=createParticleNetwork(field);
assert.equal(network.nodeCount,14);assert(network.edgeCount>=13&&network.edgeCount<=30,'Connections stay sparse');
assert.equal(network.geometry.getAttribute('position').count,network.edgeCount*2,'One small line-segment layer');
const nodeIndices=new Map();network.signals.forEach((node,index)=>{if(node)nodeIndices.set(node,index);});
assert.equal(nodeIndices.size,14,'Every node is attached to an actual particle');
const vertices=network.geometry.getAttribute('aOrb'),nodeIds=network.geometry.getAttribute('aSignal');
for(let i=0;i<vertices.count;i++)for(let axis=0;axis<3;axis++)assert.equal(vertices.array[i*3+axis],field.orb[nodeIndices.get(nodeIds.getX(i))*3+axis],'Link endpoint matches its node exactly');
const edges=new Set();
network.transmissions.forEach((route,index,all)=>{
 assert(nodeIndices.has(route.from)&&nodeIndices.has(route.to));assert(route.from!==route.to);assert(route.edge>=0&&route.edge<network.edgeCount);
 assert.equal(route.to,all[(index+1)%all.length].from,'Traffic walks continuously without teleporting');edges.add(route.edge);
});
assert.equal(edges.size,network.edgeCount,'All connections participate in the network');
const repeat=createParticleNetwork(createParticleField(PARTICLE_COUNT));
assert.equal(JSON.stringify(repeat.transmissions),JSON.stringify(network.transmissions),'Network traffic is deterministic');
network.geometry.dispose();repeat.geometry.dispose();
console.log(JSON.stringify({passed:true,particles:PARTICLE_COUNT,nodes:network.nodeCount,links:network.edgeCount,checks:['unchanged opening geometry and random seeds','finite volumetric targets','exact connected particle endpoints','sparse continuous traffic through every link','deterministic layout']}));
