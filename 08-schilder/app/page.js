'use client';

import { useEffect, useRef, useState } from 'react';

const colorPalettes = [
  { name: 'Rood', color: '#e84040', desc: 'Passie & Energie', room: 'Woonkamer' },
  { name: 'Blauw', color: '#40b8e8', desc: 'Rust & Vertrouwen', room: 'Slaapkamer' },
  { name: 'Geel', color: '#e8c840', desc: 'Warmte & Optimisme', room: 'Keuken' },
  { name: 'Paars', color: '#8a40e8', desc: 'Creativiteit & Luxe', room: 'Kantoor' },
  { name: 'Groen', color: '#40e8a0', desc: 'Natuur & Groei', room: 'Badkamer' },
];

const services = [
  { emoji: '🎨', title: 'Binnenschilderwerk', desc: 'Muren, plafonds, kozijnen en deuren. Strak en netjes afgewerkt.', price: 'vanaf €25/m²' },
  { emoji: '🏠', title: 'Buitschilderwerk', desc: 'Gevels, kozijnen, dakgoten en deuren. Weerbestendig en duurzaam.', price: 'vanaf €35/m²' },
  { emoji: '🖌', title: 'Behangen', desc: 'Van vliesbehang tot fotobehang. Perfecte afwerking zonder luchtbellen.', price: 'vanaf €20/m²' },
  { emoji: '🪟', title: 'Kozijnen', desc: 'Schilderen van houten, aluminium en PVC kozijnen. Inclusief voorbereiding.', price: 'vanaf €45/kozijn' },
  { emoji: '🌈', title: 'Kleuradvies', desc: 'Persoonlijk advies bij u thuis. Wij helpen u de juiste kleur te kiezen.', price: 'vanaf €75' },
  { emoji: '✨', title: 'Speciale Effecten', desc: 'Glamour, betonlook, metallic en meer. Voor een unieke uitstraling.', price: 'op aanvraag' },
];

const projects = [
  { tag: 'Binnen', name: 'Woonkamer Renovatie', loc: 'Amsterdam · 45m²', grad: 'linear-gradient(135deg, #e84040, #8a2020)' },
  { tag: 'Buiten', name: 'Gevelmakeover', loc: 'Haarlem · 120m²', grad: 'linear-gradient(135deg, #40b8e8, #2060a0)' },
  { tag: 'Behang', name: 'Slaapkamer Behang', loc: 'Amstelveen · 30m²', grad: 'linear-gradient(135deg, #8a40e8, #4a2080)' },
  { tag: 'Effect', name: 'Betonlook Kantoor', loc: 'Amsterdam · 80m²', grad: 'linear-gradient(135deg, #6a6a6a, #3a3a3a)' },
];

const reviews = [
  { stars: 5, text: 'Mijn woonkamer is prachtig geschilderd. Strakke lijnen, netjes afgeplakt en op tijd klaar!', name: 'Sophie Bakker', loc: 'Amsterdam', color: '#e84040' },
  { stars: 5, text: 'Gevels geschilderd in één dag. Professioneel en het resultaat is fantastisch.', name: 'Marco de Vries', loc: 'Haarlem', color: '#40b8e8' },
  { stars: 5, text: 'Kleuradvies was goud waard. Ze hebben me geholpen de perfecte tint te kiezen.', name: 'Lisa van Dijk', loc: 'Amstelveen', color: '#8a40e8' },
];

