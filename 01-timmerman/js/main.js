gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 5);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const spot = new THREE.SpotLight(0xffe0b2, 1.5);
spot.position.set(4, 6, 6);
spot.castShadow = true;
scene.add(spot);
const rim = new THREE.PointLight(0xc5a47e, 0.8);
rim.position.set(-4, 2, -4);
scene.add(rim);

const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.7,
    metalness: 0.05
});
const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.75 });
const sawMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.8, roughness: 0.3 });

const group = new THREE.Group();
scene.add(group);

// Houtblok
const block = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.8), woodMat);
block.position.set(-2, 0, 0);
group.add(block);

// Kozijn (frame)
const frameGroup = new THREE.Group();
frameGroup.position.set(2, 0, 0);
frameGroup.scale.set(0, 0, 0);
const frameThick = 0.22;
const frameW = 2.4, frameH = 1.6;
const parts = [
    new THREE.Mesh(new THREE.BoxGeometry(frameW, frameThick, 0.5), darkWoodMat),
    new THREE.Mesh(new THREE.BoxGeometry(frameW, frameThick, 0.5), darkWoodMat),
    new THREE.Mesh(new THREE.BoxGeometry(frameThick, frameH, 0.5), darkWoodMat),
    new THREE.Mesh(new THREE.BoxGeometry(frameThick, frameH, 0.5), darkWoodMat),
    new THREE.Mesh(new THREE.BoxGeometry(frameThick * 0.6, frameH, 0.45), darkWoodMat)
];
parts[0].position.y = frameH / 2;
parts[1].position.y = -frameH / 2;
parts[2].position.x = -frameW / 2;
parts[3].position.x = frameW / 2;
parts[4].position.x = 0;
parts.forEach(p => frameGroup.add(p));
group.add(frameGroup);

// Zaagblad
const saw = new THREE.Group();
const sawDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 32, 1, false, 0, Math.PI), sawMat);
sawDisc.rotation.z = Math.PI / 2;
sawDisc.rotation.x = Math.PI / 2;
const teeth = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 8, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x607d8b }));
teeth.rotation.x = Math.PI / 2;
saw.add(sawDisc, teeth);
saw.position.set(-0.2, 0.9, 0);
group.add(saw);

// Spaanders
const chips = [];
for (let i = 0; i < 40; i++) {
    const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.04 + Math.random() * 0.05), new THREE.MeshStandardMaterial({ color: 0xd7ccc8 }));
    s.position.set(-0.2 + (Math.random() - 0.5) * 0.4, -0.4, (Math.random() - 0.5) * 0.6);
    s.visible = false;
    s.userData = { vel: new THREE.Vector3((Math.random()-0.5)*0.02, Math.random()*0.05, (Math.random()-0.5)*0.03) };
    group.add(s);
    chips.push(s);
}

// Scroll animatie
const tl = gsap.timeline({
    scrollTrigger: { trigger: '.content', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
tl.to(group.position, { x: 0, duration: 1 }, 0)
  .to(block.position, { x: -0.2, duration: 0.5 }, 0)
  .to(saw.position, { y: 0.1, duration: 0.4 }, 0.1)
  .to(saw.rotation, { z: 4, duration: 0.8 }, 0.1)
  .to(block.scale, { y: 0.95, duration: 0.3 }, 0.35)
  .to(frameGroup.scale, { x: 1, y: 1, z: 1, duration: 0.5 }, 0.55)
  .to(group.rotation, { y: Math.PI * 0.15, duration: 1 }, 0)
  .to(camera.position, { z: 3.5, y: 0.2, duration: 1 }, 0);

ScrollTrigger.create({
    trigger: '.content',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
        const p = self.progress;
        chips.forEach((c, i) => {
            const t = (p * 60 + i) % 1;
            c.visible = p > 0.15 && p < 0.55 && t < 0.8;
            c.position.y = -0.4 + c.userData.vel.y * t * 30;
            c.position.x += c.userData.vel.x;
            c.position.z += c.userData.vel.z;
            c.rotation.x += 0.1; c.rotation.y += 0.08;
        });
    }
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loader
window.addEventListener('load', () => {
    const bar = document.querySelector('.loader-fill');
    bar.style.width = '100%';
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => document.getElementById('loader').remove(), 600);
    }, 400);
});
