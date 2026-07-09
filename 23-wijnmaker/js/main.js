// Domaine Zonnewende — 3D Vineyard
// Three.js 3D vineyard with rows of grapevines, rolling hills, sun

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
document.getElementById('bezoek-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Geboekt! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Boeken'; btn.style.background = ''; }, 2500);
});
document.getElementById('newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangemeld! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Aanmelden'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D VINEYARD SCENE ============
let heroScene, heroCamera, heroRenderer;
let heroMouseX = 0, heroMouseY = 0;
let grapeParticles = [];

function initHero() {
    const canvas = document.getElementById('vineyard-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x0a0608, 20, 60);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 8, 20);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm sunset lighting
    heroScene.add(new THREE.AmbientLight(0x3a2a30, 0.4));
    const key = new THREE.DirectionalLight(0xffa060, 1.2);
    key.position.set(10, 15, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0x8a2050, 0.4);
    fill.position.set(-5, 5, -3);
    heroScene.add(fill);
    const sun = new THREE.PointLight(0xff8040, 1.5, 30);
    sun.position.set(12, 8, -5);
    heroScene.add(sun);

    // Sun
    const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffa040 })
    );
    sunMesh.position.set(12, 8, -5);
    heroScene.add(sunMesh);
    heroScene.userData = { sunMesh };

    // Rolling hills
    createHills();

    // Grape particles
    createGrapeParticles();

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

function createHills() {
    // Multiple rolling hills
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
        const hill = new THREE.Mesh(
            new THREE.SphereGeometry(15 + i * 5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            hillMat.clone()
        );
        hill.position.set(
            (i - 1.5) * 12,
            -2 - i * 1.5,
            -10 - i * 3
        );
        hill.scale.set(1.5, 0.3 + i * 0.1, 1);
        heroScene.add(hill);
    }

    // Vineyard rows on nearest hill
    createVineRows();
}

function createVineRows() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.5, metalness: 0.5 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.7 });
    const grapeMat = new THREE.MeshStandardMaterial({ color: 0x6a1838, roughness: 0.4, emissive: 0x3a0a18, emissiveIntensity: 0.2 });

    for (let row = 0; row < 6; row++) {
        const z = -5 + row * 2.5;
        // Posts
        for (let p = 0; p < 5; p++) {
            const x = -8 + p * 4;
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 2.5, 6),
                postMat
            );
            post.position.set(x, 1.25, z);
            heroScene.add(post);

            // Wires between posts
            if (p < 4) {
                for (let w = 0; w < 2; w++) {
                    const wire = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.02, 0.02, 4, 4),
                        wireMat
                    );
                    wire.rotation.z = Math.PI / 2;
                    wire.position.set(x + 2, 1.2 + w * 0.6, z);
                    heroScene.add(wire);
                }
            }

            // Vine leaves (cluster at each post)
            if (p > 0 && p < 4) {
                for (let l = 0; l < 4; l++) {
                    const leaf = new THREE.Mesh(
                        new THREE.SphereGeometry(0.4 + Math.random() * 0.2, 8, 6),
                        leafMat
                    );
                    leaf.scale.set(1, 0.5, 0.8);
                    leaf.position.set(
                        x + (Math.random() - 0.5) * 1.5,
                        1.5 + Math.random() * 0.8,
                        z + (Math.random() - 0.5) * 0.8
                    );
                    leaf.userData = { floatPhase: Math.random() * Math.PI * 2, baseRot: leaf.rotation.clone() };
                    heroScene.add(leaf);
                    grapeParticles.push(leaf);
                }

                // Grape clusters
                for (let g = 0; g < 2; g++) {
                    const grape = new THREE.Mesh(
                        new THREE.SphereGeometry(0.2, 8, 6),
                        grapeMat
                    );
                    grape.position.set(
                        x + (Math.random() - 0.5) * 0.8,
                        1.0 + Math.random() * 0.4,
                        z + (Math.random() - 0.5) * 0.5
                    );
                    heroScene.add(grape);
                }
            }
        }
    }
}

function createGrapeParticles() {
    const count = 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = -2 + Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
        velocities[i * 3] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = 0.005 + Math.random() * 0.01;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0x8a2050, size: 0.1, transparent: true, opacity: 0.4,
        blending: THREE.AdditiveBlending
    }));
    heroScene.add(particles);
    heroScene.userData = { ...heroScene.userData, particles };
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera flies over vineyard based on scroll
    const camAngle = heroTime * 0.05 + heroMouseX * 0.3;
    heroCamera.position.x = Math.sin(camAngle) * 20;
    heroCamera.position.y = 8 + heroMouseY * 2 + scrollProgress * 5;
    heroCamera.position.z = Math.cos(camAngle) * 20;
    heroCamera.lookAt(0, 1, -5);

    // Sun pulse
    if (heroScene.userData.sunMesh) {
        const pulse = 1 + Math.sin(heroTime * 2) * 0.03;
        heroScene.userData.sunMesh.scale.setScalar(pulse);
    }

    // Leaves sway
    grapeParticles.forEach(leaf => {
        if (leaf.userData.floatPhase !== undefined) {
            leaf.rotation.z = leaf.userData.baseRot.z + Math.sin(heroTime + leaf.userData.floatPhase) * 0.1;
        }
    });

    // Particles
    if (heroScene.userData.particles) {
        const p = heroScene.userData.particles;
        const pos = p.geometry.attributes.position.array;
        const vel = p.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i += 3) {
            pos[i] += vel[i];
            pos[i + 1] += vel[i + 1];
            pos[i + 2] += vel[i + 2];
            if (pos[i + 1] > 8) {
                pos[i] = (Math.random() - 0.5) * 20;
                pos[i + 1] = -2;
                pos[i + 2] = (Math.random() - 0.5) * 15;
            }
        }
        p.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ 3D VINEYARD INTERACTIVE ============
