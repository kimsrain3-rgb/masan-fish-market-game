import * as T from './assets/three.module.js';
export function makeRenderer(){
 let webgl;
 try {const c=document.createElement('canvas');const context=c.getContext('webgl2',{antialias:true});if(context)webgl=new T.WebGLRenderer({canvas:c,context,antialias:true});}catch{}
 if(webgl){webgl.shadowMap.enabled=true;webgl.shadowMap.type=T.PCFSoftShadowMap;webgl.outputColorSpace=T.SRGBColorSpace;webgl.toneMapping=T.ACESFilmicToneMapping;webgl.toneMappingExposure=1.08;webgl.setPixelRatio(Math.min(devicePixelRatio,1.6));return webgl;}
 // Depth-buffered fallback for browsers without WebGL. Keep textures attached to 3D geometry.
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});
 const buffer=document.createElement('canvas'),bc=buffer.getContext('2d',{alpha:false});
 const textureCache=new WeakMap(),geometryCache=new WeakMap();let width=0,height=0,sw=0,sh=0,last=0,frame,depth;
 const texCanvas=document.createElement('canvas'),tc=texCanvas.getContext('2d',{willReadFrequently:true});
 function pixels(img){if(!img||!img.width)return null;let entry=textureCache.get(img);if(entry)return entry;const scale=Math.min(1,512/Math.max(img.width,img.height));texCanvas.width=Math.max(1,Math.round(img.width*scale));texCanvas.height=Math.max(1,Math.round(img.height*scale));try{tc.drawImage(img,0,0,texCanvas.width,texCanvas.height);entry={w:texCanvas.width,h:texCanvas.height,data:tc.getImageData(0,0,texCanvas.width,texCanvas.height).data};textureCache.set(img,entry);return entry;}catch{return null;}}
 return {domElement:canvas,isSoftware:true,setSize(w,h){width=w;height=h;canvas.width=w;canvas.height=h;const scale=Math.min(1,800/w);sw=Math.round(w*scale);sh=Math.round(h*scale);buffer.width=sw;buffer.height=sh;frame=bc.createImageData(sw,sh);depth=new Float32Array(sw*sh);},render(scene,camera){
  const now=performance.now();if(now-last<100)return;last=now;scene.updateMatrixWorld();camera.updateMatrixWorld();
  const bg=scene.background.clone().convertLinearToSRGB(),dst=frame.data;for(let i=0;i<depth.length;i++){depth[i]=Infinity;dst[i*4]=bg.r*255;dst[i*4+1]=bg.g*255;dst[i*4+2]=bg.b*255;dst[i*4+3]=255;}
  const projection=new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),faces=[],normal=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3(),light=new T.Vector3(-.4,.8,.3).normalize();
  scene.traverseVisible(o=>{if(!o.isMesh||Array.isArray(o.material))return;const mat=o.material;if(mat.opacity===0)return;const origin=new T.Vector3().setFromMatrixPosition(o.matrixWorld);if(origin.distanceTo(camera.position)>60)return;
   const g=o.geometry,uv=g.attributes.uv;let local=geometryCache.get(g);if(!local){local=[];for(let i=0;i<g.attributes.position.count;i++)local.push(new T.Vector3().fromBufferAttribute(g.attributes.position,i));geometryCache.set(g,local);}
   const world=local.map(v=>v.clone().applyMatrix4(o.matrixWorld)),view=world.map(v=>v.clone().applyMatrix4(camera.matrixWorldInverse)),idx=g.index,texture=pixels(mat.map?.image),base=mat.color.clone().convertLinearToSRGB();
   for(let i=0,n=idx?idx.count:world.length;i<n;i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);let poly=ids.map(k=>({v:world[k],d:view[k].z,u:uv?uv.getX(k):0,t:uv?uv.getY(k):0})),clip=[];
    for(let j=0;j<3;j++){const a=poly[j],b=poly[(j+1)%3],ia=a.d<=-camera.near,ib=b.d<=-camera.near;if(ia)clip.push(a);if(ia!==ib){const f=(-camera.near-a.d)/(b.d-a.d);clip.push({v:a.v.clone().lerp(b.v,f),d:-camera.near,u:a.u+(b.u-a.u)*f,t:a.t+(b.t-a.t)*f});}}
    if(clip.length<3)continue;const [a,b,c]=ids.map(k=>world[k]);normal.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();let shade=.67+Math.max(0,normal.dot(light))*.3;
    const emissive=mat.emissive?Math.max(mat.emissive.r,mat.emissive.g,mat.emissive.b):0;shade=Math.max(shade,Math.min(1.3,emissive));
    for(let k=1;k<clip.length-1;k++){const points=[clip[0],clip[k],clip[k+1]],v=points.map(p=>{const q=p.v.clone().applyMatrix4(projection);return{x:(q.x+1)*sw/2,y:(1-q.y)*sh/2,d:-p.d,u:p.u,t:p.t};});const [p,q,r]=v,area=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);if(Math.abs(area)<.05||area>=0&&mat.side!==T.DoubleSide)continue;
     const minX=Math.max(0,Math.floor(Math.min(p.x,q.x,r.x))),maxX=Math.min(sw-1,Math.ceil(Math.max(p.x,q.x,r.x))),minY=Math.max(0,Math.floor(Math.min(p.y,q.y,r.y))),maxY=Math.min(sh-1,Math.ceil(Math.max(p.y,q.y,r.y)));if(minX>maxX||minY>maxY)continue;
     const alpha=mat.transparent?mat.opacity:1;faces.push({v,area,minX,maxX,minY,maxY,shade,base,texture,alpha,transparent:alpha<1,d:(p.d+q.d+r.d)/3});
    }
   }
  });
  // Opaque fragments establish depth; transparent fragments blend from back to front.
  faces.sort((a,b)=>a.transparent-b.transparent||(a.transparent?b.d-a.d:a.d-b.d));
  for(const f of faces){const [a,b,c]=f.v,ia=1/a.d,ib=1/b.d,ic=1/c.d;for(let y=f.minY;y<=f.maxY;y++)for(let x=f.minX;x<=f.maxX;x++){
   const px=x+.5,py=y+.5,wa=((b.x-px)*(c.y-py)-(b.y-py)*(c.x-px))/f.area,wb=((c.x-px)*(a.y-py)-(c.y-py)*(a.x-px))/f.area,wc=1-wa-wb;if(wa<-.00001||wb<-.00001||wc<-.00001)continue;
   const inv=wa*ia+wb*ib+wc*ic,d=1/inv,index=y*sw+x;if(d>depth[index]+.0001)continue;
   let red=f.base.r*255,green=f.base.g*255,blue=f.base.b*255,alpha=f.alpha;
   if(f.texture){const u=(wa*a.u*ia+wb*b.u*ib+wc*c.u*ic)/inv,v=(wa*a.t*ia+wb*b.t*ib+wc*c.t*ic)/inv,t=f.texture,tx=Math.max(0,Math.min(t.w-1,Math.floor(u*t.w))),ty=Math.max(0,Math.min(t.h-1,Math.floor((1-v)*t.h))),j=(ty*t.w+tx)*4;red*=t.data[j]/255;green*=t.data[j+1]/255;blue*=t.data[j+2]/255;alpha*=t.data[j+3]/255;}
   const fog=Math.min(.8,Math.max(0,(d-23)/65)),k=index*4,rr=red*f.shade*(1-fog)+bg.r*255*fog,gg=green*f.shade*(1-fog)+bg.g*255*fog,bb=blue*f.shade*(1-fog)+bg.b*255*fog;
   dst[k]=rr*alpha+dst[k]*(1-alpha);dst[k+1]=gg*alpha+dst[k+1]*(1-alpha);dst[k+2]=bb*alpha+dst[k+2]*(1-alpha);if(!f.transparent)depth[index]=d;
  }}
  bc.putImageData(frame,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(buffer,0,0,width,height);
 }};
}
