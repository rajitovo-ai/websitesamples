// DesMeester — 3D Bakery Bread Baking Animation
// Three.js bread that grows and browns on scroll

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

// ============ FORMS ============
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Verzonden! ✦';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Verstuur'; btn.style.background = ''; }, 2500);
});

// Quantity buttons
document.querySelectorAll('.bestel-item').forEach(item => {
    const qtyEl = item.querySelector('.qty');
    const priceEl = item.querySelector('.bestel-price');
    const basePrice = parseFloat(priceEl.textContent.replace('€ ', ''));
    item.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let qty = parseInt(qtyEl.textContent);
            if (btn.dataset.action === 'inc') qty++;
            else qty = Math.max(0, qty);
            qtyEl.textContent = qty;
            updateTotal();
        });
    });
});

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.bestel-item').forEach(item => {
        const qty = parseInt(item.querySelector('.qty').textContent);
        const price = parseFloat(item.querySelector('.bestel-price').textContent.replace('€ ', ''));
        total += qty * price;
    });
    document.getElementById('bestel-total').textContent = '€ ' + total.toFixed(2);
}

document.getElementById('bestel-submit').addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Bestelling Geplaatst! ✓';
    e.target.style.background = '#4a8a5a';
    setTimeout(() => { e.target.textContent = 'Bestelling Plaatsen'; e.target.style.background = ''; }, 2500);
});

// ============ HERO 3D BREAD SCENE ============
let heroScene, heroCamera, heroRenderer, heroBreads = [], flourParticles;
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('bread-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x1a1208, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm bakery lighting
    heroScene.add(new THREE.AmbientLight(0x4a3a2a, 0.4));
    const key = new THREE.DirectionalLight(0xffd080, 1.2);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0xd4a050, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const warm = new THREE.PointLight(0xff8030, 0.8, 15);
    warm.position.set(0, 2, -3);
    heroScene.add(warm);

    // Floating breads
    createBreads();

    // Flour particles
    createFlour();

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

function createBreads() {
    const breadMat = new THREE.MeshStandardMaterial({ color: 0xd4a050, roughness: 0.8, metalness: 0.0 });
    const darkBreadMat = new THREE.MeshStandardMaterial({ color: 0xb48030, roughness: 0.8 });

    for (let i = 0; i < 15; i++) {
        const isDark = Math.random() > 0.5;
        const bread = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 12),
            isDark ? darkBreadMat.clone() : breadMat.clone()
        );
        // Shape into bread loaf
        bread.scale.set(1.2, 0.7, 0.8);

        const angle = (i / 15) * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        bread.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 5,
            Math.sin(angle) * radius - 2
        );
        bread.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );
        bread.userData = {
            rotSpeed: { x: (Math.random() - 0.5) * 0.01, y: (Math.random() - 0.5) * 0.01 },
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
            baseY: bread.position.y,
            baseScale: bread.scale.x
        };
        heroBreads.push(bread);
        heroScene.add(bread);
    }
}

function createFlour() {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        velocities[i] = 0.005 + Math.random() * 0.01;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    flourParticles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xe8d8c0, size: 0.08, transparent: true, opacity: 0.3
    }));
    heroScene.add(flourParticles);
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

    // Breads float and grow with scroll
    heroBreads.forEach(bread => {
        bread.rotation.x += bread.userData.rotSpeed.x;
        bread.rotation.y += bread.userData.rotSpeed.y;
        bread.position.y = bread.userData.baseY + Math.sin(heroTime * bread.userData.floatSpeed + bread.userData.floatPhase) * 0.4;

        // Bread grows and browns with scroll
        const growScale = 1 + scrollProgress * 0.3;
        bread.scale.set(bread.userData.baseScale * growScale, bread.userData.baseScale * 0.7 * growScale, bread.userData.baseScale * 0.8 * growScale);

        // Browning effect
        const r = 0.83 - scrollProgress * 0.15;
        const g = 0.63 - scrollProgress * 0.25;
        const b = 0.31 - scrollProgress * 0.15;
        bread.material.color.setRGB(Math.max(r, 0.5), Math.max(g, 0.3), Math.max(b, 0.1));
    });

    // Flour falls
    if (flourParticles) {
        const pos = flourParticles.geometry.attributes.position.array;
        const vel = flourParticles.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3 + 1] -= vel[i];
            pos[i * 3] += Math.sin(heroTime + i) * 0.003;
            if (pos[i * 3 + 1] < -3) {
                pos[i * 3 + 1] = 8;
                pos[i * 3] = (Math.random() - 0.5) * 12;
            }
        }
        flourParticles.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ BAKE VISUALIZATION ============
let bakeScene, bakeCamera, bakeRenderer, bakeBread, ovenGlow;
let bakeMouseX = 0, bakeMouseY = 0;

