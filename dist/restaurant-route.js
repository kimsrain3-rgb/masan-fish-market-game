// Restaurant customer lane: street -> open front gap -> dining aisle.
export function restaurantWalkable(x,z,restaurantZ){
 const rel=z-restaurantZ;
 if(Math.abs(x)<=1.7&&z>=-49.5&&z<=16)return true;
 if(x>=1.45&&x<=6.45&&rel>=1.52&&rel<=2.48)return true;
 if(x>=5.9&&x<=6.55&&rel>=-1.9&&rel<=2.48)return true;
 if(x>=6.15&&x<=8.35&&rel>=-1.9&&rel<=1.2){
  return !(x>=6.68&&x<=7.5&&rel>=-.2&&rel<=1.3);
 }
 return false;
}

export function routeRestaurant(start,target,restaurantZ){
 const hub={x:0,z:restaurantZ+2};
 const prefix=[];
 let from={x:start.x,z:start.z},to={x:target.x,z:target.z},tail=null;
 if(from.x<=1.7&&Math.abs(from.z-restaurantZ)>2.5){prefix.push(hub);from=hub;}
 if(to.x<=1.7&&Math.abs(to.z-restaurantZ)>2.5){tail=to;to=hub;}
 const minX=-1.7,minRel=-2.5,step=.25,nx=41,nz=21;
 const point=i=>({x:minX+(i%nx)*step,z:restaurantZ+minRel+Math.floor(i/nx)*step});
 const cells=[];
 for(let i=0;i<nx*nz;i++){const p=point(i);if(restaurantWalkable(p.x,p.z,restaurantZ))cells.push(i);}
 const nearest=p=>{let best=-1,d=Infinity;for(const i of cells){const q=point(i),v=(q.x-p.x)**2+(q.z-p.z)**2;if(v<d){best=i;d=v;}}return best;};
 const a=nearest(from),b=nearest(to);
 if(a<0||b<0)return null;
 const g=new Float64Array(nx*nz).fill(Infinity),prev=new Int32Array(nx*nz).fill(-1),open=[a],opened=new Set([a]),closed=new Set();g[a]=0;
 const cost=(i,j)=>{const p=point(i),q=point(j);return Math.hypot(p.x-q.x,p.z-q.z);};
 const clear=(p,q)=>{const n=Math.ceil(Math.hypot(p.x-q.x,p.z-q.z)/.1);for(let i=0;i<=n;i++){const t=i/Math.max(1,n);if(!restaurantWalkable(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t,restaurantZ))return false;}return true;};
 while(open.length){let bestAt=0,bestScore=Infinity;for(let k=0;k<open.length;k++){const s=g[open[k]]+cost(open[k],b);if(s<bestScore){bestScore=s;bestAt=k;}}const i=open.splice(bestAt,1)[0];opened.delete(i);if(i===b)break;closed.add(i);
  for(const dz of [-1,0,1])for(const dx of [-1,0,1]){if(!dx&&!dz)continue;const x=i%nx+dx,z=Math.floor(i/nx)+dz;if(x<0||x>=nx||z<0||z>=nz)continue;const j=z*nx+x;if(closed.has(j)||!restaurantWalkable(point(j).x,point(j).z,restaurantZ)||!clear(point(i),point(j)))continue;const next=g[i]+cost(i,j);if(next<g[j]){g[j]=next;prev[j]=i;if(!opened.has(j)){open.push(j);opened.add(j);}}}
 }
 if(a!==b&&prev[b]<0)return null;
 const raw=[];for(let i=b;i>=0;i=prev[i]){raw.push(point(i));if(i===a)break;}raw.reverse();
 const path=[from,...raw,to],smooth=[path[0]];
 for(let i=0;i<path.length-1;){let j=path.length-1;while(j>i+1&&!clear(path[i],path[j]))j--;smooth.push(path[j]);i=j;}
 const result=[...prefix,...smooth.slice(1)];
 if(tail)result.push(tail);
 return result;
}
