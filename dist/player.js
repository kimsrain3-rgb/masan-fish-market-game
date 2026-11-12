import * as T from './assets/three.module.js';
export function createPlayer(scene){
 const root=new T.Group(),legs=[],arms=[];scene.add(root);root.visible=false;root.rotation.y=Math.PI;
 const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);}
 function mesh(geo,c,x,y,z,p=root){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;}
 function ball(x,y,z,sx,sy,sz,c,p=root){const m=mesh(new T.SphereGeometry(1,10,8),c,x,y,z,p);m.scale.set(sx,sy,sz);return m;}
 function box(x,y,z,w,h,d,c,p=root){return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);}
 const body=new T.Group();root.add(body);body.position.y=.8;
 box(0,.35,0,.48,.67,.31,'#e4b75c',body);ball(0,.66,0,.25,.1,.17,'#e4b75c',body);box(0,.18,-.22,.34,.43,.17,'#367c80',body);box(0,.2,-.32,.22,.17,.04,'#235a62',body);
 for(const x of [-.16,.16])box(x,.48,.17,.035,.42,.025,'#367c80',body);
 ball(0,.98,0,.185,.23,.18,'#e4b797',body);ball(0,1.13,-.015,.195,.1,.18,'#3d3029',body);ball(0,.98,.18,.04,.05,.04,'#dcae90',body);
 for(const s of [-1,1]){ball(s*.075,1.02,.16,.015,.02,.015,'#273c3c',body);box(s*.075,1.06,.16,.06,.01,.015,'#49372d',body);ball(s*.18,1,0,.04,.06,.035,'#e4b797',body);}
 box(0,.89,.17,.06,.012,.012,'#a16552',body);
 for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.29,.62,0);body.add(arm);mesh(new T.CylinderGeometry(.064,.06,.34,8),'#e4b75c',0,-.14,0,arm);mesh(new T.CylinderGeometry(.049,.049,.27,8),'#e4b797',0,-.43,0,arm);ball(0,-.58,0,.06,.08,.06,'#e4b797',arm);arms.push(arm);
 const leg=new T.Group();leg.position.set(s*.12,.8,0);root.add(leg);mesh(new T.CylinderGeometry(.085,.07,.63,8),'#3e5a6c',0,-.31,0,leg);ball(0,-.66,.065,.105,.075,.17,'#f3e8cc',leg);legs.push(leg);}
 const labelCanvas=document.createElement('canvas');labelCanvas.width=128;labelCanvas.height=64;const c=labelCanvas.getContext('2d');c.fillStyle='#e6b94e';c.fillRect(0,0,128,64);c.fillStyle='#223f45';c.textAlign='center';c.textBaseline='middle';c.font='bold 35px sans-serif';c.fillText('나',64,34);const tex=new T.CanvasTexture(labelCanvas);tex.colorSpace=T.SRGBColorSpace;
 const nameTag=new T.Mesh(new T.PlaneGeometry(.42,.21),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));nameTag.userData.softwareTexture=true;scene.add(nameTag);nameTag.visible=false;
 return{root,update(position,moving,t,seated,camera){root.visible=true;root.position.set(position.x,seated?-.28:.04,position.z);body.position.y=.8+(moving?Math.sin(t*12)*.025:0);legs.forEach((l,i)=>l.rotation.x=seated?-1.05:moving?Math.sin(t*9+i*Math.PI)*.42:0);arms.forEach((a,i)=>a.rotation.x=moving?Math.sin(t*9+i*Math.PI)*-.28:seated?-.45:0);nameTag.visible=innerWidth>700;nameTag.position.set(position.x,seated?1.85:2.22,position.z);nameTag.rotation.copy(camera.rotation);},hide(){root.visible=false;nameTag.visible=false;}};
}
