const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame,update,objective}=require('../src/simulation.js');
const C=require('../src/campaigns.js');
const pilot=require('./pilot.cjs');
const step=(g,input,seconds)=>{for(let i=0;i<seconds*60;i++)update(g,input,1/60);};
const hover=(g,o)=>{g.player.x=o.x;g.player.y=o.y;g.player.vx=g.player.vy=0;};
const destroy=(g,e)=>{e.hp=0;C.onDestroy(g,e);};
const capture=(g,h)=>{h.rescued=true;g.passengers.push(h);g.player.crew=g.passengers.length;C.onRescue(g,h);};
test('27 missions in the original four-campaign order',()=>{assert.deepEqual([0,1,2,3].map(i=>createGame(i).tasks.length),[5,6,8,8]);assert.equal(createGame(3).tasks[7].title,'Nuclear bomber');});
test('fuel conserved over water and consumed over land',()=>{const g=createGame();step(g,{},2);assert.equal(g.player.fuel,100);hover(g,{x:5000,y:1500});step(g,{},2);assert.ok(g.player.fuel<100);});
test('normalized diagonal flight and world bounds',()=>{const a=createGame(),b=createGame();step(a,{right:true},2);step(b,{right:true,up:true},2);assert.ok(Math.abs(Math.hypot(a.player.vx,a.player.vy)-Math.hypot(b.player.vx,b.player.vy))<.01);hover(a,{x:a.world.width-35,y:1800});step(a,{right:true},1);assert.equal(a.player.x,a.world.width-30);});
test('turn and thrust preserves heading',()=>{const g=createGame(0,'standard','momentum');step(g,{right:true},.5);const angle=g.player.angle;step(g,{up:true},1);assert.ok(g.player.x>380);assert.equal(g.player.angle,angle);});
test('replacement aircraft retains passengers and ammo',()=>{const g=createGame();capture(g,g.people[0]);g.player.armor=0;g.player.ammo=99;update(g);assert.equal(g.lives,2);assert.equal(g.player.armor,600);assert.equal(g.player.ammo,99);assert.equal(g.player.crew,1);});
test('empty weapons and terminal-state freeze',()=>{const g=createGame();g.player.ammo=g.player.rockets=g.player.hellfires=0;step(g,{fire:true,rocket:true,hellfire:true},1);assert.equal(g.bullets.length,0);g.status='lost';const t=g.time;step(g,{right:true},1);assert.equal(g.time,t);});
test('frigate resupply only in relaxed mode',()=>{for(const mode of ['standard','story']){const g=createGame(0,mode);g.player.ammo=0;step(g,{},1);assert.equal(g.player.ammo,mode==='story'?1178:0);}});
test('winch, cabin capacity, landing-zone delivery and repair',()=>{const g=createGame();g.enemies=[];g.people.forEach(h=>{h.x=1000;h.y=1000;});hover(g,{x:1000,y:1000});step(g,{},14);assert.equal(g.player.crew,6);assert.equal(g.delivered,0);g.player.armor=1;hover(g,g.zones[0]);step(g,{},1);assert.equal(g.delivered,6);assert.equal(g.player.crew,0);assert.equal(g.player.armor,600);});
test('quick winch and extra life must be exposed and are single-use',()=>{const g=createGame();g.enemies.filter(e=>e.weapon).forEach(e=>e.hp=0);for(const kind of ['winch','life']){const s=g.supplies.find(s=>s.kind===kind);hover(g,s);step(g,{},2);assert.equal(s.used,false);destroy(g,g.enemies.find(e=>e.cache===kind));hover(g,s);step(g,{},1.5);assert.equal(s.used,true);}assert.equal(g.quickWinch,true);assert.equal(g.lives,4);});
test('local radar alert extends range and increases damage and cadence',()=>{const g=createGame();const t=g.enemies.find(e=>e.weapon==='rapier');const r=g.enemies.find(e=>e.group==='radars');g.enemies=[t,r];t.alertGroup='radars';hover(g,{x:t.x+240,y:t.y});t.heading=0;t.cooldown=0;update(g);assert.equal(g.bullets[0].damage,150);assert.equal(t.cooldown,2.5*.65);r.hp=0;g.bullets=[];t.cooldown=0;update(g);assert.equal(g.bullets.length,0);hover(g,{x:t.x+150,y:t.y});update(g);assert.equal(g.bullets[0].damage,100);assert.equal(t.cooldown,2.5);});
test('power alert improves aim without extending range',()=>{const g=createGame();const t=g.enemies.find(e=>e.weapon==='rapier'),r=g.enemies.find(e=>e.kind==='power');g.enemies=[t,r];t.alertGroup='power';hover(g,{x:t.x+150,y:t.y});t.heading=Math.PI;t.cooldown=0;step(g,{},.5);assert.ok(g.bullets.some(b=>b.enemy));r.hp=0;g.bullets=[];t.heading=Math.PI;t.cooldown=0;step(g,{},.5);assert.equal(g.bullets.length,0);});
test('manual enemy armor, damage and firing intervals',()=>{const {weapons}=require('../src/reference');assert.deepEqual(Object.values(weapons).map(w=>[w.armor,w.damage,w.interval]),[[10,5,.5],[25,75,3],[50,20,.5],[75,100,2.5],[100,25,.33],[150,40,.33],[150,50,1.25],[150,100,1.5],[200,100,2.5],[250,150,2]]);});
test('four reference dimensions and campaign coastlines',()=>{const R=require('../src/reference');assert.deepEqual(R.maps.map(m=>[m.width,m.height]),[[6144,3072],[6144,3584],[6144,4096],[6144,4096]]);for(let i=0;i<4;i++){const g=createGame(i);assert.equal(R.water(g,g.base.x,g.base.y),true);assert.equal(R.water(g,6000,1500),false);}});
test('building collision blocks flight and damages armor',()=>{const g=createGame();const b=g.enemies.find(e=>e.kind==='radar');g.enemies=[b];hover(g,{x:b.x-31,y:b.y});step(g,{right:true},.2);assert.ok(g.player.x<b.x-29);assert.equal(g.player.armor,590);});
test('classic strafe preserves heading while moving sideways',()=>{const g=createGame(0,'standard','momentum'),angle=g.player.angle,x=g.player.x,y=g.player.y;step(g,{right:true,strafe:true},1);assert.equal(g.player.angle,angle);assert.ok(g.player.x>x+90);assert.equal(g.player.y,y);});
test('commander reveals agent; extraction requires reinforcements defeated',()=>{const g=createGame(),b=g.enemies.find(e=>e.group==='agent');assert.equal(b.hidden,true);destroy(g,g.enemies.find(e=>e.group==='commands'));capture(g,g.people.find(h=>h.role==='commander'));assert.equal(b.hidden,false);destroy(g,b);hover(g,g.agentZone);update(g);assert.equal(g.copilot,false);assert.equal(g.enemies.filter(e=>e.group==='agent-wave').length,3);g.enemies.filter(e=>e.group==='agent-wave').forEach(e=>destroy(g,e));update(g);assert.equal(g.people.filter(h=>h.role==='agent').length,1);});
test('SCUD intelligence and launch failure',()=>{const g=createGame(1);for(let i=0;i<2;i++){destroy(g,g.enemies.find(e=>e.group==='commands'&&e.release.intel===i));capture(g,g.people.find(h=>h.role==='scud commander'&&h.intel===i));}assert.equal(g.enemies.filter(e=>e.group==='scuds'&&!e.hidden).length,2);g.time=200;update(g);assert.equal(g.status,'lost');assert.match(g.message,/SCUD/);});
test('silo cover must break before launch countdown starts',()=>{const g=createGame(2),e=g.enemies.find(e=>e.group==='silos');assert.equal(e.deadline,undefined);e.hidden=false;e.hp=0;assert.equal(C.onHit(g,e,32),true);assert.equal(e.kind,'silo');assert.ok(e.deadline>g.time);g.time=e.deadline+1;update(g);assert.equal(g.status,'lost');});
test('yacht releases hostages gradually; six losses fail',()=>{const g=createGame(2);destroy(g,g.enemies.find(e=>e.kind==='yacht'));C.tick(g,0);assert.equal(g.people.filter(h=>h.role==='hostage').length,1);for(let i=0;i<12;i++){g.time+=5;C.tick(g,0);}assert.equal(g.people.filter(h=>h.role==='hostage').length,12);g.people.filter(h=>h.role==='hostage').slice(0,6).forEach(h=>C.killPerson(g,h));C.tick(g,0);assert.equal(g.status,'lost');});
test('bus waits for route clearance and follows escort to safety',()=>{const g=createGame(2);g.tasks.slice(0,7).forEach(t=>t.done=true);g.stage=7;hover(g,g.embassy);update(g);assert.equal(g.bus.active,true);assert.equal(g.copilot,false);const x=g.bus.x;hover(g,{x:g.bus.x+100,y:g.bus.y-100});step(g,{},1);assert.equal(g.bus.x,x);g.enemies.filter(e=>e.group==='bus-route').forEach(e=>e.hp=0);hover(g,g.bus);step(g,{},.1);assert.equal(g.bus.x,x);for(let i=0;i<2000&&!g.bus.arrived;i++){g.enemies.filter(e=>e.group==='bus-route').forEach(e=>e.hp=0);hover(g,{x:g.bus.x+110,y:g.bus.y-80});C.tick(g,.05);}assert.equal(g.bus.arrived,true);assert.equal(g.copilot,true);assert.equal(g.delivered,12);});
test('bus destruction fails',()=>{const g=createGame(2);g.bus.active=true;g.bus.hp=0;update(g);assert.equal(g.status,'lost');});
test('six commandos required for one-use LZ; later orders hidden',()=>{const g=createGame(3);assert.equal(g.enemies.find(e=>e.group==='shelters').hidden,true);capture(g,g.people.find(h=>h.role==='commando'));C.unload(g,g.oilZone);assert.equal(g.status,'lost');const h=createGame(3);h.people.filter(p=>p.role==='commando').forEach(p=>capture(h,p));C.unload(h,h.oilZone);assert.equal(h.flags.commandos,6);assert.equal(h.player.crew,0);});
test('civilian truck and essential personnel losses fail',()=>{const g=createGame(3);g.enemies.filter(e=>e.civilian).forEach(e=>destroy(g,e));assert.equal(g.status,'lost');const h=createGame(3);C.killPerson(h,h.people.find(p=>p.role==='commando'));assert.equal(h.status,'lost');});
test('palace vehicle, escorted boarding, bomber breach and copilot recovery',()=>{
  const g=createGame(3);g.enemies.filter(e=>e.weapon).forEach(e=>e.hp=0);
  destroy(g,g.enemies.find(e=>e.group==='palace'));hover(g,g.palaceZone);update(g);
  const vehicle=g.enemies.find(e=>e.kind==='atv'),b=g.enemies.find(e=>e.kind==='bomber');
  assert.equal(vehicle.hidden,false);assert.equal(vehicle.occupied,true);assert.equal(b.hidden,true);assert.equal(b.deadline,undefined);assert.equal(g.copilot,false);
  const start=vehicle.x;C.tick(g,1);assert.notEqual(vehicle.x,start);
  for(let n=0;n<1600&&!g.flags.bomberBoarded;n++){g.time+=.05;C.tick(g,.05);}
  assert.equal(vehicle.occupied,false);assert.equal(b.hidden,false);assert.ok(b.deadline);
  const captive=g.people.find(h=>h.role==='copilot');assert.equal(captive.hidden,true);
  destroy(g,vehicle);b.hp=900;C.onHit(g,b,100);assert.equal(captive.captive,false);assert.equal(captive.hidden,false);
  capture(g,captive);assert.equal(g.copilot,true);assert.equal(g.people.filter(p=>p.role==='copilot').length,1);
  const f=createGame(3),plane=f.enemies.find(e=>e.kind==='bomber');plane.hidden=false;plane.deadline=1;f.time=2;update(f);assert.equal(f.status,'lost');
});
test('shooting the occupied palace ATV fails the rescue',()=>{
  const g=createGame(3),e=g.enemies.find(e=>e.kind==='atv');destroy(g,e);assert.equal(g.status,'lost');assert.match(g.message,/still inside/);
});
for(const mode of ['standard','story'])for(let level=0;level<4;level++)test(`full playthrough: campaign ${level+1}, ${mode}`,()=>{
  const g=createGame(level,mode);
  for(let n=0;n<150000&&g.status==='playing';n++)update(g,pilot(g,objective),1/60);
  assert.equal(g.status,'won',JSON.stringify({status:g.status,stage:g.stage,time:g.time,message:g.message,armor:g.player.armor,fuel:g.player.fuel,ammo:g.player.ammo,rockets:g.player.rockets,hellfires:g.player.hellfires,crew:g.player.crew,target:objective(g),remaining:g.tasks.filter(t=>!t.done).map(t=>t.title)}));
  assert.ok(g.tasks.every(t=>t.done));
});

