const MAX_LIVE_CARD_SHADERS = 18;
let liveCardShaderCount = 0;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Could not compile card shader.");
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Could not link card shader.");
  }
  return program;
}

const VERTEX = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FRAGMENT = `precision highp float;varying vec2 v;uniform vec2 r;uniform vec2 m;uniform float t;uniform float h;uniform float seed;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed*19.17)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);} 
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.7,1.1,-1.1,1.7)*p+vec2(2.7,4.1);a*=.52;}return v;}
float spark(vec2 uv,float scale,float size,float sparse,float speed){vec2 p=uv*scale+vec2(t*.08*speed,-t*.035*speed);vec2 id=floor(p);vec2 f=fract(p)-.5;float keep=smoothstep(sparse,1.,hash(id));vec2 off=vec2(hash(id+13.2),hash(id+41.7))-.5;float d=length(f-off*.68);float core=smoothstep(size,0.,d);float halo=smoothstep(size*4.5,0.,d)*.18;float tw=.48+.52*sin(t*(1.4+hash(id)*2.2)+hash(id+9.)*6.283);return (core+halo)*keep*tw;}
void main(){vec2 uv=v;vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);vec2 mp=m;float hover=smoothstep(0.,1.,h);float flow=fbm(p*2.4+vec2(t*.045,-t*.025));float silk=fbm(p*8.0+flow*2.3+t*.03);float band=smoothstep(.66,.05,abs(p.y+sin(p.x*2.2+t*.23+seed)*.18));float sweep=smoothstep(.032,0.,abs(fract((uv.x+uv.y*.62+t*.08+seed*.13)*1.35)-.5))*(.22+.42*hover);float mouse=1.-smoothstep(0.,.62,distance(uv,mp));float rim=smoothstep(.015,.075,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));rim=1.-rim;float s=spark(uv+flow*.05,18.,.035,.72,1.0)+spark(uv+vec2(silk*.05,flow*.03),34.,.018,.82,1.5)+spark(uv,54.,.011,.91,2.1);
vec3 gold=vec3(1.0,.78,.18);vec3 cream=vec3(1.0,.93,.62);vec3 base=mix(vec3(.16,.07,.015),vec3(.72,.22,.02),flow*.72+band*.18);base=mix(base,gold,silk*.2);vec3 col=base;col+=gold*band*.18;col+=cream*s*(.38+.42*hover);col+=cream*mouse*(.22+.55*hover);col+=cream*sweep;col+=gold*rim*(.22+.35*hover);col*=1.0+hover*.18;float alpha=.82+.13*hover;gl_FragColor=vec4(col,alpha);}`;