let vineScene, vineCamera, vineRenderer;
let vineDragging = false, vineLastX = 0, vineRotY = 0;

function initVineyard3D() {
    const canvas = document.getElementById('vineyard3d-canvas');
    const wrap = canvas.parentElement;

    vineScene = new THREE.Scene();
    vineScene.fog = new THREE.Fog(0x0a0608, 10, 40);

    vineCamera = new THREE.PerspectiveCamera(50, wrap.clientWidth / 500, 0.1, 100);
    vineCamera.position.set(0, 5, 15);
    vineCamera.lookAt(0, 0, 0);

    vineRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    vineRenderer.setSize(wrap.clientWidth || 600, 500);
    vineRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    vineScene.add(new THREE.AmbientLight(0x3a2a30, 0.4));
    const key = new THREE.DirectionalLight(0xffa060, 1.2);
    key.position.set(5, 10, 5);
    vineScene.add(key);
    const fill = new THREE.DirectionalLight(0x8a2050, 0.3);
    fill.position.set(-5, 3, -3);
    vineScene.add(fill);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    vineScene.add(ground);

    // Vineyard rows
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.5, metalness: 0.5 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.7 });
    const grapeMat = new THREE.MeshStandardMaterial({ color: 0x6a1838, roughness: 0.4, emissive: 0x3a0a18, emissiveIntensity: 0.3 });

    for (let row = 0; row < 5; row++) {
        const z = -4 + row * 2;
        for (let p = 0; p < 6; p++) {
            const x = -6 + p * 2.5;
            // Post
            const post = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6),
                postMat
            );
            post.position.set(x, 1.25, z);
            vineScene.add(post);

            // Wires
            if (p < 5) {
                for (let w = 0; w < 2; w++) {
                    const wire = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.015, 0.015, 2.5, 4),
                        wireMat
                    );
                    wire.rotation.z = Math.PI / 2;
                    wire.position.set(x + 1.25, 1.2 + w * 0.5, z);
                    vineScene.add(wire);
                }
            }

            // Leaves
            if (p > 0 && p < 5) {
                for (let l = 0; l < 3; l++) {
                    const leaf = new THREE.Mesh(
                        new THREE.SphereGeometry(0.3 + Math.random() * 0.15, 8, 6),
                        leafMat
                    );
                    leaf.scale.set(1, 0.5, 0.8);
                    leaf.position.set(
                        x + (Math.random() - 0.5) * 1,
                        1.3 + Math.random() * 0.6,
                        z + (Math.random() - 0.5) * 0.6
                    );
                    vineScene.add(leaf);
                }

                // Grape clusters
                for (let g = 0; g < 2; g++) {
                    const grape = new THREE.Mesh(
                        new THREE.SphereGeometry(0.15, 8, 6),
                        grapeMat
                    );
                    grape.position.set(
                        x + (Math.random() - 0.5) * 0.6,
                        0.9 + Math.random() * 0.3,
                        z + (Math.random() - 0.5) * 0.4
                    );
                    vineScene.add(grape);
                }
            }
        }
    }

    // Distant hills
    for (let i = 0; i < 3; i++) {
        const hill = new THREE.Mesh(
            new THREE.SphereGeometry(8 + i * 3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x1a3a1a, roughness: 0.9 })
        );
        hill.position.set((i - 1) * 10, -1, -12 - i * 2);
        hill.scale.set(2, 0.3, 1);
        vineScene.add(hill);
    }

    // Sun
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0xffa040 })
    );
    sun.position.set(8, 6, -10);
    vineScene.add(sun);

    // Controls
    canvas.addEventListener('mousedown', (e) => { vineDragging = true; vineLastX = e.clientX; });
    window.addEventListener('mouseup', () => vineDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (vineDragging) { vineRotY += (e.clientX - vineLastX) * 0.01; vineLastX = e.clientX; }
    });
    canvas.addEventListener('touchstart', (e) => { vineDragging = true; vineLastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => vineDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (vineDragging) { vineRotY += (e.touches[0].clientX - vineLastX) * 0.01; vineLastX = e.touches[0].clientX; }
    });

    const ro = new ResizeObserver(() => {
        vineCamera.aspect = wrap.clientWidth / 500;
        vineCamera.updateProjectionMatrix();
        vineRenderer.setSize(wrap.clientWidth || 600, 500);
    });
    ro.observe(wrap);

    animateVineyard3D();
}

let vineTime = 0;
function animateVineyard3D() {
    requestAnimationFrame(animateVineyard3D);
    vineTime += 0.01;

    if (!vineDragging) vineRotY += 0.003;
    vineCamera.position.x = Math.sin(vineRotY) * 15;
    vineCamera.position.z = Math.cos(vineRotY) * 15;
    vineCamera.position.y = 5 + Math.sin(vineTime * 0.3) * 0.5;
    vineCamera.lookAt(0, 0.5, 0);

    vineRenderer.render(vineScene, vineCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const vineSection = document.getElementById('wijngaard');
    const vObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !vineScene) { initVineyard3D(); vObs.disconnect(); }
    }, { threshold: 0.1 });
    vObs.observe(vineSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.wijn-card', { scrollTrigger: { trigger: '.wijnen-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.proces-step', { scrollTrigger: { trigger: '.proces-timeline', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.bezoek-option', { scrollTrigger: { trigger: '.bezoek-options', start: 'top 80%' }, x: -30, opacity: 0, stagger: 0.1, duration: 0.6 });
    gsap.from('.bezoek-form', { scrollTrigger: { trigger: '.bezoek-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.info-card', { scrollTrigger: { trigger: '.wijngaard-info', start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.1, duration: 0.6 });
}
