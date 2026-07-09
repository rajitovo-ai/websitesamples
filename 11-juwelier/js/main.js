// Diamant Haus — 3D Diamond Jeweler
// Three.js diamond with light refraction, sparkle particles, ring configurator

// ============ LOADER ============
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1500);
});

// ============ NAV ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ============ SCROLL ANIMATIONS ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

// ============ FORM ============
document.getElementById('afspraak-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Afspraak Aangevraagd ✦';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Afspraak Bevestigen'; btn.style.background = ''; }, 2500);
});

// ============ HERO DIAMOND 3D ============
let heroScene, heroCamera, heroRenderer, heroDiamond, heroSparkles, heroMouseX = 0, heroMouseY = 0;

function initHeroDiamond() {
    const canvas = document.getElementById('diamond-canvas');
    heroScene = new THREE.Scene();

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 0, 8);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting — multiple colored lights for diamond refraction effect
    heroScene.add(new THREE.AmbientLight(0x222233, 0.3));

    const lights = [
        { color: 0xd4a838, pos: [5, 5, 5], intensity: 1.5 },
        { color: 0xffffff, pos: [-5, 3, 5], intensity: 1.2 },
        { color: 0x4488ff, pos: [0, -5, 3], intensity: 0.8 },
        { color: 0xff4488, pos: [3, -3, -5], intensity: 0.6 },
        { color: 0x88ff44, pos: [-3, 5, -3], intensity: 0.5 },
    ];
    lights.forEach(l => {
        const light = new THREE.PointLight(l.color, l.intensity, 30);
        light.position.set(...l.pos);
        heroScene.add(light);
    });

    // Build diamond
    heroDiamond = buildDiamond('brilliant');
    heroScene.add(heroDiamond);

    // Sparkle particles
    createSparkles();

    // Mouse tracking
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

function buildDiamond(cut) {
    const group = new THREE.Group();
    const diamondMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.0,
        transmission: 0.9,
        thickness: 1.5,
        ior: 2.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 0.85,
        envMapIntensity: 1.5,
    });

    let geometry;
    if (cut === 'brilliant') {
        // Brilliant cut — octahedron derived
        geometry = new THREE.OctahedronGeometry(2, 0);
        // Flatten top
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            if (pos.getY(i) > 1.5) pos.setY(i, pos.getY(i) * 0.4);
        }
        geometry.computeVertexNormals();
    } else if (cut === 'princess') {
        // Princess cut — cube rotated
        geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
        geometry.rotateY(Math.PI / 4);
    } else {
        // Emerald cut — elongated octahedron
        geometry = new THREE.OctahedronGeometry(2, 0);
        geometry.scale(1.3, 1, 0.8);
    }

    const diamond = new THREE.Mesh(geometry, diamondMat);
    group.add(diamond);

    // Inner glow
    const glowGeo = new THREE.OctahedronGeometry(1.2, 0);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xd4a838, transparent: true, opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    return group;
}

