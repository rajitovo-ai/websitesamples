// Studio Lumière — 3D Hair Transformation
// Three.js 3D head with customizable hair (color, length, style)

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
        const target = parseFloat(el.dataset.target);
        const isFloat = target % 1 !== 0;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString('nl-NL');
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
document.getElementById('afspraak-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Aanvragen'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D HAIR FLOW SCENE ============
let heroScene, heroCamera, heroRenderer, hairStrands = [];
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('hair-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x120810, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Soft pink lighting
    heroScene.add(new THREE.AmbientLight(0x3a2a30, 0.4));
    const key = new THREE.DirectionalLight(0xffd0e0, 1.0);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xe8a0c8, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const accent = new THREE.PointLight(0xe8a0c8, 1.0, 15);
    accent.position.set(0, 3, -3);
    heroScene.add(accent);

    // Floating hair strands
    createHairStrands();

    // Sparkle particles
    createSparkles();

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

function createHairStrands() {
    const strandMat = new THREE.MeshStandardMaterial({ color: 0xe8a0c8, roughness: 0.6, emissive: 0x6a3050, emissiveIntensity: 0.2 });
    for (let i = 0; i < 30; i++) {
        const strand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 2 + Math.random() * 2, 6),
            strandMat
        );
        const angle = (i / 30) * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        strand.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 4,
            Math.sin(angle) * radius - 2
        );
        strand.rotation.set(
            Math.random() * 0.3,
            Math.random() * Math.PI,
            Math.random() * 0.3
        );
        strand.userData = {
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
            baseY: strand.position.y,
            baseRot: strand.rotation.clone()
        };
        hairStrands.push(strand);
        heroScene.add(strand);
    }
}

function createSparkles() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = -2 + Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = 0.005 + Math.random() * 0.015;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    const sparkles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xe8a0c8, size: 0.1, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending
    }));
    sparkles.userData = { isSparkle: true };
    heroScene.add(sparkles);
    heroScene.userData = { sparkles };
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

    // Hair strands sway
    hairStrands.forEach(strand => {
        const phase = heroTime * strand.userData.floatSpeed + strand.userData.floatPhase;
        strand.position.y = strand.userData.baseY + Math.sin(phase) * 0.3;
        strand.rotation.z = strand.userData.baseRot.z + Math.sin(phase) * 0.2;
        strand.rotation.x = strand.userData.baseRot.x + Math.cos(phase * 0.7) * 0.1;
    });

    // Sparkles
    if (heroScene.userData.sparkles) {
        const sp = heroScene.userData.sparkles;
        const pos = sp.geometry.attributes.position.array;
        const vel = sp.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i += 3) {
            pos[i] += vel[i];
            pos[i + 1] += vel[i + 1];
            pos[i + 2] += vel[i + 2];
            if (pos[i + 1] > 6) {
                pos[i] = (Math.random() - 0.5) * 12;
                pos[i + 1] = -2;
                pos[i + 2] = (Math.random() - 0.5) * 10;
            }
        }
        sp.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ 3D HAIR TRANSFORMATOR ============
let transformScene, transformCamera, transformRenderer, headModel, hairGroup;
let transformDragging = false, transformLastX = 0, transformRotY = 0;
let currentColor = 0x3a2418, currentLength = 'short', currentStyle = 'straight';

function initTransform() {
    const canvas = document.getElementById('transform-canvas');
    const wrap = canvas.parentElement;

    transformScene = new THREE.Scene();
    transformScene.fog = new THREE.Fog(0x120810, 8, 25);

    transformCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    transformCamera.position.set(0, 2, 7);
    transformCamera.lookAt(0, 1.5, 0);

    transformRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    transformRenderer.setSize(wrap.clientWidth || 600, 450);
    transformRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    transformScene.add(new THREE.AmbientLight(0x3a2a30, 0.4));
    const key = new THREE.DirectionalLight(0xffd0e0, 1.2);
    key.position.set(3, 5, 3);
    transformScene.add(key);
    const fill = new THREE.DirectionalLight(0xe8a0c8, 0.5);
    fill.position.set(-3, 3, -3);
    transformScene.add(fill);

    // Build head
    buildHead();

    // Controls
    canvas.addEventListener('mousedown', (e) => { transformDragging = true; transformLastX = e.clientX; });
    window.addEventListener('mouseup', () => transformDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (transformDragging) { transformRotY += (e.clientX - transformLastX) * 0.01; transformLastX = e.clientX; }
    });
    canvas.addEventListener('touchstart', (e) => { transformDragging = true; transformLastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => transformDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (transformDragging) { transformRotY += (e.touches[0].clientX - transformLastX) * 0.01; transformLastX = e.touches[0].clientX; }
    });

    const ro = new ResizeObserver(() => {
        transformCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 450);
        transformCamera.updateProjectionMatrix();
        transformRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 450);
    });
    ro.observe(wrap);

    animateTransform();
}

