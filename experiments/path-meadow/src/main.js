const LOCAL_KIT_URL = "../../../../NexusRealtime-ProtoKits/protokits/path-meadow-composition-kit/index.js";
const CDN_KIT_URL = "https://cdn.jsdelivr.net/gh/LuminaryLabs-Agents/NexusRealtime-ProtoKits@main/protokits/path-meadow-composition-kit/index.js";

const canvas = document.querySelector("#scene");
const hud = document.querySelector("#hud");
const statusEl = document.querySelector("#status");
const debug = new URLSearchParams(location.search).has("debug");
const BUILD_ID = "0.0.2-path-meadow-10-cel-outline";

const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
if (!gl) throw new Error("WebGL is required for the 3D path meadow proof.");

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < String(value).length; i += 1) h = Math.imul(h ^ String(value).charCodeAt(i), 16777619);
  return Math.abs(h >>> 0);
}

function pseudo(index, salt = 1) {
  const raw = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return raw - Math.floor(raw);
}

async function loadKit() {
  try {
    return await import(LOCAL_KIT_URL);
  } catch {
    return import(CDN_KIT_URL);
  }
}

function hexToRgb(hex) {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "ffffff";
  return [0, 2, 4].map((offset) => parseInt(safe.slice(offset, offset + 2), 16) / 255);
}

function rgbaToRgb(value, fallback = "#ffffff") {
  if (String(value).startsWith("#")) return hexToRgb(value);
  const match = String(value).match(/rgba?\(([^)]+)\)/);
  if (!match) return hexToRgb(fallback);
  return match[1].split(",").slice(0, 3).map((part) => Number(part.trim()) / 255);
}

function v3(x = 0, y = 0, z = 0) {
  return [x, y, z];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(value) {
  const len = Math.hypot(value[0], value[1], value[2]) || 1;
  return [value[0] / len, value[1] / len, value[2] / len];
}

function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan((fov * Math.PI / 180) / 2);
  const nf = 1 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, (2 * far * near) * nf, 0
  ];
}

function lookAt(eye, center, up) {
  const z = normalize(sub(eye, center));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return [
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1
  ];
}

