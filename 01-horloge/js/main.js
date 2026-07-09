'use strict';

// ============================================
// HORLOGE — Luxury Watch 3D Experience
// Three.js + GSAP ScrollTrigger + Lenis
// ============================================

let scene, camera, renderer, watchGroup;
let lenis;
const canvas = document.getElementById('webgl');

// --- Loader ---
const loaderEl = document.getElementById('loader');
const loaderPct = document.querySelector('.loader-percentage');
const loaderBar = document.querySelector('.loader-bar-fill');

function updateLoader(pct) {
    loaderPct.textContent = Math.floor(pct);
    loaderBar.style.width = pct + '%';
}

// --- Lenis Smooth Scroll ---
function initLenis() {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// --- Three.js Scene Setup ---
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 8, 25);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lighting
    const ambient = new THREE.AmbientLight(0x333333, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xc9a961, 1.5);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4a6fa5, 0.5);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xc9a961, 1, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Environment for reflections (procedural)
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x1a1a1a);
    const envGeo = new THREE.SphereGeometry(50, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({
        color: 0x1a1a1a,
        side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));
    // Add some light probes
    const envLight1 = new THREE.PointLight(0xc9a961, 2, 100);
    envLight1.position.set(10, 10, 10);
    envScene.add(envLight1);
    const envLight2 = new THREE.PointLight(0x4a6fa5, 1, 100);
    envLight2.position.set(-10, -5, -10);
    envScene.add(envLight2);

    const envRT = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
    });
    const envCamera = new THREE.CubeCamera(0.1, 100, envRT);
    envScene.add(envCamera);
    renderer.render(envScene, envCamera);
    scene.environment = envRT.texture;

    createWatch();
    setupScrollAnimation();
    animate();

    window.addEventListener('resize', onResize);
}

