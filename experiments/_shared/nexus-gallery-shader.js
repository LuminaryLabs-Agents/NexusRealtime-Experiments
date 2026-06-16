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

function createFallback(canvas) {
  canvas.classList.add("is-fallback");
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
  const canvas = documentRef.createElement("canvas");
  canvas.className = "nexus-gallery-background";
  canvas.setAttribute("aria-hidden", "true");
  (options.parent ?? documentRef.body).prepend(canvas);

  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: false
  });
  if (!gl) return createFallback(canvas);

  const vertex = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;
  const fragment = `precision highp float;uniform vec2 r;uniform float t;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);} 
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.62,1.17,-1.17,1.62)*p+vec2(4.1,2.7);a*=.52;}return v;}
    void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);float time=t*.06;vec2 q=uv+vec2(sin(time+uv.y*1.4),cos(time+uv.x*1.1))*.055;float smoke=fbm(q*2.1+vec2(time*1.0,-time*.72));float chalk=fbm(q*8.0+smoke*2.0-time*.2);float dust=smoothstep(.62,1.0,fbm(q*17.0+time));float vign=smoothstep(1.2,.18,length(uv*vec2(.9,1.08)));float center=smoothstep(.9,.08,length(uv-vec2(.02,.01)));float tone=(smoke*.2+chalk*.12+dust*.07+center*.11)*vign;vec3 black=vec3(.006,.007,.007);vec3 blue=vec3(.02,.05,.065);vec3 chalky=vec3(.68,.70,.68);vec3 col=mix(black,blue,.45)+chalky*tone;col+=vec3(.03,.028,.022)*pow(vign,2.0);gl_FragColor=vec4(col,1.0);}`;

  let stopped = false;
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
    resize();
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(time, reducedMotion ? 0 : now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (stopped) return;
    draw(now);
    if (!reducedMotion) globalThis.requestAnimationFrame(frame);
  }

  globalThis.addEventListener?.("resize", () => draw(performance.now()), { passive: true });
  globalThis.requestAnimationFrame?.(frame);

  return {
    canvas,
    draw,
    stop() {
      stopped = true;
      canvas.remove();
    }
  };
}
