'use strict';

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// ARCHITECTUUR — Procedural Building Assembly
// ============================================

let scene, camera, renderer;
let buildingGroup;
let buildingParts = [];
let clipPlane;
let mouseX = 0, mouseY = 0;

const canvas = document.getElementById('webgl');

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f3f0);
    scene.fog = new THREE.Fog(0xf5f3f0, 15, 50);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 2, 0);

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
    renderer.toneMappingExposure = 1.0;
    renderer.localClippingEnabled = true;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xc4a882, 0.3);
    fill.position.set(-8, 5, -5);
    scene.add(fill);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0xe8e4dc,
        roughness: 0.9,
        metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper for architectural feel
    const grid = new THREE.GridHelper(40, 40, 0xcccccc, 0xdddddd);
    grid.position.y = 0.01;
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    scene.add(grid);

    // Clip plane for section cut
    clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 3);

    createBuilding();
    setupScrollAnimation();
    animate();

    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMouseMove);
}

function createBuilding() {
    buildingGroup = new THREE.Group();

    // Materials
    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0xd5d0c8,
        roughness: 0.8,
        metalness: 0.05,
    });

    const woodMat = new THREE.MeshStandardMaterial({
        color: 0xc4a882,
        roughness: 0.6,
        metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xa8c8d8,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.5,
        ior: 1.5,
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.7,
        metalness: 0.2,
    });

    // Foundation slab
    const foundation = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.3, 5),
        concreteMat
    );
    foundation.position.y = 0.15;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    buildingGroup.add(foundation);
    buildingParts.push({ mesh: foundation, startY: -2, targetY: 0.15, delay: 0 });

    // Ground floor walls
    const wallHeight = 3;
    const wallThickness = 0.2;

    // Front wall (with opening)
    const frontWallL = new THREE.Mesh(
        new THREE.BoxGeometry(2, wallHeight, wallThickness),
        concreteMat
    );
    frontWallL.position.set(-2, 0.3 + wallHeight/2, 2.5);
    frontWallL.castShadow = true;
    buildingGroup.add(frontWallL);
    buildingParts.push({ mesh: frontWallL, startY: -3, targetY: 0.3 + wallHeight/2, delay: 0.1 });

    const frontWallR = new THREE.Mesh(
        new THREE.BoxGeometry(2, wallHeight, wallThickness),
        concreteMat
    );
    frontWallR.position.set(2, 0.3 + wallHeight/2, 2.5);
    frontWallR.castShadow = true;
    buildingGroup.add(frontWallR);
    buildingParts.push({ mesh: frontWallR, startY: -3, targetY: 0.3 + wallHeight/2, delay: 0.15 });

    const frontWallTop = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, wallThickness),
        concreteMat
    );
    frontWallTop.position.set(0, 0.3 + wallHeight - 0.25, 2.5);
    frontWallTop.castShadow = true;
    buildingGroup.add(frontWallTop);
    buildingParts.push({ mesh: frontWallTop, startY: -3, targetY: 0.3 + wallHeight - 0.25, delay: 0.2 });

    // Back wall
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(6, wallHeight, wallThickness),
        concreteMat
    );
    backWall.position.set(0, 0.3 + wallHeight/2, -2.5);
    backWall.castShadow = true;
    buildingGroup.add(backWall);
    buildingParts.push({ mesh: backWall, startY: -3, targetY: 0.3 + wallHeight/2, delay: 0.2 });

    // Side walls
    const sideWallL = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 5),
        concreteMat
    );
    sideWallL.position.set(-3, 0.3 + wallHeight/2, 0);
    sideWallL.castShadow = true;
    buildingGroup.add(sideWallL);
    buildingParts.push({ mesh: sideWallL, startY: -3, targetY: 0.3 + wallHeight/2, delay: 0.25 });

    const sideWallR = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 5),
        concreteMat
    );
    sideWallR.position.set(3, 0.3 + wallHeight/2, 0);
    sideWallR.castShadow = true;
    buildingGroup.add(sideWallR);
    buildingParts.push({ mesh: sideWallR, startY: -3, targetY: 0.3 + wallHeight/2, delay: 0.3 });

    // Floor slab (first floor)
    const floor1 = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.2, 5),
        concreteMat
    );
    floor1.position.set(0, 3.4, 0);
    floor1.castShadow = true;
    buildingGroup.add(floor1);
    buildingParts.push({ mesh: floor1, startY: -4, targetY: 3.4, delay: 0.4 });

    // Second floor walls (lighter, more glass)
    const wallHeight2 = 2.8;

    // Second floor back and side walls
    const backWall2 = new THREE.Mesh(
        new THREE.BoxGeometry(6, wallHeight2, wallThickness),
        concreteMat
    );
    backWall2.position.set(0, 3.5 + wallHeight2/2, -2.5);
    backWall2.castShadow = true;
    buildingGroup.add(backWall2);
    buildingParts.push({ mesh: backWall2, startY: -5, targetY: 3.5 + wallHeight2/2, delay: 0.5 });

    const sideWall2L = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight2, 5),
        concreteMat
    );
    sideWall2L.position.set(-3, 3.5 + wallHeight2/2, 0);
    sideWall2L.castShadow = true;
    buildingGroup.add(sideWall2L);
    buildingParts.push({ mesh: sideWall2L, startY: -5, targetY: 3.5 + wallHeight2/2, delay: 0.55 });

    const sideWall2R = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight2, 5),
        concreteMat
    );
    sideWall2R.position.set(3, 3.5 + wallHeight2/2, 0);
    sideWall2R.castShadow = true;
    buildingGroup.add(sideWall2R);
    buildingParts.push({ mesh: sideWall2R, startY: -5, targetY: 3.5 + wallHeight2/2, delay: 0.6 });

    // Glass panels on second floor front
    const glassFront = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, wallHeight2 - 0.4, 0.05),
        glassMat
    );
    glassFront.position.set(0, 3.5 + wallHeight2/2, 2.5);
    buildingGroup.add(glassFront);
    buildingParts.push({ mesh: glassFront, startY: -5, targetY: 3.5 + wallHeight2/2, delay: 0.65 });

    // Roof slab
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 0.25, 5.5),
        concreteMat
    );
    roof.position.set(0, 3.5 + wallHeight2 + 0.1, 0);
    roof.castShadow = true;
    buildingGroup.add(roof);
    buildingParts.push({ mesh: roof, startY: -6, targetY: 3.5 + wallHeight2 + 0.1, delay: 0.75 });

    // Roof overhang
    const roofOverhang = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.1, 6),
        darkMat
    );
    roofOverhang.position.set(0, 3.5 + wallHeight2 + 0.25, 0);
    roofOverhang.castShadow = true;
    buildingGroup.add(roofOverhang);
    buildingParts.push({ mesh: roofOverhang, startY: -6, targetY: 3.5 + wallHeight2 + 0.25, delay: 0.8 });

    // Windows on ground floor (glass)
    for (let i = 0; i < 2; i++) {
        const window = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.5, 0.05),
            glassMat
        );
        window.position.set(-1.5 + i * 3, 1.5, 2.52);
        buildingGroup.add(window);
        buildingParts.push({ mesh: window, startY: -4, targetY: 1.5, delay: 0.35 + i * 0.05 });
    }

    // Interior staircase (simple boxes)
    for (let i = 0; i < 8; i++) {
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.15, 0.4),
            woodMat
        );
        step.position.set(-2, 0.3 + i * 0.38, 1.5 - i * 0.35);
        step.castShadow = true;
        buildingGroup.add(step);
        buildingParts.push({ mesh: step, startY: -3 - i * 0.5, targetY: 0.3 + i * 0.38, delay: 0.4 + i * 0.03 });
    }

    // Columns (structural)
    for (let i = 0; i < 4; i++) {
        const x = (i % 2 === 0 ? -2.5 : 2.5);
        const z = (i < 2 ? 2 : -2);
        const column = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 6, 0.3),
            concreteMat
        );
        column.position.set(x, 3.2, z);
        column.castShadow = true;
        buildingGroup.add(column);
        buildingParts.push({ mesh: column, startY: -7, targetY: 3.2, delay: 0.05 + i * 0.03 });
    }

    // Set initial positions (below ground)
    buildingParts.forEach(part => {
        part.mesh.position.y = part.startY;
        // Store original material for wireframe transition
        part.originalMaterial = part.mesh.material;
    });

    scene.add(buildingGroup);
}

