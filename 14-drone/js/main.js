// AerialVision — 3D Drone Flight Experience
// Three.js drone flying through procedural landscape with scroll control

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
document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Verstuur Aanvraag'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D DRONE SCENE ============
let heroScene, heroCamera, heroRenderer, heroDrone, landscape, clouds = [];
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('drone-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x060a08, 30, 100);

    heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    heroCamera.position.set(0, 15, 25);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    heroScene.add(new THREE.AmbientLight(0x4a5a4a, 0.4));
    const sun = new THREE.DirectionalLight(0xaaffcc, 1.0);
    sun.position.set(20, 30, 10);
    heroScene.add(sun);
    const fill = new THREE.DirectionalLight(0x00ff88, 0.3);
    fill.position.set(-10, 5, -10);
    heroScene.add(fill);

    // Sky gradient
    const skyGeo = new THREE.SphereGeometry(150, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: { top: { value: new THREE.Color(0x0a1a14) }, bottom: { value: new THREE.Color(0x1a3a2a) } },
        vertexShader: 'varying vec3 vP; void main() { vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main() { float h = normalize(vP).y; gl_FragColor = vec4(mix(bottom, top, max(h,0.0)), 1.0); }',
        side: THREE.BackSide
    });
    heroScene.add(new THREE.Mesh(skyGeo, skyMat));

    // Landscape — procedural terrain
    createLandscape();

    // Drone
    heroDrone = buildDrone();
    heroDrone.position.set(0, 12, 0);
    heroScene.add(heroDrone);

    // Clouds
    createClouds();

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

function createLandscape() {
    const size = 120;
    const segs = 60;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    const pos = geo.attributes.position;

    // Procedural height map
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const h = Math.sin(x * 0.1) * 3 + Math.cos(y * 0.1) * 3 + Math.sin(x * 0.05 + y * 0.05) * 5;
        pos.setZ(i, h - dist * 0.05);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
        color: 0x1a3a2a, roughness: 0.9, flatShading: true,
        vertexColors: false
    });

    landscape = new THREE.Mesh(geo, mat);
    landscape.rotation.x = -Math.PI / 2;
    landscape.position.y = -2;
    heroScene.add(landscape);

    // Trees — simple cones scattered
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2a5a3a, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
    for (let i = 0; i < 40; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        const dist = Math.sqrt(x * x + z * z);
        if (dist < 8) continue;

        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6), trunkMat);
        trunk.position.y = 0.75;
        tree.add(trunk);
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 6), treeMat);
        leaves.position.y = 2.5;
        tree.add(leaves);
        tree.position.set(x, -2 + Math.sin(x * 0.1) * 3 + Math.cos(z * 0.1) * 3, z);
        tree.scale.setScalar(0.5 + Math.random() * 0.5);
        heroScene.add(tree);
    }
}

function buildDrone() {
    const drone = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222228, metalness: 0.7, roughness: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.3 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.4 });

    // Central body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 1.5), bodyMat);
    drone.add(body);

    // Camera gimbal
    const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), bodyMat);
    gimbal.position.y = -0.35;
    drone.add(gimbal);
    const cameraLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.15, 8), accentMat);
    cameraLens.position.y = -0.45;
    cameraLens.rotation.x = Math.PI / 2;
    drone.add(cameraLens);

    // Arms (X-frame)
    const armPositions = [[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1]];
    const props = [];
    armPositions.forEach(pos => {
        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6),
            bodyMat
        );
        arm.position.set(pos[0] * 0.8, 0, pos[2] * 0.8);
        arm.rotation.z = Math.atan2(pos[2], pos[0]) + Math.PI / 2;
        arm.rotation.x = Math.PI / 2;
        drone.add(arm);

        // Motor
        const motor = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8),
            bodyMat
        );
        motor.position.set(pos[0], 0.1, pos[2]);
        drone.add(motor);

        // Propeller
        const prop = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.02, 0.15),
            propMat
        );
        prop.position.set(pos[0], 0.25, pos[2]);
        prop.userData = { speed: 0.5 + Math.random() * 0.3, dir: Math.random() > 0.5 ? 1 : -1 };
        props.push(prop);
        drone.add(prop);

        // LED
        const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            accentMat
        );
        led.position.set(pos[0], -0.1, pos[2]);
        drone.add(led);
    });

    drone.userData = { props };
    return drone;
}

