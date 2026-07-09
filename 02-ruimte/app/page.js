'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const Scene = dynamic(() => import('../components/Scene'), { ssr: false });

const planets = [
  {
    name: 'Mercurius',
    subtitle: 'De Snelle Bodem',
    index: 'PL-01',
    desc: 'De kleinste planeet en dichtst bij de zon. Een wereld van extremale contrasten — 430°C overdag, -180°C \'s nachts. Geen atmosfeer, geen bescherming. Pure, naakte rots.',
    stats: [
      { label: 'Diameter', value: '4,879 km' },
      { label: 'Afstand Zon', value: '57.9M km' },
      { label: 'Omlooptijd', value: '88 dagen' },
      { label: 'Temperatuur', value: '-180 / 430°C' },
    ],
  },
  {
    name: 'Venus',
    subtitle: 'De Verschrikkelijke',
    index: 'PL-02',
    desc: 'De heetste planeet in ons stelsel. Een dichte atmosfeer van CO2 creëert een broeikaseffect dat de temperatuur oploopt tot 462°C. Druk 90x die van aarde. Een waarschuwing.',
    stats: [
      { label: 'Diameter', value: '12,104 km' },
      { label: 'Afstand Zon', value: '108.2M km' },
      { label: 'Omlooptijd', value: '225 dagen' },
      { label: 'Temperatuur', value: '462°C' },
    ],
  },
  {
    name: 'Aarde',
    subtitle: 'De Blauwe Marvel',
    index: 'PL-03',
    desc: 'Onze thuisbasis. De enige bekende plek in het universum waar leven bloeit. 71% water, 29% land. Een fragiele blauwe druppel in de oneindigheid van de ruimte.',
    stats: [
      { label: 'Diameter', value: '12,742 km' },
      { label: 'Afstand Zon', value: '149.6M km' },
      { label: 'Omlooptijd', value: '365.25 dagen' },
      { label: 'Temperatuur', value: '15°C gem.' },
    ],
  },
  {
    name: 'Mars',
    subtitle: 'De Rode Woestijn',
    index: 'PL-04',
    desc: 'De volgende frontier. IJzeroxide geeft Mars zijn rode kleur. Met de hoogste berg (Olympus Mons, 22km) en de grootste canyon (Valles Marineris) in het stelsel. Een tweede thuis?',
    stats: [
      { label: 'Diameter', value: '6,779 km' },
      { label: 'Afstand Zon', value: '227.9M km' },
      { label: 'Omlooptijd', value: '687 dagen' },
      { label: 'Temperatuur', value: '-63°C gem.' },
    ],
  },
  {
    name: 'Jupiter',
    subtitle: 'De Gasreus',
    index: 'PL-05',
    desc: 'De grootste planeet. Een stormachtige gasreus met de Grote Rode Vlek — een orkaan groter dan de aarde die al 350+ jaar raast. 79 manen. Een miniatuur zonnestelsel.',
    stats: [
      { label: 'Diameter', value: '139,820 km' },
      { label: 'Afstand Zon', value: '778.5M km' },
      { label: 'Omlooptijd', value: '11.9 jaar' },
      { label: 'Temperatuur', value: '-145°C' },
    ],
  },
  {
    name: 'Saturnus',
    subtitle: 'De Geringde Heerser',
    index: 'PL-06',
    desc: 'De juweel van ons stelsel. IJs en rots vormen de iconische ringen die 282,000 km breed zijn maar slechts 10m dik. De minst dichte planeet — hij zou in water drijven.',
    stats: [
      { label: 'Diameter', value: '116,460 km' },
      { label: 'Afstand Zon', value: '1.43B km' },
      { label: 'Omlooptijd', value: '29.5 jaar' },
      { label: 'Temperatuur', value: '-178°C' },
    ],
  },
];

export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPlanet, setCurrentPlanet] = useState('Zon');

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setLoaded(true), 500);
      }
      setProgress(Math.floor(p));
    }, 120);

    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const sp = total > 0 ? window.scrollY / total : 0;
      setScrollProgress(sp);

      // Determine current planet based on scroll
      const sections = document.querySelectorAll('[data-planet]');
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3) {
          setCurrentPlanet(sec.dataset.planet);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* Loader */}
      <div className={`loader ${loaded ? 'hidden' : ''}`}>
        <div className="loader-text">Initialiseren Navigatiesysteem</div>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loader-pct">{progress}%</div>
      </div>

      {/* 3D Scene */}
      <div className="canvas-container">
        <Scene scrollProgress={scrollProgress} />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-brand">RUIMTE</div>
        <div className="nav-status">SYSTEMS ONLINE</div>
      </nav>

      {/* HUD */}
      <div className="hud">
        <div className="hud-line">
          <span className="hud-label">TARGET:</span>
          <span className="hud-value">{currentPlanet}</span>
        </div>
        <div className="hud-line">
          <span className="hud-label">PROGRESS:</span>
          <span className="hud-value">{(scrollProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="hud-line">
          <span className="hud-label">VELOCITY:</span>
          <span className="hud-value">{(scrollProgress * 299792).toFixed(0)} km/s</span>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <h1 className="hero-title">RUIMTE</h1>
            <p className="hero-sub">Een Reis Door Het Zonnestelsel</p>
          </div>
          <div className="hero-scroll">Scroll om te reizen</div>
        </section>

        {/* Planet Sections */}
        {planets.map((planet, i) => (
          <section
            key={planet.name}
            className="planet-section"
            data-planet={planet.name}
          >
            <div className={`planet-info ${i % 2 === 0 ? 'right' : ''}`}>
              <div className="planet-index">{planet.index}</div>
              <h2 className="planet-name">{planet.name}</h2>
              <div className="planet-subtitle">{planet.subtitle}</div>
              <p className="planet-desc">{planet.desc}</p>
              <div className="planet-stats">
                {planet.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="planet-stat-label">{stat.label}</div>
                    <div className="planet-stat-value">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-inner">
            <h2 className="mission-title">De Missie</h2>
            <p className="mission-text">
              Sinds 1957 heeft de mensheid meer dan 5.000 ruimtemissies gelanceerd.
              Van Sputnik tot Voyager, van de Maan tot Mars. Elke missie brengt ons
              dichter bij het begrip van onze plaats in de kosmos. De ruimte is niet
              leeg — zij wacht op ontdekking.
            </p>
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-card-icon">🛰</div>
                <div className="mission-card-value">5,000+</div>
                <div className="mission-card-label">Missies</div>
              </div>
              <div className="mission-card">
                <div className="mission-card-icon">🌙</div>
                <div className="mission-card-value">12</div>
                <div className="mission-card-label">Maanwandelingen</div>
              </div>
              <div className="mission-card">
                <div className="mission-card-icon">🚀</div>
                <div className="mission-card-value">24B</div>
                <div className="mission-card-label">Km Afgelegd</div>
              </div>
              <div className="mission-card">
                <div className="mission-card-icon">⭐</div>
                <div className="mission-card-value">8</div>
                <div className="mission-card-label">Planeten</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div>
            <h2 className="cta-title">Blijf Ontdekken</h2>
            <p className="cta-text">De ruimte is oneindig. Onze nieuwsgierigheid ook.</p>
            <a href="#" className="cta-button">
              <span>Start Missie</span>
              <span>→</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <span className="footer-brand">RUIMTE © 2025</span>
          <span>Een eerbetoon aan de kosmos</span>
        </footer>
      </div>
    </>
  );
}