// --- Procedural Watch Model ---
function createWatch() {
    watchGroup = new THREE.Group();

    // Materials
    const goldMat = new THREE.MeshPhysicalMaterial({
        color: 0xc9a961,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
    });

    const darkGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0x8a7340,
        metalness: 1.0,
        roughness: 0.3,
        envMapIntensity: 1.0,
    });

    const dialMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.2,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 0.95,
        transparent: true,
        opacity: 0.3,
        ior: 1.5,
        envMapIntensity: 2.0,
    });

    const leatherMat = new THREE.MeshStandardMaterial({
        color: 0x2a1f15,
        roughness: 0.85,
        metalness: 0.05,
    });

    const handMat = new THREE.MeshStandardMaterial({
        color: 0xe8e4dc,
        metalness: 0.9,
        roughness: 0.2,
    });

    // Watch case (cylinder)
    const caseGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.35, 64);
    const watchCase = new THREE.Mesh(caseGeo, goldMat);
    watchCase.rotation.x = Math.PI / 2;
    watchCase.castShadow = true;
    watchCase.receiveShadow = true;
    watchGroup.add(watchCase);

    // Case bezel (slightly larger ring on top)
    const bezelGeo = new THREE.CylinderGeometry(1.02, 1.0, 0.08, 64);
    const bezel = new THREE.Mesh(bezelGeo, goldMat);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.z = 0.18;
    bezel.castShadow = true;
    watchGroup.add(bezel);

    // Dial face
    const dialGeo = new THREE.CircleGeometry(0.92, 64);
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.z = 0.19;
    watchGroup.add(dial);

    // Hour markers (small boxes around the dial)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const markerGeo = new THREE.BoxGeometry(0.04, 0.12, 0.02);
        const marker = new THREE.Mesh(markerGeo, goldMat);
        const r = 0.78;
        marker.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.2);
        marker.rotation.z = angle - Math.PI / 2;
        watchGroup.add(marker);
    }

    // Minute markers (tiny dots)
    for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const angle = (i / 60) * Math.PI * 2;
        const dotGeo = new THREE.CircleGeometry(0.012, 8);
        const dot = new THREE.Mesh(dotGeo, darkGoldMat);
        const r = 0.85;
        dot.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.195);
        watchGroup.add(dot);
    }

    // Watch hands
    const hourHandGeo = new THREE.BoxGeometry(0.05, 0.45, 0.015);
    const hourHand = new THREE.Mesh(hourHandGeo, handMat);
    hourHand.position.set(0, 0.18, 0.21);
    hourHand.rotation.z = -0.5;
    watchGroup.add(hourHand);

    const minuteHandGeo = new THREE.BoxGeometry(0.035, 0.65, 0.015);
    const minuteHand = new THREE.Mesh(minuteHandGeo, handMat);
    minuteHand.position.set(0, 0.28, 0.215);
    minuteHand.rotation.z = 1.2;
    watchGroup.add(minuteHand);

    const secondHandGeo = new THREE.BoxGeometry(0.015, 0.7, 0.01);
    const secondHand = new THREE.Mesh(secondHandGeo, new THREE.MeshStandardMaterial({
        color: 0xc9a961,
        metalness: 0.9,
        roughness: 0.2,
    }));
    secondHand.position.set(0, 0.3, 0.22);
    secondHand.rotation.z = 2.5;
    watchGroup.add(secondHand);

    // Center cap
    const centerCapGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16);
    const centerCap = new THREE.Mesh(centerCapGeo, goldMat);
    centerCap.rotation.x = Math.PI / 2;
    centerCap.position.z = 0.22;
    watchGroup.add(centerCap);

    // Crystal glass (dome)
    const crystalGeo = new THREE.SphereGeometry(0.95, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.25);
    const crystal = new THREE.Mesh(crystalGeo, glassMat);
    crystal.position.z = 0.19;
    crystal.scale.set(1, 1, 0.15);
    watchGroup.add(crystal);

    // Crown (side knob)
    const crownGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(1.1, 0, 0);
    crown.castShadow = true;
    watchGroup.add(crown);

    // Crown grip texture (small bumps)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const bumpGeo = new THREE.BoxGeometry(0.02, 0.02, 0.12);
        const bump = new THREE.Mesh(bumpGeo, goldMat);
        bump.position.set(1.1, Math.cos(angle) * 0.08, Math.sin(angle) * 0.08);
        watchGroup.add(bump);
    }

    // Lugs (top and bottom)
    const lugGeo = new THREE.BoxGeometry(0.5, 0.15, 0.3);
    const lugTop = new THREE.Mesh(lugGeo, goldMat);
    lugTop.position.set(0, 0.95, 0);
    lugTop.castShadow = true;
    watchGroup.add(lugTop);

    const lugBottom = new THREE.Mesh(lugGeo, goldMat);
    lugBottom.position.set(0, -0.95, 0);
    lugBottom.castShadow = true;
    watchGroup.add(lugBottom);

    // Leather strap (top)
    const strapTopGeo = new THREE.BoxGeometry(0.7, 1.2, 0.08);
    const strapTop = new THREE.Mesh(strapTopGeo, leatherMat);
    strapTop.position.set(0, 1.6, -0.05);
    strapTop.rotation.x = -0.08;
    strapTop.castShadow = true;
    watchGroup.add(strapTop);

    // Leather strap (bottom)
    const strapBottom = new THREE.Mesh(strapTopGeo, leatherMat);
    strapBottom.position.set(0, -1.6, -0.05);
    strapBottom.rotation.x = 0.08;
    strapBottom.castShadow = true;
    watchGroup.add(strapBottom);

    // Stitching detail on straps (small spheres)
    const stitchMat = new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.4 });
    for (let i = 0; i < 8; i++) {
        const y = 1.1 + i * 0.13;
        if (y > 2.7) break;
        [-0.28, 0.28].forEach(x => {
            const stitchGeo = new THREE.SphereGeometry(0.015, 8, 8);
            const stitch = new THREE.Mesh(stitchGeo, stitchMat);
            stitch.position.set(x, y, 0.0);
            watchGroup.add(stitch);
        });
    }
    for (let i = 0; i < 8; i++) {
        const y = -1.1 - i * 0.13;
        if (y < -2.7) break;
        [-0.28, 0.28].forEach(x => {
            const stitchGeo = new THREE.SphereGeometry(0.015, 8, 8);
            const stitch = new THREE.Mesh(stitchGeo, stitchMat);
            stitch.position.set(x, y, 0.0);
            watchGroup.add(stitch);
        });
    }

    // Sub-dial (chronograph)
    const subDialGeo = new THREE.CircleGeometry(0.18, 32);
    const subDialMat = new THREE.MeshPhysicalMaterial({
        color: 0x0d0d0d,
        metalness: 0.7,
        roughness: 0.3,
        clearcoat: 1.0,
    });
    const subDial = new THREE.Mesh(subDialGeo, subDialMat);
    subDial.position.set(0.4, -0.3, 0.195);
    watchGroup.add(subDial);

    // Sub-dial hand
    const subHandGeo = new THREE.BoxGeometry(0.02, 0.12, 0.01);
    const subHand = new THREE.Mesh(subHandGeo, handMat);
    subHand.position.set(0.4, -0.24, 0.2);
    subHand.rotation.z = 0.8;
    watchGroup.add(subHand);

    // Date window
    const dateWinGeo = new THREE.PlaneGeometry(0.12, 0.1);
    const dateWinMat = new THREE.MeshBasicMaterial({ color: 0xe8e4dc });
    const dateWin = new THREE.Mesh(dateWinGeo, dateWinMat);
    dateWin.position.set(-0.4, -0.3, 0.196);
    watchGroup.add(dateWin);

    // Date text (small canvas texture)
    const dateCanvas = document.createElement('canvas');
    dateCanvas.width = 64;
    dateCanvas.height = 64;
    const dctx = dateCanvas.getContext('2d');
    dctx.fillStyle = '#e8e4dc';
    dctx.fillRect(0, 0, 64, 64);
    dctx.fillStyle = '#1a1a1a';
    dctx.font = 'bold 40px Arial';
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    dctx.fillText('15', 32, 32);
    const dateTexture = new THREE.CanvasTexture(dateCanvas);
    const dateTextMat = new THREE.MeshBasicMaterial({ map: dateTexture });
    const dateTextGeo = new THREE.PlaneGeometry(0.1, 0.08);
    const dateText = new THREE.Mesh(dateTextGeo, dateTextMat);
    dateText.position.set(-0.4, -0.3, 0.197);
    watchGroup.add(dateText);

    // Initial rotation
    watchGroup.rotation.x = -0.3;
    watchGroup.rotation.y = 0.3;

    scene.add(watchGroup);

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
}

