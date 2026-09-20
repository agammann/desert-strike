(function (root) {
  'use strict';
  const missions = [
    { name: 'Air Superiority', text: 'Disable radar and power, clear two airfields, capture a commander, and extract the secret agent.' },
    { name: 'Scud Buster', text: 'Free political prisoners, stop chemical production, capture SCUD commanders, and recover the POWs.' },
    { name: 'Embassy City', text: 'Rescue the inspectors, stop biological missiles, recover the yacht hostages, and escort the embassy bus.' },
    { name: 'Nuclear Storm', text: 'Protect the oil fields and stop the spills. Further orders arrive as the operation unfolds.' },
  ];
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const alive = e => e.hp > 0 && !e.hidden;
  const waiting = p => !p.rescued && !p.dead && !p.hidden && !p.captive;
  // Scoring rules follow the manual; point amounts remain reconstruction values.
  function score(g, category, amount) {
    const applied=Math.max(-g.score,amount);g.score+=applied;
    g.scoreLog[category]=(g.scoreLog[category]||0)+applied;
  }
  function scoreObject(g,e){
    if(e.civilian)score(g,'penalties',-500);
    else if(e.group&&!e.cache)score(g,'targets',350);
  }
  function tell(g, text) { g.message = text; g.messageTime = 7; }
  function fail(g, text) { if(g.status==='playing'){g.status = 'lost'; tell(g, text);} }
  function enemy(g, x, y, kind, group, extra = {}) {
    const hp = { tank: 150, radar: 120, jet: 40, pipe: 24, gate: 80, bomber: 1800, dune: 32 }[kind] || 200;
    const e = { x, y, kind, group, id: g.enemies.length, hp, maxHp: hp, cooldown: 2, ...extra };
    g.enemies.push(e); return e;
  }
  function people(g, x, y, role, count, extra = {}) {
    for (let i = 0; i < count; i++) g.people.push({ x: x + (i % 3 - 1) * 22, y: y + Math.floor(i / 3) * 24, role, id: g.people.length, rescued: false, dead: false, delivered: false, ...extra });
  }
  const destroyed = (g, group) => g.enemies.filter(e => e.group === group && e.hp <= 0 && !e.escaped).length;
  const total = (g, group) => g.enemies.filter(e => e.group === group).length;
  const delivered = (g, role) => g.people.filter(p => p.role === role && p.delivered).length;
  const captured = (g, role) => g.people.filter(p => p.role === role && p.rescued).length;
  function task(g, title, hint, test, targets) { g.tasks.push({ title, hint, test, targets, done: false }); }
  function demolition(g, title, hint, group, needed) { task(g, title, hint, () => destroyed(g, group) >= (needed || total(g, group)), () => g.enemies.filter(e => e.group === group && alive(e))); }
  function evacuation(g, title, hint, role, needed, group) {
    task(g, title, hint, () => delivered(g, role) >= needed, () => [...g.people.filter(p => p.role === role && waiting(p)), ...g.enemies.filter(e => e.group === group && alive(e))]);
  }
  function supply(g, x, y, kind) { g.supplies.push({ id:g.supplies.length, x, y, kind, used: false }); }
  function reinforce(g,x,y,type,group){
    const e=enemy(g,x,y,'tank',group);
    const ref=typeof module!=='undefined'&&module.exports?require('./reference.js'):root.DesertReference;
    ref.configureEnemy(e,type);return e;
  }
  function initialize(g) {
    g.tasks = []; g.stage = 0; g.flags = {}; g.copilot = true; g.passengers = []; g.zones = [];
    g.enemies = []; g.people = []; g.supplies = []; g.deadlines = [];
    g.zones.push({ x: 850, y: 1940, kind: 'lz', label: 'RESCUE LZ' }, { x: 780, y: 680, kind: 'lz', label: 'RESCUE LZ' });
    // Seed mission entities here; reference.js applies the campaign map positions and supplies.
    for (const [x,y] of [[740,1740],[1110,1250],[1840,1990],[830,450],[2050,730],[1520,450],[1660,1530]]) {
      supply(g,x,y,'fuel'); supply(g,x+80,y,'ammo'); supply(g,x+40,y+70,'repair');
    }
    supply(g,840,1630,'winch'); supply(g,2140,2130,'life');
    people(g,920,1810,'MIA',4); people(g,820,920,'MIA',4);
    const guard = (x,y,group='defense') => enemy(g,x,y,'tank',group);
    const site = (x,y,kind,group,extra) => enemy(g,x,y,kind,group,extra);
    const release = (role,count=1,extra={}) => ({ release: { role, count, ...extra } });
    if (g.level === 0) {
      site(1110,1540,'radar','radars'); site(1710,750,'radar','radars');
      site(1350,1120,'power','power');
      for (const [x,y] of [[1810,460],[1950,1290]]) {
        site(x,y,'airfield','airfields'); site(x+160,y,'tower','airfields');
        site(x,y+160,'jet','airfields'); site(x+160,y+160,'jet','airfields'); guard(x-150,y+120);
      }
      site(1490,1850,'command','commands',release('commander'));
      site(2030,1830,'command','commands',release('commander'));
      site(1180,490,'bunker','agent', { hidden: true, trapdoor:true });
      site(1330,490,'bunker','agent', { hidden: true });
      site(1180,610,'bunker','agent', { hidden: true });
      g.agentZone = { x:1180,y:600,kind:'agent',label:'LAND: AGENT' };
      demolition(g,'Radar sites','Destroy both radar sites to reduce enemy firing range.','radars');
      demolition(g,'Power station','Cut power to slow the enemy weapons.','power');
      demolition(g,'Airfields','Destroy the hangars, towers and aircraft at both airfields.','airfields');
      task(g,'Command centers','Destroy one center and capture its commander to locate the agent. The other center is optional.',()=>destroyed(g,'commands')>=1 && captured(g,'commander')>0,()=>[...g.enemies.filter(e=>e.group==='commands'&&alive(e)),...g.people.filter(p=>p.role==='commander'&&waiting(p))]);
      task(g,'Secret agent','Find the trapdoor under one of three buildings. Land, defeat the reinforcements, and deliver the agent and copilot.',()=>delivered(g,'agent')===1 && g.copilot,()=>[...g.enemies.filter(e=>(e.group==='agent'&&!g.flags.trapdoorOpen||e.group==='agent-wave')&&alive(e)),...g.people.filter(p=>['agent','copilot'].includes(p.role)&&waiting(p)),...(!g.flags.agentEntered&&g.flags.trapdoorOpen?[g.agentZone]:[])]);
      guard(1000,1420); guard(1600,920); guard(1240,980);
    } else if (g.level === 1) {
      [[1000,1500],[1640,560],[2080,1600]].forEach(([x,y])=>site(x,y,'radar','radars'));
      [[930,1100],[1330,790],[1790,1090]].forEach(([x,y])=>{site(x,y,'prison','jails',release('prisoner',4));guard(x+130,y+110);});
      site(1150,490,'power','power');
      [[1890,450],[2100,450],[1890,660]].forEach(([x,y])=>site(x,y,'chemical','chemical'));
      [[1090,1810],[1450,1510],[2050,1920],[1050,800],[1660,850],[2060,1100]].forEach(([x,y],i)=>{
        site(x,y,'command','commands',release('scud commander',1,{intel:i}));
        site(x+140,y-170,'scud','scuds',{hidden:true,intel:i});
      });
      [[1520,2000],[1740,2000],[1520,2210],[1740,2210]].forEach(([x,y])=>site(x,y,'prison','pow',release('POW',4)));
      demolition(g,'Radar sites','Disable the three radar installations.','radars');
      evacuation(g,'Jail break','Open all three prison walls and deliver at least 10 political prisoners.','prisoner',10,'jails');
      demolition(g,'Power station','Destroy the power station.','power');
      demolition(g,'Chemical weapons','Destroy the chemical production complex.','chemical');
      task(g,'SCUD launchers','Capture each commander; follow the new marker and destroy at least 5 of 6 launchers before launch.',()=>destroyed(g,'scuds')>=5,()=>[...g.enemies.filter(e=>e.group==='scuds'&&alive(e)),...g.people.filter(p=>p.role==='scud commander'&&waiting(p)),...g.enemies.filter(e=>e.group==='commands'&&alive(e))]);
      evacuation(g,'POW camp','Free the four huts. Deliver at least 14 of the 16 POWs.','POW',14,'pow');
    } else if (g.level === 2) {
      people(g,930,1710,'inspector',6); guard(1110,1650,'inspectors-defense');
      for(let i=0;i<8;i++)site(1180+(i%4)*240,380+Math.floor(i/4)*210,'chemical','bio',release(i===5?'lead chemist':'chemist'));
      [[840,1020],[1110,880],[1480,1210],[1930,940]].forEach(([x,y])=>site(x,y,'dune','silos',{hidden:true,covered:true}));
      people(g,350,1230,'pilot',1); people(g,280,700,'pilot',1); people(g,430,420,'pilot',1);
      guard(480,1020); guard(480,570);
      site(1650,1510,'power','power');
      site(310,1530,'yacht','yacht');
      [[1930,1650],[2160,1650],[1930,1870],[2160,1870]].forEach(([x,y],i)=>site(x,y,'command','ambassador',i===2?release('ambassador'):{}));
      site(1870,1420,'radar','optional-radar');
      g.embassy={x:1300,y:2080,kind:'embassy',label:'LAND: EMBASSY'};
      g.bus={x:1430,y:2080,hp:600,maxHp:600,active:false,arrived:false,boarded:0,boarding:0,waypoint:0,path:[{x:1640,y:2080},{x:1860,y:2150},{x:2130,y:2150},{x:2260,y:2000}]};
      site(1560,2080,'gate','bus-route'); guard(1770,2210,'bus-route');guard(2070,2010,'bus-route');
      evacuation(g,'UN inspectors','Rescue the inspectors from the parking lot; deliver at least 5 of 6.','inspector',5);
      task(g,'Biological weapons','Destroy at least 6 of 8 plants and capture the lead chemist.',()=>destroyed(g,'bio')>=6&&captured(g,'lead chemist')>0,()=>[...g.people.filter(p=>p.role==='lead chemist'&&waiting(p)),...g.enemies.filter(e=>e.group==='bio'&&alive(e))]);
      demolition(g,'Missile silos','The chemist reveals four buried silos. Shoot away each dune, then stop the missile.','silos');
      evacuation(g,'Lost at sea','Recover at least two pilots. Their intelligence identifies the power station.','pilot',2);
      demolition(g,'Power station','Shut down the power protecting the yacht and embassy.','power');
      evacuation(g,"Madman’s yacht",'Breach the yacht and winch hostages before they drown. Deliver at least 7; lose no more than 5.','hostage',7,'yacht');
      task(g,'Enemy ambassador','Destroy all four command buildings and capture the ambassador.',()=>destroyed(g,'ambassador')===4&&captured(g,'ambassador')===1,()=>[...g.people.filter(p=>p.role==='ambassador'&&waiting(p)),...g.enemies.filter(e=>e.group==='ambassador'&&alive(e))]);
      task(g,'Embassy rescue','Land at the embassy. Protect all twelve officials while they board, clear the gate, and escort the bus through the ambush.',()=>g.bus.arrived,()=>g.bus.active?[...g.enemies.filter(e=>e.group==='bus-route'&&alive(e)),g.bus]:[g.embassy]);
    } else {
      people(g,930,1580,'commando',6);
      g.oilZone={x:1490,y:1680,kind:'oil',label:'COMMANDO LZ'};
      g.oilTanks=[{x:1400,y:1530,hp:600},{x:1630,y:1530,hp:600},{x:1400,y:1870,hp:600}];
      guard(1240,1420,'oil-enemies');guard(1800,1500,'oil-enemies');guard(1650,1920,'oil-enemies');
      [[640,800],[640,1130],[640,1430]].forEach(([x,y])=>site(x,y,'pipe','pipes',{hidden:true}));
      [[1100,660],[1550,680],[1940,750],[2050,2090]].forEach(([x,y])=>site(x,y,'bunker','shelters',{hidden:true,...release('civilian',4)}));
      [[1160,1030],[1450,1050],[1780,1050],[2050,1060],[1280,1250],[1890,1240],[2120,1260]].forEach(([x,y],i)=>site(x,y,'truck',i<5?'bomb-trucks':'decoys',{hidden:true,civilian:i>=5,homeX:x,homeY:y}));
      [[1770,390],[2020,390],[2020,580]].forEach(([x,y],i)=>site(x,y,'plant','nuclear',{hidden:true,...(i===0?release('scientist'):{})}));
      site(1610,780,'power','power',{hidden:true});
      site(1830,1710,'palace','palace',{hidden:true});
      g.palaceZone={x:1830,y:1830,kind:'palace',label:'LAND: PALACE'};
      site(1200,400,'bomber','bomber',{hidden:true});
      site(1830,1710,'atv','escape-vehicle',{hidden:true,hp:300,maxHp:300,civilian:true,occupied:true});
      task(g,'Oil fields','Collect all six commandos for the one-use landing zone. Destroy the tanks attacking the oil storage.',()=>g.flags.commandos===6&&destroyed(g,'oil-enemies')===3,()=>[...g.enemies.filter(e=>e.group==='oil-enemies'&&alive(e)),...g.people.filter(p=>p.role==='commando'&&waiting(p)),...(g.passengers.some(p=>p.role==='commando')?[g.oilZone]:[])]);
      demolition(g,'Oil spills','Hit the small pipe ends to seal all three spills.','pipes');
      evacuation(g,'Bomb shelters','Open four shelters and deliver at least 15 of the 16 civilians.','civilian',15,'shelters');
      demolition(g,'Bomb parts','Inspect the trucks: red bomb cargo is a target; green civilian cargo must survive.','bomb-trucks');
      task(g,'Nuclear plant','Destroy the weapons plant and cooling towers; capture the scientist.',()=>destroyed(g,'nuclear')===3&&captured(g,'scientist')===1,()=>[...g.people.filter(p=>p.role==='scientist'&&waiting(p)),...g.enemies.filter(e=>e.group==='nuclear'&&alive(e))]);
      demolition(g,'Power station','Cut power to the presidential palace.','power');
      task(g,'Presidential palace','Breach the palace and land at the marked entrance to send in your copilot.',()=>!!g.flags.palaceEntered,()=>destroyed(g,'palace')?[g.palaceZone]:g.enemies.filter(e=>e.group==='palace'&&alive(e)));
      task(g,'Nuclear bomber','Follow the escape vehicle; hold fire while your copilot is aboard. Destroy the empty ATV at the airstrip, breach the bomber, rescue your copilot, then finish the aircraft.',()=>destroyed(g,'escape-vehicle')===1&&destroyed(g,'bomber')===1&&g.copilot,()=>[...g.people.filter(p=>p.role==='copilot'&&waiting(p)),...g.enemies.filter(e=>['escape-vehicle','bomber'].includes(e.group)&&alive(e))]);
    }
    tell(g, g.tasks[0].hint);
  }
  function reveal(g, group) { g.enemies.filter(e=>e.group===group||e.revealWith===group).forEach(e=>e.hidden=false); }
  function onRescue(g, p) {
    if(p.role==='commander')reveal(g,'agent');
    if(p.role==='scud commander') {
      const e=g.enemies.find(e=>e.group==='scuds'&&e.intel===p.intel);e.hidden=false;e.deadline=g.time+(g.difficulty==='story'?160:100);
      tell(g,'SCUD located. Destroy the flashing launcher before its countdown expires.');
    }
    if(p.role==='lead chemist')reveal(g,'silos');
    if(p.role==='pilot')reveal(g,'power');
    if(p.role==='copilot')g.copilot=true;
  }
  function onDestroy(g, e) {
    if(e.kind==='atv'&&e.occupied){fail(g,'Your copilot was still inside the escape vehicle. Hold fire until he disembarks.');return;}
    if(e.release)people(g,e.x,e.y+65,e.release.role,e.release.count,e.release);
    if(e.cache){const s=g.supplies.find(s=>s.id===e.supplyId);if(s)s.hidden=false;}
    if(e.trapdoor){g.flags.trapdoorOpen=true;tell(g,'Trapdoor exposed. Land at the marked entrance.');}
    if(e.kind==='power')supply(g,e.x,e.y,'repair');
    if(e.kind==='yacht'){g.flags.yachtOpen=true;g.flags.nextHostage=g.time;g.flags.hostages=0;}
    if(e.civilian && destroyed(g,'decoys')>1)fail(g,'Two civilian trucks destroyed. The operation has failed.');
  }
  function onHit(g,e,damage) {
    if(e.covered && e.hp<=0) {e.covered=false;e.kind='silo';e.hp=180;e.maxHp=180;e.deadline=g.time+(g.difficulty==='story'?55:30);tell(g,'Silo exposed. Stop the launch!');return true;}
    if(e.kind==='bomber'&&e.hp<=1000&&!g.flags.copilotEscaped) {
      g.flags.copilotEscaped=true;
      const h=g.people.find(p=>p.role==='copilot'&&p.captive);
      if(h)Object.assign(h,{x:e.x+110,y:e.y+110,captive:false,hidden:false});
      else people(g,e.x+110,e.y+110,'copilot',1);
      tell(g,'Your copilot escaped the bomber. Stop firing and winch him aboard.');
    }
    return false;
  }
  function killPerson(g,p) {
    if(p.rescued||p.dead||p.hidden)return;p.dead=true;score(g,'penalties',-500);tell(g,'Personnel lost. Check the mission requirements.');
    if(['agent','copilot','ambassador','lead chemist','scientist','commando'].includes(p.role))fail(g,'Essential personnel lost. Retry the operation.');
  }
  function unload(g, zone) {
    if(zone.kind==='oil') {
      if(g.flags.oilLanded)return;
      const squad=g.passengers.filter(p=>p.role==='commando');if(!squad.length)return;
      g.flags.oilLanded=true;g.flags.commandos=squad.length;
      if(squad.length<6){fail(g,'The one-use oil-field landing zone needed all six commandos together.');return;}
      squad.forEach(p=>p.delivered=true);g.passengers=g.passengers.filter(p=>p.role!=='commando');tell(g,'Commandos deployed. Protect the oil storage.');
    } else {
      const canExit=p=>p.role!=='commando'&&(p.role!=='Valdez'||zone.kind==='base');
      const exiting=g.passengers.filter(canExit);
      exiting.forEach(p=>p.delivered=true);g.passengers=g.passengers.filter(p=>!canExit(p));
      if(exiting.some(p=>p.role==='Valdez')){g.jakeUnlocked=true;tell(g,'Valdez is safe. Jake is available for your next operation.');}
      g.delivered+=exiting.length;score(g,'delivery',exiting.length*500);g.player.armor=Math.min(600,g.player.armor+exiting.length*(g.level===0?150:100));
      const quota={prisoner:10,POW:14,inspector:5,pilot:2,hostage:7,civilian:15};
      for(const role of new Set(exiting.map(p=>p.role)))if(quota[role]){
        const before=delivered(g,role)-exiting.filter(p=>p.role===role).length;
        score(g,'bonus',(Math.max(0,delivered(g,role)-quota[role])-Math.max(0,before-quota[role]))*250);
      }
      if(exiting.length)tell(g,`${exiting.length} personnel delivered safely.`);
    }
    g.player.crew=g.passengers.length;
  }
  function tick(g,dt) {
    const p=g.player, slow=Math.hypot(p.vx,p.vy)<35;
    for(const e of g.enemies) {
      if(e.deadline&&alive(e)&&g.time>=e.deadline){e.hp=0;e.escaped=true;tell(g,e.kind==='bomber'?'The bomber took off.':'Missile launched.');if(e.kind==='bomber')fail(g,'The nuclear bomber escaped. Retry the operation.');}
      if(e.kind==='truck'&&alive(e)){e.x=e.homeX+Math.sin(g.time*.12+e.id)*75;e.y=e.homeY+Math.cos(g.time*.12+e.id)*35;}
    }
    for(const h of g.people)if(waiting(h)&&h.expires&&g.time>=h.expires)killPerson(g,h);
    const losses=role=>g.people.filter(h=>h.role===role&&h.dead).length;
    for(const [role,limit] of [['commander',1],['scud commander',1],['prisoner',2],['POW',2],['inspector',1],['pilot',1],['hostage',5],['civilian',1]])if(losses(role)>limit)fail(g,`Too many ${role} losses. Retry the operation.`);
    if(g.enemies.filter(e=>e.group==='scuds'&&e.escaped).length>1)fail(g,'More than one SCUD launched. Five of six had to be stopped.');
    if(g.enemies.some(e=>e.group==='silos'&&e.escaped))fail(g,'A biological missile launched. Retry the operation.');
    if(g.level===0&&g.flags.trapdoorOpen&&!g.flags.agentEntered&&slow&&dist(p,g.agentZone)<65){
      g.flags.agentEntered=true;g.copilot=false;
      [[-120,-90],[140,-90],[120,140]].forEach(([x,y])=>{const e=enemy(g,g.agentZone.x+x,g.agentZone.y+y,'tank','agent-wave');const ref=typeof module!=='undefined'&&module.exports?require('./reference.js'):root.DesertReference;ref.configureEnemy(e,'vda');});
      tell(g,'Copilot inside. Destroy the three reinforcements to secure the extraction.');
    }
    if(g.flags.agentEntered&&!g.flags.agentFree&&destroyed(g,'agent-wave')===3){g.flags.agentFree=true;people(g,g.agentZone.x,g.agentZone.y,'agent',1);people(g,g.agentZone.x+45,g.agentZone.y,'copilot',1);}
    if(g.flags.yachtOpen&&g.flags.hostages<12&&g.time>=g.flags.nextHostage){
      people(g,g.enemies.find(e=>e.kind==='yacht').x+35,g.enemies.find(e=>e.kind==='yacht').y+35,'hostage',1,{expires:g.time+(g.difficulty==='story'?150:100)});g.flags.hostages++;g.flags.nextHostage=g.time+5;
    }
    if(g.level===2){
      if(g.stage===7&&!g.bus.active&&slow&&dist(p,g.embassy)<65){
        g.bus.active=true;g.copilot=false;
        reinforce(g,g.embassy.x+200,g.embassy.y-150,'chopper','bus-route');
        tell(g,'Copilot inside the embassy. Cover the officials as they board the bus.');
      }
      const b=g.bus;
      if(b.active&&!b.arrived){
        if(b.boarded<12){b.boarding+=dt;if(b.boarding>=1.5){b.boarding-=1.5;b.boarded++;if(b.boarded===6)reinforce(g,g.embassy.x-180,g.embassy.y+100,'chopper','bus-route');if(b.boarded===12)tell(g,'Twelve officials aboard. Clear the gate and escort the bus to the SEAL camp.');}}
        if(b.waypoint>=2&&!g.flags.busAmbush){g.flags.busAmbush=true;const t=b.path[3];reinforce(g,t.x+120,t.y-100,'m48','bus-route');reinforce(g,t.x-100,t.y+160,'m48','bus-route');tell(g,'Armor ambush ahead. Protect the bus!');}
        const block=g.enemies.some(e=>e.group==='bus-route'&&alive(e)&&dist(e,b)<210);
        if(b.boarded===12&&!block&&dist(p,b)<340&&dist(p,b)>65){const t=b.path[b.waypoint],d=dist(b,t);if(d<5){b.waypoint++;if(b.waypoint===b.path.length){b.arrived=true;g.copilot=true;g.delivered+=12;tell(g,'All twelve embassy officials are safe. Return to the frigate.');}}else{b.x+=(t.x-b.x)/d*52*dt;b.y+=(t.y-b.y)/d*52*dt;}}
        if(b.hp<=0)fail(g,'The embassy bus was destroyed. All twelve officials were lost.');
      }
    }
    if(g.level===3){
      for(const e of g.enemies.filter(e=>e.group==='oil-enemies'&&alive(e))) {
        const tank=g.oilTanks.filter(t=>t.hp>0).sort((a,b)=>dist(a,e)-dist(b,e))[0];
        if(tank&&g.time>25)tank.hp-=dt*(g.difficulty==='story'?1:2);
      }
      if(g.oilTanks.filter(t=>t.hp<=0).length>1)fail(g,'Too much oil storage was destroyed. Stop the tanks sooner.');
      const vehicle=g.enemies.find(e=>e.kind==='atv'),plane=g.enemies.find(e=>e.kind==='bomber');
      if(destroyed(g,'palace')&&!g.flags.palaceEntered&&slow&&dist(p,g.palaceZone)<65){
        g.flags.palaceEntered=true;g.copilot=false;vehicle.hidden=false;
        vehicle.path=[{x:3370,y:1670},{x:2170,y:1140},{x:plane.x+180,y:plane.y+110}];vehicle.waypoint=0;
        tell(g,'Palace trap! Follow the ATV to the airstrip. HOLD FIRE: your copilot is inside.');
      }
      if(g.flags.palaceEntered&&vehicle.hp>0&&vehicle.occupied){
        const t=vehicle.path[vehicle.waypoint],d=dist(vehicle,t),travel=Math.min(d,70*dt);
        vehicle.heading=Math.atan2(t.y-vehicle.y,t.x-vehicle.x);
        if(d>0){vehicle.x+=(t.x-vehicle.x)/d*travel;vehicle.y+=(t.y-vehicle.y)/d*travel;}
        if(d<=travel+.01&&++vehicle.waypoint===vehicle.path.length){
          vehicle.occupied=false;vehicle.civilian=false;g.flags.transfer=true;
          people(g,vehicle.x-30,vehicle.y-45,'copilot',1,{captive:true});
          tell(g,'ATV empty. Your copilot is being taken to the bomber. Keep fire clear of the escort.');
        }
      }
      if(g.flags.transfer&&!g.flags.bomberBoarded){
        const h=g.people.find(p=>p.role==='copilot'&&p.captive);
        if(h&&!h.dead){const d=dist(h,plane),travel=Math.min(d,22*dt);
          if(d>0){h.x+=(plane.x-h.x)/d*travel;h.y+=(plane.y-h.y)/d*travel;}
          if(d<=travel+.01){h.hidden=true;g.flags.bomberBoarded=true;reveal(g,'bomber');plane.deadline=g.time+(g.difficulty==='story'?240:150);tell(g,'Bomber preparing for takeoff. Open a breach to free your copilot!');}
        }
      }
    }
    if(g.status!=='playing')return;
    g.tasks.forEach(t=>{if(!t.done&&t.test())t.done=true;});
    const next=g.tasks.findIndex(t=>!t.done), stage=next<0?g.tasks.length:next;
    if(stage!==g.stage){g.stage=stage;tell(g,stage===g.tasks.length?'Objectives complete. Return to the frigate.':g.tasks[stage].hint);}
    if(g.level===3){const groups=[['oil-enemies'],['pipes'],['shelters'],['bomb-trucks','decoys'],['nuclear'],['power'],['palace'],[]];for(let i=0;i<=Math.min(g.stage,7);i++)groups[i].forEach(group=>reveal(g,group));}
    if(g.status==='playing'&&g.stage===g.tasks.length&&dist(p,g.base)<85&&slow){g.status='won';tell(g,'Campaign complete. All required missions accomplished.');}
  }
  function objective(g) {
    if(g.player.crew>=6){if(g.passengers.some(p=>p.role==='commando'))return g.oilZone;return nearestZone(g);}
    const t=g.tasks[g.stage];if(!t)return g.base;
    let targets=t.targets().filter(e=>!e.hidden);
    if(g.level===3&&g.stage===7){
      const copilot=g.people.find(p=>p.role==='copilot'&&waiting(p));if(copilot)return copilot;
      const vehicle=g.enemies.find(e=>e.kind==='atv'&&alive(e));
      if(vehicle)return vehicle.occupied?{x:vehicle.x+110,y:vehicle.y-100,kind:'follow'}:vehicle;
      if(!g.flags.bomberBoarded){const h=g.people.find(p=>p.role==='copilot'&&p.captive);if(h)return {x:h.x+130,y:h.y+120,kind:'follow'};}
    }
    if(g.level===2&&g.stage===7&&g.bus.active){const blockers=g.enemies.filter(e=>e.group==='bus-route'&&alive(e)&&dist(e,g.bus)<240);targets=blockers.length?blockers:[g.bus];}
    const active=g.enemies.filter(e=>alive(e)&&e.deadline).sort((a,b)=>a.deadline-b.deadline);
    if(active.length)targets=[active[0]];
    // Do not leave indispensable passengers aboard when an evacuation is waiting on delivery.
    if(!targets.length&&g.player.crew)return nearestZone(g);
    if(g.level===0&&g.stage===4&&captured(g,'agent')&&g.copilot)return nearestZone(g);
    if(g.level===3&&g.stage===0&&g.passengers.some(p=>p.role==='commando')&&!g.people.some(p=>p.role==='commando'&&waiting(p)))return g.oilZone;
    return targets.sort((a,b)=>dist(g.player,a)-dist(g.player,b))[0]||nearestZone(g);
  }
  function nearestZone(g){if(g.passengers.some(p=>p.role==='Valdez')&&g.passengers.every(p=>p.role==='Valdez'||p.role==='commando'))return g.base;return [g.base,...g.zones].sort((a,b)=>dist(g.player,a)-dist(g.player,b))[0];}
  function mapObjects(g,category){
    if(category.startsWith('mission:')){const i=Number(category.slice(8));return g.tasks[i]&&(g.level!==3||i<=g.stage)?g.tasks[i].targets().filter(e=>!e.hidden):[];}
    if(category==='personnel')return g.people.filter(waiting);
    if(category==='landing')return [g.base,...g.zones,...(g.oilZone?[g.oilZone]:[])];
    if(['fuel','ammo','repair'].includes(category))return g.supplies.filter(s=>s.kind===category&&!s.hidden&&!s.used);
    if(category==='defenses')return g.enemies.filter(e=>alive(e)&&e.weapon);
    return [...g.enemies.filter(e=>alive(e)&&!e.cache),...g.people.filter(waiting),...g.supplies.filter(s=>!s.hidden&&!s.used)];
  }
  const api={missions,initialize,onRescue,onDestroy,onHit,killPerson,unload,tick,objective,alive,waiting,mapObjects,score,scoreObject};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.DesertCampaigns=api;
})(typeof globalThis!=='undefined'?globalThis:this);
