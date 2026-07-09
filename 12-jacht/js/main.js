// YachtSelect — 3D Yacht Broker
// Three.js yacht on animated water with scroll camera tour

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
document.getElementById('bezichtiging-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Aanvragen'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D YACHT ============
let heroScene, heroCamera, heroRenderer, heroYacht, waterMesh, wakeParticles;
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('yacht-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x06121a, 25, 80);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    heroCamera.position.set(0, 8, 25);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    heroScene.add(new THREE.AmbientLight(0x223344, 0.5));
    const sun = new THREE.DirectionalLight(0xffd9a0, 1.2);
    sun.position.set(10, 15, 5);
    heroScene.add(sun);
    const fill = new THREE.DirectionalLight(0x1a8ad4, 0.6);
    fill.position.set(-10, 5, -5);
    heroScene.add(fill);

    // Water
    createWater();

    // Yacht
    heroYacht = buildYacht();
    heroYacht.position.y = 0;
    heroScene.add(heroYacht);

    // Wake particles
    createWake();

    // Sky gradient
    const skyGeo = new THREE.SphereGeometry(100, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: { topColor: { value: new THREE.Color(0x0a1a30) }, bottomColor: { value: new THREE.Color(0x1a3a5a) } },
        vertexShader: 'varying vec3 vWorldPos; void main() { vWorldPos = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vWorldPos; void main() { float h = normalize(vWorldPos).y; gl_FragColor = vec4(mix(bottomColor, topColor, max(h,0.0)), 1.0); }',
        side: THREE.BackSide
    });
    heroScene.add(new THREE.Mesh(skyGeo, skyMat));

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

function createWater() {
    const waterGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0a3a5a, metalness: 0.6, roughness: 0.2,
        transparent: true, opacity: 0.85
    });
    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -1;
    waterMesh.userData = { originalPositions: waterGeo.attributes.position.array.slice() };
    heroScene.add(waterMesh);
}

function buildYacht() {
    const yacht = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xe8e8ec, metalness: 0.4, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.6, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x113355, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x1a8ad4, metalness: 0.5, roughness: 0.3 });

    // Hull — main body
    const hullGeo = new THREE.BoxGeometry(14, 2, 4);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 1;
    yacht.add(hull);

    // Hull bottom — tapered
    const hullBottom = new THREE.Mesh(
        new THREE.BoxGeometry(13, 1.5, 3.5),
        hullMat
    );
    hullBottom.position.y = 0.2;
    hullBottom.scale.y = 0.5;
    yacht.add(hullBottom);

    // Bow — pointed front
    const bowGeo = new THREE.ConeGeometry(2, 3, 4);
    const bow = new THREE.Mesh(bowGeo, hullMat);
    bow.position.set(8.5, 1, 0);
    bow.rotation.y = Math.PI / 4;
    bow.rotation.z = -Math.PI / 2;
    bow.scale.set(1, 1, 0.5);
    yacht.add(bow);

    // Superstructure — main cabin
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2, 3.5),
        darkMat
    );
    cabin.position.set(-1, 2.5, 0);
    yacht.add(cabin);

    // Upper deck
    const upperDeck = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1.5, 3),
        darkMat
    );
    upperDeck.position.set(-1.5, 4, 0);
    yacht.add(upperDeck);

    // Flybridge
    const flybridge = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.8, 2.5),
        hullMat
    );
    flybridge.position.set(-2, 5, 0);
    yacht.add(flybridge);

    // Windows — main cabin
    for (let i = 0; i < 5; i++) {
        const win = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.8, 0.05),
            glassMat
        );
        win.position.set(1 - i * 1.5, 2.7, 1.78);
        yacht.add(win);
        const win2 = win.clone();
        win2.position.z = -1.78;
        yacht.add(win2);
    }

    // Windshield
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1, 3),
        glassMat
    );
    windshield.position.set(3.2, 2.7, 0);
    windshield.rotation.y = 0;
    yacht.add(windshield);

    // Upper windows
    for (let i = 0; i < 3; i++) {
        const win = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.6, 0.05),
            glassMat
        );
        win.position.set(-0.5 - i * 1.5, 4.2, 1.53);
        yacht.add(win);
        const win2 = win.clone();
        win2.position.z = -1.53;
        yacht.add(win2);
    }

    // Railings
    const railMat = new THREE.MeshStandardMaterial({ color: 0xaaaab0, metalness: 0.9, roughness: 0.1 });
    for (let i = 0; i < 8; i++) {
        const rail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
            railMat
        );
        rail.position.set(5 - i * 1.8, 2.1, 2.1);
        yacht.add(rail);
        const rail2 = rail.clone();
        rail2.position.z = -2.1;
        yacht.add(rail2);
    }

    // Long rail
    const longRail1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 12, 8),
        railMat
    );
    longRail1.position.set(-1, 2.5, 2.1);
    longRail1.rotation.z = Math.PI / 2;
    yacht.add(longRail1);
    const longRail2 = longRail1.clone();
    longRail2.position.z = -2.1;
    yacht.add(longRail2);

    // Mast
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 3, 8),
        railMat
    );
    mast.position.set(-2, 6, 0);
    yacht.add(mast);

    // Radar
    const radar = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.15, 0.3),
        darkMat
    );
    radar.position.set(-2, 7.2, 0);
    yacht.add(radar);

    // Accent stripe
    const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(14.1, 0.3, 4.1),
        accentMat
    );
    stripe.position.y = 1.5;
    yacht.add(stripe);

    // Antenna
    const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2, 6),
        railMat
    );
    antenna.position.set(-3, 7, 0.5);
    yacht.add(antenna);

    return yacht;
}

