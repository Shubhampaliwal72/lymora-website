import type {Camera,Group,PerspectiveCamera,Scene,ShaderMaterial,WebGLRenderer} from "three";
/** Renderer mutation belongs to the imperative frame boundary, never React render. */
export function renderParticleFrame(gl:WebGLRenderer,scene:Scene,camera:Camera,heroScene:Scene,heroCamera:PerspectiveCamera,width:number,height:number,bounds:DOMRect|null,frame:number){
  gl.autoClear=false;gl.setClearColor(0,0);gl.setScissorTest(false);gl.setViewport(0,0,width,height);gl.clear();gl.render(scene,camera);
  if(bounds&&bounds.width>0&&bounds.height>0&&bounds.bottom>0&&bounds.top<height){
    heroCamera.aspect=bounds.width/bounds.height;heroCamera.updateProjectionMatrix();
    gl.setViewport(bounds.left,height-bounds.bottom,bounds.width,bounds.height);gl.setScissor(bounds.left,Math.max(0,height-bounds.bottom),bounds.width,Math.min(height,bounds.bottom)-Math.max(0,bounds.top));gl.setScissorTest(true);gl.clearDepth();gl.render(heroScene,heroCamera);gl.setScissorTest(false);
  }
  gl.domElement.dataset.frames=String(frame);
}

export function updateParticleCloud(material:ShaderMaterial,group:Group|null,runtime:import("./ParticleRenderContext").ParticleRuntime,width:number,height:number,dpr:number){
 material.uniforms.uTime.value=runtime.time;material.uniforms.uMorph.value=runtime.progress*2;material.uniforms.uDpr.value=dpr;
 if(group){group.scale.setScalar(Math.min(width*.158,height*.153));group.rotation.x=runtime.pointer.y*.1+Math.sin(runtime.time*.14)*.045;group.rotation.y=runtime.pointer.x*.16+Math.sin(runtime.time*.1)*.08;group.rotation.z=runtime.pointer.x*.025;}
}
