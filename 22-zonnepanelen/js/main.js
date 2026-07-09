// ZonWacht — 3D Solar Panels with Savings Calculator
// Three.js 3D house with solar panels + sun animation + interactive calculator

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
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Aanvragen'; btn.style.background = ''; }, 2500);
});

// ============ CALCULATOR ============
const calcBill = document.getElementById('calc-bill');
const calcRoof = document.getElementById('calc-roof');
const calcOrient = document.getElementById('calc-orientation');
const calcPrice = document.getElementById('calc-price');

const orientFactor = { south: 1.0, 'east-west': 0.85, east: 0.75, west: 0.75 };

function updateCalc() {
    const bill = parseFloat(calcBill.value);
    const roof = parseFloat(calcRoof.value);
    const orient = orientFactor[calcOrient.value];
    const price = parseFloat(calcPrice.value);

    // Each panel ~1.7m², 360Wp
    const maxPanels = Math.floor(roof / 1.7);
    // Annual consumption from bill
    const annualKWh = (bill * 12) / price;
    // Panels needed to cover ~70% of consumption
    const neededPanels = Math.min(maxPanels, Math.ceil((annualKWh * 0.7) / (360 * 0.85 * orient)));
    const panels = Math.max(4, neededPanels);
    const totalWp = panels * 360;
    const totalKWp = (totalWp / 1000).toFixed(1);

    // Annual production (NL avg: ~850 kWh/kWp/year * orientation factor)
    const annualProduction = totalKWp * 850 * orient;
    const annualSaving = Math.round(annualProduction * price);
    const investment = panels * 280 + 1200; // panels + installation
    const payback = (investment / annualSaving).toFixed(1);
    const co2 = (annualProduction * 0.0005).toFixed(1); // ton CO2

    document.getElementById('bill-val').textContent = bill;
    document.getElementById('roof-val').textContent = roof;
    document.getElementById('price-val').textContent = price.toFixed(2);
    document.getElementById('r-panels').textContent = panels;
    document.getElementById('r-power').textContent = totalKWp + ' kWp';
    document.getElementById('r-saving').textContent = '€ ' + annualSaving.toLocaleString('nl-NL');
    document.getElementById('r-payback').textContent = payback + ' jaar';
    document.getElementById('r-co2').textContent = co2 + ' ton';
    document.getElementById('r-investment').textContent = '€ ' + investment.toLocaleString('nl-NL');
}

[calcBill, calcRoof, calcPrice].forEach(input => input.addEventListener('input', updateCalc));
calcOrient.addEventListener('change', updateCalc);
updateCalc();

// ============ HERO 3D SOLAR SCENE ============
let heroScene, heroCamera, heroRenderer, solarHouse, sunMesh, energyParticles;
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('solar-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x060a0e, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 5, 15);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm sun + cool sky lighting
    heroScene.add(new THREE.AmbientLight(0x2a3a4a, 0.4));
    const sunLight = new THREE.DirectionalLight(0xffd080, 1.5);
    sunLight.position.set(8, 10, 5);
    heroScene.add(sunLight);
    const fill = new THREE.DirectionalLight(0x4080a0, 0.4);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const sunGlow = new THREE.PointLight(0xffa020, 2.0, 20);
    sunGlow.position.set(8, 8, 0);
    heroScene.add(sunGlow);

    // Sun
    sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffa020 })
    );
    sunMesh.position.set(8, 8, 0);
    heroScene.add(sunMesh);

    // Sun glow
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.15 })
    );
    glow.position.copy(sunMesh.position);
    heroScene.add(glow);
    heroScene.userData = { sunGlow: glow };

    // House with solar panels
    solarHouse = buildSolarHouse();
    heroScene.add(solarHouse);

    // Energy particles flowing from panels
    createEnergyParticles();

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

