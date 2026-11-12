import * as T from './assets/three.module.js';
import {makeRenderer} from './renderer.js';
import {makeMarket} from './market.js';
import {createPlay} from './play.js';
import {createPlayer} from './player.js';
import {replaceRestaurant} from './restaurant-model.js';
const renderer=makeRenderer();renderer.setSize(innerWidth,innerHeight);document.querySelector('#scene').appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#becdd0');scene.fog=new T.Fog('#becdd0',23,68);
const camera=new T.PerspectiveCamera(innerWidth<=700?73:57,innerWidth/innerHeight,.12,110);camera.position.set(1.3,2.8,22);camera.lookAt(-.5,2.7,-8);
scene.add(new T.HemisphereLight('#d9e9f1','#8d8066',2.35));const sun=new T.DirectionalLight('#ffe3b4',2.5);sun.position.set(-11,18,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:35,bottom:-35,near:.5,far:80});sun.shadow.bias=-.0007;scene.add(sun);
const market=makeMarket(scene);const player=createPlayer(scene);let destination=null;const raycaster=new T.Raycaster(),groundPlane=new T.Plane(new T.Vector3(0,1,0),0);const marker=new T.Mesh(new T.RingGeometry(.2,.28,24),new T.MeshBasicMaterial({color:'#f0bd4d',side:T.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);const walkStatus=document.querySelector('#walk-status');let walking=false,overview=false,yaw=0,pitch=0,drag=false,lastX=0,lastY=0,nearby=null;const keys=new Set();const position=new T.Vector3(0,1.72,10.4);let speechUntil=0;
const caption=document.querySelector('#caption'),talk=document.querySelector('#talk');
function notify(text){caption.textContent=text;speechUntil=performance.now()+6000;}
function stop(){keys.clear();drag=false;destination=null;marker.visible=false;}
function setPose(x,y,z,angle=0,tilt=0){start();overview=false;position.set(x,y,z);yaw=angle;pitch=tilt;camera.position.set(x+Math.sin(yaw)*3.4,3.1,z+Math.cos(yaw)*3.4);camera.lookAt(x,1.15,z);player.root.rotation.y=yaw+Math.PI;stop();}
let tableView=true;const viewButton=document.createElement('button');viewButton.id='table-view';viewButton.textContent='내 모습도 보기';viewButton.hidden=true;document.querySelector('#room-actions>div').appendChild(viewButton);viewButton.onclick=()=>{tableView=!tableView;viewButton.textContent=tableView?'내 모습도 보기':'식탁 눈높이로 보기';};
const play=createPlay({market,notify,position,stop,enter:()=>setPose(market.restaurant.layout?5.35:7,1.72,market.restaurant.z+1.5,-Math.PI/2),exit:()=>setPose(0,1.72,market.restaurant.z+2),sit:()=>setPose(market.restaurant.layout?6.47:8.4,1.4,market.restaurant.z+(market.restaurant.layout?.52:1.65),-Math.PI/2,-.28),stand:()=>setPose(market.restaurant.layout?5.35:7,1.72,market.restaurant.z+1.5,-Math.PI/2)});
function start(){walking=true;document.body.classList.add('walking');document.querySelector('#start').textContent='산책 중';}
function reset(){play.close();if(play.inRoom){document.querySelector('#leave').click();}position.set(0,1.72,10.4);yaw=0;pitch=0;overview=false;start();document.querySelector('#view').textContent='위에서 보기';}
document.querySelector('#start').onclick=start;document.querySelector('#home').onclick=reset;
document.querySelector('#view').onclick=()=>{start();overview=!overview;document.querySelector('#view').textContent=overview?'골목으로 돌아가기':'위에서 보기';};
for(const b of document.querySelectorAll('[data-zone]'))b.onclick=()=>{play.close();if(play.inRoom)document.querySelector('#leave').click();start();overview=false;destination=null;marker.visible=false;const restaurantFront=b.dataset.zone==='-1';position.set(0,1.72,restaurantFront?market.restaurant.z:Number(b.dataset.zone));yaw=restaurantFront?-Math.PI/2:0;pitch=0;document.querySelector('#view').textContent='위에서 보기';};
function greet(){if(play.inRoom){play.trade(market.restaurant.shop);return;}if(!nearby?.shop)return;play.trade(nearby.shop);}
talk.onclick=greet;addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(play.isOpen)return;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){start();destination=null;marker.visible=false;}if(k==='e')greet();keys.add(k);});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();drag=false;});
renderer.domElement.style.touchAction='none';let downX=0,downY=0,travel=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(play.isOpen)return;start();drag=true;downX=lastX=e.clientX;downY=lastY=e.clientY;travel=0;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||play.isOpen)return;travel=Math.max(travel,Math.hypot(e.clientX-downX,e.clientY-downY));if(travel>7){yaw-=(e.clientX-lastX)*.004;pitch=T.MathUtils.clamp(pitch-(e.clientY-lastY)*.003,-.35,.55);}lastX=e.clientX;lastY=e.clientY;});
renderer.domElement.addEventListener('pointerup',e=>{if(!drag)return;drag=false;if(travel>7||play.isOpen||play.seated)return;camera.updateMatrixWorld();const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=new T.Vector3();if(!raycaster.ray.intersectPlane(groundPlane,hit))return;
const bounds=market.restaurant.layout;const inBounds=play.inRoom?hit.x>=(bounds?.minX??6.05)&&hit.x<=(bounds?.maxX??10)&&hit.z>=(bounds?.minZ??market.restaurant.z-2.7)&&hit.z<=(bounds?.maxZ??market.restaurant.z+2.7):Math.abs(hit.x)<=1.7&&hit.z>=-49.5&&hit.z<=16;
if(!inBounds){notify('걸어갈 골목 바닥을 눌러주세요.');return;}destination=new T.Vector3(hit.x,position.y,hit.z);marker.position.set(hit.x,.045,hit.z);marker.visible=true;keys.clear();notify('노란 표시까지 걸어갑니다.');});
renderer.domElement.addEventListener('pointercancel',()=>drag=false);
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);start();destination=null;marker.visible=false;keys.add(b.dataset.key.toLowerCase());};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key.toLowerCase());}
let audio,playing=false;document.querySelector('#sound').onclick=async()=>{try{if(!audio){audio=new AudioContext();const n=audio.sampleRate*3,b=audio.createBuffer(1,n,audio.sampleRate),d=b.getChannelData(0);let prev=0;for(let i=0;i<n;i++){prev=(prev+(Math.random()*2-1)*.035)/1.04;d[i]=prev*2;}const source=audio.createBufferSource();source.buffer=b;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;const gain=audio.createGain();gain.gain.value=.3;source.connect(filter).connect(gain).connect(audio.destination);source.start();}playing=!playing;await audio[playing?'resume':'suspend']();document.querySelector('#sound').textContent=playing?'물소리 끄기':'물소리 켜기';}catch{document.querySelector('#sound').textContent='소리 재생을 지원하지 않아요';}};
let previous=performance.now(),time=0,lastCall='';function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.09);previous=now;time+=dt;
 if(walking){const before=position.clone();const f=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown')),r=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));const norm=Math.max(1,Math.hypot(f,r));
 if(!play.isOpen&&!play.seated){if(destination){const delta=destination.clone().sub(position),distance=delta.length();if(distance<.06){position.copy(destination);destination=null;marker.visible=false;}else position.addScaledVector(delta.normalize(),Math.min(distance,dt*3));}else{position.x+=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*dt*3/norm;position.z+=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*dt*3/norm;}
 position.x=T.MathUtils.clamp(position.x,play.inRoom?(market.restaurant.layout?.minX??6.05):-1.7,play.inRoom?(market.restaurant.layout?.maxX??10):1.7);position.z=T.MathUtils.clamp(position.z,play.inRoom?market.restaurant.z-2.7:-49.5,play.inRoom?market.restaurant.z+2.7:16);}
 const moved=position.distanceToSquared(before)>.00001;if(moved){const heading=Math.atan2(position.x-before.x,position.z-before.z);player.root.rotation.y+=T.MathUtils.euclideanModulo(heading-player.root.rotation.y+Math.PI,Math.PI*2)-Math.PI;}if(play.seated)player.root.rotation.y=market.restaurant.layout?Math.PI/2:Math.PI;
 const restaurantView=!play.inRoom&&!overview&&Math.abs(position.z-market.restaurant.z)<3.2&&Math.cos(yaw+Math.PI/2)>.88;
 const distance=overview?4.3:play.inRoom?2.6:3.4;
 const cameraGoal=play.seated?new T.Vector3(position.x-1.25,2.6,position.z+1.8):new T.Vector3(position.x+Math.sin(yaw)*distance,overview?4.2:3.05,position.z+Math.cos(yaw)*distance);
 if(restaurantView)cameraGoal.set(position.x-1.4,2.65,position.z+6.1);
 else if(!play.inRoom){const roadCameraEdge=innerWidth<=700?2.1:1.5;cameraGoal.x=T.MathUtils.clamp(cameraGoal.x,-roadCameraEdge,roadCameraEdge);}
 if(play.inRoom){cameraGoal.x=T.MathUtils.clamp(cameraGoal.x,market.restaurant.layout?4.2:5.9,market.restaurant.layout?8.5:11.3);cameraGoal.z=T.MathUtils.clamp(cameraGoal.z,market.restaurant.z-3,market.restaurant.z+3);}
 if(play.seated&&market.restaurant.layout)cameraGoal.set(5.5,2.4,market.restaurant.z+2);
 if(play.seated&&tableView)cameraGoal.set(market.restaurant.layout?6.35:8.4,market.restaurant.layout?1.25:1.48,market.restaurant.z+(market.restaurant.layout?.52:1.25));
 camera.position.lerp(cameraGoal,Math.min(1,dt*7));
 if(restaurantView)camera.lookAt(position.x+2.2,1.35+pitch*2,position.z-.1);
 else camera.lookAt(position.x,play.seated?.95:1.05+pitch*2,position.z+(play.seated?-.7:0));
 if(play.seated&&tableView){camera.lookAt(market.restaurant.layout?7.25:9.2,market.restaurant.layout?.76:1.28,market.restaurant.z+(market.restaurant.layout?.59:-1.1));player.hide();}
 else player.update(position,moved,time,play.seated,camera);
 viewButton.hidden=!play.seated;
 walkStatus.textContent=play.seated?'식사 중 · 일어나면 다시 걸을 수 있어요':destination?'이동 중 · '+Math.hypot(destination.x-position.x,destination.z-position.z).toFixed(1)+'m':'바닥을 클릭해 걸어가세요';marker.scale.setScalar(1+Math.sin(time*5)*.08);
 nearby=market.nearest(position);talk.hidden=play.inRoom||!nearby;talk.textContent=nearby?'E · '+nearby.name+' · 흥정하기':'';document.querySelector('#enter-restaurant').hidden=play.inRoom||Math.abs(position.z-market.restaurant.z)>5;
 if(!play.inRoom&&!play.isOpen&&nearby?.shop&&nearby.shop.id!==lastCall&&now>speechUntil){lastCall=nearby.shop.id;notify(nearby.name+' : '+nearby.shop.call);}
 if(now>speechUntil)caption.textContent=play.inRoom?(play.seated?'눈앞의 회 한 상을 즐겨보세요.':'나무 식탁에 앉아 정숙 이모와 흥정해보세요.'):position.z<-46?'골목 끝에는 바다가 있습니다.':position.z<-31?'과일 골목 · 귤과 사과가 바구니 가득 놓여 있어요.':nearby?'상인과 가격도 흥정하고 덤도 부탁해보세요. · E 키':'활어 골목 · 파란 수조와 분홍 대야 사이를 천천히 걸어요.';
 document.querySelector('#zone-name').textContent=play.inRoom?'바다횟집 · 횟집 안':position.z<-46?'03 — 바닷가':position.z<-31?'02 — 과일 골목':'01 — 활어 골목';
 }else{player.hide();camera.position.x=1.3+Math.sin(time*.1)*.15;camera.lookAt(-.5,2.7,-8);}
 market.update(time,dt);renderer.render(scene,camera);
}requestAnimationFrame(frame);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<=700?73:57;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

replaceRestaurant(scene,market).then(()=>{document.querySelector('#enter-restaurant').textContent='바다횟집 안으로 들어가기 ↗';document.querySelector('#seat').textContent='식탁에 앉기';notify('바다횟집 모델을 불러왔어요. 상단 ‘횟집 앞’에서 둘러보세요.');document.body.dataset.restaurantModel='loaded';}).catch(error=>{console.error('횟집 모델 로딩 실패',error);notify('횟집 모델을 불러오지 못했어요. 새로고침해 주세요.');document.body.dataset.restaurantModel='failed';});
