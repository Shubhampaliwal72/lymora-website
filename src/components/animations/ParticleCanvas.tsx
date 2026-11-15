"use client";
import {Suspense,useEffect,useMemo,useRef} from "react";
import {Canvas,createPortal,useFrame,useThree} from "@react-three/fiber";
import {AdditiveBlending,BufferGeometry,Color,Float32BufferAttribute,Group,NormalBlending,PerspectiveCamera,Scene,ShaderMaterial} from "three";
import {HeroWorld} from "@/components/living-network/NetworkCanvas";
import {createParticleField,PARTICLE_COUNT} from "@/lib/particle-field";
import {renderParticleFrame,updateParticleCloud} from "./render-particle-frame";
import type {ParticleRendererProps} from "./ParticleRenderContext";

const vertex=[
 "attribute vec3 aOrb;attribute vec3 aGalaxy;attribute vec3 aSeed;uniform float uTime;uniform float uMorph;uniform float uDpr;uniform vec3 uWarm;uniform vec3 uCool;varying vec3 vColor;varying float vAlpha;",
 "void main(){float angle=aSeed.z*6.2831853;vec3 ring=position;float ripple=sin(angle*7.0+uTime*0.53)*0.045+cos(angle*4.0-uTime*0.31+aSeed.x*4.0)*0.025;ring.xy*=1.0+ripple;ring.z+=sin(angle*5.0+uTime*0.37)*0.12;vec3 orb=aOrb*(1.0+0.045*sin(aOrb.y*3.0+uTime*0.6+aSeed.x));vec3 galaxy=aGalaxy;float spin=uTime*0.035;galaxy.xy=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*galaxy.xy;vec3 p=mix(ring,orb,smoothstep(0.0,1.0,uMorph));p=mix(p,galaxy,smoothstep(1.0,2.0,uMorph));vec4 view=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*view;gl_PointSize=(1.4+aSeed.x*2.0)*uDpr;float palette=smoothstep(-0.8,0.8,p.y);vColor=mix(uCool,uWarm,palette);vColor=mix(vColor,vec3(1.0),pow(aSeed.y,16.0)*0.3);vAlpha=0.22+aSeed.y*0.6;}"
].join("\n");
const fragment=[
 "uniform float uIntensity;varying vec3 vColor;varying float vAlpha;",
 "void main(){vec2 p=gl_PointCoord-0.5;float r=dot(p,p);if(r>0.25)discard;float light=exp(-r*20.0)+exp(-r*8.0)*0.35;gl_FragColor=vec4(vColor,light*vAlpha*uIntensity);",
 "#include <tonemapping_fragment>","#include <colorspace_fragment>","}"
].join("\n");
function ParticleCloud({runtime,theme,intensity}:ParticleRendererProps){
 const group=useRef<Group>(null);const {size,gl}=useThree();
 const geometry=useMemo(()=>{const data=createParticleField(PARTICLE_COUNT),result=new BufferGeometry();result.setAttribute("position",new Float32BufferAttribute(data.ring,3));result.setAttribute("aOrb",new Float32BufferAttribute(data.orb,3));result.setAttribute("aGalaxy",new Float32BufferAttribute(data.galaxy,3));result.setAttribute("aSeed",new Float32BufferAttribute(data.seeds,3));result.boundingSphere=null;return result;},[]);
 const material=useMemo(()=>{const css=getComputedStyle(document.documentElement);return new ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,depthTest:false,blending:theme==="dark"?AdditiveBlending:NormalBlending,uniforms:{uTime:{value:0},uMorph:{value:0},uDpr:{value:1},uWarm:{value:new Color(css.getPropertyValue("--accent").trim())},uCool:{value:new Color(css.getPropertyValue("--particle-cool").trim())},uIntensity:{value:intensity*(theme==="dark"?1:.72)}}});},[theme,intensity]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);useEffect(()=>()=>material.dispose(),[material]);
 useFrame(()=>updateParticleCloud(material,group.current,runtime.current,size.width,size.height,gl.getPixelRatio()));
 return <group ref={group}><points geometry={geometry} material={material} frustumCulled={false}/></group>;
}
function SharedScene(props:ParticleRendererProps){
 const {hero,runtime,invalidateRef,onReady,onUnavailable}=props;const {gl,scene,camera,size,invalidate}=useThree();
 const heroScene=useMemo(()=>new Scene(),[]),heroCamera=useMemo(()=>new PerspectiveCamera(35.5,1,.1,1000),[]);
 const announced=useRef(false),frames=useRef(0);
 useEffect(()=>{invalidateRef.current=invalidate;const canvas=gl.domElement;const lost=(event:Event)=>{event.preventDefault();onUnavailable();};canvas.addEventListener("webglcontextlost",lost);invalidate();return()=>{invalidateRef.current=null;canvas.removeEventListener("webglcontextlost",lost);};},[gl,invalidate,invalidateRef,onUnavailable]);
 useFrame(()=>{if(!runtime.current.visible)return;const bounds=hero?document.querySelector(".living-network .network-world")?.getBoundingClientRect()??null:null;renderParticleFrame(gl,scene,camera,heroScene,heroCamera,size.width,size.height,bounds,++frames.current);if(!announced.current){announced.current=true;onReady();}},1);
 const bounds=hero?document.querySelector(".living-network .network-world")?.getBoundingClientRect():null;
 return <><ParticleCloud {...props}/>{hero&&bounds&&createPortal(<Suspense fallback={null}><HeroWorld {...hero.props}/></Suspense>,heroScene,{camera:heroCamera,size:{width:bounds.width,height:bounds.height,top:0,left:0},events:{enabled:false}})}</>;
}
export default function ParticleCanvas(props:ParticleRendererProps){return <Canvas className="shared-particle-canvas" orthographic camera={{position:[0,0,1000],near:.1,far:3000}} frameloop="demand" dpr={[1,1.35]} gl={{alpha:true,antialias:false,powerPreference:"low-power"}} fallback={null} aria-hidden="true"><SharedScene {...props}/></Canvas>;}
