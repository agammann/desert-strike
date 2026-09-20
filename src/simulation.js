(function (root) {
  'use strict';
  const Campaigns = typeof module !== 'undefined' && module.exports ? require('./campaigns.js') : root.DesertCampaigns;
  const Reference = typeof module !== 'undefined' && module.exports ? require('./reference.js') : root.DesertReference;
  const { missions } = Campaigns;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function createGame(level = 0, difficulty = 'standard', controls = 'above', options = {}) {
    level = clamp(Math.floor(level) || 0, 0, missions.length - 1);
    const g = { level, difficulty, controls, status: 'playing', time: 0, score: 0, lives: 3, invulnerable: 0,
      base: { x: 200, y: 1920, kind: 'base' },
      player: { x: 200, y: 1920, vx: 0, vy: 0, angle: -Math.PI / 2, armor: 600, fuel: 100, ammo: 1178, rockets: 38, hellfires: 8, crew: 0, gunCd: 0, rocketCd: 0, hellfireCd: 0 },
      bullets: [], effects: [], delivered: 0, winch: 0, service: 0, targetId: null, messageTime: 7, events: [],
      jakeUnlocked:!!options.jakeUnlocked, copilotId:options.copilotId||'xman', stunned:0, nextFuelWarning:14, armorWarned:false,
      scoreLog:{targets:0,rescues:0,delivery:0,bonus:0,penalties:0}, accumulator:0 };
    if(!Reference.copilots[g.copilotId]||(g.copilotId==='jake'&&!g.jakeUnlocked))g.copilotId='xman';
    g.score=Math.max(0,Math.floor(Number(options.score)||0));
    g.startScore=g.score;
    Campaigns.initialize(g); Reference.apply(g); return g;
  }

  function message(g, text, seconds = 4) { g.message = text; g.messageTime = seconds; }
  function burst(g, x, y, kind) { g.effects.push({ x, y, kind, life: .65, maxLife: .65 }); g.events.push(kind); }
  function damageObject(g,e,amount){
    if(!(e.hp>0)||e.indestructible)return;
    e.hp-=amount;
    const changed=Campaigns.onHit(g,e,amount);
    burst(g,e.x,e.y,e.hp<=0?'explosion':'spark');
    if(e.hp<=0&&!changed){Campaigns.scoreObject(g,e);Campaigns.onDestroy(g,e);}
  }
  // First intersection with a swept projectile, so a slow frame cannot skip a small target.
  function intersection(x,y,nx,ny,o,r){
    const dx=nx-x,dy=ny-y,ox=x-o.x,oy=y-o.y,a=dx*dx+dy*dy,c=ox*ox+oy*oy-r*r;
    if(c<=0)return 0;if(!a)return null;
    const b=2*(ox*dx+oy*dy),d=b*b-4*a*c;if(d<0)return null;
    const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:null;
  }
  function update(g, input = {}, dt = 1 / 60) {
    if (g.status !== 'playing') return;
    dt = clamp(dt, 0, .05); g.time += dt; g.events = []; g.messageTime -= dt;
    const p = g.player; g.invulnerable = Math.max(0, g.invulnerable - dt);
    g.stunned=Math.max(0,g.stunned-dt);if(g.stunned>0)input={};
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0), dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    let length = Math.hypot(dx, dy) || 1;
    const speed = input.winch ? 35 : 120;
    const strafe = input.strafe && g.controls !== 'above';
    if (g.controls !== 'above') {
      if(!strafe)p.angle+=dx*dt*2.2;
      const turn=strafe?dx:0,thrust=-dy;dx=Math.cos(p.angle)*thrust-Math.sin(p.angle)*turn;dy=Math.sin(p.angle)*thrust+Math.cos(p.angle)*turn;length=Math.max(1,Math.hypot(dx,dy));
    }
    const damping = g.controls === 'cockpit' ? 18 : 6;
    p.vx += (dx / length * speed - p.vx) * Math.min(1, dt * damping);
    p.vy += (dy / length * speed - p.vy) * Math.min(1, dt * damping);
    p.x=clamp(p.x+p.vx*dt,30,g.world.width-30);p.y=clamp(p.y+p.vy*dt,30,g.world.height-30);
    g.collisionCd=Math.max(0,(g.collisionCd||0)-dt);
    const obstacle=[...g.enemies.filter(e=>!e.hidden&&(e.hp>0||e.solidWreck)&&e.collisionRadius),...g.scenery.filter(e=>e.hp>0)].find(e=>distance(p,e)<(e.collisionRadius||e.radius)+10);
    if(obstacle){
      const a=Math.atan2(p.y-obstacle.y,p.x-obstacle.x),radius=(obstacle.collisionRadius||obstacle.radius)+12;
      p.x=obstacle.x+Math.cos(a)*radius;p.y=obstacle.y+Math.sin(a)*radius;p.vx*=.1;p.vy*=.1;
      if(!g.collisionCd){p.armor=Math.max(0,p.armor-10);damageObject(g,obstacle,10);g.collisionCd=.75;g.stunned=.35;message(g,'Collision. Controls interrupted. Keep clear of obstacles.',2);}
    }
    const nearest = g.enemies.filter(e => Campaigns.alive(e) && !e.civilian && distance(p, e) < 230).sort((a, b) => distance(p, a) - distance(p, b))[0];
    g.targetId = nearest ? nearest.id : null;
    if (g.controls !== 'above') { /* Classic flight keeps aircraft heading under the pilot's control. */ }
    else if (Number.isFinite(input.aimX) && Number.isFinite(input.aimY)) p.angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    else if (nearest && g.copilot) p.angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    else if (Math.hypot(p.vx, p.vy) > 20) p.angle = Math.atan2(p.vy, p.vx);
    p.gunCd -= dt; p.rocketCd -= dt; p.hellfireCd -= dt;
    function fire(rocket, hellfire = false) {
      const v = rocket ? 340 : 480;
      const profile=Reference.copilots[g.copilotId];
      const target=g.copilot?g.enemies.filter(e=>Campaigns.alive(e)&&!e.civilian&&distance(p,e)<230).map(e=>({e,a:Math.atan2(e.y-p.y,e.x-p.x)})).filter(t=>Math.abs(Math.atan2(Math.sin(t.a-p.angle),Math.cos(t.a-p.angle)))<profile.aim).sort((a,b)=>distance(p,a.e)-distance(p,b.e))[0]:null;
      const a=target&&(!rocket||hellfire)?target.a:p.angle;
      g.bullets.push({ x: p.x + Math.cos(a) * 13, y: p.y + Math.sin(a) * 13, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: (hellfire?220:rocket?200:180)/v, damage: hellfire ? 100 : rocket ? 25 : 3, enemy: false, rocket, homing: hellfire&&target?target.e.id:null });
      g.events.push(rocket ? 'rocket' : 'gun');
    }
    if (input.fire && p.gunCd <= 0 && p.ammo > 0) { fire(false); p.ammo--; p.gunCd = .105; }
    if (input.rocket && p.rocketCd <= 0 && p.rockets > 0) { fire(true); p.rockets--; p.rocketCd = .5; }
    if (input.hellfire && p.hellfireCd <= 0 && p.hellfires > 0) { fire(true, true); p.hellfires--; p.hellfireCd = .8; }
    const atBase = distance(p, g.base) < 85;
    const overWater = Reference.water(g,p.x,p.y);
    if (!overWater) p.fuel = Math.max(0, p.fuel - dt * (g.difficulty === 'story' ? .18 : .36));
    const zone = [g.base, ...g.zones, ...(g.oilZone ? [g.oilZone] : [])].find(z => distance(p,z)<42);
    if (zone && Math.hypot(p.vx,p.vy)<35) {
      if (atBase && g.difficulty === 'story') { p.fuel=Math.min(100,p.fuel+dt*22); p.armor=Math.min(600,p.armor+dt*90); }
      g.service+=dt;
      if(g.service>=.8){Campaigns.unload(g,zone); if(atBase&&g.difficulty==='story'){p.ammo=1178;p.rockets=38;p.hellfires=8;}}
    } else g.service=0;
    if (Math.hypot(p.vx, p.vy) < (input.winch ? 80 : 35)) {
      const person = g.people.find(h => Campaigns.waiting(h) && (!h.requiresCash||g.flags.cash) && distance(h, p) < 28);
      const supply = g.supplies.find(s => !s.used && !s.hidden && distance(s, p) < 32);
      const target=person&&p.crew<6?person:supply;
      if(g.winchTarget!==target){g.winch=0;g.winchTarget=target;}
      const winchSeconds=g.copilot?Reference.copilots[g.copilotId].winch:3.2;
      g.winchDuration=g.quickWinch?.5:target===person?winchSeconds:winchSeconds*1.4/2.2;
      if (person && p.crew < 6) {
        g.winch += dt;
        if (g.winch >= g.winchDuration) { person.rescued = true; g.passengers.push(person); p.crew=g.passengers.length; g.winch = 0; Campaigns.score(g,'rescues',150); g.events.push('rescue'); message(g,person.role==='Valdez'?'Valdez aboard. Deliver him to the frigate to unlock Jake.':p.crew === 6 ? 'Cabin full. Return to base to deliver the crew.' : 'Personnel aboard. Hover to winch the next survivor.'); Campaigns.onRescue(g,person); }
      } else if (supply) {
        g.winch += dt;
        if (g.winch >= g.winchDuration) { supply.used = true; g.winch = 0; if (supply.kind === 'fuel') p.fuel = 100; if (supply.kind === 'ammo') { p.ammo = 1178; p.rockets = 38; p.hellfires = 8; } if (supply.kind === 'repair') p.armor = 600; if(supply.kind==='winch')g.quickWinch=true; if(supply.kind==='life')g.lives++; if(supply.kind==='cash')g.flags.cash=true; g.events.push('rescue'); message(g, supply.kind==='cash'?'Cash case aboard. Find the official to buy the intelligence.':'Supplies recovered.'); }
      } else { g.winch = 0; if (person && p.crew >= 6) message(g, 'Cabin full. Deliver your crew at base first.', 1); }
    } else g.winch = 0;
    for(const e of g.enemies){
      if(!Campaigns.alive(e)||!e.weapon)continue;
      const w=Reference.weapons[e.weapon];
      const alert=!(e.weapon==='aaa'&&e.alertGroup?.includes('radar'))&&e.alertGroup&&g.enemies.some(r=>r.group===e.alertGroup&&Campaigns.alive(r));
      const rangeAlert=alert&&e.alertGroup.includes('radar');
      const range=w.range*(rangeAlert?1.6:1);
      const d=distance(p,e), desired=Math.atan2(p.y-e.y,p.x-e.x);
      const error=Math.atan2(Math.sin(desired-e.heading),Math.cos(desired-e.heading));
      const turn=(alert?7:w.turn)*dt;e.heading+=clamp(error,-turn,turn);
      if(w.mobile&&d<range*1.6&&d>range*.72&&distance(e,{x:e.homeX,y:e.homeY})<260){
        const nx=e.x+Math.cos(desired)*w.mobile*dt,ny=e.y+Math.sin(desired)*w.mobile*dt;
        if(e.weapon==='chopper'||Reference.water(g,nx,ny)===(e.weapon==='speedboat')){e.x=nx;e.y=ny;}
      }
      e.cooldown-=dt;
      if(e.cooldown<=0&&d<range&&Math.abs(error)<.20&&!atBase){
        g.bullets.push({x:e.x,y:e.y,vx:Math.cos(e.heading)*w.speed,vy:Math.sin(e.heading)*w.speed,life:range/w.speed+.5,enemy:true,damage:w.damage*(g.difficulty==='story'?.45:1)*(alert?1.5:1)});
        e.cooldown=w.interval*(g.difficulty==='story'?1.5:1)*(alert?.65:1);
      }
    }
    for (const b of g.bullets) {
      if (b.homing !== null && b.homing !== undefined) { const target = g.enemies.find(e=>e.id===b.homing&&Campaigns.alive(e)); if(target){const a=Math.atan2(target.y-b.y,target.x-b.x);b.vx=Math.cos(a)*340;b.vy=Math.sin(a)*340;} }
      const travel=Math.min(dt,b.life),nx=b.x+b.vx*travel,ny=b.y+b.vy*travel,hits=[];
      const consider=(o,r,kind)=>{const t=intersection(b.x,b.y,nx,ny,o,r);if(t!==null)hits.push({o,t,kind});};
      if(b.enemy&&!atBase&&!g.invulnerable)consider(p,11,'player');
      if(!b.enemy){
        g.enemies.filter(Campaigns.alive).forEach(e=>consider(e,e.kind==='pipe'?10:e.kind==='tank'?14:24,'object'));
        g.scenery.filter(e=>e.hp>0).forEach(e=>consider(e,e.radius,'object'));
      }
      g.people.filter(h=>!h.rescued&&!h.dead&&!h.hidden).forEach(h=>consider(h,10,'person'));
      g.supplies.filter(s=>!s.used&&!s.hidden&&['fuel','ammo'].includes(s.kind)).forEach(s=>consider(s,12,'supply'));
      if(g.bus?.active&&!g.bus.arrived)consider(g.bus,30,'bus');
      (g.oilTanks||[]).filter(t=>t.hp>0).forEach(t=>consider(t,42,'oil'));
      const hit=hits.sort((a,b)=>a.t-b.t)[0];
      b.x=nx;b.y=ny;b.life-=dt;
      if(hit){
        const e=hit.o;b.life=0;
        if(hit.kind==='player'){p.armor=Math.max(0,p.armor-b.damage);burst(g,p.x,p.y,'hit');}
        else if(hit.kind==='person')Campaigns.killPerson(g,e);
        else if(hit.kind==='object'){
          const alert=!(e.weapon==='aaa'&&e.alertGroup?.includes('radar'))&&e.weapon&&e.alertGroup&&g.enemies.some(r=>r.group===e.alertGroup&&Campaigns.alive(r));
          damageObject(g,e,b.damage/(alert?1.5:1));
        }else if(hit.kind==='supply'){
          e.hp=(e.hp??30)-b.damage;if(e.hp<=0){e.used=true;e.destroyed=true;if(!b.enemy)Campaigns.score(g,'penalties',-500);burst(g,e.x,e.y,'explosion');message(g,'Supply crate destroyed. Watch your fire.');}
        }else {const hp=e.hp;e.hp-=b.damage;if(!b.enemy&&hp>0&&e.hp<=0)Campaigns.score(g,'penalties',-500);}
      }
    }

    g.bullets = g.bullets.filter(b => b.life > 0);
    g.effects.forEach(e => e.life -= dt); g.effects = g.effects.filter(e => e.life > 0);
    if (p.armor <= 0 || p.fuel <= 0) { if(g.bus?.active&&!g.bus.arrived&&distance(p,g.bus)<45){g.status='lost';message(g,'The aircraft crashed into the embassy bus.',99);return;} g.lives--; if(g.lives <= 0){g.status = 'lost'; message(g, 'All three aircraft lost. Retry the campaign.', 99);} else { const empty=p.fuel<=0; p.x=g.base.x;p.y=g.base.y;p.vx=0;p.vy=0;p.armor=600;p.fuel=empty?100:Math.max(25,p.fuel);g.invulnerable=3;g.bullets=[];message(g, `Aircraft replaced. ${g.lives} lives remain.`,5); } }

    if(g.status!=='playing')return;
    if(p.fuel>14)g.nextFuelWarning=14;
    if(p.fuel<=g.nextFuelWarning){message(g,`Low fuel: ${Math.ceil(p.fuel)}. Recover a fuel crate.`,4);g.nextFuelWarning=Math.max(-1,g.nextFuelWarning-2);}
    if(p.armor>125)g.armorWarned=false;
    if(p.armor<=125&&!g.armorWarned){message(g,'Armor critical. Rescue personnel or recover a repair crate.',4);g.armorWarned=true;}
    if(g.status==='playing')Campaigns.tick(g,dt);
  }
  // Render frames may vary; game logic always advances in 1/60-second steps.
  // Cap catch-up after a stall so returning to the tab cannot consume a mission timer.
  function advance(g,input,elapsed){
    if(g.status!=='playing')return;
    g.accumulator+=clamp(elapsed,0,.25);const events=[];
    while(g.accumulator+1e-10>=1/60&&g.status==='playing'){
      update(g,input,1/60);g.accumulator-=1/60;events.push(...g.events);
    }
    g.events=[...new Set(events)];
  }
  const api = { missions, createGame, update, advance, distance, objective: Campaigns.objective, weapons: Reference.weapons };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DesertSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
