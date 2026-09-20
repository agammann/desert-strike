(function (root) {
  'use strict';
  const SIZE = 2400;
  const Campaigns = typeof module !== 'undefined' && module.exports ? require('./campaigns.js') : root.DesertCampaigns;
  const { missions } = Campaigns;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function createGame(level = 0, difficulty = 'standard', controls = 'above') {
    level = clamp(Math.floor(level) || 0, 0, missions.length - 1);
    const g = { level, difficulty, controls, status: 'playing', time: 0, score: 0, lives: 3, invulnerable: 0,
      base: { x: 200, y: 1920, kind: 'base' },
      player: { x: 200, y: 1920, vx: 0, vy: 0, angle: -Math.PI / 2, armor: 600, fuel: 100, ammo: 1178, rockets: 38, hellfires: 8, crew: 0, gunCd: 0, rocketCd: 0, hellfireCd: 0 },
      bullets: [], effects: [], delivered: 0, winch: 0, service: 0, targetId: null, messageTime: 7, events: [] };
    Campaigns.initialize(g); return g;
  }

  function message(g, text, seconds = 4) { g.message = text; g.messageTime = seconds; }
  function burst(g, x, y, kind) { g.effects.push({ x, y, kind, life: .65, maxLife: .65 }); g.events.push(kind); }
  function update(g, input = {}, dt = 1 / 60) {
    if (g.status !== 'playing') return;
    dt = clamp(dt, 0, .05); g.time += dt; g.events = []; g.messageTime -= dt;
    const p = g.player; g.invulnerable = Math.max(0, g.invulnerable - dt);
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0), dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const length = Math.hypot(dx, dy) || 1, speed = input.winch ? 70 : 245;
    if (g.controls !== 'above') { p.angle += dx * dt * 2.8; const thrust = -dy; dx = Math.cos(p.angle) * thrust; dy = Math.sin(p.angle) * thrust; }
    const damping = g.controls === 'cockpit' ? 18 : 6;
    p.vx += (dx / length * speed - p.vx) * Math.min(1, dt * damping);
    p.vy += (dy / length * speed - p.vy) * Math.min(1, dt * damping);
    p.x = clamp(p.x + p.vx * dt, 70, SIZE - 70); p.y = clamp(p.y + p.vy * dt, 70, SIZE - 70);
    const nearest = g.enemies.filter(e => Campaigns.alive(e) && !e.civilian && distance(p, e) < 490).sort((a, b) => distance(p, a) - distance(p, b))[0];
    g.targetId = nearest ? nearest.id : null;
    if (g.controls !== 'above') { /* Classic flight keeps aircraft heading under the pilot's control. */ }
    else if (Number.isFinite(input.aimX) && Number.isFinite(input.aimY)) p.angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    else if (nearest && g.copilot) p.angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    else if (Math.hypot(p.vx, p.vy) > 20) p.angle = Math.atan2(p.vy, p.vx);
    p.gunCd -= dt; p.rocketCd -= dt; p.hellfireCd -= dt;
    function fire(rocket, hellfire = false) {
      const v = rocket ? 600 : 830;
      g.bullets.push({ x: p.x + Math.cos(p.angle) * 28, y: p.y + Math.sin(p.angle) * 28, vx: Math.cos(p.angle) * v, vy: Math.sin(p.angle) * v, life: 1, damage: hellfire ? 100 : rocket ? 25 : 3, enemy: false, rocket, homing: hellfire && g.copilot ? g.targetId : null });
      g.events.push(rocket ? 'rocket' : 'gun');
    }
    if (input.fire && p.gunCd <= 0 && p.ammo > 0) { fire(false); p.ammo--; p.gunCd = .105; }
    if (input.rocket && p.rocketCd <= 0 && p.rockets > 0) { fire(true); p.rockets--; p.rocketCd = .5; }
    if (input.hellfire && p.hellfireCd <= 0 && p.hellfires > 0) { fire(true, true); p.hellfires--; p.hellfireCd = .8; }
    const atBase = distance(p, g.base) < 85;
    const overWater = p.x < 600;
    if (!overWater) p.fuel = Math.max(0, p.fuel - dt * (g.difficulty === 'story' ? .13 : .20));
    const zone = [g.base, ...g.zones, ...(g.oilZone ? [g.oilZone] : [])].find(z => distance(p,z)<70);
    if (zone && Math.hypot(p.vx,p.vy)<35) {
      if (atBase && g.difficulty === 'story') { p.fuel=Math.min(100,p.fuel+dt*22); p.armor=Math.min(600,p.armor+dt*90); }
      g.service+=dt;
      if(g.service>=.8){Campaigns.unload(g,zone); if(atBase&&g.difficulty==='story'){p.ammo=1178;p.rockets=38;p.hellfires=8;}}
    } else g.service=0;
    if (Math.hypot(p.vx, p.vy) < (input.winch ? 80 : 35)) {
      const person = g.people.find(h => Campaigns.waiting(h) && distance(h, p) < 65);
      const supply = g.supplies.find(s => !s.used && distance(s, p) < 75);
      if (person && p.crew < 6) {
        g.winch += dt;
        if (g.winch >= (g.quickWinch ? .4 : 1.1)) { person.rescued = true; g.passengers.push(person); p.crew=g.passengers.length; g.winch = 0; g.score += 150; g.events.push('rescue'); message(g, p.crew === 6 ? 'Cabin full. Return to base to deliver the crew.' : 'Personnel aboard. Hover to winch the next survivor.'); Campaigns.onRescue(g,person); }
      } else if (supply) {
        g.winch += dt;
        if (g.winch >= .7) { supply.used = true; g.winch = 0; if (supply.kind === 'fuel') p.fuel = 100; if (supply.kind === 'ammo') { p.ammo = 1178; p.rockets = 38; p.hellfires = 8; } if (supply.kind === 'repair') p.armor = 600; if(supply.kind==='winch')g.quickWinch=true; if(supply.kind==='life')g.lives++; g.events.push('rescue'); message(g, 'Supplies recovered.'); }
      } else { g.winch = 0; if (person && p.crew >= 6) message(g, 'Cabin full. Deliver your crew at base first.', 1); }
    } else g.winch = 0;
    for (const e of g.enemies) {
      if (!Campaigns.alive(e)) continue;
      e.cooldown -= dt;
      if (e.kind==='tank' && e.cooldown <= 0 && distance(p, e) < (g.enemies.some(r=>r.kind==='radar'&&Campaigns.alive(r))?450:310) && !atBase) {
        const a = Math.atan2(p.y - e.y, p.x - e.x), v = e.kind === 'radar' ? 180 : 210;
        g.bullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 3, enemy: true, damage: g.difficulty === 'story' ? 18 : 40 });
        e.cooldown = g.enemies.some(r=>r.kind==='power'&&Campaigns.alive(r))?1.8:2.8;
      }
    }
    for (const b of g.bullets) {
      if (b.homing !== null && b.homing !== undefined) { const target = g.enemies.find(e=>e.id===b.homing&&Campaigns.alive(e)); if(target){const a=Math.atan2(target.y-b.y,target.x-b.x);b.vx=Math.cos(a)*600;b.vy=Math.sin(a)*600;} }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.enemy && distance(b, p) < 24 && !atBase && !g.invulnerable) { p.armor = Math.max(0, p.armor - b.damage); b.life = 0; burst(g, p.x, p.y, 'hit'); }
      if (b.life <= 0) continue;
      if (!b.enemy) {
        const e = g.enemies.find(e => Campaigns.alive(e) && distance(e,b) < (e.kind==='pipe'?16:e.kind==='tank'?30:40));
        if(e){
          e.hp-=b.damage;b.life=0;
          const changed=Campaigns.onHit(g,e,b.damage);
          burst(g,b.x,b.y,e.hp<=0?'explosion':'spark');
          if(e.hp<=0&&!changed){g.score+=350;Campaigns.onDestroy(g,e);}
        }
      }
      if(b.life>0){
        const h=g.people.find(h=>Campaigns.waiting(h)&&distance(h,b)<10);
        if(h){Campaigns.killPerson(g,h);b.life=0;}
        if(g.bus?.active&&!g.bus.arrived&&distance(g.bus,b)<30){g.bus.hp-=b.damage;b.life=0;}
        const oil=(g.oilTanks||[]).find(t=>t.hp>0&&distance(t,b)<42);
        if(b.life>0&&oil){oil.hp-=b.damage;b.life=0;}
      }
    }

    g.bullets = g.bullets.filter(b => b.life > 0);
    g.effects.forEach(e => e.life -= dt); g.effects = g.effects.filter(e => e.life > 0);
    if (p.armor <= 0 || p.fuel <= 0) { g.lives--; if(g.lives <= 0){g.status = 'lost'; message(g, 'All three aircraft lost. Retry the campaign.', 99);} else { const empty=p.fuel<=0; p.x=g.base.x;p.y=g.base.y;p.vx=0;p.vy=0;p.armor=600;p.fuel=empty?100:Math.max(25,p.fuel);g.invulnerable=3;g.bullets=[];message(g, `Aircraft replaced. ${g.lives} lives remain.`,5); } }

    else if (p.fuel < 14 && g.messageTime <= 0) message(g, 'Low fuel. Recover a fuel crate.', 4);
    if(g.status==='playing')Campaigns.tick(g,dt);
  }
  const api = { SIZE, missions, createGame, update, distance, objective: Campaigns.objective };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DesertSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
