"use client";
import {createContext,useContext,type MutableRefObject} from "react";
import type {NetworkCanvasProps} from "@/components/living-network/scene";
export type ParticleRuntime={time:number;progress:number;pointer:{x:number;y:number};visible:boolean};
export type HeroRegistration={key:symbol;props:NetworkCanvasProps};
export const ParticleRenderContext=createContext<{enabled:boolean;register:(key:symbol,props:NetworkCanvasProps)=>()=>void}|null>(null);
export function useParticleRenderer(){return useContext(ParticleRenderContext);}
export type ParticleRendererProps={runtime:MutableRefObject<ParticleRuntime>;invalidateRef:MutableRefObject<(()=>void)|null>;hero:HeroRegistration|null;theme:"dark"|"light";intensity:number;onReady:()=>void;onUnavailable:()=>void};
