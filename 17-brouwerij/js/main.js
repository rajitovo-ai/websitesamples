// Brouwerij Drie Eiken — 3D Beer Pouring Animation
// Three.js beer glass filling with liquid simulation + foam + bubbles

// ============ LOADER ============
window.addEventListener('load', () => setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1500));

// ============ NAV ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ============ STAT COUNTERS ============
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString('nl-NL');
        }, 25);
    });
}
setTimeout(animateCounters, 1800);

// ============ SCROLL ANIMATIONS ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

// ============ FORM ============
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Geboekt! ✦';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Boek Rondleiding'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D BEER SCENE ============
let heroScene, heroCamera, heroRenderer, heroBubbles = [];
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('beer-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x0e0a06, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm amber lighting
    heroScene.add(new THREE.AmbientLight(0x3a2a10, 0.4));
    const key = new THREE.DirectionalLight(0xffd040, 1.2);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xd4a020, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const warm = new THREE.PointLight(0xff8020, 0.8, 15);
    warm.position.set(0, 2, -3);
    heroScene.add(warm);

    // Floating beer droplets
    createBeerDroplets();

    // Rising bubbles
    createBubbles();

    document.addEventListener('mousemove', (e) => {
        heroMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        heroMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    animateHero();
}

function createBeerDroplets() {
    const beerMat = new THREE.MeshStandardMaterial({ color: 0xd4a020, roughness: 0.3, metalness: 0.2, emissive: 0x8a6010, emissiveIntensity: 0.2 });
    for (let i = 0; i < 20; i++) {
        const drop = new THREE.Mesh(
            new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 12, 8),
            beerMat
        );
        const angle = (i / 20) * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        drop.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 6,
            Math.sin(angle) * radius - 2
        );
        drop.userData = {
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
            baseY: drop.position.y,
            rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 }
        };
        heroScene.add(drop);
        heroBubbles.push(drop); // reuse array for animation
    }
}

function createBubbles() {
    const count = 150;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = -5 + Math.random() * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        velocities[i] = 0.02 + Math.random() * 0.04;
        sizes[i] = 0.05 + Math.random() * 0.1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    const bubbleSystem = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffd040, size: 0.12, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending
    }));
    bubbleSystem.userData = { isBubbles: true };
    heroScene.add(bubbleSystem);
    heroScene.userData = { bubbleSystem };
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera orbit
    heroCamera.position.x = Math.sin(heroTime * 0.1 + heroMouseX * 0.3) * 12;
    heroCamera.position.y = 3 + heroMouseY * 1.5;
    heroCamera.position.z = Math.cos(heroTime * 0.1 + heroMouseX * 0.3) * 12;
    heroCamera.lookAt(0, 0, 0);

    // Droplets float
    heroBubbles.forEach(drop => {
        drop.rotation.x += drop.userData.rotSpeed.x;
        drop.rotation.y += drop.userData.rotSpeed.y;
        drop.position.y = drop.userData.baseY + Math.sin(heroTime * drop.userData.floatSpeed + drop.userData.floatPhase) * 0.5;
    });

    // Bubbles rise
    if (heroScene.userData.bubbleSystem) {
        const bs = heroScene.userData.bubbleSystem;
        const pos = bs.geometry.attributes.position.array;
        const vel = bs.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3 + 1] += vel[i];
            pos[i * 3] += Math.sin(heroTime * 2 + i) * 0.005;
            if (pos[i * 3 + 1] > 6) {
                pos[i * 3 + 1] = -5;
                pos[i * 3] = (Math.random() - 0.5) * 10;
            }
        }
        bs.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ POUR ANIMATION (Canvas 2D) ============
let pourCanvas, pourCtx, pourProgress = 0;
let pourBubbles = [], pourStream = [];

