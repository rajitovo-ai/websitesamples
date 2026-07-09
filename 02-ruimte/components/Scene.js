'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural planet shader
const planetVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const planetFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uType;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = vPosition * 2.0;
    float n = fbm(pos + uTime * 0.05);
    float n2 = fbm(pos * 3.0 + uTime * 0.02);

    vec3 color = mix(uColorA, uColorB, smoothstep(-0.3, 0.5, n));
    color = mix(color, uColorC, smoothstep(0.3, 0.8, n2) * 0.5);

    // Rim lighting
    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 2.0);
    color += rim * uColorC * 0.3;

    // Type-specific effects
    if (uType > 0.5 && uType < 1.5) {
      // Gas giant - bands
      float bands = sin(vPosition.y * 8.0 + n * 2.0) * 0.5 + 0.5;
      color = mix(color, uColorC, bands * 0.3);
    }
    if (uType > 1.5) {
      // Ringed planet - extra glow
      color += rim * 0.5;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Sun shader
const sunFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float n = snoise(vPosition * 3.0 + uTime * 0.3);
    float n2 = snoise(vPosition * 6.0 - uTime * 0.2);
    float intensity = 0.8 + n * 0.3 + n2 * 0.15;

    vec3 colorHot = vec3(1.0, 0.9, 0.3);
    vec3 colorWarm = vec3(1.0, 0.5, 0.1);
    vec3 color = mix(colorWarm, colorHot, intensity);

    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 3.0);
    color += rim * vec3(1.0, 0.6, 0.2) * 0.8;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Planet({ position, size, colors, type = 0, speed = 0.3 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
      uType: { value: type },
    }),
    [colors, type]
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * speed;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={planetVertexShader}
        fragmentShader={planetFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Sun({ position }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={planetVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      <pointLight position={position} color={0xff8833} intensity={3} distance={50} />
      <mesh position={position}>
        <sphereGeometry args={[3.0, 32, 32]} />
        <meshBasicMaterial color={0xff5511} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh position={position}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial color={0xff3300} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </>
  );
}

function SaturnRings({ position, size }) {
  const ringRef = useRef();

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[size * 1.3, size * 2.0, 64]} />
      <meshBasicMaterial
        color={0xddcc88}
        side={THREE.DoubleSide}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

function Starfield({ count = 8000 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={0xffffff}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function CameraRig({ scrollProgress }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 15));
  const currentPos = useRef(new THREE.Vector3(0, 0, 15));

  useFrame(() => {
    // Map scroll progress to camera journey through solar system
    const p = scrollProgress;

    // Journey: Sun(0) → Mercury(0.1) → Venus(0.2) → Earth(0.3) → Mars(0.4) → Jupiter(0.6) → Saturn(0.8) → End(1.0)
    const stops = [
      { x: 0, y: 0, z: 12 },        // Sun
      { x: 5, y: 1, z: 8 },         // Mercury
      { x: 10, y: -1, z: 8 },       // Venus
      { x: 16, y: 1, z: 8 },        // Earth
      { x: 22, y: -1, z: 8 },       // Mars
      { x: 32, y: 2, z: 10 },       // Jupiter
      { x: 44, y: -1, z: 12 },      // Saturn
      { x: 50, y: 0, z: 18 },       // End
    ];

    const segmentCount = stops.length - 1;
    const segmentProgress = p * segmentCount;
    const segIdx = Math.min(Math.floor(segmentProgress), segmentCount - 1);
    const segT = segmentProgress - segIdx;

    const ease = segT < 0.5 ? 2 * segT * segT : 1 - Math.pow(-2 * segT + 2, 2) / 2;

    const a = stops[segIdx];
    const b = stops[segIdx + 1];

    targetPos.current.set(
      a.x + (b.x - a.x) * ease,
      a.y + (b.y - a.y) * ease,
      a.z + (b.z - a.z) * ease
    );

    currentPos.current.lerp(targetPos.current, 0.05);
    camera.position.copy(currentPos.current);
    camera.lookAt(
      currentPos.current.x * 0.95,
      currentPos.current.y * 0.9,
      0
    );
  });

  return null;
}

export default function Scene({ scrollProgress }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#000005' }}
    >
      <ambientLight intensity={0.15} />
      <CameraRig scrollProgress={scrollProgress} />

      <Starfield count={8000} />

      {/* Sun */}
      <Sun position={[0, 0, 0]} />

      {/* Planets along the x-axis */}
      <Planet
        position={[5, 0, 0]}
        size={0.4}
        colors={['#8c7853', '#5a4a3a', '#a09080']}
        type={0}
        speed={0.5}
      />
      <Planet
        position={[10, 0, 0]}
        size={0.7}
        colors={['#e8a060', '#c08040', '#ffd0a0']}
        type={0}
        speed={0.4}
      />
      <Planet
        position={[16, 0, 0]}
        size={0.8}
        colors={['#2266aa', '#114488', '#3399cc']}
        type={0}
        speed={0.5}
      />
      <Planet
        position={[22, 0, 0]}
        size={0.5}
        colors={['#cc5533', '#883322', '#dd7744']}
        type={0}
        speed={0.4}
      />
      <Planet
        position={[32, 0, 0]}
        size={1.8}
        colors={['#d4a373', '#b8860b', '#f0c878']}
        type={1}
        speed={0.3}
      />
      {/* Saturn with rings */}
      <Planet
        position={[44, 0, 0]}
        size={1.5}
        colors={['#e8d5a0', '#c0a060', '#f5e8c0']}
        type={2}
        speed={0.25}
      />
      <SaturnRings position={[44, 0, 0]} size={1.5} />
    </Canvas>
  );
}
