# Project Description: Car Game

## Overview

The "Car Game" is a React + TypeScript + Vite web application built as an interactive 2D racing game ("LLev's Car 💥"). The project's unique selling point is its dual game modes:
1. **Manual Mode:** The user plays the game using keyboard arrows, WASD, mouse clicks, or touch swipes.
2. **Auto (AI) Mode:** The user writes custom TypeScript logic directly in the browser using an integrated Monaco Editor. The game executes this script to control the car automatically.

## Technology Stack

- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS v4, CSS Modules (`*.module.css`)
- **UI Components & Icons:** Framer Motion, Lucide React
- **Code Editor:** `@monaco-editor/react` for writing in-game AI logic.
- **Execution Engine:** Custom sandboxed `new Function()` using TypeScript's Compiler API to transpile code at runtime.

## Architecture & Key Directories

The project is contained in `src/` and follows a modular structure:

### 1. `src/components/`
Contains the UI elements and game views.
- **`CarGame.tsx`:** The root component that stitches the UI together. Manages the split-pane layout (game view vs code editor view), loads URL state, and handles general gameplay events. Includes special Twitch stream mode logic (transparent backgrounds via URL params).
- **`GameCanvas.tsx`:** Handles the 2D rendering of the game using HTML5 Canvas.
- **`CodeEditor.tsx`:** Wraps the Monaco editor for users to write their `handleNextMove` logic.
- **`GameAllControls.tsx` / `GameControls.tsx` / `GameHeader.tsx`:** Manage settings, start/stop actions, and game info (score, lives).
- **`PerformanceIndicator.tsx`:** Displays runtime performance.

### 2. `src/utils/`
Contains core game logic, physics, and code execution.
- **`codeRunner.ts`:** The heart of the Auto mode. It transpiles user-provided TypeScript natively in the browser, strips imports, and safely executes the code using `new Function()` bound to a secure context with timeouts. Validates that the AI returns valid moves (`'left'`, `'right'`, `null`).
- **`gameHelpers.ts`:** General helper functions for collision detection and bounds.
- **`codePersistence.ts`:** Handles saving to and loading user code from `localStorage`.
- **`urlState.ts`:** Allows game configuration via URL parameters (useful for Twitch overlays or specific configurations).

### 3. `src/hooks/`
- **`useGameLogic.ts`:** A massive custom hook managing the main game loop (`requestAnimationFrame`), physics updates, state transitions, difficulty scaling, obstacle/bonus/coin generation, and calling the `codeRunner` during Auto mode.

### 4. `src/types/` & `src/constants/`
- **`public/game.ts` / `game.ts`:** Contains interfaces for the Context provided to the user AI (e.g., `Player`, `Obstacle`, `Bonus`, `Coin`, `Context`).
- **`gameConstants.ts`:** Centralized configurations for dimensions, speeds, scoring, timeouts, etc.
- **`helperExamples.ts`:** Pre-written starter AI templates.

## Execution Flow for "Auto Mode"

1. **User writes code:** Handled by `CodeEditor.tsx`, persisted via `codePersistence.ts`.
2. **Game starts:** `useGameLogic.ts` initiates the loop.
3. **Tick evaluation:** The game loop calls `codeRunner.executeCode(code, context)`.
4. **Context provisioning:** The game passes a sanitized snapshot of the current state (`car`, `obstacles`, `bonuses`, `coins`, collision forecasting) to the script.
5. **Execution:** The script is transpiled to JS, executed in a restricted context, and a direction is returned. Timeouts prevent infinite loops.
6. **Apply action:** The car moves left, right, or stays according to the script's decision. 

## Special Features

- **Sandboxing & Type Safety:** The user script has access to subset functions and a strictly typed `Context`.
- **Reproducibility:** A predictable `seed` state is maintainable via UI, ensuring the same run yields the same obstacles.
- **Twitch Integration:** `CarGame.tsx` supports URL parameters to make the UI transparent for seamless OBS/streaming overlays.
- **Easter Eggs:** The codebase includes a "Super AI" secret unlock trigger upon interacting heavily with the game's UI.

## Adding Features

- **New Objects:** Adding new items (like a new bonus) requires updating the `useGameLogic.ts` generation, `GameCanvas.tsx` rendering logic, and extending the types in `src/types/game.ts`. The `codeRunner.ts` must also expose new items in its `createGameContext`.
- **Styling Changes:** Primarily modify `index.css` (Tailwind) or the specific `*.module.css` file.