// --- Scroll Animation ---
function setupScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Chapter text reveals
    document.querySelectorAll('.chapter-text').forEach((el) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el.closest('.chapter'),
                start: 'top 70%',
                end: 'bottom 30%',
                toggleActions: 'play none none reverse',
            },
        });
    });

    // Camera animation through chapters
    // Chapter 0: Hero - wide shot
    // Chapter 1: Overview - slight zoom
    // Chapter 2: Dial - close on face
    // Chapter 3: Crown - rotate to side
    // Chapter 4: Case - profile view
    // Chapter 5: Strap - tilt down

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#content',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => {
                document.querySelector('.progress-fill').style.width = (self.progress * 100) + '%';
            },
        },
    });

    // Hero → Chapter 1: gentle zoom in
    tl.to(camera.position, { z: 5.5, ease: 'power1.inOut' }, 0)
      .to(watchGroup.rotation, { y: 0.5, x: -0.2, ease: 'power1.inOut' }, 0);

    // Chapter 1 → Chapter 2: zoom to dial
    tl.to(camera.position, { z: 3.5, ease: 'power1.inOut' })
      .to(watchGroup.rotation, { y: 0, x: 0, ease: 'power1.inOut' });

    // Chapter 2 → Chapter 3: rotate to crown
    tl.to(camera.position, { z: 3.0, x: 0.5, ease: 'power1.inOut' })
      .to(watchGroup.rotation, { y: -0.8, x: -0.1, ease: 'power1.inOut' });

    // Chapter 3 → Chapter 4: profile view
    tl.to(camera.position, { z: 4.0, x: 0, ease: 'power1.inOut' })
      .to(watchGroup.rotation, { y: -1.5, x: 0, ease: 'power1.inOut' });

    // Chapter 4 → Chapter 5: tilt to strap
    tl.to(camera.position, { z: 3.5, y: -0.5, ease: 'power1.inOut' })
      .to(watchGroup.rotation, { y: -1.5, x: 0.4, ease: 'power1.inOut' });

    // Specs section: pull back
    tl.to(camera.position, { z: 7, y: 0, x: 0, ease: 'power1.inOut' })
      .to(watchGroup.rotation, { y: 0.3, x: -0.3, ease: 'power1.inOut' });

    // Animate stat numbers
    document.querySelectorAll('.stat-number').forEach((el) => {
        const target = parseInt(el.dataset.target);
        ScrollTrigger.create({
            trigger: el,
            start: 'top 80%',
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function() {
                        el.textContent = Math.floor(this.targets()[0].val).toLocaleString();
                    },
                });
            },
            once: true,
        });
    });

    // Specs cards stagger
    gsap.from('.spec-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.specs-grid',
            start: 'top 75%',
        },
    });

    // Ambacht section
    gsap.from('.ambacht-content > *', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.ambacht-section',
            start: 'top 60%',
        },
    });

    // Contact section
    gsap.from('.contact-content > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 70%',
        },
    });
}

