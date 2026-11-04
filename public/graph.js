import {createGraphDepth, projectPoint, unprojectPoint} from './graph-depth.js';

function spring(position, velocity, target, dt) {
  const omega = 12;
  const offset = position - target;
  const impulse = velocity + omega * offset;
  const decay = Math.exp(-omega * dt);
  return [target + (offset + impulse * dt) * decay, (velocity - omega * impulse * dt) * decay];
}

export function initGraph(graph, {select, highlight}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const points = [...graph.querySelectorAll('[data-concept]')].map((element, index) => ({
    element, id: element.dataset.concept, index,
    restX: Number(element.dataset.x), restY: Number(element.dataset.y),
    x: Number(element.dataset.x), y: Number(element.dataset.y), z: Math.sin(index*2.4)*55, vx: 0, vy: 0
  }));
  const byId = new Map(points.map(point => [point.id, point]));
  const edges = [...graph.querySelectorAll('[data-edge]')].map(element => ({element, points: element.dataset.edge.split(' ').map(id => byId.get(id))}));
  let gesture = null;
  let hovered = null;
  let keyboard = false;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let activeSince = performance.now();
  let scale = graph.getBoundingClientRect().width / 800;
  const suppressed = new WeakSet();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const camera = {x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0};
  let depth = null;
  depth = createGraphDepth(graph, edges, () => {paint();wake();});
  depth?.setEnabled(!reduced.matches && finePointer.matches);
  const project = point => depth?.active ? projectPoint(point,camera) : point;
  const unproject = (position,z) => depth?.active ? unprojectPoint(position,z,camera) : position;

  function paint() {
    for (const point of points) {
      const screen = project(point);
      point.element.style.transform = `translate(calc(-2.5px + ${(screen.x-point.restX)*scale}px), calc(-50% + ${(screen.y-point.restY)*scale}px))`;
    }
    for (const edge of edges) {
      const [a,b] = edge.points.map(project);
      edge.element.setAttribute('x1',a.x);
      edge.element.setAttribute('y1',a.y);
      edge.element.setAttribute('x2',b.x);
      edge.element.setAttribute('y2',b.y);
    }
    return depth?.draw(camera,keyboard || reduced.matches) || false;
  }
  function run(now) {
    frame = 0;
    if (reduced.matches || document.hidden || !visible || keyboard) {lastTime=0;return;}
    const dt = lastTime ? Math.min((now-lastTime)/1000, .032) : 1/60;
    lastTime = now;
    const age = (now-activeSince)/1000;
    const drift = Math.max(0,1-age/3);
    let moving = drift > 0;
    if (depth?.active && !hovered && !gesture) {
      [camera.x,camera.vx] = spring(camera.x,camera.vx,camera.targetX,dt);
      [camera.y,camera.vy] = spring(camera.y,camera.vy,camera.targetY,dt);
      moving ||= Math.abs(camera.x-camera.targetX)+Math.abs(camera.y-camera.targetY)+Math.abs(camera.vx)+Math.abs(camera.vy)>.00001;
    }
    for (const point of points) {
      if (gesture?.point === point || hovered === point) continue;
      let x = point.restX + Math.sin(age*1.4+point.index*.9)*4*drift;
      let y = point.restY + Math.cos(age*1.1+point.index*.7)*3*drift;
      if (hovered && edges.some(edge => edge.points.includes(hovered) && edge.points.includes(point))) {
        x += (hovered.x-point.restX)*.025;
        y += (hovered.y-point.restY)*.025;
      }
      [point.x,point.vx] = spring(point.x,point.vx,x,dt);
      [point.y,point.vy] = spring(point.y,point.vy,y,dt);
      moving ||= Math.abs(point.x-x)+Math.abs(point.y-y)+Math.abs(point.vx)+Math.abs(point.vy)>.03;
    }
    moving = paint() || moving;
    if (moving) frame=requestAnimationFrame(run); else lastTime=0;
  }
  function wake() {
    if (!frame && !reduced.matches && !document.hidden && visible && !keyboard) frame=requestAnimationFrame(run);
  }
  function stop() {cancelAnimationFrame(frame);frame=0;lastTime=0;}
  function enter(point,event) {
    if (gesture || event.pointerType === 'touch') return;
    keyboard = false;
    hovered=point;
    activeSince=performance.now();
    highlight(point.id);
    wake();
  }
  function leave(point) {
    if (gesture || hovered !== point) return;
    hovered=null;
    highlight('');
    wake();
  }
  function release(event,cancelled=false) {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const current=gesture;
    gesture=null;
    current.point.element.removeAttribute('data-dragging');
    if(current.moved) {
      suppressed.add(current.point.element);
      if(cancelled || performance.now()-current.sampleTime>80) current.point.vx=current.point.vy=0;
    }
    if(current.point.element.hasPointerCapture(event.pointerId)) current.point.element.releasePointerCapture(event.pointerId);
    hovered=null;
    highlight('');
    activeSince=performance.now();
    if(reduced.matches) {
      current.point.x=current.point.restX;current.point.y=current.point.restY;
      current.point.vx=current.point.vy=0;
      paint();
    } else wake();
  }
  for (const point of points) {
    const node=point.element;
    node.addEventListener('pointerenter',event=>enter(point,event));
    node.addEventListener('pointerleave',()=>leave(point));
    node.addEventListener('focus',()=>{
      if(document.documentElement.dataset.input!=='keyboard')return;
      keyboard=true;stop();highlight(point.id);
    });
    node.addEventListener('blur',()=>{highlight('');});
    node.addEventListener('click',event=>{
      if(event.detail && suppressed.has(node)){suppressed.delete(node);event.preventDefault();return;}
      suppressed.delete(node);
      select(point.id);
      paint();wake();
    });
    node.addEventListener('pointerdown',event=>{
      if(gesture || !event.isPrimary || event.button!==0)return;
      suppressed.delete(node);
      keyboard=false;
      scale=graph.getBoundingClientRect().width/800;
      gesture={point,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,screen:project(point),sampleTime:performance.now(),moved:false};
      point.vx=point.vy=0;
      node.setPointerCapture(event.pointerId);
    });
    node.addEventListener('pointermove',event=>{
      if(!gesture || gesture.point!==point || gesture.pointerId!==event.pointerId)return;
      const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
      if(!gesture.moved && Math.hypot(dx,dy)<6)return;
      gesture.moved=true;
      node.dataset.dragging='true';
      const soften=(value,min,max)=>value<min?min+(value-min)*.2:value>max?max+(value-max)*.2:value;
      const position=unproject({x:gesture.screen.x+dx/scale,y:gesture.screen.y+dy/scale},point.z);
      const x=soften(position.x,25,680),y=soften(position.y,25,535);
      const now=performance.now(),dt=Math.max((now-gesture.sampleTime)/1000,.008);
      point.vx=Math.max(-1200,Math.min(1200,(x-point.x)/dt));
      point.vy=Math.max(-1200,Math.min(1200,(y-point.y)/dt));
      point.x=x;point.y=y;
      gesture.sampleTime=now;
      hovered=point;
      highlight(point.id);
      paint();wake();
    });
    node.addEventListener('pointerup',event=>release(event));
    node.addEventListener('pointercancel',event=>release(event,true));
    node.addEventListener('lostpointercapture',event=>release(event,true));
  }
  new ResizeObserver(()=>{scale=graph.getBoundingClientRect().width/800;paint();}).observe(graph);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop();}).observe(graph);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else wake();});
  reduced.addEventListener('change',()=>{
    stop();
    depth?.setEnabled(!reduced.matches && finePointer.matches);
    if(reduced.matches){for(const point of points){point.x=point.restX;point.y=point.restY;point.vx=point.vy=0;}paint();}
    else wake();
  });
  graph.addEventListener('pointermove',event=>{
    if(!depth?.active || gesture || hovered || event.pointerType!=='mouse')return;
    const bounds=graph.getBoundingClientRect();
    const clamp=value=>Math.max(-1,Math.min(1,value));
    camera.targetX=clamp((event.clientX-bounds.left)/bounds.width*2-1)*.045;
    camera.targetY=clamp((event.clientY-bounds.top)/bounds.height*2-1)*.035;
    keyboard=false;wake();
  });
  graph.addEventListener('pointerleave',()=>{camera.targetX=camera.targetY=0;wake();});
  finePointer.addEventListener('change',()=>{depth?.setEnabled(!reduced.matches && finePointer.matches);paint();wake();});
  graph.addEventListener('graphhighlight',()=>{paint();wake();});
  graph.addEventListener('keydown',()=>{keyboard=true;stop();paint();});
  paint();wake();
}
