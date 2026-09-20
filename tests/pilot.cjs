// Reads state and emits normal player inputs; never mutates game state.
function pilot(g, objective) {
  const p=g.player, dist=o=>Math.hypot(o.x-p.x,o.y-p.y);
  let target=objective(g);
  const controllerGroup=g.level===4&&g.stage===1?'airfield-radar':g.level===4&&g.stage===4?'supergun-radar':g.level===2&&g.stage===6?'optional-radar':null;
  if(controllerGroup){const controller=g.enemies.filter(e=>e.group===controllerGroup&&e.hp>0&&!e.hidden).sort((a,b)=>dist(a)-dist(b))[0];if(controller)target=controller;}
  if(g.level===3&&g.stage===4){const radar=g.enemies.filter(e=>e.group==='nuclear-radar'&&!e.hidden&&e.hp>0).sort((a,b)=>dist(a)-dist(b))[0];if(radar)target=radar;}
  const convoy=g.level===4&&g.stage===2?g.enemies.filter(e=>e.kind==='convoy'&&e.hp>0&&!e.hidden).sort((a,b)=>Math.hypot(a.x-a.destination.x,a.y-a.destination.y)-Math.hypot(b.x-b.destination.x,b.y-b.destination.y))[0]:null;
  const urgent=convoy||g.enemies.filter(e=>e.hp>0&&!e.hidden&&e.deadline).sort((a,b)=>a.deadline-b.deadline)[0];
  const copilot=g.people.find(h=>h.role==='copilot'&&!h.rescued&&!h.dead&&!h.hidden&&!h.captive);
  if(copilot)target=copilot;else if(urgent)target=urgent;
  let resource;
  if(p.fuel<28)resource='fuel';else if(p.armor<(g.level===4?400:240))resource='repair';else if(p.ammo<180||(p.hellfires<(g.level===4?3:1)&&p.rockets<(g.level===4?18:5)))resource='ammo';
  // A covered resource requires shooting its visible cover before attempting pickup.
  if(resource){const crates=g.supplies.filter(s=>s.kind===resource&&!s.used).sort((a,b)=>dist(a)-dist(b));if(crates[0])target=crates[0].hidden?g.enemies.find(e=>e.id===crates[0].coverId||e.supplyId===crates[0].id&&e.cache):crates[0];}
  if(urgent&&urgent.kind!=='bomber'&&(p.ammo>0||p.rockets>0||p.hellfires>0))target=urgent;if(copilot)target=copilot;
  const threat=g.enemies.filter(e=>e.weapon&&e.hp>0&&!e.hidden&&dist(e)<(g.level===2&&g.stage===6?400:260)).sort((a,b)=>dist(a)-dist(b))[0];
  if(threat&&!copilot&&(!resource||g.level===4&&dist(threat)<230&&(p.ammo>0||p.rockets>0||p.hellfires>0))&&!convoy)target=threat;
  const survivor=g.people.filter(h=>!h.rescued&&!h.dead&&!h.hidden&&!h.captive&&(!h.requiresCash||g.flags.cash)&&h.role!=='MIA'&&h.role!=='Valdez'&&dist(h)<220).sort((a,b)=>dist(a)-dist(b))[0];
  if(survivor&&p.crew<6&&!threat&&!convoy)target=survivor;
  const attack=typeof target.hp==='number'&&target!==g.bus&&!target.civilian;
  let tx=target.x,ty=target.y;if(target===g.bus){tx+=110;ty-=80;}
  let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),range=attack?166:18;
  // Approach the ambassador's building from the side opposite its exit. Rounds already in
  // flight can otherwise hit personnel emerging between the aircraft and the wall.
  const unsafeExit=attack&&target.release&&p.y>target.y+20;
  if(unsafeExit){dx=target.x+155-p.x;dy=target.y-80-p.y;d=Math.hypot(dx,dy);range=18;}
  if(attack&&target.weapon&&d<225){const a=Math.atan2(dy,dx),radial=(d-177)/35;dx=Math.cos(a)*radial-Math.sin(a);dy=Math.sin(a)*radial+Math.cos(a);d=999;}
  // Steer around collidable scenery rather than crossing through buildings.
  const obstacle=[...g.enemies.filter(e=>!e.hidden&&(e.hp>0||e.solidWreck)&&e.collisionRadius),...g.scenery.filter(e=>e.hp>0)].find(e=>dist(e)<(attack?65:40)&&e!==target);
  if(obstacle){const a=Math.atan2(obstacle.y-p.y,obstacle.x-p.x);dx-=Math.cos(a)*70;dy-=Math.sin(a)*70;dx+=Math.sin(a)*35;dy-=Math.cos(a)*35;}
  const safeLine=!g.people.some(h=>!h.rescued&&!h.dead&&!h.hidden&&(()=>{const vx=target.x-p.x,vy=target.y-p.y,t=((h.x-p.x)*vx+(h.y-p.y)*vy)/(vx*vx+vy*vy);return t>0&&t<1.2&&Math.hypot(h.x-p.x-vx*t,h.y-p.y-vy*t)<22;})());
  if(attack&&!safeLine){const a=Math.atan2(target.y-p.y,target.x-p.x);dx=-Math.sin(a);dy=Math.cos(a);d=999;}
  const move=d>range,n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;
  const firing=attack&&!unsafeExit&&safeLine&&dist(target)<210;
  const heavy=!!target.weapon||!!target.deadline||target.kind==='convoy';
  return {left:move&&dx<-.32,right:move&&dx>.32,up:move&&dy<-.32,down:move&&dy>.32,fire:firing&&dist(target)<185,rocket:firing&&heavy&&target.hp>10,hellfire:firing&&heavy&&target.hp>=75,winch:!attack&&d<32,aimX:target.x,aimY:target.y};
}
module.exports=pilot;