// --- Animation Loop ---
let mouseX = 0, mouseY = 0;
let targetRotX = 0, targetRotY = 0;

function animate() {
    requestAnimationFrame(animate);

    // Gentle floating motion
    if (watchGroup) {
        const time = Date.now() * 0.001;
        watchGroup.position.y = Math.sin(time * 0.5) * 0.05;

        // Subtle mouse parallax (only adds to scroll-driven rotation)
        targetRotX += (mouseY * 0.05 - targetRotX) * 0.05;
        targetRotY += (mouseX * 0.05 - targetRotY) * 0.05;
    }

    renderer.render(scene, camera);
}

// --- Resize ---
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Custom Cursor ---
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
        cx = e.clientX;
        cy = e.clientY;
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        cursor.style.left = cx + 'px';
        cursor.style.top = cy + 'px';
    });

    function followCursor() {
        fx += (cx - fx) * 0.15;
        fy += (cy - fy) * 0.15;
        follower.style.left = fx + 'px';
        follower.style.top = fy + 'px';
        requestAnimationFrame(followCursor);
    }
    followCursor();

    // Hover effects on interactive elements
    document.querySelectorAll('a, button, .spec-card, .cta-button').forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

// --- Init ---
function init() {
    initLenis();
    initCursor();

    // Simulate loading
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            updateLoader(100);
            setTimeout(() => {
                initThree();
                loaderEl.classList.add('hidden');
                // Hero text animation
                gsap.from('.hero-title .line', {
                    y: '100%',
                    duration: 1.2,
                    stagger: 0.15,
                    ease: 'power3.out',
                    delay: 0.3,
                });
                gsap.from('.hero-subtitle', {
                    opacity: 0,
                    duration: 1,
                    delay: 0.8,
                });
                gsap.from('.scroll-indicator', {
                    opacity: 0,
                    duration: 1,
                    delay: 1.2,
                });
            }, 400);
        }
        updateLoader(loadProgress);
    }, 100);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
