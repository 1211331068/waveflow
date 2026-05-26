"use client";

import React, { useEffect, useRef } from 'react';

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    // --- noise helpers ---
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for(int i=0;i<5;i++) { v += a*noise(p); p *= 2.1; a *= 0.45; }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      float t = iTime * 0.15;

      // --- particle wave field ---
      vec2 p = uv * 3.0;
      float wave = 0.0;
      for(int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 d = vec2(
          fbm(p + vec2(t*0.3 + fi, t*0.2)),
          fbm(p + vec2(t*0.4 + fi*2.0, t*0.3 + 0.5))
        );
        float dist = length(p - d * 2.0);
        wave += smoothstep(0.8, 0.0, dist) * 0.3 * (1.0 - fi*0.3);
      }

      // --- flowing ribbon lines ---
      float line = 0.0;
      for(int i=0;i<12;i++) {
        float fi = float(i)*0.27 + 0.5;
        float y = fbm(vec2(uv.x*2.5 + iTime*fi*0.2, fi*3.0));
        float dist = abs(uv.y - y*0.4-0.3) * 5.0;
        line += smoothstep(1.2, 0.0, dist) * 0.04;
      }

      // --- floating particles ---
      float particles = 0.0;
      for(int i=0;i<30;i++) {
        float fi = float(i);
        vec2 pos = vec2(
          fract(sin(fi*234.7+iTime*0.08)*43758.54),
          fract(sin(fi*412.3+iTime*0.06)*31245.21)
        );
        float size = sin(fi+iTime)*0.002+0.003;
        float d = length(uv-pos);
        particles += smoothstep(size, 0.0, d) * 0.35;
      }

      // --- colors - dark purple palette ---
      vec3 col1 = vec3(0.04, 0.01, 0.08);  // deep dark purple
      vec3 col2 = vec3(0.08, 0.02, 0.15);  // mid dark purple
      vec3 col3 = vec3(0.15, 0.04, 0.25);  // lighter purple
      vec3 col4 = vec3(0.30, 0.08, 0.42);  // bright purple accent
      vec3 col5 = vec3(0.55, 0.15, 0.65);  // pink-purple highlight

      vec3 bg = mix(col1, col2, uv.y);
      bg = mix(bg, col3, wave * 1.5);
      bg += col4 * line * 2.5;
      bg += mix(col5, col4, uv.x) * particles * 2.0;
      bg += col4 * wave * 0.6;

      // vignette
      float vg = 1.0-length(uv-0.5)*0.6;
      bg *= mix(0.3, 1.0, vg);

      gl_FragColor = vec4(bg, 1.0);
    }
  `;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) { console.warn('WebGL not supported.'); return; }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, 'attribute vec4 p;void main(){gl_Position=p;}');
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const uRes = gl.getUniformLocation(prog, 'iResolution');
    const uTime = gl.getUniformLocation(prog, 'iTime');
    const aPos = gl.getAttribLocation(prog, 'p');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    let start = Date.now();
    const render = () => {
      const t = (Date.now() - start) / 1000;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPos);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default ShaderBackground;
