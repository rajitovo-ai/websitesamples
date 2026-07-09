// AutoGallery — 3D Auto Showroom
// Three.js procedural car with 360° rotation, color picker, wheel selector

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
document.getElementById('proefrit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Plan Proefrit'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D SCENE ============
let heroScene, heroCamera, heroRenderer, heroCar, heroParticles;
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('three-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x060608, 20, 60);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 5, 18);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    heroScene.add(new THREE.AmbientLight(0x333344, 0.5));

    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1.5);
    keyLight.position.set(5, 8, 5);
    heroScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-5, 3, -5);
    heroScene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight.position.set(0, -5, 3);
    heroScene.add(fillLight);

    // Ground — reflective
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a12, roughness: 0.3, metalness: 0.5
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    heroScene.add(ground);

    // Grid lines
    const gridHelper = new THREE.GridHelper(60, 30, 0x00d4ff, 0x112233);
    gridHelper.position.y = -0.49;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    heroScene.add(gridHelper);

    // Build car
    heroCar = buildCar(0x0a0a0a);
    heroCar.position.y = 0;
    heroScene.add(heroCar);

    // Particles
    createHeroParticles();

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

function buildCar(color) {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
        color: color, metalness: 0.7, roughness: 0.25
    });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x111122, metalness: 0.9, roughness: 0.05,
        transparent: true, opacity: 0.7
    });
    const trimMat = new THREE.MeshStandardMaterial({
        color: 0x222226, metalness: 0.8, roughness: 0.3
    });
    const lightMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.5
    });
    const tailMat = new THREE.MeshStandardMaterial({
        color: 0xff2020, emissive: 0xff2020, emissiveIntensity: 0.3
    });

    // Lower body
    const lowerBody = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.2, 3.5),
        bodyMat
    );
    lowerBody.position.y = 0.8;
    car.add(lowerBody);

    // Upper body (cabin) — tapered
    const cabinGeo = new THREE.BoxGeometry(4.5, 1.3, 3.2);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(-0.3, 1.9, 0);
    car.add(cabin);

    // Windshield (front)
    const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.1, 2.8),
        glassMat
    );
    windshield.position.set(2.1, 1.9, 0);
    windshield.rotation.z = -0.5;
    car.add(windshield);

    // Rear window
    const rearWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.1, 2.8),
        glassMat
    );
    rearWindow.position.set(-2.5, 1.9, 0);
    rearWindow.rotation.z = 0.5;
    car.add(rearWindow);

    // Side windows
    [-1.65, 1.65].forEach(z => {
        const sideWin = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 0.9, 0.05),
            glassMat
        );
        sideWin.position.set(-0.3, 2, z);
        car.add(sideWin);
    });

    // Hood detail
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 3.3),
        trimMat
    );
    hood.position.set(2.8, 1.45, 0);
    car.add(hood);

    // Front bumper
    const frontBumper = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 3.4),
        trimMat
    );
    frontBumper.position.set(4.1, 0.7, 0);
    car.add(frontBumper);

    // Rear bumper
    const rearBumper = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 3.4),
        trimMat
    );
    rearBumper.position.set(-4.1, 0.7, 0);
    car.add(rearBumper);

    // Headlights
    [1.5, -1.5].forEach(z => {
        const light = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.4, 0.8),
            lightMat
        );
        light.position.set(4.15, 1.1, z);
        car.add(light);
    });

    // Tail lights
    [1.5, -1.5].forEach(z => {
        const tail = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.4, 0.8),
            tailMat
        );
        tail.position.set(-4.15, 1.1, z);
        car.add(tail);
    });

    // Wheels
    const wheelPositions = [
        [2.6, 0.5, 1.9], [2.6, 0.5, -1.9],
        [-2.6, 0.5, 1.9], [-2.6, 0.5, -1.9]
    ];
    wheelPositions.forEach(pos => {
        const wheel = createWheel();
        wheel.position.set(pos[0], pos[1], pos[2]);
        car.add(wheel);
    });

    // Side mirrors
    [1.7, -1.7].forEach(z => {
        const mirror = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 0.5),
            bodyMat
        );
        mirror.position.set(1.8, 1.8, z);
        car.add(mirror);
    });

    // Front grille
    const grille = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 2),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 })
    );
    grille.position.set(4.15, 0.9, 0);
    car.add(grille);

    return car;
}

function createWheel() {
    const wheelGroup = new THREE.Group();

    // Tire
    const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.4, 24),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
    );
    tire.rotation.x = Math.PI / 2;
    wheelGroup.add(tire);

    // Rim
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.42, 16),
        new THREE.MeshStandardMaterial({ color: 0x888890, metalness: 0.9, roughness: 0.15 })
    );
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);

    // Spokes
    for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.7, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xaaaab0, metalness: 0.8, roughness: 0.2 })
        );
        spoke.rotation.x = (i / 5) * Math.PI * 2;
        wheelGroup.add(spoke);
    }

    return wheelGroup;
}

