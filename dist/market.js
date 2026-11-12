import * as T from './assets/three.module.js';
export function makeMarket(scene){
 let seed=563;const rnd=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const materialCache=new Map(),geometryCache=new Map(),movingFish=[],people=[],bubbles=[],colliders=[],shops=[];
 const material=(color)=>{if(!materialCache.has(color))materialCache.set(color,new T.MeshStandardMaterial({color,roughness:.77}));return materialCache.get(color);};
 function mesh(geo,color,x,y,z,parent=scene){const m=new T.Mesh(geo,typeof color==='string'?material(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,c,x,y,z,p=scene){const key=`b${w},${h},${d}`;if(!geometryCache.has(key))geometryCache.set(key,new T.BoxGeometry(w,h,d));return mesh(geometryCache.get(key),c,x,y,z,p);}
 function ball(w,h,d,c,x,y,z,p=scene){const key='sphere';if(!geometryCache.has(key))geometryCache.set(key,new T.SphereGeometry(1,10,7));const m=mesh(geometryCache.get(key),c,x,y,z,p);m.scale.set(w,h,d);return m;}
 function cylinder(r,h,c,x,y,z,p=scene,r2=r){const key=`c${r},${h},${r2}`;if(!geometryCache.has(key))geometryCache.set(key,new T.CylinderGeometry(r2,r,h,12));return mesh(geometryCache.get(key),c,x,y,z,p);}
 function tube(points,r,c,p=scene){const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));return mesh(new T.TubeGeometry(curve,Math.max(8,points.length*4),r,5,false),c,0,0,0,p);}
 function label(text,w,h,x,y,z,{bg='#fff7dd',fg='#184d79',rot=0,round=false,sub='',size=100}={}){const cv=document.createElement('canvas');cv.width=512;cv.height=round?512:256;const cx=cv.getContext('2d');cx.fillStyle=bg;cx.fillRect(0,0,cv.width,cv.height);cx.strokeStyle=fg;cx.lineWidth=round?15:5;if(round){cx.beginPath();cx.arc(256,256,235,0,Math.PI*2);cx.stroke();}else cx.strokeRect(8,8,496,240);cx.fillStyle=fg;cx.textAlign='center';cx.textBaseline='middle';cx.font=`bold ${size}px sans-serif`;cx.fillText(text,256,round?220:sub?95:130,465);if(sub){cx.font=`bold ${round?65:40}px sans-serif`;cx.fillText(sub,256,round?345:190,450);}const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const m=mesh(round?new T.CircleGeometry(w/2,32):new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.8}),x,y,z);m.rotation.y=rot;m.userData.softwareTexture=true;return m;}
 // Small, reusable canvas materials give the room grain and wear without downloads.
 function surface(type,base){const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');c.fillStyle=base;c.fillRect(0,0,256,256);
  if(type==='wood'){for(let i=0;i<65;i++){c.strokeStyle=i%3?'rgba(47,25,12,.07)':'rgba(255,221,154,.09)';c.lineWidth=1+rnd()*2;c.beginPath();const y=rnd()*256;c.moveTo(0,y);c.bezierCurveTo(80,y+rnd()*8,180,y-5,256,y+3);c.stroke();}for(let i=0;i<4;i++){c.fillStyle='rgba(40,24,12,.27)';c.fillRect(0,i*64,256,2);}}
  else if(type==='tile'){for(let i=0;i<4;i++){c.fillStyle='#9e9d88';c.fillRect(i*64,0,2,256);c.fillRect(0,i*64,256,2);}for(let i=0;i<1200;i++){c.fillStyle='rgba(90,71,43,.055)';c.fillRect(rnd()*256,rnd()*256,2,2);}}
  else{for(let i=0;i<5000;i++){c.fillStyle=i%2?'rgba(115,90,48,.035)':'rgba(255,246,215,.07)';c.fillRect(rnd()*256,rnd()*256,2,2);}}
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:tex,roughness:type==='tile'?.43:.84});}
 const wood=surface('wood','#90633c'),darkwood=surface('wood','#5c4230'),plaster=surface('wall','#d9ccb0'),tile=surface('tile','#b8b5a0');
 function textured(w,h,d,mat,x,y,z){const m=box(w,h,d,mat,x,y,z);m.userData.softwareTexture=true;return m;}
 function wallArt(text,sub,w,h,x,y,z,bg='#eee0be',fg='#574634'){return label(text,w,h,x,y,z,{rot:-Math.PI/2,bg,fg,sub,size:78});}
 function fish(x,y,z,s=.25,p=scene,swimming=false){const g=new T.Group();g.position.set(x,y,z);p.add(g);ball(s,s*.2,s*.3,swimming?'#b8c8bf':'#c2ced0',0,0,0,g);const fin=mesh(new T.ConeGeometry(s*.25,s*.45,3),'#617e8a',-s*.95,0,0,g);fin.rotation.z=-Math.PI/2;ball(s*.05,s*.05,s*.04,'#16282e',s*.68,s*.05,s*.25,g);if(swimming){g.rotation.y=rnd()*6;movingFish.push({g,x,z,phase:rnd()*6});}else g.rotation.y=Math.PI/2+(rnd()-.5)*.4;return g;}
 function basin(x,y,z,c='#e789aa',type=0){cylinder(.48,.15,c,x,y,z);cylinder(.425,.025,'#718c8f',x,y+.09,z);const ring=mesh(new T.TorusGeometry(.46,.035,5,24),c,x,y+.095,z);ring.rotation.x=Math.PI/2;
  if(type===0){for(let n=0;n<5;n++)fish(x-.22+n*.11,y+.14,z,.23);}else if(type===1){for(let k=0;k<12;k++){const a=rnd()*6,r=rnd()*.32;ball(.09,.055,.08,'#caa586',x+Math.cos(a)*r,y+.14,z+Math.sin(a)*r);}}
  else if(type===2){for(let n=0;n<4;n++){const a=n*1.5;ball(.13,.04,.1,'#667859',x+Math.cos(a)*.22,y+.15,z+Math.sin(a)*.22);for(let j=0;j<4;j++){const leg=box(.29,.015,.018,'#7e8766',x+Math.cos(a)*.22,y+.15,z+Math.sin(a)*.22+(j-1.5)*.04);leg.rotation.y=(j%2?1:-1)*.5;}}}
  else {for(let n=0;n<4;n++){const zz=z-.23+n*.15;ball(.27,.025,.09,'#e4d5bb',x,y+.15,zz);const tail=mesh(new T.ConeGeometry(.075,.17,3),'#dfc7a1',x+.27,y+.15,zz);tail.rotation.z=-Math.PI/2;}}
 }
 function tank(x,z,len=2){const base='#0757b9',rim='#1279df';box(1.5,.5,len,base,x,.25,z);box(1.37,.055,len-.12,'#1479a9',x,.53,z);
 const glass=new T.MeshPhysicalMaterial({color:'#6ad3e6',transparent:true,opacity:.23,roughness:.13,metalness:.04,depthWrite:false});
 box(1.45,.68,.045,glass,x,.88,z+len/2);box(1.45,.68,.045,glass,x,.88,z-len/2);box(.045,.68,len,glass,x-.73,.88,z);box(.045,.68,len,glass,x+.73,.88,z);box(1.35,.02,len-.12,new T.MeshStandardMaterial({color:'#3989ac',transparent:true,opacity:.5,roughness:.12}),x,.98,z);
 for(let xx of [-.76,.76]){box(.09,.09,len+.06,rim,x+xx,1.25,z);for(let zz of [-len/2,len/2])box(.06,.75,.06,'#4c9bc8',x+xx,.9,z+zz);}
 for(let zz of [-len/2,len/2])box(1.6,.09,.1,rim,x,1.25,z+zz);
 for(let i=0;i<3;i++)fish(x+(rnd()-.5)*.8,.73,z+(rnd()-.5)*len*.7,.25,scene,true);
 tube([[x+.55,1.35,z+.5],[x+.6,.9,z+.5],[x+.55,.65,z+.5]],.035,'#e4e1c9');
 for(let i=0;i<3;i++){const b=ball(.026,.026,.026,'#c4ecf0',x+.54,.7+i*.15,z+.5);bubbles.push({b,y:.7+i*.15});}
 label('활 어',.65,.24,x,.29,z+len/2+.015,{bg:'#0757b9',fg:'#ffe47a',size:105});
 }
 function character(x,z,kind,index,visitor=false){const g=new T.Group();scene.add(g);g.position.set(x,0,z);g.rotation.y=x>0?-Math.PI/2:Math.PI/2;
 const configs=[{shirt:'#343b56',apron:'#cb4785',hair:'#302821',skin:'#deb18e',hat:'visor',pose:'wave',scale:.96},{shirt:'#78494b',apron:'#14698c',hair:'#b6b2a4',skin:'#d8ad8f',hat:'none',pose:'sit',scale:.95},{shirt:'#2c5365',apron:'#1b847d',hair:'#282b2b',skin:'#c79a7b',hat:'cap',pose:'work',scale:1.08},{shirt:'#c05c4d',apron:'#9e3355',hair:'#d1c6b9',skin:'#e6bda1',hat:'visor',pose:'lean',scale:.93},{shirt:'#d4c7ae',apron:'#285087',hair:'#292b28',skin:'#d5ac8f',hat:'cloth',pose:'work',scale:1.02},{shirt:'#4e6c48',apron:'#b36636',hair:'#2e2926',skin:'#bd9279',hat:'cap',pose:'wave',scale:1.12},{shirt:'#693d56',apron:'#b9514c',hair:'#3c302c',skin:'#deb398',hat:'none',pose:'work',scale:.98},{shirt:'#6b465a',apron:'#799578',hair:'#d8d1c2',skin:'#e1b99b',hat:'none',pose:'sit',scale:.88},{shirt:'#546f8c',apron:'#d7a25c',hair:'#372822',skin:'#e6bea1',hat:'none',pose:'wave',scale:1},{shirt:'#4d5d43',apron:'#685e4a',hair:'#8b897d',skin:'#bd9374',hat:'cap',pose:'lean',scale:1.12}];const c=configs[kind%configs.length];g.scale.set(c.scale*[1.05,1.16,.78,1.12,.86,1.26,1.4,1.24,.82,.88][kind%10],c.scale,c.scale);const seated=c.pose==='sit'&&!visitor,lean=c.pose==='lean'&&!visitor;const hip=seated?.57:.84;
 // Torso, neck, face, hair, and a separate apron.
 const torso=new T.Group();torso.position.y=hip;torso.rotation.x=lean?.22:0;g.add(torso);
 const coat=kind===6?ball(.265,.35,.175,c.shirt,0,.34,0,torso):box(.46,.66,.3,c.shirt,0,.34,0,torso);if(kind===3||kind===7){for(let k=0;k<18;k++)ball(.014,.014,.01,kind===3?'#ebc39b':'#a48d9c',(k%5-2)*.075,.08+Math.floor(k/5)*.14,.157,torso);}ball(.245,.11,.155,c.shirt,0,.62,0,torso);
 cylinder(.075,.13,c.skin,0,.76,0,torso);ball(kind===2||kind===9?.155:.19,kind===1||kind===9?.255:kind===7?.2:.235,.18,c.skin,0,.97,0,torso);ball(.198,.13,.185,c.hair,0,1.12,-.01,torso);
 ball(.04,.055,.055,c.skin,0,.97,.18,torso);for(let s of [-1,1]){ball(.016,.022,.012,'#252b2c',s*.075,1.01,.163,torso);const brow=box(.055,.012,.015,c.hair,s*.075,1.054,.158,torso);brow.rotation.z=s*.1;ball(.037,.06,.035,c.skin,s*.185,.98,0,torso);}
 const mouth=box(.067,.012,.013,'#9d5c51',0,.89,.167,torso);mouth.rotation.z=.06;
 if(kind===6){
  // Soft cheeks, a smiling mouth, short permed hair and a floral blouse.
  for(const side of [-1,1]){ball(.053,.027,.013,'#d89380',side*.115,.945,.157,torso);const smile=box(.037,.01,.014,'#9d5c51',side*.024,.897,.178,torso);smile.rotation.z=side*.25;}
  for(let n=0;n<18;n++){const a=n*Math.PI*2/18;ball(.061,.061,.058,n%4?'#3b302b':'#706358',Math.cos(a)*.174,1.105+Math.sin(a)*.13,-.035,torso);}
  for(let n=0;n<7;n++)ball(.058,.053,.045,'#463730',(n-3)*.047,1.115+Math.sin(n)*.015,.14,torso);
  for(let n=0;n<20;n++){const xx=(n%5-2)*.083,yy=.13+Math.floor(n/5)*.14;for(let k=0;k<4;k++)ball(.014,.015,.006,n%2?'#e4ba97':'#b898bb',xx+Math.cos(k*1.57)*.016,yy+Math.sin(k*1.57)*.016,.177,torso);}
  for(const side of [-1,1])ball(.018,.023,.015,'#c1a15f',side*.19,.945,.02,torso);
 }if(kind===8){ball(.09,.18,.08,c.hair,0,1.01,-.2,torso);}if(kind===7){for(let n=0;n<7;n++)ball(.065,.065,.06,c.hair,Math.cos(n*.9)*.16,1.15+Math.sin(n*.9)*.09,-.015,torso);}if(kind===1||kind===3||kind===7){for(const s of [-1,1]){const lens=mesh(new T.TorusGeometry(.05,.006,4,14),'#6b4f39',s*.077,1.01,.18,torso);}box(.04,.008,.015,'#6b4f39',0,1.01,.185,torso);}
 if(c.hat==='cap'){ball(.21,.105,.19,kind%2?'#b5955d':'#235b83',0,1.17,0,torso);ball(.18,.018,.17,'#2b5773',0,1.14,.17,torso);}
 if(c.hat==='visor'){box(.36,.07,.3,'#bf5366',0,1.14,.02,torso);ball(.21,.018,.18,'#bc526c',0,1.115,.17,torso);ball(.1,.11,.1,c.hair,0,1.12,-.17,torso);}
 if(c.hat==='cloth'){ball(.205,.13,.185,'#dfc9aa',0,1.15,-.01,torso);ball(.07,.07,.11,'#dfc9aa',0,1.11,-.2,torso);}
 if(!visitor){box(.34,.55,.02,c.apron,0,.2,.17,torso);box(.25,.2,.025,c.apron,0,.58,.17,torso);box(.15,.12,.025,'#eadbc8',.05,.27,.19,torso);for(const s of [-1,1])box(.035,.23,.025,c.apron,s*.12,.67,.17,torso);}
 const arms=[];for(let s of [-1,1]){const arm=new T.Group();arm.position.set(s*.27,.6,0);torso.add(arm);arm.rotation.z=s*.1;arm.rotation.x=-.25;const glove=!visitor&&(kind%3!==1);cylinder(.067,.32,c.shirt,0,-.12,0,arm);const fore=new T.Group();fore.position.y=-.28;arm.add(fore);fore.rotation.x=-.45;cylinder(.056,.27,glove?'#edc32c':c.skin,0,-.1,0,fore);ball(.065,.09,.055,glove?'#f0c725':c.skin,0,-.26,0,fore);arms.push(arm);}
 if(!visitor){if(c.pose==='wave'){arms[1].rotation.z=-1.8;arms[1].rotation.x=-.4;}if(c.pose==='work'){arms.forEach(a=>a.rotation.x=-.95);}if(lean){arms.forEach(a=>a.rotation.x=-.85);}}
 const legs=[];for(let s of [-1,1]){const leg=new T.Group();leg.position.set(s*.12,hip,0);g.add(leg);leg.rotation.x=seated?-1.25:0;cylinder(.085,seated?.4:.67,'#303d49',0,seated?-.19:-.33,0,leg);if(seated){const shin=cylinder(.078,.35,'#303d49',0,-.4,.16,leg);shin.rotation.x=1.25;}ball(.105,.08,.18,!visitor?'#49443a':'#ddd5c4',s*.015,-(seated?.42:.69),.065,leg);if(!visitor) cylinder(.093,.23,'#343e3a',0,-(seated?.35:.58),0,leg);legs.push(leg);}
 if(seated){box(.48,.09,.43,'#c35753',0,.48,0,g);for(let xx of [-.19,.19])for(let zz of [-.16,.16])box(.045,.43,.045,'#ad514c',xx,.22,zz,g);}
 const names=['분홍 앞치마 사장님','생선 손질하는 어르신','파란 모자 사장님','단골을 기다리는 사장님','수조를 살피는 사장님','손인사하는 사장님'];people.push({g,torso,arms,legs,kind,pose:c.pose,visitor,baseZ:z,x,phase:index*1.7,name:names[kind%6],line:['어서 와요! 오늘 생선 참 좋아요.','천천히 둘러봐요. 구경만 해도 괜찮아요.','싱싱한 활어 보고 가세요!','오늘은 오징어도 좋고, 새우도 좋아요.','수조에 물고기 많지요? 바다에서 막 왔어요.','반갑습니다! 시장 구경 재밌게 하고 가요.'][kind%6]});return g;}
 // Textured, wet asphalt with the drains and hoses in the reference photos.
 const roadCanvas=document.createElement('canvas');roadCanvas.width=roadCanvas.height=512;const rc=roadCanvas.getContext('2d');rc.fillStyle='#646d6a';rc.fillRect(0,0,512,512);for(let i=0;i<9000;i++){const k=Math.floor(80+rnd()*65);rc.fillStyle=`rgba(${k},${k+4},${k},.5)`;rc.fillRect(rnd()*512,rnd()*512,1+rnd()*3,1+rnd()*3);}const roadTex=new T.CanvasTexture(roadCanvas);roadTex.wrapS=roadTex.wrapT=T.RepeatWrapping;roadTex.repeat.set(4,18);roadTex.colorSpace=T.SRGBColorSpace;
 box(40,.2,85,'#aaa89b',0,-.2,-18);for(let z=14;z>-51;z-=4){const road=box(5.05,.04,4,new T.MeshStandardMaterial({map:roadTex,roughness:.38,color:'#b4b7ae'}),0,-.035,z);road.userData.softwareTexture=true;}
 for(let s of [-1,1]){box(.28,.035,63,'#3d4e50',s*2.55,-.005,-18);for(let z=12;z>-49;z-=.35)box(.29,.035,.04,'#8c9a91',s*2.55,.015,z);}
 for(let i=0;i<22;i++){const puddle=mesh(new T.CircleGeometry(.4+rnd()*.5,15),new T.MeshStandardMaterial({color:'#93b2b6',transparent:true,opacity:.42,roughness:.12}),rnd()*4-2,.001,10-rnd()*57);puddle.rotation.x=-Math.PI/2;puddle.scale.set(1,.28+rnd()*.5,1);}
 // Every shop has its own frontage, stock, merchant, and bargaining style.
 const shopTypes=[
 {name:'복자네 해산물',vendor:'복자 이모',type:'seafood',kind:0,fg:'#9b375c',awning:'#b75255',item:'해산물 한 바구니',price:12000,min:10000,call:'아이고, 구경만 해도 돼! 새우 한 바구니 보고 가요!',accept:'좋아, 오늘 첫손님이니까 그 가격에 드릴게!',reject:'그 가격은 곤란하지~ 조금만 더 얹어봐요.',extra:'알았어! 조개도 한 줌 더 담아줄게.'},
 {name:'바다청년 활어',vendor:'준호 사장',type:'live',kind:2,fg:'#1d5872',awning:'#367a92',item:'광어 한 마리',price:26000,min:23000,call:'광어 한 마리 어떠세요? 바다식탁에서 회로 드실 수 있어요!',accept:'좋습니다! 이 가격이면 저도 손님도 기분 좋죠.',reject:'활어 상태를 보세요! 그 가격은 조금 어렵네요.',extra:'멍게 조금 서비스로 챙겨드릴게요.'},
 {name:'삼대 건어물',vendor:'덕수 할아버지',type:'dried',kind:1,fg:'#795638',awning:'#ae9361',item:'멸치 한 봉지',price:9000,min:8500,call:'국물 낼 멸치 있어요. 천천히 보고 가요.',accept:'그려. 오래 끓이면 국물이 참 좋아.',reject:'좋은 멸치는 제값이 있어. 이 아래론 안 돼요.',extra:'덤보다는 좋은 것만 골라 담아줄게.'},
 {name:'바다식탁',vendor:'정숙 이모',type:'restaurant',kind:6,fg:'#784b3b',awning:'#8f4439',item:'모둠회 한 상',price:18000,min:16000,call:'왔나! 안에 앉아라. 회는 내가 맛있는 걸로 챙겨줄게.',accept:'알았다, 그 가격에 주께. 천천히 묵고 가라.',reject:'아이고, 그라믄 이모는 뭐 묵고 사노. 조금만 더 얹어봐라.',extra:'매운탕도 줄 테니까 속 따뜻하게 하고 가라.'},
 {name:'꽃게 아지매',vendor:'영자 사장님',type:'crab',kind:3,fg:'#a64a32',awning:'#d28a42',item:'꽃게 한 대야',price:22000,min:19000,call:'꽃게가 아주 실해! 오늘 저녁 꽃게탕 어때요?',accept:'좋아! 대신 맛있게 먹었다고 소문 내줘요.',reject:'그렇게 깎으면 내가 울겠네! 다시 불러봐요.',extra:'다리 실한 놈 하나 더 넣어줄게!'},
 {name:'은빛 생선가게',vendor:'선희 사장님',type:'fish',kind:8,fg:'#3d6769',awning:'#70978d',item:'고등어 세 마리',price:13000,min:11000,call:'고등어 손질해드려요! 구워 먹으면 맛있어요.',accept:'네, 그 가격에 깔끔하게 손질해드릴게요.',reject:'오늘 물건이 좋아서 그만큼은 어렵네요.',extra:'소금간까지 해드릴게요.'},
 {name:'순임네 조개',vendor:'순임 할머니',type:'shell',kind:7,fg:'#665b84',awning:'#807190',item:'바지락 한 바구니',price:8000,min:7000,call:'바지락 있어요. 된장국에 넣어봐, 시원해.',accept:'그래, 오늘은 그렇게 줘야지. 맛있게 먹어.',reject:'할머니도 장사는 해야지. 천 원만 더 주려나?',extra:'한 줌 더 담았어. 국 넉넉히 끓여 먹어.'},
 {name:'항구 어묵집',vendor:'철수 아저씨',type:'snack',kind:5,fg:'#a54c2d',awning:'#bf733b',item:'어묵 한 접시',price:5000,min:4500,call:'따끈한 어묵 있어요! 국물 한 잔 하고 가요!',accept:'오케이! 따뜻할 때 드세요.',reject:'뜨끈한 국물도 드리는데, 조금만 더 써줘요.',extra:'국물은 얼마든지 더 드릴게요!'},
 {name:'바람수산',vendor:'봉수 선장',type:'fish',kind:9,fg:'#3e5b4f',awning:'#637866',item:'생선 한 꾸러미',price:17000,min:15000,call:'오늘 바다에서 온 생선이오. 한 번 보고 가요.',accept:'거래 좋소. 가져가요.',reject:'그 정도론 어렵소. 물건부터 봐요.',extra:'작은 생선 하나 더 넣겠소.'},
 {name:'바닷물 수족관',vendor:'현우 사장',type:'live',kind:4,fg:'#286b88',awning:'#477aa2',item:'우럭 한 마리',price:24000,min:21000,call:'우럭도 좋아요! 구경하고 골라보세요.',accept:'좋아요. 싱싱한 걸로 골라드릴게요.',reject:'그 가격보단 조금 더 받아야겠어요.',extra:'해산물 조금 곁들여드릴게요.'},
 {name:'해풍 건어물',vendor:'정희 사장님',type:'dried',kind:8,fg:'#8b6346',awning:'#be9b6d',item:'오징어 두 마리',price:14000,min:12000,call:'말린 오징어 있어요! 간식으로 좋아요.',accept:'좋아요. 두툼한 걸로 드릴게요.',reject:'정말 잘 말린 거예요. 조금만 더 써봐요.',extra:'쥐포 한 장도 같이 가져가요.'},
 {name:'바구니 채소',vendor:'미숙 사장님',type:'produce',kind:3,fg:'#49714b',awning:'#7b9861',item:'채소 한 바구니',price:7000,min:6000,call:'저녁 반찬거리 보고 가요! 채소 싱싱해요.',accept:'그래요, 넉넉하게 담아줄게요.',reject:'그렇게는 어렵고 천 원만 더 주세요.',extra:'대파 한 줄기 더 넣어줄게요.'},
 {name:'귤빛 청과',vendor:'미영 사장님',type:'fruit',kind:0,fg:'#ae662b',awning:'#dba24d',item:'귤 한 바구니',price:10000,min:8500,call:'달콤한 귤 맛보고 가요! 한 바구니 어떠세요?',accept:'좋아요. 달고 좋은 걸로 담아요.',reject:'요것도 많이 깎은 거예요. 조금만 더요.',extra:'귤 두 개 더 얹어드릴게요.'},
 {name:'사과나무 상회',vendor:'성호 사장님',type:'fruit',kind:9,fg:'#995043',awning:'#a86357',item:'사과 한 바구니',price:12000,min:10000,call:'아삭한 사과 있어요. 구경하고 가세요.',accept:'네, 그렇게 드릴게요. 맛있게 드세요.',reject:'좋은 사과라 그 가격은 어렵습니다.',extra:'작은 사과 하나 더 챙겨드릴게요.'},
 {name:'초록 채소가게',vendor:'연숙 사장님',type:'produce',kind:7,fg:'#466c46',awning:'#72955d',item:'쌈채소 한 바구니',price:6000,min:5000,call:'회 먹을 거면 쌈채소도 가져가요!',accept:'좋아, 상추도 깻잎도 넉넉히 담아줄게.',reject:'조금만 더 줘요. 아주 싱싱해.',extra:'깻잎 조금 더 담아줄게요.'},
 {name:'포구 작은상점',vendor:'진수 사장님',type:'snack',kind:5,fg:'#9c5c37',awning:'#ad8856',item:'간식 한 봉지',price:4000,min:3500,call:'바다 보면서 먹을 간식 있어요!',accept:'좋아요! 바다 구경 잘하고 가요.',reject:'그 가격에는 어렵네요. 조금만 더요.',extra:'작은 간식도 하나 더 가져가요.'}
 ];
 function attachMerchant(shop,x,z,n){character(x,z,shop.kind,n);const p=people[people.length-1];p.name=shop.vendor;p.line=shop.call;p.shop=shop;shop.person=p;}
 let restaurant;
 for(let i=0;i<8;i++)for(const side of [-1,1]){
  const n=i*2+(side>0?1:0),shop={...shopTypes[n],id:'shop-'+n,x:side*4.5,z:7-i*6.8+(i%3-1)*.25,side};shops.push(shop);const z=shop.z,isRestaurant=shop.type==='restaurant';
  const height=[5.2,4.5,5.9,4.9,5.4][n%5];
  if(isRestaurant){
   const originalChildren=new Set(scene.children);
   // Actual open restaurant room, not a painted doorway.
   textured(6.3,.12,6.5,tile,8.6,.02,z);textured(.14,3.4,6.5,plaster,11.65,1.7,z);
   for(const zz of [z-3.25,z+3.25])textured(6.3,3.4,.14,plaster,8.6,1.7,zz);
   box(6.3,.12,6.6,'#b79a75',8.6,3.45,z);box(.15,.65,6.5,'#bbac91',5.5,3.13,z);
   for(const off of [-2.5,2.5]){box(.15,2.8,1.4,'#446963',5.5,1.4,z+off);box(.05,2.6,.06,'#d0b487',5.39,1.3,z+off-.68);box(.05,2.6,.06,'#d0b487',5.39,1.3,z+off+.68);}
   for(const off of [-1.76,1.76])box(.14,2.85,.12,'#6e4e33',5.38,1.4,z+off);
   label('바다식탁',4.6,.8,5.35,3.5,z,{rot:-Math.PI/2,bg:'#eee0bf',fg:'#8d4130',sub:'정숙 이모네 · 회 / 매운탕',size:100});
   // Linen doorway curtains parted in the center.
   for(const off of [-1.3,1.3])box(.045,.76,.82,'#944e3c',5.35,2.44,z+off);
   label('회',.9,1.2,3.2,2.45,z+2.7,{bg:'#a33f32',fg:'#f4e4c2',sub:'식사',size:150});
   tank(3.7,z+2.3,1.25);box(.65,.15,1.1,'#6c573e',3.8,.25,z-2.6);label('안으로 오세요',.85,.5,2.8,.9,z-.1,{rot:-Math.PI/2,bg:'#374e49',fg:'#eee2bc',sub:'모둠회 한 상',size:70});
   const table=textured(2.8,.13,1.45,wood,8.4,.74,z);for(const x of [7.3,9.5])for(const zz of [z-.5,z+.5])box(.1,.72,.1,'#61442d',x,.36,zz);
   for(const zz of [z-1.3,z+1.3]){textured(2.5,.12,.45,darkwood,8.4,.44,zz);for(const x of [7.4,9.4])box(.13,.42,.13,'#61442d',x,.21,zz);}
   // Wall menu and kitchen counter.
   wallArt('오늘도 잘 묵고 가이소','모둠회 18,000 · 매운탕은 이모 마음',3.5,1.05,11.54,2.35,z,'#e5d4ad','#643d29');
   // Wooden wainscot, patched tile floor, beams and the well-used kitchen.
   for(const zz of [z-3.14,z+3.14]){textured(6.05,.82,.09,darkwood,8.6,.48,zz);textured(6.1,.09,.14,wood,8.6,3.22,zz);}
   textured(.08,.82,6.2,darkwood,11.54,.48,z);
   for(const xx of [6.5,8.5,10.5])textured(.14,.17,6.4,darkwood,xx,3.27,z);
   // A handwritten menu faces the guests from the far wall.
   textured(2.35,1.05,.065,darkwood,8.05,2.05,z-3.08);
   label('정숙 이모네 한 상',2.2,.9,8.05,2.05,z-3.025,{bg:'#e4d1ac',fg:'#653e2b',sub:'모둠회 · 매운탕 · 공깃밥',size:72});
   label('천천히 묵고 가라',1.3,.45,6.4,1.55,z-3.025,{bg:'#e7d8b6',fg:'#73563e',size:75});
   // Warm pendants above the communal table.
   for(const zz of [z-.85,z+.85]){cylinder(.015,.47,'#483c2e',8.35,3.05,zz);mesh(new T.ConeGeometry(.35,.23,24,1,true),'#876847',8.35,2.73,zz);cylinder(.22,.035,new T.MeshStandardMaterial({color:'#fff1cb',emissive:'#ffc46c',emissiveIntensity:1.5}),8.35,2.61,zz);const light=new T.PointLight('#ffcc83',9,7,2);light.position.set(8.35,2.55,zz);scene.add(light);}
   // Paper notices, sea photograph, clock and wall fan.
   wallArt('밥은 묵었나?','혼자 와도 편하게 앉으이소',1.7,.73,11.54,1.6,z+2.1,'#f0e4c7','#70513c');
   wallArt('마산 앞바다','바다식탁 · 오래된 단골집',1.55,.88,11.53,2.55,z-2.25,'#789494','#f2dfb6');
   const clock=cylinder(.29,.065,'#5d4531',11.46,2.96,z+.6);clock.rotation.z=Math.PI/2;const face=cylinder(.25,.07,'#efe6ce',11.41,2.96,z+.6);face.rotation.z=Math.PI/2;box(.035,.16,.018,'#50483e',11.36,3.02,z+.6);box(.035,.018,.15,'#50483e',11.35,2.96,z+.66);
   const fan=new T.Group();fan.position.set(6.6,2.6,z-3.05);scene.add(fan);for(let k=0;k<3;k++){const a=k*2.094;const b=ball(.24,.065,.035,'#849587',Math.cos(a)*.14,Math.sin(a)*.14,0,fan);b.rotation.z=a;}for(const r of [.15,.3,.34])mesh(new T.TorusGeometry(r,.009,4,28),'#d3d3bc',0,0,.055,fan);ball(.06,.06,.05,'#c7cbb6',0,0,.08,fan);
   // Faded burgundy canvas, scalloped edge and glass entrance frames.
   const aw=textured(2.05,.09,6.45,surface('wall','#8c5146'),4.65,3.06,z);aw.rotation.z=.1;
   for(let k=0;k<13;k++){box(.08,.13,.46,k%2?'#c2a886':'#9b5b4d',3.65,2.91,z-3+k*.5);}
   for(const off of [-2.5,2.5]){const glass=new T.MeshPhysicalMaterial({color:'#9bb3a6',transparent:true,opacity:.22,roughness:.3,depthWrite:false});box(.055,1.65,1.17,glass,5.36,1.64,z+off);for(const yy of [.8,2.5])box(.09,.055,1.32,'#b3aa92',5.31,yy,z+off);box(.09,1.8,.055,'#b3aa92',5.31,1.65,z+off);}
   // Outdoor menu board and red stools.
   textured(.12,1.1,.95,darkwood,3.12,.63,z-2.3);wallArt('회 한 상','매운탕 · 공깃밥',.82,.84,3.04,.7,z-2.3,'#34453e','#e9d8ac');
   for(const zz of [z-2.7,z+2.7]){cylinder(.23,.1,'#9d4c3d',4.5,.43,zz);for(const xx of [-.14,.14])box(.045,.4,.045,'#6b5844',4.5+xx,.2,zz);}
   cylinder(.26,.42,'#8a613c',5.75,.25,z+2.85);for(let k=0;k<7;k++)ball(.12,.05,.08,'#657d4a',5.75+Math.sin(k)*.17,.52+k*.06,z+2.85+Math.cos(k)*.12);
   // A second small table, stacked bowls, tea kettle and cloths.
   textured(1.45,.12,.85,wood,8.1,.74,z-2.1);for(const xx of [7.55,8.65])for(const zz of [z-2.4,z-1.8])box(.07,.7,.07,'#64503a',xx,.35,zz);for(const xx of [7.2,9]){cylinder(.22,.1,'#8f4d3c',xx,.43,z-2.1);cylinder(.06,.4,'#69604c',xx,.2,z-2.1);}
   for(let j=0;j<5;j++)cylinder(.17,.055,'#e4dfc9',10.8,.97+j*.055,z+1.65);
   ball(.21,.21,.19,'#9eaaa0',10.8,1.12,z+1);cylinder(.08,.05,'#4b514a',10.8,1.33,z+1);tube([[10.65,1.15,z+1],[10.45,1.22,z+1]],.045,'#9eaaa0');
   box(.42,.025,.32,'#d3ba94',10.65,.93,z-.6);
   for(const off of [-.46,.46]){cylinder(.14,.04,'#e2dac5',8.55,.85,z+off);cylinder(.11,.012,off<0?'#a8462f':'#5c7843',8.55,.878,z+off);}
   box(.32,.09,.22,'#c3b48f',9.45,.86,z+.35);box(.21,.025,.13,'#efe4cf',9.45,.92,z+.35);
   for(let k=0;k<5;k++)box(.025,.015,.51,'#d4bb8a',7.55+k*.07,.82,z-.1);
   
   box(1.1,.9,4.4,'#5e706b',10.95,.45,z);for(let j=0;j<3;j++){cylinder(.27,.2,'#b5c2b7',10.8,1,z-1.2+j*1.1);}
   cylinder(.18,.2,'#d2c4ac',8,.93,z+.33);cylinder(.2,.025,'#5d7b67',8,1.04,z+.33);cylinder(.11,.15,'#ded7bb',9.2,.89,z+.35);
   box(.045,.025,.6,'#d7b46e',7.55,.83,z+.25);box(.045,.025,.6,'#d7b46e',7.67,.83,z+.25);
   const platter=new T.Group();scene.add(platter);platter.visible=false;platter.position.set(8.45,.84,z-.15);cylinder(.69,.06,'#345c66',0,0,0,platter);cylinder(.61,.02,'#c5d3bd',0,.04,0,platter);const slices=[];
   for(let k=0;k<6;k++){const a=k*Math.PI/3;const m=box(.28,.035,.19,k%2?'#edbfb3':'#f1e1c8',Math.cos(a)*.36,.085,Math.sin(a)*.36,platter);m.rotation.y=-a;slices.push(m);}ball(.13,.05,.1,'#8aaf67',0,.09,0,platter);
   const soup=new T.Group();scene.add(soup);soup.visible=false;cylinder(.28,.15,'#493b30',8.9,.91,z-.5,soup);cylinder(.24,.015,'#ad6a39',8.9,1,z-.5,soup);
   attachMerchant(shop,10.2,z-1.6,n);shop.person.g.rotation.y=-Math.PI/2;
   restaurant={shop,z,platter,slices,soup,originalObjects:scene.children.filter(o=>!originalChildren.has(o)),showDish(extra=false){platter.visible=true;slices.forEach(s=>s.visible=true);soup.visible=extra;},eat(index){if(slices[index])slices[index].visible=false;},clear(){platter.visible=false;soup.visible=false;}};
   continue;
  }
  box(4.4,height,6.6,['#c4b99c','#a3b1aa','#d0bca5','#bab7a6'][n%4],side*7.9,height/2-.1,z);box(.1,2.7,6.1,shop.type==='dried'?'#6b5b42':'#30494a',side*5.65,1.35,z);
  if(n%3!==1)for(let q=0;q<2;q++){box(.12,.85,1.1,'#576d6c',side*5.55,height-.9,z-1.5+q*3);box(.13,.035,1.15,'#d3cdb5',side*5.45,height-.9,z-1.5+q*3);}
  const aw=box(3+(n%3)*.18,.09,6.3,shop.awning,side*4.1,3.02+(n%2)*.2,z);aw.rotation.z=side*.11;
  if(n%3===0)for(let q=0;q<12;q++)box(.1,.07,6.3,'#ddd2af',side*(2.6+q*.25),2.88+q*.022,z);
  label(shop.name,4.9,.68,side*5.5,3.72,z,{rot:side<0?Math.PI/2:-Math.PI/2,bg:n%2?'#f1e3c5':shop.fg,fg:n%2?shop.fg:'#f4e3c5',sub:n%2?'오래된 골목의 맛':'오늘도 반갑습니다',size:85});
  box(1.8,.04,.04,'#637a73',side*3.5,3.14,z+1.6);
  const round=n%3===1;label(shop.type==='live'?'활어':shop.type==='dried'?'건어물':shop.type==='crab'?'꽃게':shop.type==='shell'?'조개':shop.type==='fruit'?'청과':shop.type==='snack'?'어묵':'수산',round?.8:.65,round?.8:1.05,side*2.6,2.65,z+1.6,{round,bg:round?'#196b99':shop.fg,fg:'#f5e7bf',sub:round?'시장':'어서오세요',size:110});
  if(shop.type==='live'){
   tank(side*3.6,z-1.5,2.7);tank(side*3.6,z+1.5,2.4);for(let j=0;j<3;j++)box(.8,.28,.7,'#e7e3d5',side*4.7,.15+j*.3,z+2.5);
  }else if(shop.type==='dried'){
   box(1.7,.7,4.8,'#9b774d',side*3.5,.35,z);for(let j=0;j<4;j++){cylinder(.43,.13,'#c6ab76',side*3.5,.78,z-1.7+j*1.1);for(let k=0;k<5;k++)fish(side*3.5+(k-2)*.12,.9,z-1.7+j*1.1,.25);}
   box(.06,.06,4.5,'#9a8056',side*3.5,2.4,z);for(let k=0;k<8;k++){tube([[side*3.5,2.4,z-1.8+k*.5],[side*3.5,1.9,z-1.8+k*.5]],.012,'#a78b64');const f=fish(side*3.5,1.75,z-1.8+k*.5,.3);f.rotation.z=Math.PI/2;f.children[0].material=material('#bb9b68');}
  }else if(shop.type==='crab'){
   box(1.8,.35,4.8,'#936e4b',side*3.5,.17,z);for(let k=0;k<4;k++)basin(side*3.45,.47,z-1.7+k*1.1,k%2?'#bc6644':'#4c84a2',2);tube([[side*3.6,.1,z-2.4],[side*2.9,.7,z-2.2],[side*3.3,1.3,z-2.3]],.035,'#b79b62');
  }else if(shop.type==='shell'){
   for(let k=0;k<4;k++){box(1.5,.21,.92,'#4a7967',side*3.45,.12,z-1.7+k*1.1);basin(side*3.4,.36,z-1.7+k*1.1,'#c8af7c',1);}box(.8,.18,.8,'#4d7a57',side*4.7,.09,z-1.4);
  }else if(shop.type==='snack'){
   box(1.6,.88,4.1,'#a56638',side*3.6,.44,z);box(1.75,.08,4.2,'#a4aea2',side*3.6,.93,z);
   for(let j=0;j<3;j++){cylinder(.38,.18,'#b6bdb1',side*3.6,1.05,z-1.3+j*1.2);cylinder(.32,.02,'#aa8455',side*3.6,1.16,z-1.3+j*1.2);for(let k=0;k<4;k++){const sk=box(.025,.65,.025,'#d9ba7b',side*3.6+(k-1.5)*.11,1.34,z-1.3+j*1.2);ball(.055,.14,.06,'#c5a46f',side*3.6+(k-1.5)*.11,1.43,z-1.3+j*1.2);}}
   for(const off of [-1.1,1.1]){cylinder(.23,.1,'#a64a37',side*2.15,.42,z+off);for(const xx of [-.13,.13])box(.04,.4,.04,'#705044',side*2.15+xx,.2,z+off);}
  }else if(shop.type==='fruit'||shop.type==='produce'){
   box(1.8,.7,5.1,'#947854',side*3.6,.35,z);for(let k=0;k<5;k++){const zz=z-1.8+k*.9;box(1.6,.12,.8,'#ccae7a',side*3.6,.76,zz);for(let j=0;j<9;j++){ball(shop.type==='produce'?.15:.12,shop.type==='produce'?.09:.12,.13,shop.type==='produce'?['#66954b','#8caa5b','#537951'][k%3]:['#db8530','#af4439','#daa950'][k%3],side*3.6+(j%3-1)*.4,.94+(j%2)*.07,zz+(Math.floor(j/3)-1)*.22);}}
   if(n%2===0){const umbrella=mesh(new T.ConeGeometry(1.65,.75,10),shop.awning,side*3.5,3,z);cylinder(.045,2.8,'#a09171',side*3.5,1.4,z);}
  }else if(shop.type==='fish'){
   box(1.8,.8,4.8,'#9faaa4',side*3.55,.4,z);box(1.85,.06,4.9,'#e4e4d2',side*3.55,.84,z);for(let j=0;j<3;j++){box(1.55,.12,1.35,'#c8d4ce',side*3.55,.93,z-1.5+j*1.5);for(let k=0;k<4;k++)fish(side*3.55+(k-1.5)*.32,1.06,z-1.5+j*1.5,.36);}
  }
  const low=shop.type==='shell'||shop.type==='crab';attachMerchant(shop,side*(low?3.95:4.75),z+(n%2?.4:-.4),n);
  if(n===0)label('흥정 환영',.75,.5,-2.45,1.4,z+2.4,{rot:Math.PI/2,bg:'#f3dfb0',fg:'#9c3f47',sub:'복자네',size:96});
  if(n%3===0)basin(side*2.25,.12,z+2.5,'#aa543c',n%4);
  if(['live','seafood','fish'].includes(shop.type))tube([[side*3.6,1.2,z-2.1],[side*2.5,.07,z-2.5],[side*1.98,.04,z-1.6],[side*2.35,.04,z-.4]],.037,'#426fb0');
  if(shop.type==='seafood'){box(1.75,.7,4.8,'#ab9e89',side*3.6,.35,z);box(1.8,.07,4.9,'#e8d9c1',side*3.6,.75,z);for(let j=0;j<3;j++)for(let q=0;q<2;q++)basin(side*3.6+(q-.5)*.8,.87,z-1.6+j*1.2,j%2?'#e784a9':'#dc668c',(j+q)%4);}
  label(shop.item,.7,.4,side*2.65,1.1,z+1.7,{rot:side<0?Math.PI/2:-Math.PI/2,bg:'#fbf0d4',fg:shop.fg,sub:shop.price.toLocaleString()+' · 놀이 가격',size:70});
 }

 // Red-and-ivory barrel canopy: translucent panels and exposed steel ribs.
 for(let z=10;z>-32;z-=3.4){for(let j=0;j<12;j++){const a=j*Math.PI/12,b=(j+1)*Math.PI/12,rr=5.15;const vertices=new Float32Array([rr*Math.cos(a),3.5+rr*.39*Math.sin(a),z,rr*Math.cos(b),3.5+rr*.39*Math.sin(b),z,rr*Math.cos(b),3.5+rr*.39*Math.sin(b),z-3.4,rr*Math.cos(a),3.5+rr*.39*Math.sin(a),z-3.4]);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(vertices,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();mesh(geo,new T.MeshStandardMaterial({color:j<3||j>8?'#bd543d':'#e5d7b7',side:T.DoubleSide,roughness:.8}),0,0,0);}
  const rib=[];for(let j=0;j<=20;j++){const a=j*Math.PI/20;rib.push([Math.cos(a)*5.15,3.5+Math.sin(a)*2.01,z]);}tube(rib,.038,'#5e6864');
  if(Math.round(z*10)%2===0){const glow=cylinder(.16,.15,new T.MeshStandardMaterial({color:'#fff9dd',emissive:'#ffdf9a',emissiveIntensity:.6}),0,4.95,z);cylinder(.29,.055,'#d6d8c9',0,5.05,z);}
 }
 for(const x of [-4,-2,0,2,4]){const y=3.5+2*Math.sqrt(1-(x/5.15)**2);box(.04,.04,42,'#72776a',x,y,-11);}
 // Entrance wave arch and symbolic fish sculpture, inspired by the supplied gateway.
 for(const s of [-1,1]){box(.35,5,.4,'#2476ac',s*5.1,2.4,12);box(.48,.22,.55,'#82b8ce',s*5.1,4.2,12);}
 box(10.8,1.05,.4,'#245b99',0,4.65,12);label('마 산 어 시 장',9,.9,0,4.65,12.23,{bg:'#245b99',fg:'#f5edd8',size:90});
 for(let k=0;k<3;k++){const pts=[];for(let n=0;n<=24;n++)pts.push([-5.5+n*11/24,5.28+k*.22+Math.sin(n*.7)*.14,12]);tube(pts,.09,['#77becd','#488cad','#a9d7d5'][k]);}
 const gateFish=fish(0,6.05,12,.75);gateFish.rotation.z=.75;gateFish.rotation.y=0;gateFish.scale.set(1,1.8,1);gateFish.children[0].material=material('#c8a557');
 // A few shoppers walking slowly: these are local animated characters, not other users.
 character(-.75,-8,4,20,true);character(1,-22,2,22,true);character(-.7,-35,0,24,true);
 // Harbor exit.
 box(60,.1,35,'#4b9ca9',0,-.17,-68);box(28,.18,4,'#b2b4a6',0,0,-51);for(let i=-12;i<13;i+=3)cylinder(.07,1.1,'#5a7775',i,.6,-52);box(26,.05,.06,'#628381',0,1.1,-52);
 for(let i=0;i<3;i++){const x=-8+i*8,z=-60-i*2;box(3.8,.65,1.6,['#b35c46','#e3ddbd','#366e81'][i],x,.18,z);box(1.4,.9,1.3,'#e7e0c8',x,.9,z);cylinder(.035,4.5,'#7d8880',x,2,z);}
 scene.traverse(o=>{if(o.isMesh&&o.geometry.boundingSphere===null)o.geometry.computeBoundingSphere();if(o.isMesh&&o.geometry.boundingSphere&&o.geometry.boundingSphere.radius<.28)o.castShadow=false;});
 return {people,shops,restaurant,movingFish,bubbles,update(t,dt){movingFish.forEach(({g,x,z,phase})=>{g.position.x=x+Math.sin(t*.8+phase)*.24;g.position.z=z+Math.cos(t*.9+phase)*.26;g.rotation.y=Math.sin(t*.8+phase)*1.1;});bubbles.forEach(({b,y})=>b.position.y=.57+((t*.19+y)% .56));for(const p of people){if(p.visitor){p.g.position.z=p.baseZ+Math.sin(t*.09+p.phase)*4;p.g.rotation.y=Math.cos(t*.09+p.phase)>0?0:Math.PI;p.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*3+p.phase+i*Math.PI)*.2);p.arms.forEach((a,i)=>a.rotation.x=Math.sin(t*3+p.phase+i*Math.PI)*.16);}else{if(p.pose==='wave')p.arms[1].rotation.z=-1.8+Math.sin(t*1.7+p.phase)*.18;if(p.pose==='work')p.arms.forEach((a,i)=>a.rotation.x=-.95+Math.sin(t*1.4+p.phase+i)*.13);p.torso.rotation.z=Math.sin(t*.65+p.phase)*.015;}}},nearest(pos){let best=null,d=5.5;for(const p of people){if(p.visitor)continue;const dd=p.g.position.distanceTo(pos);if(dd<d){d=dd;best=p;}}return best;}};
}