test('one command center and one commander satisfy the objective; three agent buildings',()=>{
  const g=createGame();assert.equal(g.enemies.filter(e=>e.group==='agent').length,3);
  destroy(g,g.enemies.find(e=>e.group==='commands'));capture(g,g.people.find(p=>p.role==='commander'));
  assert.equal(g.tasks[3].test(),true);assert.equal(g.enemies.filter(e=>e.group==='commands'&&e.hp>0).length,1);
  destroy(g,g.enemies.find(e=>e.group==='agent'&&!e.trapdoor));assert.equal(g.flags.trapdoorOpen,undefined);
});
test('collision damages both participants and interrupts steering',()=>{
  const g=createGame(0,'standard','momentum'),b=g.enemies.find(e=>e.kind==='radar');g.enemies=[b];const hp=b.hp;
  hover(g,b);update(g);assert.equal(b.hp,hp-10);assert.equal(g.player.armor,590);
  const angle=g.player.angle;step(g,{right:true,up:true},.2);assert.equal(g.player.angle,angle);assert.ok(g.stunned>0);
});
test('winch progress does not transfer to a different person',()=>{
  const g=createGame();g.enemies=[];g.people=g.people.slice(0,2);Object.assign(g.people[0],{x:4000,y:1000});Object.assign(g.people[1],{x:4100,y:1000});
  hover(g,g.people[0]);step(g,{},1.3);hover(g,g.people[1]);step(g,{},.5);assert.equal(g.player.crew,0);step(g,{},1.2);assert.equal(g.player.crew,1);
});
test('Valdez must reach the frigate before Jake becomes available',()=>{
  const g=createGame(),p=g.people.find(p=>p.role==='Valdez');assert.ok(p);capture(g,p);C.unload(g,g.zones[0]);assert.equal(g.jakeUnlocked,false);assert.equal(g.player.crew,1);
  C.unload(g,g.base);assert.equal(g.jakeUnlocked,true);assert.equal(g.player.crew,0);
  assert.equal(createGame(0,'standard','above',{copilotId:'jake'}).copilotId,'xman');
  const next=createGame(1,'standard','above',{copilotId:'jake',jakeUnlocked:true,score:12000});assert.equal(next.copilotId,'jake');assert.equal(next.score,12000);assert.ok(!next.people.some(p=>p.role==='Valdez'));
});
test('copilot selection changes rescue speed',()=>{
  for(const [id,expected]of [['xman',1],['mrd',0]]){const g=createGame(0,'standard','above',{copilotId:id});g.enemies=[];g.people=g.people.slice(0,1);hover(g,g.people[0]);step(g,{},2);assert.equal(g.player.crew,expected);}
});
test('classic copilot assists a forward shot but cannot lock behind the aircraft',()=>{
  const g=createGame(0,'standard','momentum',{copilotId:'tracker'}),e=g.enemies.find(e=>e.kind==='radar');g.enemies=[e];g.scenery=[];g.player.angle=0;
  Object.assign(e,{x:g.player.x+120,y:g.player.y+20});update(g,{fire:true});assert.ok(g.bullets[0].vy>0);
  e.x=g.player.x-120;g.bullets=[];update(g,{hellfire:true});assert.equal(g.bullets[0].homing,null);assert.ok(g.bullets[0].vx>0);
});
test('map hides concealed supplies and future nuclear-storm orders',()=>{
  const g=createGame(),s=g.supplies.find(s=>s.kind==='fuel'&&s.hidden);assert.ok(!C.mapObjects(g,'fuel').includes(s));
  destroy(g,g.enemies.find(e=>e.supplyId===s.id));assert.ok(C.mapObjects(g,'fuel').includes(s));
  const n=createGame(3);assert.equal(C.mapObjects(n,'mission:1').length,0);assert.ok(n.enemies.filter(e=>e.group==='pipes').every(e=>e.hidden));
});
test('swept shots hit small supplies between frames and respect nearer personnel',()=>{
  const g=createGame();g.enemies=[];g.scenery=[];g.people=[];g.supplies=[{x:3000,y:1000,kind:'fuel',used:false}];
  g.bullets=[{x:2980,y:1000,vx:1000,vy:0,life:1,damage:100,enemy:false}];update(g,{},.05);assert.equal(g.supplies[0].destroyed,true);
  const h={x:2980,y:1100,role:'MIA',rescued:false,dead:false};g.people=[h];const e={x:3010,y:1100,hp:100,kind:'radar',id:0};g.enemies=[e];
  g.bullets=[{x:2960,y:1100,vx:1000,vy:0,life:1,damage:100,enemy:false}];update(g,{},.05);assert.equal(h.dead,true);assert.equal(e.hp,100);
});
test('fuel warns at fourteen and each two-unit loss; armor warns at 125',()=>{
  const g=createGame();g.player.fuel=14;update(g);assert.match(g.message,/Low fuel/);g.message='quiet';g.player.fuel=13;update(g);assert.equal(g.message,'quiet');g.player.fuel=12;update(g);assert.match(g.message,/Low fuel/);
  g.player.armor=125;update(g);assert.match(g.message,/Armor critical/);
});
test('embassy boarding holds the bus and creates two air attacks plus a route ambush',()=>{
  const g=createGame(2);g.stage=7;g.tasks.slice(0,7).forEach(t=>t.done=true);hover(g,g.embassy);C.tick(g,.05);const start=g.bus.x;
  assert.equal(g.bus.active,true);assert.equal(g.bus.boarded,0);assert.equal(g.enemies.filter(e=>e.group==='bus-route'&&e.weapon==='chopper').length,1);
  for(let i=0;i<361;i++)C.tick(g,.05);assert.equal(g.bus.boarded,12);assert.equal(g.bus.x,start);assert.equal(g.enemies.filter(e=>e.group==='bus-route'&&e.weapon==='chopper').length,2);
  g.bus.waypoint=2;C.tick(g,.05);assert.equal(g.flags.busAmbush,true);
});
test('AAA does not inherit radar damage or range bonuses',()=>{
  const g=createGame(),e=g.enemies.find(e=>e.weapon==='aaa'),r=g.enemies.find(e=>e.kind==='radar');g.enemies=[e,r];e.alertGroup='radars';e.heading=0;e.cooldown=0;
  hover(g,{x:e.x+200,y:e.y});update(g);assert.equal(g.bullets.length,0);hover(g,{x:e.x+120,y:e.y});update(g);assert.equal(g.bullets[0].damage,20);assert.equal(e.cooldown,.5);
});
test('breached yacht still collides and does not release a second hostage stream',()=>{
  const g=createGame(2),y=g.enemies.find(e=>e.kind==='yacht');destroy(g,y);hover(g,y);update(g);assert.equal(g.player.armor,590);assert.equal(g.flags.hostages,1);assert.equal(g.flags.yachtOpen,true);
});