function createSparkles() {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = 3 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = Math.random() * 0.15 + 0.05;
        phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.userData = { phases };

    heroSparkles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xd4a838, size: 0.12, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    heroScene.add(heroSparkles);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    // Diamond rotation
    heroDiamond.rotation.y = heroTime * 0.3 + heroMouseX * 0.5;
    heroDiamond.rotation.x = heroMouseY * 0.3 + Math.sin(heroTime * 0.2) * 0.1;

    // Scale pulse
    const pulse = 1 + Math.sin(heroTime * 1.5) * 0.03;
    heroDiamond.scale.set(pulse, pulse, pulse);

    // Sparkle twinkle
    if (heroSparkles) {
        const phases = heroSparkles.geometry.userData.phases;
        heroSparkles.material.opacity = 0.4 + Math.sin(heroTime * 3) * 0.3;
        heroSparkles.rotation.y = heroTime * 0.05;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ DIAMOND DETAIL VIEWER ============
let detailScene, detailCamera, detailRenderer, detailDiamond;
let detailMouseX = 0, detailMouseY = 0;
let currentCut = 'brilliant';

function initDetailViewer() {
    const canvas = document.getElementById('diamond-detail-canvas');
    const wrap = canvas.parentElement;

    detailScene = new THREE.Scene();
    detailCamera = new THREE.PerspectiveCamera(50, wrap.clientWidth / 400, 0.1, 100);
    detailCamera.position.set(0, 0, 7);

    detailRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    detailRenderer.setSize(wrap.clientWidth, 400);
    detailRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    detailScene.add(new THREE.AmbientLight(0x222233, 0.3));
    const lights = [
        { color: 0xd4a838, pos: [4, 4, 4] },
        { color: 0xffffff, pos: [-4, 2, 4] },
        { color: 0x4488ff, pos: [0, -4, 2] },
        { color: 0xff4488, pos: [2, -2, -4] },
    ];
    lights.forEach(l => {
        const light = new THREE.PointLight(l.color, 1.2, 20);
        light.position.set(...l.pos);
        detailScene.add(light);
    });

    detailDiamond = buildDiamond(currentCut);
    detailScene.add(detailDiamond);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        detailMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        detailMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    const ro = new ResizeObserver(() => {
        detailCamera.aspect = wrap.clientWidth / 400;
        detailCamera.updateProjectionMatrix();
        detailRenderer.setSize(wrap.clientWidth, 400);
    });
    ro.observe(wrap);

    animateDetail();
}

// Cut selector
document.querySelectorAll('.cut-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cut-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCut = btn.id.replace('cut-', '');
        if (detailScene) {
            detailScene.remove(detailDiamond);
            detailDiamond = buildDiamond(currentCut);
            detailScene.add(detailDiamond);
        }
    });
});

let detailTime = 0;
function animateDetail() {
    requestAnimationFrame(animateDetail);
    detailTime += 0.01;
    detailDiamond.rotation.y = detailTime * 0.4 + detailMouseX * 0.8;
    detailDiamond.rotation.x = detailMouseY * 0.5;
    detailRenderer.render(detailScene, detailCamera);
}

// ============ RING CONFIGURATOR ============
let ringScene, ringCamera, ringRenderer, ringGroup;
let ringMetal = 0xd4d4d8, ringStone = 0xffffff, ringSetting = 'solitaire';

function initRingConfigurator() {
    const canvas = document.getElementById('ring-canvas');
    const wrap = canvas.parentElement;

    ringScene = new THREE.Scene();
    ringCamera = new THREE.PerspectiveCamera(40, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    ringCamera.position.set(0, 2, 8);
    ringCamera.lookAt(0, 0, 0);

    ringRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    ringRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    ringRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    ringScene.add(new THREE.AmbientLight(0x333333, 0.4));
    const key = new THREE.DirectionalLight(0xd4a838, 1.5);
    key.position.set(3, 5, 3);
    ringScene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.8);
    rim.position.set(-3, 2, -3);
    ringScene.add(rim);
    const fill = new THREE.PointLight(0x4488ff, 0.5, 15);
    fill.position.set(0, -3, 2);
    ringScene.add(fill);

    // Ground reflection
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x1a1620, roughness: 0.2, metalness: 0.5 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ringScene.add(ground);

    buildRing();

    const ro = new ResizeObserver(() => {
        ringCamera.aspect = wrap.clientWidth / wrap.clientHeight;
        ringCamera.updateProjectionMatrix();
        ringRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    });
    ro.observe(wrap);

    animateRing();
}

