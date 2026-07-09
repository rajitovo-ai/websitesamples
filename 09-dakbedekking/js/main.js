// DakVakman — 3D Dakbedekking Website
// Three.js house with roof tiles assembling on scroll

// ============ LOADER ============
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1800);
});

// ============ NAV ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

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
setTimeout(animateCounters, 2000);

// ============ SCROLL ANIMATIONS ============
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.15 });
document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

// ============ MATERIAAL SELECTOR ============
document.querySelectorAll('.materiaal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const mat = tab.dataset.mat;
        document.querySelectorAll('.materiaal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.materiaal-info').forEach(i => i.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`.materiaal-info[data-mat="${mat}"]`).classList.add('active');
    });
});

// ============ FORM ============
document.getElementById('offerte-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Verzonden! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => {
        e.target.reset();
        btn.textContent = 'Verstuur Aanvraag';
        btn.style.background = '';
    }, 2500);
});

// ============ THREE.JS 3D HOUSE ============
let scene, camera, renderer, house, roofTiles = [], rainParticles, sunRays;
let scrollProgress = 0;

function initThree() {
    const canvas = document.getElementById('three-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f0e0c, 15, 50);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 4, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambient = new THREE.AmbientLight(0x4a4038, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffd9a0, 1.2);
    dirLight.position.set(10, 15, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe8873a, 0.4);
    fillLight.position.set(-8, 5, -5);
    scene.add(fillLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build house
    buildHouse();

    // Rain particles
    createRain();

    // Sun rays
    createSunRays();

    window.addEventListener('resize', onResize);
    animate();
}

function buildHouse() {
    house = new THREE.Group();

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.85 });
    const wallGeo = new THREE.BoxGeometry(8, 5, 6);

    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 2.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5a3a28, roughness: 0.7 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), doorMat);
    door.position.set(0, 1.1, 3.05);
    door.castShadow = true;
    house.add(door);

    // Door handle
    const handle = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xd4a838, metalness: 0.8, roughness: 0.2 })
    );
    handle.position.set(0.4, 1.1, 3.12);
    house.add(handle);

    // Windows
    const winMat = new THREE.MeshStandardMaterial({
        color: 0x88aacc, metalness: 0.3, roughness: 0.1,
        transparent: true, opacity: 0.7
    });
    const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });

    const winPositions = [
        [-2.2, 3, 3.02], [2.2, 3, 3.02],
        [-3.98, 3, 0], [3.98, 3, 0],
        [-2.2, 3, -3.02], [2.2, 3, -3.02]
    ];
    winPositions.forEach(pos => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.08), winFrameMat);
        frame.position.set(pos[0], pos[1], pos[2]);
        if (pos[0] < -3.5 || pos[0] > 3.5) frame.rotation.y = Math.PI / 2;
        house.add(frame);

        const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), winMat);
        glass.position.set(pos[0], pos[1], pos[2] + (pos[2] > 0 ? 0.05 : -0.05));
        if (pos[0] < -3.5 || pos[0] > 3.5) glass.rotation.y = Math.PI / 2;
        house.add(glass);
    });

    // Roof structure (base — visible from start but tiles fly in)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.9 });
    const roofBaseGeo = new THREE.ConeGeometry(6.5, 3.5, 4);
    const roofBase = new THREE.Mesh(roofBaseGeo, roofMat);
    roofBase.position.y = 6.75;
    roofBase.rotation.y = Math.PI / 4;
    roofBase.castShadow = true;
    roofBase.scale.y = 0;
    house.add(roofBase);

    // Roof tiles — individual pieces that fly in on scroll
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xc8704a, roughness: 0.7 });
    const tileGeo = new THREE.BoxGeometry(0.8, 0.25, 0.6);

    // Create rows of tiles on the pyramid roof
    const rows = 6;
    for (let row = 0; row < rows; row++) {
        const y = 5.2 + row * 0.5;
        const radius = 5.5 - row * 0.7;
        const tilesInRow = Math.max(4, 16 - row * 2);

        for (let i = 0; i < tilesInRow; i++) {
            const angle = (i / tilesInRow) * Math.PI * 2 + (row % 2) * 0.15;
            const tile = new THREE.Mesh(tileGeo, tileMat);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            tile.position.set(x, y + 15, z); // Start above
            tile.castShadow = true;
            tile.userData = { targetY: y, targetX: x, targetZ: z, row: row };
            tile.rotation.y = angle + Math.PI / 4;
            roofTiles.push(tile);
            house.add(tile);
        }
    }

    // Chimney
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x8a4a38, roughness: 0.8 });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), chimneyMat);
    chimney.position.set(2, 7.5, -1.5);
    chimney.castShadow = true;
    chimney.scale.y = 0;
    chimney.userData = { targetScaleY: 1, delay: 0.6 };
    house.add(chimney);

    // Chimney cap
    const chimneyCap = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.15, 1),
        new THREE.MeshStandardMaterial({ color: 0x4a3028 })
    );
    chimneyCap.position.set(2, 8.4, -1.5);
    chimneyCap.scale.y = 0;
    chimneyCap.userData = { targetScaleY: 1, delay: 0.7 };
    house.add(chimneyCap);

    // Store references for animation
    house.userData = { roofBase, chimney, chimneyCap };

    scene.add(house);
}

