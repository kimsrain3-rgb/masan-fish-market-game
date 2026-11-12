import * as T from './assets/three.module.js';

// A short, local welcome scene for the existing restaurant merchant.
export function createRestaurantService(scene,market,{seat,order,notify}){
 const restaurant=market.restaurant,owner=restaurant.shop.person,home=owner.g.position.clone();
 const room=document.querySelector('#room-actions');
 const card=document.createElement('div');card.id='host-service';card.hidden=true;
 const line=document.createElement('div');line.className='host-line';card.append(line);
 const actions=document.createElement('div');actions.className='host-buttons';card.append(actions);
 const menu=document.createElement('button');menu.type='button';menu.textContent='회 메뉴·가격 듣기';actions.append(menu);
 const later=document.createElement('button');later.type='button';later.textContent='천천히 볼게요';actions.append(later);
 room.prepend(card);

 const set=new T.Group();set.name='Complimentary water service';
 const trayMat=new T.MeshStandardMaterial({color:'#e4eeeb',roughness:.58});
 const glassMat=new T.MeshPhysicalMaterial({color:'#dceef0',transparent:true,opacity:.68,roughness:.16,metalness:0,side:T.DoubleSide,depthWrite:false});
 const waterMat=new T.MeshStandardMaterial({color:'#64b7d2',transparent:true,opacity:.82,roughness:.22});
 const ceramic=new T.MeshStandardMaterial({color:'#f3eee1',roughness:.43});
 function cylinder(radiusTop,radiusBottom,height,x,y,z,material){const mesh=new T.Mesh(new T.CylinderGeometry(radiusTop,radiusBottom,height,14),material);mesh.position.set(x,y,z);set.add(mesh);return mesh;}
 cylinder(.19,.19,.018,0,.009,0,trayMat);
 cylinder(.045,.038,.13,-.07,.083,0,glassMat);
 cylinder(.035,.035,.065,-.07,.067,0,waterMat);
 cylinder(.045,.045,.009,-.07,.15,0,waterMat);
 cylinder(.064,.075,.16,.075,.096,0,ceramic);
 const handle=new T.Mesh(new T.TorusGeometry(.047,.013,6,12,Math.PI*1.7),ceramic);handle.position.set(.143,.105,0);handle.rotation.y=Math.PI/2;set.add(handle);
 owner.g.add(set);set.position.set(0,1.03,.34);set.visible=false;

 let phase='idle',path=[],seated=false,elapsed=0,step=0,pendingReturn=false;
 function cardText(message,ready){line.textContent='정숙 이모: '+message;actions.hidden=!ready;card.hidden=false;}
 function returnToCounter(){if(phase==='idle'||phase==='returning')return;phase='returning';path=[new T.Vector3(6.1,0,restaurant.z-.45),home.clone()];step=0;}
 function enter(){
  owner.g.position.copy(home);owner.g.rotation.y=-Math.PI/2;owner.legs.forEach(leg=>leg.rotation.x=0);
  if(set.parent)set.parent.remove(set);owner.g.add(set);set.position.set(0,1.03,.34);set.visible=true;
  phase='approaching';path=[new T.Vector3(6.1,0,restaurant.z-.45),new T.Vector3(6.1,0,restaurant.z+.72)];step=0;elapsed=0;seated=false;pendingReturn=false;
  cardText('어서 오세요. 물 한 잔 먼저 갖다드릴게요.',false);
  notify('정숙 이모가 물을 들고 다가옵니다.');
 }
 function leave(){phase='idle';path=[];pendingReturn=false;card.hidden=true;set.visible=false;owner.g.position.copy(home);owner.g.rotation.y=-Math.PI/2;owner.legs.forEach(leg=>leg.rotation.x=0);}
 function seatNow(){seated=true;if(phase==='ready'&&!card.hidden)cardText('물 드시면서 메뉴 보세요. 모둠회 한 상은 18,000원이에요.',true);}
 function orderDone(){card.hidden=true;if(phase==='approaching'||phase==='serving')pendingReturn=true;else returnToCounter();}
 menu.onclick=()=>{card.hidden=true;if(!seated)seat();order();};
 later.onclick=()=>{card.hidden=true;returnToCounter();};
 function update(dt){
  if(phase==='approaching'||phase==='returning'){
   const target=path[step];if(!target)return;const delta=target.clone().sub(owner.g.position),distance=delta.length();
   if(distance>.01){const stride=Math.min(distance,dt*1.55);owner.g.position.addScaledVector(delta.normalize(),stride);owner.g.rotation.y=Math.atan2(delta.x,delta.z);elapsed+=dt;owner.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(elapsed*10+i*Math.PI)*.28);}
   if(distance<.08){owner.g.position.copy(target);step++;if(step===path.length){owner.legs.forEach(leg=>leg.rotation.x=0);if(phase==='approaching'){phase='serving';elapsed=0;owner.g.rotation.y=Math.PI/2;}else{phase='idle';owner.g.rotation.y=-Math.PI/2;}}}
  }else if(phase==='serving'){
   elapsed+=dt;owner.arms[1].rotation.x=-1.25;
   if(elapsed>.55){owner.g.remove(set);scene.add(set);set.position.set(6.96,.73,restaurant.z+.97);set.rotation.set(0,0,0);set.visible=true;phase='ready';if(pendingReturn){card.hidden=true;returnToCounter();}else cardText(seated?'물 드시면서 메뉴 보세요. 모둠회 한 상은 18,000원이에요.':'물 먼저 드세요. 앉아서 회 한 상 골라보실래요?',true);notify('정숙 이모가 물을 놓고 주문을 안내합니다.');}
  }
 }
 return{enter,leave,seat:seatNow,orderDone,update,get phase(){return phase;},get waterVisible(){return set.visible&&set.parent===scene;}};
}
