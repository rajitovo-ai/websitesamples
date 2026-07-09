'use strict';

// ============================================
// WATERLAND — Plumber ZZP Website
// Canvas Water Ripples + GSAP Animations
// ============================================

gsap.registerPlugin(ScrollTrigger);

// --- Water Ripple Effect ---
const rippleCanvas = document.getElementById('ripple-canvas');
const rctx = rippleCanvas.getContext('2d');

let ripples = [];
let mouseInfluence = { x: 0, y: 0 };

function resizeRippleCanvas() {
    rippleCanvas.width = window.innerWidth;
    rippleCanvas.height = window.innerHeight;
}

class Ripple {
    constructor(x, y, radius = 100) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = radius;
        this.opacity = 0.15;
        this.speed = 1.5;
    }

    update() {
        this.radius += this.speed;
        this.opacity = Math.max(0, 0.15 * (1 - this.radius / this.maxRadius));
        this.speed *= 0.99;
    }

    draw(ctx) {
        if (this.opacity <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(77, 184, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ripple
        if (this.radius > 10) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(77, 184, 255, ${this.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    isDead() {
        return this.opacity <= 0;
    }
}

// Auto-generate ambient ripples
let ambientRippleTimer = 0;
function spawnAmbientRipple() {
    const x = Math.random() * rippleCanvas.width;
    const y = Math.random() * rippleCanvas.height;
    ripples.push(new Ripple(x, y, 150 + Math.random() * 100));
}

function renderRipples() {
    rctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);

    // Ambient ripples
    ambientRippleTimer++;
    if (ambientRippleTimer > 60) {
        spawnAmbientRipple();
        ambientRippleTimer = 0;
    }

    // Update and draw ripples
    ripples = ripples.filter(r => !r.isDead());
    ripples.forEach(r => {
        r.update();
        r.draw(rctx);
    });

    requestAnimationFrame(renderRipples);
}

// Mouse ripple
document.addEventListener('click', (e) => {
    ripples.push(new Ripple(e.clientX, e.clientY, 200));
});

let lastMouseRipple = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseRipple > 200) {
        ripples.push(new Ripple(e.clientX, e.clientY, 80));
        lastMouseRipple = now;
    }
});

// --- Before/After Slider ---
function initBeforeAfter() {
    const slider = document.getElementById('ba-slider');
    const handle = document.getElementById('ba-handle');
    const before = slider.querySelector('.ba-before');
    let isDragging = false;

    function setSliderPos(x) {
        const rect = slider.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        handle.style.left = pct + '%';
        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }

    slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        setSliderPos(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) setSliderPos(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch
    slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        setSliderPos(e.touches[0].clientX);
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) setSliderPos(e.touches[0].clientX);
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// --- Scroll Animations ---
function initScrollAnimations() {
    // Hero entrance
    gsap.from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.3,
    });

    gsap.from('.hero-title', {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
    });

    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.8,
    });

    gsap.from('.hero-actions > *', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15,
        delay: 1,
    });

    gsap.from('.hero-stats .stat', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        delay: 1.3,
    });

    // Service cards with water-fill effect
    gsap.from('.service-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%',
        },
    });

    // Process steps
    gsap.from('.process-step', {
        opacity: 0,
        x: -30,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 75%',
        },
    });

    // Before/After
    gsap.from('.ba-container', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        scrollTrigger: {
            trigger: '.showcase',
            start: 'top 70%',
        },
    });

    // Service area
    gsap.from('.area-content > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.service-area',
            start: 'top 70%',
        },
    });

    gsap.from('.area-map', {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        scrollTrigger: {
            trigger: '.service-area',
            start: 'top 70%',
        },
    });

    // Reviews
    gsap.from('.review-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.reviews-grid',
            start: 'top 75%',
        },
    });

    // Contact
    gsap.from('.contact-info > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
        },
    });

    gsap.from('.contact-form', {
        opacity: 0,
        x: 30,
        duration: 0.8,
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
        },
    });

    // Section headers
    document.querySelectorAll('.section-header').forEach((header) => {
        gsap.from(header.children, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
            },
        });
    });

    // City tags stagger
    gsap.from('.city-tag', {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        stagger: 0.05,
        scrollTrigger: {
            trigger: '.area-cities',
            start: 'top 85%',
        },
    });
}

// --- Init ---
function init() {
    resizeRippleCanvas();
    renderRipples();
    initBeforeAfter();
    initScrollAnimations();

    window.addEventListener('resize', resizeRippleCanvas);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
