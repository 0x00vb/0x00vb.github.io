import rough from 'roughjs/bundled/rough.cjs.js';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supported=new Set(['rectangle','ellipse','line','arrow','text']);

export function renderDiagram(scene) {
  if(scene.type!=='excalidraw' || !Array.isArray(scene.elements))throw new Error('Invalid Excalidraw scene');
  const elements=scene.elements.filter(element=>!element.isDeleted);
  if(!elements.length)throw new Error('Excalidraw scene has no visible elements');
  const generator=rough.generator();
  const shapes=[];
  const bounds=[];
  for(const element of elements) {
    if(!supported.has(element.type))throw new Error(`Unsupported Excalidraw element: ${element.type}`);
    if(!['x','y','width','height'].every(key=>Number.isFinite(element[key])) || element.width<0 || element.height<0)throw new Error(`Invalid geometry for ${element.id}`);
    const {x,y,width,height}=element;
    const angle=element.angle||0;
    const cx=x+width/2,cy=y+height/2;
    const rotate=([px,py])=>[cx+(px-cx)*Math.cos(angle)-(py-cy)*Math.sin(angle),cy+(px-cx)*Math.sin(angle)+(py-cy)*Math.cos(angle)];
    const options={seed:element.seed||42,roughness:element.roughness??1,stroke:element.strokeColor||'#45414f',strokeWidth:element.strokeWidth??1.5,fill:element.backgroundColor==='transparent'?undefined:element.backgroundColor,fillStyle:element.fillStyle||'solid'};
    const paths=[];
    if(element.type==='text') {
      if(typeof element.text!=='string' || !(element.fontSize>0))throw new Error(`Invalid text for ${element.id}`);
      const lines=element.text.split('\n');
      const lineHeight=element.fontSize*(element.lineHeight||1.25);
      const align=element.textAlign||'left';
      const tx=align==='center'?x+width/2:align==='right'?x+width:x;
      const anchor=align==='center'?'middle':align==='right'?'end':'start';
      const family=element.fontFamily===3?'ui-monospace,monospace':'ui-sans-serif,system-ui,sans-serif';
      paths.push(`<text x="${tx}" y="${y+element.fontSize}" text-anchor="${anchor}" font-family="${family}" font-size="${element.fontSize}" fill="${escape(options.stroke)}">${lines.map((line,index)=>`<tspan x="${tx}" dy="${index?lineHeight:0}">${escape(line)}</tspan>`).join('')}</text>`);
      bounds.push(...[[x,y],[x+width,y],[x,y+Math.max(height,lines.length*lineHeight)],[x+width,y+Math.max(height,lines.length*lineHeight)]].map(rotate));
    } else {
      let shape;
      if(element.type==='rectangle')shape=generator.rectangle(x,y,width,height,options);
      else if(element.type==='ellipse')shape=generator.ellipse(cx,cy,width,height,options);
      else {
        if(!Array.isArray(element.points) || element.points.length<2 || element.points.some(point=>!Array.isArray(point) || point.length!==2 || !point.every(Number.isFinite)))throw new Error(`Invalid points for ${element.id}`);
        const points=element.points.map(([px,py])=>[x+px,y+py]);
        shape=generator.linearPath(points,options);
        bounds.push(...points.map(rotate));
        const head=(tip,previous)=>{
          const direction=Math.atan2(tip[1]-previous[1],tip[0]-previous[0]);
          const size=12;
          const wings=[direction-.45,direction+.45].map(a=>[tip[0]-Math.cos(a)*size,tip[1]-Math.sin(a)*size]);
          return generator.linearPath([wings[0],tip,wings[1]],{...options,fill:undefined});
        };
        if(element.type==='arrow') {
          if(element.endArrowhead==='arrow')paths.push(...generator.toPaths(head(points.at(-1),points.at(-2))));
          if(element.startArrowhead==='arrow')paths.push(...generator.toPaths(head(points[0],points[1])));
        }
      }
      paths.push(...generator.toPaths(shape));
      if(element.type==='rectangle' || element.type==='ellipse')bounds.push(...[[x,y],[x+width,y],[x,y+height],[x+width,y+height]].map(rotate));
    }
    const body=paths.map(part=>typeof part==='string'?part:`<path d="${escape(part.d)}" fill="${escape(part.fill||'none')}" stroke="${escape(part.stroke||'none')}" stroke-width="${part.strokeWidth}"/>`).join('');
    const transform=angle?` transform="rotate(${angle*180/Math.PI} ${cx} ${cy})"`:'';
    shapes.push(`<g opacity="${(element.opacity??100)/100}"${transform}>${body}</g>`);
  }
  const pad=24;
  const minX=Math.min(...bounds.map(p=>p[0]))-pad,minY=Math.min(...bounds.map(p=>p[1]))-pad;
  const width=Math.max(...bounds.map(p=>p[0]))-minX+pad,height=Math.max(...bounds.map(p=>p[1]))-minY+pad;
  const title=scene.appState?.name||'Technical diagram';
  const background=scene.appState?.viewBackgroundColor||'#fbfaf8';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${escape(background)}"/>${shapes.join('')}</svg>`;
}
