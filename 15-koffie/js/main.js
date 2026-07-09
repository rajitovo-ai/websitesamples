// BrandMeester — 3D Coffee Roastery
// Three.js coffee beans roasting animation + steam particles

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
    btn.textContent = 'Verzonden! ✦';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Verstuur'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D COFFEE SCENE ============
let heroScene, heroCamera, heroRenderer, coffeeBeans = [], steamParticles;
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('coffee-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x1a0e08, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm lighting
    heroScene.add(new THREE.AmbientLight(0x4a2a1a, 0.4));
    const key = new THREE.DirectionalLight(0xffa060, 1.2);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xc47838, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const rim = new THREE.PointLight(0xff6020, 0.8, 15);
    rim.position.set(0, 2, -5);
    heroScene.add(rim);

    // Floating coffee beans
    createCoffeeBeans();

    // Steam particles
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

function createCoffeeBeans() {
    const beanMat = new THREE.MeshStandardMaterial({ color: 0xc47838, roughness: 0.7, metalness: 0.1 });
    const darkBeanMat = new THREE.MeshStandardMaterial({ color: 0x5a2818, roughness: 0.7 });

    for (let i = 0; i < 25; i++) {
        const isDark = Math.random() > 0.5;
        const bean = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 12, 8),
            isDark ? darkBeanMat : beanMat
        );
        // Flatten to bean shape
        bean.scale.set(0.7, 0.4, 1);

        const angle = (i / 25) * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        bean.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 6,
            Math.sin(angle) * radius - 2
        );
        bean.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        bean.userData = {
            rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 },
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.5 + Math.random() * 0.5,
            baseY: bean.position.y
        };
        coffeeBeans.push(bean);
        heroScene.add(bean);
    }
}

function createSteam() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 1] = -2 + Math.random() * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        velocities[i] = 0.02 + Math.random() * 0.03;
        phases[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities, phases };
    steamParticles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xc47838, size: 0.3, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending
    }));
    heroScene.add(steamParticles);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera slowly orbits
    heroCamera.position.x = Math.sin(heroTime * 0.1 + heroMouseX * 0.3) * 12;
    heroCamera.position.y = 3 + scrollProgress * 3 + heroMouseY * 1.5;
    heroCamera.position.z = Math.cos(heroTime * 0.1 + heroMouseX * 0.3) * 12;
    heroCamera.lookAt(0, 0, 0);

    // Beans float and rotate
    coffeeBeans.forEach(bean => {
        bean.rotation.x += bean.userData.rotSpeed.x;
        bean.rotation.y += bean.userData.rotSpeed.y;
        bean.rotation.z += bean.userData.rotSpeed.z;
        bean.position.y = bean.userData.baseY + Math.sin(heroTime * bean.userData.floatSpeed + bean.userData.floatPhase) * 0.5;

        // Beans darken with scroll (roasting effect)
        const roastLevel = scrollProgress;
        if (bean.material.color) {
            const r = 0.77 - roastLevel * 0.3;
            const g = 0.47 - roastLevel * 0.3;
            const b = 0.22 - roastLevel * 0.15;
            bean.material.color.setRGB(Math.max(r, 0.2), Math.max(g, 0.1), Math.max(b, 0.05));
        }
    });

    // Steam rises
    if (steamParticles) {
        const pos = steamParticles.geometry.attributes.position.array;
        const vel = steamParticles.geometry.userData.velocities;
        const phases = steamParticles.geometry.userData.phases;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3 + 1] += vel[i];
            pos[i * 3] += Math.sin(heroTime * 2 + phases[i]) * 0.01;
            if (pos[i * 3 + 1] > 6) {
                pos[i * 3 + 1] = -2;
                pos[i * 3] = (Math.random() - 0.5) * 4;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
            }
        }
        steamParticles.geometry.attributes.position.needsUpdate = true;
        steamParticles.material.opacity = 0.15 + scrollProgress * 0.15;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ ROAST VISUALIZATION ============
let roastScene, roastCamera, roastRenderer, roastBeans = [], roastDrum;
let roastMouseX = 0, roastMouseY = 0;

