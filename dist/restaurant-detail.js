import * as T from './assets/three.module.js';
// A local material pass; the market, wallet and dining state keep their original identities.
export function refineRestaurant(scene,market,renderer){
 const z=market.restaurant.z, loader=new T.TextureLoader();
 function tex(name,color=true){const t=loader.load('./assets/materials/'+name+'.jpg');if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities?Math.min(8,renderer.capabilities.getMaxAnisotropy()):1;return t;}
 const woodMap=tex('wood_table_001_diff'),woodNormal=tex('wood_table_001_nor_gl',false),woodRough=tex('wood_table_001_rough',false);
 const wallMap=tex('painted_plaster_wall_diff'),wallNormal=tex('painted_plaster_wall_nor_gl',false);
 const timber=new T.MeshPhysicalMaterial({map:woodMap,normalMap:woodNormal,normalScale:new T.Vector2(.22,.22),roughnessMap:woodRough,roughness:.55,clearcoat:.22,clearcoatRoughness:.4,color:'#d0ac81'});
 const darkTimber=timber.clone();darkTimber.color.set('#8d694b');
 const wall=new T.MeshStandardMaterial({map:wallMap,normalMap:wallNormal,normalScale:new T.Vector2(.35,.35),color:'#e2cda6',roughness:.93});
 const metal=new T.MeshStandardMaterial({color:'#b6b5a4',metalness:.85,roughness:.27});
 const porcelain=new T.MeshPhysicalMaterial({color:'#e8e3d2',roughness:.2,clearcoat:.5});
 let env;
 if(!renderer.isSoftware){const room=new T.Scene();room.background=new T.Color('#88755c');for(const [x,y,zz,w,h,d,c,i] of [[0,4,0,6,.02,4,'#fff3dc',3],[-4,2,0,.02,4,5,'#d0dddf',1],[3,2,0,.02,3,4,'#edc18b',2]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,zz);room.add(m);}const pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(room,.08).texture;[timber,darkTimber,metal,porcelain].forEach(m=>{m.envMap=env;m.envMapIntensity=.7;});pmrem.dispose();}
 const floorCanvas=document.createElement('canvas');floorCanvas.width=floorCanvas.height=512;const c=floorCanvas.getContext('2d');c.fillStyle='#a8a394';c.fillRect(0,0,512,512);let seed=91;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 for(let row=0;row<8;row++)for(let col=0;col<8;col++){const v=Math.floor(178+rnd()*17);c.fillStyle=`rgb(${v+8},${v+4},${v-8})`;c.fillRect(col*64+2,row*64+2,60,60);for(let k=0;k<40;k++){c.fillStyle='rgba(80,65,47,.035)';c.fillRect(col*64+3+rnd()*57,row*64+3+rnd()*57,2,2);}}
 const floorTex=new T.CanvasTexture(floorCanvas);floorTex.colorSpace=T.SRGBColorSpace;const floor=new T.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.012,roughness:.48,color:'#ece0c8'});
 const round=new T.SphereGeometry(1,24,16);
 scene.traverse(o=>{if(!o.isMesh||o.position.x<5.35||o.position.x>11.8||Math.abs(o.position.z-z)>3.5)return;const p=o.position,par=o.geometry.parameters||{};
  if(o.userData.softwareTexture&&o.geometry.type==='BoxGeometry'){
   if(par.height>2&&par.width>4||par.height>2&&par.depth>4)o.material=wall;
   else if(par.width>6&&par.height<.2&&p.y<.2)o.material=floor;
   else if(par.width>1&&par.height<.22||par.height<1&&p.y<.9)o.material=par.width>2&&p.y>.6?timber:darkTimber;
  }
  if(o.geometry.type==='SphereGeometry'){o.geometry=round;}
 });
 // Smooth the owner locally without increasing the polygon count of the whole market.
 market.restaurant.shop.person.g.traverse(o=>{if(o.isMesh&&o.geometry.type==='SphereGeometry')o.geometry=round;});
 const m=(g,mat,x,y,zz)=>{const o=new T.Mesh(g,mat);o.position.set(x,y,zz);o.castShadow=o.receiveShadow=true;scene.add(o);return o;};
 const box=(w,h,d,mat,x,y,zz)=>m(new T.BoxGeometry(w,h,d),mat,x,y,zz);
 const lathe=(pts,mat,x,y,zz)=>m(new T.LatheGeometry(pts.map(p=>new T.Vector2(...p)),40),mat,x,y,zz);
 const dish=(x,y,zz,r=.18)=>lathe([[0,0],[r*.65,0],[r*.96,.027],[r,.055],[r*.95,.068],[r*.7,.035],[0,.028]],porcelain,x,y,zz);
 // Real tableware has rims and hollow interiors rather than solid cylinders.
 const hidden=[];scene.traverse(o=>{if(!o.isMesh)return;const p=o.position;if(o.geometry.type==='CylinderGeometry'&&p.x>7.7&&p.x<9.4&&p.y>.85&&p.y<1.1&&Math.abs(p.z-z-.35)<.04)hidden.push(o);});hidden.forEach(o=>o.visible=false);
 for(const x of [7.85,9.25])lathe([[.073,0],[.085,.012],[.091,.17],[.087,.18],[.08,.17],[.075,.03],[.073,0]],metal,x,.82,z+.38);
 dish(9.05,.825,z+.4,.15);lathe([[0,0],[.1,0],[.14,.03],[.145,.045],[.12,.055],[0,.045]],new T.MeshStandardMaterial({color:'#493125',roughness:.28}),9.05,.825,z+.4);
 for(const zz of [z-.5,z+.5])dish(8.8,.825,zz,.16);
 // Tapered chopsticks, white cloth and a small metal chopstick rest.
 for(const x of [7.5,7.57]){const stick=m(new T.CylinderGeometry(.009,.013,.52,8),metal,x,.839,z+.17);stick.rotation.x=Math.PI/2;}
 box(.13,.025,.04,porcelain,7.535,.84,z+.35);
 // Replace the angular kettle with a turned stainless pot, spout and swept handle.
 const remove=[];scene.traverse(o=>{if(o.isMesh&&o.position.x>10.4&&o.position.x<10.9&&Math.abs(o.position.z-z-1)<.1&&o.position.y>1&&o.position.y<1.4)remove.push(o);});remove.forEach(o=>o.visible=false);
 lathe([[.1,0],[.2,.035],[.23,.14],[.19,.29],[.12,.32]],metal,10.8,.95,z+1);
 lathe([[0,0],[.13,0],[.15,.02],[.08,.04],[0,.04]],metal,10.8,1.27,z+1);
 m(new T.SphereGeometry(.035,14,10),new T.MeshStandardMaterial({color:'#353b35',roughness:.7}),10.8,1.34,z+1);
 function curve(points,r,mat){return m(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),20,r,8,false),mat,0,0,0);}
 curve([[10.95,1.02,z+1],[11.09,1.12,z+1],[11.06,1.27,z+1],[10.92,1.28,z+1]],.022,metal);
 curve([[10.65,1.05,z+1],[10.45,1.18,z+1],[10.4,1.24,z+1]],.035,metal);
 // Wooden chair backs and mouldings: rounded joints catch the room light.
 for(const x of [7.2,9]){box(.45,.1,.44,darkTimber,x,.44,z-2.1);for(const dx of [-.19,.19]){box(.045,1,.045,darkTimber,x+dx,.54,z-2.33);}box(.44,.19,.045,timber,x,.94,z-2.33);}
 // Individual sashimi pieces with curved edges and fine, translucent muscle lines.
 const flesh=new T.MeshPhysicalMaterial({color:'#f1d5c8',roughness:.32,transparent:true,opacity:.94,clearcoat:.25});
 for(const slice of market.restaurant.slices){slice.material=flesh;const g=new T.SphereGeometry(1,20,10);slice.geometry=g;slice.scale.set(.16,.022,.105);const stripeMat=new T.MeshBasicMaterial({color:'#fbede2',transparent:true,opacity:.45});for(let k=-2;k<=2;k++){const stripe=new T.Mesh(new T.PlaneGeometry(.012,.13),stripeMat);stripe.rotation.x=-Math.PI/2;stripe.rotation.z=.3;stripe.position.set(k*.16,.88,0);stripe.scale.set(.7,1,1);slice.add(stripe);}}
 // Exterior timber trim and a physically rough canvas valance.
 const canvas=new T.MeshStandardMaterial({color:'#8c4740',roughness:.96});box(.08,.32,6.35,canvas,3.64,2.86,z);
 for(const off of [-3.15,3.15])box(.13,2.86,.13,darkTimber,5.34,1.45,z+off);
 for(const xx of [5.7,11.4])box(.13,.12,6.2,darkTimber,xx,3.13,z);
 scene.traverse(o=>{if(o.isPointLight&&o.position.x>6&&Math.abs(o.position.z-z)<3){o.intensity=14;o.color.set('#ffd6a1');}});
 return {textures:[woodMap,woodNormal,woodRough,wallMap,wallNormal]};
}
