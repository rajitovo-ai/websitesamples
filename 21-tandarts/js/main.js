// De Tandmeester — 3D Tooth Model
// Three.js 3D tooth with cross-section showing anatomy layers

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

// ============ HERO 3D TOOTH SCENE ============
let heroScene, heroCamera, heroRenderer, heroTeeth = [];
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('tooth-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x060a0e, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clean blue lighting
    heroScene.add(new THREE.AmbientLight(0x1a2a3a, 0.4));
    const key = new THREE.DirectionalLight(0x80d0ff, 1.0);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0x00b8d4, 0.5);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const accent = new THREE.PointLight(0x00b8d4, 1.0, 15);
    accent.position.set(0, 3, -3);
    heroScene.add(accent);

    // Floating teeth
    createTeeth();

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

function createToothGeometry() {
    // Create a tooth-like shape using merged geometries
    const group = new THREE.Group();

    // Crown (top part — wider)
    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.3 })
    );
    crown.scale.set(1, 0.8, 0.7);
    crown.position.y = 0.3;

    // Root (bottom part — tapered)
    const root = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.2, 12),
        crown.material.clone()
    );
    root.position.y = -0.6;
    root.rotation.x = Math.PI;

    return { crown, root };
}

function createTeeth() {
    for (let i = 0; i < 12; i++) {
        const { crown, root } = createToothGeometry();
        const tooth = new THREE.Group();
        tooth.add(crown);
        tooth.add(root);

        const angle = (i / 12) * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        tooth.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 5,
            Math.sin(angle) * radius - 2
        );
        tooth.rotation.set(
            Math.random() * 0.3,
            Math.random() * Math.PI,
            Math.random() * 0.3
        );
        tooth.userData = {
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
            baseY: tooth.position.y,
            rotSpeed: (Math.random() - 0.5) * 0.01
        };
        heroTeeth.push(tooth);
        heroScene.add(tooth);
    }
}

function createSparkles() {
    const count = 80;
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
        color: 0x00b8d4, size: 0.08, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending
    }));
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

    // Teeth float and rotate
    heroTeeth.forEach(tooth => {
        tooth.rotation.y += tooth.userData.rotSpeed;
        tooth.position.y = tooth.userData.baseY + Math.sin(heroTime * tooth.userData.floatSpeed + tooth.userData.floatPhase) * 0.4;
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

// ============ 3D TOOTH MODEL ============
let toothScene, toothCamera, toothRenderer, toothModel, toothLayers = {};
let toothDragging = false, toothLastX = 0, toothRotY = 0;
let currentPart = 'glazuur';

function initTooth3D() {
    const canvas = document.getElementById('tooth3d-canvas');
    const wrap = canvas.parentElement;

    toothScene = new THREE.Scene();
    toothScene.fog = new THREE.Fog(0x060a0e, 8, 25);

    toothCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    toothCamera.position.set(0, 1, 7);
    toothCamera.lookAt(0, 0, 0);

    toothRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    toothRenderer.setSize(wrap.clientWidth || 600, 450);
    toothRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    toothScene.add(new THREE.AmbientLight(0x1a2a3a, 0.4));
    const key = new THREE.DirectionalLight(0x80d0ff, 1.2);
    key.position.set(3, 5, 3);
    toothScene.add(key);
    const fill = new THREE.DirectionalLight(0x00b8d4, 0.5);
    fill.position.set(-3, 3, -3);
    toothScene.add(fill);

    // Build detailed tooth model
    buildToothModel();

    // Controls
    canvas.addEventListener('mousedown', (e) => { toothDragging = true; toothLastX = e.clientX; });
    window.addEventListener('mouseup', () => toothDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (toothDragging) { toothRotY += (e.clientX - toothLastX) * 0.01; toothLastX = e.clientX; }
    });
    canvas.addEventListener('touchstart', (e) => { toothDragging = true; toothLastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => toothDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (toothDragging) { toothRotY += (e.touches[0].clientX - toothLastX) * 0.01; toothLastX = e.touches[0].clientX; }
    });

    const ro = new ResizeObserver(() => {
        toothCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 450);
        toothCamera.updateProjectionMatrix();
        toothRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 450);
    });
    ro.observe(wrap);

    animateTooth3D();
}

