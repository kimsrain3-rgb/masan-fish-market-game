import * as T from './assets/three.module.js';

// Open a customer lane between the outdoor seafood display and the dining room.
// All changes stay on the runtime model, leaving the Blender GLB untouched.
export function openRestaurantEntrance(model){
 const shifted=new Set(['Seafood preparation counter','Counter white worktop','Fish display tray','Wood cutting board','Weighing scale base','Scale display','Scale digits']);
 model.traverse(part=>{
  const name=part.userData.name||part.name;
  if(name.startsWith('Front seafood crate 2'))part.visible=false;
  if(shifted.has(name)||/^Crushed ice \d+$/.test(name)||/^Fish on ice \d+$/.test(name))part.position.z-=2.65;
 });
 const mat=new T.MeshStandardMaterial({color:'#a8a394',roughness:.93,metalness:0});
 const lane=new T.Mesh(new T.PlaneGeometry(1.55,4.55),mat);
 lane.rotation.x=-Math.PI/2;
 lane.position.set(3.55,.085,2.6);
 lane.receiveShadow=true;
 lane.name='Restaurant entrance walkway';
 model.add(lane);
}
