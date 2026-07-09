// Maison Noir — 3D Fine Dining Dish Plating
// Three.js plate that gets plated with food elements on scroll

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
document.getElementById('reserveren-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Reservering Aanvragen'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D DISH SCENE ============
let heroScene, heroCamera, heroRenderer;
let heroMouseX = 0, heroMouseY = 0;
let steamParticles = [];

function initHero() {
    const canvas = document.getElementById('dish-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x0a0a0c, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 5, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Elegant warm lighting
    heroScene.add(new THREE.AmbientLight(0x2a2a30, 0.3));
    const key = new THREE.DirectionalLight(0xffd080, 1.0);
    key.position.set(5, 10, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xc8a850, 0.4);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const spot = new THREE.SpotLight(0xffe0a0, 1.5, 20, Math.PI / 6, 0.5);
    spot.position.set(0, 10, 0);
    spot.target.position.set(0, 0, 0);
    heroScene.add(spot);
    heroScene.add(spot.target);

    // Floating gold particles
    createGoldParticles();

    // Steam
    createSteam();

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

function createGoldParticles() {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = -2 + Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = 0.01 + Math.random() * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xc8a850, size: 0.08, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending
    }));
    particles.userData = { isGold: true };
    heroScene.add(particles);
    heroScene.userData = { goldParticles: particles };
}

function createSteam() {
    for (let i = 0; i < 3; i++) {
        const count = 40;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);
        for (let j = 0; j < count; j++) {
            positions[j * 3] = (Math.random() - 0.5) * 1.5 + (i - 1) * 2;
            positions[j * 3 + 1] = Math.random() * 4;
            positions[j * 3 + 2] = (Math.random() - 0.5) * 1.5;
            velocities[j] = 0.015 + Math.random() * 0.02;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.userData = { velocities };
        const steam = new THREE.Points(geo, new THREE.PointsMaterial({
            color: 0xc8a850, size: 0.2, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending
        }));
        steam.userData = { isSteam: true };
        steamParticles.push(steam);
        heroScene.add(steam);
    }
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera slow orbit
    heroCamera.position.x = Math.sin(heroTime * 0.08 + heroMouseX * 0.3) * 12;
    heroCamera.position.y = 5 + heroMouseY * 1.5;
    heroCamera.position.z = Math.cos(heroTime * 0.08 + heroMouseX * 0.3) * 12;
    heroCamera.lookAt(0, 1, 0);

    // Gold particles
    if (heroScene.userData.goldParticles) {
        const gp = heroScene.userData.goldParticles;
        const pos = gp.geometry.attributes.position.array;
        const vel = gp.geometry.userData.velocities;
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
        gp.geometry.attributes.position.needsUpdate = true;
    }

    // Steam
    steamParticles.forEach(steam => {
        const pos = steam.geometry.attributes.position.array;
        const vel = steam.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3 + 1] += vel[i];
            pos[i * 3] += Math.sin(heroTime * 2 + i) * 0.005;
            if (pos[i * 3 + 1] > 5) {
                pos[i * 3 + 1] = 0;
            }
        }
        steam.geometry.attributes.position.needsUpdate = true;
    });

    heroRenderer.render(heroScene, heroCamera);
}

// ============ PLATING ANIMATION ============
let plateScene, plateCamera, plateRenderer, plate, plateElements = [];
let plateMouseX = 0, plateMouseY = 0;

function initPlating() {
    const canvas = document.getElementById('plating-canvas');
    const wrap = canvas.parentElement;

    plateScene = new THREE.Scene();
    plateScene.fog = new THREE.Fog(0x0a0a0c, 8, 25);

    plateCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    plateCamera.position.set(0, 6, 8);
    plateCamera.lookAt(0, 0, 0);

    plateRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    plateRenderer.setSize(wrap.clientWidth || 600, 450);
    plateRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    plateScene.add(new THREE.AmbientLight(0x2a2a30, 0.3));
    const key = new THREE.DirectionalLight(0xffd080, 1.2);
    key.position.set(3, 8, 3);
    plateScene.add(key);
    const fill = new THREE.DirectionalLight(0xc8a850, 0.4);
    fill.position.set(-3, 3, -3);
    plateScene.add(fill);
    const spot = new THREE.SpotLight(0xffe0a0, 2.0, 15, Math.PI / 6, 0.5);
    spot.position.set(0, 8, 0);
    spot.target.position.set(0, 0, 0);
    plateScene.add(spot);
    plateScene.add(spot.target);

    // Table surface
    const table = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.8 })
    );
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.3;
    plateScene.add(table);

    // Plate — white ceramic
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.3, metalness: 0.1 });
    plate = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 0.15, 64),
        plateMat
    );
    plate.position.y = 0;
    plateScene.add(plate);

    // Plate rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(3, 0.08, 8, 64),
        new THREE.MeshStandardMaterial({ color: 0xc8a850, roughness: 0.3, metalness: 0.5 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.08;
    plateScene.add(rim);

    // Create plate elements (food)
    createPlateElements();

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        plateMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        plateMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    const ro = new ResizeObserver(() => {
        plateCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 450);
        plateCamera.updateProjectionMatrix();
        plateRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 450);
    });
    ro.observe(wrap);

    animatePlating();
}

