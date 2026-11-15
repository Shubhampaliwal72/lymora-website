"use client";
import {Suspense,useEffect,useMemo,useRef} from "react";
import {Canvas,createPortal,useFrame,useThree} from "@react-three/fiber";
import {AdditiveBlending,BufferGeometry,Color,Float32BufferAttribute,Group,NormalBlending,PerspectiveCamera,Scene,ShaderMaterial,Vector2} from "three";
import {HeroWorld} from "@/components/living-network/NetworkCanvas";
import {sampleParticleLogo} from "@/lib/particle-logo";
import {particleVertex,particleFragment} from "@/lib/particle-shaders";
import {createParticleField,PARTICLE_COUNT} from "@/lib/particle-field";
import {renderParticleFrame,updateParticleCloud} from "./render-particle-frame";
import type {ParticleRendererProps} from "./ParticleRenderContext";

function ParticleCloud({runtime,theme,intensity}:ParticleRendererProps){
 const group=useRef<Group>(null),logoReady=useRef(false);const {size,gl}=useThree();
 const geometry=useMemo(()=>{const data=createParticleField(PARTICLE_COUNT),result=new BufferGeometry();result.setAttribute("position",new Float32BufferAttribute(data.ring,3));result.setAttribute("aLogo",new Float32BufferAttribute(data.ring.slice(),3));result.setAttribute("aOrb",new Float32BufferAttribute(data.orb,3));result.setAttribute("aGalaxy",new Float32BufferAttribute(data.galaxy,3));result.setAttribute("aSeed",new Float32BufferAttribute(data.seeds,3));result.boundingSphere=null;return result;},[]);
 const material=useMemo(()=>{const css=getComputedStyle(document.documentElement);return new ShaderMaterial({vertexShader:particleVertex,fragmentShader:particleFragment,transparent:true,depthWrite:false,depthTest:false,blending:theme==="dark"?AdditiveBlending:NormalBlending,uniforms:{uLogoReady:{value:0},uPointer:{value:new Vector2()},uInteraction:{value:0},uQuiet:{value:1},uTime:{value:0},uMorph:{value:0},uDpr:{value:1},uWarm:{value:new Color(css.getPropertyValue("--accent").trim())},uCool:{value:new Color(css.getPropertyValue("--particle-cool").trim())},uIntensity:{value:intensity*(theme==="dark"?1:.72)}}});},[theme,intensity]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);useEffect(()=>()=>material.dispose(),[material]);
 useEffect(()=>{let disposed=false;void sampleParticleLogo(PARTICLE_COUNT).then(positions=>{if(disposed||!positions)return;geometry.setAttribute("aLogo",new Float32BufferAttribute(positions,3));logoReady.current=true;});return()=>{disposed=true;};},[geometry]);
 useFrame(()=>updateParticleCloud(material,group.current,runtime.current,size.width,size.height,gl.getPixelRatio(),logoReady.current));
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
