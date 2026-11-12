import * as T from './assets/three.module.js';
import {GLTFLoader} from './assets/GLTFLoader.js';
// Replace only the restaurant visual objects; retain its shop and dining state.
export async function replaceRestaurant(scene,market){
 const r=market.restaurant;
 const {scene:model}=await new GLTFLoader().loadAsync('./assets/bada-restaurant.glb');
 model.name='바다횟집 · 업로드 모델';model.scale.setScalar(.56);model.rotation.y=-Math.PI/2;model.position.set(6.6,0,r.z);
 // Keep the supplied restaurant intact; dress its outdoor counter separately.
 try{const {scene:front}=await new GLTFLoader().loadAsync('./assets/restaurant-front.glb');front.name='사진 참고 · 해산물 좌판';model.add(front);}catch(error){console.warn('횟집 좌판 소품을 불러오지 못했습니다.',error);}
 const canopy=new T.MeshStandardMaterial({color:'#9f453e',roughness:.68});
 const canopyRib=new T.MeshStandardMaterial({color:'#713b38',roughness:.74});
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;
  if(o.name==='Dark blue front awning'||o.name==='Front awning lip')o.material=canopy;
  else if(o.name.startsWith('Awning rib '))o.material=canopyRib;
 });
 const keep=new Set([r.shop.person.g,r.platter,r.soup]);
 for(const o of r.originalObjects)if(!keep.has(o))o.visible=false;
 scene.add(model);scene.updateMatrixWorld(true);
 r.model=model;r.layout={minX:4.4,maxX:8.4,minZ:r.z-2.65,maxZ:r.z+2.65};
 r.shop.name='바다횟집';r.shop.person.g.position.set(5.38,0,r.z-.45);
 // Use the uploaded table; the existing six-piece meal remains interactive.
 r.platter.position.set(7.07,.73,r.z+.59);r.platter.scale.setScalar(.68);
 // The old soup group stores its position in child geometry coordinates.
 r.soup.position.set(7.5-8.9,.73-.91,.2);
 const light=new T.PointLight('#ffe1b1',8,8,2);light.position.set(6.5,2.8,r.z);scene.add(light);
 return model;
}
