# ⚡ GRID WARS — Power Grid Cyber Defense Simulator

> A game-theory strategy game where you defend a national power grid against state-sponsored cyber attacks. Built with React + Vite.

![Game Theory](https://img.shields.io/badge/Game_Theory-Stackelberg_%7C_Bayesian_%7C_Markov-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
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

Every core mechanic is driven by a formal mathematical model:

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

## 🧬 Architecture — Game Theory Engine

### System Architecture

```mermaid
graph TB
    subgraph PLAYER["🎮 PLAYER (Stackelberg Leader)"]
        UI[React UI Layer]
        AUTH[Authentication]
        SELECT[Defense Selection]
        DEPLOY[City Deployment]
    end

    subgraph ENGINE["⚙️ GAME THEORY ENGINE"]
        direction TB
        SM[State Machine<br/>Round Controller]
        
        subgraph STACKELBERG["📐 Stackelberg Module"]
            COMMIT[Leader Commits<br/>Defense Posture]
            BR[Follower Best-Response<br/>Target Selection]
        end
        
        subgraph BAYESIAN["🧠 Bayesian Module"]
            PRIOR[Prior Beliefs<br/>P₀ Script Kiddie = 0.5<br/>P₀ APT = 0.5]
            LIKELIHOOD[Likelihood Tables<br/>P attack │ type]
            POSTERIOR[Posterior Update<br/>Bayes Theorem]
        end
        
        subgraph MARKOV["⛓ Markov Module"]
            TMATRIX[4×4 Transition Matrix]
            REINFORCE[Success Reinforcement<br/>M_ii += 0.05]
            PREDICT[Next-State Prediction]
        end
        
        subgraph CASCADE["⚡ Cascade Engine"]
            TOPO[Grid Topology<br/>12 Nodes, 19 Edges]
            PROP[Failure Propagation<br/>Probability Check]
            DOMINO[Domino Effect<br/>Neighbor Overload]
        end
        
        subgraph PAYOFF["💰 Zero-Sum Resolver"]
            DEF_ROLL[Defense Roll<br/>effectiveness + random]
            ATK_ROLL[Attack Roll<br/>skill + type bonus]
            RESOLVE[Compare Rolls<br/>Breach or Defend]
        end
    end

    subgraph ATTACKER["🕵️ AI ATTACKER (Stackelberg Follower)"]
        OBSERVE[Observe Defenses]
        SCORE[Score Cities<br/>vulnerability × 2<br/>+ connections × 1.5<br/>+ population / 5]
        CHOOSE[Choose Targets]
    end

    subgraph FEEDBACK["📊 FEEDBACK LOOP"]
        INTEL[Intel Panel<br/>Bayesian Bars + Markov Bars]
        RESULT[Round Result Modal]
        XP[XP + Achievement System]
        DEBRIEF[Game Theory Debrief]
    end

    UI --> AUTH --> SELECT --> DEPLOY
    DEPLOY --> COMMIT
    COMMIT --> OBSERVE
    OBSERVE --> SCORE --> CHOOSE
    CHOOSE --> SM
    SM --> PAYOFF
    DEF_ROLL --> RESOLVE
    ATK_ROLL --> RESOLVE
    RESOLVE --> CASCADE
    TOPO --> PROP --> DOMINO
    RESOLVE --> BAYESIAN
    PRIOR --> POSTERIOR
    LIKELIHOOD --> POSTERIOR
    RESOLVE --> MARKOV
    TMATRIX --> REINFORCE --> PREDICT
    POSTERIOR --> INTEL
    PREDICT --> INTEL
    RESOLVE --> RESULT
    RESULT --> XP
    XP --> DEBRIEF
    DEBRIEF --> UI

    style PLAYER fill:#0d1b2a,stroke:#06b6d4,color:#e2e8f0
    style ENGINE fill:#0a1628,stroke:#8b5cf6,color:#e2e8f0
    style ATTACKER fill:#1a0a0a,stroke:#ef4444,color:#e2e8f0
    style FEEDBACK fill:#0a1a0a,stroke:#34d399,color:#e2e8f0
    style STACKELBERG fill:#0d1b3a,stroke:#06b6d4,color:#e2e8f0
    style BAYESIAN fill:#1a0d2e,stroke:#a78bfa,color:#e2e8f0
    style MARKOV fill:#0d1b2a,stroke:#06b6d4,color:#e2e8f0
    style CASCADE fill:#1a0f0a,stroke:#f59e0b,color:#e2e8f0
    style PAYOFF fill:#0d1a1a,stroke:#34d399,color:#e2e8f0
```

### Round Lifecycle — Game Theory Flow

```mermaid
sequenceDiagram
    participant P as 🎮 Player (Leader)
    participant E as ⚙️ Game Engine
    participant S as 📐 Stackelberg
    participant A as 🕵️ AI Attacker (Follower)
    participant B as 🧠 Bayesian Module
    participant M as ⛓ Markov Module
    participant C as ⚡ Cascade Engine

    rect rgb(13, 27, 42)
        Note over P,E: PHASE 1 — Stackelberg Commitment
        P->>E: Deploy defenses to cities
        E->>S: Lock defense posture (publicly visible)
        S-->>A: Attacker observes deployments
    end

    rect rgb(26, 10, 10)
        Note over A,M: PHASE 2 — Attacker Best-Response
        M->>A: Markov transition → select attack type
        A->>S: Score all cities (vulnerability + topology)
        S->>A: Return top-N weakest targets
        A->>E: Launch attack on selected cities
    end

    rect rgb(13, 26, 26)
        Note over E,C: PHASE 3 — Zero-Sum Resolution
        E->>E: Roll defense vs attack for each target
        E->>C: Pass breached cities
        C->>C: Check neighbors (cascade probability)
        C->>E: Return cascade victims
    end

    rect rgb(26, 13, 46)
        Note over B,M: PHASE 4 — Learning & Adaptation
        E->>B: Observed attack type + success rate
        B->>B: Bayes' theorem → update P(APT)
        E->>M: Attack outcome (success/fail)
        M->>M: Reinforce transition matrix
    end

    rect rgb(10, 26, 10)
        Note over P,E: PHASE 5 — Feedback & Next Round
        E->>P: Show result modal + theory explanation
        B-->>P: Updated Bayesian bars
        M-->>P: Updated Markov predictions
        E->>P: XP + achievements + score
        P->>E: Continue → next round (budget refresh)
    end
```

### Bayesian Update Flow

```mermaid
graph LR
    subgraph ROUND_N["Round N"]
        OBS["Observed Attack<br/>e.g. SCADA Exploit"]
        SUCCESS["Breach Rate<br/>2/2 targets breached"]
    end

    subgraph LIKELIHOOD["Likelihood Tables"]
        L_APT["P(SCADA | APT) = 0.70"]
        L_SK["P(SCADA | Script Kiddie) = 0.30"]
    end

    subgraph PRIOR["Prior Beliefs"]
        P_APT["P(APT) = 0.50"]
        P_SK["P(SK) = 0.50"]
    end

    subgraph BAYES["Bayes' Theorem"]
        CALC["P(APT|obs) =<br/>P(obs|APT) × P(APT)<br/>─────────────────<br/>P(obs)"]
    end

    subgraph POSTERIOR["Updated Beliefs"]
        POST_APT["P(APT) = 0.70 ⬆"]
        POST_SK["P(SK) = 0.30 ⬇"]
    end

    OBS --> L_APT
    OBS --> L_SK
    SUCCESS --> CALC
    L_APT --> CALC
    L_SK --> CALC
    P_APT --> CALC
    P_SK --> CALC
    CALC --> POST_APT
    CALC --> POST_SK

    style ROUND_N fill:#1a0f0a,stroke:#f59e0b,color:#e2e8f0
    style LIKELIHOOD fill:#1a0d2e,stroke:#a78bfa,color:#e2e8f0
    style PRIOR fill:#0d1b2a,stroke:#06b6d4,color:#e2e8f0
    style BAYES fill:#0d1a1a,stroke:#34d399,color:#e2e8f0
    style POSTERIOR fill:#0a1a0a,stroke:#34d399,color:#e2e8f0
```

### Markov Chain — Attacker Strategy Evolution

```mermaid
stateDiagram-v2
    [*] --> SCADA : Initial State (random)
    
    SCADA --> SCADA : 0.40 (self-loop)
    SCADA --> Phishing : 0.25
    SCADA --> Firmware : 0.20
    SCADA --> Insider : 0.15

    Phishing --> SCADA : 0.15
    Phishing --> Phishing : 0.35 (self-loop)
    Phishing --> Firmware : 0.25
    Phishing --> Insider : 0.25

    Firmware --> SCADA : 0.20
    Firmware --> Phishing : 0.20
    Firmware --> Firmware : 0.40 (self-loop)
    Firmware --> Insider : 0.20

    Insider --> SCADA : 0.25
    Insider --> Phishing : 0.30
    Insider --> Firmware : 0.20
    Insider --> Insider : 0.25 (self-loop)
```

> **Reinforcement rule:** When an attack type succeeds (breaches a city), `M[current][current] += 0.05` and the row is renormalized. This makes the attacker more likely to repeat successful strategies — creating exploitable patterns for observant players.

### Cascade Failure — Network Topology

```mermaid
graph TD
    C0["🏛️ Capital Hub<br/>8.2M ★ Critical"]
    C1["📡 North Relay<br/>2.1M"]
    C2["🏙️ East Metro<br/>5.5M"]
    C3["⚓ Port City<br/>4.8M"]
    C4["🏭 South Works<br/>3.9M"]
    C5["🌄 West Valley<br/>2.7M"]
    C6["⛰️ Mountain Base<br/>1.5M"]
    C7["🌵 Desert Plant<br/>1.8M"]
    C8["🌊 River Station<br/>3.2M"]
    C9["🔆 Coastal Array<br/>2.4M"]
    C10["🌾 Plains Grid<br/>2.0M"]
    C11["💻 Tech District<br/>4.1M"]

    C0 --- C1
    C0 --- C2
    C0 --- C10
    C0 --- C11
    C0 --- C8
    C1 --- C6
    C1 --- C11
    C2 --- C3
    C2 --- C11
    C2 --- C9
    C3 --- C4
    C3 --- C9
    C4 --- C8
    C4 --- C7
    C5 --- C6
    C5 --- C10
    C5 --- C7
    C7 --- C10
    C8 --- C10

    style C0 fill:#06b6d4,stroke:#06b6d4,color:#000
    style C2 fill:#34d399,stroke:#34d399,color:#000
    style C3 fill:#34d399,stroke:#34d399,color:#000
    style C11 fill:#34d399,stroke:#34d399,color:#000
    style C4 fill:#f59e0b,stroke:#f59e0b,color:#000
    style C8 fill:#f59e0b,stroke:#f59e0b,color:#000
    style C1 fill:#64748b,stroke:#64748b,color:#fff
    style C5 fill:#64748b,stroke:#64748b,color:#fff
    style C6 fill:#64748b,stroke:#64748b,color:#fff
    style C7 fill:#64748b,stroke:#64748b,color:#fff
    style C9 fill:#64748b,stroke:#64748b,color:#fff
    style C10 fill:#64748b,stroke:#64748b,color:#fff
```

> **Cascade rule:** When a city goes offline, each of its **undefended neighbors** has a probability (15%–45% depending on difficulty) of overloading and going dark too. Capital Hub (5 connections) and East Metro (4 connections) are the highest-risk cascade nodes — losing them without neighbor protection can trigger a domino chain.

### Stackelberg Decision Tree

```mermaid
graph TD
    ROOT["🎮 Defender<br/>(Stackelberg Leader)<br/>Commits Defense Posture"]
    
    ROOT --> D1["Deploy Firewall<br/>to City X"]
    ROOT --> D2["Deploy IDS<br/>to City Y"]  
    ROOT --> D3["Deploy Air-Gap<br/>to City Z"]
    ROOT --> DN["... other allocations"]

    D1 --> OBS1["🕵️ Attacker Observes"]
    D2 --> OBS2["🕵️ Attacker Observes"]
    D3 --> OBS3["🕵️ Attacker Observes"]
    DN --> OBSN["🕵️ Attacker Observes"]

    OBS1 --> BR1["Best-Response:<br/>Target undefended cities<br/>with most connections"]
    OBS2 --> BR2["Best-Response:<br/>Use attack type where<br/>defense is weakest"]
    OBS3 --> BR3["Best-Response:<br/>Avoid air-gapped city,<br/>hit neighbors instead"]
    OBSN --> BRN["Best-Response:<br/>Maximize expected<br/>cascade damage"]

    BR1 --> PAY1["Payoff Resolution<br/>(Zero-Sum)"]
    BR2 --> PAY2["Payoff Resolution<br/>(Zero-Sum)"]
    BR3 --> PAY3["Payoff Resolution<br/>(Zero-Sum)"]
    BRN --> PAYN["Payoff Resolution<br/>(Zero-Sum)"]

    style ROOT fill:#06b6d4,stroke:#06b6d4,color:#000
    style OBS1 fill:#ef4444,stroke:#ef4444,color:#fff
    style OBS2 fill:#ef4444,stroke:#ef4444,color:#fff
    style OBS3 fill:#ef4444,stroke:#ef4444,color:#fff
    style OBSN fill:#ef4444,stroke:#ef4444,color:#fff
    style BR1 fill:#f59e0b,stroke:#f59e0b,color:#000
    style BR2 fill:#f59e0b,stroke:#f59e0b,color:#000
    style BR3 fill:#f59e0b,stroke:#f59e0b,color:#000
    style BRN fill:#f59e0b,stroke:#f59e0b,color:#000
    style PAY1 fill:#34d399,stroke:#34d399,color:#000
    style PAY2 fill:#34d399,stroke:#34d399,color:#000
    style PAY3 fill:#34d399,stroke:#34d399,color:#000
    style PAYN fill:#34d399,stroke:#34d399,color:#000
```

---

## 🏗️ Project Structure

```
Gridwars-powergrid-cyber-defense/
├── node_modules/             # Dependencies (auto-generated)
├── public/                   # Static assets
├── src/
│   ├── assets/               # Images, icons, static resources
│   ├── App.css               # Global app styles
│   ├── App.jsx               # Main game component (all game logic)
│   ├── index.css             # Root-level styles
│   └── main.jsx              # React entry point
├── .gitignore                # Git ignore rules
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package-lock.json         # Dependency lock file
├── package.json              # Project metadata & scripts
├── README.md                 # This file
└── vite.config.js            # Vite bundler configuration
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Bundler | Vite 5 |
| Frontend | React 18 (Functional Components + Hooks) |
| Animations | Hand-crafted SVG with frame-based animation |
| Styling | CSS-in-JS (co-located styles) |
| Game Engine | Custom state machine (Bayesian + Markov + Stackelberg) |
| Fonts | DM Sans + Sora (Google Fonts) |
| Linting | ESLint |

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

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Subhitcha04/Gridwars-powergrid-cyber-defense.git

# Navigate into the project
cd Gridwars-powergrid-cyber-defense

# Install dependencies
npm install

# Start the development server
npm run dev
```

App opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder — deploy it anywhere (Vercel, Netlify, GitHub Pages).

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
