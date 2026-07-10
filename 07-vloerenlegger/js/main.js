gsap.registerPlugin(ScrollTrigger);

// Planken leggen op scroll
gsap.from('.plank-row', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    z: -200,
    opacity: 0,
    rotationY: 90,
    stagger: 0.08,
    ease: 'none'
});

gsap.to('.floor', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    rotationX: 35,
    scale: 1.1
});

// Houtnerf shimmer effect
const floor = document.querySelector('.floor');
let shine = 0;
function animateGrain() {
    shine = (shine + 0.005) % 1;
    const grad = `repeating-linear-gradient(${45 + shine * 10}deg, #3f2e22 0px, #3f2e22 20px, #5d4037 20px, #5d4037 22px)`;
    floor.style.background = grad;
    requestAnimationFrame(animateGrain);
}
animateGrain();

// Sections
gsap.from('.grid article', { scrollTrigger: { trigger: '.soorten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.1, duration: 0.8 });
gsap.from('.tl-item', { scrollTrigger: { trigger: '.proces', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });

// Mouse parallax
window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to('.floor-scene', { rotationY: x * 8, rotationX: -y * 5, duration: 0.6 });
});