function createWake() {
    const count = 150;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = -7 + Math.random() * 3;
        positions[i * 3 + 1] = -0.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        velocities[i * 2] = -0.1 - Math.random() * 0.1;
        velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.05;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    wakeParticles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.3, transparent: true, opacity: 0.4
    }));
    wakeParticles.userData = { velocities };
    heroScene.add(wakeParticles);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    // Scroll-based camera
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera orbits
    const angle = scrollProgress * Math.PI * 0.8 - 0.4 + heroMouseX * 0.3;
    heroCamera.position.x = Math.sin(angle) * 28;
    heroCamera.position.z = Math.cos(angle) * 28;
    heroCamera.position.y = 8 + scrollProgress * 6 + heroMouseY * 2;
    heroCamera.lookAt(0, 2, 0);

    // Yacht bobbing
    heroYacht.rotation.x = Math.sin(heroTime * 0.8) * 0.03;
    heroYacht.rotation.z = Math.sin(heroTime * 0.6) * 0.04;
    heroYacht.position.y = Math.sin(heroTime * 0.8) * 0.2;

    // Water animation
    if (waterMesh) {
        const pos = waterMesh.geometry.attributes.position;
        const orig = waterMesh.userData.originalPositions;
        for (let i = 0; i < pos.count; i++) {
            const x = orig[i * 3];
            const y = orig[i * 3 + 1];
            pos.setZ(i, Math.sin(x * 0.1 + heroTime) * 0.3 + Math.cos(y * 0.1 + heroTime * 0.7) * 0.3);
        }
        pos.needsUpdate = true;
        waterMesh.geometry.computeVertexNormals();
    }

    // Wake particles
    if (wakeParticles) {
        const pos = wakeParticles.geometry.attributes.position.array;
        const vel = wakeParticles.userData.velocities;
        for (let i = 0; i < vel.length; i++) {
            pos[i * 3] += vel[i * 2];
            pos[i * 3 + 2] += vel[i * 2 + 1];
            if (pos[i * 3] < -20) {
                pos[i * 3] = -7;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
            }
        }
        wakeParticles.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ TOUR 3D ============
let tourScene, tourCamera, tourRenderer, tourYacht, tourWater;
let tourDragging = false, tourLastX = 0, tourLastY = 0, tourRotY = 0, tourRotX = 0.2, tourZoom = 20;

function initTour() {
    const canvas = document.getElementById('tour-canvas');
    const wrap = canvas.parentElement;

    tourScene = new THREE.Scene();
    tourScene.fog = new THREE.Fog(0x06121a, 20, 60);

    tourCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    tourCamera.position.set(0, 8, 20);

    tourRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    tourRenderer.setSize(wrap.clientWidth || 600, 500);
    tourRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    tourScene.add(new THREE.AmbientLight(0x223344, 0.5));
    const sun = new THREE.DirectionalLight(0xffd9a0, 1.2);
    sun.position.set(10, 15, 5);
    tourScene.add(sun);
    const fill = new THREE.DirectionalLight(0x1a8ad4, 0.6);
    fill.position.set(-10, 5, -5);
    tourScene.add(fill);

    // Water
    const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0a3a5a, metalness: 0.6, roughness: 0.2, transparent: true, opacity: 0.85 });
    tourWater = new THREE.Mesh(waterGeo, waterMat);
    tourWater.rotation.x = -Math.PI / 2;
    tourWater.position.y = -1;
    tourWater.userData = { orig: waterGeo.attributes.position.array.slice() };
    tourScene.add(tourWater);

    // Yacht
    tourYacht = buildYacht();
    tourScene.add(tourYacht);

    // Controls
    canvas.addEventListener('mousedown', (e) => { tourDragging = true; tourLastX = e.clientX; tourLastY = e.clientY; });
    window.addEventListener('mouseup', () => tourDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (tourDragging) {
            tourRotY += (e.clientX - tourLastX) * 0.01;
            tourRotX += (e.clientY - tourLastY) * 0.005;
            tourRotX = Math.max(-0.5, Math.min(1, tourRotX));
            tourLastX = e.clientX; tourLastY = e.clientY;
        }
    });
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        tourZoom = Math.max(10, Math.min(40, tourZoom + e.deltaY * 0.02));
    });
    canvas.addEventListener('touchstart', (e) => { tourDragging = true; tourLastX = e.touches[0].clientX; tourLastY = e.touches[0].clientY; });
    window.addEventListener('touchend', () => tourDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (tourDragging) {
            tourRotY += (e.touches[0].clientX - tourLastX) * 0.01;
            tourRotX += (e.touches[0].clientY - tourLastY) * 0.005;
            tourRotX = Math.max(-0.5, Math.min(1, tourRotX));
            tourLastX = e.touches[0].clientX; tourLastY = e.touches[0].clientY;
        }
    });

    const ro = new ResizeObserver(() => {
        tourCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 500);
        tourCamera.updateProjectionMatrix();
        tourRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 500);
    });
    ro.observe(wrap);

    animateTour();
}

