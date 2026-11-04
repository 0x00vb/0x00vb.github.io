import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderDiagram} from '../scripts/diagrams.mjs';

const scene=elements=>({type:'excalidraw',elements,appState:{name:'Test diagram',viewBackgroundColor:'#fbfaf8'}});
const base={id:'item',x:0,y:0,width:100,height:50,angle:0,strokeColor:'#345678',backgroundColor:'transparent',seed:42};

test('diagram exports preserve source text, font size, color, and multiline layout',()=>{
  const svg=renderDiagram(scene([{...base,type:'text',text:'A < B\nnext line',fontSize:28,textAlign:'left'}]));
  assert.ok(svg.includes('A &lt; B'));
  assert.ok(svg.includes('next line'));
  assert.ok(svg.includes('font-size="28"'));
  assert.ok(svg.includes('fill="#345678"'));
  assert.equal((svg.match(/<tspan /g)||[]).length,2);
});

test('negative arrow coordinates and distant elements remain inside computed bounds',()=>{
  const svg=renderDiagram(scene([
    {...base,type:'arrow',points:[[0,0],[-200,0],[-200,300]],width:200,height:300,endArrowhead:'arrow'},
    {...base,id:'far',type:'rectangle',x:900,y:500,width:100,height:70}
  ]));
  const [x,y,w,h]=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  assert.ok(x< -200 && y<0);
  assert.ok(x+w>1000 && y+h>570);
  assert.ok((svg.match(/<path /g)||[]).length>=3);
});

test('unsupported elements and invalid geometry fail rather than silently dropping content',()=>{
  assert.throws(()=>renderDiagram(scene([{...base,type:'image'}])),/Unsupported/);
  assert.throws(()=>renderDiagram(scene([{...base,type:'rectangle',x:NaN}])),/Invalid geometry/);
  assert.throws(()=>renderDiagram(scene([])),/no visible elements/);
});

test('a negative-direction axis does not add a phantom rectangle below the drawing',()=>{
  const svg=renderDiagram(scene([{...base,type:'line',x:20,y:285,width:0,height:230,points:[[0,0],[0,-230]]}]));
  const bounds=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  assert.deepEqual(bounds,[-4,31,48,278]);
});
