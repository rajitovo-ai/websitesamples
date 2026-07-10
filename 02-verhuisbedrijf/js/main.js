gsap.registerPlugin(ScrollTrigger);

// Huis uiteenklappen op scroll
gsap.to('#house', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    rotationY: 180,
    scale: 0.7,
    y: 80,
    ease: 'none'
});

const house = document.getElementById('house');
const boxes = document.getElementById('boxes');
const icons = ['📦', '🛋️', '🖼️', '🪴', '📺', '🛏️', '🪑', '📚'];
for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'box';
    b.textContent = icons[i % icons.length];
    b.style.left = (20 + Math.random() * 60) + '%';
    b.style.top = (20 + Math.random() * 60) + '%';
    b.style.opacity = '0';
    b.style.transform = `translateZ(${Math.random() * 100}px) rotate(${Math.random()*30}deg)`;
    boxes.appendChild(b);
}

gsap.to('.box', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 1 },
    opacity: 1,
    rotation: () => Math.random() * 20 - 10,
    x: () => (Math.random() - 0.5) * 120,
    y: () => (Math.random() - 0.5) * 80,
    stagger: 0.02
});

// Canvas particles: tape, bubbels, stof
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w, h;
function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const items = [];
const types = ['tape', 'bubble', 'speck'];
for (let i = 0; i < 80; i++) {
    items.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 2 + Math.random() * 5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        type: types[i % 3],
        alpha: 0.3 + Math.random() * 0.5,
        rot: Math.random() * Math.PI
    });
}

function draw() {
    ctx.clearRect(0, 0, w, h);
    items.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += 0.01;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        if (p.type === 'tape') {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-p.r * 2, -p.r / 2, p.r * 4, p.r);
        } else if (p.type === 'bubble') {
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.fillStyle = '#f472b6';
            ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    });
    requestAnimationFrame(draw);
}
draw();

// Animaties voor secties
gsap.from('.split-text', { scrollTrigger: { trigger: '.split', start: 'top 70%' }, x: -60, opacity: 0, duration: 0.9 });
gsap.from('.card-box', { scrollTrigger: { trigger: '.split', start: 'top 60%' }, y: 50, opacity: 0, stagger: 0.15, duration: 0.7 });
gsap.from('.price-card', { scrollTrigger: { trigger: '.tarieven', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.12, duration: 0.8 });