function createClouds() {
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0x2a3a32, transparent: true, opacity: 0.15 });
    for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Group();
        for (let j = 0; j < 5; j++) {
            const puff = new THREE.Mesh(
                new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6),
                cloudMat
            );
            puff.position.set(j * 2.5 - 5, Math.random() * 1, Math.random() * 2 - 1);
            cloud.add(puff);
        }
        cloud.position.set((Math.random() - 0.5) * 80, 20 + Math.random() * 10, (Math.random() - 0.5) * 80);
        cloud.userData = { speed: 0.02 + Math.random() * 0.02 };
        clouds.push(cloud);
        heroScene.add(cloud);
    }
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Drone flies forward and up based on scroll
    heroDrone.position.x = Math.sin(heroTime * 0.3) * 5 + heroMouseX * 3;
    heroDrone.position.y = 12 + scrollProgress * 8 + Math.sin(heroTime * 0.5) * 0.5;
    heroDrone.position.z = -scrollProgress * 30;
    heroDrone.rotation.y = heroTime * 0.2 + heroMouseX * 0.3;
    heroDrone.rotation.x = Math.sin(heroTime * 0.5) * 0.05;
    heroDrone.rotation.z = Math.sin(heroTime * 0.3) * 0.05 + heroMouseX * 0.1;

    // Propellers spin
    heroDrone.userData.props.forEach(prop => {
        prop.rotation.y += prop.userData.speed * prop.userData.dir;
    });

    // Camera follows drone
    heroCamera.position.x = heroDrone.position.x * 0.3;
    heroCamera.position.y = heroDrone.position.y - 3 + heroMouseY * 2;
    heroCamera.position.z = heroDrone.position.z + 12;
    heroCamera.lookAt(heroDrone.position.x, heroDrone.position.y - 1, heroDrone.position.z - 5);

    // Clouds drift
    clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 50) cloud.position.x = -50;
    });

    heroRenderer.render(heroScene, heroCamera);
}

// ============ FLIGHT SIMULATOR ============
let flightScene, flightCamera, flightRenderer, flightDrone;
let flightDragging = false, flightLastX = 0, flightLastY = 0;
let flightRotY = 0, flightRotX = 0, flightAlt = 10;

