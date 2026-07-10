gsap.registerPlugin(ScrollTrigger);

const c = document.getElementById('partyCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const balloons = [];
for (let i = 0; i < 30; i++) {
    balloons.push({ x: Math.random()*w, y: h + Math.random()*200, r: 15+Math.random()*20, vy: 1+Math.random()*1.5, hue: Math.random()*360, wobble: Math.random()*Math.PI*2 });
}
const confetti = [];
for (let i = 0; i < 80; i++) {
    confetti.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*1, vy: Math.random()*1+0.5, rot: Math.random()*Math.PI, color: `hsl(${Math.random()*360},80%,70%)`, size: 4+Math.random()*4 });
}

function draw() {
    ctx.clearRect(0, 0, w, h);
    const time = Date.now() * 0.001;
    balloons.forEach(b => {
        b.y -= b.vy; b.wobble += 0.03;
        b.x += Math.sin(b.wobble) * 0.5;
        if (b.y < -60) { b.y = h + 60; b.x = Math.random()*w; }
        ctx.fillStyle = `hsla(${b.hue},80%,60%,0.8)`;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(b.x, b.y+b.r); ctx.lineTo(b.x, b.y+b.r+30); ctx.stroke();
    });
    confetti.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += 0.05;
        if (p.y > h) { p.y = -10; p.x = Math.random()*w; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
    });
    requestAnimationFrame(draw);
}
draw();

// Thema switcher
const themes = {
    princess: { bg: '#4c1d95', accent: '#f472b6' },
    dino: { bg: '#14532d', accent: '#84cc16' },
    circus: { bg: '#7f1d1d', accent: '#facc15' },
    superhero: { bg: '#1e3a8a', accent: '#ef4444' },
    unicorn: { bg: '#831843', accent: '#c084fc' },
    pirate: { bg: '#172554', accent: '#f97316' }
};

document.querySelectorAll('.grid article').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const t = card.dataset.theme;
        if (themes[t]) {
            document.documentElement.style.setProperty('--bg', themes[t].bg);
            document.documentElement.style.setProperty('--accent', themes[t].accent);
        }
    });
});

gsap.from('.grid article', { scrollTrigger: { trigger: '.themas', start: 'top 70%' }, scale: 0.8, opacity: 0, stagger: 0.08, duration: 0.6 });
gsap.from('.cards article', { scrollTrigger: { trigger: '.pakketten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
