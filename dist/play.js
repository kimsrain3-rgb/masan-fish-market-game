export function createPlay({market,notify,enter,exit,sit,stand,stop}){
 const $=s=>document.querySelector(s),money=n=>n.toLocaleString('ko-KR');
 let state={wallet:50000,bag:[],meal:null};try{const old=JSON.parse(localStorage.getItem('masan-play-v1'));if(old&&Number.isFinite(old.wallet)&&old.wallet>=0&&Array.isArray(old.bag))state={...state,...old};}catch{}
 let current=null,agreed=0,extra=false,room=false,seated=false,open=false,eating=false;
 const panel=$('#trade-panel'),body=$('#trade-body');
 function save(){try{localStorage.setItem('masan-play-v1',JSON.stringify(state));}catch{}$('#wallet').textContent='놀이 지갑 '+money(state.wallet)+'원';$('#bag').textContent='장바구니 '+state.bag.length;}
 function close(){panel.hidden=true;open=false;stop();}
 function show(title,who){stop();open=true;panel.hidden=false;$('#trade-title').textContent=title;$('#trade-person').textContent=who;body.replaceChildren();}
 function para(text,cl=''){const p=document.createElement('p');p.textContent=text;p.className=cl;body.append(p);return p;}
 function btn(text,action,primary=false){const b=document.createElement('button');b.textContent=text;if(primary)b.className='primary-action';b.onclick=action;body.append(b);return b;}
 function updateRoom(){const count=state.meal?.left||0;$('#room-actions').hidden=!room;$('#seat').hidden=seated;$('#stand').hidden=!seated;$('#order').hidden=!seated||count>0;$('#eat').hidden=!seated||count<=0;$('#eat').textContent='회 한 점 먹기 · '+count+'점';$('#meal-status').textContent=count?'회 한 상 · '+count+'점 남음':state.meal?'잘 먹었습니다!':'안으로 들어왔어요. 자리에 앉아보세요.';}
 function restoreMeal(){if(state.meal&&state.meal.left>0){market.restaurant.showDish(state.meal.extra);for(let i=0;i<6-state.meal.left;i++)market.restaurant.eat(i);}updateRoom();}
 function serve(withExtra){state.meal={left:6,extra:withExtra};market.restaurant.showDish(withExtra);save();updateRoom();}
 function goIn(){close();room=true;seated=false;enter();updateRoom();notify('바다횟집에 들어왔어요. 나무 식탁에 앉아보세요.');}
 function seatedNow(){seated=true;sit();updateRoom();notify(state.meal?.left?'회 한 상이 준비됐어요. 한 점 드셔보세요.':'정숙 이모와 흥정해서 모둠회 한 상을 주문해보세요.');}
 function trade(shop){current=shop;agreed=shop.price;extra=false;renderTrade();}
 function renderTrade(message=''){
  const s=current;show(s.name,s.vendor+' · '+({seafood:'넉살 좋은 시장의 터줏대감',live:'싱싱함에 자신 있는 활어 전문가',dried:'제값을 지키는 건어물 장인',restaurant:'툭툭 말해도 한 상 넉넉히 챙기는 마산 이모',crab:'흥정할수록 말이 많아지는 사장님',fish:'손질까지 꼼꼼한 생선가게',shell:'덤을 넉넉히 주는 할머니',snack:'국물 인심이 좋은 아저씨',fruit:'맛있는 과일을 골라주는 사장님',produce:'저녁 반찬을 챙겨주는 사장님'}[s.type]));
  para('“'+(message||s.call)+'”','npc-line');para(s.item,'item-name');para('제시 가격 '+money(agreed)+'원 · 놀이 지갑 '+money(state.wallet)+'원','price-line');
  if(state.meal?.left&&s.type==='restaurant'){para('아직 먹고 있는 회가 있어요. 먼저 한 상을 마저 즐겨보세요.');btn('횟집으로 가기',()=>{goIn();seatedNow();},true);return;}
  const form=document.createElement('form');form.className='offer-form';const lab=document.createElement('label');lab.textContent='원하는 가격을 불러보세요';lab.htmlFor='offer-price';const input=document.createElement('input');input.type='number';input.id='offer-price';input.min=1;input.step=1;input.value=Math.max(500,s.price-2000);input.inputMode='numeric';const submit=document.createElement('button');submit.type='submit';submit.textContent='이 가격에 주세요';form.append(lab,input,submit);form.onsubmit=e=>{e.preventDefault();const value=Number(input.value);if(!Number.isFinite(value)||value<1||value>s.price){notify('1원부터 원래 가격 사이로 불러보세요.');return;}if(value<s.min){agreed=s.min;renderTrade(s.reject+' '+money(s.min)+'원까지는 해줄게요.');const p=body.querySelector('.price-line');if(p)p.textContent='사장님 제안 '+money(s.min)+'원 · 놀이 지갑 '+money(state.wallet)+'원';}else{agreed=value;renderTrade(s.accept);}};body.append(form);
  btn('덤도 조금 주세요',()=>{extra=true;renderTrade(s.extra);});
  const label=s.type==='restaurant'?'이 가격에 회 한 상 주문':s.type==='live'?'이 가격에 사고 회로 먹기':'이 가격에 담기';const buy=btn(label+' · '+money(agreed)+'원',purchase,true);buy.disabled=state.wallet<agreed;if(buy.disabled)para('놀이 돈이 부족해요. 장바구니에서 새 장보기를 시작할 수 있어요.','hint');
  if(s.type==='restaurant')btn('일단 안에 구경할게요',goIn);
 }
 function purchase(){const s=current;if(!s||state.wallet<agreed)return;state.wallet-=agreed;state.bag.push({name:s.item,shop:s.name,price:agreed,extra});if(s.type==='restaurant'||s.type==='live')serve(extra);save();show('기분 좋은 거래',s.vendor);para('“'+s.accept+'”','npc-line');para(s.item+' · '+money(agreed)+'원에 거래했어요.');if(extra)para(s.extra,'hint');if(s.type==='restaurant'||s.type==='live'){btn('횟집에 들어가서 회 먹기',()=>{goIn();seatedNow();},true);}else btn('다른 가게도 구경하기',close,true);}
 $('#panel-close').onclick=close;panel.addEventListener('click',e=>{if(e.target===panel)close();});addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 $('#bag').onclick=()=>{show('오늘의 장바구니','실제 결제가 없는 어시장 놀이');if(!state.bag.length)para('아직 빈 바구니예요. 상인에게 말을 걸고 흥정해보세요.');for(const item of state.bag)para(item.name+' · '+money(item.price)+'원'+(item.extra?' · 덤도 받았어요!':''));para('남은 놀이 돈 '+money(state.wallet)+'원','price-line');btn('새 장보기 · 놀이 돈 50,000원 받기',()=>{state={wallet:50000,bag:[],meal:null};market.restaurant.clear();save();updateRoom();close();notify('새 장보기를 시작합니다. 놀이 돈 50,000원을 받았어요.');});};
 $('#enter-restaurant').onclick=goIn;$('#seat').onclick=seatedNow;$('#stand').onclick=()=>{seated=false;stand();updateRoom();};$('#leave').onclick=()=>{room=false;seated=false;exit();updateRoom();notify('다시 시장 골목으로 나왔어요.');};$('#order').onclick=()=>trade(market.restaurant.shop);
 $('#eat').onclick=()=>{if(eating||!state.meal?.left)return;eating=true;$('#eat').disabled=true;$('#bite').hidden=false;market.restaurant.eat(6-state.meal.left);state.meal.left--;save();updateRoom();notify(state.meal.left?'쫄깃한 회 한 점! '+state.meal.left+'점 남았어요.':'잘 먹었습니다! 시장에서 다음 가게도 들러보세요.');setTimeout(()=>{$('#bite').hidden=true;eating=false;$('#eat').disabled=false;},850);};
 $('#wallet').onclick=()=>$('#bag').click();save();restoreMeal();return{trade,close,goIn,get isOpen(){return open;},get inRoom(){return room;},get seated(){return seated;},get nearShop(){return current;}};
}
