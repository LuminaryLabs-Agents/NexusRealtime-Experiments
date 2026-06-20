import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createMeadowPostprocess(renderer, scene, camera) {
  const target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { samples: 2 });
  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uExposure; uniform float uSaturation; uniform float uContrast; uniform float uBloom; uniform float uVignette; uniform float uGrain; uniform vec3 uLift; uniform float uTime; float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); } void main(){ vec3 col=texture2D(tDiffuse,vUv).rgb; vec3 bloom=max(col-.72,0.)*uBloom*1.75; col+=bloom; col=vec3(1.)-exp(-col*uExposure); float lum=dot(col,vec3(.299,.587,.114)); col=mix(vec3(lum),col,uSaturation); col=(col-.5)*uContrast+.5; col+=uLift; col*=1.0-smoothstep(.34,.86,distance(vUv,vec2(.5)))*uVignette; col+=(hash(vUv*vec2(1919.,1081.)+uTime)-.5)*uGrain; gl_FragColor=vec4(pow(max(col,0.),vec3(1./2.2)),1.); }`,
    uniforms: {
      tDiffuse: { value: target.texture },
      uExposure: { value: 1.0 },
      uSaturation: { value: 1.0 },
      uContrast: { value: 1.0 },
      uBloom: { value: 0.08 },
      uVignette: { value: 0.16 },
      uGrain: { value: 0.018 },
      uLift: { value: new THREE.Vector3(0, 0, 0) },
      uTime: { value: 0 }
    }
  });
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  return {
    resize(width, height) { target.setSize(width, height); },
    update(policy = {}, time = 0) {
      material.uniforms.uExposure.value = policy.exposure ?? 1;
      material.uniforms.uSaturation.value = policy.saturation ?? 1;
      material.uniforms.uContrast.value = policy.contrast ?? 1;
      material.uniforms.uBloom.value = policy.bloomStrength ?? 0.08;
      material.uniforms.uVignette.value = policy.vignette ?? 0.16;
      material.uniforms.uGrain.value = policy.grain ?? 0.018;
      material.uniforms.uLift.value.set(...(policy.colorLift ?? [0, 0, 0]));
      material.uniforms.uTime.value = time;
    },
    render() {
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    }
  };
}
