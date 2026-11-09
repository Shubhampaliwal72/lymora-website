"use client";
import { useScenePreferences } from "@/components/living-network/useScenePreferences";
import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useAnimate } from "motion/react";
import { productViews } from "@/lib/products";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ScreenshotViewer } from "@/components/site/ScreenshotViewer";
export function ProductExplorer({id="experience", chapter}:{id?:string; chapter?:string}) {
  const [selected,setSelected] = useState(0);
  const [panel,animate] = useAnimate<HTMLDivElement>();
  const buttons = useRef<(HTMLButtonElement|null)[]>([]);
  const reduce = !useScenePreferences().motion;
  const view = productViews[selected];
  const choose = (index:number) => {setSelected(index);if(panel.current)void animate(panel.current,{opacity:[reduce?1:.65,1],y:[reduce?0:8,0]},{duration:reduce?0:.24});};
  const keys = (event:KeyboardEvent<HTMLButtonElement>,index:number) => {
    const next = event.key === "ArrowRight" ? (index+1)%productViews.length : event.key === "ArrowLeft" ? (index+productViews.length-1)%productViews.length : event.key === "Home" ? 0 : event.key === "End" ? productViews.length-1 : null;
    if(next !== null){event.preventDefault();choose(next);buttons.current[next]?.focus();}
  };
  return <section className="product-explorer section-space" id={id} aria-labelledby={id+"-title"}><SectionHeading number={chapter} label="Inside Lymora" titleId={id+"-title"} title={<>Messages. Groups. Files.<br/><span>All on your local network.</span></>}><p>Explore the actual Windows application. Original screens, in light and dark.</p></SectionHeading><div role="tablist" aria-label="Explore LAN Messenger" className="product-tabs">{productViews.map((item,index)=><motion.button key={item.id} ref={element=>{buttons.current[index]=element;}} id={id+"-tab-"+item.id} role="tab" aria-selected={selected===index} aria-controls={id+"-panel"} tabIndex={selected===index?0:-1} onKeyDown={event=>keys(event,index)} onClick={()=>choose(index)} whileTap={reduce?undefined:{scale:.98}}>{item.label}</motion.button>)}</div><div ref={panel} id={id+"-panel"} role="tabpanel" aria-labelledby={id+"-tab-"+view.id} tabIndex={0} className="product-stage"><div className="product-stage-copy" data-scroll-item><p className="eyebrow">{view.label}</p><h3>{view.title}</h3><p>{view.description}</p><span className="feature-detail">{view.detail}</span></div><div className="product-screen glass-panel" data-scroll-surface><ScreenshotViewer key={view.id} view={view.id} alt={view.alt} title={view.label}/></div></div><p className="capture-note">Actual Lymora interface preview &middot; Fictional demo conversations &middot; The preview uses newer development UI; release-specific details are on the Downloads page. Network addresses are reserved examples.</p></section>;
}