test('civilian destruction penalizes score; scenery and cache covers award no target points',()=>{
  const g=createGame(3,'standard','above',{score:2000});
  C.scoreObject(g,g.enemies.find(e=>e.civilian&&e.kind==='truck'));assert.equal(g.score,1500);
  C.scoreObject(g,g.scenery[0]);C.scoreObject(g,g.enemies.find(e=>e.cache));assert.equal(g.score,1500);
  C.scoreObject(g,g.enemies.find(e=>e.weapon));assert.equal(g.score,1850);
  C.score(g,'penalties',-9999);assert.equal(g.score,0);assert.equal(g.startScore+Object.values(g.scoreLog).reduce((a,b)=>a+b,0),0);
});
test('rescues beyond the required POW quota earn one bonus each on delivery',()=>{
  const g=createGame(1);g.enemies.filter(e=>e.group==='pow').forEach(e=>destroy(g,e));
  const pow=g.people.filter(p=>p.role==='POW');pow.slice(0,14).forEach(p=>p.delivered=true);
  pow.slice(14).forEach(p=>capture(g,p));C.unload(g,g.base);assert.equal(g.scoreLog.bonus,500);const score=g.score;C.unload(g,g.base);assert.equal(g.score,score);
});
test('render rate does not change flight, fuel or weapon cadence',()=>{
  const {advance}=require('../src/simulation');const runs=[30,60,144].map(fps=>{
    const g=createGame();g.enemies=[];g.scenery=[];g.people=[];g.supplies=[];
    for(let i=0;i<fps*10;i++)advance(g,{right:true,up:true,fire:true,rocket:true},1/fps);
    return [g.time,g.player.x,g.player.y,g.player.fuel,g.player.ammo,g.player.rockets];
  });for(const run of runs.slice(1))run.forEach((v,i)=>assert.ok(Math.abs(v-runs[0][i])<1e-7));
});
test('nuclear complex has two radar controllers and five Crotales; three hidden lives',()=>{
  const g=createGame(3);assert.equal(g.enemies.filter(e=>e.group==='nuclear-radar').length,2);assert.equal(g.enemies.filter(e=>e.weapon==='crotale'&&e.alertGroup==='nuclear-radar').length,5);assert.equal(g.supplies.filter(s=>s.kind==='life'&&s.hidden).length,3);
});

