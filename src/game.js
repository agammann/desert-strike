(() => {
  'use strict';
  const { createGame, update, missions, SIZE, distance } = DesertSim;
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d'), mini = $('minimap').getContext('2d'), large = $('map-large').getContext('2d');
  const terrain = new Image(), atlas = new Image();
  const assets = window.GULF_ASSETS || {};
  terrain.src = assets.terrain || 'assets/terrain.png'; atlas.src = assets.sprites || 'assets/sprites.png';
  let pulse = {};
  let g = createGame(), mode = 'briefing', ready = false, mapOpen = false, keys = {}, held = {}, mouse = null, firing = false;
  let w = 1000, h = 700, zoom = .8, camera = { x: 0, y: 0 }, last = performance.now(), sound = false, audio, rotor, rotorGain, hudTime = 0;
  let best = 0; try { best = Number(localStorage.getItem('desert-strike-best')) || 0; } catch {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() { const r = canvas.getBoundingClientRect(), dpr = .5; w = r.width; h = r.height; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false; zoom = w < 600 ? .65 : .83; }
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
      $('overlay-title').textContent = next === 'won' ? 'Everyone is home.' : 'Aircraft lost.';
      $('overlay-copy').textContent = next === 'won' ? `${g.delivered} crew delivered. Score ${g.score.toLocaleString()}. ${g.level === 3 ? 'All four campaigns are available from the flight briefing.' : 'Your next operation is ready.'}` : g.message;
      $('launch').textContent = next === 'won' ? (g.level < 3 ? 'Next operation' : 'Back to briefing') : 'Retry operation';
      $('retry').textContent = 'Back to briefing';
      if (next === 'won') { best = Math.max(best, g.score); try { localStorage.setItem('desert-strike-best', String(best)); } catch {} }
    }
    if (next === 'briefing') { $('overlay-kicker').textContent = 'FLIGHT BRIEFING'; $('overlay-title').innerHTML = 'Bring everyone<br>home.'; $('overlay-copy').textContent = 'Fly low. Silence the radar network. Winch the stranded crew aboard and return them safely to base.'; $('launch').textContent = ready ? 'Launch operation' : 'Loading flight deck…'; }
    if (next === 'playing') canvas.focus({ preventScroll: true });
  }
  function start(level = Number($('mission').value)) { g = createGame(level, $('difficulty').value, $('controls').value); $('mission').value = String(level); mapOpen = false; $('big-map').hidden = true; mouse = null; setMode('playing'); refreshHUD(); }
  function pause() { if (mode === 'playing') setMode('paused'); else if (mode === 'paused') setMode('playing'); }
  function toggleMap() { if (!['playing', 'paused'].includes(mode)) return; mapOpen = !mapOpen; $('big-map').hidden = !mapOpen; if (mapOpen) { keys = {}; held = {}; pulse = {}; firing = false; } }
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
  function input() { return { left: keys.a || keys.arrowleft || held.left, right: keys.d || keys.arrowright || held.right, up: keys.w || keys.arrowup || held.up, down: keys.s || keys.arrowdown || held.down, fire: firing || keys.j || held.fire, rocket: keys[' '] || keys.k || held.rocket || pulse.rocket, hellfire: keys.l || held.hellfire || pulse.hellfire, winch: keys.e || held.winch, ...((mouse && !keys.j && !held.fire) ? { aimX: mouse.x / zoom + camera.x, aimY: mouse.y / zoom + camera.y } : {}) }; }
  function sprite(index, x, y, width, height = width, angle = 0, alpha = 1) {
    if (!atlas.complete || !atlas.naturalWidth) return;
    // Atlas frames follow the individual transparent sprite bounds.
    const frames = [[55,105,230,400],[345,202,266,266],[670,105,207,360],[940,230,300,240],[99,600,151,191],[358,625,220,166],[621,535,299,310],[925,545,325,287],[0,837,333,366],[334,848,283,340],[616,842,310,355],[927,827,324,378]];
    const [fx,fy,fw,fh] = frames[index], scale = atlas.naturalWidth / 1254;
    const fit = Math.min(width / fw, height / fh), dw = fw * fit, dh = fh * fit;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    ctx.drawImage(atlas, fx * scale, fy * scale, fw * scale, fh * scale, -dw / 2, -dh / 2, dw, dh); ctx.restore();
  }
  function label(text, x, y, color = '#fff0c9') { ctx.font = '14px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#142019da'; const size = ctx.measureText(text).width; ctx.fillRect(x - size / 2 - 6, y - 11, size + 12, 18); ctx.fillStyle = color; ctx.fillText(text, x, y + 2); }
  function ring(x, y, radius, color) { ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); }
  function draw() {
    const p = g.player;
    camera.x = Math.max(0, Math.min(SIZE - w / zoom, p.x - w / zoom / 2)); camera.y = Math.max(0, Math.min(SIZE - h / zoom, p.y - h / zoom / 2));
    ctx.clearRect(0, 0, w, h); ctx.save(); ctx.scale(zoom, zoom); ctx.translate(-camera.x, -camera.y);
    if (terrain.complete && terrain.naturalWidth) ctx.drawImage(terrain, 0, 0, SIZE, SIZE); else { ctx.fillStyle = '#b69a62'; ctx.fillRect(0, 0, SIZE, SIZE); }
    sprite(10, g.base.x, g.base.y, 320); ring(g.base.x, g.base.y, 85, '#c5dfb377'); label('FRIGATE / DROP-OFF', g.base.x, g.base.y + 108, '#ceebbb');
    for (const s of g.supplies) if (!s.used) { sprite(5, s.x, s.y, 72); label(s.kind.toUpperCase(), s.x, s.y + 42, '#c7e8b2'); }
    for (let i = 0; i < g.people.length; i += 2) {
      const a = g.people[i], b = g.people[i + 1];
      if (!a.rescued || !b.rescued) { const x = (a.x + b.x) / 2; ring(x, a.y, 65, '#f8a14099'); label('HOVER / WINCH', x, a.y + 62); if (!reduced) { for (let n = 0; n < 5; n++) { const t = (g.time * .35 + n * .19) % 1; ctx.fillStyle = `rgba(224,105,35,${(1 - t) * .25})`; ctx.beginPath(); ctx.arc(x + 30 + t * 25, a.y - 30 - t * 85, 8 + t * 16, 0, Math.PI * 2); ctx.fill(); } } }
    }
    for (const person of g.people) if (!person.rescued) sprite(4, person.x, person.y, 39, 49);
    for (const e of g.enemies) {
      const icon = {radar:1,tank:2,power:6,airfield:7,command:8,scud:9,plant:11}[e.kind];
      if (e.hp <= 0) { ctx.save(); ctx.filter = 'grayscale(1) brightness(.4)'; sprite(icon, e.x, e.y, e.kind !== 'tank' ? 155 : 98, undefined, 0, .6); ctx.restore(); continue; }
      sprite(icon, e.x, e.y, e.kind !== 'tank' ? 155 : 98, undefined, e.kind === 'tank' ? Math.atan2(p.y - e.y, p.x - e.x) + Math.PI / 2 : 0);
      if (e.kind !== 'tank') label(e.kind.toUpperCase(), e.x, e.y + 79, '#ffd9b0');
      if (g.targetId === e.id) { const r = e.kind !== 'tank' ? 55 : 38; ctx.strokeStyle = '#d35939'; ctx.lineWidth = 2; for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { ctx.beginPath(); ctx.moveTo(e.x + sx * (r - 10), e.y + sy * r); ctx.lineTo(e.x + sx * r, e.y + sy * r); ctx.lineTo(e.x + sx * r, e.y + sy * (r - 10)); ctx.stroke(); } }
      if (e.hp < e.maxHp) { ctx.fillStyle = '#271e19'; ctx.fillRect(e.x - 25, e.y - 52, 50, 4); ctx.fillStyle = '#f4a34e'; ctx.fillRect(e.x - 25, e.y - 52, 50 * Math.max(0, e.hp) / e.maxHp, 4); }
    }
    for (const b of g.bullets) { ctx.strokeStyle = b.enemy ? '#ff6042' : '#fff4ae'; ctx.lineWidth = b.rocket ? 5 : 3; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .024, b.y - b.vy * .024); ctx.stroke(); }
    for (const e of g.effects) { const a = e.life / e.maxLife; ctx.fillStyle = `rgba(255,${Math.round(100 + a * 140)},54,${a})`; ctx.beginPath(); ctx.arc(e.x, e.y, (1 - a) * (e.kind === 'explosion' ? 65 : 24) + 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.translate(p.x + 22, p.y + 30); ctx.rotate(p.angle + Math.PI / 2); ctx.fillStyle = '#1b291d45'; ctx.beginPath(); ctx.ellipse(0, 0, 19, 45, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const bob = reduced ? 0 : Math.sin(g.time * 3) * 2;
    if (g.winch > 0) { ctx.strokeStyle = '#f5df9b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y - 10); ctx.lineTo(p.x, p.y + 40); ctx.stroke(); ring(p.x, p.y, 45, '#f5c27a'); ctx.strokeStyle = '#fff3ce'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 45, -Math.PI / 2, -Math.PI / 2 + g.winch / 1.1 * Math.PI * 2); ctx.stroke(); }
    sprite(0, p.x, p.y - 16 + bob, 135, 155, p.angle + Math.PI / 2);
    ctx.save(); ctx.translate(p.x, p.y - 21 + bob); ctx.rotate(reduced ? .5 : g.time * 39); ctx.strokeStyle = '#172119c9'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(58, 0); ctx.moveTo(0, -58); ctx.lineTo(0, 58); ctx.stroke(); ctx.restore();
    // Direction marker keeps the next objective discoverable when it is offscreen.
    const objective = p.crew === 6 || (g.delivered === g.people.length && g.enemies.filter(e => e.kind !== 'tank').every(e => e.hp <= 0)) ? g.base : g.enemies.filter(e => e.kind !== 'tank' && e.hp > 0).sort((a,b) => distance(p,a)-distance(p,b))[0] || g.people.find(e => !e.rescued) || g.base;
    ctx.restore();
    if (mode === 'playing' && objective) { const ox = (objective.x - camera.x) * zoom, oy = (objective.y - camera.y) * zoom; if (ox < 25 || ox > w - 25 || oy < 25 || oy > h - 25) { const a = Math.atan2(oy - h / 2, ox - w / 2), x = Math.max(30, Math.min(w - 30, ox)), y = Math.max(50, Math.min(h - 70, oy)); ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.fillStyle = '#fff0c8'; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(-8,-7); ctx.lineTo(-8,7); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  }
  function drawMap(c) {
    const size = c.canvas.width, scale = size / SIZE; c.fillStyle = '#112c23'; c.fillRect(0,0,size,size);
    if (terrain.complete && terrain.naturalWidth) { c.globalAlpha = .3; c.drawImage(terrain,0,0,size,size); c.globalAlpha = 1; c.fillStyle = '#063b2690'; c.fillRect(0,0,size,size); }
    c.strokeStyle = '#6e966433'; c.lineWidth = 1; for(let i=0;i<size;i+=size/12) { c.beginPath(); c.moveTo(i,0); c.lineTo(i,size); c.moveTo(0,i); c.lineTo(size,i); c.stroke(); }
    function dot(o,color,r=3) { c.fillStyle=color;c.beginPath();c.arc(o.x*scale,o.y*scale,r,0,Math.PI*2);c.fill(); }
    g.enemies.filter(e=>e.hp>0).forEach(e=>dot(e,e.kind!=='tank'?'#ff7654':'#be7560',e.kind!=='tank'?4:2));
    g.people.filter(e=>!e.rescued).forEach(e=>dot(e,'#ffb44e',3)); g.supplies.filter(e=>!e.used).forEach(e=>dot(e,'#a3c58c',2));
    c.strokeStyle='#e4ead1';c.strokeRect(g.base.x*scale-7,g.base.y*scale-7,14,14);c.fillStyle='#e4ead1';c.font='12px monospace';c.textAlign='center';c.fillText('H',g.base.x*scale,g.base.y*scale+4);
    c.save(); c.translate(g.player.x*scale,g.player.y*scale); c.rotate(g.player.angle); c.fillStyle='#c8fb8f'; c.beginPath();c.moveTo(7,0);c.lineTo(-5,-4);c.lineTo(-3,0);c.lineTo(-5,4);c.closePath();c.fill();c.restore();
    c.strokeStyle='#dbe9c96a';c.strokeRect(camera.x*scale,camera.y*scale,w/zoom*scale,h/zoom*scale);
  }
  function refreshHUD() {
    const p = g.player, radars = g.enemies.filter(e=>e.kind!=='tank'), destroyed=radars.filter(e=>e.hp<=0).length;
    $('op-number').textContent=`OPERATION 0${g.level+1}`; $('mission-name').textContent=missions[g.level].name;
    $('mission-copy').textContent=missions[g.level].text;
    $('radar-count').textContent=`${destroyed}/${radars.length}`; $('crew-count').textContent=`${g.delivered}/${g.people.length}`;
    $('radar-objective').classList.toggle('complete',destroyed===radars.length);$('crew-objective').classList.toggle('complete',g.delivered===g.people.length);$('base-objective').classList.toggle('complete',g.status==='won');
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
  Promise.all([terrain.decode(),atlas.decode()]).then(()=>{ready=true;$('launch').disabled=false;$('launch').textContent='Launch operation';refreshHUD();}).catch(()=>{$('overlay-copy').textContent='The flight artwork could not load. Reload the page, or extract the complete download before opening index.html.';$('launch').textContent='Artwork unavailable';});
  resize();refreshHUD();requestAnimationFrame(frame);
})();
