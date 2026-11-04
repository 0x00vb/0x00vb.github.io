export function projectPoint(point, camera) {
  const x = point.x - 400, y = point.y - 285;
  const cosY = Math.cos(camera.x), sinY = Math.sin(camera.x);
  const cosX = Math.cos(camera.y), sinX = Math.sin(camera.y);
  const rx = x * cosY + point.z * sinY;
  const rz = -x * sinY + point.z * cosY;
  const ry = y * cosX - rz * sinX;
  const depth = y * sinX + rz * cosX;
  const perspective = 1400 / (1400 - depth);
  return {x: rx * perspective + 400, y: ry * perspective + 285};
}

export function unprojectPoint(position, z, camera) {
  let x = position.x, y = position.y;
  for (let i = 0; i < 4; i++) {
    const current = projectPoint({x, y, z}, camera);
    const dx = projectPoint({x: x + 1, y, z}, camera);
    const dy = projectPoint({x, y: y + 1, z}, camera);
    const a = dx.x-current.x, b = dy.x-current.x;
    const c = dx.y-current.y, d = dy.y-current.y;
    const det = a*d-b*c;
    x += ((position.x-current.x)*d-b*(position.y-current.y))/det;
    y += (a*(position.y-current.y)-c*(position.x-current.x))/det;
  }
  return {x, y};
}

const vertexSource = `
attribute vec3 a_start;
attribute vec3 a_end;
attribute vec2 a_corner;
attribute vec4 a_color;
uniform vec2 u_camera;
uniform vec2 u_resolution;
uniform float u_dpr;
varying mediump vec4 v_color;
varying mediump float v_side;
vec3 project(vec3 position) {
  vec3 p = position - vec3(400.0, 285.0, 0.0);
  float cy=cos(u_camera.x), sy=sin(u_camera.x);
  float cx=cos(u_camera.y), sx=sin(u_camera.y);
  float x=p.x*cy+p.z*sy;
  float z=-p.x*sy+p.z*cy;
  float y=p.y*cx-z*sx;
  z=p.y*sx+z*cx;
  vec2 screen=vec2(x,y)*(1400.0/(1400.0-z))+vec2(400.0,285.0);
  return vec3(screen.x/400.0-1.0,1.0-screen.y/285.0,-z/1400.0);
}
void main() {
  vec3 start=project(a_start), end=project(a_end);
  vec3 p=mix(start,end,a_corner.x);
  vec2 direction=(end.xy-start.xy)*u_resolution;
  vec2 normal=vec2(-direction.y,direction.x)/max(length(direction),0.0001);
  vec2 offset=normal*a_corner.y*u_dpr*0.7*2.0/u_resolution;
  gl_Position=vec4(p.xy+offset,p.z,1.0);
  v_color=vec4(a_color.rgb,a_color.a*clamp(0.9-p.z*2.333,0.72,1.0));
  v_side=a_corner.y;
}`;
const fragmentSource = `
precision mediump float;
varying mediump vec4 v_color;
varying mediump float v_side;
void main() { gl_FragColor=vec4(v_color.rgb,v_color.a*(1.0-smoothstep(0.2,1.0,abs(v_side)))); }
`;