function buildRing() {
    if (ringGroup) ringScene.remove(ringGroup);
    ringGroup = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({
        color: ringMetal, metalness: 0.9, roughness: 0.15
    });
    const stoneMat = new THREE.MeshPhysicalMaterial({
        color: ringStone, metalness: 0.1, roughness: 0.0,
        transmission: 0.8, thickness: 0.5, ior: 2.4,
        clearcoat: 1.0, transparent: true, opacity: 0.9
    });

    // Band — torus
    const band = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.12, 16, 64),
        metalMat
    );
    band.rotation.x = Math.PI / 2;
    ringGroup.add(band);

    if (ringSetting === 'solitaire') {
        // Single stone on top
        const stone = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.4, 0),
            stoneMat
        );
        stone.position.y = 0.5;
        // Flatten top
        const pos = stone.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            if (pos.getY(i) > 0.3) pos.setY(i, pos.getY(i) * 0.4);
        }
        stone.geometry.computeVertexNormals();
        ringGroup.add(stone);

        // Prongs
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const prong = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8),
                metalMat
            );
            prong.position.set(Math.cos(angle) * 0.25, 0.35, Math.sin(angle) * 0.25);
            ringGroup.add(prong);
        }
    } else if (ringSetting === 'halo') {
        // Center stone
        const center = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.35, 0),
            stoneMat
        );
        center.position.y = 0.45;
        const cpos = center.geometry.attributes.position;
        for (let i = 0; i < cpos.count; i++) {
            if (cpos.getY(i) > 0.25) cpos.setY(i, cpos.getY(i) * 0.4);
        }
        center.geometry.computeVertexNormals();
        ringGroup.add(center);

        // Halo ring
        const halo = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.04, 8, 32),
            metalMat
        );
        halo.position.y = 0.45;
        halo.rotation.x = Math.PI / 2;
        ringGroup.add(halo);

        // Small stones around halo
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const small = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.08, 0),
                stoneMat
            );
            small.position.set(Math.cos(angle) * 0.5, 0.45, Math.sin(angle) * 0.5);
            ringGroup.add(small);
        }
    } else if (ringSetting === 'trilogy') {
        // Three stones
        [-0.4, 0, 0.4].forEach((x, i) => {
            const size = i === 1 ? 0.4 : 0.3;
            const stone = new THREE.Mesh(
                new THREE.OctahedronGeometry(size, 0),
                stoneMat
            );
            stone.position.set(x, 0.4 + (i === 1 ? 0.05 : 0), 0);
            const pos = stone.geometry.attributes.position;
            for (let j = 0; j < pos.count; j++) {
                if (pos.getY(j) > size * 0.7) pos.setY(j, pos.getY(j) * 0.4);
            }
            stone.geometry.computeVertexNormals();
            ringGroup.add(stone);
        });
    }

    ringScene.add(ringGroup);
}

// Metal picker
document.querySelectorAll('.metal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.metal-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ringMetal = parseInt(btn.dataset.color.replace('#', '0x'));
        document.getElementById('sum-metal').textContent = btn.dataset.name;
        buildRing();
    });
});

// Stone picker
document.querySelectorAll('.stone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.stone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ringStone = parseInt(btn.dataset.color.replace('#', '0x'));
        document.getElementById('sum-stone').textContent = btn.dataset.name;
        buildRing();
    });
});

// Setting picker
document.querySelectorAll('.setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.setting-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ringSetting = btn.dataset.setting;
        document.getElementById('sum-setting').textContent = btn.textContent;
        buildRing();
    });
});

let ringTime = 0;
function animateRing() {
    requestAnimationFrame(animateRing);
    ringTime += 0.01;
    if (ringGroup) {
        ringGroup.rotation.y = ringTime * 0.3;
        ringGroup.position.y = Math.sin(ringTime * 0.5) * 0.1;
    }
    ringRenderer.render(ringScene, ringCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHeroDiamond();

    // Detail viewer
    const diamantSection = document.getElementById('diamant');
    const dObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !detailScene) {
            initDetailViewer();
            dObs.disconnect();
        }
    }, { threshold: 0.1 });
    dObs.observe(diamantSection);

    // Ring configurator
    const ringSection = document.getElementById('ringen');
    const rObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !ringScene) {
            initRingConfigurator();
            rObs.disconnect();
        }
    }, { threshold: 0.1 });
    rObs.observe(ringSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: { trigger: header, start: 'top 80%' },
            y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out'
        });
    });

    gsap.from('.collectie-card', {
        scrollTrigger: { trigger: '.collectie-grid', start: 'top 75%' },
        y: 50, opacity: 0, stagger: 0.1, duration: 0.7
    });

    gsap.from('.c-card', {
        scrollTrigger: { trigger: '.diamant-cs', start: 'top 80%' },
        x: -30, opacity: 0, stagger: 0.1, duration: 0.7
    });

    gsap.from('.atelier-stat', {
        scrollTrigger: { trigger: '.atelier-stats', start: 'top 80%' },
        scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)'
    });

    gsap.from('.contact-form', {
        scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' },
        x: 50, opacity: 0, duration: 0.8
    });
    gsap.from('.contact-info', {
        scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' },
        x: -50, opacity: 0, duration: 0.8
    });
}