function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      for (let k = 0; k < 4; k += 1) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    }
  }
  return out;
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram() {
  const vertex = compileShader(gl.VERTEX_SHADER, `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    attribute float aOutline;
    uniform mat4 uViewProjection;
    uniform float uOutlinePass;
    uniform float uOutlineWidth;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vOutlinePass;
    varying float vOutlineWeight;
    varying float vDepth;
    void main() {
      vec3 outlinePosition = aPosition + normalize(aNormal) * aOutline * uOutlineWidth * uOutlinePass;
      vec4 clip = uViewProjection * vec4(outlinePosition, 1.0);
      gl_Position = clip;
      vNormal = aNormal;
      vColor = aColor;
      vOutlinePass = uOutlinePass;
      vOutlineWeight = aOutline;
      vDepth = clip.z / clip.w;
    }
  `);
  const fragment = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vOutlinePass;
    varying float vOutlineWeight;
    varying float vDepth;
    uniform vec3 uLightDirection;
    uniform vec3 uRimColor;
    uniform vec3 uOutlineColor;
    uniform float uRimStrength;
    void main() {
      if (vOutlinePass > 0.5) {
        if (vOutlineWeight < 0.05) discard;
        gl_FragColor = vec4(uOutlineColor, 1.0);
        return;
      }
      float light = dot(normalize(vNormal), normalize(uLightDirection)) * 0.5 + 0.5;
      float band = light < 0.2 ? 0.38 : light < 0.48 ? 0.66 : light < 0.74 ? 0.92 : 1.2;
      if (vOutlineWeight < 0.05) band = max(band, 0.88);
      float rim = smoothstep(0.24, 0.92, 1.0 - abs(normalize(vNormal).z)) * uRimStrength;
      vec3 fog = vec3(0.92, 0.78, 0.48);
      float depthFog = clamp((vDepth + 0.1) * 0.32, 0.0, 0.42);
      gl_FragColor = vec4(mix(vColor * band + uRimColor * rim, fog, depthFog), 1.0);
    }
  `);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function createGeometry() {
  const positions = [];
  const normals = [];
  const colors = [];
  const outlines = [];
  function tri(a, b, c, color, outline = 1) {
    const n = normalize(cross(sub(b, a), sub(c, a)));
    for (const p of [a, b, c]) {
      positions.push(...p);
      normals.push(...n);
      colors.push(...color);
      outlines.push(outline);
    }
  }
  function quad(a, b, c, d, color, outline = 1) {
    tri(a, b, c, color, outline);
    tri(a, c, d, color, outline);
  }
  function box(cx, cy, cz, sx, sy, sz, color, outline = 1) {
    const x = sx / 2;
    const y = sy / 2;
    const z = sz / 2;
    const p = [
      v3(cx - x, cy - y, cz - z), v3(cx + x, cy - y, cz - z), v3(cx + x, cy + y, cz - z), v3(cx - x, cy + y, cz - z),
      v3(cx - x, cy - y, cz + z), v3(cx + x, cy - y, cz + z), v3(cx + x, cy + y, cz + z), v3(cx - x, cy + y, cz + z)
    ];
    quad(p[0], p[1], p[2], p[3], color, outline);
    quad(p[5], p[4], p[7], p[6], color, outline);
    quad(p[4], p[0], p[3], p[7], color, outline);
    quad(p[1], p[5], p[6], p[2], color, outline);
    quad(p[3], p[2], p[6], p[7], color, outline);
    quad(p[4], p[5], p[1], p[0], color, outline);
  }
  function pyramid(cx, cy, cz, radius, height, color, sides = 6, outline = 1) {
    const top = v3(cx, cy + height, cz);
    const base = Array.from({ length: sides }, (_, index) => {
      const a = index / sides * Math.PI * 2;
      return v3(cx + Math.cos(a) * radius, cy, cz + Math.sin(a) * radius);
    });
    for (let i = 0; i < sides; i += 1) tri(base[i], base[(i + 1) % sides], top, color, outline);
  }
  function cylinder(cx, cy, cz, radius, height, color, sides = 8, outline = 1) {
    const bottom = cy;
    const top = cy + height;
    for (let i = 0; i < sides; i += 1) {
      const a = i / sides * Math.PI * 2;
      const b = (i + 1) / sides * Math.PI * 2;
      quad(
        v3(cx + Math.cos(a) * radius, bottom, cz + Math.sin(a) * radius),
        v3(cx + Math.cos(b) * radius, bottom, cz + Math.sin(b) * radius),
        v3(cx + Math.cos(b) * radius * 0.72, top, cz + Math.sin(b) * radius * 0.72),
        v3(cx + Math.cos(a) * radius * 0.72, top, cz + Math.sin(a) * radius * 0.72),
        color,
        outline
      );
    }
  }
  function ellipsoid(cx, cy, cz, rx, ry, rz, color, segments = 8, outline = 1) {
    for (let y = 0; y < segments / 2; y += 1) {
      const v0 = y / (segments / 2) * Math.PI;
      const v1 = (y + 1) / (segments / 2) * Math.PI;
      for (let x = 0; x < segments; x += 1) {
        const u0 = x / segments * Math.PI * 2;
        const u1 = (x + 1) / segments * Math.PI * 2;
        const p = (u, v) => v3(cx + Math.cos(u) * Math.sin(v) * rx, cy + Math.cos(v) * ry, cz + Math.sin(u) * Math.sin(v) * rz);
        quad(p(u0, v0), p(u1, v0), p(u1, v1), p(u0, v1), color, outline);
      }
    }
  }
  function ribbon(points, width, color, outline = 0.15) {
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len * width;
      const nz = dx / len * width;
      quad(v3(a.x - nx, 0.035, a.z - nz), v3(a.x + nx, 0.035, a.z + nz), v3(b.x + nx, 0.035, b.z + nz), v3(b.x - nx, 0.035, b.z - nz), color, outline);
    }
  }
  return { positions, normals, colors, outlines, tri, quad, box, pyramid, cylinder, ellipsoid, ribbon };
}

function buildScene(composition) {
  const g = createGeometry();
  const material = composition.cel3D.materials;
  const outline = composition.cel3D.outline;
  g.quad(v3(-82, -0.08, 82), v3(82, -0.08, 82), v3(82, -0.08, -58), v3(-82, -0.08, -58), hexToRgb(material.grass.base), 0);
  g.quad(v3(-90, -0.02, 48), v3(90, -0.02, 48), v3(90, 3.2, 78), v3(-90, 3.2, 78), rgbaToRgb(composition.atmosphere.ground?.far, "#b4b978"), 0);
  for (const hill of composition.atmosphere.hills) {
    const y = 3 + (1 - hill.y) * 16;
    const color = rgbaToRgb(hill.color, "#7d8d62");
    const zNear = 58 + y * 0.22;
    const zFar = 78 + y * 0.12;
    const segments = 18;
    for (let segment = 0; segment < segments; segment += 1) {
      const x0 = -88 + segment / segments * 176;
      const x1 = -88 + (segment + 1) / segments * 176;
      const wave0 = Math.sin(segment * 0.82 + y) * 1.8 + Math.sin(segment * 0.31) * 0.9;
      const wave1 = Math.sin((segment + 1) * 0.82 + y) * 1.8 + Math.sin((segment + 1) * 0.31) * 0.9;
      g.quad(v3(x0, -0.03, zNear), v3(x1, -0.03, zNear), v3(x1, y * 0.62 + wave1, zFar), v3(x0, y * 0.62 + wave0, zFar), color, 0);
    }
  }
  g.ellipsoid(42, 31, 76, 4.2, 4.2, 0.8, hexToRgb(composition.atmosphere.sun.color), 8, 0);
  for (const cloud of composition.atmosphere.clouds) {
    const cx = (cloud.x - 0.5) * 82;
    const cy = 21 + (1 - cloud.y) * 16;
    const cz = 70 + cloud.scale * 3;
    for (let i = 0; i < 4; i += 1) {
      g.ellipsoid(cx + (i - 1.5) * 2.4 * cloud.scale, cy + Math.sin(i) * 0.5, cz, 2.2 * cloud.scale, 0.72 * cloud.scale, 0.44 * cloud.scale, hexToRgb("#fff2ce"), 6, 0.12);
    }
  }
  g.ribbon(composition.route.points, composition.route.width * 0.56, hexToRgb(material.path.shade), 0.18);
  g.ribbon(composition.route.points, composition.route.width * 0.46, hexToRgb(material.path.base), 0.12);
  for (let i = 0; i < composition.route.texture.pebbleCount; i += 1) {
    const p = composition.route.points[hash(`pebble:${i}`) % composition.route.points.length];
    g.box(p.x + (pseudo(i, 2) - 0.5) * composition.route.width, 0.08, p.z + (pseudo(i, 3) - 0.5) * 4, 0.08, 0.04, 0.1, hexToRgb(material.rock.highlight), 0.25);
  }
  const grassCount = Math.min(2400, composition.entityGeneration.ratios.grass.target);
  for (let i = 0; i < grassCount; i += 1) {
    const x = (pseudo(i, 11) - 0.5) * 70;
    const z = -48 + pseudo(i, 12) * 96;
    const h = 0.24 + pseudo(i, 13) * 1.1;
    const w = 0.035 + pseudo(i, 14) * 0.08;
    g.tri(v3(x - w, 0, z), v3(x + w, 0, z), v3(x + Math.sin(i) * 0.16, h, z + Math.cos(i) * 0.12), hexToRgb(i % 6 === 0 ? material.grass.highlight : material.grass.base), 0.18);
  }
  for (const item of composition.scatter.flowers) {
    const s = 0.16 * item.scale;
    g.cylinder(item.x, 0, item.z, s * 0.12, s * 3, hexToRgb(material.grass.shade), 5, 0.35);
    g.pyramid(item.x, s * 3, item.z, s * 0.9, s * 0.52, hexToRgb(material.flower.base), 5, 0.55);
  }
  for (const item of composition.scatter.rocks) {
    g.ellipsoid(item.x, 0.18 * item.scale, item.z, 0.58 * item.scale, 0.28 * item.scale, 0.42 * item.scale, hexToRgb(material.rock.base), 6, 0.7);
  }
  for (const item of composition.scatter.mushrooms) {
    g.cylinder(item.x, 0, item.z, 0.08 * item.scale, 0.58 * item.scale, hexToRgb(material.mushroom.highlight), 6, 0.45);
    g.pyramid(item.x, 0.52 * item.scale, item.z, 0.34 * item.scale, 0.22 * item.scale, hexToRgb(material.mushroom.base), 8, 0.65);
  }
  for (const item of composition.scatter.foregroundClusters) {
    for (let i = 0; i < 7; i += 1) {
      const x = item.x + (pseudo(i, item.x) - 0.5) * 2.4 * item.scale;
      const z = item.z + (pseudo(i, item.z) - 0.5) * 1.2 * item.scale;
      g.pyramid(x, 0, z, 0.12 * item.scale, (0.8 + pseudo(i, 80)) * item.scale, hexToRgb(i % 2 ? material.grass.highlight : material.grass.base), 4, outline.foregroundBoost);
    }
  }
  const frame = composition.depthCue.foregroundFrame;
  for (let i = 0; i < frame.bladeCount; i += 1) {
    const side = pseudo(i, 95) > 0.5 ? 1 : -1;
    const x = side * (18 + pseudo(i, 96) * 22);
    const z = -49 + pseudo(i, 97) * 18;
    const h = 1.4 + pseudo(i, 98) * 3.4;
    const lean = side * (0.3 + pseudo(i, 99) * 1.6);
    g.tri(v3(x - 0.18, 0, z), v3(x + 0.18, 0, z + 0.1), v3(x + lean, h, z + pseudo(i, 100) * 0.5), i % 4 === 0 ? rgbaToRgb(frame.colorWarm, material.grass.highlight) : rgbaToRgb(frame.colorDark, material.grass.shade), outline.foregroundBoost);
  }
  for (const tree of composition.scatter.treeLine) {
    g.cylinder(tree.x, 0, tree.z, 0.14 * tree.scale, 2.2 * tree.scale, hexToRgb(material.bark.shade), 6, 0.5);
    g.pyramid(tree.x, 1.5 * tree.scale, tree.z, 1.2 * tree.scale, 3.8 * tree.scale, hexToRgb(material.leaf.shade), 7, 0.55);
  }
  const tree = composition.heroTree;
  const p = tree.position;
  g.ellipsoid(p.x - 2.4, 0.02, p.z - 1.2, tree.shadow.radius, 0.05, tree.shadow.radius * 0.45, rgbaToRgb(tree.shadow.color, "#1f2917"), 8, 0);
  g.cylinder(p.x, p.y, p.z, tree.trunk.radius, tree.trunk.height, hexToRgb(material.bark.base), 10, outline.heroTreeBoost);
  for (let i = 0; i < tree.trunk.rootCount; i += 1) {
    const a = i / tree.trunk.rootCount * Math.PI * 2;
    g.box(p.x + Math.cos(a) * 1.8, 0.06, p.z + Math.sin(a) * 1.0, 2.8, 0.16, 0.22, hexToRgb(material.bark.shade), outline.heroTreeBoost);
  }
  for (let i = 0; i < tree.trunk.branchCount; i += 1) {
    const side = i % 2 ? 1 : -1;
    g.box(p.x + side * (1.2 + i * 0.12), p.y + tree.trunk.height * (0.52 + i / tree.trunk.branchCount * 0.34), p.z + Math.sin(i) * 0.6, 2.4 + i * 0.04, 0.22, 0.22, hexToRgb(material.bark.shade), outline.heroTreeBoost);
  }
  for (let layer = 0; layer < tree.canopy.layerCount; layer += 1) {
    for (let i = 0; i < tree.canopy.lobeCount; i += 1) {
      const a = i / tree.canopy.lobeCount * Math.PI * 2 + layer * 0.25;
      const r = tree.canopy.radius * (0.22 + layer * 0.045);
      g.ellipsoid(
        p.x + Math.cos(a) * r * 1.1,
        p.y + tree.trunk.height + 1.7 + Math.sin(i) * 0.72 + layer * 0.25,
        p.z + Math.sin(a) * r * 0.72,
        2.25 + layer * 0.52 + (i % 3) * 0.18,
        1.35 + layer * 0.28,
        1.95 + layer * 0.32,
        hexToRgb(i % 5 === 0 ? material.leaf.highlight : material.leaf.base),
        8,
        outline.heroTreeBoost
      );
    }
  }
  const actor = composition.player;
  g.ellipsoid(actor.position.x, 0.02, actor.position.z + 0.22, 1.1, 0.04, 0.42, rgbaToRgb("#1a1b12"), 6, 0);
  g.cylinder(actor.position.x, actor.position.y, actor.position.z, 0.26, actor.height, hexToRgb("#151712"), 7, outline.nearBoost);
  g.ellipsoid(actor.position.x, actor.height + 0.24, actor.position.z, 0.28, 0.28, 0.28, hexToRgb("#151712"), 6, outline.nearBoost);
  return g;
}

function upload(attribute, size, data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
}

function render(scene, composition, program) {
  const style = composition.cel3D;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...hexToRgb(style.materials.sky.base), 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.useProgram(program);
  const view = lookAt([style.camera.position.x, style.camera.position.y, style.camera.position.z], [style.camera.target.x, style.camera.target.y, style.camera.target.z], [0, 1, 0]);
  const projection = perspective(style.camera.fov, canvas.width / canvas.height, style.camera.near, style.camera.far);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "uViewProjection"), false, new Float32Array(multiply(projection, view)));
  gl.uniform3fv(gl.getUniformLocation(program, "uLightDirection"), new Float32Array([style.light.direction.x, style.light.direction.y, style.light.direction.z]));
  gl.uniform3fv(gl.getUniformLocation(program, "uRimColor"), new Float32Array(hexToRgb(style.light.rimColor)));
  gl.uniform3fv(gl.getUniformLocation(program, "uOutlineColor"), new Float32Array(hexToRgb(style.outline.color)));
  gl.uniform1f(gl.getUniformLocation(program, "uRimStrength"), style.light.rimStrength);
  gl.uniform1f(gl.getUniformLocation(program, "uOutlineWidth"), style.outline.width);
  gl.uniform1f(gl.getUniformLocation(program, "uOutlinePass"), style.outline.enabled ? 1 : 0);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  gl.drawArrays(gl.TRIANGLES, 0, scene.positions.length / 3);
  gl.disable(gl.CULL_FACE);
  gl.uniform1f(gl.getUniformLocation(program, "uOutlinePass"), 0);
  gl.drawArrays(gl.TRIANGLES, 0, scene.positions.length / 3);
}

function resize(scene, composition, program) {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  render(scene, composition, program);
}

async function boot() {
  const { createPathMeadowDataStreamKit } = await loadKit();
  const dataStreamKit = createPathMeadowDataStreamKit(null, { seed: "central-hero-tree-meadow-v0.0.2" });
  const streamPacket = dataStreamKit.getStreamPacket();
  const streamValidation = dataStreamKit.validateStreamPacket(streamPacket);
  const { composition, breakdown, validation } = streamPacket.snapshot;
  const scene = buildScene(composition);
  const program = createProgram();
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const normalLocation = gl.getAttribLocation(program, "aNormal");
  const colorLocation = gl.getAttribLocation(program, "aColor");
  const outlineLocation = gl.getAttribLocation(program, "aOutline");
  upload(positionLocation, 3, scene.positions);
  upload(normalLocation, 3, scene.normals);
  upload(colorLocation, 3, scene.colors);
  upload(outlineLocation, 1, scene.outlines);
  hud.hidden = !debug;
  statusEl.textContent = `${validation.score}/${Object.keys(validation).filter((key) => key.startsWith("has")).length} domains · stream:${streamValidation.passed ? "ok" : "bad"} · vertices:${scene.positions.length / 3} · ${breakdown.map((entry) => `${entry.id}:${entry.count}`).join(" · ")}`;
  window.GameHost = {
    build: BUILD_ID,
    dataStreamKit,
    getState: () => ({ build: BUILD_ID, validation, streamValidation, streamPacket, composition, breakdown, vertexCount: scene.positions.length / 3 })
  };
  addEventListener("resize", () => resize(scene, composition, program));
  resize(scene, composition, program);
}

boot().catch((error) => {
  hud.hidden = false;
  statusEl.textContent = String(error?.stack ?? error?.message ?? error);
});
