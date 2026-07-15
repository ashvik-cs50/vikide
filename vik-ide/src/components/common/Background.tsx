import { useEffect, useRef } from 'react';

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      // Fallback
      canvas.style.display = 'none';
      return;
    }

    function resize() {
      canvas!.width = window.innerWidth * devicePixelRatio;
      canvas!.height = window.innerHeight * devicePixelRatio;
      canvas!.style.width = window.innerWidth + 'px';
      canvas!.style.height = window.innerHeight + 'px';
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const PARTICLE_COUNT = 3000;

    const vsSource = `
      attribute vec3 aPos;
      attribute float aSpeed;
      attribute float aBrightness;
      uniform float uTime;
      uniform float uAspect;
      uniform vec2 uMouse;
      varying float vBright;
      varying float vDepth;
      void main() {
        float t = mod(uTime * aSpeed * 0.0003, 1.0);
        float x = aPos.x + sin(uTime * 0.0005 + aPos.z * 3.14) * 0.05;
        float y = aPos.y - t * 2.0 + 1.0;
        float z = aPos.z;
        y = mod(y + 1.0, 2.0) - 1.0;
        vec2 mouse = uMouse * 0.08;
        x += mouse.x * (1.0 - z);
        y += mouse.y * (1.0 - z);
        float persp = 1.0 / (1.0 + z * 0.5);
        gl_Position = vec4(x * persp / uAspect, y * persp, z, 1.0);
        gl_PointSize = (2.5 - z * 1.5) * persp * aBrightness;
        vBright = aBrightness;
        vDepth = z;
      }
    `;
    const fsSource = `
      precision mediump float;
      varying float vBright;
      varying float vDepth;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = (1.0 - d * 2.0) * vBright * (1.0 - vDepth * 0.6) * 0.6;
        gl_FragColor = vec4(0.22, 1.0, 0.08, alpha);
      }
    `;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const brights = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = Math.random();
      speeds[i] = 0.5 + Math.random() * 2;
      brights[i] = 0.3 + Math.random() * 0.7;
    }

    function makeBuffer(data: Float32Array, loc: number, size: number) {
      const buf = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, size, gl!.FLOAT, false, 0, 0);
    }

    makeBuffer(pos, gl.getAttribLocation(prog, 'aPos')!, 3);
    makeBuffer(speeds, gl.getAttribLocation(prog, 'aSpeed')!, 1);
    makeBuffer(brights, gl.getAttribLocation(prog, 'aBrightness')!, 1);

    const uTime = gl.getUniformLocation(prog, 'uTime')!;
    const uAspect = gl.getUniformLocation(prog, 'uAspect')!;
    const uMouse = gl.getUniformLocation(prog, 'uMouse')!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    let mx = 0,
      my = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * -2;
    });

    let animId: number;
    function draw(ts: number) {
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1f(uTime, ts);
      gl!.uniform1f(uAspect, canvas!.width / canvas!.height);
      gl!.uniform2f(uMouse, mx, my);
      gl!.drawArrays(gl!.POINTS, 0, PARTICLE_COUNT);
      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas-3d"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        id="bg-radial"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 30% at 50% 0%, rgba(57,255,20,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(57,255,20,0.03) 0%, transparent 50%),
            radial-gradient(ellipse 30% 30% at 20% 60%, rgba(57,255,20,0.02) 0%, transparent 50%)
          `,
        }}
      />
      <div
        id="bg-grid"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 50% at 50% 50%, black 20%, transparent 70%)',
          maskImage:
            'radial-gradient(ellipse 70% 50% at 50% 50%, black 20%, transparent 70%)',
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />
      <div
        id="scan-beam"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(57,255,20,0.02) 45%, rgba(57,255,20,0.06) 48%, rgba(57,255,20,0.10) 50%, rgba(57,255,20,0.06) 52%, rgba(57,255,20,0.02) 55%, transparent 100%)',
          animation: 'scanDown 6s ease-in-out infinite',
          opacity: 0.4,
        }}
      />
            <div
        id="bg-noise"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.02,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(57,255,20,0.01) 0px, rgba(57,255,20,0.01) 1px, transparent 1px, transparent 4px)',
          backgroundSize: '4px 4px',
        }}
      />
    </>
  );
}