function createRain() {
    const rainCount = 400;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = Math.random() * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        velocities[i] = 0.15 + Math.random() * 0.15;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const rainMat = new THREE.PointsMaterial({
        color: 0x88aacc, size: 0.08, transparent: true, opacity: 0.4
    });

    rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.userData = { velocities };
    scene.add(rainParticles);
}

function createSunRays() {
    sunRays = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
        color: 0xffd9a0, transparent: true, opacity: 0.08, side: THREE.DoubleSide
    });

    for (let i = 0; i < 8; i++) {
        const ray = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 15),
            rayMat
        );
        ray.position.set(8, 10, -5);
        ray.rotation.z = -0.3 + i * 0.08;
        ray.rotation.y = i * 0.1;
        sunRays.add(ray);
    }
    sunRays.visible = false;
    scene.add(sunRays);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Scroll-based camera orbit
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(scrollY / maxScroll, 1);

    // Camera orbits around house
    const angle = scrollProgress * Math.PI * 1.2 - 0.3;
    camera.position.x = Math.sin(angle) * 22;
    camera.position.z = Math.cos(angle) * 22;
    camera.position.y = 8 + scrollProgress * 4;
    camera.lookAt(0, 4, 0);

    // Roof base grows
    const roofGrow = Math.min(scrollProgress * 3, 1);
    if (house.userData.roofBase) {
        house.userData.roofBase.scale.y = roofGrow;
    }

    // Roof tiles fly in based on scroll
    const tileProgress = Math.max(0, (scrollProgress - 0.1) * 1.5);
    roofTiles.forEach((tile, i) => {
        const tileDelay = tile.userData.row / 6;
        const tileStart = tileDelay;
        const tileEnd = tileDelay + 0.3;
        const tileT = Math.max(0, Math.min(1, (tileProgress - tileStart) / (tileEnd - tileStart)));

        // Easing
        const eased = tileT < 0.5 ? 2 * tileT * tileT : 1 - Math.pow(-2 * tileT + 2, 2) / 2;

        tile.position.y = tile.userData.targetY + (1 - eased) * 15;
        tile.position.x = tile.userData.targetX * eased;
        tile.position.z = tile.userData.targetZ * eased;
        tile.rotation.x = (1 - eased) * Math.PI;
    });

    // Chimney grows
    if (house.userData.chimney) {
        const chimneyProgress = Math.max(0, Math.min(1, (scrollProgress - 0.5) * 3));
        house.userData.chimney.scale.y = chimneyProgress;
        house.userData.chimneyCap.scale.y = Math.max(0, Math.min(1, (scrollProgress - 0.55) * 3));
    }

    // House gentle rotation
    house.rotation.y = Math.sin(time * 0.1) * 0.05;

    // Rain animation
    if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array;
        const velocities = rainParticles.userData.velocities;
        for (let i = 0; i < velocities.length; i++) {
            positions[i * 3 + 1] -= velocities[i];
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 25;
                positions[i * 3] = (Math.random() - 0.5) * 40;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
            }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
        rainParticles.material.opacity = 0.15 + scrollProgress * 0.25;
    }

    // Sun rays fade in at end
    if (sunRays) {
        sunRays.visible = scrollProgress > 0.6;
        sunRays.children.forEach((ray, i) => {
            ray.material.opacity = 0.06 + Math.sin(time + i) * 0.02;
            ray.rotation.z += 0.002;
        });
    }

    renderer.render(scene, camera);
}

// Initialize Three.js
if (typeof THREE !== 'undefined') {
    initThree();
}

// ============ GSAP SCROLL ANIMATIONS ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            scrollTrigger: { trigger: header, start: 'top 80%' },
            y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out'
        });
    });

    // Dienst cards stagger
    gsap.from('.dienst-card', {
        scrollTrigger: { trigger: '.diensten-grid', start: 'top 75%' },
        y: 50, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out'
    });

    // Project cards
    gsap.from('.project-card', {
        scrollTrigger: { trigger: '.projecten-grid', start: 'top 75%' },
        y: 60, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out'
    });

    // Over stats
    gsap.from('.over-stat-card', {
        scrollTrigger: { trigger: '.over-stats', start: 'top 80%' },
        scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)'
    });

    // Review cards
    gsap.from('.review-card', {
        scrollTrigger: { trigger: '.reviews-track', start: 'top 80%' },
        y: 40, opacity: 0, stagger: 0.15, duration: 0.7
    });

    // Contact form
    gsap.from('.contact-form', {
        scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' },
        x: 50, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
    gsap.from('.contact-info', {
        scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' },
        x: -50, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
}
