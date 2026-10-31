# Block Blast — Minimalist Polyomino Puzzle (React + Firebase)

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

A modern, minimalist grid-based polyomino puzzle game inspired by Block Blast, engineered in React and Vite with a sleek high-contrast dark aesthetic, simultaneous row/column line clearing mechanics, combo multipliers, exhaustive game-over detection, and resilient Firebase authentication and cloud high-score persistence with offline fallback.

---

## 🎮 Gameplay & Rules

1. **8x8 Matrix Board**: The playing field is an $8 \times 8$ grid matrix where pieces are placed.
2. **Polyomino Piece Generation**: Players receive a random offering of **3 polyomino pieces** per round in a bottom tray. When all 3 pieces are legally placed, a fresh set of 3 pieces is dealt.
   - **Shape Variations (18+ polyominos)**: Monomino (1x1 dot), Dominoes (1x2 horizontal & 2x1 vertical), Triominoes (1x3 lines, corner Ls), Tetrominoes (1x4 lines, 2x2 squares, T-shapes, L-shapes), Pentominoes (1x5 lines, 3x3 big Ls, 3x3 big squares).
3. **Dual Placement Controls**:
   - **Click-to-Place (Accessibility)**: Click any offered piece in the tray to select it, hover across the board to view real-time ghost placement coordinates, and click on the target board cell to place it.
   - **Drag-and-Drop**: Drag any piece directly onto the board with real-time green/red collision and boundary feedback.
4. **Simultaneous Row & Column Clearing**:
   - Filling all 8 cells of any horizontal row clears that row.
   - Filling all 8 cells of any vertical column clears that column.
   - **Cross Clears**: Both rows and columns can clear simultaneously! Intersecting cells are included once without collision bugs or double deletion.
5. **Dynamic Scoring & Combo Multipliers**:
   - **Tile Placement Points**: $+1$ point per active tile of the placed piece (e.g. 2x2 square adds $+4$ points).
   - **Line Clear Base Points**: $L \times 10$ points for $L$ lines cleared.
   - **Multi-Line Bonus**: Clearing $\ge 2$ lines at once awards an extra $L \times 15$ points.
   - **Consecutive Combo Streak**: Clearing lines on consecutive turns multiplies line score by $(1 + \text{comboCount} \times 0.5)$.
   - Emits floating celebratory score badges (e.g. `COMBO x3!`, `MEGA BLAST!`).
6. **Exhaustive Game Over Detection**:
   - After each move and line clearing step, the game evaluates whether **ANY** remaining piece in the current tray can legally be placed anywhere on the $8 \times 8$ board.
   - If zero legal placements exist for all remaining tray pieces, the game ends immediately and displays the Game Over modal with detailed session statistics.

---

## 🏛️ Architecture & Project Structure

```
react-block-blast/
├── index.html                    # Entry HTML document with font imports
├── vite.config.js                # Vite configuration with Vitest setup
├── tailwind.config.js            # Tailwind typography, theme, and animations
├── postcss.config.js             # PostCSS processing
├── package.json                  # Dependencies & scripts
└── src/
    ├── main.jsx                  # React DOM root render
    ├── App.jsx                   # Central game loop, state management, modal orchestration
    ├── index.css                 # Base styles & custom scrollbars
    ├── setupTests.js             # Vitest DOM matchers setup
    ├── components/
    │   ├── Header.jsx            # Top navigation bar, auth badge, leaderboard toggle
    │   ├── ScoreBoard.jsx        # Live score, high score, combo streak, stats & reset
    │   ├── Board.jsx             # 8x8 interactive board, ghost previews, floating popups
    │   ├── Cell.jsx              # Individual cell with bevel sheen, ghost states, clear flashes
    │   ├── PieceTray.jsx         # 3-piece tray selector with mini-matrix preview
    │   ├── GameOverModal.jsx     # End of game stats, confetti celebration, play again
    │   ├── LeaderboardModal.jsx  # All-time top 10 rankings view
    │   ├── AuthModal.jsx         # Guest 1-click login, email/password login & registration
    │   └── HelpModal.jsx         # In-game rules & combo guides
    ├── services/
    │   ├── firebase.js           # Modular Firebase Auth & Firestore client
    │   └── storageAdapter.js     # Resilient offline/demo storage & auth adapter
    ├── utils/
    │   ├── boardLogic.js         # Pure grid matrix operations, boundary/collision checks, line clears
    │   ├── polyominos.js         # Polyomino shape matrices (18+ definitions), tray generator
    │   └── comboCalculator.js    # Mathematical formulas for combos and scoring
    └── __tests__/
        └── boardLogic.test.jsx   # 26 automated unit tests covering all core mechanics
```

---

## ☁️ Firebase Authentication & Cloud Persistence

The application includes full Firebase integration configured with an offline-first resilient adapter pattern:
- **Firebase Authentication**:
  - **Guest / Anonymous Login**: Instant 1-click access without requiring passwords or email.
  - **Email & Password Authentication**: Sign in and sign up capabilities for persistent profiles.
- **Cloud Firestore Leaderboard**:
  - Persists high scores, max combo streaks, lines cleared, and pieces placed to collection `block_blast_scores`.
  - Global leaderboard ranks the top 10 players worldwide.
- **Resilient Offline Fallback**:
  - When offline or when Firebase credentials are demo placeholders, all operations transparently fall back to browser `localStorage` with zero runtime exceptions or missing features.

---

## 🧪 Testing & Verification

Comprehensive automated test suite executed with Vitest covering 100% of critical paths:

```bash
# Run the test suite
npm.cmd test
```

### Test Coverage Highlights:
- **Board Matrix Initialization**: Confirms clean 8x8 matrix creation filled with `null`.
- **Boundary Validation**: Validates in-bounds placement, right-side overflows, bottom overflows, and negative anchor rejection.
- **Collision Detection**: Confirms occupied cell collision rejection, and verifies non-rectangular concave shapes (e.g. corner Ls) do not produce false collisions on their empty cutouts.
- **Simultaneous Row & Column Clearing**: Verifies horizontal row detection, vertical column detection, and cross clears (simultaneous row and column) with single deduplicated intersection cell deletion.
- **Combo & Scoring Mathematics**: Verifies tile placement scoring, single line clears, combo streak multipliers, and multi-line bonus points.
- **Exhaustive Game Over Algorithm**: Confirms `hasAnyLegalMove` accurately detects open boards, filled boards, and edge cases where small pieces fit into single holes while large pieces cannot.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (on Windows PowerShell, use `npm.cmd`)

### Installation & Development
```bash
# Install dependencies
npm.cmd install

# Start development server
npm.cmd run dev

# Run unit tests
npm.cmd test

# Build for production
npm.cmd run build
```

---

## 📄 License
MIT License. Built for the modern portfolio showcase.
