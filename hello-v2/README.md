# Chain of Achievements — React / Next.js / TypeScript

Real implementation of the mineable blockchain achievements timeline, matching the HTML mockup (`Chain of Achievements.dc.html`) in this project. Uses [ReactBits](https://reactbits.dev) for the decorative pieces; all mining/validation logic is custom, hand-written, framework-agnostic TypeScript.

## Install

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page is only `ChainOfAchievements`.

ReactBits components live in `src/components/react-bits/` (added via jsrepo). Re-add them with:

```bash
npx jsrepo add https://reactbits.dev/r/DecryptedText-TS-CSS --yes
npx jsrepo add https://reactbits.dev/r/LetterGlitch-TS-CSS --yes
npx jsrepo add https://reactbits.dev/r/ClickSpark-TS-CSS --yes
npx jsrepo add https://reactbits.dev/r/ElectricBorder-TS-CSS --yes
```

## Design decisions (answers to your open questions)

1. **Persistence**: defaults to session-only (broken on every visit) — this is the better first-time experience for a "screenshot and share" piece. `useChain({ persist: true })` flips on `localStorage` persistence if you want returning visitors to keep progress; wire it to a prop/env flag either way.
2. **Difficulty**: kept flat at `0000` for all blocks. Scaling difficulty by block age is supported (`scalingDifficulty` option in `useChain`) but flat difficulty keeps solve time predictable (~65k iterations) across the whole chain — recommended for mobile.
3. **Decrypt gating**: gated behind mining (matches "the interaction is the point" — decrypting an unmined block would let people skip the mining payoff). Toggle via `decryptGated` option if you'd rather let people read ahead.

## SHA-256 approach

`sha256.ts` uses `crypto.subtle.digest` (Web Crypto, no library). The mining loop in `useChain.ts` batches ~1200 hash attempts per `requestAnimationFrame` tick rather than running as a tight synchronous loop — this keeps the main thread responsive (the hash display visibly churns) without needing a Web Worker. If you want mining to survive tab-switching or run faster, move the loop in `mineBlock` into a dedicated Worker and `postMessage` progress back — the hashing function is already pure and worker-portable, just move `sha256.ts` + the loop body into `chain.worker.ts`.

## Component → ReactBits mapping

- **DecryptedText** — content reveal on click, gated on `block.mined`.
- **LetterGlitch** — NOT mounted as a full-bleed background (would compete with your existing pixel-wave background per your brief). Instead used narrowly, inside `BlockCard`'s content box, as the pre-decrypt scrambled-text treatment (its `characters_only` mode), so it reads as glitch texture on a small surface rather than a second competing background.
- **ClickSpark** — wraps the Mine button; fires on click regardless of outcome (feels good every attempt, not just on success).
- **ElectricBorder** — wraps a `BlockCard` when `block.valid`, replacing the flat "VALID" tag border with an animated current running around the card.

## Files map back to the HTML mock

| React file | HTML mock reference |
|---|---|
| `useChain.ts` | `Component` class in `Chain of Achievements.dc.html` — `mineBlock`, `isValid`, `healNetwork`, `decryptBlock` |
| `BlockCard.tsx` | the `sc-for` block card markup |
| `data.ts` | the `DATA` array in the mock |
