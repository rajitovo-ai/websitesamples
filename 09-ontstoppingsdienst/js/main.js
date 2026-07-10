gsap.registerPlugin(ScrollTrigger);

const c = document.getElementById('pipeCanvas');
const ctx = c.getContext('2d');
let w, h;
function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);

const pipes = [];
for (let i = 0; i < 5; i++) {
    pipes.push({
        y: 120 + i * 110,
        radius: 35 + i * 5,
        offset: i * 100,
        speed: 0.002 + i * 0.0005
    });
}

let progress = 0;
function draw() {
    ctx.clearRect(0, 0, w, h);
    const time = Date.now() * 0.001;
    pipes.forEach(p => {
        ctx.beginPath();
        for (let x = -p.radius; x <= w + p.radius; x += 5) {
            const y = p.y + Math.sin((x + time * 200) * 0.01 + p.offset) * 15;
            if (x === -p.radius) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = p.radius;
        ctx.strokeStyle = '#0e7490';
        ctx.lineCap = 'round';
        ctx.stroke();
        // binnenrand
        ctx.lineWidth = p.radius - 10;
        ctx.strokeStyle = '#164e63';
        ctx.stroke();
        // waterstroom
        ctx.beginPath();
        const flowX = (time * 300 + p.offset) % (w + 200) - 100;
        for (let x = flowX - 100; x < flowX + 100; x += 10) {
            const y = p.y + Math.sin((x + time * 200) * 0.01 + p.offset) * 15;
            if (x === flowX - 100) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(6,182,212,${0.4 + progress * 0.5})`;
        ctx.stroke();
        // veer (ontstopper)
        if (progress > 0.3) {
            const springX = flowX - 60;
            const springY = p.y;
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
            ctx.beginPath();
            for (let s = 0; s < 40; s++) {
                const sx = springX + s * 3;
                const sy = springY + Math.sin(s * 0.8 + time * 10) * 8;
                if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
        }
    });
    requestAnimationFrame(draw);
}
draw();

ScrollTrigger.create({
    trigger: '.content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => { progress = self.progress; }
});

gsap.from('.grid article', { scrollTrigger: { trigger: '.diensten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.1, duration: 0.8 });
gsap.from('.usp div', { scrollTrigger: { trigger: '.spoed', start: 'top 70%' }, x: -40, opacity: 0, stagger: 0.12, duration: 0.7 });
