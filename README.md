# SWE — 15 Awwwards-waardige lokale ZZP/MKB websites

15 originele, statische demo-websites voor lokale Nederlandse ZZP- en MKB-bedrijven. Gebouwd in `/home/ubuntu/Documents/glm/swe` zonder bestaande projecten te wijzigen.

## Snel starten

```bash
cd /home/ubuntu/Documents/glm/swe
PORT=5175 node server.js
```

Open dan `http://localhost:5175` voor het portaal. Klik op een kaart om de website te bekijken.

## Websites

| # | Map | Branche | Effect |
|---|-----|---------|--------|
| 01 | `01-airco` | Airco & warmtepompen | 3D split-unit met koelstroming op scroll |
| 02 | `02-elektricien` | Elektricien | 3D schakelkast en stroompulsen op scroll |
| 03 | `03-rijschool` | Rijschool | 3D auto-interieur en route door verkeer |
| 04 | `04-tegelzetter` | Tegelzetter | Tegels leggen zich op scroll; grout-kleur kiezen |
| 05 | `05-makelaar` | Makelaar | 3D huis bouwt zich op; verdiepingen onthullen |
| 06 | `06-beveiliging` | Beveiliging | 3D camera met beveiligingsveld; nachtmodus |
| 07 | `07-grafisch` | Grafisch ontwerper | Typografie-deeltjes en scroll-morph |
| 08 | `08-fietsenmaker` | Fietsenmaker | 3D wiel draait; kleur/onderdeel configurator |
| 09 | `09-catering` | Catering | 3D tafelopbouw; gerechten verschijnen |
| 10 | `10-aannemer` | Aannemer / bouwbedrijf | 3D bouwplaats; hijskraan en elementen |
| 11 | `11-notaris` | Notaris | 3D zegel / stempel; documenten openen |
| 12 | `12-interieur` | Interieurstyliste | 3D kamer inrichten met stoffen/kleuren |
| 13 | `13-zorg` | Thuiszorg | Hartlijn / zorgnetwerk; warme particles |
| 14 | `14-hekwerk` | Hekwerk & poorten | 3D hek vouwt uit; poorten openen |
| 15 | `15-duurzaam` | Duurzaam advies | 3D huis met energie-label en zon/wind |

## Tech stack

- HTML5, CSS3, vanilla JavaScript
- Three.js (CDN) voor 3D scenes
- GSAP + ScrollTrigger (CDN) voor scroll-animaties
- Canvas 2D en SVG voor visuele effecten
- Google Fonts
- Node.js `server.js` als statische file server

## Git

Remote: `https://github.com/rajitovo-ai/websitesamples.git` (branch `swe`)

## Opmerkingen

- Elk site bevat een werkend contactformulier dat client-side bevestigt (geen backend).
- Alle sites zijn responsive op mobiel.
- Geen externe API keys nodig; libraries via CDN.
- Alle afbeeldingen/3D-modellen zijn proceduraal of SVG; geen AI-generaties.