export default function Page() {
  const [accentColor, setAccentColor] = useState('#e84040');
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const canvasRef = useRef(null);
  const paintTrailsRef = useRef([]);

  // Set dynamic accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--dynamic-accent', accentColor);
  }, [accentColor]);

  // Paint splash canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Paint trail particles
    class PaintDrop {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.size = Math.random() * 15 + 5;
        this.color = color;
        this.life = 1;
        this.decay = 0.015;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.vx *= 0.98;
        this.life -= this.decay;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life * 0.6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paintTrailsRef.current = paintTrailsRef.current.filter(d => d.life > 0);
      paintTrailsRef.current.forEach(d => {
        d.update();
        d.draw(ctx);
      });
      requestAnimationFrame(animate);
    }
    animate();

    let lastSpawn = 0;
    function handleMove(e) {
      const now = Date.now();
      if (now - lastSpawn > 50) {
        const color = accentColor;
        paintTrailsRef.current.push(new PaintDrop(e.clientX, e.clientY, color));
        if (paintTrailsRef.current.length > 100) {
          paintTrailsRef.current.shift();
        }
        lastSpawn = now;
      }
    }

    let scrollTimer = 0;
    function handleScroll() {
      const now = Date.now();
      if (now - scrollTimer > 100) {
        // Spawn paint drops at random positions on scroll
        const x = Math.random() * canvas.width;
        const y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4;
        paintTrailsRef.current.push(new PaintDrop(x, y, accentColor));
        scrollTimer = now;
      }
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [accentColor]);

  // GSAP scroll animations
  useEffect(() => {
    let ctx;
    (async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        // Hero
        gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
        gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1, delay: 0.5, ease: 'power3.out' });
        gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 0.8 });
        gsap.from('.hero-actions > *', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15, delay: 1 });
        gsap.from('.hero-palette', { opacity: 0, y: 20, duration: 0.8, delay: 1.3 });

        // Section headers
        document.querySelectorAll('.section-header').forEach((header) => {
          gsap.from(header.children, {
            opacity: 0, y: 30, duration: 0.8, stagger: 0.1,
            scrollTrigger: { trigger: header, start: 'top 80%' },
          });
        });

        // Service cards
        gsap.from('.service-card', {
          opacity: 0, y: 50, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: '.services-grid', start: 'top 75%' },
        });

        // Color advice
        gsap.from('.color-visual', {
          opacity: 0, scale: 0.9, duration: 1,
          scrollTrigger: { trigger: '.color-display', start: 'top 70%' },
        });
        gsap.from('.color-option', {
          opacity: 0, x: 30, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: '.color-options', start: 'top 75%' },
        });

        // Portfolio
        gsap.from('.portfolio-item', {
          opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.12,
          scrollTrigger: { trigger: '.portfolio-grid', start: 'top 75%' },
        });

        // Process
        gsap.from('.process-card', {
          opacity: 0, y: 40, duration: 0.8, stagger: 0.12,
          scrollTrigger: { trigger: '.process-grid', start: 'top 75%' },
        });

        // Reviews
        gsap.from('.review-card', {
          opacity: 0, y: 40, duration: 0.8, stagger: 0.12,
          scrollTrigger: { trigger: '.reviews-grid', start: 'top 75%' },
        });

        // Contact
        gsap.from('.contact-info > *', {
          opacity: 0, y: 30, duration: 0.8, stagger: 0.1,
          scrollTrigger: { trigger: '.contact', start: 'top 70%' },
        });
        gsap.from('.contact-form', {
          opacity: 0, x: 30, duration: 0.8,
          scrollTrigger: { trigger: '.contact', start: 'top 70%' },
        });
      });
    })();
    return () => ctx && ctx.revert();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="paint-canvas" />

      <nav className="nav">
        <div className="nav-brand">
          <span className="brand-dot" style={{ background: accentColor }}></span>
          <span>Kleurrijk</span>
        </div>
        <div className="nav-links">
          <a href="#diensten">Diensten</a>
          <a href="#kleuradvies">Kleuradvies</a>
          <a href="#projecten">Projecten</a>
          <a href="#contact">Contact</a>
        </div>
        <a href="#contact" className="nav-cta" style={{ background: accentColor }}>
          Offerte Aanvragen
        </a>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" style={{ background: accentColor }}></span>
              <span>Erkende schilder · 12 jaar ervaring</span>
            </div>
            <h1 className="hero-title">
              Wij brengen <span className="splash" style={{ color: accentColor }}>kleur</span><br />
              in uw wereld
            </h1>
            <p className="hero-subtitle">
              Van strak schilderwerk tot creatieve effecten. Wij maken van uw huis een kunstwerk.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary" style={{ background: accentColor }}>
                <span>Vraag Offerte Aan</span>
              </a>
              <a href="#projecten" className="btn btn-outline">
                <span>Bekijk Projecten</span>
              </a>
            </div>
            <div className="hero-palette">
              <span className="palette-label">Kies kleur:</span>
              {colorPalettes.map((p, i) => (
                <div
                  key={i}
                  className={`palette-swatch ${i === activeColorIdx ? 'active' : ''}`}
                  style={{ background: p.color }}
                  onClick={() => {
                    setAccentColor(p.color);
                    setActiveColorIdx(i);
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="services" id="diensten">
          <div className="section-header">
            <span className="section-tag" style={{ color: accentColor }}>DIENSTEN</span>
            <h2 className="section-title">Wat wij doen</h2>
            <p className="section-desc">Van een enkele muur tot een complete make-over. Alles met dezelfde aandacht.</p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card">
                <div className="service-emoji">{s.emoji}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-price" style={{ color: accentColor }}>{s.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Color Advice */}
        <section className="color-advice" id="kleuradvies">
          <div className="section-header">
            <span className="section-tag" style={{ color: accentColor }}>KLEURADVIES</span>
            <h2 className="section-title">Kies uw sfeer</h2>
            <p className="section-desc">Elke kleur vertelt een verhaal. Welke past bij uw ruimte?</p>
          </div>
          <div className="color-display">
            <div className="color-visual">
              <div className="room-scene">
                <div className="room-wall" style={{ background: accentColor }}></div>
                <div className="room-window"></div>
                <div className="room-floor"></div>
              </div>
            </div>
            <div className="color-options">
              {colorPalettes.map((p, i) => (
                <div
                  key={i}
                  className={`color-option ${i === activeColorIdx ? 'active' : ''}`}
                  style={i === activeColorIdx ? { borderColor: accentColor } : {}}
                  onClick={() => {
                    setAccentColor(p.color);
                    setActiveColorIdx(i);
                  }}
                >
                  <div className="color-swatch" style={{ background: p.color }}></div>
                  <div className="color-info">
                    <h4>{p.name} — {p.room}</h4>
                    <p>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section className="portfolio" id="projecten">
          <div className="section-header">
            <span className="section-tag" style={{ color: accentColor }}>PROJECTEN</span>
            <h2 className="section-title">Ons Werk</h2>
          </div>
          <div className="portfolio-grid">
            {projects.map((p, i) => (
              <div key={i} className="portfolio-item">
                <div className="portfolio-image" style={{ background: p.grad }}>
                  <div className="portfolio-overlay">
                    <span className="portfolio-tag">{p.tag}</span>
                    <h3>{p.name}</h3>
                    <p>{p.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="process-section">
          <div className="section-header">
            <span className="section-tag" style={{ color: accentColor }}>WERKWIJZE</span>
            <h2 className="section-title">Hoe wij werken</h2>
          </div>
          <div className="process-grid">
            <div className="process-card">
              <div className="process-emoji">📞</div>
              <h3>Contact</h3>
              <p>U neemt contact op. Wij plannen een gratis inspectie.</p>
            </div>
            <div className="process-card">
              <div className="process-emoji">📋</div>
              <h3>Offerte</h3>
              <p>Een eerlijke offerte met een duidelijk plan van aanpak.</p>
            </div>
            <div className="process-card">
              <div className="process-emoji">🎨</div>
              <h3>Schilderen</h3>
              <p>Vakkundig schilderwerk. Netjes, schoon en op tijd.</p>
            </div>
            <div className="process-card">
              <div className="process-emoji">✅</div>
              <h3>Oplevering</h3>
              <p>Samen de klus bekeken. Tevreden? Pas dan is het klaar.</p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="reviews">
          <div className="section-header">
            <span className="section-tag" style={{ color: accentColor }}>REVIEWS</span>
            <h2 className="section-title">Klanten aan het woord</h2>
          </div>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{'★'.repeat(r.stars)}</div>
                <p>"{r.text}"</p>
                <div className="review-author">
                  <div className="author-avatar" style={{ background: r.color }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="author-name">{r.name}</div>
                    <div className="author-location">{r.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="contact" id="contact">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="section-header">
                <span className="section-tag" style={{ color: accentColor }}>CONTACT</span>
                <h2 className="section-title">Vraag een offerte aan</h2>
                <p className="section-desc">Gratis inspectie en advies. Binnen 24 uur reactie.</p>
              </div>
              <div className="contact-details">
                <div className="contact-row">
                  <span className="contact-emoji">📞</span>
                  <div>
                    <div className="contact-label">Telefoon</div>
                    <a href="tel:+31634567890">06 3456 7890</a>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-emoji">✉</span>
                  <div>
                    <div className="contact-label">E-mail</div>
                    <a href="mailto:info@kleurrijk.nl">info@kleurrijk.nl</a>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-emoji">📍</span>
                  <div>
                    <div className="contact-label">Werkgebied</div>
                    <span>Amsterdam · Haarlem · Amstelveen</span>
                  </div>
                </div>
                <div className="contact-row">
                  <span className="contact-emoji">⏰</span>
                  <div>
                    <div className="contact-label">Openingstijden</div>
                    <span>Ma-Vr 07:00-18:00</span>
                  </div>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Bedankt! Wij nemen contact op.'); }}>
              <div className="form-group">
                <label>Naam</label>
                <input type="text" placeholder="Uw naam" required />
              </div>
              <div className="form-group">
                <label>Telefoon</label>
                <input type="tel" placeholder="06 ..." required />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" placeholder="naam@email.nl" required />
              </div>
              <div className="form-group">
                <label>Type klus</label>
                <select required>
                  <option value="">Kies een dienst...</option>
                  <option>Binnenschilderwerk</option>
                  <option>Buitschilderwerk</option>
                  <option>Behangen</option>
                  <option>Kozijnen</option>
                  <option>Kleuradvies</option>
                  <option>Speciale effecten</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bericht</label>
                <textarea rows="3" placeholder="Vertel ons over uw project..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary form-submit" style={{ background: accentColor }}>
                <span>Verstuur</span>
              </button>
            </form>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">
                <span className="brand-dot" style={{ background: accentColor, width: '12px', height: '12px', borderRadius: '50%' }}></span>
                Kleurrijk
              </div>
              <p className="footer-tagline">Uw schilder met kleur en karakter</p>
            </div>
            <div className="footer-col">
              <h4 style={{ color: accentColor }}>Diensten</h4>
              <a href="#diensten">Binnenschilderwerk</a>
              <a href="#diensten">Buitschilderwerk</a>
              <a href="#diensten">Behangen</a>
              <a href="#diensten">Kleuradvies</a>
            </div>
            <div className="footer-col">
              <h4 style={{ color: accentColor }}>Bedrijf</h4>
              <a href="#projecten">Projecten</a>
              <a href="#kleuradvies">Kleuradvies</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-col">
              <h4 style={{ color: accentColor }}>KVK 67890123</h4>
              <p>BTW NL006789012B03</p>
              <p>Erkend Schildersbedrijf</p>
            </div>
          </div>
          <div className="footer-bottom">© 2025 Kleurrijk Schilderwerk — Alle rechten voorbehouden</div>
        </footer>
      </main>
    </>
  );
}
