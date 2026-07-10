gsap.registerPlugin(ScrollTrigger);

const c = document.getElementById('pawCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const paws = [];
for (let i = 0; i < 12; i++) {
    paws.push({ x: Math.random()*w, y: Math.random()*h, s: 0.5+Math.random()*0.8, alpha: 0.1+Math.random()*0.3, rot: Math.random()*Math.PI*2 });
}
let progress = 0;
function drawPaw(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(0, 15, 12, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-10, -2, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -8, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -2, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}
function draw() {
    ctx.clearRect(0, 0, w, h);
    // route
    ctx.strokeStyle = 'rgba(245,158,11,0.15)'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
        const y = h * 0.5 + Math.sin(x * 0.005 + progress * 5) * 120;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    paws.forEach((p, i) => {
        const t = (progress * 10 + i * 0.5) % 1;
        const rx = p.x + Math.sin(progress * 2 + i) * 50 * t;
        const ry = p.y + Math.cos(progress * 2 + i) * 30 * t;
        drawPaw(rx, ry, p.s, p.alpha);
    });
    requestAnimationFrame(draw);
}
draw();

ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => { progress = self.progress; }
});

gsap.from('.cards article', { scrollTrigger: { trigger: '.over', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
gsap.from('.grid article', { scrollTrigger: { trigger: '.tarieven', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
