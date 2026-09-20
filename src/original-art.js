(function(root){
  'use strict';
  // Unmodified DarkWolf sprite sheets. Frame rectangles omit the sheet's guide lines.
  const names=['apache','enemies','allies','other','people','buildings','structures','objectives','natural'];
  for(let i=0;i<25;i++)names.push('tile'+String(i).padStart(2,'0'));
  const images={};
  const ready=Promise.all(names.map(name=>{const image=new Image();images[name]=image;image.src=root.GULF_ASSETS?.[name]||`assets/original/${name.startsWith('tile')?'tiles/'+name.slice(4):name}.png`;return image.decode();}));
  function terrain(level){
    const layout=root.DesertTerrain[level],out=document.createElement('canvas');out.width=6144;out.height=layout.tiles.length*512;
    const c=out.getContext('2d'),palette=new Map(Object.entries(layout.palette).map(([key,rgb])=>{const [r,g,b]=key.split(',').map(Number);return [(r<<16)|(g<<8)|b,rgb];}));
    const tiles=Array.from({length:25},(_,i)=>{const tile=document.createElement('canvas');tile.width=tile.height=512;const t=tile.getContext('2d');t.drawImage(images['tile'+String(i).padStart(2,'0')],0,0);
      const pixels=t.getImageData(0,0,512,512),d=pixels.data;
      for(let p=0;p<d.length;p+=4){const rgb=palette.get((d[p]<<16)|(d[p+1]<<8)|d[p+2]);if(rgb){d[p]=rgb[0];d[p+1]=rgb[1];d[p+2]=rgb[2];}}
      t.putImageData(pixels,0,0);return tile;
    });
    layout.tiles.forEach((row,y)=>row.forEach((id,x)=>c.drawImage(tiles[id],x*512,y*512)));return out;
  }
  function frame(ctx,name,r,x,y,scale=1,flip=false){
    const image=images[name];if(!image?.naturalWidth)return;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(flip?-scale:scale,scale);
    ctx.drawImage(image,...r,-r[2]/2,-r[3]/2,r[2],r[3]);ctx.restore();
  }
  function apache(ctx,x,y,angle,time){
    const dir=((Math.round((Math.PI/2-angle)*12/Math.PI)%24)+24)%24;
    const col=dir<=12?dir:24-dir,row=Math.floor(time*18)%6+(dir>12?6:0);
    frame(ctx,'apache',[16+col*88,16+row*96,88,80],x,y,.9);
  }
  function person(ctx,x,y,time,role){
    const row=['civilian','hostage','inspector'].includes(role)?10:role==='copilot'?12:0;
    frame(ctx,'people',[16+(Math.floor(time*5)%4)*48,16+row*64,48,48],x,y,1.5);
  }
  function object(ctx,e,time){
    const kind=e.weapon||e.kind;let name='objectives',r,scale=1;
    const dir=((Math.round((Math.PI/2-(e.heading||0))*4/Math.PI)%8)+8)%8;
    const col=dir<=4?dir:8-dir,flip=dir>4;
    if(e.weapon){
      name='enemies';
      const vehicles={vda:[[16,80,80,80],[16,176,48,48],3],zsu:[[16,240,80,80],[16,336,80,80],3],m48:[[16,832,48,48],[272,832,48,48],3],crotale:[[512,80,48,80],[672,176,48,48],1]};
      if(vehicles[kind]){const [body,turret,steps]=vehicles[kind];frame(ctx,name,[body[0]+col*body[2],body[1],body[2],body[3]],e.x,e.y,1,flip);frame(ctx,name,[turret[0]+col*steps*turret[2],turret[1],turret[2],turret[3]],e.x,e.y-4,1,flip);return true;}
      const table={aaa:[16,16,48,48],rapier:[16,432,48,48],speedboat:[512,240,80,80],chopper:[16,896,80,80]};
      if(['ak47','aphid'].includes(kind)){person(ctx,e.x,e.y,time,'soldier');return true;}
      r=table[kind];if(r){r=[...r];r[0]+=col*r[2]*(kind==='aaa'||kind==='rapier'?3:1);scale=kind==='chopper'?.8:1;frame(ctx,name,r,e.x,e.y,scale,flip);return true;}
    }
    const table={radar:[16+(Math.floor(time*4)%7)*48,16,48,48],power:[16,128,144,128],airfield:[368,16,112,96],tower:[496,64,48,48],jet:[656,16,64,48],command:[16,272,96,80],chemical:[16,368,128,144],plant:[16,1152,176,128],palace:[544,960,176,144],bunker:[464,336,80,48],prison:[464,272,64,48],oil:[16,1056,112,96],pipe:[544,416,64,64]};
    r=table[kind];
    if(kind==='bomber'){name='enemies';r=[e.hp<e.maxHp?216:616,1088,200,144];scale=.85;}
    if(kind==='yacht'){name='enemies';r=e.hp>0?[16,1248,176,96]:[528,1280,240,128];}
    if(kind==='atv'){name='enemies';r=[512+col*48,80,48,80];}
    if(kind==='scud'){name='enemies';r=[16,496,80,80];}
    if(kind==='bus'){name='allies';r=[16+col*80,192,80,80];}
    if(kind==='truck'){name='other';r=[e.civilian?416:16,16,80,80];}
    if(kind==='cache'){name='structures';r=[176,256,64,48];}
    if(kind==='gate'){name='structures';r=[496,32,48,48];}
    if(!r)return false;
    if(['power','plant','palace','yacht','bomber','airfield','chemical','oil'].includes(kind))scale*=.65;
    frame(ctx,name,r,e.x,e.y,scale);return true;
  }
  root.DesertArt={ready,frame,apache,person,object,terrain};
})(globalThis);
