# hello-v2

Personal site: intro, a mineable chain of achievements, and a falling tech-stack playground.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Page |
|---|---|
| `/` | Intro + waves |
| `/about` | Chain of achievements |
| `/stack` | Falling stack |

React Bits components live in `src/components/react-bits/` (added via [jsrepo](https://jsrepo.com)). Only the ones actually used on the site are kept: GradientWaves, ClickSpark, TextLoop, StaggeredMenu, BorderGlow, Counter, TextType, FallingText.

## Deploy

This is a standalone Next.js app. Set the host **Root Directory** to `hello-v2`.
