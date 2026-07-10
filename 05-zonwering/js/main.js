gsap.registerPlugin(ScrollTrigger);

const slats = document.getElementById('slats');
for (let i = 0; i < 12; i++) {
    const s = document.createElement('div'); s.className = 'slat'; slats.appendChild(s);
}

const shadows = document.getElementById('shadows');
const sun = document.getElementById('sun');

// Jaloezieën openen op scroll
gsap.to('.slats', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    rotationX: 70,
    transformOrigin: 'top center'
});

gsap.to('#sun', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    x: -80, y: 40, scale: 1.3
});

gsap.to('#shadows', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    opacity: 0.3, scaleY: 0.6
});

// Licht viz
const viz = document.getElementById('lichtViz');
const beam = document.createElement('div'); beam.className = 'licht-beam'; viz.appendChild(beam);
const angleInput = document.getElementById('angle');
function updateBeam() {
    const v = angleInput.value;
    beam.style.transform = `rotate(${v * 0.7}deg)`;
    beam.style.opacity = 0.2 + (v / 200);
}
updateBeam();
angleInput.addEventListener('input', updateBeam);

// Sections
const articles = document.querySelectorAll('.grid article');
articles.forEach((a, i) => {
    gsap.from(a, { scrollTrigger: { trigger: '.producten', start: 'top 70%' }, y: 60, opacity: 0, duration: 0.7, delay: i * 0.1 });
});

gsap.from('.licht-viz', { scrollTrigger: { trigger: '.licht', start: 'top 70%' }, x: -60, opacity: 0, duration: 0.9 });

// Mouse parallax
window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to('.room', { rotationY: x * 10, rotationX: -y * 6, duration: 0.5 });
});
