// Move the existing red stool to the far side of the table so diners face the
// merchant and the market, with the table between them.
export function faceRestaurantSeatTowardMarket(model){
 model.traverse(part=>{
  const name=part.userData.name||part.name;
  if(name==='Red plastic stool 3 seat'||name.startsWith('Stool 3 leg '))part.position.z-=2.12;
 });
}
