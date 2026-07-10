gsap.registerPlugin(ScrollTrigger);

// SVG web opbouwen
const webGroup = document.getElementById('webGroup');
const cx = 50, cy = 50;
for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x2 = cx + Math.cos(a) * 70;
    const y2 = cy + Math.sin(a) * 70;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', 'rgba(200,230,255,0.25)');
    line.setAttribute('stroke-width', '0.3');
    line.classList.add('web-line');
    webGroup.appendChild(line);
    for (let r = 15; r <= 60; r += 15) {
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', '0.6');
        ring.setAttribute('fill', 'rgba(200,230,255,0.4)');
        webGroup.appendChild(ring);
    }
}

// Stof particles
const canvas = document.getElementById('dust');
const ctx = canvas.getContext('2d');
let w, h;
function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const dust = [];
for (let i = 0; i < 120; i++) {
    dust.push({ x: Math.random()*w, y: Math.random()*h, r: 0.5+Math.random()*2, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, alpha: 0.2+Math.random()*0.5 });
}
let clean = 0;
function draw() {
    ctx.clearRect(0, 0, w, h);
    dust.forEach(p => {
        p.x += p.vx * (1-clean); p.y += p.vy * (1-clean);
        if (p.x<0) p.x=w; if (p.x>w) p.x=0; if (p.y<0) p.y=h; if (p.y>h) p.y=0;
        ctx.globalAlpha = p.alpha * (1-clean);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    // microvezel doekjes
    ctx.globalAlpha = clean;
    ctx.fillStyle = '#2dd4bf';
    for (let i=0; i<5; i++) {
        const t = (Date.now()/1000 + i/5) % 1;
        ctx.beginPath(); ctx.arc(t*w, (1-t)*h + i*50, 20, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
}
draw();

ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => { clean = Math.min(1, self.progress * 1.5); }
});

gsap.from('.web-line', { opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power2.out' });
gsap.to('.web', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    opacity: 0, scale: 1.2
});

gsap.from('.grid article', { scrollTrigger: { trigger: '.diensten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.1, duration: 0.8 });
gsap.from('.step', { scrollTrigger: { trigger: '.werkwijze', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });
