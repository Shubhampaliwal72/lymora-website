"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { productViews } from "@/lib/products";
import { ThemeScreenshot } from "@/components/site/ThemeScreenshot";
export function ProductExplorer({id="experience"}:{id?:string}) {
  const [selected,setSelected] = useState(0);
  const [panel,animate] = useAnimate<HTMLDivElement>();
  const buttons = useRef<(HTMLButtonElement|null)[]>([]);
  const reduce = useReducedMotion();
  const view = productViews[selected];
  const choose = (index:number) => {setSelected(index);if(panel.current)void animate(panel.current,{opacity:[reduce?1:.65,1],y:[reduce?0:8,0]},{duration:reduce?0:.24});};
  const keys = (event:KeyboardEvent<HTMLButtonElement>,index:number) => {
    const next = event.key === "ArrowRight" ? (index+1)%productViews.length : event.key === "ArrowLeft" ? (index+productViews.length-1)%productViews.length : event.key === "Home" ? 0 : event.key === "End" ? productViews.length-1 : null;
    if(next !== null){event.preventDefault();choose(next);buttons.current[next]?.focus();}
  };
  return <section className="product-explorer section-space" id={id} aria-labelledby={id+"-title"}><div className="section-heading" data-scroll-heading><div><p className="eyebrow">Inside LAN Messenger</p><h2 id={id+"-title"}>Real software.<br/><span>Real connection.</span></h2></div><p>A closer look at the app you will use.<br/>Original Lymora screens, in both themes.</p></div><div role="tablist" aria-label="Explore LAN Messenger" className="product-tabs">{productViews.map((item,index)=><motion.button key={item.id} ref={element=>{buttons.current[index]=element;}} id={id+"-tab-"+item.id} role="tab" aria-selected={selected===index} aria-controls={id+"-panel"} tabIndex={selected===index?0:-1} onKeyDown={event=>keys(event,index)} onClick={()=>choose(index)} whileTap={reduce?undefined:{scale:.98}}>{item.label}<span aria-hidden="true">0{index+1}</span></motion.button>)}</div><div ref={panel} id={id+"-panel"} role="tabpanel" aria-labelledby={id+"-tab-"+view.id} tabIndex={0} className="product-stage"><div className="product-stage-copy" data-scroll-horizontal><p className="eyebrow">0{selected+1} / {view.label}</p><h3>{view.title}</h3><p>{view.description}</p><span className="feature-detail">{view.detail}</span></div><div className="product-screen glass-panel" data-scroll-surface><ThemeScreenshot view={view.id} alt={view.alt}/></div></div><p className="capture-note">Actual Lymora interface &middot; Fictional demo conversations &middot; Network addresses are reserved examples.</p></section>;
}
