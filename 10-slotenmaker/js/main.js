gsap.registerPlugin(ScrollTrigger);

const key = document.getElementById('key');
const shackle = document.querySelector('.shackle');

const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
tl.to(key, { opacity: 1, x: 30, y: -20, rotation: 0, duration: 0.3 }, 0)
  .to(key, { x: 50, rotation: 90, duration: 0.3 }, 0.25)
  .to(shackle, { y: -30, duration: 0.3 }, 0.45)
  .to('.lock', { rotationY: 360, duration: 0.4 }, 0.5)
  .to(key, { opacity: 0, duration: 0.1 }, 0.8);

// Counter
const counter = document.querySelector('.counter span');
const target = 1248;
ScrollTrigger.create({
    trigger: '.spoed',
    start: 'top 70%',
    once: true,
    onEnter: () => {
        gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() { counter.textContent = Math.round(this.targets()[0].val); }
        });
    }
});

gsap.from('.grid article', { scrollTrigger: { trigger: '.diensten', start: 'top 70%' }, y: 60, opacity: 0, stagger: 0.1, duration: 0.8 });
gsap.from('.counter', { scrollTrigger: { trigger: '.spoed', start: 'top 70%' }, scale: 0.9, opacity: 0, duration: 0.9 });

// Mouse parallax
window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to('.lock-scene', { rotationY: x * 10, rotationX: -y * 6, duration: 0.5 });
});