function createPlateElements() {
    // Element 0: Sauce swirl (red/dark)
    const sauceMat = new THREE.MeshStandardMaterial({ color: 0x8a2020, roughness: 0.4 });
    const sauce = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 0.05, 32),
        sauceMat
    );
    sauce.position.y = 0.1;
    sauce.scale.set(0, 0, 1);
    sauce.userData = { stage: 0, targetScale: 1 };
    plateElements.push(sauce);
    plateScene.add(sauce);

    // Element 1: Main protein (meat/fish — brown cylinder)
    const proteinMat = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.6 });
    const protein = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16),
        proteinMat
    );
    protein.position.set(0, 0.4, 0);
    protein.scale.set(0, 0, 0);
    protein.userData = { stage: 1, targetScale: 1 };
    plateElements.push(protein);
    plateScene.add(protein);

    // Element 2: Vegetables (green spheres)
    const vegMat = new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
        const veg = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 12, 8),
            vegMat
        );
        const angle = (i / 5) * Math.PI * 2;
        veg.position.set(Math.cos(angle) * 1.8, 0.25, Math.sin(angle) * 1.8);
        veg.scale.set(0, 0, 0);
        veg.userData = { stage: 2, targetScale: 1, delay: i * 0.1 };
        plateElements.push(veg);
        plateScene.add(veg);
    }

    // Element 3: Garnish (gold small spheres)
    const garnishMat = new THREE.MeshStandardMaterial({ color: 0xc8a850, roughness: 0.3, metalness: 0.5, emissive: 0x6a5020, emissiveIntensity: 0.2 });
    for (let i = 0; i < 8; i++) {
        const garnish = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 6),
            garnishMat
        );
        const angle = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 2;
        garnish.position.set(Math.cos(angle) * r, 0.15, Math.sin(angle) * r);
        garnish.scale.set(0, 0, 0);
        garnish.userData = { stage: 3, targetScale: 1, delay: i * 0.08 };
        plateElements.push(garnish);
        plateScene.add(garnish);
    }

    // Element 4: Microgreens (small green tufts)
    const microMat = new THREE.MeshStandardMaterial({ color: 0x6aaa4a, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
        const micro = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.3, 6),
            microMat
        );
        const angle = (i / 4) * Math.PI * 2 + 0.5;
        micro.position.set(Math.cos(angle) * 1.2, 0.3, Math.sin(angle) * 1.2);
        micro.scale.set(0, 0, 0);
        micro.userData = { stage: 4, targetScale: 1, delay: i * 0.1 };
        plateElements.push(micro);
        plateScene.add(micro);
    }
}

let plateTime = 0;
function animatePlating() {
    requestAnimationFrame(animatePlating);
    plateTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Map scroll to 5 stages
    const stageProgress = scrollProgress * 5;
    const currentStage = Math.min(4, Math.floor(stageProgress));
    const withinStage = stageProgress % 1;

    // Update stage indicators
    document.querySelectorAll('.plate-stage').forEach((s, i) => {
        s.classList.toggle('active', i <= currentStage);
    });

    // Camera slight orbit
    plateCamera.position.x = Math.sin(plateTime * 0.1 + plateMouseX * 0.3) * 8;
    plateCamera.position.y = 6 + plateMouseY * 1;
    plateCamera.position.z = Math.cos(plateTime * 0.1 + plateMouseX * 0.3) * 8;
    plateCamera.lookAt(0, 0.2, 0);

    // Animate plate elements
    plateElements.forEach(el => {
        const elStage = el.userData.stage;
        const delay = el.userData.delay || 0;
        let progress = 0;

        if (elStage < currentStage) {
            progress = 1;
        } else if (elStage === currentStage) {
            progress = Math.max(0, Math.min(1, (withinStage - delay) / (1 - delay)));
        }

        // Eased progress
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Scale animation (pop in)
        const scale = eased * el.userData.targetScale;
        el.scale.set(scale, scale, scale);

        // Drop from above
        if (elStage > 0) {
            const startY = el.position.y + 2;
            const targetY = el.userData.stage === 1 ? 0.4 : el.userData.stage === 2 ? 0.25 : el.userData.stage === 3 ? 0.15 : 0.3;
            el.position.y = startY + (targetY - startY) * eased;
        } else {
            // Sauce grows from center
            el.scale.set(eased * 1.5, 1, eased * 1.5);
        }
    });

    // Plate slowly rotates
    plate.rotation.y = plateTime * 0.1;

    plateRenderer.render(plateScene, plateCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const platingSection = document.getElementById('plating');
    const plObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !plateScene) { initPlating(); plObs.disconnect(); }
    }, { threshold: 0.1 });
    plObs.observe(platingSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.menu-course', { scrollTrigger: { trigger: '.menu-list', start: 'top 75%' }, x: -30, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.chef-text > *', { scrollTrigger: { trigger: '.chef-content', start: 'top 75%' }, x: 30, opacity: 0, stagger: 0.1, duration: 0.8 });
    gsap.from('.chef-portrait', { scrollTrigger: { trigger: '.chef-content', start: 'top 75%' }, scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' });
    gsap.from('.contact-info > *', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, y: 30, opacity: 0, stagger: 0.1, duration: 0.7 });
}
