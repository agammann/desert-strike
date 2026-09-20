const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame, update, distance } = require('../src/simulation.js');
const step = (g, input, seconds) => { for (let i = 0; i < seconds * 60; i++) update(g, input, 1 / 60); };
test('movement, world bounds and fuel use', () => { const g = createGame(); step(g, { right: true }, 2); assert.ok(g.player.x > g.base.x + 390); assert.ok(g.player.fuel < 100); step(g, { right: true }, 30); assert.ok(g.player.x <= 2330); });
test('diagonal flight has the same maximum speed', () => { const a=createGame(),b=createGame();step(a,{right:true},2);step(b,{right:true,up:true},2);assert.ok(Math.abs(Math.hypot(a.player.vx,a.player.vy)-Math.hypot(b.player.vx,b.player.vy))<.01); });
test('crew capacity, delivery and automatic resupply', () => { const g=createGame(2,'story');g.enemies=[];g.player.x=1000;g.player.y=1000;g.people.forEach(p=>{p.x=1000;p.y=1000;});step(g,{winch:true},9);assert.equal(g.player.crew,6);assert.equal(g.delivered,0);g.player.x=g.base.x;g.player.y=g.base.y;g.player.ammo=0;g.player.rockets=0;g.player.armor=50;step(g,{},2);assert.equal(g.player.crew,0);assert.equal(g.delivered,6);assert.equal(g.player.ammo,1178);assert.equal(g.player.rockets,38);assert.ok(g.player.armor>75); });
test('a crew member requires a sustained nearby winch',()=>{const g=createGame();g.player.x=g.people[0].x;g.player.y=g.people[0].y;step(g,{winch:true},.5);assert.equal(g.player.crew,0);g.player.vx=200;step(g,{right:true},.1);assert.equal(g.winch,0);g.player.vx=0;g.player.x=g.people[0].x;g.player.y=g.people[0].y;step(g,{winch:true},1.2);assert.equal(g.player.crew,1);});
test('rockets damage targets and consume ammunition',()=>{const g=createGame();const e=g.enemies[0];g.player.x=e.x-180;g.player.y=e.y;step(g,{rocket:true,aimX:e.x,aimY:e.y},2);assert.ok(e.hp<=0);assert.ok(g.player.rockets<38);});
test('empty weapons cannot fire',()=>{const g=createGame();g.player.x=900;g.player.ammo=0;g.player.rockets=0;step(g,{fire:true,rocket:true},.5);assert.equal(g.bullets.filter(b=>!b.enemy).length,0);});
test('fuel and armor failures are terminal',()=>{for(const key of ['fuel','armor']){const g=createGame();g.player.x=1000;g.lives=1;g.player[key]=0;step(g,{},1);assert.equal(g.status,'lost');const t=g.time;step(g,{right:true},1);assert.equal(g.time,t);}});
test('survivors aboard do not count as delivered',()=>{const g=createGame();g.enemies.forEach(e=>e.hp=0);g.people.forEach(p=>p.rescued=true);g.player.crew=g.people.length;g.player.x=1100;step(g,{},1);assert.equal(g.status,'playing');g.player.x=g.base.x;g.player.y=g.base.y;step(g,{},1);assert.equal(g.status,'won');});
test('supply crates are collected once and replenish their resource',()=>{const g=createGame();const s=g.supplies[0];g.player.x=s.x;g.player.y=s.y;g.player.fuel=10;step(g,{winch:true},1);assert.equal(s.used,true);assert.ok(g.player.fuel>99);});
// Autopilot drives the public simulation with normal controls; no stat boosts or teleports.
for (const difficulty of ['standard','story']) for(let level=0;level<4;level++) test(`complete operation ${level+1} in ${difficulty}`,()=>{
  const g=createGame(level,difficulty);
  for(let n=0;n<60000&&g.status==='playing';n++){
    const p=g.player;let target;
    const enemy=g.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(p,a)-distance(p,b))[0];
    if(p.crew===6) target=g.base;
    else if(p.fuel<25)target=g.supplies.find(s=>s.kind==='fuel'&&!s.used)||g.base;
    else if(enemy)target=enemy;
    else target=g.people.filter(h=>!h.rescued).sort((a,b)=>distance(p,a)-distance(p,b))[0]||g.base;
    const range=target===enemy?270:12, dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);
    const move=d>range;
    update(g,{left:move&&dx<-8,right:move&&dx>8,up:move&&dy<-8,down:move&&dy>8,fire:!!enemy,rocket:!!enemy,winch:!enemy&&target!==g.base&&d<65},1/60);
  }
  assert.equal(g.status,'won',JSON.stringify({status:g.status,time:g.time,armor:g.player.armor,fuel:g.player.fuel,delivered:g.delivered}));
  assert.equal(g.delivered,g.people.length);
});

test('classic turn and thrust controls preserve heading',()=>{const g=createGame(0,'standard','momentum');step(g,{right:true},.5);const angle=g.player.angle;assert.ok(angle>-.3);step(g,{up:true},1);assert.ok(g.player.x>g.base.x+180);assert.equal(g.player.angle,angle);});
test('Hellfires track a target and consume one missile',()=>{const g=createGame();const e=g.enemies[0];g.player.x=e.x-220;g.player.y=e.y;update(g,{hellfire:true},1/60);step(g,{},.5);assert.equal(g.player.hellfires,7);assert.ok(e.hp<=0);});
test('a lost life preserves passengers and ammo and restores armor',()=>{const g=createGame();g.player.x=900;g.player.armor=0;g.player.crew=2;g.player.ammo=99;update(g,{},1/60);assert.equal(g.lives,2);assert.equal(g.status,'playing');assert.equal(g.player.crew,2);assert.equal(g.player.ammo,99);assert.equal(g.player.armor,600);});
test('standard mode has finite supplies and no free base ammunition',()=>{const g=createGame();g.player.ammo=0;g.player.rockets=0;g.player.fuel=50;step(g,{},2);assert.equal(g.player.ammo,0);assert.equal(g.player.rockets,0);assert.ok(g.player.fuel<50);});
test('hovering automatically winches without a key',()=>{const g=createGame();g.player.x=g.people[0].x;g.player.y=g.people[0].y;step(g,{},1.2);assert.equal(g.player.crew,1);});


