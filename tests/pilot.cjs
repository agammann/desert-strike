// Reads state and emits normal player inputs; never mutates game state.
function pilot(g, objective) {
  const p=g.player, dist=o=>Math.hypot(o.x-p.x,o.y-p.y);
  let target=objective(g);
  const urgent=g.enemies.filter(e=>e.hp>0&&!e.hidden&&e.deadline).sort((a,b)=>a.deadline-b.deadline)[0];
  const copilot=g.people.find(h=>h.role==='copilot'&&!h.rescued&&!h.dead);
  if(copilot)target=copilot;else if(urgent)target=urgent;
  let resource;
  if(p.fuel<22)resource='fuel';else if(p.armor<220)resource='repair';else if(p.hellfires<1&&p.rockets<5)resource='ammo';
  if(resource){const crates=g.supplies.filter(s=>s.kind===resource&&!s.used).sort((a,b)=>dist(a)-dist(b));if(crates[0])target=crates[0];}
  const threat=g.enemies.filter(e=>e.kind==='tank'&&e.hp>0&&!e.hidden&&dist(e)<340).sort((a,b)=>dist(a)-dist(b))[0];
  if(threat&&!copilot&&!resource)target=threat;
  const attack=typeof target.hp==='number'&&target!==g.bus&&!target.civilian;
  let tx=target.x,ty=target.y;if(target===g.bus){tx+=110;ty-=80;}
  let dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),range=attack?240:10;
  if(attack&&target.kind==='tank'&&d<310){const a=Math.atan2(dy,dx);dx=(d>220?Math.cos(a)*.6:0)-Math.sin(a);dy=(d>220?Math.sin(a)*.6:0)+Math.cos(a);d=999;}
  const move=d>range, firing=attack&&dist(target)<470;
  return {left:move&&dx<-1,right:move&&dx>1,up:move&&dy<-1,down:move&&dy>1,fire:firing,rocket:firing&&target.hp>10,hellfire:firing&&target.hp>=100,winch:!attack&&d<65,aimX:target.x,aimY:target.y};
}
module.exports=pilot;