function setupScrollAnimation() {
    // Main building assembly timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#content',
            start: 'top top',
            end: '40% bottom',
            scrub: 1.5,
        },
    });

    // Animate each part into position
    buildingParts.forEach((part) => {
        tl.to(part.mesh.position, {
            y: part.targetY,
            duration: 0.5,
            ease: 'power2.out',
        }, part.delay);
    });

    // Camera orbit during build
    tl.to(camera.position, {
        x: 10,
        y: 8,
        z: 10,
        ease: 'power1.inOut',
        duration: 1,
    }, 0);

    // Material section: transition to wireframe then back
    const materialTL = gsap.timeline({
        scrollTrigger: {
            trigger: '.material-section',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1.5,
        },
    });

    // Camera moves closer
    materialTL.to(camera.position, {
        x: 6,
        y: 4,
        z: 8,
        ease: 'power1.inOut',
    });

    // Interior section: clip plane reveals interior
    const interiorTL = gsap.timeline({
        scrollTrigger: {
            trigger: '.interior-section',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1.5,
        },
    });

    // Move clip plane to reveal interior
    interiorTL.to(clipPlane, {
        constant: -3,
        ease: 'power1.inOut',
        onStart: () => {
            buildingParts.forEach(part => {
                if (part.originalMaterial) {
                    part.originalMaterial.clippingPlanes = [clipPlane];
                    part.originalMaterial.clipShadows = true;
                }
            });
        },
        onComplete: () => {
            buildingParts.forEach(part => {
                if (part.originalMaterial) {
                    part.originalMaterial.clippingPlanes = [];
                }
            });
        },
        onReverseComplete: () => {
            buildingParts.forEach(part => {
                if (part.originalMaterial) {
                    part.originalMaterial.clippingPlanes = [];
                }
            });
        },
    });

    // Camera rotates around building
    interiorTL.to(camera.position, {
        x: -8,
        y: 5,
        z: 6,
        ease: 'power1.inOut',
    }, 0);

    // Projects section: pull camera back
    gsap.to(camera.position, {
        x: 12,
        y: 10,
        z: 14,
        ease: 'power1.inOut',
        scrollTrigger: {
            trigger: '.projects-section',
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1.5,
        },
    });

    // Text reveals
    document.querySelectorAll('.build-info, .material-info, .interior-info').forEach((el) => {
        gsap.from(el.children, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
                trigger: el,
                start: 'top 75%',
            },
        });
    });

    // Project cards
    gsap.from('.project-card', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 75%',
        },
    });

    // Process steps
    gsap.from('.process-step', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.process-steps',
            start: 'top 75%',
        },
    });

    // Contact
    gsap.from('.contact-content > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 75%',
        },
    });

    // Hero text
    gsap.from('.hero-title .line', {
        y: '100%',
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
    });

    gsap.from('.hero-desc', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.8,
    });
}

function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);

    // Subtle camera parallax based on mouse
    const targetX = camera.position.x + mouseX * 0.3;
    const targetY = camera.position.y + mouseY * 0.2;
    camera.lookAt(0, 2.5, 0);

    // Gentle building rotation
    if (buildingGroup) {
        buildingGroup.rotation.y = Math.sin(Date.now() * 0.0001) * 0.05;
    }

    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start
init();

// Hide loader
setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
}, 1200);