function initRoast() {
    const canvas = document.getElementById('roast-canvas');
    const wrap = canvas.parentElement;

    roastScene = new THREE.Scene();
    roastScene.fog = new THREE.Fog(0x1a0e08, 10, 30);

    roastCamera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    roastCamera.position.set(0, 2, 10);

    roastRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    roastRenderer.setSize(wrap.clientWidth || 600, 400);
    roastRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    roastScene.add(new THREE.AmbientLight(0x4a2a1a, 0.4));
    const key = new THREE.DirectionalLight(0xffa060, 1.5);
    key.position.set(3, 5, 3);
    roastScene.add(key);
    const fill = new THREE.PointLight(0xff4400, 1.0, 10);
    fill.position.set(0, 0, 0);
    roastScene.add(fill);

    // Roasting drum — cylinder
    const drumMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a14, metalness: 0.8, roughness: 0.3,
        transparent: true, opacity: 0.4
    });
    roastDrum = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 5, 24, 1, true),
        drumMat
    );
    roastDrum.rotation.z = Math.PI / 2;
    roastScene.add(roastDrum);

    // Drum ends
    const endMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, metalness: 0.8, roughness: 0.3 });
    const end1 = new THREE.Mesh(new THREE.CircleGeometry(2.5, 24), endMat);
    end1.position.x = 2.5;
    end1.rotation.y = Math.PI / 2;
    roastScene.add(end1);

    // Beans inside drum
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x6a8a3a, roughness: 0.8 });
    for (let i = 0; i < 40; i++) {
        const bean = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 6),
            greenMat.clone()
        );
        bean.scale.set(0.7, 0.4, 1);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 2;
        bean.position.set(
            (Math.random() - 0.5) * 4,
            Math.sin(angle) * r * 0.6 - 0.5,
            Math.cos(angle) * r * 0.6
        );
        bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        bean.userData = {
            angle: Math.random() * Math.PI * 2,
            radius: r,
            speed: 0.5 + Math.random() * 0.5,
            yOffset: bean.position.y
        };
        roastBeans.push(bean);
        roastScene.add(bean);
    }

    // Glow inside drum
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.1 })
    );
    glow.userData = { isGlow: true };
    roastScene.add(glow);
    roastScene.userData = { glow };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        roastMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        roastMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    const ro = new ResizeObserver(() => {
        roastCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 400);
        roastCamera.updateProjectionMatrix();
        roastRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 400);
    });
    ro.observe(wrap);

    animateRoast();
}

let roastTime = 0;
function animateRoast() {
    requestAnimationFrame(animateRoast);
    roastTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);
    const roastProgress = Math.max(0, Math.min(1, (scrollProgress - 0.1) * 1.5));

    // Camera
    roastCamera.position.x = Math.sin(roastTime * 0.1 + roastMouseX * 0.5) * 10;
    roastCamera.position.y = 2 + roastMouseY * 1;
    roastCamera.position.z = Math.cos(roastTime * 0.1 + roastMouseX * 0.5) * 10;
    roastCamera.lookAt(0, 0, 0);

    // Drum rotates
    roastDrum.rotation.x = roastTime * 0.5;

    // Beans tumble and change color based on roast progress
    // Green -> yellow -> light brown -> dark brown
    roastBeans.forEach(bean => {
        bean.userData.angle += bean.userData.speed * 0.05;
        bean.position.y = bean.userData.yOffset + Math.sin(bean.userData.angle) * 0.3;
        bean.position.x += Math.cos(bean.userData.angle) * 0.01;
        if (bean.position.x > 2) bean.position.x = -2;
        bean.rotation.x += 0.02;
        bean.rotation.z += 0.01;

        // Color transition
        const r = 0.4 + roastProgress * 0.37;
        const g = 0.55 - roastProgress * 0.35;
        const b = 0.23 - roastProgress * 0.13;
        bean.material.color.setRGB(Math.min(r, 0.77), Math.max(g, 0.15), Math.max(b, 0.05));
    });

    // Glow intensifies
    if (roastScene.userData.glow) {
        roastScene.userData.glow.material.opacity = 0.05 + roastProgress * 0.15;
        roastScene.userData.glow.scale.setScalar(1 + roastProgress * 0.3);
    }

    roastRenderer.render(roastScene, roastCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const roastSection = document.getElementById('branden');
    const rObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !roastScene) { initRoast(); rObs.disconnect(); }
    }, { threshold: 0.1 });
    rObs.observe(roastSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.brand-step', { scrollTrigger: { trigger: '.branden-steps', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.boon-card', { scrollTrigger: { trigger: '.bonen-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.shop-item', { scrollTrigger: { trigger: '.shop-grid', start: 'top 75%' }, y: 40, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.plan', { scrollTrigger: { trigger: '.abonnement-plans', start: 'top 80%' }, scale: 0.9, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