function buildHead() {
    if (headModel) transformScene.remove(headModel);
    headModel = new THREE.Group();

    // Head sphere
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8c8a0, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 24), skinMat);
    head.scale.set(0.9, 1.1, 1);
    head.position.y = 1.5;
    headModel.add(head);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1, 16), skinMat);
    neck.position.y = 0.3;
    headModel.add(neck);

    // Shoulders
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 1), skinMat);
    shoulders.position.y = -0.2;
    headModel.add(shoulders);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.1 });
    [-0.35, 0.35].forEach(x => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), eyeMat);
        eye.position.set(x, 1.7, 0.95);
        eye.scale.set(1.2, 0.8, 0.5);
        headModel.add(eye);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), pupilMat);
        pupil.position.set(x, 1.7, 1.08);
        headModel.add(pupil);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), skinMat);
    nose.position.set(0, 1.4, 1.1);
    nose.rotation.x = Math.PI / 2;
    headModel.add(nose);

    // Lips
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xc87080, roughness: 0.5 });
    const lips = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.1), lipMat);
    lips.position.set(0, 1.15, 1.05);
    headModel.add(lips);

    // Hair
    buildHair();

    transformScene.add(headModel);
}

function buildHair() {
    if (hairGroup) headModel.remove(hairGroup);
    hairGroup = new THREE.Group();

    const hairMat = new THREE.MeshStandardMaterial({ color: currentColor, roughness: 0.7, metalness: 0.1 });

    // Length settings
    const lengthScale = { short: 0.5, medium: 1.5, long: 3.0 };
    const len = lengthScale[currentLength];

    // Hair cap on top of head
    const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.15, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
        hairMat
    );
    cap.scale.set(0.95, 1.1, 1);
    cap.position.y = 1.5;
    hairGroup.add(cap);

    // Hair strands flowing down
    const strandCount = currentStyle === 'curly' ? 40 : currentStyle === 'wavy' ? 30 : 25;
    for (let i = 0; i < strandCount; i++) {
        const angle = (i / strandCount) * Math.PI * 2;
        const r = 1.1;

        // Start position on head
        const startX = Math.cos(angle) * r * 0.85;
        const startZ = Math.sin(angle) * r;
        const startY = 2.2 + Math.cos(angle * 2) * 0.3;

        // Create strand as a curved tube
        const points = [];
        const segments = 8;
        for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            let x = startX * (1 - t * 0.3);
            let y = startY - t * len;
            let z = startZ * (1 - t * 0.2);

            // Style variations
            if (currentStyle === 'wavy') {
                x += Math.sin(t * Math.PI * 3 + angle) * 0.15;
                z += Math.cos(t * Math.PI * 3 + angle) * 0.1;
            } else if (currentStyle === 'curly') {
                x += Math.sin(t * Math.PI * 6 + angle) * 0.2;
                z += Math.cos(t * Math.PI * 6 + angle) * 0.15;
                y -= Math.sin(t * Math.PI * 4) * 0.1;
            }

            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, segments, 0.04, 4, false);
        const strand = new THREE.Mesh(tubeGeo, hairMat);
        hairGroup.add(strand);
    }

    // Bangs (front hair)
    if (currentLength !== 'short' || currentStyle !== 'curly') {
        for (let i = 0; i < 8; i++) {
            const angle = -Math.PI / 2 + (i / 7 - 0.5) * 1.2;
            const points = [];
            const startX = Math.cos(angle) * 1.0;
            const startZ = Math.sin(angle) * 1.0;
            for (let s = 0; s <= 5; s++) {
                const t = s / 5;
                let x = startX * (1 - t * 0.5);
                let y = 2.3 - t * 0.6;
                let z = startZ + t * 0.3;
                if (currentStyle === 'wavy') x += Math.sin(t * Math.PI * 2) * 0.05;
                if (currentStyle === 'curly') { x += Math.sin(t * Math.PI * 4) * 0.08; y -= Math.sin(t * Math.PI * 3) * 0.05; }
                points.push(new THREE.Vector3(x, y, z));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeo = new THREE.TubeGeometry(curve, 5, 0.05, 4, false);
            hairGroup.add(new THREE.Mesh(tubeGeo, hairMat));
        }
    }

    headModel.add(hairGroup);
}

// Color picker
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = parseInt(btn.dataset.color.replace('#', '0x'));
        document.getElementById('sum-color').textContent = btn.dataset.name;
        buildHair();
    });
});

// Length picker
document.querySelectorAll('.length-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.length-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLength = btn.dataset.length;
        document.getElementById('sum-length').textContent = btn.textContent;
        buildHair();
    });
});

// Style picker
document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStyle = btn.dataset.style;
        document.getElementById('sum-style').textContent = btn.textContent;
        buildHair();
    });
});

let transformTime = 0;
function animateTransform() {
    requestAnimationFrame(animateTransform);
    transformTime += 0.01;

    if (!transformDragging) transformRotY += 0.005;
    if (headModel) {
        headModel.rotation.y = transformRotY;
        headModel.position.y = Math.sin(transformTime * 0.5) * 0.05;
    }

    transformRenderer.render(transformScene, transformCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const transformSection = document.getElementById('transform');
    const tObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !transformScene) { initTransform(); tObs.disconnect(); }
    }, { threshold: 0.1 });
    tObs.observe(transformSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.dienst-card', { scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.team-card', { scrollTrigger: { trigger: '.team-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.prijs-row', { scrollTrigger: { trigger: '.prijzen-list', start: 'top 75%' }, x: -20, opacity: 0, stagger: 0.05, duration: 0.5 });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
