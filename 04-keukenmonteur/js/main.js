gsap.registerPlugin(ScrollTrigger);

const k = document.getElementById('kitchen');
const parts = k.querySelectorAll('.cabinet, .fridge, .stove, .counter');

// Exploded view op scroll
gsap.to(parts, {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    z: (i) => (i % 2 === 0 ? 80 : -80),
    y: (i) => (i < 2 ? 60 : -40),
    rotationY: (i) => (i % 2 === 0 ? 15 : -15),
    stagger: 0.02,
    ease: 'none'
});

gsap.to(k, {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    rotationY: 20,
    scale: 0.9
});

// Deuren openen bij scroll
const doors = document.querySelectorAll('.door');
doors.forEach(d => {
    gsap.to(d, {
        scrollTrigger: { trigger: '.hero', start: '30% top', end: '70% top', scrub: 1 },
        rotationY: -110,
        transformOrigin: 'left center'
    });
});

// Sections
const steps = document.querySelectorAll('.step');
steps.forEach((s, i) => {
    gsap.from(s, {
        scrollTrigger: { trigger: '.werk', start: 'top 70%' },
        y: 50, opacity: 0, duration: 0.7, delay: i * 0.1
    });
});

gsap.from('.mod', {
    scrollTrigger: { trigger: '.modules', start: 'top 70%' },
    scale: 0.9, opacity: 0, stagger: 0.08, duration: 0.5
});

// Mouse parallax
let mx = 0, my = 0;
window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(k, { rotationY: mx * 8, rotationX: -my * 5, duration: 0.5 });
});