let tourTime = 0;
function animateTour() {
    requestAnimationFrame(animateTour);
    tourTime += 0.01;

    if (!tourDragging) tourRotY += 0.003;

    tourCamera.position.x = Math.sin(tourRotY) * tourZoom;
    tourCamera.position.z = Math.cos(tourRotY) * tourZoom;
    tourCamera.position.y = 5 + tourRotX * 10;
    tourCamera.lookAt(0, 2, 0);

    tourYacht.rotation.x = Math.sin(tourTime * 0.8) * 0.03;
    tourYacht.rotation.z = Math.sin(tourTime * 0.6) * 0.04;
    tourYacht.position.y = Math.sin(tourTime * 0.8) * 0.2;

    if (tourWater) {
        const pos = tourWater.geometry.attributes.position;
        const orig = tourWater.userData.orig;
        for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, Math.sin(orig[i * 3] * 0.1 + tourTime) * 0.3 + Math.cos(orig[i * 3 + 1] * 0.1 + tourTime * 0.7) * 0.3);
        }
        pos.needsUpdate = true;
        tourWater.geometry.computeVertexNormals();
    }

    tourRenderer.render(tourScene, tourCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const tourSection = document.getElementById('tour');
    const tObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !tourScene) { initTour(); tObs.disconnect(); }
    }, { threshold: 0.1 });
    tObs.observe(tourSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.yacht-card', { scrollTrigger: { trigger: '.vloot-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.dienst-card', { scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
