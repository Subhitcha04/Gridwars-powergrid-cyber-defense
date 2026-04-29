# ⚡ GRID WARS — Power Grid Cyber Defense Simulator

> A game-theory strategy game where you defend a national power grid against state-sponsored cyber attacks. Built with React.

![Game Theory](https://img.shields.io/badge/Game_Theory-Stackelberg_%7C_Bayesian_%7C_Markov-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 About

**GRID WARS** is an interactive strategy game that applies formal game theory to a real-world cybersecurity problem — **defending critical power infrastructure from nation-state attackers**.

You play as the **Chief Information Security Officer (CISO)** of a national power grid with 12 interconnected cities. A state-sponsored hacking group called **APT-VOLT** is attempting to cause **cascading blackouts** by compromising key substations. Your job: allocate limited defense resources using game-theoretic reasoning to survive 8 rounds of attacks.

### Why This Use Case?

Power grid cybersecurity is one of the most critical real-world challenges today. Events like the **2015 Ukraine power grid attack** and the **2003 Northeast Blackout** demonstrate how cascading failures in interconnected infrastructure can affect millions. This game models that exact scenario using formal mathematical frameworks.

---

## 🎮 How to Play

1. **Login** — Create your commander profile
2. **Choose Difficulty** — Recruit / Analyst / Director / Wartime CISO (each has different budgets, cascade risks, and XP multipliers)
3. **Deploy Defenses** — Select defense tools from the left panel, then tap any city on the grid map to deploy. Or tap a city first to see a popup with all available options.
4. **End Turn** — Hit "End Turn" and watch the attack unfold
5. **Read Intel** — The right panel shows live **Bayesian probability** of attacker type and **Markov chain predictions** for the next attack vector
6. **Survive 8 Rounds** — If too many cities go offline, cascading failures trigger game over

### First Time?
A **step-by-step tutorial** automatically triggers on your first game. You can also access the full guide from the navigation bar anytime.

---

## 📐 Game Theory Concepts

This isn't just a game with "game theory" in the title — every core mechanic is driven by a formal mathematical model:

### Stackelberg Leader-Follower Model
You (the Defender) are the **Stackelberg Leader** — you commit your defensive posture first, and it's publicly visible. The AI attacker acts as the **Follower**, observing your deployments and computing a **best-response** by targeting your weakest, most connected cities. This mirrors real cybersecurity where organizations publish compliance certifications (ISO 27001, SOC 2) that signal their security investments.

### Bayesian Nash Equilibrium
The attacker's type is **unknown** — they could be a low-skill Script Kiddie or a sophisticated APT Group. You start with a 50/50 prior belief. Each round, the game computes a **Bayesian posterior update** based on:
- The attack vector used (APTs favor SCADA exploits and insider threats; script kiddies prefer phishing)
- The attacker's success rate (APTs have higher breach probability)

The updated beliefs are displayed in real-time in the Intel panel.

### Markov Chain Strategy Evolution
The attacker's strategy transitions follow a **Discrete-Time Markov Chain**. After each round, the probability of switching attack vectors is governed by a transition matrix. **Successful attacks reinforce the current state** (the attacker is more likely to repeat what worked), creating learnable patterns. The Markov prediction panel shows transition probabilities for the next round.

### Zero-Sum Payoff Structure
Every city you defend is a loss for the attacker. Every breach is your loss. The game is strictly zero-sum — there is no cooperative equilibrium.

### Cascade Effects (Network Externalities)
The power grid has a real **graph topology** with edges representing transmission lines. When a city goes offline, its **undefended neighbors** face overload risk (cascade probability depends on difficulty). This models real-world cascading infrastructure failures where a single point of failure can take down an entire region.

---

## 🏗️ Project Structure

```
Gridwars-powergrid-cyber-defense/
├── GridWars.jsx          # Complete React application (single-file)
└── README.md             # Documentation
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Functional Components + Hooks) |
| Animations | Hand-crafted SVG with frame-based animation |
| Styling | CSS-in-JS (co-located styles) |
| Game Engine | Custom state machine (Bayesian + Markov + Stackelberg) |
| Fonts | DM Sans + Sora (Google Fonts) |
| Dependencies | Zero external packages |

---

## ✨ Features

### 🎮 Gaming Platform UX
- Full authentication flow (login / signup)
- Sticky navigation bar with back buttons on every screen
- Smooth page transitions with fade animations
- Responsive layout

### ⚔️ Gameplay
- 12 interconnected cities with real grid topology
- 6 defense strategies with attack-type effectiveness matrices
- 4 difficulty levels with XP multipliers
- City popup defense selector (tap city → choose from menu)
- Auto-triggering beginner tutorial (5-step guided walkthrough)
- Dedicated guide page accessible anytime

### 🔥 Retention & Engagement
- XP and leveling system
- 6 unlockable achievements with confetti celebrations
- Win streak tracking
- Daily challenge banner
- Global leaderboard
- Player profile with lifetime stats
- Toast notifications for instant feedback on every action

### 📊 Game Theory Visualization
- Live Bayesian probability bars (Script Kiddie vs APT)
- Markov chain next-attack prediction bars
- Post-round theory explainers in result modal
- End-of-game debrief connecting outcomes to Stackelberg, Bayesian, and Markov concepts

---

## 🚀 Getting Started

### Option 1 — Claude.ai (Instant)
Upload `GridWars.jsx` as a React artifact — it renders directly.

### Option 2 — Create React App
```bash
npx create-react-app grid-wars
cd grid-wars
cp /path/to/GridWars.jsx src/App.jsx
npm start
```

### Option 3 — Vite (Recommended)
```bash
npm create vite@latest grid-wars -- --template react
cd grid-wars
cp /path/to/GridWars.jsx src/App.jsx
npm install
npm run dev
```

App opens at `http://localhost:5173`

---

## 🧪 Mathematical Models

### Bayesian Update (each round)

```
P(APT | observed_attack) = [ P(attack | APT) × P_prior(APT) ] / P(attack)
```

Where:
- `P(attack | APT)` = likelihood table per attack vector (SCADA: 0.7, Phishing: 0.2, Firmware: 0.6, Insider: 0.8)
- `P(attack | ScriptKiddie)` = (SCADA: 0.3, Phishing: 0.8, Firmware: 0.4, Insider: 0.2)
- Success rate provides an additional signal (APTs breach more often)

### Markov Transition Matrix

```
        SCADA  PHISH  FIRMWARE  INSIDER
SCADA   [0.40   0.25    0.20     0.15]
PHISH   [0.15   0.35    0.25     0.25]
FIRM    [0.20   0.20    0.40     0.20]
INSID   [0.25   0.30    0.20     0.25]
```

Reinforcement: On successful breach, `M[i][i] += 0.05` with row renormalization.

### Stackelberg Best-Response (Attacker Target Selection)

```
score(city) = vulnerability × 2 + connections × 1.5 + population/5 + critical_bonus + ε
```

Where:
- `vulnerability = 5 - defense_effectiveness[attack_type]`
- `connections` = number of online neighbors (cascade potential)
- `ε ~ U(0, (1 - skill) × 3)` — noise decreases with attacker skill

---

## 🎯 Difficulty Levels

| Difficulty | Budget | Cascade Risk | Targets/Round | Blackout Threshold | XP Multiplier |
|-----------|--------|-------------|---------------|-------------------|---------------|
| Recruit | $120K | 15% | 1 | 8 cities | 1x |
| Analyst | $100K | 25% | 2 | 6 cities | 1.5x |
| Director | $75K | 35% | 2 | 5 cities | 2x |
| Wartime CISO | $55K | 45% | 3 | 4 cities | 3x |

---

## 🏆 Achievements

| Achievement | Requirement | XP |
|------------|-------------|-----|
| First Blood | Survive your first round | +50 |
| Untouchable | Repel all attacks in a round | +100 |
| Chain Breaker | Prevent a cascade failure | +150 |
| Mind Reader | Correctly predict 3 attacks | +200 |
| Efficient Ops | Win with 30%+ budget remaining | +250 |
| Grid Guardian | Win with all 12 cities online | +300 |

---

## 📚 References

- Tambe, M. (2011). *Security Games: Applying Game Theory to Counterterrorism*. Stackelberg security game formulation.
- Harsanyi, J.C. (1967). *Games with Incomplete Information*. Bayesian game framework.
- NERC CIP Standards — North American Electric Reliability Corporation Critical Infrastructure Protection.
- 2015 Ukraine Power Grid Attack — First confirmed cyber attack on a power grid.
- 2003 Northeast Blackout — Cascading failure affecting 55 million people across US and Canada.

---

## 📄 License

This project is developed for academic purposes as part of a **Game Theory & Decision Analysis** course.
