gsap.registerPlugin(ScrollTrigger);

// Behangrol afrollen op scroll
gsap.to('#paper', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    width: '300px',
    ease: 'none'
});

gsap.to('#roll', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    x: -60,
    rotation: 180,
    ease: 'none'
});

// Canvas patroon
const c = document.getElementById('patternCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

function drawPattern() {
    ctx.clearRect(0, 0, w, h);
    const size = 80;
    const time = Date.now() / 2000;
    for (let x = 0; x < w + size; x += size) {
        for (let y = 0; y < h + size; y += size) {
            ctx.save();
            ctx.translate(x + Math.sin(time + y*0.01)*5, y + Math.cos(time + x*0.01)*5);
            ctx.strokeStyle = 'rgba(212,163,115,0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI*2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(204,213,174,0.15)';
            ctx.fillRect(-10, -10, 20, 20);
            ctx.restore();
        }
    }
    requestAnimationFrame(drawPattern);
}
drawPattern();

// Sections
const cards = document.querySelectorAll('.style-card');
cards.forEach((card, i) => {
    gsap.from(card, { scrollTrigger: { trigger: '.collectie', start: 'top 70%' }, y: 50, opacity: 0, duration: 0.6, delay: i * 0.08 });
});

gsap.from('.step', { scrollTrigger: { trigger: '.werkwijze', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });
