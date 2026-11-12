import * as T from './assets/three.module.js';

// Keep the restaurant model and replace only the writing on its front sign.
export function updateRestaurantSign(model){
 let oldText=null;
 model.traverse(o=>{if(o.userData.name==='Main Korean restaurant sign'||o.name==='Main Korean restaurant sign')oldText=o;});
 if(oldText)oldText.visible=false;

 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#245b78';
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='800 184px "Noto Sans KR","Malgun Gothic",sans-serif';
 ctx.fillText('\uBC14\uB2E4\uD69F\uC9D1',512,130,880);

 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(3.85,.68),new T.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.02,side:T.DoubleSide,depthWrite:false}));
 sign.name='\uBC14\uB2E4\uD69F\uC9D1 sign text';
 sign.position.set(0,4.65,4.625);
 model.add(sign);
 return sign;
}
