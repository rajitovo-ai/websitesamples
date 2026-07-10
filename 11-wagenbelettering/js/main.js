gsap.registerPlugin(ScrollTrigger);

const wrapLayer = document.getElementById('wrapLayer');
const bus = document.getElementById('bus');

// Wrap transformeert op scroll
const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
tl.to(wrapLayer, {
    opacity: 1,
    background: 'linear-gradient(135deg, rgba(244,63,94,0.85), rgba(139,92,246,0.85))'
}, 0)
.to(bus, { rotationY: 20, scale: 0.95 }, 0)
.to(bus, { rotationY: -20, scale: 1.05 }, 0.5);

// Canvas deeltjes van folie
const c = document.getElementById('wrapCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const flakes = [];
for (let i = 0; i < 60; i++) {
    flakes.push({ x: Math.random()*w, y: Math.random()*h, r: 2+Math.random()*6, vx: (Math.random()-0.5)*0.5, vy: Math.random()*0.5+0.2, col: Math.random()>0.5?'#f43f5e':'#8b5cf6' });
}
function draw() {
    ctx.clearRect(0, 0, w, h);
    flakes.forEach(f => {
        f.x += f.vx; f.y += f.vy;
        if (f.y > h) { f.y = -10; f.x = Math.random()*w; }
        ctx.fillStyle = f.col; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(draw);
}
draw();

// Sections
gsap.from('.grid article', { scrollTrigger: { trigger: '.diensten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.1, duration: 0.8 });
gsap.from('.step', { scrollTrigger: { trigger: '.proces', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });

// Mouse parallax
window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    gsap.to('.bus-scene', { rotationY: x * 10, duration: 0.5 });
});