function initBake() {
    const canvas = document.getElementById('bake-canvas');
    const wrap = canvas.parentElement;

    bakeScene = new THREE.Scene();
    bakeScene.fog = new THREE.Fog(0x1a1208, 8, 25);

    bakeCamera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    bakeCamera.position.set(0, 2, 8);

    bakeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    bakeRenderer.setSize(wrap.clientWidth || 600, 400);
    bakeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    bakeScene.add(new THREE.AmbientLight(0x4a3a2a, 0.3));
    const key = new THREE.DirectionalLight(0xffd080, 1.0);
    key.position.set(3, 5, 3);
    bakeScene.add(key);
    const oven = new THREE.PointLight(0xff4400, 1.5, 10);
    oven.position.set(0, 0, 2);
    bakeScene.add(oven);
    bakeScene.userData = { ovenLight: oven };

    // Oven interior — dark box
    const ovenMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9, side: THREE.BackSide });
    const ovenBox = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 4), ovenMat);
    ovenBox.position.z = -1;
    bakeScene.add(ovenBox);

    // Oven glow
    ovenGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.05 })
    );
    ovenGlow.position.set(0, 0, 0);
    bakeScene.add(ovenGlow);

    // Bread dough
    const doughMat = new THREE.MeshStandardMaterial({ color: 0xe8d8b0, roughness: 0.9 });
    bakeBread = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 24, 16),
        doughMat
    );
    bakeBread.scale.set(1.3, 0.8, 1);
    bakeBread.position.y = -0.5;
    bakeBread.userData = { baseScale: 1.3 };
    bakeScene.add(bakeBread);

    // Scoring lines on bread
    const scoreMat = new THREE.MeshBasicMaterial({ color: 0x8a5a28, transparent: true, opacity: 0 });
    for (let i = 0; i < 3; i++) {
        const score = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.05, 0.05),
            scoreMat.clone()
        );
        score.position.set(0, -0.3 + i * 0.3, 1.2);
        score.rotation.z = (i - 1) * 0.3;
        bakeBread.add(score);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        bakeMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        bakeMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    const ro = new ResizeObserver(() => {
        bakeCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 400);
        bakeCamera.updateProjectionMatrix();
        bakeRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 400);
    });
    ro.observe(wrap);

    animateBake();
}

let bakeTime = 0;
function animateBake() {
    requestAnimationFrame(animateBake);
    bakeTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Map scroll to 5 stages
    const stage = Math.min(4, Math.floor(scrollProgress * 5));
    document.querySelectorAll('.stage').forEach((s, i) => {
        s.classList.toggle('active', i === stage);
    });

    // Stage progress within current stage
    const stageProgress = (scrollProgress * 5) % 1;

    // Camera slight movement
    bakeCamera.position.x = Math.sin(bakeTime * 0.1 + bakeMouseX * 0.3) * 8;
    bakeCamera.position.y = 2 + bakeMouseY * 0.5;
    bakeCamera.position.z = Math.cos(bakeTime * 0.1 + bakeMouseX * 0.3) * 8;
    bakeCamera.lookAt(0, -0.3, 0);

    // Bread transformation through stages
    // Stage 0: Dough (pale, small)
    // Stage 1: Rising (grows)
    // Stage 2: Shaping (scores appear)
    // Stage 3: Baking (browns, grows more)
    // Stage 4: Done (golden brown, full size)

    let scale = 1, r = 0.91, g = 0.85, b = 0.69, scoreOpacity = 0;

    if (stage === 0) {
        // Dough
        scale = 1 + stageProgress * 0.1;
        r = 0.91; g = 0.85; b = 0.69;
    } else if (stage === 1) {
        // Rising
        scale = 1.1 + stageProgress * 0.2;
        r = 0.91 - stageProgress * 0.05; g = 0.85 - stageProgress * 0.1; b = 0.69 - stageProgress * 0.15;
    } else if (stage === 2) {
        // Shaping — scores appear
        scale = 1.3;
        r = 0.86; g = 0.75; b = 0.54;
        scoreOpacity = stageProgress;
    } else if (stage === 3) {
        // Baking — browning
        scale = 1.3 + stageProgress * 0.15;
        r = 0.86 - stageProgress * 0.15; g = 0.75 - stageProgress * 0.25; b = 0.54 - stageProgress * 0.2;
        scoreOpacity = 1;
    } else {
        // Done
        scale = 1.45;
        r = 0.71; g = 0.5; b = 0.34;
        scoreOpacity = 1;
    }

    bakeBread.scale.set(scale * 1.3, scale * 0.8, scale);
    bakeBread.material.color.setRGB(r, g, b);

    // Update score lines opacity
    bakeBread.children.forEach(child => {
        if (child.material) child.material.opacity = scoreOpacity;
    });

    // Oven glow intensifies during baking
    const glowIntensity = stage >= 3 ? 0.15 : stage >= 2 ? 0.08 : 0.03;
    ovenGlow.material.opacity = glowIntensity + Math.sin(bakeTime * 3) * 0.02;
    ovenGlow.scale.setScalar(1 + (stage / 4) * 0.5);

    // Oven light color
    if (bakeScene.userData.ovenLight) {
        bakeScene.userData.ovenLight.intensity = 0.8 + (stage / 4) * 1.5 + Math.sin(bakeTime * 5) * 0.2;
    }

    bakeRenderer.render(bakeScene, bakeCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const bakeSection = document.getElementById('bakken');
    const bObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !bakeScene) { initBake(); bObs.disconnect(); }
    }, { threshold: 0.1 });
    bObs.observe(bakeSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.brood-card', { scrollTrigger: { trigger: '.assortiment-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