function buildToothModel() {
    toothModel = new THREE.Group();

    // 1. Glazuur (enamel) — outer shell, white
    const glazuurMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.7 });
    const glazuur = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 24),
        glazuurMat
    );
    glazuur.scale.set(0.9, 1.3, 0.8);
    glazuur.position.y = 0.5;
    toothLayers.glazuur = glazuur;
    toothModel.add(glazuur);

    // Crown shape — more tooth-like
    const crownShape = new THREE.Mesh(
        new THREE.SphereGeometry(1.3, 32, 24),
        glazuurMat.clone()
    );
    crownShape.scale.set(0.9, 0.7, 0.8);
    crownShape.position.y = 1.0;
    toothModel.add(crownShape);

    // 2. Dentine — inner layer, yellowish
    const dentineMat = new THREE.MeshStandardMaterial({ color: 0xe8d8a0, roughness: 0.5, transparent: true, opacity: 0.8 });
    const dentine = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 24),
        dentineMat
    );
    dentine.scale.set(0.85, 1.2, 0.75);
    dentine.position.y = 0.5;
    toothLayers.dentine = dentine;
    toothModel.add(dentine);

    // 3. Pulpa — innermost, pink/red
    const pulpaMat = new THREE.MeshStandardMaterial({ color: 0xe07080, roughness: 0.6, transparent: true, opacity: 0.9, emissive: 0x602030, emissiveIntensity: 0.3 });
    const pulpa = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 16),
        pulpaMat
    );
    pulpa.scale.set(0.7, 1.5, 0.6);
    pulpa.position.y = 0.3;
    toothLayers.pulpa = pulpa;
    toothModel.add(pulpa);

    // 4. Root — tapered cone
    const rootMat = new THREE.MeshStandardMaterial({ color: 0xe8d8a0, roughness: 0.5 });
    const root = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 2.5, 16),
        rootMat
    );
    root.position.y = -1.5;
    root.rotation.x = Math.PI;
    toothLayers.wortel = root;
    toothModel.add(root);

    // Root canal (inner)
    const canalMat = new THREE.MeshStandardMaterial({ color: 0xe07080, roughness: 0.6, emissive: 0x602030, emissiveIntensity: 0.2 });
    const canal = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 2.0, 8),
        canalMat
    );
    canal.position.y = -1.3;
    canal.rotation.x = Math.PI;
    toothModel.add(canal);

    // Nerve line
    const nerveMat = new THREE.MeshStandardMaterial({ color: 0xc04050, emissive: 0x802030, emissiveIntensity: 0.4 });
    const nerve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
        nerveMat
    );
    nerve.position.y = -0.2;
    toothModel.add(nerve);

    toothScene.add(toothModel);
}

// Part data
const partData = {
    glazuur: { name: 'Tandglazuur', desc: 'De buitenste laag van de tand — het hardste materiaal in het menselijk lichaand. Beschermt tegen slijtage en hitte.' },
    dentine: { name: 'Dentine', desc: 'De laag onder het glazuur — geelachtig en minder hard. Vormt het grootste deel van de tand.' },
    pulpa: { name: 'Pulpa', desc: 'De binnenste kern — bevat zenuwen en bloedvaten. Hier voel je pijn bij gevoelige tanden.' },
    wortel: { name: 'Wortel', desc: 'Het deel van de tand dat in de kaak zit — verankert de tand stevig in het bot.' }
};

// Part buttons
document.querySelectorAll('.part-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.part-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPart = btn.dataset.part;
        const data = partData[currentPart];
        document.getElementById('part-name').textContent = data.name;
        document.getElementById('part-desc').textContent = data.desc;

        // Highlight the selected part
        Object.keys(toothLayers).forEach(key => {
            const layer = toothLayers[key];
            if (key === currentPart) {
                layer.material.opacity = 1.0;
                if (layer.material.emissive) layer.material.emissiveIntensity = 0.5;
            } else {
                layer.material.opacity = 0.3;
                if (layer.material.emissive) layer.material.emissiveIntensity = 0.1;
            }
        });
    });
});

let toothTime = 0;
function animateTooth3D() {
    requestAnimationFrame(animateTooth3D);
    toothTime += 0.01;

    if (!toothDragging) toothRotY += 0.005;
    if (toothModel) {
        toothModel.rotation.y = toothRotY;
        toothModel.position.y = Math.sin(toothTime * 0.5) * 0.1;
    }

    toothRenderer.render(toothScene, toothCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const tandSection = document.getElementById('tand');
    const tObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !toothScene) { initTooth3D(); tObs.disconnect(); }
    }, { threshold: 0.1 });
    tObs.observe(tandSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.dienst-card', { scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.behandeling-row', { scrollTrigger: { trigger: '.behandeling-list', start: 'top 75%' }, x: -20, opacity: 0, stagger: 0.05, duration: 0.5 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