function buildSolarHouse() {
    const house = new THREE.Group();

    // House body
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0d0c0, roughness: 0.8 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), wallMat);
    walls.position.y = 0;
    house.add(walls);

    // Roof — angled
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.7 });
    const roof = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 4, 3, 4, 1),
        roofMat
    );
    roof.rotation.y = Math.PI / 4;
    roof.rotation.x = 0;
    roof.scale.set(1, 1, 0.6);
    roof.position.y = 3.5;
    // Actually use a wedge shape
    const roofGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -3.5, 2, -2.8,  3.5, 2, -2.8,  3.5, 2, 2.8,
        -3.5, 2, -2.8,  3.5, 2, 2.8,  -3.5, 2, 2.8,
        0, 5, -2.8,  -3.5, 2, -2.8,  3.5, 2, -2.8,
        0, 5, 2.8,   3.5, 2, 2.8,   -3.5, 2, 2.8,
        0, 5, -2.8,  3.5, 2, -2.8,  0, 5, 2.8,
        0, 5, -2.8,  0, 5, 2.8,   -3.5, 2, -2.8,
        -3.5, 2, -2.8, 0, 5, 2.8,  -3.5, 2, 2.8,
        3.5, 2, -2.8, 3.5, 2, 2.8,  0, 5, 2.8,
    ]);
    roofGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roofGeo.computeVertexNormals();
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    house.add(roofMesh);

    // Solar panels on roof — angled to sun
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.2, metalness: 0.3, emissive: 0x0a2030, emissiveIntensity: 0.4 });
    const panelFrameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.5, metalness: 0.5 });

    // Place panels on the south-facing side (left side of roof)
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.08, 0.8),
                panelMat
            );
            // Position on left slope of roof
            const x = -2.5 + col * 1.3;
            const y = 3.8 - row * 1.0;
            const z = -1.5 + row * 0.5;
            panel.position.set(x, y, z);
            // Tilt to match roof slope
            panel.rotation.x = -0.3;
            panel.rotation.z = 0.4;
            house.add(panel);

            // Panel grid lines
            const lineMat = new THREE.MeshBasicMaterial({ color: 0x0a1525 });
            for (let i = 1; i < 3; i++) {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(1.18, 0.09, 0.02),
                    lineMat
                );
                line.position.set(x, y + 0.005, z - 0.8/2 + i * 0.27);
                line.rotation.x = -0.3;
                line.rotation.z = 0.4;
                house.add(line);
            }
        }
    }

    // Door
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6 })
    );
    door.position.set(0, -1, 2.55);
    house.add(door);

    // Windows
    const winMat = new THREE.MeshStandardMaterial({ color: 0x80c0e0, roughness: 0.1, metalness: 0.5, emissive: 0x4080a0, emissiveIntensity: 0.3 });
    [-1.8, 1.8].forEach(x => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), winMat);
        win.position.set(x, 0.5, 2.55);
        house.add(win);
    });

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.5;
    house.add(ground);

    return house;
}

function createEnergyParticles() {
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        // Start from roof area
        positions[i * 3] = -2 + Math.random() * 4;
        positions[i * 3 + 1] = 3 + Math.random() * 2;
        positions[i * 3 + 2] = -1 + Math.random() * 2;
        velocities[i * 3] = 0.02 + Math.random() * 0.03;
        velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        phases[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities, phases };
    energyParticles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffa020, size: 0.15, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending
    }));
    heroScene.add(energyParticles);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera orbit
    heroCamera.position.x = Math.sin(heroTime * 0.08 + heroMouseX * 0.3) * 15;
    heroCamera.position.y = 5 + heroMouseY * 1.5;
    heroCamera.position.z = Math.cos(heroTime * 0.08 + heroMouseX * 0.3) * 15;
    heroCamera.lookAt(0, 1, 0);

    // Sun pulses
    if (sunMesh) {
        const pulse = 1 + Math.sin(heroTime * 2) * 0.05;
        sunMesh.scale.setScalar(pulse);
    }
    if (heroScene.userData.sunGlow) {
        heroScene.userData.sunGlow.scale.setScalar(1 + Math.sin(heroTime * 3) * 0.1);
        heroScene.userData.sunGlow.material.opacity = 0.1 + Math.sin(heroTime * 3) * 0.05;
    }

    // Energy particles flow from panels toward sun
    if (energyParticles) {
        const pos = energyParticles.geometry.attributes.position.array;
        const vel = energyParticles.geometry.userData.velocities;
        const phases = energyParticles.geometry.userData.phases;
        for (let i = 0; i < vel.length; i += 3) {
            pos[i] += vel[i] * Math.cos(phases[i / 3] + heroTime) * 0.5;
            pos[i + 1] += vel[i + 1];
            pos[i + 2] += vel[i + 2];
            if (pos[i + 1] > 8) {
                pos[i] = -2 + Math.random() * 4;
                pos[i + 1] = 3;
                pos[i + 2] = -1 + Math.random() * 2;
            }
        }
        energyParticles.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.paneel-card', { scrollTrigger: { trigger: '.panelen-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.voordeel', { scrollTrigger: { trigger: '.voordelen-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
    gsap.from('.calc-form', { scrollTrigger: { trigger: '.calc-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
    gsap.from('.calc-results', { scrollTrigger: { trigger: '.calc-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
}
