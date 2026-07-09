'use strict';

// ============================================
// PARFUM — WebGL Shader + Particle Mist
// ============================================

gsap.registerPlugin(ScrollTrigger);

// --- WebGL Fluid Background Shader ---
const shaderCanvas = document.getElementById('shader-canvas');
const gl = shaderCanvas.getContext('webgl');

const vertSrc = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragSrc = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uMix;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * snoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 3.0;
    p.x += uTime * 0.02;

    float n1 = fbm(p + uTime * 0.03);
    float n2 = fbm(p * 1.5 + n1 + uTime * 0.04);

    vec2 mouseInfluence = (uMouse - 0.5) * 0.3;
    float mouseDist = distance(uv, uMouse);
    float mouseEffect = smoothstep(0.4, 0.0, mouseDist) * 0.1;

    vec3 color = mix(uColor1, uColor2, smoothstep(-0.3, 0.5, n1));
    color = mix(color, uColor3, smoothstep(0.2, 0.8, n2) * 0.6);

    // Add mouse glow
    color += uColor3 * mouseEffect;

    // Vignette
    float vignette = smoothstep(1.2, 0.3, distance(uv, vec2(0.5)));
    color *= vignette * 0.7 + 0.3;

    // Subtle grain
    float grain = fract(sin(dot(uv * uResolution.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.02;

    gl_FragColor = vec4(color, 1.0);
  }
`;

let shaderProgram, shaderUniforms;
let mouseX = 0.5, mouseY = 0.5;
let scrollMix = 0;

// Color palettes for different sections
const colorPalettes = {
  hero: [
    [0.05, 0.04, 0.03],
    [0.15, 0.10, 0.06],
    [0.79, 0.66, 0.38],
  ],
  bergamot: [
    [0.08, 0.07, 0.04],
    [0.20, 0.15, 0.08],
    [0.91, 0.76, 0.44],
  ],
  roos: [
    [0.08, 0.04, 0.06],
    [0.20, 0.08, 0.12],
    [0.78, 0.35, 0.48],
  ],
  oud: [
    [0.06, 0.04, 0.03],
    [0.15, 0.08, 0.05],
    [0.54, 0.35, 0.23],
  ],
};

let currentColors = colorPalettes.hero.map(c => [...c]);
let targetColors = colorPalettes.hero.map(c => [...c]);

function initShader() {
    if (!gl) return;

    function compileShader(src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const vs = compileShader(vertSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fragSrc, gl.FRAGMENT_SHADER);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Full-screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    shaderUniforms = {
        uTime: gl.getUniformLocation(shaderProgram, 'uTime'),
        uResolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
        uMouse: gl.getUniformLocation(shaderProgram, 'uMouse'),
        uColor1: gl.getUniformLocation(shaderProgram, 'uColor1'),
        uColor2: gl.getUniformLocation(shaderProgram, 'uColor2'),
        uColor3: gl.getUniformLocation(shaderProgram, 'uColor3'),
        uMix: gl.getUniformLocation(shaderProgram, 'uMix'),
    };

    resizeShader();
}

function resizeShader() {
    if (!gl) return;
    shaderCanvas.width = window.innerWidth;
    shaderCanvas.height = window.innerHeight;
    gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
}

let shaderStartTime = Date.now();

function renderShader() {
    if (!gl || !shaderProgram) return;

    const time = (Date.now() - shaderStartTime) * 0.001;

    // Smooth color interpolation
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            currentColors[i][j] += (targetColors[i][j] - currentColors[i][j]) * 0.02;
        }
    }

    gl.uniform1f(shaderUniforms.uTime, time);
    gl.uniform2f(shaderUniforms.uResolution, shaderCanvas.width, shaderCanvas.height);
    gl.uniform2f(shaderUniforms.uMouse, mouseX, mouseY);
    gl.uniform3fv(shaderUniforms.uColor1, currentColors[0]);
    gl.uniform3fv(shaderUniforms.uColor2, currentColors[1]);
    gl.uniform3fv(shaderUniforms.uColor3, currentColors[2]);
    gl.uniform1f(shaderUniforms.uMix, scrollMix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(renderShader);
}

// --- Particle Mist System ---
const particleCanvas = document.getElementById('particle-canvas');
const pctx = particleCanvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 80;

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

class MistParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * particleCanvas.height;
    }

    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = particleCanvas.height + 50;
        this.size = Math.random() * 80 + 40;
        this.speedY = -(Math.random() * 0.5 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.08 + 0.02;
        this.life = 1;
        this.maxLife = Math.random() * 300 + 200;
        this.age = 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.age++;
        this.life = 1 - (this.age / this.maxLife);
        if (this.life <= 0 || this.y < -100) {
            this.reset();
        }
    }

    draw(ctx) {
        const alpha = this.opacity * this.life;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(201, 169, 97, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(201, 169, 97, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(201, 169, 97, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new MistParticle());
    }
}

function renderParticles() {
    pctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw(pctx);
    });
    requestAnimationFrame(renderParticles);
}

// --- Scroll Animations ---
function initScrollAnimations() {
    // Color palette transitions based on scroll
    const sections = document.querySelectorAll('[data-color]');
    sections.forEach((sec) => {
        const palette = sec.dataset.color;
        if (colorPalettes[palette]) {
            ScrollTrigger.create({
                trigger: sec,
                start: 'top 60%',
                end: 'bottom 40%',
                onEnter: () => { targetColors = colorPalettes[palette].map(c => [...c]); },
                onEnterBack: () => { targetColors = colorPalettes[palette].map(c => [...c]); },
            });
        }
    });

    // Liquid progress bar
    ScrollTrigger.create({
        trigger: '#content',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            document.querySelector('.liquid-fill::after');
            const fill = document.querySelector('.liquid-fill');
            if (fill) {
                fill.style.setProperty('--fill', (self.progress * 100) + '%');
            }
            // Update via style element
            scrollMix = self.progress;
        },
    });

    // Update liquid fill via direct CSS
    const liquidFill = document.querySelector('.liquid-fill');
    ScrollTrigger.create({
        trigger: '#content',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            liquidFill.style.cssText = `--fill: ${(self.progress * 100)}%;`;
            // Use a child element approach
            const after = liquidFill.querySelector('.liquid-fill-inner');
            if (after) {
                after.style.height = (self.progress * 100) + '%';
            }
        },
    });

    // Hero text animation
    gsap.from('.title-word', {
        y: '100%',
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.5,
    });

    gsap.from('.hero-tagline', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 1,
    });

    gsap.from('.scroll-hint', {
        opacity: 0,
        duration: 1,
        delay: 1.5,
    });

    gsap.from('.bottle-container', {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 1.5,
        delay: 0.3,
        ease: 'power2.out',
    });

    // Note sections
    document.querySelectorAll('.note-section').forEach((sec) => {
        const circle = sec.querySelector('.note-circle');
        const text = sec.querySelector('.note-text');

        gsap.from(circle, {
            scale: 0.5,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: sec,
                start: 'top 70%',
            },
        });

        gsap.from(text.children, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: sec,
                start: 'top 65%',
            },
        });
    });

    // Collection cards
    gsap.from('.perfume-card', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.collection-grid',
            start: 'top 75%',
        },
    });

    gsap.from('.collection-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.collection-header',
            start: 'top 80%',
        },
    });

    // Quote
    gsap.from('.quote > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.quote-section',
            start: 'top 70%',
        },
    });

    // Contact
    gsap.from('.contact-inner > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 75%',
        },
    });

    // Parallax on bottle
    gsap.to('.bottle-container', {
        y: -100,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
    });
}

// --- Mouse Tracking ---
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = 1.0 - (e.clientY / window.innerHeight);
});

// --- Resize ---
window.addEventListener('resize', () => {
    resizeShader();
    resizeParticleCanvas();
});

// --- Init ---
function init() {
    // Add liquid fill inner element for progress
    const liquidFill = document.querySelector('.liquid-fill');
    const liquidInner = document.createElement('div');
    liquidInner.className = 'liquid-fill-inner';
    liquidInner.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:0%;background:linear-gradient(to top, var(--accent), transparent);transition:height 0.1s linear;';
    liquidFill.appendChild(liquidInner);

    initShader();
    resizeParticleCanvas();
    initParticles();
    renderShader();
    renderParticles();

    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initScrollAnimations();
    }, 1500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