function seedFor(value) {
  let hash = 2166136261;
  const text = String(value ?? "card");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function markShaderUnavailable(card, canvas) {
  card.classList.remove("has-live-shader");
  card.classList.add("shader-fallback");
  if (canvas) canvas.hidden = true;
}

class CardShaderInstance {
  constructor(card, canvas, reducedMotion) {
    this.card = card;
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    this.seed = seedFor(card.dataset.appId);
    this.mouse = { x: 0.5, y: 0.5 };
    this.hover = 0;
    this.targetHover = 0;
    this.visible = false;
    this.ready = false;
    this.failed = false;
    this.disposed = false;
    this.releasing = false;
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onContextLost = this.onContextLost.bind(this);
    this.onPointerEnter = () => { this.targetHover = 1; };
    this.onPointerLeave = () => {
      this.targetHover = 0;
      this.card.style.setProperty("--tilt-x", "0deg");
      this.card.style.setProperty("--tilt-y", "0deg");
    };
    this.onPointerDown = () => { this.pulseUntil = performance.now() + 240; };
    card.addEventListener("pointermove", this.onPointerMove);
    card.addEventListener("pointerenter", this.onPointerEnter);
    card.addEventListener("pointerleave", this.onPointerLeave);
    card.addEventListener("pointerdown", this.onPointerDown);
    canvas?.addEventListener("webglcontextlost", this.onContextLost, false);
  }

  onContextLost(event) {
    event.preventDefault?.();
    this.release(false);
    this.failed = true;
    markShaderUnavailable(this.card, this.canvas);
  }

  init() {
    if (this.ready || this.failed || this.disposed || !this.canvas) return;
    if (liveCardShaderCount >= MAX_LIVE_CARD_SHADERS) {
      this.card.classList.add("shader-fallback");
      this.canvas.hidden = true;
      return;
    }

    let gl = null;
    try {
      gl = this.canvas.getContext("webgl", { antialias: false, alpha: true, preserveDrawingBuffer: false, powerPreference: "low-power" });
      if (!gl) throw new Error("No WebGL context available for card shader.");
      this.gl = gl;
      this.program = createProgram(gl, VERTEX, FRAGMENT);
      gl.useProgram(this.program);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(this.program, "p");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      this.uniforms = {
        resolution: gl.getUniformLocation(this.program, "r"),
        mouse: gl.getUniformLocation(this.program, "m"),
        time: gl.getUniformLocation(this.program, "t"),
        hover: gl.getUniformLocation(this.program, "h"),
        seed: gl.getUniformLocation(this.program, "seed")
      };
      liveCardShaderCount += 1;
      this.ready = true;
      this.canvas.hidden = false;
      this.card.classList.remove("shader-fallback");
      this.card.classList.add("has-live-shader");
    } catch {
      this.failed = true;
      this.release(false);
      markShaderUnavailable(this.card, this.canvas);
    }
  }

  onPointerMove(event) {
    const rect = this.card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const y = Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / Math.max(1, rect.height)));
    this.mouse = { x, y };
    const tiltY = (x - 0.5) * 7;
    const tiltX = (0.5 - y) * 5;
    this.card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    this.card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    this.card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    this.card.style.setProperty("--my", `${((1 - y) * 100).toFixed(1)}%`);
  }

  setVisible(visible) {
    this.visible = visible;
    if (visible) this.init();
    else this.release(true);
  }

  resize() {
    if (!this.ready) return;
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 1.25);
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  draw(now) {
    if (!this.visible || this.disposed || this.failed) return;
    this.init();
    if (!this.ready) return;
    this.hover += (this.targetHover - this.hover) * 0.12;
    const pulse = this.pulseUntil && now < this.pulseUntil ? (this.pulseUntil - now) / 240 : 0;
    this.resize();
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(this.uniforms.time, this.reducedMotion ? this.seed * 10 : now * 0.001);
    gl.uniform1f(this.uniforms.hover, Math.min(1, this.hover + pulse * 0.75));
    gl.uniform1f(this.uniforms.seed, this.seed * 37.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  release(loseContext = true) {
    if (!this.ready && !this.gl) return;
    if (this.ready) liveCardShaderCount = Math.max(0, liveCardShaderCount - 1);
    this.ready = false;
    this.card.classList.remove("has-live-shader");
    this.card.classList.add("shader-fallback");
    if (this.canvas) this.canvas.hidden = true;
    if (loseContext && this.gl && !this.releasing) {
      this.releasing = true;
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
      this.releasing = false;
    }
    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.uniforms = null;
  }

  dispose() {
    this.disposed = true;
    this.release(true);
    this.card.removeEventListener("pointermove", this.onPointerMove);
    this.card.removeEventListener("pointerenter", this.onPointerEnter);
    this.card.removeEventListener("pointerleave", this.onPointerLeave);
    this.card.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas?.removeEventListener("webglcontextlost", this.onContextLost, false);
  }
}

export function attachNexusCardShaders(root = document) {
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const cards = Array.from(root.querySelectorAll(".nexus-app-card"));
  for (const card of cards) card.classList.add("shader-fallback");
  if (reducedMotion || !("WebGLRenderingContext" in globalThis)) {
    return { stop() {} };
  }
  const instances = cards.map((card) => new CardShaderInstance(card, card.querySelector(".nexus-card-shader"), reducedMotion)).filter((instance) => instance.canvas);
  const observer = "IntersectionObserver" in globalThis
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const instance = instances.find((candidate) => candidate.card === entry.target);
          instance?.setVisible(entry.isIntersecting);
        }
      }, { rootMargin: "120px" })
    : null;
  for (const instance of instances) {
    if (observer) observer.observe(instance.card);
    else instance.setVisible(true);
  }
  let stopped = false;
  function frame(now) {
    if (stopped) return;
    for (const instance of instances) instance.draw(now);
    globalThis.requestAnimationFrame?.(frame);
  }
  globalThis.requestAnimationFrame?.(frame);
  return {
    stop() {
      stopped = true;
      observer?.disconnect();
      for (const instance of instances) instance.dispose();
    }
  };
}
