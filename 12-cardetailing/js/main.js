gsap.registerPlugin(ScrollTrigger);

const c = document.getElementById('carCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

let droplets = [];
for (let i = 0; i < 100; i++) {
    droplets.push({ x: Math.random()*w, y: Math.random()*h, r: 1+Math.random()*3, vy: 1+Math.random()*2, alpha: 0.2+Math.random()*0.5 });
}
let shine = 0;
function draw() {
    ctx.clearRect(0, 0, w, h);
    shine += 0.005;
    // Auto silhouet
    ctx.save();
    ctx.translate(w*0.7, h*0.55);
    ctx.scale(1.2, 1.2);
    ctx.fillStyle = `rgba(15,23,42,${0.6 + Math.sin(shine)*0.2})`;
    ctx.beginPath();
    ctx.moveTo(-180, 40); ctx.lineTo(-160, -30); ctx.lineTo(-80, -50); ctx.lineTo(60, -50);
    ctx.lineTo(140, -30); ctx.lineTo(180, 20); ctx.lineTo(180, 50); ctx.lineTo(130, 50);
    ctx.arc(90, 50, 40, 0, Math.PI, true); ctx.lineTo(-50, 50); ctx.arc(-90, 50, 40, 0, Math.PI, true);
    ctx.lineTo(-180, 50); ctx.closePath(); ctx.fill();
    // glans lijn
    ctx.strokeStyle = `rgba(56,189,248,${0.3 + Math.sin(shine)*0.3})`;
    ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();

    // waterdruppels
    droplets.forEach(d => {
        d.y += d.vy;
        if (d.y > h) { d.y = -10; d.x = Math.random()*w; }
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}
draw();

// Particles van polish op scroll
let polish = [];
ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
        const p = self.progress;
        if (p > 0.3 && droplets.length > 50) droplets.splice(0, 1);
    }
});

gsap.from('.grid article', { scrollTrigger: { trigger: '.pakketten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
gsap.from('.tl-item', { scrollTrigger: { trigger: '.proces', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });
