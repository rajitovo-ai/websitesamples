// PulseFit — 3D Fitness Workout Animation
// Three.js stick figure performing exercises with selectable movements

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
document.getElementById('proefles-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Aangevraagd! ✓';
    btn.style.background = '#4a8a5a';
    setTimeout(() => { e.target.reset(); btn.textContent = 'Aanvragen'; btn.style.background = ''; }, 2500);
});

// ============ HERO 3D PULSE SCENE ============
let heroScene, heroCamera, heroRenderer, pulseRings = [];
let heroMouseX = 0, heroMouseY = 0;

function initHero() {
    const canvas = document.getElementById('fitness-canvas');
    heroScene = new THREE.Scene();
    heroScene.fog = new THREE.Fog(0x0a0a0e, 15, 50);

    heroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    heroCamera.position.set(0, 3, 12);

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dynamic red lighting
    heroScene.add(new THREE.AmbientLight(0x2a2a3a, 0.3));
    const key = new THREE.DirectionalLight(0xff3838, 1.0);
    key.position.set(5, 8, 5);
    heroScene.add(key);
    const fill = new THREE.DirectionalLight(0x3838ff, 0.3);
    fill.position.set(-5, 3, -3);
    heroScene.add(fill);
    const accent = new THREE.PointLight(0xff3838, 1.5, 15);
    accent.position.set(0, 3, -3);
    heroScene.add(accent);

    // Pulse rings expanding
    createPulseRings();

    // Energy particles
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

function createPulseRings() {
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3838, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.5, 0.55, 32),
            ringMat.clone()
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -2;
        ring.userData = { phase: i / 5, speed: 0.5 };
        pulseRings.push(ring);
        heroScene.add(ring);
    }
}

function createEnergyParticles() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = -3 + Math.random() * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xff3838, size: 0.1, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending
    }));
    particles.userData = { isEnergy: true };
    heroScene.add(particles);
    heroScene.userData = { energyParticles: particles };
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

    // Pulse rings expand
    pulseRings.forEach(ring => {
        const phase = (heroTime * ring.userData.speed + ring.userData.phase) % 1;
        const scale = 0.5 + phase * 8;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity = (1 - phase) * 0.5;
    });

    // Energy particles rise
    if (heroScene.userData.energyParticles) {
        const ep = heroScene.userData.energyParticles;
        const pos = ep.geometry.attributes.position.array;
        const vel = ep.geometry.userData.velocities;
        for (let i = 0; i < vel.length; i += 3) {
            pos[i] += vel[i];
            pos[i + 1] += vel[i + 1];
            pos[i + 2] += vel[i + 2];
            if (pos[i + 1] > 6) {
                pos[i] = (Math.random() - 0.5) * 12;
                pos[i + 1] = -3;
                pos[i + 2] = (Math.random() - 0.5) * 10;
            }
        }
        ep.geometry.attributes.position.needsUpdate = true;
    }

    heroRenderer.render(heroScene, heroCamera);
}

// ============ 3D WORKOUT FIGURE ============
let workoutScene, workoutCamera, workoutRenderer, figure;
let workoutDragging = false, workoutLastX = 0, workoutRotY = 0;
let currentExercise = 'squat';

function initWorkout() {
    const canvas = document.getElementById('workout-canvas');
    const wrap = canvas.parentElement;

    workoutScene = new THREE.Scene();
    workoutScene.fog = new THREE.Fog(0x0a0a0e, 10, 30);

    workoutCamera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    workoutCamera.position.set(0, 3, 10);

    workoutRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    workoutRenderer.setSize(wrap.clientWidth || 600, 400);
    workoutRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    workoutScene.add(new THREE.AmbientLight(0x2a2a3a, 0.4));
    const key = new THREE.DirectionalLight(0xff3838, 1.0);
    key.position.set(5, 8, 5);
    workoutScene.add(key);
    const fill = new THREE.DirectionalLight(0x3838ff, 0.3);
    fill.position.set(-5, 3, -3);
    workoutScene.add(fill);

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(15, 15),
        new THREE.MeshStandardMaterial({ color: 0x12121a, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.5;
    workoutScene.add(floor);

    // Grid pattern on floor
    const grid = new THREE.GridHelper(15, 15, 0xff3838, 0x222230);
    grid.position.y = -2.49;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    workoutScene.add(grid);

    // Build stick figure
    figure = buildFigure();
    workoutScene.add(figure);

    // Controls
    canvas.addEventListener('mousedown', (e) => { workoutDragging = true; workoutLastX = e.clientX; });
    window.addEventListener('mouseup', () => workoutDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (workoutDragging) { workoutRotY += (e.clientX - workoutLastX) * 0.01; workoutLastX = e.clientX; }
    });
    canvas.addEventListener('touchstart', (e) => { workoutDragging = true; workoutLastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => workoutDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (workoutDragging) { workoutRotY += (e.touches[0].clientX - workoutLastX) * 0.01; workoutLastX = e.touches[0].clientX; }
    });

    const ro = new ResizeObserver(() => {
        workoutCamera.aspect = wrap.clientWidth / (wrap.clientHeight || 400);
        workoutCamera.updateProjectionMatrix();
        workoutRenderer.setSize(wrap.clientWidth || 600, wrap.clientHeight || 400);
    });
    ro.observe(wrap);

    animateWorkout();
}

function buildFigure() {
    const fig = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.5, emissive: 0x441010, emissiveIntensity: 0.3 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), mat);
    head.position.y = 2.5;
    fig.add(head);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8), mat);
    neck.position.y = 2.1;
    fig.add(neck);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.4), mat);
    torso.position.y = 1.2;
    fig.add(torso);
    fig.userData = { torso };

    // Hips
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.4), mat);
    hips.position.y = 0.35;
    fig.add(hips);
    fig.userData.hips = hips;

    // Arms — left
    const leftArm = createLimb(mat, jointMat);
    leftArm.position.set(-0.5, 1.8, 0);
    fig.add(leftArm);
    fig.userData.leftArm = leftArm;

    // Arms — right
    const rightArm = createLimb(mat, jointMat);
    rightArm.position.set(0.5, 1.8, 0);
    fig.add(rightArm);
    fig.userData.rightArm = rightArm;

    // Legs — left
    const leftLeg = createLimb(mat, jointMat, true);
    leftLeg.position.set(-0.25, 0.2, 0);
    fig.add(leftLeg);
    fig.userData.leftLeg = leftLeg;

    // Legs — right
    const rightLeg = createLimb(mat, jointMat, true);
    rightLeg.position.set(0.25, 0.2, 0);
    fig.add(rightLeg);
    fig.userData.rightLeg = rightLeg;

    return fig;
}

function createLimb(mat, jointMat, isLeg = false) {
    const limb = new THREE.Group();

    // Upper segment
    const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, isLeg ? 1.2 : 1.0, 8),
        mat
    );
    upper.position.y = isLeg ? -0.6 : -0.5;
    limb.add(upper);

    // Joint
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), jointMat);
    joint.position.y = isLeg ? -1.2 : -1.0;
    limb.add(joint);

    // Lower segment group (for bending)
    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = isLeg ? -1.2 : -1.0;

    const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.08, isLeg ? 1.2 : 1.0, 8),
        mat
    );
    lower.position.y = isLeg ? -0.6 : -0.5;
    lowerGroup.add(lower);

    limb.add(lowerGroup);
    limb.userData = { lowerGroup };

    return limb;
}

// Exercise data
const exercises = {
    squat: {
        name: 'Squat',
        desc: 'Sta rechtop, voeten op schouderbreedte. Zak door je knieën alsof je gaat zitten. Houd je rug recht.',
        reps: '15', sets: '3', rest: '60s'
    },
    pushup: {
        name: 'Push-up',
        desc: 'Begin in plankpositie. Buig je armen en laat je lichaam zakken. Druk jezelf omhoog tot je armen gestrekt zijn.',
        reps: '12', sets: '3', rest: '45s'
    },
    jump: {
        name: 'Jumping Jack',
        desc: 'Spring met je voeten uit elkaar en je armen boven je hoofd. Spring terug naar startpositie. Herhaal snel.',
        reps: '30', sets: '3', rest: '30s'
    },
    lunge: {
        name: 'Lunge',
        desc: 'Stap naar voren en zak door je knieën tot beide benen 90° zijn. Druk terug naar start. Wissel benen.',
        reps: '10', sets: '3', rest: '45s'
    }
};

// Exercise buttons
document.querySelectorAll('.ex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.ex-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentExercise = btn.dataset.ex;
        const ex = exercises[currentExercise];
        document.getElementById('ex-name').textContent = ex.name;
        document.getElementById('ex-desc').textContent = ex.desc;
        const stats = document.querySelectorAll('.ex-stats strong');
        stats[0].textContent = ex.reps;
        stats[1].textContent = ex.sets;
        stats[2].textContent = ex.rest;
    });
});

let workoutTime = 0;
function animateWorkout() {
    requestAnimationFrame(animateWorkout);
    workoutTime += 0.016;

    if (!workoutDragging) workoutRotY += 0.005;
    if (figure) figure.rotation.y = workoutRotY;

    // Exercise animations
    const t = workoutTime;
    const cycle = (Math.sin(t * 2) + 1) / 2; // 0 to 1

    if (currentExercise === 'squat') {
        // Squat: legs bend, torso lowers
        const bend = cycle * 0.8;
        figure.userData.leftLeg.rotation.x = bend;
        figure.userData.rightLeg.rotation.x = bend;
        figure.userData.leftLeg.userData.lowerGroup.rotation.x = -bend * 1.2;
        figure.userData.rightLeg.userData.lowerGroup.rotation.x = -bend * 1.2;
        figure.userData.torso.position.y = 1.2 - bend * 0.5;
        figure.userData.hips.position.y = 0.35 - bend * 0.5;
        // Arms forward
        figure.userData.leftArm.rotation.x = -bend * 0.5 - 1.2;
        figure.userData.rightArm.rotation.x = -bend * 0.5 - 1.2;
    } else if (currentExercise === 'pushup') {
        // Push-up: whole body lowers, arms bend
        const lower = cycle * 0.5;
        figure.position.y = -lower * 0.8;
        figure.rotation.x = -Math.PI / 2 + 0.1;
        figure.userData.leftArm.rotation.x = -lower * 1.5;
        figure.userData.rightArm.rotation.x = -lower * 1.5;
        figure.userData.leftArm.userData.lowerGroup.rotation.x = lower * 1.5;
        figure.userData.rightArm.userData.lowerGroup.rotation.x = lower * 1.5;
        // Legs straight
        figure.userData.leftLeg.rotation.x = 0;
        figure.userData.rightLeg.rotation.x = 0;
        figure.userData.leftLeg.userData.lowerGroup.rotation.x = 0;
        figure.userData.rightLeg.userData.lowerGroup.rotation.x = 0;
    } else if (currentExercise === 'jump') {
        // Jumping jack: arms up, legs out
        const spread = cycle;
        figure.position.y = Math.sin(t * 4) * 0.3;
        figure.rotation.x = 0;
        figure.userData.leftArm.rotation.z = spread * 2.5;
        figure.userData.rightArm.rotation.z = -spread * 2.5;
        figure.userData.leftLeg.rotation.z = spread * 0.4;
        figure.userData.rightLeg.rotation.z = -spread * 0.4;
        figure.userData.leftLeg.rotation.x = 0;
        figure.userData.rightLeg.rotation.x = 0;
        figure.userData.leftLeg.userData.lowerGroup.rotation.x = 0;
        figure.userData.rightLeg.userData.lowerGroup.rotation.x = 0;
        figure.userData.torso.position.y = 1.2;
        figure.userData.hips.position.y = 0.35;
    } else if (currentExercise === 'lunge') {
        // Lunge: one leg forward, bend
        const bend = cycle * 0.6;
        figure.rotation.x = 0;
        figure.position.y = -bend * 0.3;
        figure.userData.leftLeg.rotation.x = bend * 0.8;
        figure.userData.rightLeg.rotation.x = -bend * 0.5;
        figure.userData.leftLeg.userData.lowerGroup.rotation.x = -bend * 1.5;
        figure.userData.rightLeg.userData.lowerGroup.rotation.x = bend * 0.8;
        figure.userData.leftArm.rotation.x = -bend * 0.3;
        figure.userData.rightArm.rotation.x = -bend * 0.3;
        figure.userData.torso.position.y = 1.2 - bend * 0.3;
        figure.userData.hips.position.y = 0.35 - bend * 0.3;
    }

    // Reset arms z rotation for non-jump exercises
    if (currentExercise !== 'jump') {
        figure.userData.leftArm.rotation.z = 0;
        figure.userData.rightArm.rotation.z = 0;
        figure.userData.leftLeg.rotation.z = 0;
        figure.userData.rightLeg.rotation.z = 0;
    }
    if (currentExercise !== 'pushup') {
        figure.rotation.x = 0;
        figure.position.y = figure.position.y; // keep
    }

    workoutRenderer.render(workoutScene, workoutCamera);
}

// ============ INIT ============
if (typeof THREE !== 'undefined') {
    initHero();
    const workoutSection = document.getElementById('workout');
    const wObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !workoutScene) { initWorkout(); wObs.disconnect(); }
    }, { threshold: 0.1 });
    wObs.observe(workoutSection);
}

// ============ GSAP ============
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, { scrollTrigger: { trigger: header, start: 'top 80%' }, y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power2.out' });
    });
    gsap.from('.les-card', { scrollTrigger: { trigger: '.lessen-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.08, duration: 0.7 });
    gsap.from('.tarief-card', { scrollTrigger: { trigger: '.tarieven-grid', start: 'top 75%' }, y: 50, opacity: 0, stagger: 0.1, duration: 0.7 });
    gsap.from('.over-stat', { scrollTrigger: { trigger: '.over-stats', start: 'top 80%' }, scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)' });
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: 50, opacity: 0, duration: 0.8 });
    gsap.from('.contact-info', { scrollTrigger: { trigger: '.contact-wrap', start: 'top 75%' }, x: -50, opacity: 0, duration: 0.8 });
}
