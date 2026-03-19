# Destiny Engine PWA

![Sheen Banner](https://raw.githubusercontent.com/74Thirsty/74Thirsty/main/assets/destinycalc.svg)

<p align="center">
  <strong>Symbolic profile calculation in a clean, installable web app.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-85%25-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/CSS-13.6%25-1572B6?logo=css3&logoColor=white" alt="CSS" />
  <img src="https://img.shields.io/badge/HTML-1.4%25-E34F26?logo=html5&logoColor=white" alt="HTML" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status" />
  <img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest" />
</p>

<p align="center">
  Western zodiac • Chinese zodiac • Chinese elements • Numerology life path
</p>

---

## Overview

**Destiny Engine PWA** is a lightweight, client-side app that blends several symbolic systems into one experience.

It currently combines:

- **Western zodiac**
- **Chinese zodiac** with **Chinese New Year adjustment**
- **Chinese element mapping**
- **Numerology life path**

The goal is simple: turn a birth date into a meaningful, structured symbolic profile in a fast, modern interface.

---

## Features

- Installable **Progressive Web App**
- Fast, lightweight frontend
- Fully **client-side**
- Chinese zodiac handling with **Chinese New Year boundary awareness**
- Chinese element mapping for added symbolic depth
- Numerology engine that preserves **master numbers** like `11`, `22`, and `33`
- No backend, no auth, and no database required

---

## Why This Project Exists

Destiny Engine is built for people who want a modern symbolic calculator without unnecessary complexity.

It works well as:

- a personal insight tool
- a foundation for spiritual or metaphysical apps
- a numerology and zodiac demo project
- a starting point for richer profile-generation experiences
- a mobile-friendly, offline-friendly calculator concept

---

## Tech Stack

- **TypeScript**
- **HTML**
- **CSS**
- Frontend app structure with a PWA-ready setup
- **Vitest** for testing

---

## Project Structure

```text
destinyCalc/
├── dist/
├── node_modules/
├── public/
│   └── icons/
├── src/
├── tests/
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.app.tsbuildinfo
├── tsconfig.json
├── types.d.ts
└── vite.config.ts
````

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Start development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

---

## How It Works

### Western Zodiac

Calculates the standard sun sign from the birth date.

### Chinese Zodiac

Uses a **Chinese New Year lookup table** so the result is not based only on the Gregorian calendar year.

### Chinese Element Mapping

Adds the corresponding Chinese elemental association to deepen the result.

### Numerology Life Path

Computes the life path number while preserving master numbers such as:

* `11`
* `22`
* `33`

Example:

* `1979-06-01` resolves to **`33`**, not `6`

---

## Notes

* Everything runs **entirely in the browser**
* No authentication is included
* No backend or database is included
* The Chinese New Year lookup table covers **1990–2035**
* Outside that range, the app falls back to **Gregorian year logic**

---

## Roadmap

Plenty of strong next steps are possible:

* richer interpretations and profile writeups
* saved profiles with local storage
* shareable result pages
* animated UI improvements
* expanded calendar coverage
* downloadable report exports
* deployment to GitHub Pages or Vercel

---

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run tests
5. Open a pull request

---

## License

Add a license file and update this section.

Example:

```md
MIT
```

---

## Author

Built by **74Thirsty**

---

<p align="center">
  <strong>Build slowly. Calculate clearly. Turn symbolism into software.</strong>
</p>
```