"use client";
import {forwardRef,useMemo} from "react";
import {connectionFrame} from "@/lib/connection-network";

/** A static illustration first. The story controller updates these few SVG paths on scroll. */
export const ConnectionNetwork=forwardRef<SVGSVGElement>(function ConnectionNetwork(_,ref) {
 const frame=useMemo(()=>connectionFrame(1),[]);
 return <svg ref={ref} className="connection-network" viewBox="0 0 720 480" aria-hidden="true" focusable="false">
   <ellipse className="connection-network-ground" cx="360" cy="410" rx="285" ry="34"/>
   <ellipse className="connection-network-orbit" cx="360" cy="280" rx="265" ry="113" transform="rotate(-12 360 280)"/>
   <ellipse className="connection-network-orbit connection-network-orbit-back" cx="360" cy="280" rx="225" ry="105" transform="rotate(18 360 280)"/>
   {frame.layers.map((d,i)=><path key={i} data-person-layer={i} className={i<3?"connection-network-person warm":"connection-network-person cool"} opacity={[.25,.5,.9][i%3]} strokeWidth={[1,1.25,1.6][i%3]} d={d}/>)}
   {frame.skeletons.map((d,i)=><path key={i} data-person-bones={i} className="connection-network-anatomy" d={d}/>)}
   <g className="connection-network-discovery">
     <path data-connection-network-cloud className="connection-network-cloud" d={frame.cloud}/>
     <path data-connection-network-links className="connection-network-links" d={frame.links}/>
     {frame.nodes.map((n,i)=><circle key={i} data-connection-network-node={i} className="connection-network-junction" cx={n.x} cy={n.y} r={i===0?4:2.5}/>)}
   </g>
   {[172,548].map((x,i)=><g key={x} className="connection-network-terminal" transform={'translate('+x+' 338)'}>
     <rect className="connection-network-screen" x="-69" y="-45" width="138" height="84" rx="9"/>
     <path className="connection-network-screen-highlight" d="M-60-37H58M0 40V57M-27 58H27"/>
     <path className="connection-network-message" d="M-22-17H22V8H-4L-16 17V8H-22Z"/>
     <circle className="connection-network-status" cx="55" cy="28" r="2.5"/>
     <text className="connection-network-device-label" y="91" textAnchor="middle">{i===0?'Your PC':'Their PC'}</text>
   </g>)}
   <path className="connection-network-connection-base" d="M244 352Q360 260 476 352"/>
   <path data-connection-network-route className="connection-network-connection-live" pathLength="1" d="M244 352Q360 260 476 352"/>
   <g data-connection-network-packet transform="translate(476 352)"><circle className="connection-network-packet-aura" r="14"/><rect className="connection-network-packet" x="-6" y="-5" width="12" height="10" rx="3"/></g>
   <text className="connection-network-lan-label" x="360" y="161" textAnchor="middle">YOUR LOCAL NETWORK</text>
 </svg>;
});

export function paintConnectionNetwork(svg:SVGSVGElement,progress:number) {
 const frame=connectionFrame(progress);
 frame.layers.forEach((d,i)=>svg.querySelector('[data-person-layer="'+i+'"]')?.setAttribute('d',d));
 frame.skeletons.forEach((d,i)=>svg.querySelector('[data-person-bones="'+i+'"]')?.setAttribute('d',d));
 svg.querySelector('[data-connection-network-cloud]')?.setAttribute('d',frame.cloud);
 svg.querySelector('[data-connection-network-links]')?.setAttribute('d',frame.links);
 frame.nodes.forEach((n,i)=>{const node=svg.querySelector('[data-connection-network-node="'+i+'"]');node?.setAttribute('cx',String(n.x));node?.setAttribute('cy',String(n.y));});
 svg.querySelector('[data-connection-network-route]')?.setAttribute('stroke-dasharray',frame.discovery+' 1');
 svg.querySelector('.connection-network-discovery')?.setAttribute('opacity',String(.2+.8*frame.discovery));
 const packet=svg.querySelector('[data-connection-network-packet]');
 packet?.setAttribute('transform','translate('+frame.packet.x+' '+frame.packet.y+')');
 packet?.setAttribute('opacity',String(progress>.65?1:0));
}
