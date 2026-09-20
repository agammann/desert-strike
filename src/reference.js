(function(root){
  'use strict';
  // Armor, damage and cadence: EA Genesis manual, Weapons Appendix.
  // Range, travel speed, turret speed and alert multipliers are reconstruction estimates.
  const weapons={
    ak47:{armor:10,damage:5,interval:.5,speed:230,range:125,turn:2.5,mobile:0},
    aphid:{armor:25,damage:75,interval:3,speed:230,range:165,turn:1.2,mobile:0},
    aaa:{armor:50,damage:20,interval:.5,speed:230,range:145,turn:1.2,mobile:0},
    rapier:{armor:75,damage:100,interval:2.5,speed:230,range:180,turn:.75,mobile:0},
    vda:{armor:100,damage:25,interval:.33,speed:230,range:150,turn:1.6,mobile:32},
    zsu:{armor:150,damage:40,interval:.33,speed:290,range:170,turn:.85,mobile:18},
    speedboat:{armor:150,damage:50,interval:1.25,speed:290,range:180,turn:1.5,mobile:45},
    chopper:{armor:150,damage:100,interval:1.5,speed:290,range:175,turn:1.6,mobile:48},
    m48:{armor:200,damage:100,interval:2.5,speed:290,range:185,turn:.7,mobile:15},
    crotale:{armor:250,damage:150,interval:2,speed:130,range:200,turn:.65,mobile:14},
  };
  // Geometry is manually reconstructed from the DarkWolf Genesis map references.
  // Dimensions are verified. Coast/road vertices and landmark coordinates are approximate.
  const maps=[
    {width:6144,height:3072,base:[520,2048],color:'#b39857',water:'#176f83',
      coast:[[0,0],[280,100],[420,400],[620,640],[900,980],[1340,1200],[1600,1440],[1920,1800],[2360,2140],[2800,2460],[3200,2820],[3500,3072]],
      roads:[[[1160,580],[1800,260],[2280,500],[2820,260],[3330,500],[3860,260],[5390,1020],[6144,610]],[[1160,580],[1450,710],[1300,790],[1800,1030],[1670,1100],[2300,1420],[3090,1010],[4370,1650]],[[6144,610],[2690,2100],[2970,2240],[2760,2350],[3340,2640],[4030,2300],[4770,2650],[6144,1970]],[[2200,1600],[2490,1740],[2240,1870],[2670,2110]],[[3210,2630],[3590,2830],[3380,2940],[3860,3072]],[[3090,1010],[4350,1370],[4650,1510]]],
      zones:[[1720,950],[2840,2000],[4440,2670]],
      sites:{radars:[[1792,680],[2800,1720]],power:[[4320,700]],airfields:[[3320,736],[4920,2280]],commands:[[3840,1680],[3840,1920]],agent:[[5480,660]]},
      fuel:[[1280,600],[2380,1320],[3230,1200],[4110,1320],[5360,1430],[4890,2780]],ammo:[[1710,1100],[3720,1150],[4160,2420],[5640,2130]],repair:[[4320,780]],winch:[3560,980],life:[5620,150],
    },
    {width:6144,height:3584,base:[480,2670],color:'#9e8054',water:'#165f73',
      coast:[[0,400],[200,550],[440,950],[850,1230],[1110,1540],[1290,1950],[1770,2420],[2170,2610],[2510,3000],[2850,3190],[3140,3584]],
      roads:[[[1300,0],[2040,360],[2780,0]],[[1800,240],[2050,360],[1800,490],[2280,730],[2030,850],[2280,990],[2810,740],[3560,1100],[4110,1400],[6144,490]],[[1530,1130],[2280,1510],[2020,1640],[2040,1760],[5110,3430],[6144,2910]],[[2810,740],[2040,1140]],[[2810,1290],[3560,900],[4350,1290],[3590,1650],[2810,1290]],[[4360,1990],[5380,2490],[4620,2890],[4090,2630]],[[4610,600],[5120,360],[5620,610],[5130,850],[5620,1100],[6144,850]]],
      zones:[[1600,1220],[3990,900],[4380,2880]],
      sites:{radars:[[2200,480],[4200,1180],[5600,2470]],jails:[[2310,800],[3490,1320],[4880,2320]],power:[[5890,3240]],chemical:[[3830,190]],commands:[[1600,150],[2390,380],[4870,660],[5420,1940],[5030,3140],[3550,430]],pow:[[4610,2670]]},
      fuel:[[1890,800],[2450,1520],[3600,520],[4570,1550],[5300,2550],[4070,2800]],ammo:[[1770,500],[3320,1140],[4500,2310],[5790,3050],[4850,1030]],repair:[[2080,560],[4140,580],[4400,2970]],winch:[2000,640],life:[5590,120],
    },
    {width:6144,height:4096,base:[1280,3420],color:'#a68b24',water:'#136b79',
      coast:[[0,680],[220,900],[400,1170],[770,1480],[1220,1930],[1480,2330],[1810,2630],[2220,2970],[2550,3220],[2860,3650],[3140,4096]],
      roads:[[[250,250],[770,0],[2310,770],[5130,2180],[6150,1640]],[[1040,0],[250,380],[1800,1160],[5380,2950]],[[5130,0],[2300,1420],[4090,2310],[6150,1250]],[[5150,610],[2570,1910],[2300,1770],[4100,2650]],[[5380,1920],[3070,3050],[4570,3800]],[[3340,520],[4110,900],[3840,1040],[3090,640],[3340,520]],[[2810,1810],[3330,1560],[3850,1810],[3330,2080],[2810,1810]],[[3590,2680],[4100,2440],[4600,2680],[4110,2950],[3590,2680]]],
      zones:[[1770,1520],[3420,2530],[3270,3650]],
      sites:{bio:[[800,130],[1300,140],[800,400],[1300,410],[1280,660],[1800,670],[1280,930],[1800,920]],silos:[[1060,1660],[1530,2150],[2100,2730],[2920,3410]],power:[[5840,2240]],yacht:[[430,3880]],ambassador:[[4750,180],[4980,290],[4750,400],[4520,290]]},
      fuel:[[1130,1130],[2320,1560],[3780,1100],[4900,1660],[4330,2910],[3070,3220]],ammo:[[1700,1190],[2650,1320],[4160,1870],[3500,2800],[5500,1840]],repair:[[1340,1330],[2670,1580],[3700,1080],[4440,1550],[4930,2450],[2970,3370]],winch:[2050,360],life:[5570,2240],
    },
    {width:6144,height:4096,base:[1280,3420],color:'#55576d',water:'#124f66',
      coast:[[0,660],[240,870],[450,1260],[800,1540],[1080,1860],[1500,2180],[1740,2500],[2100,2840],[2450,3120],[2740,3570],[3080,3950],[3230,4096]],
      roads:[[[0,170],[2190,1250],[3370,650],[4360,1160],[3370,1670],[2170,1140]],[[2830,1040],[3070,930],[3590,1180],[3330,1310],[2830,1040]],[[3600,1430],[4860,770],[5480,1080]],[[4350,2310],[4820,2070],[5330,2330],[4850,2570],[4350,2310]],[[4870,2800],[5390,2530],[5900,2800],[5390,3050],[4870,2800]],[[4360,3340],[4870,3080],[5640,3460],[5140,3720],[4360,3340]],[[4380,2310],[6144,1470]]],
      zones:[[1600,1480],[3900,1670],[4600,3590]],
      sites:{pipes:[[710,1760],[2290,3270],[2790,3780]],shelters:[[1940,1730],[2320,290],[4320,1730],[5850,3780]],nuclear:[[5410,800],[5200,710],[5590,640]],power:[[3410,2750]],palace:[[3330,1240]],bomber:[[1220,760]]},
      fuel:[[2200,1320],[3740,1770],[4530,3000],[5200,3290],[3810,450],[1620,900]],ammo:[[2080,1600],[3460,2170],[4580,3450],[5310,1280],[1120,520],[1830,730]],repair:[[2230,1650],[3560,2820],[4700,2200],[5400,3370],[3850,1280]],winch:[2490,2050],life:[4680,3440],
    },
  ];
  function coastAt(map,y){const points=map.coast;if(y<=points[0][1])return points[0][0];for(let i=1;i<points.length;i++){const [x1,y1]=points[i-1],[x2,y2]=points[i];if(y<=y2)return x1+(x2-x1)*(y-y1)/(y2-y1);}return points.at(-1)[0];}
  function water(g,x,y){return x<coastAt(g.world,y);}
  function configureEnemy(e,type){const w=weapons[type];e.weapon=type;e.hp=w.armor;e.maxHp=w.armor;e.heading=Math.PI;e.homeX=e.x;e.homeY=e.y;return e;}
  function apply(g){
    g.world=maps[g.level];const m=g.world;
    Object.assign(g.base,{x:m.base[0],y:m.base[1]});Object.assign(g.player,{x:g.base.x,y:g.base.y});
    g.zones=m.zones.map(([x,y])=>({x,y,kind:'lz',label:'RESCUE LZ'}));
    // Place mission clusters using landmarks read from the reference. Fine placement is unverified.
    for(const [group,positions]of Object.entries(m.sites)){
      const entities=g.enemies.filter(e=>e.group===group);
      entities.forEach((e,i)=>{const cluster=group==='airfields'?Math.floor(i/4):group==='chemical'||group==='pow'?0:i;
        const [x,y]=positions[Math.min(cluster,positions.length-1)];e.x=x;e.y=y;
        if(group==='airfields'){const offsets=[[0,0],[130,65],[-100,85],[-15,125]];e.x+=offsets[i%4][0];e.y+=offsets[i%4][1];}
        if(group==='chemical'||group==='pow'){e.x+=(i%2)*150;e.y+=Math.floor(i/2)*120;}
      });
    }
    if(g.level===0){g.agentZone.x=5480;g.agentZone.y=745;}
    if(g.level===1)g.enemies.filter(e=>e.group==='scuds').forEach((e,i)=>{const q=g.enemies.filter(e=>e.group==='commands')[i];e.x=q.x+240;e.y=Math.max(100,q.y-120);});
    if(g.level===2){
      let n=0;g.people.filter(h=>h.role==='inspector').forEach(h=>{h.x=3440+(n++%3)*15;h.y=1760+Math.floor(n/3)*15;});
      [[640,1580],[760,2650],[2170,3330]].forEach(([x,y],i)=>{const h=g.people.filter(p=>p.role==='pilot')[i];h.x=x;h.y=y;});
      Object.assign(g.embassy,{x:4840,y:1770});Object.assign(g.bus,{x:4920,y:1840,path:[{x:5120,y:1940},{x:4860,y:2070},{x:4350,y:2330},{x:4100,y:2450},{x:4600,y:2700},{x:4870,y:2840}]});
      const route=g.enemies.filter(e=>e.group==='bus-route');[[5040,1900],[4740,2160],[4460,2590]].forEach(([x,y],i)=>Object.assign(route[i],{x,y}));
      const r=g.enemies.find(e=>e.group==='optional-radar');Object.assign(r,{x:4640,y:700});
    }
    if(g.level===3){
      g.people.filter(h=>h.role==='commando').forEach((h,i)=>Object.assign(h,{x:2340+i%3*18,y:1860+Math.floor(i/3)*18}));
      Object.assign(g.oilZone,{x:2870,y:2510});g.oilTanks=[{x:2770,y:2200,hp:600},{x:2820,y:2740,hp:600},{x:3340,y:3190,hp:600}];
      g.enemies.filter(e=>e.group==='oil-enemies').forEach((e,i)=>{e.x=g.oilTanks[i].x+160;e.y=g.oilTanks[i].y-100;});
      g.enemies.filter(e=>e.kind==='truck').forEach((e,i)=>Object.assign(e,{x:4740+(i%3)*210,y:2400+Math.floor(i/3)*380,homeX:4740+(i%3)*210,homeY:2400+Math.floor(i/3)*380}));
      Object.assign(g.palaceZone,{x:3330,y:1320});
    }
    // Replace the repeated full-service bundles with finite, scattered resources.
    g.supplies=[];for(const kind of ['fuel','ammo','repair'])for(const [x,y]of m[kind])g.supplies.push({x,y,kind,used:false});
    g.supplies.push({x:m.winch[0],y:m.winch[1],kind:'winch',used:false,hidden:true});
    g.supplies.push({x:m.life[0],y:m.life[1],kind:'life',used:false,hidden:true});
    // Optional MIAs supply armor through rescue, not through free repairs at every site.
    g.people=g.people.filter(p=>p.role!=='MIA');
    const miaCount=g.level===0?15:8;
    for(let i=0;i<miaCount;i++){const z=g.zones[i%g.zones.length];g.people.push({id:g.people.length,x:z.x+180+(i%3)*18,y:z.y+140+Math.floor(i/3)*25,role:'MIA',rescued:false,dead:false,delivered:false});}
    // Building resistance is calibrated separately from the documented weapon table.
    for(const e of g.enemies)if(e.kind!=='tank'){
      const hp={radar:200,power:450,airfield:195,tower:135,jet:24,command:300,prison:240,chemical:300,bunker:240,plant:500,palace:1000,bomber:3000,yacht:600,scud:200,dune:36,pipe:24,gate:80,truck:150}[e.kind]||e.hp;
      e.hp=e.maxHp=hp;e.collisionRadius=['jet','scud','truck','pipe','dune','bomber','yacht','gate'].includes(e.kind)?0:20;
    }
    const guards=g.enemies.filter(e=>e.kind==='tank');
    // Relocate old generic guards and give each its campaign-appropriate weapon.
    const important=g.enemies.filter(e=>!['tank','jet','tower','dune','truck'].includes(e.kind));
    guards.forEach((e,i)=>{if(!['oil-enemies','bus-route','inspectors-defense'].includes(e.group)){const s=important[i%important.length];e.x=s.x+100;e.y=s.y+100;}
      if(e.group==='inspectors-defense'){e.x=3550;e.y=1780;}
      configureEnemy(e,g.level===0?(i%2?'rapier':'aaa'):g.level===1?'zsu':g.level===2?'m48':'zsu');
      if(e.group==='bus-route')e.alertGroup='power';
    });
    const add=(site,type,dx,dy,alert)=>{
      const e={id:g.enemies.length,x:site.x+dx,y:site.y+dy,kind:'tank',group:'defense',cooldown:1,alertGroup:alert};configureEnemy(e,type);g.enemies.push(e);
    };
    for(const e of important){
      if(e.hidden||['scud','pipe','yacht','bomber'].includes(e.kind))continue;
      const alert=e.group==='radars'?null:e.group==='power'?'radars':['airfields','chemical','pow'].includes(e.group)?'power':null;
      if(g.level===0){if(e.kind==='radar'){add(e,'aaa',-90,40);add(e,'aaa',90,45);}else if(['airfield','command','power'].includes(e.kind)){add(e,'rapier',-110,60,alert);add(e,'aaa',90,100,alert);}}
      else if(g.level===1){add(e,e.kind==='radar'?'rapier':'zsu',-100,80,alert);if(e.kind==='prison')add(e,'aphid',70,65);}
      else if(g.level===2){add(e,e.kind==='chemical'?'vda':e.kind==='command'?'m48':'rapier',-100,70,e.group==='ambassador'?'optional-radar':null);}
    }
    if(g.level===2){for(const p of g.people.filter(h=>h.role==='pilot'))add(p,'speedboat',100,-60);const y=g.enemies.find(e=>e.kind==='yacht');add(y,'speedboat',120,-100,'power');add(y,'chopper',-100,-100,'power');}
    if(g.level===3){for(const site of g.enemies.filter(e=>['nuclear','palace','power','shelters'].includes(e.group))){add(site,site.group==='shelters'?'m48':'crotale',-110,75,site.group==='palace'?'power':null);g.enemies.at(-1).hidden=site.hidden;g.enemies.at(-1).revealWith=site.group;}}
    for(const s of g.supplies.filter(s=>s.hidden))g.enemies.push({id:g.enemies.length,x:s.x,y:s.y,kind:'cache',group:'optional-cache',cache:s.kind,hp:45,maxHp:45,collisionRadius:16});
    g.people.forEach((p,i)=>p.id=i);
    g.scenery=m.roads.flatMap((road,i)=>i%2?[]:road.slice(1,-1).filter((_,j)=>j%3===0).map(([x,y])=>({x:x+55,y:y-45,radius:18})));
  }
  const api={weapons,maps,water,coastAt,apply,configureEnemy};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.DesertReference=api;
})(typeof globalThis!=='undefined'?globalThis:this);