function initFlight() {
    const canvas = document.getElementById('flight-canvas');
    const wrap = canvas.parentElement;

    flightScene = new THREE.Scene();
    flightScene.fog = new THREE.Fog(0x060a08, 25, 80);

    flightCamera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 200);
    flightCamera.position.set(0, 10, 20);

    flightRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    flightRenderer.setSize(wrap.clientWidth || 600, 500);
    flightRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    flightScene.add(new THREE.AmbientLight(0x4a5a4a, 0.4));
    const sun = new THREE.DirectionalLight(0xaaffcc, 1.0);
    sun.position.set(20, 30, 10);
    flightScene.add(sun);

    // Sky
    const skyGeo = new THREE.SphereGeometry(120, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: { top: { value: new THREE.Color(0x0a1a14) }, bottom: { value: new THREE.Color(0x1a3a2a) } },
        vertexShader: 'varying vec3 vP; void main() { vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main() { float h = normalize(vP).y; gl_FragColor = vec4(mix(bottom, top, max(h,0.0)), 1.0); }',
        side: THREE.BackSide
    });
    flightScene.add(new THREE.Mesh(skyGeo, skyMat));

    // Terrain
    const size = 100, segs = 50;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin(x * 0.1) * 3 + Math.cos(y * 0.1) * 3 + Math.sin(x * 0.05 + y * 0.05) * 5);
    }
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x1a3a2a, roughness: 0.9, flatShading: true }));
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -2;
    flightScene.add(terrain);

    // Trees
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2a5a3a, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() - 0.5) * 70;
        const z = (Math.random() - 0.5) * 70;
        if (Math.sqrt(x * x + z * z) < 6) continue;
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6), trunkMat);
        trunk.position.y = 0.75;
        tree.add(trunk);
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 6), treeMat);
        leaves.position.y = 2.5;
        tree.add(leaves);
        tree.position.set(x, -2, z);
        tree.scale.setScalar(0.5 + Math.random() * 0.5);
        flightScene.add(tree);
    }

    // Drone
    flightDrone = buildDrone();
    flightDrone.position.set(0, 10, 0);
    flightScene.add(flightDrone);

    // Controls
    canvas.addEventListener('mousedown', (e) => { flightDragging = true; flightLastX = e.clientX; flightLastY = e.clientY; });
    window.addEventListener('mouseup', () => flightDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (flightDragging) {
            flightRotY += (e.clientX - flightLastX) * 0.01;
            flightAlt = Math.max(3, Math.min(25, flightAlt - (e.clientY - flightLastY) * 0.1));
            flightLastX = e.clientX; flightLastY = e.clientY;
        }
    });
    canvas.addEventListener('touchstart', (e) => { flightDragging = true; flightLastX = e.touches[0].clientX; flightLastY = e.touches[0].clientY; });
    window.addEventListener('touchend', () => flightDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (flightDragging) {
            flightRotY += (e.touches[0].clientX - flightLastX) * 0.01;
            flightAlt = Math.max(3, Math.min(25, flightAlt - (e.touches[0].clientY - flightLastY) * 0.1));
            flightLastX = e.touches[0].clientX; flightLastY = e.touches[0].clientY;
        }
    });

    const ro = new ResizeObserver(() => {
        flightCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 500);
        flightCamera.updateProjectionMatrix();
        flightRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 500);
    });
    ro.observe(wrap);

    animateFlight();
}

let flightTime = 0, flightDistance = 0;
function animateFlight() {
    requestAnimationFrame(animateFlight);
    flightTime += 0.01;
    flightDistance += 0.15;

    if (!flightDragging) flightRotY += 0.003;

    flightDrone.position.x = Math.sin(flightRotY) * flightDistance * 0.3;
    flightDrone.position.z = Math.cos(flightRotY) * flightDistance * 0.3;
    flightDrone.position.y = flightAlt + Math.sin(flightTime * 0.5) * 0.3;
    flightDrone.rotation.y = flightRotY + Math.PI;
    flightDrone.rotation.x = Math.sin(flightTime * 0.5) * 0.05;
    flightDrone.rotation.z = Math.sin(flightTime * 0.3) * 0.05;

    // Props spin
    flightDrone.userData.props.forEach(prop => { prop.rotation.y += prop.userData.speed * prop.userData.dir; });

    // Camera follows
    const camDist = 8;
    flightCamera.position.x = flightDrone.position.x - Math.sin(flightRotY) * camDist;
    flightCamera.position.z = flightDrone.position.z - Math.cos(flightRotY) * camDist;
    flightCamera.position.y = flightDrone.position.y - 2;
    flightCamera.lookAt(flightDrone.position);

    // Update HUD
    const hudAlt = document.getElementById('hud-alt');
    const hudSpd = document.getElementById('hud-spd');
    const hudDir = document.getElementById('hud-dir');
    const hudBat = document.getElementById('hud-bat');
    if (hudAlt) hudAlt.textContent = Math.round(flightAlt * 2) + 'm';
    if (hudSpd) hudSpd.textContent = '15 m/s';
    if (hudDir) {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        hudDir.textContent = dirs[Math.round((flightRotY / (Math.PI * 2)) * 8) % 8];
    }
    if (hudBat) hudBat.textContent = Math.max(20, 100 - Math.floor(flightDistance / 5)) + '%';

    flightRenderer.render(flightScene, flightCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const flightSection = document.getElementById('flight');
    const fObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !flightScene) { initFlight(); fObs.disconnect(); }
    }, { threshold: 0.1 });
    fObs.observe(flightSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.dienst-card', { scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.portfolio-item', { scrollTrigger: { trigger: '.portfolio-grid', start: 'top 75%' }, scale: 0.9, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
