gsap.registerPlugin(ScrollTrigger);

const c = document.getElementById('zenCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const waves = [];
for (let i = 0; i < 5; i++) {
    waves.push({ y: h * (0.2 + i * 0.15), amp: 20 + i * 10, freq: 0.005 + i * 0.002, speed: 0.01 + i * 0.005, color: `rgba(167,243,208,${0.05 + i*0.04})` });
}
const drops = [];
for (let i = 0; i < 40; i++) {
    drops.push({ x: Math.random()*w, y: Math.random()*h, r: 2+Math.random()*5, vy: 0.2+Math.random()*0.5, alpha: 0.2+Math.random()*0.5 });
}
let t = 0;
function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.01;
    waves.forEach(wv => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 5) {
            const y = wv.y + Math.sin(x * wv.freq + t * wv.speed * 100) * wv.amp;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wv.color; ctx.lineWidth = 2; ctx.stroke();
    });
    drops.forEach(d => {
        d.y += d.vy; d.x += Math.sin(t + d.y*0.01)*0.3;
        if (d.y > h) { d.y = -10; d.x = Math.random()*w; }
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#d4a373';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}
draw();

gsap.from('.grid article', { scrollTrigger: { trigger: '.behandelingen', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
gsap.from('.ruimte p', { scrollTrigger: { trigger: '.ruimte', start: 'top 70%' }, y: 30, opacity: 0, duration: 1 });