function initPour() {
    pourCanvas = document.getElementById('pour-canvas');
    const wrap = pourCanvas.parentElement;
    pourCtx = pourCanvas.getContext('2d');

    function resize() {
        pourCanvas.width = wrap.clientWidth;
        pourCanvas.height = wrap.clientHeight || 400;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Initialize bubbles
    for (let i = 0; i < 30; i++) {
        pourBubbles.push({
            x: 0, y: 0, r: 1 + Math.random() * 3,
            speed: 0.5 + Math.random() * 1.5,
            active: false
        });
    }

    animatePour();
}

let pourTime = 0;
function animatePour() {
    requestAnimationFrame(animatePour);
    pourTime += 0.016;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const targetProgress = Math.min(scrollY / maxScroll, 1);
    pourProgress += (targetProgress - pourProgress) * 0.05;

    const w = pourCanvas.width;
    const h = pourCanvas.height;
    pourCtx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = pourCtx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1e160c');
    bgGrad.addColorStop(1, '#0e0a06');
    pourCtx.fillStyle = bgGrad;
    pourCtx.fillRect(0, 0, w, h);

    // Glass dimensions
    const glassW = 120;
    const glassH = 280;
    const glassX = w / 2 - glassW / 2;
    const glassY = h / 2 - glassH / 2;
    const glassBottom = glassY + glassH;
    const glassTop = glassY;

    // Glass tilt based on progress (45° at start, straight at 2/3)
    const tiltAngle = pourProgress < 0.6 ? (1 - pourProgress / 0.6) * Math.PI / 4 : 0;

    pourCtx.save();
    pourCtx.translate(w / 2, h / 2);
    pourCtx.rotate(tiltAngle);
    pourCtx.translate(-w / 2, -h / 2);

    // Draw glass outline
    pourCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    pourCtx.lineWidth = 2;
    pourCtx.beginPath();
    pourCtx.moveTo(glassX, glassTop);
    pourCtx.lineTo(glassX, glassBottom);
    pourCtx.lineTo(glassX + glassW, glassBottom);
    pourCtx.lineTo(glassX + glassW, glassTop);
    pourCtx.stroke();

    // Glass bottom curve
    pourCtx.beginPath();
    pourCtx.moveTo(glassX, glassBottom);
    pourCtx.quadraticCurveTo(glassX + glassW / 2, glassBottom + 10, glassX + glassW, glassBottom);
    pourCtx.stroke();

    // Beer fill level
    const fillLevel = Math.min(pourProgress * 1.3, 1);
    const beerH = glassH * fillLevel;
    const beerY = glassBottom - beerH;

    if (fillLevel > 0) {
        // Beer liquid
        const beerGrad = pourCtx.createLinearGradient(0, beerY, 0, glassBottom);
        beerGrad.addColorStop(0, '#e8b830');
        beerGrad.addColorStop(0.5, '#d4a020');
        beerGrad.addColorStop(1, '#b08018');
        pourCtx.fillStyle = beerGrad;
        pourCtx.fillRect(glassX + 2, beerY, glassW - 4, beerH);

        // Beer surface highlight
        pourCtx.fillStyle = 'rgba(255,220,100,0.3)';
        pourCtx.fillRect(glassX + 2, beerY, glassW - 4, 4);

        // Foam head (appears when glass is mostly straight)
        if (pourProgress > 0.5) {
            const foamProgress = (pourProgress - 0.5) / 0.5;
            const foamH = 25 * Math.min(foamProgress, 1);
            const foamY = beerY - foamH;

            // Foam
            pourCtx.fillStyle = '#f8e8b0';
            pourCtx.beginPath();
            pourCtx.moveTo(glassX + 2, foamY + foamH);
            // Bubbly foam top
            for (let x = 0; x <= glassW - 4; x += 8) {
                const bubbleY = foamY + Math.sin(pourTime * 3 + x * 0.1) * 3;
                pourCtx.lineTo(glassX + 2 + x, bubbleY);
            }
            pourCtx.lineTo(glassX + glassW - 2, foamY + foamH);
            pourCtx.closePath();
            pourCtx.fill();

            // Foam bubbles
            pourCtx.fillStyle = 'rgba(255,240,180,0.6)';
            for (let i = 0; i < 8; i++) {
                const fx = glassX + 10 + i * 14;
                const fy = foamY + Math.sin(pourTime * 2 + i) * 4 + 5;
                pourCtx.beginPath();
                pourCtx.arc(fx, fy, 3 + Math.sin(pourTime + i) * 1, 0, Math.PI * 2);
                pourCtx.fill();
            }
        }

        // Rising bubbles inside beer
        pourCtx.fillStyle = 'rgba(255,240,180,0.4)';
        pourBubbles.forEach(b => {
            if (fillLevel > 0.1) {
                if (!b.active && Math.random() < 0.02) {
                    b.active = true;
                    b.x = glassX + 10 + Math.random() * (glassW - 20);
                    b.y = glassBottom - 5;
                }
                if (b.active) {
                    b.y -= b.speed;
                    pourCtx.beginPath();
                    pourCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    pourCtx.fill();
                    if (b.y < beerY) b.active = false;
                }
            }
        });
    }

    // Beer stream from top (when pouring)
    if (pourProgress > 0.05 && pourProgress < 0.85) {
        const streamX = w / 2 + Math.sin(tiltAngle) * 40;
        const streamStartY = glassTop - 60;
        pourCtx.strokeStyle = 'rgba(212,160,32,0.6)';
        pourCtx.lineWidth = 6;
        pourCtx.beginPath();
        pourCtx.moveTo(streamX, streamStartY);
        // Wavy stream
        for (let y = streamStartY; y < beerY; y += 5) {
            const wave = Math.sin(y * 0.05 + pourTime * 5) * 2;
            pourCtx.lineTo(streamX + wave, y);
        }
        pourCtx.stroke();

        // Stream glow
        pourCtx.strokeStyle = 'rgba(255,200,60,0.3)';
        pourCtx.lineWidth = 12;
        pourCtx.beginPath();
        pourCtx.moveTo(streamX, streamStartY);
        for (let y = streamStartY; y < beerY; y += 5) {
            const wave = Math.sin(y * 0.05 + pourTime * 5) * 2;
            pourCtx.lineTo(streamX + wave, y);
        }
        pourCtx.stroke();

        // Splash particles at impact
        if (fillLevel > 0) {
            pourCtx.fillStyle = 'rgba(255,200,60,0.5)';
            for (let i = 0; i < 5; i++) {
                const sx = streamX + (Math.random() - 0.5) * 30;
                const sy = beerY + Math.random() * 10;
                pourCtx.beginPath();
                pourCtx.arc(sx, sy, 1 + Math.random() * 2, 0, Math.PI * 2);
                pourCtx.fill();
            }
        }
    }

    pourCtx.restore();

    // Glass reflection
    pourCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    pourCtx.lineWidth = 1;
    pourCtx.beginPath();
    pourCtx.moveTo(glassX + 10, glassTop + 10);
    pourCtx.lineTo(glassX + 10, glassBottom - 10);
    pourCtx.stroke();
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
}

// Pour animation uses Canvas 2D, init when section visible
const pourSection = document.getElementById('schenken');
const pObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !pourCanvas) { initPour(); pObs.disconnect(); }
}, { threshold: 0.1 });
pObs.observe(pourSection);

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.bier-card', { scrollTrigger: { trigger: '.bieren-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.brouw-step', { scrollTrigger: { trigger: '.brouwen-steps', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.schenk-step', { scrollTrigger: { trigger: '.schenken-steps', start: 'top 80%' }, x: -30, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
