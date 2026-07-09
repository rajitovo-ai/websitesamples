// Hout&Hand — 3D Chair Assembly Meubelmaker
// Three.js chair that assembles from parts on scroll + configurator

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
document.getElementById('offerte-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Verzonden! ✦';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Verstuur Aanvraag'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D CHAIR ASSEMBLY ============
let heroScene, heroCamera, heroRenderer, chairParts = [], heroMouseX = 0, heroMouseY = 0;
let woodShavings = [];

function initHero() {
    const canvas = document.getElementById('chair-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x1a140e, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 5, 15);
    heroCamera.lookAt(0, 2, 0);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.shadowMap.enabled = true;
    heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting — warm workshop lighting
    heroScene.add(new THREE.AmbientLight(0x4a3a2a, 0.5));
    const key = new THREE.DirectionalLight(0xffd9a0, 1.2);
    key.position.set(5, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xb8783a, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const rim = new THREE.PointLight(0xff8844, 0.8, 20);
    rim.position.set(0, 3, -5);
    heroScene.add(rim);

    // Ground — workshop floor
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    heroScene.add(floor);

    // Build chair parts
    buildChairParts();

    // Wood shavings particles
    createWoodShavings();

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

function buildChairParts() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb8783a, roughness: 0.6, metalness: 0.1 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.6 });

    // Part 1: Seat (comes in first)
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.3, 3),
        woodMat
    );
    seat.position.set(0, 5, 0); // Start above
    seat.castShadow = true;
    seat.userData = { targetY: 2.5, targetX: 0, targetZ: 0, delay: 0, rotStart: Math.PI };
    chairParts.push(seat);
    heroScene.add(seat);

    // Part 2: Backrest
    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3.5, 0.3),
        woodMat
    );
    backrest.position.set(0, 8, -1.5);
    backrest.castShadow = true;
    backrest.userData = { targetY: 4.2, targetX: 0, targetZ: -1.35, delay: 0.15, rotStart: Math.PI };
    chairParts.push(backrest);
    heroScene.add(backrest);

    // Part 3: Front left leg
    const leg1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2.5, 0.4),
        darkWoodMat
    );
    leg1.position.set(-1.3, 8, 1.3);
    leg1.castShadow = true;
    leg1.userData = { targetY: 1.25, targetX: -1.3, targetZ: 1.3, delay: 0.3, rotStart: 0 };
    chairParts.push(leg1);
    heroScene.add(leg1);

    // Part 4: Front right leg
    const leg2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2.5, 0.4),
        darkWoodMat
    );
    leg2.position.set(1.3, 8, 1.3);
    leg2.castShadow = true;
    leg2.userData = { targetY: 1.25, targetX: 1.3, targetZ: 1.3, delay: 0.35, rotStart: 0 };
    chairParts.push(leg2);
    heroScene.add(leg2);

    // Part 5: Back left leg
    const leg3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 5, 0.4),
        darkWoodMat
    );
    leg3.position.set(-1.3, 10, -1.3);
    leg3.castShadow = true;
    leg3.userData = { targetY: 2.5, targetX: -1.3, targetZ: -1.3, delay: 0.4, rotStart: 0 };
    chairParts.push(leg3);
    heroScene.add(leg3);

    // Part 6: Back right leg
    const leg4 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 5, 0.4),
        darkWoodMat
    );
    leg4.position.set(1.3, 10, -1.3);
    leg4.castShadow = true;
    leg4.userData = { targetY: 2.5, targetX: 1.3, targetZ: -1.3, delay: 0.45, rotStart: 0 };
    chairParts.push(leg4);
    heroScene.add(leg4);

    // Part 7: Backrest slats (decorative)
    for (let i = 0; i < 3; i++) {
        const slat = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.15, 0.15),
            woodMat
        );
        slat.position.set(0, 12 + i * 0.3, -1.3);
        slat.castShadow = true;
        slat.userData = { targetY: 3.5 + i * 0.8, targetX: 0, targetZ: -1.25, delay: 0.55 + i * 0.05, rotStart: Math.PI };
        chairParts.push(slat);
        heroScene.add(slat);
    }

    // Part 8: Stretchers (cross supports)
    const stretcher1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8),
        darkWoodMat
    );
    stretcher1.position.set(0, 8, 1.3);
    stretcher1.rotation.z = Math.PI / 2;
    stretcher1.castShadow = true;
    stretcher1.userData = { targetY: 0.8, targetX: 0, targetZ: 1.3, delay: 0.65, rotStart: 0, isStretcher: true, baseRot: stretcher1.rotation.clone() };
    chairParts.push(stretcher1);
    heroScene.add(stretcher1);

    const stretcher2 = stretcher1.clone();
    stretcher2.position.set(0, 8, -1.3);
    stretcher2.userData = { targetY: 0.8, targetX: 0, targetZ: -1.3, delay: 0.7, rotStart: 0, isStretcher: true, baseRot: stretcher1.rotation.clone() };
    chairParts.push(stretcher2);
    heroScene.add(stretcher2);
}

