function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Could not compile gallery shader.");
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Could not link gallery shader.");
  }
  return program;
}

function styleCanvas(canvas) {
  canvas.className = "nexus-gallery-background";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    zIndex: "0",
    width: "100vw",
    height: "100vh",
    display: "block",
    pointerEvents: "none",
    background: "radial-gradient(circle at 50% 35%, rgba(255,199,68,.42), transparent 32rem), linear-gradient(145deg,#180802,#7a3406 58%,#120703)"
  });
}

function createFallback(canvas) {
  canvas.classList.add("is-fallback");
  styleCanvas(canvas);
  return {
    canvas,
    stop() {},
    draw() {}
  };
}

export function startNexusGalleryShader(options = {}) {
  const documentRef = options.document ?? globalThis.document;
  if (!documentRef?.createElement) return null;

  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const canvas = options.canvas ?? documentRef.createElement("canvas");
  styleCanvas(canvas);
  if (!canvas.parentNode) (options.parent ?? documentRef.body).prepend(canvas);

  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power"
  });
  if (!gl) return createFallback(canvas);

  const vertex = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
  const fragment = `precision highp float;uniform vec2 r;uniform vec2 m;uniform float t;uniform float scroll;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);} 
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=mat2(1.62,1.17,-1.17,1.62)*p+vec2(4.1,2.7);a*=.52;}return v;}
    float spark(vec2 uv,float time,float scale,float size,float sparse,vec2 drift){vec2 p=uv*scale+drift*time;vec2 cell=floor(p);vec2 local=fract(p)-.5;float h=hash(cell);vec2 off=vec2(hash(cell+17.7),hash(cell+43.1))-.5;float d=length(local-off*.72);float keep=smoothstep(sparse,1.0,h);float core=smoothstep(size,0.0,d);float halo=smoothstep(size*5.2,0.0,d)*.16;float tw=.45+.55*sin(time*(.8+h*2.6)+h*6.2831);return (core+halo)*keep*tw;}
    void main(){
      vec2 uv=gl_FragCoord.xy/r;
      vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
      float time=t*.085;
      vec2 mouse=(m-.5)*vec2(r.x/r.y,1.0);
      vec2 q=p+vec2(sin(time+p.y*1.3),cos(time+p.x*1.1))*.07+vec2(0.,scroll*.00012);
      float molten=fbm(q*1.85+vec2(time*.62,-time*.37));
      float silk=fbm(q*6.4+molten*2.6-time*.22);
      float bands=smoothstep(.58,.06,abs(p.y+sin(p.x*2.6+time*1.8)*.14+silk*.12));
      float mouseGlow=1.0-smoothstep(.0,.74,length(p-mouse*.64));
      float sun=1.0-smoothstep(.05,.92,length(p-vec2(.42,.28)));
      float vign=smoothstep(1.35,.22,length(p*vec2(.86,1.08)));
      float dust=spark(uv,time,18.0,.024,.83,vec2(.018,.045))+spark(uv+silk*.025,time,32.0,.014,.9,vec2(-.012,.035));
      vec3 ember=vec3(.12,.038,.006);
      vec3 orange=vec3(.68,.22,.018);
      vec3 gold=vec3(.92,.52,.08);
      vec3 cream=vec3(1.0,.84,.42);
      vec3 col=mix(ember,orange,molten*.78);
      col=mix(col,gold,bands*.28+silk*.12);
      col+=cream*(mouseGlow*.16+sun*.08+dust*.22);
      col+=gold*pow(max(0.0,1.0-length(p-vec2(-.35,-.18))),3.0)*.08;
      col*=vign;
      col+=vec3(.02,.007,.003);
      gl_FragColor=vec4(col,1.0);
    }`;

  let stopped = false;
  const mouse = { x: 0.5, y: 0.5 };
  const program = createProgram(gl, vertex, fragment);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, "r");
  const time = gl.getUniformLocation(program, "t");
  const mouseUniform = gl.getUniformLocation(program, "m");
  const scrollUniform = gl.getUniformLocation(program, "scroll");

  function resize() {
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.floor(globalThis.innerWidth * dpr);
    const height = Math.floor(globalThis.innerHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function draw(now = 0) {
    if (stopped) return;
    resize();
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform2f(mouseUniform, mouse.x, mouse.y);
    gl.uniform1f(time, reducedMotion ? 0 : now * 0.001);
    gl.uniform1f(scrollUniform, globalThis.scrollY ?? 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (stopped) return;
    draw(now);
    if (!reducedMotion) globalThis.requestAnimationFrame(frame);
  }

  function onPointerMove(event) {
    mouse.x += ((event.clientX / Math.max(1, globalThis.innerWidth)) - mouse.x) * 0.35;
    mouse.y += (1 - (event.clientY / Math.max(1, globalThis.innerHeight)) - mouse.y) * 0.35;
  }

  function onContextLost(event) {
    event.preventDefault?.();
    stopped = true;
    canvas.classList.add("is-fallback");
    styleCanvas(canvas);
    globalThis.removeEventListener?.("pointermove", onPointerMove);
  }

  canvas.addEventListener("webglcontextlost", onContextLost, false);
  globalThis.addEventListener?.("resize", () => draw(performance.now()), { passive: true });
  globalThis.addEventListener?.("pointermove", onPointerMove, { passive: true });
  globalThis.requestAnimationFrame?.(frame);

  return {
    canvas,
    draw,
    stop() {
      stopped = true;
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      globalThis.removeEventListener?.("pointermove", onPointerMove);
      canvas.remove();
    }
  };
}