export function createGraphDepth(graph, edges, onChange) {
  const canvas = document.createElement('canvas');
  canvas.className = 'graph-depth';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {alpha: true, antialias: true, depth: false, premultipliedAlpha: false, powerPreference: 'low-power'});
  if (!gl) return null;
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) return null;
  probe.canvas.width = probe.canvas.height = 1;
  let resources = null;
  let enabled = true;
  let palette;
  let lastDraw = 0;
  const colors = edges.map(() => [0,0,0,0]);
  const corners = [[0,-1],[0,1],[1,1],[0,-1],[1,1],[1,-1]];
  const vertices = new Float32Array(edges.length * 6 * 12);
  function color(token) {
    probe.clearRect(0,0,1,1);
    probe.fillStyle = getComputedStyle(graph).getPropertyValue(token).trim();
    probe.fillRect(0,0,1,1);
    return [...probe.getImageData(0,0,1,1).data].slice(0,3).map(value => value/255);
  }
  function refreshPalette() {palette = {line: color('--line'), accent: color('--accent')};}
  function updateStatus() {graph.dataset.depth = resources && enabled ? 'webgl' : 'flat';}
  function initialize() {
    const shaders = [];
    for (const [type,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]) {
      const shader = gl.createShader(type);
      if (!shader) {shaders.forEach(item=>gl.deleteShader(item));return false;}
      shaders.push(shader);
      gl.shaderSource(shader,source);gl.compileShader(shader);
      if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
        console.warn('Graph depth shader unavailable:',gl.getShaderInfoLog(shader));
        shaders.forEach(item=>gl.deleteShader(item));
        return false;
      }
    }
    const program = gl.createProgram();
    if (!program) {shaders.forEach(item=>gl.deleteShader(item));return false;}
    shaders.forEach(shader=>gl.attachShader(program,shader));
    gl.linkProgram(program);
    shaders.forEach(shader=>gl.deleteShader(shader));
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
      console.warn('Graph depth program unavailable:',gl.getProgramInfoLog(program));
      gl.deleteProgram(program);return false;
    }
    const buffer=gl.createBuffer();
    if (!buffer) {gl.deleteProgram(program);return false;}
    resources={program,buffer,start:gl.getAttribLocation(program,'a_start'),end:gl.getAttribLocation(program,'a_end'),corner:gl.getAttribLocation(program,'a_corner'),color:gl.getAttribLocation(program,'a_color'),camera:gl.getUniformLocation(program,'u_camera'),resolution:gl.getUniformLocation(program,'u_resolution'),dpr:gl.getUniformLocation(program,'u_dpr')};
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    refreshPalette();updateStatus();
    return true;
  }
  if (!initialize()) return null;
  graph.prepend(canvas);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();resources=null;updateStatus();onChange();
  });
  canvas.addEventListener('webglcontextrestored',()=>{initialize();onChange();});
  document.addEventListener('themechange',()=>{refreshPalette();onChange();});
  return {
    get active() {return Boolean(resources && enabled);},
    setEnabled(value) {enabled=value;updateStatus();},
    draw(camera, instant=false) {
      if (!resources || !enabled) return false;
      const now=performance.now();
      const blend=instant?1:1-Math.exp(-Math.min(now-lastDraw,50)/65);
      lastDraw=now;
      let moving=false;
      edges.forEach((edge,index)=>{
        const active=edge.element.dataset.active==='true';
        const dimmed=edge.element.dataset.dimmed==='true';
        const rgb=active?palette.accent:palette.line;
        const target=[...rgb,dimmed?.15:active?.65:1];
        colors[index]=colors[index].map((value,i)=>{
          moving ||= Math.abs(target[i]-value)>.005;
          return value+(target[i]-value)*blend;
        });
        const [a,b]=edge.points;
        corners.forEach(([end,side],corner)=>{
          vertices.set([a.x,a.y,a.z,b.x,b.y,b.z,end,side,...colors[index]],(index*6+corner)*12);
        });
      });
      const dpr=Math.min(devicePixelRatio||1,2);
      const width=Math.round(graph.clientWidth*dpr),height=Math.round(graph.clientHeight*dpr);
      if(canvas.width!==width || canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(resources.program);gl.bindBuffer(gl.ARRAY_BUFFER,resources.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
      for(const [attribute,size,offset] of [[resources.start,3,0],[resources.end,3,12],[resources.corner,2,24],[resources.color,4,32]]) {
        gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,size,gl.FLOAT,false,48,offset);
      }
      gl.uniform2f(resources.camera,camera.x,camera.y);
      gl.uniform2f(resources.resolution,width,height);gl.uniform1f(resources.dpr,dpr);
      gl.drawArrays(gl.TRIANGLES,0,edges.length*6);
      return moving && !instant;
    }
  };
}
