"use client";

import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform vec2 u_image_size;
  uniform vec2 u_mouse;
  uniform vec2 u_velocity;
  uniform float u_hover;
  uniform float u_time;
  uniform float u_position_x;

  const float PI = 3.141592653589793;

  void main() {
    vec2 surface_uv = v_uv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    float long_wave = sin((surface_uv.y * 7.0 + surface_uv.x * 1.35) * PI + u_time * 0.16);
    float cross_wave = sin((surface_uv.x * 4.6 - surface_uv.y * 2.7) * PI - u_time * 0.11);
    float fine_wave = cos((surface_uv.x + surface_uv.y) * 8.0 * PI + u_time * 0.09);

    vec2 displacement = vec2(
      (long_wave + cross_wave * 0.42) * 0.00072,
      (cross_wave + fine_wave * 0.28) * 0.00034
    );

    vec2 pointer_delta = surface_uv - u_mouse;
    pointer_delta.x *= aspect;
    float pointer_distance = length(pointer_delta);
    float pointer_field = 1.0 - smoothstep(0.035, 0.43, pointer_distance);
    float pointer_wave = sin(pointer_distance * 38.0 - u_time * 0.58);
    vec2 pointer_direction = normalize(pointer_delta + vec2(0.0001));
    vec2 pointer_tangent = vec2(-pointer_direction.y, pointer_direction.x);

    displacement += pointer_tangent * pointer_field * u_hover * 0.0036;
    displacement += pointer_direction * pointer_wave * pointer_field * u_hover * 0.0019;
    displacement += u_velocity * pointer_field * u_hover * 0.008;

    surface_uv += displacement;

    float canvas_aspect = u_resolution.x / max(u_resolution.y, 1.0);
    float image_aspect = u_image_size.x / max(u_image_size.y, 1.0);
    vec2 cover_scale = vec2(1.0);

    if (canvas_aspect > image_aspect) {
      cover_scale.y = image_aspect / canvas_aspect;
    } else {
      cover_scale.x = canvas_aspect / image_aspect;
    }

    vec2 image_uv = (surface_uv - 0.5) * cover_scale + 0.5;
    image_uv.x += (u_position_x - 0.5) * (1.0 - cover_scale.x);
    image_uv = clamp(image_uv, vec2(0.001), vec2(0.999));

    gl_FragColor = texture2D(u_texture, image_uv);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default function HeroWaveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!canvas || reducedMotion.matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    const positionBuffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!positionBuffer || !texture) return;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const textureLocation = gl.getUniformLocation(program, "u_texture");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const imageSizeLocation = gl.getUniformLocation(program, "u_image_size");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const velocityLocation = gl.getUniformLocation(program, "u_velocity");
    const hoverLocation = gl.getUniformLocation(program, "u_hover");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const positionXLocation = gl.getUniformLocation(program, "u_position_x");

    gl.uniform1i(textureLocation, 0);

    const pointer = { x: 0.76, y: 0.46 };
    const pointerTarget = { x: 0.76, y: 0.46 };
    const velocity = { x: 0, y: 0 };
    const velocityTarget = { x: 0, y: 0 };
    let hover = 0;
    let hoverTarget = 0;
    let animationFrame = 0;
    let lastDraw = 0;
    let imageReady = false;
    let inView = true;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
    };

    const hero = canvas.closest<HTMLElement>(".hero");

    const updatePointer = (event: PointerEvent) => {
      if (!hero || event.pointerType === "touch") return;

      const bounds = hero.getBoundingClientRect();
      const nextX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const nextY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));

      velocityTarget.x = Math.max(-0.035, Math.min(0.035, nextX - pointerTarget.x));
      velocityTarget.y = Math.max(-0.035, Math.min(0.035, nextY - pointerTarget.y));
      pointerTarget.x = nextX;
      pointerTarget.y = nextY;
      hoverTarget = Math.min(1, Math.max(0, (nextX - 0.28) / 0.42));
    };

    const enterPointer = (event: PointerEvent) => {
      updatePointer(event);
    };

    const leavePointer = () => {
      hoverTarget = 0;
      velocityTarget.x = 0;
      velocityTarget.y = 0;
    };

    hero?.addEventListener("pointerenter", enterPointer, { passive: true });
    hero?.addEventListener("pointermove", updatePointer, { passive: true });
    hero?.addEventListener("pointerleave", leavePointer, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    if (hero) visibilityObserver.observe(hero);

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform2f(imageSizeLocation, image.naturalWidth, image.naturalHeight);
      imageReady = true;
    };
    image.src = "/qfund-field.png";

    const render = (now: number) => {
      animationFrame = window.requestAnimationFrame(render);
      if (!imageReady || !inView || document.hidden || now - lastDraw < 30) return;

      const smoothing = hoverTarget > hover ? 0.055 : 0.035;
      pointer.x += (pointerTarget.x - pointer.x) * 0.065;
      pointer.y += (pointerTarget.y - pointer.y) * 0.065;
      hover += (hoverTarget - hover) * smoothing;
      velocity.x += (velocityTarget.x - velocity.x) * 0.09;
      velocity.y += (velocityTarget.y - velocity.y) * 0.09;
      velocityTarget.x *= 0.82;
      velocityTarget.y *= 0.82;

      resize();
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, pointer.x, pointer.y);
      gl.uniform2f(velocityLocation, velocity.x, velocity.y);
      gl.uniform1f(hoverLocation, hover);
      gl.uniform1f(timeLocation, now * 0.001);
      gl.uniform1f(positionXLocation, window.innerWidth <= 720 ? 0.64 : 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      canvas.classList.add("is-ready");
      lastDraw = now;
    };

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero?.removeEventListener("pointerenter", enterPointer);
      hero?.removeEventListener("pointermove", updatePointer);
      hero?.removeEventListener("pointerleave", leavePointer);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-wave-canvas" aria-hidden="true" />;
}
