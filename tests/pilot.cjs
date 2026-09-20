// Reads state and emits normal player inputs; never mutates game state.
function pilot(g, objective) {
  const p=g.player, dist=o=>Math.hypot(o.x-p.x,o.y-p.y);
  let target=objective(g);
  const urgent=g.enemies.filter(e=>e.hp>0&&!e.hidden&&e.deadline).sort((a,b)=>a.deadline-b.deadline)[0];
  const copilot=g.people.find(h=>h.role==='copilot'&&!h.rescued&&!h.dead);
  if(copilot)target=copilot;else if(urgent)target=urgent;
  let resource;
  if(p.fuel<28)resource='fuel';else if(p.armor<240)resource='repair';else if(p.ammo<180||(p.hellfires<1&&p.rockets<5))resource='ammo';
  if(resource){const crates=g.supplies.filter(s=>s.kind===resource&&!s.used&&!s.hidden).sort((a,b)=>dist(a)-dist(b));if(crates[0])target=crates[0];}
  const threat=g.enemies.filter(e=>e.weapon&&e.hp>0&&!e.hidden&&dist(e)<260).sort((a,b)=>dist(a)-dist(b))[0];
  if(threat&&!copilot&&!resource)target=threat;
  const attack=typeof target.hp==='number'&&target!==g.bus&&!target.civilian;
  let tx=target.x,ty=target.y;if(target===g.bus){tx+=110;ty-=80;}
  let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),range=attack?166:18;
  if(attack&&target.weapon&&d<225){const a=Math.atan2(dy,dx),radial=(d-177)/35;dx=Math.cos(a)*radial-Math.sin(a);dy=Math.sin(a)*radial+Math.cos(a);d=999;}
  // Steer around collidable scenery rather than crossing through buildings.
  const obstacle=[...g.enemies.filter(e=>e.hp>0&&!e.hidden&&e.collisionRadius),...g.scenery].find(e=>dist(e)<(attack?65:40)&&e!==target);
  if(obstacle){const a=Math.atan2(obstacle.y-p.y,obstacle.x-p.x);dx-=Math.cos(a)*70;dy-=Math.sin(a)*70;dx+=Math.sin(a)*35;dy-=Math.cos(a)*35;}
  const move=d>range,n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;
  const firing=attack&&dist(target)<210;
  const heavy=!!target.weapon||!!target.deadline;
  return {left:move&&dx<-.32,right:move&&dx>.32,up:move&&dy<-.32,down:move&&dy>.32,fire:firing&&dist(target)<185,rocket:firing&&heavy&&target.hp>10,hellfire:firing&&heavy&&target.hp>=75,winch:!attack&&d<32,aimX:target.x,aimY:target.y};
}
module.exports=pilot;