test('original sprite headings face north, east, south and west without selecting wrecks',()=>{
  const vm=require('node:vm'),fs=require('node:fs');
  const scope={Image:class{naturalWidth=1184;decode(){return Promise.resolve();}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/original-art.js'),'utf8'),scope);
  let draws=[],scales=[];
  const ctx={save(){},restore(){},translate(){},scale(x,y){scales.push([x,y]);},drawImage(...args){draws.push(args.slice(1,5));}};
  const angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
  angles.forEach((angle,i)=>{
    draws=[];scales=[];scope.DesertArt.apache(ctx,0,0,angle,0);
    assert.equal(draws[0][0],[17,545,1073,545][i]);assert.equal(draws[0][1],17);assert.equal(scales[0][0],i===3?-.9:.9);
    const g=createGame(0,'standard','momentum');g.enemies=[];g.scenery=[];g.player.angle=angle;update(g,{fire:true});
    const b=g.bullets.find(b=>!b.enemy);assert.ok(b.vx*Math.cos(angle)+b.vy*Math.sin(angle)>479);
  });
  for(const kind of ['bus','atv']){draws=[];scales=[];scope.DesertArt.object(ctx,{kind,x:0,y:0,heading:Math.PI},0);assert.equal(scales[0][0],-1);}
  draws=[];scope.DesertArt.object(ctx,{weapon:'m48',x:0,y:0,heading:Math.PI/2},0);assert.equal(draws[0][0],16,'southbound tank must not select the wreck at x208');
  draws=[];scope.DesertArt.object(ctx,{weapon:'chopper',x:0,y:0,heading:0},0);assert.equal(draws[0][0],256,'east-facing chopper is the fourth frame');
  draws=[];scope.DesertArt.object(ctx,{weapon:'crotale',x:0,y:0,heading:0},0);assert.equal(draws[0][1],768,'Crotale uses its missile vehicle row');
});

test('escort bus faces its next waypoint while moving',()=>{
  const g=createGame(2),b=g.bus;g.stage=7;g.tasks.slice(0,7).forEach(t=>t.done=true);g.enemies=[];
  b.active=true;b.boarded=12;b.waypoint=0;b.path=[{x:b.x-100,y:b.y}];hover(g,{x:b.x+100,y:b.y});
  const x=b.x;C.tick(g,1/60);assert.equal(b.heading,Math.PI);assert.ok(b.x<x);
});
