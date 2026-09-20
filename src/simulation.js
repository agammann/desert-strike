(function (root) {
  'use strict';
  const SIZE = 2400;
  const missions = [
    { name: 'Air Superiority', text: 'Radar. Power. Airfields. Command. Clear the coast and recover the stranded crew.', radars: [[1190,1570],[1690,780]], targets: [[1370,1100,'power'],[1850,560,'airfield'],[2040,1260,'airfield'],[1910,1830,'command']], camps: [[870,1050],[1830,1460],[1560,570],[1030,1790]], tanks: [[1080,1220],[1520,1430],[1790,1000],[1830,1700]] },
    { name: 'Scud Buster', text: 'Disable radar, command sites and missile launchers. Evacuate the stranded crew.', radars: [[1100,800],[1930,650],[1800,1680]], targets:[[1530,1080,'command'],[2130,1110,'scud'],[1410,580,'scud'],[1190,1480,'scud']], camps: [[810,650],[1530,1250],[1970,1490],[1200,1850],[2050,810]], tanks: [[950,1060],[1420,800],[1830,1080],[1520,1670]] },
    { name: 'Embassy City', text: 'Rescue the inspection team. Knock out the power and command sites before extraction.', radars: [[980,560],[1860,500]], targets:[[1910,1330,'command'],[1170,1190,'power'],[1980,1850,'power'],[1340,670,'command']], camps: [[680,920],[1470,520],[2060,1030],[1720,1720],[990,1470]], tanks: [[1090,870],[1570,770],[1770,1090],[1440,1480],[2030,1650]] },
    { name: 'Nuclear Storm', text: 'Destroy the missile sites and nuclear facilities. Recover the final evacuation team.', radars: [[1150,1630],[1700,630]], targets:[[1940,1020,'plant'],[1230,810,'plant'],[2040,1710,'scud'],[1580,1390,'scud'],[2130,510,'command']], camps:[[810,1220],[1490,650],[2040,1330],[1730,1910],[1040,480],[2160,710]], tanks:[[1020,1110],[1450,1100],[1800,800],[2030,1520],[1390,1840],[2050,460]] },
  ];
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function createGame(level = 0, difficulty = 'standard', controls = 'above') {
    level = clamp(Math.floor(level) || 0, 0, missions.length - 1);
    const m = missions[level];
    const entity = (p, kind, id) => ({ x: p[0], y: p[1], kind, id, hp: kind === 'tank' ? 140 : 230, maxHp: kind === 'tank' ? 140 : 230, cooldown: 1.5 + id * .21 });
    return { level, difficulty, controls, status: 'playing', time: 0, score: 0, lives: 3, invulnerable: 0, base: { x: 200, y: 1920 },
      player: { x: 200, y: 1920, vx: 0, vy: 0, angle: -Math.PI / 2, armor: 600, fuel: 100, ammo: 1178, rockets: 38, hellfires: 8, crew: 0, gunCd: 0, rocketCd: 0, hellfireCd: 0 },
      enemies: [...m.radars.map((p, i) => entity(p, 'radar', i)), ...m.targets.map((p,i)=>entity(p,p[2],i+m.radars.length)), ...m.tanks.map((p, i) => entity(p, 'tank', i + m.radars.length + m.targets.length))],
      people: m.camps.flatMap(([x, y], i) => [{ x: x - 18, y, id: i * 2, rescued: false }, { x: x + 18, y: y + 20, id: i * 2 + 1, rescued: false }]),
      supplies: [[790,1810,'fuel'],[1510,940,'ammo'],[1960,1990,'repair'],[1030,960,'fuel'],[1990,760,'fuel'],[1150,450,'ammo'],[1530,1730,'ammo'],[700,740,'repair'],[2080,1480,'fuel']].map(([x,y,kind])=>({x,y,kind,used:false})),
      bullets: [], effects: [], delivered: 0, winch: 0, service: 0, targetId: null, message: 'Destroy the priority sites. Hover over crew and crates to winch them aboard.', messageTime: 7, events: [] };
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
    const nearest = g.enemies.filter(e => e.hp > 0 && distance(p, e) < 490).sort((a, b) => distance(p, a) - distance(p, b))[0];
    g.targetId = nearest ? nearest.id : null;
    if (g.controls !== 'above') { /* Classic flight keeps aircraft heading under the pilot's control. */ }
    else if (Number.isFinite(input.aimX) && Number.isFinite(input.aimY)) p.angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    else if (nearest) p.angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    else if (Math.hypot(p.vx, p.vy) > 20) p.angle = Math.atan2(p.vy, p.vx);
    p.gunCd -= dt; p.rocketCd -= dt; p.hellfireCd -= dt;
    function fire(rocket, hellfire = false) {
      const v = rocket ? 600 : 830;
      g.bullets.push({ x: p.x + Math.cos(p.angle) * 28, y: p.y + Math.sin(p.angle) * 28, vx: Math.cos(p.angle) * v, vy: Math.sin(p.angle) * v, life: 1, damage: hellfire ? 230 : rocket ? 85 : 14, enemy: false, rocket, homing: hellfire ? g.targetId : null });
      g.events.push(rocket ? 'rocket' : 'gun');
    }
    if (input.fire && p.gunCd <= 0 && p.ammo > 0) { fire(false); p.ammo--; p.gunCd = .105; }
    if (input.rocket && p.rocketCd <= 0 && p.rockets > 0) { fire(true); p.rockets--; p.rocketCd = .5; }
    if (input.hellfire && p.hellfireCd <= 0 && p.hellfires > 0) { fire(true, true); p.hellfires--; p.hellfireCd = .8; }
    const atBase = distance(p, g.base) < 85;
    p.fuel = Math.max(0, p.fuel - dt * (g.difficulty === 'story' ? .20 : .29));
    if (atBase && Math.hypot(p.vx, p.vy) < 45) {
      if (g.difficulty === 'story') { p.fuel = Math.min(100, p.fuel + dt * 22); p.armor = Math.min(600, p.armor + dt * 90); }
      g.service += dt;
      if (g.service >= .8) { if (g.difficulty === 'story') { p.ammo = 1178; p.rockets = 38; p.hellfires = 8; } if (p.crew) { g.delivered += p.crew; g.score += p.crew * 500; p.armor = Math.min(600, p.armor + p.crew * (g.level === 0 ? 150 : 100)); p.crew = 0; g.events.push('rescue'); message(g, 'Crew safe. Rescue delivery restored armor. Collect crates for fuel and ammunition.'); } }
    } else g.service = 0;
    if (Math.hypot(p.vx, p.vy) < (input.winch ? 80 : 35)) {
      const person = g.people.find(h => !h.rescued && distance(h, p) < 75);
      const supply = g.supplies.find(s => !s.used && distance(s, p) < 75);
      if (person && p.crew < 6) {
        g.winch += dt;
        if (g.winch >= 1.1) { person.rescued = true; p.crew++; g.winch = 0; g.score += 150; g.events.push('rescue'); message(g, p.crew === 6 ? 'Cabin full. Return to base to deliver the crew.' : 'Crew aboard. Hover to winch the next survivor.'); }
      } else if (supply) {
        g.winch += dt;
        if (g.winch >= .7) { supply.used = true; g.winch = 0; if (supply.kind === 'fuel') p.fuel = 100; if (supply.kind === 'ammo') { p.ammo = 1178; p.rockets = 38; p.hellfires = 8; } if (supply.kind === 'repair') p.armor = 600; g.events.push('rescue'); message(g, 'Supplies recovered.'); }
      } else { g.winch = 0; if (person && p.crew >= 6) message(g, 'Cabin full. Deliver your crew at base first.', 1); }
    } else g.winch = 0;
    for (const e of g.enemies) {
      if (e.hp <= 0) continue;
      e.cooldown -= dt;
      if (['tank','scud'].includes(e.kind) && e.cooldown <= 0 && distance(p, e) < 450 && !atBase) {
        const a = Math.atan2(p.y - e.y, p.x - e.x), v = e.kind === 'radar' ? 180 : 210;
        g.bullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 3, enemy: true, damage: g.difficulty === 'story' ? 18 : 40 });
        e.cooldown = e.kind === 'radar' ? 2.5 : 1.8;
      }
    }
    for (const b of g.bullets) {
      if (b.homing !== null && b.homing !== undefined) { const target = g.enemies.find(e=>e.id===b.homing&&e.hp>0); if(target){const a=Math.atan2(target.y-b.y,target.x-b.x);b.vx=Math.cos(a)*600;b.vy=Math.sin(a)*600;} }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.enemy && distance(b, p) < 24 && !atBase && !g.invulnerable) { p.armor = Math.max(0, p.armor - b.damage); b.life = 0; burst(g, p.x, p.y, 'hit'); }
      if (!b.enemy) {
        const e = g.enemies.find(e => e.hp > 0 && distance(e, b) < (e.kind === 'tank' ? 33 : 43));
        if (e) { e.hp -= b.damage; b.life = 0; burst(g, b.x, b.y, e.hp <= 0 ? 'explosion' : 'spark'); if (e.hp <= 0) { g.score += e.kind === 'radar' ? 1000 : 350; if (e.kind === 'radar') message(g, 'Radar disabled. Continue the operation.'); } }
      }
    }
    g.bullets = g.bullets.filter(b => b.life > 0);
    g.effects.forEach(e => e.life -= dt); g.effects = g.effects.filter(e => e.life > 0);
    if (p.armor <= 0 || p.fuel <= 0) { g.lives--; if(g.lives <= 0){g.status = 'lost'; message(g, 'All three aircraft lost. Retry the campaign.', 99);} else { const empty=p.fuel<=0; p.x=g.base.x;p.y=g.base.y;p.vx=0;p.vy=0;p.armor=600;p.fuel=empty?100:Math.max(25,p.fuel);g.invulnerable=3;g.bullets=[];message(g, `Aircraft replaced. ${g.lives} lives remain.`,5); } }
    else if (g.enemies.filter(e => e.kind !== 'tank').every(e => e.hp <= 0) && g.delivered === g.people.length && atBase) { g.status = 'won'; g.score += Math.max(0, 3000 - Math.floor(g.time * 3)); message(g, 'All objectives complete. Everyone is home.', 99); }
    else if (p.fuel < 14 && g.messageTime <= 0) message(g, 'Low fuel. Recover a fuel crate.', 4);
  }
  const api = { SIZE, missions, createGame, update, distance };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DesertSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
