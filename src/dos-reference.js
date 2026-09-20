(function(root){
  'use strict';
  const data=typeof module!=='undefined'&&module.exports?require('./dos-data.js'):root.DesertDOS;
  // Use decoded object anchors and building artwork. Unmapped scripts, scenery collisions,
  // patrol paths and concealed-pickup triggers remain reconstruction choices.
  function apply(g,configureEnemy){
    const buildings=data.levels[g.level],units=data.units[g.level],bound=new Set(),moved=new Set();
    function bind(e,o){
      const dx=o.x-e.x,dy=o.y-e.y;
      for(const guard of g.enemies.filter(v=>v.weapon&&!moved.has(v)&&Math.hypot(v.x-e.x,v.y-e.y)<165)){
        guard.x+=dx;guard.y+=dy;guard.homeX=guard.x;guard.homeY=guard.y;moved.add(guard);
      }
      Object.assign(e,{x:o.x,y:o.y,hp:o.hp,maxHp:o.hp,dosArtwork:o});bound.add(o);
    }
    function group(groupName,records){
      const entities=g.enemies.filter(e=>e.group===groupName);
      entities.forEach((e,i)=>{if(records[i])bind(e,records[i]);});
    }
    const find=(name,hp)=>buildings.filter(o=>o.name===name&&(hp===undefined||o.hp===hp));
    group('power',find('SUBSTATI'));
    group(g.level===2?'ambassador':'commands',find(g.level===1?'NMEHQ':'COMMAND'));
    group(g.level===2?'optional-radar':g.level===3?'nuclear-radar':'radars',units.filter(u=>u.type===46790));
    if(g.level===0)for(const kind of ['jet','tower','airfield']){
      const records=find({jet:'MIG23',tower:'TOWER',airfield:'HANGAR'}[kind]);
      g.enemies.filter(e=>e.group==='airfields'&&e.kind===kind).forEach((e,i)=>bind(e,records[i]));
      for(const guard of g.enemies.filter(e=>e.weapon&&['airfields','commands'].some(gr=>g.enemies.some(t=>t.group===gr&&Math.hypot(t.x-e.x,t.y-e.y)<170))))guard.alertGroup='power';
    }
    if(g.level===1){
      group('jails',find('JAIL'));group('pow',find('POW'));
      // The DOS chemical-production objective is one plant, not three identical placeholders.
      const plant=g.enemies.find(e=>e.group==='chemical');g.enemies=g.enemies.filter(e=>e.group!=='chemical'||e===plant);bind(plant,find('CHEMICAL')[0]);
      g.enemies.filter(e=>e.group==='scuds').forEach((e,i)=>{const c=g.enemies.filter(t=>t.group==='commands')[i];e.x=c.x+240;e.y=Math.max(100,c.y-120);});
    }
    if(g.level===2){
      group('bio',buildings.filter(o=>['BABYFOOD','FACTORYX'].includes(o.name)));
      group('yacht',find('YACHT'));
      const embassy=find('EMBASSY')[0];Object.assign(g.embassy,{x:embassy.x,y:embassy.y+65});
    }
    if(g.level===3){
      group('shelters',find('SHELTERS',200));
      group('nuclear',[...find('NUKEBLDG',500),...find('NUKETOWR',500)]);
      group('palace',find('VILLAS',1000));
      const palace=g.enemies.find(e=>e.group==='palace');Object.assign(g.palaceZone,{x:palace.x,y:palace.y+85});
      Object.assign(g.enemies.find(e=>e.kind==='atv'),{x:palace.x,y:palace.y+150});
      const annex=find('NUKEBLDG',100)[0];if(annex){const e={kind:'plant',group:'nuclear',hidden:true,collisionRadius:20};g.enemies.push(e);bind(e,annex);}
      for(const e of g.enemies.filter(e=>e.kind==='truck'))e.hp=e.maxHp=100;
    }
    if(g.level===4){
      function add(o,kind,groupName){const e={kind,group:groupName,hidden:true,collisionRadius:20};g.enemies.push(e);bind(e,o);return e;}
      find('HANGAR').forEach(o=>add(o,'airfield','airfields'));find('TOWER').forEach(o=>add(o,'tower','airfields'));
      find('FACTORYX').forEach(o=>add(o,'factory','superguns'));
      group('official',buildings.filter(o=>o.x===3465&&o.y===2703));group('palace',find('VILLAS',1000));group('general-yacht',find('YACHT'));
      units.filter(u=>u.type===46790).forEach((o,i)=>{
        const groupName=[0,3].includes(i)?'supergun-radar':[1,2].includes(i)?'airfield-radar':'optional-radar';
        const e={x:o.x,y:o.y,kind:'radar',group:groupName,hp:100,maxHp:100,collisionRadius:20,hidden:false};g.enemies.push(e);
      });
      // Defenders use DOS starting anchors. Scripted reinforcements and patrols are not decoded.
      const weaponTypes={51788:'aaa',51854:'rapier',51978:'m48',52044:'zsu',52168:'crotale'};
      for(const u of units){
        // High-bit records participate in scripts that are not yet decoded; do not
        // assume they are additional active defenders at the start of the campaign.
        if(!weaponTypes[u.type]||(u.flags&0x8200))continue;
        const e={x:u.x,y:u.y,kind:'tank',group:'defense',cooldown:2};configureEnemy(e,weaponTypes[u.type]);
        if(u.x<3100&&u.y<1250){e.alertGroup='supergun-radar';e.hidden=true;e.revealWith='superguns';}
        else if(u.x>3700&&u.y<1300){e.alertGroup='airfield-radar';e.hidden=true;e.revealWith='airfields';}
        else if(Math.hypot(u.x-2290,u.y-1802)<340){e.group='palace-defense';e.alertGroup='power';e.hidden=true;e.revealWith='palace';}
        g.enemies.push(e);
      }
      g.supplies.push({x:3450,y:2812,kind:'cash',hidden:true,used:false});
    }
    const spawn=units.find(u=>u.type===51714);Object.assign(g.base,{x:spawn.x,y:spawn.y});Object.assign(g.player,{x:spawn.x,y:spawn.y});
    const ship=find('FRIGATE')[0];if(ship){bound.add(ship);g.dosShip=ship;}
    // Restore the DOS supply count and coordinates; hiding/exposure is still reconstructed.
    g.supplies=g.supplies.filter(s=>!['fuel','ammo','repair'].includes(s.kind));
    g.enemies=g.enemies.filter(e=>!e.cache);
    const supplyKinds={46540:'fuel',46590:'ammo',46640:'repair'};
    for(const u of units)if(supplyKinds[u.type])g.supplies.push({x:u.x,y:u.y,kind:supplyKinds[u.type],used:false,hidden:!!(u.flags&512)});
    g.supplies.forEach((s,i)=>{
      s.id=i;if(!s.hidden||s.kind==='cash')return;
      const b=buildings.filter(o=>o.hp>0&&o.hp<10000&&!['PWIRES','PWPOLES','FENCE','ROADS','FRIGATE'].includes(o.name)&&Math.hypot(o.x-s.x,o.y-s.y)<90).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];
      let cover=b&&g.enemies.find(e=>e.dosArtwork===b);
      if(!cover){cover={x:b?.x??s.x,y:b?.y??s.y,kind:'cache',group:'optional-cache',cache:s.kind,supplyId:i,hp:b?.hp||45,maxHp:b?.hp||45,collisionRadius:16};g.enemies.push(cover);if(b){cover.dosArtwork=b;bound.add(b);}}
      (cover.revealsSupplies||=[]).push(i);s.cover=cover;
    });
    g.enemies.forEach((e,i)=>{e.id=i;if(e.dosArtwork&&!e.dosArtwork.rect)delete e.dosArtwork;});
    for(const s of g.supplies)if(s.cover){s.coverId=s.cover.id;delete s.cover;}
    g.dosBackdrop=buildings.filter(o=>!bound.has(o));
    g.scenery=[];
  }
  const api={apply};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DesertDOSReference=api;
})(globalThis);
