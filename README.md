# KIMI — 15 AWWard-waardige ZZP/MKB websites

15 originele, statische demo-websites voor lokale Nederlandse ZZP- en MKB-bedrijven. Gebouwd met HTML, CSS en vanilla JavaScript. Geen Next.js, geen overlap met de bestaande `glmwebsites`.

## Snel starten

```bash
cd /home/ubuntu/Documents/glm/kimi
PORT=5174 node server.js
```

Open dan `http://localhost:5174` voor het portaal. Klik op een kaart om de website te bekijken.

> Poort `5173` is al in gebruik door de bestaande `glmwebsites` portal. Daarom gebruikt KIMI standaard poort `5174`.

## Websites

| # | Map | Branche |
|---|-----|-----------|
| 01 | `01-timmerman` | Timmerman / kozijnen & deuren |
| 02 | `02-verhuisbedrijf` | Verhuisbedrijf |
| 03 | `03-schoonmaak` | Schoonmaakdienst |
| 04 | `04-keukenmonteur` | Keukenmonteur |
| 05 | `05-zonwering` | Zonwering / raamdecoratie |
| 06 | `06-behanger` | Behanger |
| 07 | `07-vloerenlegger` | Vloerenlegger |
| 08 | `08-bruiloftdj` | Bruiloft DJ / evenementen |
| 09 | `09-ontstoppingsdienst` | Ontstoppingsdienst |
| 10 | `10-slotenmaker` | Slotenmaker |
| 11 | `11-wagenbelettering` | Bedrijfswagen belettering |
| 12 | `12-cardetailing` | Car detailing |
| 13 | `13-hondenuitlaat` | Hondenuitlaatservice |
| 14 | `14-massage` | Massagetherapeut / wellness |
| 15 | `15-kinderfeestjes` | Kinderfeestjes / entertainment |

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Three.js (CDN) voor 3D scenes
- GSAP + ScrollTrigger (CDN) voor scroll-animaties
- Canvas 2D en SVG voor visuele effecten
- Google Fonts
- Node.js `server.js` als statische file server

## Git

Branch: `kimi` op `https://github.com/rajitovo-ai/websitesamples.git`

## Opmerkingen

- Elk site bevat een werkend contactformulier dat client-side bevestigt (geen backend).
- Alle sites zijn desktop-first maar responsive op mobiel.
- Geen externe API keys nodig; libraries via CDN.
