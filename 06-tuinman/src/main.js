'use strict';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// DE GROENE TUINMAN — Gardener ZZP
// Canvas Particles + SVG Plant Growth + Seasons
// ============================================

// --- Season Selector ---
const seasonBtns = document.querySelectorAll('.season-btn');
const seasonClasses = ['season-lente', 'season-zomer', 'season-herfst', 'season-winter'];

seasonBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const season = btn.dataset.season;
        seasonBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Remove all season classes
        seasonClasses.forEach(c => document.body.classList.remove(c));
        document.body.classList.add('season-' + season);

        // Update particle colors
        updateParticleColors(season);
    });
});

// --- Canvas Particles (leaves/petals) ---
const particleCanvas = document.getElementById('particle-canvas');
const pctx = particleCanvas.getContext('2d');

let particles = [];
let particleColors = {
    lente: ['#4a8a3a', '#6aaa5a', '#e85a7a', '#f0c050', '#a85ae8'],
    zomer: ['#e8a020', '#f0c050', '#4a8a3a', '#6aaa5a', '#e85a7a'],
    herfst: ['#c87030', '#e89040', '#a05020', '#d0a040', '#804020'],
    winter: ['#c0d0e0', '#a0b0c0', '#d0e0f0', '#b0c0d0', '#e0f0ff'],
};

let currentColors = particleColors.lente;

function updateParticleColors(season) {
    currentColors = particleColors[season] || particleColors.lente;
}

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

class LeafParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * particleCanvas.height;
    }

    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = -30;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        this.swayAmount = Math.random() * 2 + 1;
        this.swayPhase = Math.random() * Math.PI * 2;
    }

    update(time) {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(time * 0.001 + this.swayPhase) * this.swayAmount * 0.3;
        this.rotation += this.rotationSpeed;

        if (this.y > particleCanvas.height + 30) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        // Draw leaf shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 20 : 40;
    for (let i = 0; i < count; i++) {
        particles.push(new LeafParticle());
    }
}

function renderParticles() {
    pctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    const time = Date.now();
    particles.forEach(p => {
        p.update(time);
        p.draw(pctx);
    });
    requestAnimationFrame(renderParticles);
}

// --- Parallax Hero Layers ---
function initParallax() {
    const layers = document.querySelectorAll('.parallax-layer');
    let scrollY = 0;

    function updateParallax() {
        scrollY = window.scrollY;
        layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            const yPos = scrollY * speed;
            layer.style.transform = `translateY(${yPos}px)`;
        });
        requestAnimationFrame(updateParallax);
    }
    updateParallax();
}

// --- SVG Plant Growth Animation ---
function initPlantGrowth() {
    const plantGroups = document.querySelectorAll('.plant-group');

    plantGroups.forEach((group, index) => {
        const delay = parseFloat(group.dataset.delay) || 0;
        const stems = group.querySelectorAll('.plant-stem');
        const leaves = group.querySelectorAll('.plant-leaf');

        // Set initial state
        gsap.set(group, { opacity: 1 });
        gsap.set(stems, { strokeDashoffset: 200 });
        gsap.set(leaves, { scale: 0, transformOrigin: 'center' });

        // Create timeline triggered by scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.plants-container',
                start: 'top 70%',
                end: 'bottom 50%',
                scrub: 1,
            },
        });

        // Animate stems growing
        stems.forEach((stem, i) => {
            tl.to(stem, {
                strokeDashoffset: 0,
                duration: 1,
                ease: 'power1.out',
            }, delay + i * 0.1);
        });

        // Animate leaves appearing
        leaves.forEach((leaf, i) => {
            tl.to(leaf, {
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            }, delay + 0.5 + i * 0.1);
        });
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

    gsap.from('.hero-scroll', {
        opacity: 0,
        duration: 1,
        delay: 1.5,
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

    // Service cards
    gsap.from('.service-card', {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%',
        },
    });

    // Season cards
    gsap.from('.season-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.seasons-grid',
            start: 'top 75%',
        },
    });

    // Portfolio items
    gsap.from('.portfolio-item', {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.portfolio-grid',
            start: 'top 75%',
        },
    });

    // Testimonials
    gsap.from('.testimonial', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: {
            trigger: '.testimonials-grid',
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
}

// --- Init ---
function init() {
    resizeParticleCanvas();
    initParticles();
    renderParticles();
    initParallax();
    initPlantGrowth();
    initScrollAnimations();

    window.addEventListener('resize', () => {
        resizeParticleCanvas();
        initParticles();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
