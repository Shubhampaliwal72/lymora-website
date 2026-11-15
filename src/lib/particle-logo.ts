/** Sample the existing transparent logo once. No external assets or invented brand shape. */
export async function sampleParticleLogo(count:number):Promise<Float32Array|null> {
 try {
   const image=new Image();image.src="/brand/mark-dark.png";await image.decode();
   const canvas=document.createElement("canvas");canvas.width=canvas.height=112;
   const context=canvas.getContext("2d",{willReadFrequently:true});if(!context)return null;
   context.drawImage(image,0,0,112,112);
   const pixels=context.getImageData(0,0,112,112).data,points:number[]=[];
   for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>160){points.push(i/4%112,Math.floor(i/4/112));}
   if(!points.length)return null;
   const positions=new Float32Array(count*3);
   for(let i=0;i<count;i++){
     const index=(Math.imul(i,7919)>>>0)%(points.length/2)*2;
     positions.set([(points[index]/112-.5)*5.3,(.5-points[index+1]/112)*5.3,Math.sin(i*2.4)*.06],i*3);
   }
   return positions;
 } catch {return null;}
}
