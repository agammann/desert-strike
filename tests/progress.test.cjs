const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/progress.js');
function storage(initial={}) {
  const values={...initial};
  return {values,getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=v;}};
}
const progress={schemaVersion:1,checkpoint:{level:3,score:12000},best:12678,jakeUnlocked:true};
test('one-record progress save and complete backup round trip',()=>{
  const s=storage();P.save(s,progress);assert.deepEqual(P.load(s).value,progress);
  assert.deepEqual(P.decode(JSON.stringify(progress)),progress);
  assert.deepEqual(Object.keys(s.values),[P.KEY]);
});
test('legacy next-operation checkpoint, Jake and best score remain compatible',()=>{
  const s=storage({'desert-strike-best':'12678','desert-strike-jake':'true','desert-strike-checkpoint':'{"level":3,"score":12000}'});
  assert.deepEqual(P.load(s).value,progress);assert.equal(Object.keys(s.values).length,3);
});
test('new progress record takes precedence without altering legacy bytes',()=>{
  const s=storage({[P.KEY]:JSON.stringify(progress),'desert-strike-checkpoint':'corrupt'});
  assert.deepEqual(P.load(s).value,progress);assert.equal(s.values['desert-strike-checkpoint'],'corrupt');
});
test('corrupt or inaccessible saved progress is reported and preserved',()=>{
  const s=storage({[P.KEY]:'not json'}),before={...s.values};
  assert.equal(P.load(s).status,'unavailable');assert.deepEqual(s.values,before);
  assert.equal(P.load({getItem(){throw Error('denied');}}).status,'unavailable');
});
test('invalid backups reject before an existing valid save can be changed',()=>{
  const s=storage({[P.KEY]:JSON.stringify(progress)}),before={...s.values};
  for(const value of [null,[],{...progress,schemaVersion:2},{...progress,best:Infinity},{...progress,best:-1},{...progress,jakeUnlocked:'true'},{...progress,extra:1},
      {...progress,checkpoint:{level:0,score:0}},{...progress,checkpoint:{level:5,score:0}},{...progress,checkpoint:{level:2,score:1999}},
      {...progress,checkpoint:{level:2,score:-1000}},{...progress,checkpoint:{level:2,score:1000,extra:1}}]){
    assert.throws(()=>P.save(s,value));assert.deepEqual(s.values,before);
  }
  assert.throws(()=>P.decode('{'));assert.throws(()=>P.decode(' '.repeat(P.MAX_BYTES+1)));
});
test('blocked writes preserve prior progress and do not silently pass',()=>{
  const s=storage({[P.KEY]:JSON.stringify(progress)}),before={...s.values};
  s.setItem=()=>{throw Error('quota');};assert.throws(()=>P.save(s,P.fresh()),/quota/);assert.deepEqual(s.values,before);
});
test('final campaign progress supports an empty checkpoint with the best score retained',()=>{
  const s=storage();const value={...progress,checkpoint:null};P.save(s,value);assert.deepEqual(P.load(s).value,value);
});
