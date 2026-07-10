gsap.registerPlugin(ScrollTrigger);

// Vinyl versnellen op scroll
const vinyl = document.getElementById('vinyl');
let baseSpeed = 4;
gsap.to(vinyl, {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    onUpdate: function() {
        const speed = baseSpeed - this.progress * 2.5;
        vinyl.style.animationDuration = `${Math.max(0.5, speed)}s`;
    }
});

gsap.to('#tonearm', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% top', scrub: 1 },
    rotation: 0
});

// Canvas visualizer
const c = document.getElementById('viz');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const bars = 60;
let t = 0;
function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.05;
    const cx = w * 0.75, cy = h * 0.5;
    for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2;
        const r = 120 + Math.sin(t + i * 0.3) * 40 + Math.cos(t * 1.5 + i) * 20;
        const x1 = cx + Math.cos(a) * 100;
        const y1 = cy + Math.sin(a) * 100;
        const x2 = cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        ctx.strokeStyle = `hsla(${320 + i * 2}, 80%, 70%, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    // golven
    ctx.beginPath();
    for (let x = 0; x < w; x += 5) {
        const y = h * 0.85 + Math.sin(x * 0.01 + t) * 30 + Math.sin(x * 0.02 - t) * 20;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(244,114,182,0.2)'; ctx.lineWidth = 2; ctx.stroke();
    requestAnimationFrame(draw);
}
draw();

// Sections
gsap.from('.cards article', { scrollTrigger: { trigger: '.concept', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
gsap.from('.set', { scrollTrigger: { trigger: '.sets', start: 'top 70%' }, x: -50, opacity: 0, stagger: 0.1, duration: 0.7 });
