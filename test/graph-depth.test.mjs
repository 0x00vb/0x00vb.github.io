import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGraphDepth,projectPoint,unprojectPoint} from '../public/graph-depth.js';

test('flat points retain exact screen positions at a neutral camera',()=>{
  for(const [x,y] of [[0,0],[400,285],[800,570]]) {
    assert.deepEqual(projectPoint({x,y,z:0},{x:0,y:0}),{x,y});
  }
});

test('dragging projected nodes maps back to the pointer at each depth and tilt',()=>{
  for(const camera of [{x:0,y:0},{x:.045,y:-.035},{x:-.045,y:.035}]) {
    for(const z of [-55,0,55]) {
      for(const position of [{x:100,y:80},{x:400,y:285},{x:700,y:500}]) {
        const world=unprojectPoint(position,z,camera);
        const screen=projectPoint({...world,z},camera);
        assert.ok(Math.abs(screen.x-position.x)<.0001);
        assert.ok(Math.abs(screen.y-position.y)<.0001);
      }
    }
  }
});

test('maximum pointer tilt stays within a few CSS pixels of neutral depth',()=>{
  for(const point of [{x:90,y:255,z:-55},{x:650,y:460,z:55},{x:380,y:55,z:30}]) {
    const start=projectPoint(point,{x:0,y:0});
    const end=projectPoint(point,{x:.045,y:.035});
    assert.ok(Math.hypot(end.x-start.x,end.y-start.y)*.45<5);
  }
});

test('unavailable WebGL leaves the original graph untouched',()=>{
  const original=globalThis.document;
  globalThis.document={createElement(){return {setAttribute(){},getContext(){return null;}};}};
  try {
    assert.equal(createGraphDepth({prepend(){assert.fail('Fallback must not replace the original graph');}},[],()=>assert.fail('No renderer is active')),null);
  } finally {
    if(original===undefined)delete globalThis.document;else globalThis.document=original;
  }
});
