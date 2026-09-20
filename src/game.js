(() => {
  'use strict';
  const { createGame, update, missions, distance, objective: nextObjective } = DesertSim;
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d'), mini = $('minimap').getContext('2d'), large = $('map-large').getContext('2d');
  const atlas = new Image();
  const assets = window.GULF_ASSETS || {};
  atlas.src = assets.sprites || 'assets/sprites.png';
  let pulse = {};
  let g = createGame(), mode = 'briefing', ready = false, mapOpen = false, keys = {}, held = {}, mouse = null, firing = false;
  let w = 1000, h = 700, zoom = .8, camera = { x: 0, y: 0 }, last = performance.now(), sound = false, audio, rotor, rotorGain, hudTime = 0;
  let best = 0; try { best = Number(localStorage.getItem('desert-strike-best')) || 0; } catch {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() { const r = canvas.getBoundingClientRect(), dpr = .5; w = r.width; h = r.height; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false; zoom = w / (w < 600 ? 340 : 480); }
  new ResizeObserver(resize).observe(canvas);
  function initAudio() {
    if (!audio) { audio = new (window.AudioContext || window.webkitAudioContext)(); rotor = audio.createOscillator(); rotorGain = audio.createGain(); rotor.type = 'sawtooth'; rotor.frequency.value = 33; rotorGain.gain.value = 0; rotor.connect(rotorGain).connect(audio.destination); rotor.start(); }
    audio.resume().catch(() => {});
  }
  function beep(kind) {
    if (!sound || !audio) return;
    const o = audio.createOscillator(), a = audio.createGain(); o.connect(a).connect(audio.destination);
    const now = audio.currentTime, f = { gun: 120, rocket: 90, explosion: 50, hit: 65, spark: 170, rescue: 650 }[kind] || 220;
    o.type = kind === 'rescue' ? 'sine' : 'square'; o.frequency.setValueAtTime(f, now); o.frequency.exponentialRampToValueAtTime(kind === 'rescue' ? 1000 : 25, now + .17); a.gain.setValueAtTime(kind === 'gun' ? .016 : .035, now); a.gain.exponentialRampToValueAtTime(.001, now + .18); o.start(); o.stop(now + .2);
  }
  function setMode(next) {
    mode = next; keys = {}; held = {}; pulse = {}; firing = false;
    $('overlay').hidden = next === 'playing'; $('pause').textContent = next === 'paused' ? 'Resume' : 'Pause';
    $('setup').hidden = next !== 'briefing'; $('retry').hidden = !['paused', 'lost', 'won'].includes(next);
    if (next === 'paused') { $('overlay-kicker').textContent = 'FLIGHT PAUSED'; $('overlay-title').textContent = 'Holding position.'; $('overlay-copy').textContent = 'Your aircraft is safe. Resume when you are ready.'; $('launch').textContent = 'Resume flight'; }
    if (next === 'won' || next === 'lost') {
      $('overlay-kicker').textContent = next === 'won' ? 'OPERATION COMPLETE' : 'OPERATION FAILED';
      $('overlay-title').textContent = next === 'won' ? 'Operation accomplished.' : 'Operation failed.';
      $('overlay-copy').textContent = next === 'won' ? `${g.tasks.length} missions completed. ${g.delivered} personnel safe. Score ${g.score.toLocaleString()}. ${g.level === 3 ? 'All four campaigns are available from the flight briefing.' : 'Your next operation is ready.'}` : g.message;
      $('launch').textContent = next === 'won' ? (g.level < 3 ? 'Next operation' : 'Back to briefing') : 'Retry operation';
      $('retry').textContent = 'Back to briefing';
      if (next === 'won') { best = Math.max(best, g.score); try { localStorage.setItem('desert-strike-best', String(best)); } catch {} }
    }
    if (next === 'briefing') { $('overlay-kicker').textContent = 'FLIGHT BRIEFING'; $('overlay-title').innerHTML = 'Bring everyone<br>home.'; $('overlay-copy').textContent = 'Follow the mission briefing. Capture intelligence, protect rescues, manage supplies, and return to the frigate.'; $('launch').textContent = ready ? 'Launch operation' : 'Loading flight deck…'; }
    if (next === 'playing') canvas.focus({ preventScroll: true });
  }
  function start(level = Number($('mission').value)) { g = createGame(level, $('difficulty').value, $('controls').value); $('mission').value = String(level); mapOpen = false; $('big-map').hidden = true; mouse = null; setMode('playing'); refreshHUD(); }
  function pause() { if (mode === 'playing') setMode('paused'); else if (mode === 'paused') setMode('playing'); }
  function toggleMap() { if (!['playing', 'paused'].includes(mode)) return; mapOpen = !mapOpen; $('big-map').hidden = !mapOpen; if (mapOpen) { keys = {}; held = {}; pulse = {}; firing = false; drawMap(large); } }
  $('launch').onclick = () => { if (!ready) return; if (sound) initAudio(); if (mode === 'paused') setMode('playing'); else if (mode === 'won' && g.level < 3) start(g.level + 1); else if (mode === 'won') setMode('briefing'); else if (mode === 'lost') start(g.level); else start(); };
  $('retry').onclick = () => { if (mode === 'paused') start(g.level); else { g = createGame(Number($('mission').value)); setMode('briefing'); refreshHUD(); } };
  $('pause').onclick = pause; $('map-toggle').onclick = toggleMap; $('close-map').onclick = toggleMap;
  $('sound').onclick = () => { try { initAudio(); sound = !sound; $('sound').textContent = sound ? 'Sound on' : 'Sound off'; $('sound').setAttribute('aria-pressed', String(sound)); } catch { $('sound').textContent = 'Sound unavailable'; } };
  $('mission').onchange = () => { g = createGame(Number($('mission').value), $('difficulty').value); refreshHUD(); };
  window.addEventListener('keydown', e => {
    if (e.target instanceof HTMLSelectElement) return;
    const key = e.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
    if (!e.repeat) {
      if (key === ' ' || key === 'k') pulse.rocket = true;
      if (key === 'l') pulse.hellfire = true;
      if (key === 'p' || key === 'escape') { if (mapOpen) toggleMap(); else pause(); }
      if (key === 'm') toggleMap();
      if (key === 'enter' && mode !== 'playing' && !['BUTTON', 'SELECT'].includes(e.target.tagName)) $('launch').click();
    }
    keys[key] = true;
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', () => { if (mode === 'playing') setMode('paused'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') setMode('paused'); });
  canvas.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || mode !== 'playing') return; firing = true; canvas.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', () => { firing = false; });
  canvas.addEventListener('pointerleave', () => { mouse = null; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  for (const b of document.querySelectorAll('[data-hold]')) {
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); held[b.dataset.hold] = true; mouse = null; });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(event, () => held[b.dataset.hold] = false);
  }
  function input() { return { left: keys.a || keys.arrowleft || held.left, right: keys.d || keys.arrowright || held.right, up: keys.w || keys.arrowup || held.up, down: keys.s || keys.arrowdown || held.down, fire: firing || keys.j || held.fire, rocket: keys[' '] || keys.k || held.rocket || pulse.rocket, hellfire: keys.l || held.hellfire || pulse.hellfire, winch: keys.e || held.winch, strafe: keys.shift, ...((mouse && !keys.j && !held.fire) ? { aimX: mouse.x / zoom + camera.x, aimY: mouse.y / zoom + camera.y } : {}) }; }
  function sprite(index, x, y, width, height = width, angle = 0, alpha = 1) {
    if (!atlas.complete || !atlas.naturalWidth) return;
    width*=.45;height*=.45;
    // Atlas frames follow the individual transparent sprite bounds.
    const frames = [[55,105,230,400],[345,202,266,266],[670,105,207,360],[940,230,300,240],[99,600,151,191],[358,625,220,166],[621,535,299,310],[925,545,325,287],[0,837,333,366],[334,848,283,340],[616,842,310,355],[927,827,324,378]];
    const [fx,fy,fw,fh] = frames[index], scale = atlas.naturalWidth / 1254;
    const fit = Math.min(width / fw, height / fh), dw = fw * fit, dh = fh * fit;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    ctx.drawImage(atlas, fx * scale, fy * scale, fw * scale, fh * scale, -dw / 2, -dh / 2, dw, dh); ctx.restore();
  }
  function label(text, x, y, color = '#fff0c9') { ctx.font = '7px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#142019da'; const size = ctx.measureText(text).width; ctx.fillRect(x - size / 2 - 3, y - 6, size + 6, 10); ctx.fillStyle = color; ctx.fillText(text, x, y + 1); }
  function ring(x, y, radius, color) { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); }
  function draw() {
    const p = g.player;
    camera.x = Math.max(0, Math.min(g.world.width - w / zoom, p.x - w / zoom / 2)); camera.y = Math.max(0, Math.min(g.world.height - h / zoom, p.y - h / zoom / 2));
    ctx.clearRect(0, 0, w, h); ctx.save(); ctx.scale(zoom, zoom); ctx.translate(-camera.x, -camera.y);
    drawGround(ctx);
    for(const o of g.scenery){sprite(8,o.x,o.y,90);}
    sprite(10, g.base.x, g.base.y, 320); ring(g.base.x, g.base.y, 42, '#c5dfb377'); label('FRIGATE / DROP-OFF', g.base.x, g.base.y + 60, '#ceebbb');
    for (const s of g.supplies) if (!s.used&&!s.hidden) { sprite(5, s.x, s.y, 72); label(s.kind.toUpperCase(), s.x, s.y + 23, '#c7e8b2'); }
    for (const zone of [...g.zones, ...(g.oilZone?[g.oilZone]:[]), ...(g.flags.agentEntered?[]:g.agentZone?[g.agentZone]:[]), ...(g.embassy?[g.embassy]:[]), ...(g.palaceZone&&!g.flags.palaceEntered?[g.palaceZone]:[])]) {
      if ((zone.kind==='agent' && !g.enemies.some(e=>e.group==='agent'&&!e.hidden&&e.hp<=0)) || (zone.kind==='palace' && g.stage<6)) continue;
      ring(zone.x,zone.y,42,'#abc98c');sprite(3,zone.x,zone.y,100);label(zone.label,zone.x,zone.y+35,'#d1e8ac');
    }
    for (const person of g.people) if (DesertCampaigns.waiting(person)) {
      sprite(4,person.x,person.y,32,44);
      if(distance(p,person)<100)label(person.role.toUpperCase(),person.x,person.y+18,'#f4dd8b');
      if(person.expires)label(Math.max(0,Math.ceil(person.expires-g.time))+'s',person.x,person.y-20,'#ffad77');
    }
    if(g.bus){prop('bus',g.bus.x,g.bus.y,g.bus);label(g.bus.arrived?'OFFICIALS SAFE':'BUS: 12 OFFICIALS',g.bus.x,g.bus.y+56);}
    for(const tank of g.oilTanks||[]){prop('oil',tank.x,tank.y,tank);label('OIL '+Math.max(0,Math.ceil(tank.hp)),tank.x,tank.y+60);}
    for (const e of g.enemies) {
      if(e.hidden)continue;
      const icon = (e.weapon==='chopper'?0:e.weapon==='speedboat'?10:['ak47','aphid'].includes(e.weapon)?4:undefined) ?? {radar:1,tank:2,power:6,airfield:7,command:8,scud:9,plant:11,prison:8,bunker:8,chemical:6,palace:8,tower:1,cache:8}[e.kind];
      if(icon===undefined){prop(e.kind,e.x,e.y,e);if(e.hp>0)label(e.civilian?'CIVILIAN':e.kind.toUpperCase(),e.x,e.y+40,e.civilian?'#b6dca0':'#ffd9b0');if(e.deadline&&e.hp>0)label(Math.ceil(e.deadline-g.time)+'s TO LAUNCH',e.x,e.y-40,'#ff8664');continue;}
      if (e.hp <= 0) { ctx.save(); ctx.filter = 'grayscale(1) brightness(.4)'; sprite(icon, e.x, e.y, e.kind !== 'tank' ? 155 : 98, undefined, 0, .6); ctx.restore(); continue; }
      sprite(icon, e.x, e.y, e.kind !== 'tank' ? 155 : 98, undefined, e.kind === 'tank' ? (e.heading||0) + Math.PI / 2 : 0);
      label((e.weapon||e.kind).toUpperCase(),e.x,e.y+39,'#ffd9b0');
      if(e.deadline)label(Math.ceil(e.deadline-g.time)+'s TO LAUNCH',e.x,e.y-40,'#ff8664');
      if (g.targetId === e.id) { const r = e.kind !== 'tank' ? 28 : 19; ctx.strokeStyle = '#d35939'; ctx.lineWidth = 2; for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { ctx.beginPath(); ctx.moveTo(e.x + sx * (r - 10), e.y + sy * r); ctx.lineTo(e.x + sx * r, e.y + sy * r); ctx.lineTo(e.x + sx * r, e.y + sy * (r - 10)); ctx.stroke(); } }
      if (e.hp < e.maxHp) { ctx.fillStyle = '#271e19'; ctx.fillRect(e.x - 16, e.y - 33, 32, 4); ctx.fillStyle = '#f4a34e'; ctx.fillRect(e.x - 16, e.y - 33, 32 * Math.max(0, e.hp) / e.maxHp, 4); }
    }
    for (const b of g.bullets) { ctx.strokeStyle = b.enemy ? '#ff6042' : '#fff4ae'; ctx.lineWidth = b.rocket ? 2 : 1; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .024, b.y - b.vy * .024); ctx.stroke(); }
    for (const e of g.effects) { const a = e.life / e.maxLife; ctx.fillStyle = `rgba(255,${Math.round(100 + a * 140)},54,${a})`; ctx.beginPath(); ctx.arc(e.x, e.y, (1 - a) * (e.kind === 'explosion' ? 30 : 10) + 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.translate(p.x + 10, p.y + 15); ctx.rotate(p.angle + Math.PI / 2); ctx.fillStyle = '#1b291d45'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const bob = reduced ? 0 : Math.sin(g.time * 3) * 2;
    if (g.winch > 0) { ctx.strokeStyle = '#f5df9b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - 10); ctx.lineTo(p.x, p.y + 40); ctx.stroke(); ring(p.x, p.y, 45, '#f5c27a'); ctx.strokeStyle = '#fff3ce'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 45, -Math.PI / 2, -Math.PI / 2 + g.winch / 1.1 * Math.PI * 2); ctx.stroke(); }
    sprite(0, p.x, p.y - 8 + bob, 135, 155, p.angle + Math.PI / 2);
    ctx.save(); ctx.translate(p.x, p.y - 10 + bob); ctx.rotate(reduced ? .5 : g.time * 39); ctx.strokeStyle = '#172119c9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.moveTo(0, -26); ctx.lineTo(0, 26); ctx.stroke(); ctx.restore();
    // Direction marker keeps the next objective discoverable when it is offscreen.
    const objective = nextObjective(g);
    ctx.restore();
    if (mode === 'playing' && objective) { const ox = (objective.x - camera.x) * zoom, oy = (objective.y - camera.y) * zoom; if (ox < 25 || ox > w - 25 || oy < 25 || oy > h - 25) { const a = Math.atan2(oy - h / 2, ox - w / 2), x = Math.max(30, Math.min(w - 30, ox)), y = Math.max(50, Math.min(h - 70, oy)); ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.fillStyle = '#fff0c8'; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(-8,-7); ctx.lineTo(-8,7); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  }
  // Small mission-specific props use the same restricted desert palette as the sprite atlas.
  function prop(kind,x,y,e={}) {
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(.45,.45);if(e.hp<=0){ctx.globalAlpha=.45;ctx.filter='grayscale(1) brightness(.5)';}
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
    if(kind==='bus'||kind==='truck') {
      rect(-53,-22,106,49,'#332c25');rect(-49,-27,98,42,kind==='bus'?'#c4a44d':'#6b7560');rect(-43,-31,84,9,'#e3c275');
      for(let i=-40;i<40;i+=17)rect(i,-17,12,15,'#405b63');rect(-38,15,18,12,'#232a28');rect(26,15,18,12,'#232a28');
      if(kind==='truck'){rect(-50,-25,58,34,'#b4b5a0');for(let i=-45;i<0;i+=16){rect(i,-20,9,25,'#d9d2ae');rect(i,-9,9,5,e.civilian?'#6c8852':'#b04837');}}
    } else if(kind==='bomber'||kind==='jet') {
      const z=kind==='bomber'?1.8:.7;ctx.scale(z,z);rect(-10,-58,20,116,'#c7c6af');rect(-5,-70,10,18,'#dedcca');
      rect(-62,-5,124,15,'#9d9e8c');rect(-44,-14,88,16,'#b9bba5');rect(-30,42,60,10,'#9d9e8c');rect(-6,-43,12,15,'#3b5660');
      rect(-33,-16,10,32,'#676d64');rect(23,-16,10,32,'#676d64');
    } else if(kind==='yacht') {
      rect(-70,-36,140,68,'#5a706e');rect(-62,-44,124,74,'#d8d8c2');rect(-49,-24,98,45,'#a69771');rect(-40,-36,65,42,'#eeeecc');for(let i=-32;i<20;i+=16)rect(i,-27,10,12,'#456c76');
    } else if(kind==='pipe') {
      rect(-15,-18,100,35,'#6d6c58');rect(-12,-18,100,8,'#b7ab83');rect(-24,-24,24,48,'#353c35');rect(-23,-14,14,28,e.hp>0?'#151f1c':'#a4926b');
      if(e.hp>0)rect(-65,-12,40,35,'#182b27');
    } else if(kind==='oil') {
      rect(-52,-20,104,66,'#6d7060');rect(-52,-28,104,14,'#a0a18b');rect(-39,-36,78,14,'#c0bfa1');rect(-52,28,104,8,'#3a443b');
    } else if(kind==='gate') {
      rect(-64,-28,8,65,'#575446');rect(56,-28,8,65,'#575446');rect(-58,-20,116,12,'#c4ad73');rect(-58,9,116,9,'#c4ad73');
    } else { rect(-49,-13,98,40,'#ad9460');rect(-37,-25,74,19,'#c8af73');if(kind==='silo'){rect(-30,-18,60,38,'#424c45');rect(-12,-21,24,35,'#e3dbb3');rect(-12,-10,24,6,'#ac503b');} }
    ctx.restore();
  }
  let ground=null,groundLevel=-1;
  function buildGround(){
    const m=g.world;ground=document.createElement('canvas');ground.width=m.width/2;ground.height=m.height/2;
    const c=ground.getContext('2d');c.scale(.5,.5);c.fillStyle=m.color;c.fillRect(0,0,m.width,m.height);
    let seed=71+g.level;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<85000;i++){const x=Math.floor(rand()*m.width/3)*3,y=Math.floor(rand()*m.height/3)*3;c.fillStyle=i%2?'#251a1321':'#ffe8a01d';c.fillRect(x,y,3,2);}
    c.fillStyle=m.water;c.beginPath();c.moveTo(0,0);for(const [x,y]of m.coast)c.lineTo(x,y);c.lineTo(0,m.height);c.closePath();c.fill();
    c.strokeStyle=g.level===3?'#8c784b':'#d7bb75';c.lineWidth=27;c.beginPath();m.coast.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
    for(let i=0;i<15000;i++){const x=rand()*m.width,y=rand()*m.height;if(DesertReference.water(g,x,y)){c.fillStyle=i%2?'#74b7ae55':'#092e4b33';c.fillRect(x,y,5,2);}}
    c.strokeStyle=g.level===3?'#302a43':'#594626';c.lineWidth=11;
    for(const road of m.roads){c.beginPath();road.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
    if(g.level===3){c.strokeStyle='#272638';c.lineWidth=54;c.beginPath();c.moveTo(0,160);c.lineTo(2150,1235);c.stroke();c.setLineDash([24,36]);c.strokeStyle='#a6a0a466';c.lineWidth=2;c.stroke();}
    groundLevel=g.level;
  }
  function drawGround(c){if(!ground||groundLevel!==g.level)buildGround();c.drawImage(ground,0,0,g.world.width,g.world.height);}
  function drawMap(c){
    const size=c.canvas.width,scale=size/g.world.width,offset=(size-g.world.height*scale)/2;
    c.fillStyle='#112c23';c.fillRect(0,0,size,size);c.save();c.translate(0,offset);
    if(!ground||groundLevel!==g.level)buildGround();c.globalAlpha=.6;c.drawImage(ground,0,0,size,g.world.height*scale);c.globalAlpha=1;
    const dot=(o,color,r=3)=>{c.fillStyle=color;c.beginPath();c.arc(o.x*scale,o.y*scale,r,0,Math.PI*2);c.fill();};
    g.enemies.filter(e=>e.hp>0&&!e.hidden&&!e.cache).forEach(e=>dot(e,e.civilian?'#a5ce86':e.deadline&&Math.floor(g.time*4)%2?'#fff2b5':'#ff7654',e.weapon?2:3));
    g.people.filter(DesertCampaigns.waiting).forEach(e=>dot(e,'#ffb44e',2));g.supplies.filter(e=>!e.used&&!e.hidden).forEach(e=>dot(e,'#a3c58c',2));
    for(const z of [g.base,...g.zones,...(g.oilZone?[g.oilZone]:[])]){dot(z,'#e4ead1',4);c.fillStyle='#e4ead1';c.font='10px monospace';c.fillText(z===g.base?'H':'L',z.x*scale+5,z.y*scale);}
    if(g.bus?.active)dot(g.bus,'#f1d663',4);
    const t=nextObjective(g);if(t){c.strokeStyle='#ffdd76';c.lineWidth=1;c.strokeRect(t.x*scale-5,t.y*scale-5,10,10);}
    dot(g.player,'#d2ff99',3);c.strokeStyle='#dbe9c96a';c.strokeRect(camera.x*scale,camera.y*scale,w/zoom*scale,h/zoom*scale);c.restore();
  }
  function refreshHUD() {
    const p = g.player, done=g.tasks.filter(t=>t.done).length, current=g.tasks[g.stage];
    $('op-number').textContent=`OPERATION 0${g.level+1}`; $('mission-name').textContent=missions[g.level].name;
    $('mission-copy').textContent=missions[g.level].text;
    $('current-mission').textContent=current?`Mission ${g.stage+1}: ${current.title}`:'Return to the frigate';
    $('mission-hint').textContent=current?current.hint:'Hover over the frigate to complete the campaign.';
    $('mission-list').replaceChildren(...g.tasks.map((t,i)=>{const li=document.createElement('li');li.textContent=g.level===3&&i>Math.max(1,g.stage)?'Awaiting orders':t.title;li.className=t.done?'complete':i===g.stage?'active':'';return li;}));
    $('radar-count').textContent=`${done}/${g.tasks.length}`; $('crew-count').textContent=String(g.delivered);
    $('radar-objective').classList.toggle('complete',done===g.tasks.length);$('crew-objective').classList.toggle('complete',g.status==='won');$('base-objective').classList.toggle('complete',g.status==='won');
    for(const key of ['fuel','armor','rockets','hellfires']) { $(key).value=p[key]; $(key+'-value').textContent=Math.ceil(p[key]); }
    $('cabin').value=p.crew;$('cabin-value').textContent=`${p.crew}/6`;$('ammo-value').textContent=p.ammo;
    $('lives').textContent=`LIVES ${g.lives}`; $('score').textContent=String(g.score).padStart(6,'0');$('clock').textContent=`${String(Math.floor(g.time/60)).padStart(2,'0')}:${String(Math.floor(g.time%60)).padStart(2,'0')}`;
    $('radio').textContent=mode==='playing' && g.messageTime>0 ? g.message : '';
    drawMap(mini); if(mapOpen) drawMap(large);
  }
  function frame(now) {
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(mode==='playing'&&!mapOpen) { update(g,input(),dt);pulse={};g.events.forEach(beep);if(g.status!=='playing')setMode(g.status); }
    if(rotorGain)rotorGain.gain.setTargetAtTime(sound&&mode==='playing'&&!mapOpen?.009:0,audio.currentTime,.08);
    draw();hudTime+=dt;if(hudTime>.1){refreshHUD();hudTime=0;}requestAnimationFrame(frame);
  }
  atlas.decode().then(()=>{ready=true;$('launch').disabled=false;$('launch').textContent='Launch operation';refreshHUD();}).catch(()=>{$('overlay-copy').textContent='The flight artwork could not load. Reload the page, or extract the complete download before opening index.html.';$('launch').textContent='Artwork unavailable';});
  resize();refreshHUD();requestAnimationFrame(frame);
})();
