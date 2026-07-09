'use strict';

// ============================================
// STUCMEESTER — Plasterer ZZP Website
// Canvas Texture Generator + 3D Room + GSAP
// ============================================

gsap.registerPlugin(ScrollTrigger);

// --- Canvas Texture Generator ---
const textureCanvas = document.getElementById('texture-canvas');
const tctx = textureCanvas.getContext('2d');

function resizeTextureCanvas() {
    textureCanvas.width = window.innerWidth;
    textureCanvas.height = window.innerHeight;
}

// Procedural plaster texture noise
function renderTexture() {
    const w = textureCanvas.width;
    const h = textureCanvas.height;
    tctx.clearRect(0, 0, w, h);

    // Generate noise dots
    const dotCount = Math.floor((w * h) / 8000);
    for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.15;
        tctx.fillStyle = `rgba(200, 160, 112, ${opacity})`;
        tctx.beginPath();
        tctx.arc(x, y, size, 0, Math.PI * 2);
        tctx.fill();
    }

    // Add some larger soft blobs
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const size = Math.random() * 100 + 50;
        const gradient = tctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(200, 160, 112, 0.04)');
        gradient.addColorStop(1, 'rgba(200, 160, 112, 0)');
        tctx.fillStyle = gradient;
        tctx.beginPath();
        tctx.arc(x, y, size, 0, Math.PI * 2);
        tctx.fill();
    }
}

// --- 3D Room Mouse Interaction ---
function init3DRoom() {
    const room = document.querySelector('.room-3d');
    if (!room) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        room.style.transform = `translate(-50%, -50%) rotateX(${15 - y}deg) rotateY(${-5 + x}deg)`;
    });
}

// --- Wall Morph Animation ---
function initWallMorph() {
    const smooth = document.getElementById('morph-smooth');
    const morphDisplay = document.getElementById('morph-display');

    if (!smooth || !morphDisplay) return;

    // Animate clip-path based on scroll
    gsap.to(smooth, {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
            trigger: '.morph-section',
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1.5,
        },
    });
}

// --- Finish Selector ---
function initFinishSelector() {
    const swatches = document.querySelectorAll('.swatch');
    const preview = document.getElementById('finish-preview');
    const nameEl = document.getElementById('finish-name');
    const descEl = document.getElementById('finish-desc');

    const finishStyles = {
        'Gladde Stuc': { bg: 'linear-gradient(135deg, #e8e0d4, #d4cfc5)', color: '#1a1612' },
        'Spachtelputz': { bg: 'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.08) 1px, transparent 2px), radial-gradient(circle at 60% 70%, rgba(0,0,0,0.06) 1px, transparent 2px), linear-gradient(135deg, #d8d0c4, #c4bfb5)', color: '#1a1612' },
        'Betonlook': { bg: 'linear-gradient(135deg, #b0b0b0, #888888)', color: '#1a1612' },
        'Kalkstuc': { bg: 'linear-gradient(135deg, #f0e8dc, #e0d8cc)', color: '#1a1612' },
        'Tadelakt': { bg: 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.15), transparent 40%), linear-gradient(135deg, #d4c8b8, #c0b4a4)', color: '#1a1612' },
        'Decoratief': { bg: 'repeating-linear-gradient(45deg, rgba(200,160,112,0.1) 0px, rgba(200,160,112,0.1) 10px, transparent 10px, transparent 20px), linear-gradient(135deg, #c8b8a8, #b8a898)', color: '#1a1612' },
    };

    swatches.forEach((swatch) => {
        swatch.addEventListener('mouseenter', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            const name = swatch.dataset.name;
            const desc = swatch.dataset.desc;
            const style = finishStyles[name];

            if (style) {
                gsap.to(preview, {
                    background: style.bg,
                    duration: 0.6,
                    ease: 'power2.out',
                });
                nameEl.textContent = name;
                descEl.textContent = desc;
            }
        });
    });
}

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

    document.addEventListener('mouseup', () => { isDragging = false; });

    slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        setSliderPos(e.touches[0].clientX);
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) setSliderPos(e.touches[0].clientX);
    });

    document.addEventListener('touchend', () => { isDragging = false; });
}

// --- Scroll Animations ---
function initScrollAnimations() {
    // Hero entrance
    gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
    gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1, delay: 0.5, ease: 'power3.out' });
    gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
    gsap.from('.hero-actions > *', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15, delay: 1 });
    gsap.from('.room-3d', { opacity: 0, scale: 0.8, duration: 1.5, delay: 0.2, ease: 'power2.out' });

    // Section headers
    document.querySelectorAll('.section-header').forEach((header) => {
        gsap.from(header.children, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: { trigger: header, start: 'top 80%' },
        });
    });

    // Morph content
    gsap.from('.morph-content > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '.morph-section', start: 'top 70%' },
    });

    // Service cards with wall-peel reveal
    gsap.from('.service-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '.services-grid', start: 'top 75%' },
    });

    // Finish selector
    gsap.from('.finish-preview', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        scrollTrigger: { trigger: '.finish-display', start: 'top 70%' },
    });

    gsap.from('.swatch', {
        opacity: 0,
        x: 30,
        duration: 0.5,
        stagger: 0.08,
        scrollTrigger: { trigger: '.finish-swatches', start: 'top 80%' },
    });

    // Before/After
    gsap.from('.ba-container', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        scrollTrigger: { trigger: '.showcase', start: 'top 70%' },
    });

    // Process cards
    gsap.from('.process-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: { trigger: '.process-grid', start: 'top 75%' },
    });

    // Reviews
    gsap.from('.review-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        scrollTrigger: { trigger: '.reviews-grid', start: 'top 75%' },
    });

    // Contact
    gsap.from('.contact-info > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: { trigger: '.contact', start: 'top 70%' },
    });

    gsap.from('.contact-form', {
        opacity: 0,
        x: 30,
        duration: 0.8,
        scrollTrigger: { trigger: '.contact', start: 'top 70%' },
    });
}

// --- Init ---
function init() {
    resizeTextureCanvas();
    renderTexture();
    init3DRoom();
    initWallMorph();
    initFinishSelector();
    initBeforeAfter();
    initScrollAnimations();

    window.addEventListener('resize', () => {
        resizeTextureCanvas();
        renderTexture();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