function createWoodShavings() {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = Math.random() * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        rotations[i * 3] = Math.random() * Math.PI;
        rotations[i * 3 + 1] = Math.random() * Math.PI;
        rotations[i * 3 + 2] = Math.random() * Math.PI;
        velocities[i] = 0.01 + Math.random() * 0.02;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities, rotations };
    woodShavings = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xb8783a, size: 0.15, transparent: true, opacity: 0.3
    }));
    heroScene.add(woodShavings);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera orbit based on scroll
    const angle = scrollProgress * Math.PI * 1.5 - 0.5 + heroMouseX * 0.3;
    heroCamera.position.x = Math.sin(angle) * 16;
    heroCamera.position.z = Math.cos(angle) * 16;
    heroCamera.position.y = 5 + scrollProgress * 3 + heroMouseY * 1.5;
    heroCamera.lookAt(0, 2.5, 0);

    // Assemble chair parts based on scroll
    const assemblyProgress = Math.min(scrollProgress * 2.5, 1);
    chairParts.forEach(part => {
        const delay = part.userData.delay;
        const partStart = delay;
        const partEnd = delay + 0.2;
        const t = Math.max(0, Math.min(1, (assemblyProgress - partStart) / (partEnd - partStart)));
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Position
        const startY = part.userData.targetY + 6;
        part.position.y = startY + (part.userData.targetY - startY) * eased;
        part.position.x = part.userData.targetX * eased;
        part.position.z = part.userData.targetZ * eased;

        // Rotation
        if (part.userData.rotStart) {
            part.rotation.y = part.userData.rotStart * (1 - eased);
        }
    });

    // Wood shavings drift
    if (woodShavings) {
        const pos = woodShavings.geometry.attributes.position.array;
        const vel = woodShavings.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3 + 1] -= vel[i];
            pos[i * 3] += Math.sin(heroTime + i) * 0.005;
            if (pos[i * 3 + 1] < 0) {
                pos[i * 3 + 1] = 10;
                pos[i * 3] = (Math.random() - 0.5) * 15;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
            }
        }
        woodShavings.geometry.attributes.position.needsUpdate = true;
        woodShavings.material.opacity = 0.15 + (1 - scrollProgress) * 0.2;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ CONFIGURATOR ============
let configScene, configCamera, configRenderer, configChair;
let configDragging = false, configLastX = 0, configRotY = 0;
let configWoodColor = 0xb8783a, configSeatColor = 0x3a2a1a;

function initConfigurator() {
    const canvas = document.getElementById('config-chair-canvas');
    const wrap = canvas.parentElement;

    configScene = new THREE.Scene();
    configCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    configCamera.position.set(0, 4, 10);
    configCamera.lookAt(0, 2, 0);

    configRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    configRenderer.setSize(wrap.clientWidth || 600, 400);
    configRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    configScene.add(new THREE.AmbientLight(0x4a3a2a, 0.5));
    const key = new THREE.DirectionalLight(0xffd9a0, 1.2);
    key.position.set(5, 10, 5);
    configScene.add(key);
    const fill = new THREE.DirectionalLight(0xb8783a, 0.5);
    fill.position.set(-5, 3, -3);
    configScene.add(fill);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    configScene.add(floor);

    buildConfigChair();

    canvas.addEventListener('mousedown', (e) => { configDragging = true; configLastX = e.clientX; });
    window.addEventListener('mouseup', () => configDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (configDragging) { configRotY += (e.clientX - configLastX) * 0.01; configLastX = e.clientX; }
    });
    canvas.addEventListener('touchstart', (e) => { configDragging = true; configLastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => configDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (configDragging) { configRotY += (e.touches[0].clientX - configLastX) * 0.01; configLastX = e.touches[0].clientX; }
    });

    const ro = new ResizeObserver(() => {
        configCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 400);
        configCamera.updateProjectionMatrix();
        configRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 400);
    });
    ro.observe(wrap);

    animateConfig();
}

function buildConfigChair() {
    if (configChair) configScene.remove(configChair);
    configChair = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: configWoodColor, roughness: 0.6 });
    const seatMat = new THREE.MeshStandardMaterial({ color: configSeatColor, roughness: 0.7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.6 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 3), seatMat);
    seat.position.y = 2.5;
    configChair.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 0.3), woodMat);
    back.position.set(0, 4.2, -1.35);
    configChair.add(back);

    // Backrest slats
    for (let i = 0; i < 3; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 0.15), woodMat);
        slat.position.set(0, 3.5 + i * 0.8, -1.25);
        configChair.add(slat);
    }

    // Legs
    [[-1.3, 1.3], [1.3, 1.3]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.5, 0.4), darkMat);
        leg.position.set(x, 1.25, z);
        configChair.add(leg);
    });
    [[-1.3, -1.3], [1.3, -1.3]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), darkMat);
        leg.position.set(x, 2.5, z);
        configChair.add(leg);
    });

    // Stretchers
    [1.3, -1.3].forEach(z => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), darkMat);
        s.position.set(0, 0.8, z);
        s.rotation.z = Math.PI / 2;
        configChair.add(s);
    });

    configScene.add(configChair);
}

// Wood picker
document.querySelectorAll('.wood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        configWoodColor = parseInt(btn.dataset.color.replace('#', '0x'));
        document.getElementById('sum-wood').textContent = btn.dataset.name;
        buildConfigChair();
    });
});

// Seat picker
document.querySelectorAll('.seat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        configSeatColor = parseInt(btn.dataset.color.replace('#', '0x'));
        document.getElementById('sum-seat').textContent = btn.dataset.name;
        buildConfigChair();
    });
});

let configTime = 0;
function animateConfig() {
    requestAnimationFrame(animateConfig);
    configTime += 0.01;
    if (!configDragging) configRotY += 0.005;
    if (configChair) {
        configChair.rotation.y = configRotY;
        configChair.position.y = Math.sin(configTime * 0.5) * 0.1;
    }
    configRenderer.render(configScene, configCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const configSection = document.getElementById('configurator');
    const cObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !configScene) { initConfigurator(); cObs.disconnect(); }
    }, { threshold: 0.1 });
    cObs.observe(configSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.proces-step', { scrollTrigger: { trigger: '.proces-steps', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.meubel-card', { scrollTrigger: { trigger: '.collectie-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