function createHeroParticles() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    heroParticles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0x00d4ff, size: 0.08, transparent: true, opacity: 0.4
    }));
    heroScene.add(heroParticles);
}

let heroTime = 0;
function animateHero() {
    requestAnimationFrame(animateHero);
    heroTime += 0.01;

    // Car rotation based on scroll
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Auto rotate + mouse influence
    heroCar.rotation.y = heroTime * 0.15 + heroMouseX * 0.5 + scrollProgress * Math.PI * 2;
    heroCar.position.y = Math.sin(heroTime * 0.5) * 0.1;

    // Camera subtle movement
    heroCamera.position.x = heroMouseX * 2;
    heroCamera.position.y = 5 + heroMouseY * 1;
    heroCamera.lookAt(0, 1.5, 0);

    // Particles drift
    if (heroParticles) {
        heroParticles.rotation.y = heroTime * 0.02;
        const pos = heroParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i + 1] += 0.02;
            if (pos[i + 1] > 20) pos[i + 1] = 0;
        }
        heroParticles.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ CONFIGURATOR 3D ============
let configScene, configCamera, configRenderer, configCar;
let configDragging = false, configLastX = 0, configRotationY = 0;
let currentColor = 0x0a0a0a;

function initConfigurator() {
    const canvas = document.getElementById('car-canvas');
    const wrap = canvas.parentElement;

    configScene = new THREE.Scene();
    configScene.fog = new THREE.Fog(0x060608, 15, 40);

    configCamera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    configCamera.position.set(0, 4, 14);
    configCamera.lookAt(0, 1, 0);

    configRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    configRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    configRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    configScene.add(new THREE.AmbientLight(0x333344, 0.5));

    const key = new THREE.DirectionalLight(0x00d4ff, 1.2);
    key.position.set(5, 8, 5);
    configScene.add(key);

    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-5, 3, -5);
    configScene.add(rim);

    const fill = new THREE.DirectionalLight(0x4488ff, 0.3);
    fill.position.set(0, -3, 3);
    configScene.add(fill);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.3, metalness: 0.4 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    configScene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(30, 15, 0x00d4ff, 0x112233);
    grid.position.y = -0.49;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    configScene.add(grid);

    // Build car
    configCar = buildCar(currentColor);
    configScene.add(configCar);

    // Drag controls
    canvas.addEventListener('mousedown', (e) => {
        configDragging = true;
        configLastX = e.clientX;
        canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
        configDragging = false;
        canvas.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', (e) => {
        if (configDragging) {
            configRotationY += (e.clientX - configLastX) * 0.01;
            configLastX = e.clientX;
        }
    });
    canvas.addEventListener('touchstart', (e) => {
        configDragging = true;
        configLastX = e.touches[0].clientX;
    });
    window.addEventListener('touchend', () => configDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (configDragging) {
            configRotationY += (e.touches[0].clientX - configLastX) * 0.01;
            configLastX = e.touches[0].clientX;
        }
    });

    // Resize
    const resizeObserver = new ResizeObserver(() => {
        configCamera.aspect = wrap.clientWidth / wrap.clientHeight;
        configCamera.updateProjectionMatrix();
        configRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    });
    resizeObserver.observe(wrap);

    animateConfigurator();
}

function updateCarColor(color) {
    currentColor = color;
    configCar.traverse(child => {
        if (child.isMesh && child.material && child.material.metalness === 0.7) {
            child.material.color.setHex(color);
        }
    });
}

// Color picker
document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.dataset.color;
        const name = swatch.dataset.name;
        document.getElementById('color-name').textContent = name;
        updateCarColor(parseInt(color.replace('#', '0x')));
    });
});

// Wheel selector (visual feedback only)
document.querySelectorAll('.wheel-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.wheel-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

let configTime = 0;
function animateConfigurator() {
    requestAnimationFrame(animateConfigurator);
    configTime += 0.01;

    if (!configDragging) {
        configRotationY += 0.005; // Auto rotate
    }

    configCar.rotation.y = configRotationY;
    configCar.position.y = Math.sin(configTime * 0.5) * 0.08;

    configRenderer.render(configScene, configCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    // Configurator initializes when visible
    const configSection = document.getElementById('modellen');
    const configObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !configScene) {
            initConfigurator();
            configObserver.disconnect();
        }
    }, { threshold: 0.1 });
    configObserver.observe(configSection);
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

    gsap.from('.car-card', {
        scrollTrigger: { trigger: '.showroom-grid', start: 'top 75%' },
        y: 50, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out'
    });

    gsap.from('.dienst-card', {
        scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' },
        y: 50, opacity: 0, stagger: 0.1, duration: 0.7
    });

    gsap.from('.over-stat-card', {
        scrollTrigger: { trigger: '.over-visual', start: 'top 80%' },
        scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)'
    });

    gsap.from('.review-card', {
        scrollTrigger: { trigger: '.reviews-grid', start: 'top 80%' },
        y: 40, opacity: 0, stagger: 0.15, duration: 0.7
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
