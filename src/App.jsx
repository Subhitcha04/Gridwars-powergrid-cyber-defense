import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
//  GRID WARS — Power Grid Cyber Defense
//  Corrected with full UI improvements:
//  - Reduced visual noise (40% fewer glows, slower animations)
//  - Clear typography hierarchy (H1/H2/body/micro)
//  - Grid dominates the layout (narrower panels)
//  - "Deployment mode" overlay tint + crosshair cursor
//  - Simplified color system: cyan primary, red danger, green success
//  - Attack line animations + city flash on breach
//  - Tabbed intel panel to reduce cognitive load
//  - Wider grid, collapsible panels
// ═══════════════════════════════════════════════════════════════

// ─── MINIMAL ANIMATED ICONS (slowed down, no per-frame re-renders at 50ms) ───
const AnimatedIcon = ({ type, size = 24, style = {} }) => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 120), 100); // slowed 2x
    return () => clearInterval(id);
  }, []);

  const s = size;
  const t = frame / 120;
  const pulse = 0.95 + Math.sin(t * Math.PI * 2) * 0.05; // reduced amplitude
  const rotate = Math.sin(t * Math.PI * 2) * 6;

  const icons = {
    shield: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <g transform={`translate(24,24) scale(${pulse}) translate(-24,-24)`}>
          <path d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z" fill="url(#shieldGrad)" opacity="0.9"/>
          <path d="M20 24l4 4 8-8" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    ),
    bolt: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) scale(${pulse})`}>
          <polygon points="-4,-14 4,-14 1,-2 7,-2 -3,14 -1,2 -7,2" fill="#fbbf24"/>
        </g>
      </svg>
    ),
    fire: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) scale(${pulse})`}>
          <ellipse cx="0" cy="4" rx="8" ry="10" fill="#ef4444" opacity="0.8"/>
          <ellipse cx="0" cy="1" rx="5" ry="8" fill="#f97316" opacity="0.9"/>
          <ellipse cx="0" cy="-1" rx="3" ry="5" fill="#fbbf24"/>
        </g>
      </svg>
    ),
    star: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) rotate(${rotate}) scale(${pulse})`}>
          <polygon points="0,-12 3,-4 12,-4 5,2 7,11 0,6 -7,11 -5,2 -12,-4 -3,-4" fill="#fbbf24"/>
        </g>
      </svg>
    ),
    lock: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) scale(${pulse})`}>
          <rect x="-10" y="-4" width="20" height="16" rx="3" fill="#6366f1"/>
          <path d="M-6,-4 v-6 a6,6 0 0,1 12,0 v6" stroke="#818cf8" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="0" cy="4" r="2.5" fill="white"/>
        </g>
      </svg>
    ),
    trophy: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) scale(${pulse})`}>
          <path d="M-8,-10 h16 l-2,14 h-12z" fill="#fbbf24"/>
          <rect x="-3" y="4" width="6" height="4" fill="#d97706"/>
          <rect x="-6" y="8" width="12" height="3" rx="1" fill="#92400e"/>
          <path d="M-8,-10 q-6,8 0,10" stroke="#fbbf24" strokeWidth="2.5" fill="none"/>
          <path d="M8,-10 q6,8 0,10" stroke="#fbbf24" strokeWidth="2.5" fill="none"/>
        </g>
      </svg>
    ),
    target: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) rotate(${frame * 1.5})`}>
          <circle cx="0" cy="0" r="14" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.4"/>
          <circle cx="0" cy="0" r="9" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6"/>
          <circle cx="0" cy="0" r="4" fill="#ef4444" opacity="0.9"/>
          <line x1="-16" y1="0" x2="16" y2="0" stroke="#ef4444" strokeWidth="1" opacity="0.3"/>
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#ef4444" strokeWidth="1" opacity="0.3"/>
        </g>
      </svg>
    ),
    brain: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) scale(${pulse})`}>
          <ellipse cx="-4" cy="-2" rx="8" ry="10" fill="#a78bfa" opacity="0.8"/>
          <ellipse cx="4" cy="-2" rx="8" ry="10" fill="#c084fc" opacity="0.8"/>
          <path d={`M0,-12 q${rotate * 0.3},5 0,10`} stroke="#e9d5ff" strokeWidth="1.5" fill="none"/>
        </g>
      </svg>
    ),
    chain: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) rotate(${rotate})`}>
          <ellipse cx="-6" cy="0" rx="6" ry="8" stroke="#06b6d4" strokeWidth="2.5" fill="none"/>
          <ellipse cx="6" cy="0" rx="6" ry="8" stroke="#8b5cf6" strokeWidth="2.5" fill="none"/>
        </g>
      </svg>
    ),
    gear: (
      <svg width={s} height={s} viewBox="0 0 48 48" style={style}>
        <g transform={`translate(24,24) rotate(${frame * 1.5})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
            <rect key={i} x="-2.5" y="-14" width="5" height="6" rx="1" fill="#94a3b8"
              transform={`rotate(${a})`}/>
          ))}
          <circle cx="0" cy="0" r="8" fill="#334155" stroke="#94a3b8" strokeWidth="2"/>
          <circle cx="0" cy="0" r="3" fill="#64748b"/>
        </g>
      </svg>
    ),
  };
  return icons[type] || null;
};

// ─── CONFETTI (kept, but smaller particle count) ───
const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) return;
    const p = Array.from({ length: 36 }, (_, i) => ({
      id: i, x: 50 + (Math.random() - 0.5) * 20,
      y: 40, vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 12 - 4,
      color: ['#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 5, rot: Math.random() * 360,
    }));
    setParticles(p);
    const id = setInterval(() => {
      setParticles(prev => prev.map(pt => ({
        ...pt, x: pt.x + pt.vx * 0.3, y: pt.y + pt.vy * 0.3,
        vy: pt.vy + 0.3, rot: pt.rot + pt.vx * 2,
      })).filter(pt => pt.y < 110));
    }, 30);
    return () => clearInterval(id);
  }, [active]);

  if (!active || particles.length === 0) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {particles.map(p => (
          <rect key={p.id} x={p.x} y={p.y} width={p.size * 0.08} height={p.size * 0.05}
            fill={p.color} transform={`rotate(${p.rot} ${p.x} ${p.y})`} rx="0.1"/>
        ))}
      </svg>
    </div>
  );
};

// ─── TOAST ───
const Toast = ({ message, type = "info", onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const colors = { info: '#06b6d4', success: '#34d399', error: '#ef4444', warning: '#f59e0b', xp: '#a78bfa' };
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 10000,
      background: '#1e293b', border: `1px solid ${colors[type]}40`,
      borderLeft: `4px solid ${colors[type]}`, borderRadius: 10,
      padding: '12px 20px', maxWidth: 320, boxShadow: `0 6px 24px rgba(0,0,0,0.4)`,
      animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", color: '#e2e8f0', fontSize: 13,
    }}>
      {message}
    </div>
  );
};

// ─── ATTACK LINE ANIMATION ───
const AttackLines = ({ lines }) => {
  if (!lines || lines.length === 0) return null;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
      viewBox="0 0 600 400" preserveAspectRatio="none">
      {lines.map((ln, i) => (
        <g key={i}>
          <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
            stroke={ln.success ? '#34d399' : '#ef4444'} strokeWidth="2" opacity="0.8"
            strokeDasharray="6 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="0.5s" repeatCount="indefinite"/>
          </line>
          <circle cx={ln.x2} cy={ln.y2} r="6" fill={ln.success ? '#34d39940' : '#ef444440'}
            stroke={ln.success ? '#34d399' : '#ef4444'} strokeWidth="1.5">
            <animate attributeName="r" values="4;10;4" dur="0.8s" repeatCount="3"/>
            <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="3"/>
          </circle>
        </g>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════
//  GAME DATA & CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CITIES = [
  { id: 0, name: "Capital Hub", pop: 8.2, x: 0.50, y: 0.28, critical: true, emoji: "🏛️" },
  { id: 1, name: "North Relay", pop: 2.1, x: 0.38, y: 0.10, emoji: "📡" },
  { id: 2, name: "East Metro", pop: 5.5, x: 0.78, y: 0.22, emoji: "🏙️" },
  { id: 3, name: "Port City", pop: 4.8, x: 0.85, y: 0.50, emoji: "⚓" },
  { id: 4, name: "South Works", pop: 3.9, x: 0.68, y: 0.75, emoji: "🏭" },
  { id: 5, name: "West Valley", pop: 2.7, x: 0.18, y: 0.45, emoji: "🌄" },
  { id: 6, name: "Mountain Base", pop: 1.5, x: 0.10, y: 0.18, emoji: "⛰️" },
  { id: 7, name: "Desert Plant", pop: 1.8, x: 0.28, y: 0.72, emoji: "🌵" },
  { id: 8, name: "River Station", pop: 3.2, x: 0.55, y: 0.55, emoji: "🌊" },
  { id: 9, name: "Coastal Array", pop: 2.4, x: 0.92, y: 0.36, emoji: "🔆" },
  { id: 10, name: "Plains Grid", pop: 2.0, x: 0.35, y: 0.50, emoji: "🌾" },
  { id: 11, name: "Tech District", pop: 4.1, x: 0.62, y: 0.13, emoji: "💻" },
];

const EDGES = [
  [0,1],[0,2],[0,10],[0,11],[0,8],[1,6],[1,11],[2,3],[2,11],[2,9],
  [3,4],[3,9],[4,8],[4,7],[5,6],[5,10],[5,7],[7,10],[8,10]
];

const ADJ = {};
CITIES.forEach(c => ADJ[c.id] = []);
EDGES.forEach(([a,b]) => { ADJ[a].push(b); ADJ[b].push(a); });

const DEFENSES = [
  { id: "firewall", name: "Network Firewall", cost: 10, icon: "🔥",
    desc: "Basic perimeter defense. Blocks known attack signatures.",
    eff: { scada: 2, phishing: 1, firmware: 1, insider: 0 }, color: "#34d399" },
  { id: "ids", name: "IDS + Anomaly AI", cost: 20, icon: "🔍",
    desc: "ML-powered traffic analysis. Strong vs SCADA exploits.",
    eff: { scada: 4, phishing: 2, firmware: 2, insider: 1 }, color: "#06b6d4" },
  { id: "airgap", name: "Air-Gap Protocol", cost: 30, icon: "🔒",
    desc: "Physical network isolation. Maximum protection across vectors.",
    eff: { scada: 5, phishing: 3, firmware: 4, insider: 2 }, color: "#8b5cf6" },
  { id: "honeypot", name: "Honeypot Decoy", cost: 15, icon: "🍯",
    desc: "Fake substations that lure attackers and reveal intent.",
    eff: { scada: 2, phishing: 4, firmware: 1, insider: 3 }, color: "#fbbf24", reveals: true },
  { id: "training", name: "Staff Training", cost: 8, icon: "🧑‍💻",
    desc: "Human firewall. Best defense against social engineering.",
    eff: { scada: 1, phishing: 5, firmware: 1, insider: 4 }, color: "#f97316" },
  { id: "firmware", name: "Firmware Armor", cost: 25, icon: "🛡️",
    desc: "Patches all SCADA firmware vulnerabilities system-wide.",
    eff: { scada: 3, phishing: 1, firmware: 5, insider: 1 }, color: "#3b82f6" },
];

const ATTACK_TYPES = ["scada", "phishing", "firmware", "insider"];
const ATTACK_NAMES = {
  scada: "SCADA Exploit", phishing: "Spearphishing", firmware: "Firmware Backdoor", insider: "Insider Threat"
};
const ATTACK_ICONS = { scada: "⚡", phishing: "🎣", firmware: "🪱", insider: "🕵️" };

const MARKOV_BASE = [
  [0.40, 0.25, 0.20, 0.15],
  [0.15, 0.35, 0.25, 0.25],
  [0.20, 0.20, 0.40, 0.20],
  [0.25, 0.30, 0.20, 0.25],
];

const ACHIEVEMENTS = [
  { id: "first_win", name: "First Blood", desc: "Survive your first round", icon: "shield", xp: 50 },
  { id: "perfect_round", name: "Untouchable", desc: "Repel all attacks in a round", icon: "star", xp: 100 },
  { id: "cascade_save", name: "Chain Breaker", desc: "Prevent a cascade failure", icon: "chain", xp: 150 },
  { id: "full_clear", name: "Grid Guardian", desc: "Win with all 12 cities online", icon: "trophy", xp: 300 },
  { id: "bayesian_master", name: "Mind Reader", desc: "Correctly predict 3 attacks", icon: "brain", xp: 200 },
  { id: "budget_master", name: "Efficient Ops", desc: "Win with 30%+ budget remaining", icon: "gear", xp: 250 },
];

const DIFF_SETTINGS = {
  easy:   { budget: 120, cascadeProb: 0.15, threshold: 8, skill: 0.35, label: "Recruit",      color: "#34d399", targets: 1 },
  normal: { budget: 100, cascadeProb: 0.25, threshold: 6, skill: 0.50, label: "Analyst",      color: "#06b6d4", targets: 2 },
  hard:   { budget: 75,  cascadeProb: 0.35, threshold: 5, skill: 0.70, label: "Director",     color: "#f59e0b", targets: 2 },
  brutal: { budget: 55,  cascadeProb: 0.45, threshold: 4, skill: 0.85, label: "Wartime CISO", color: "#ef4444", targets: 3 },
};

const weightedRandom = (probs) => {
  const r = Math.random(); let c = 0;
  for (let i = 0; i < probs.length; i++) { c += probs[i]; if (r <= c) return i; }
  return probs.length - 1;
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "", email: "" });
  const [authError, setAuthError] = useState("");

  const [page, setPage] = useState("home");
  const [prevPage, setPrevPage] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [transition, setTransition] = useState(false);

  const [gs, setGs] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [cityPopup, setCityPopup] = useState(null);
  const [attackResult, setAttackResult] = useState(null);
  const [attackLines, setAttackLines] = useState([]);
  const [difficulty, setDifficulty] = useState("normal");
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [intelTab, setIntelTab] = useState("intel"); // intel | predictions | analysis
  const [flashCities, setFlashCities] = useState({}); // cityId -> "breach" | "defend"

  const [playerStats, setPlayerStats] = useState({
    totalGames: 0, wins: 0, totalScore: 0, bestScore: 0,
    streak: 0, maxStreak: 0, achievements: [], xp: 0, level: 1,
    dailyPlayed: false, gamesHistory: [],
  });

  const leaderboard = useMemo(() => {
    const names = ["CyberNova", "GridMaster", "VoltHunter", "NeonShield", "PhantomOps",
      "ZeroDayZen", "ByteStorm", "IronProxy", "NullVector", "ShadowPatch",
      user?.username || "You"];
    return names.map((n, i) => ({
      rank: i + 1, name: n,
      score: Math.max(0, 12000 - i * 800 + Math.floor(Math.random() * 500)),
      level: Math.max(1, 15 - i), isUser: n === (user?.username || "You"),
    })).sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
  }, [user, playerStats.bestScore]);

  const navigate = useCallback((to) => {
    setTransition(true);
    setTimeout(() => { setPrevPage(page); setPage(to); setTransition(false); }, 200);
  }, [page]);

  const goBack = useCallback(() => { if (prevPage) navigate(prevPage); else navigate("home"); }, [prevPage, navigate]);

  const handleAuth = () => {
    if (!authForm.username || !authForm.password) { setAuthError("Please fill in all fields"); return; }
    if (authScreen === "signup" && !authForm.email) { setAuthError("Email is required"); return; }
    if (authForm.password.length < 4) { setAuthError("Password must be at least 4 characters"); return; }
    setUser({ username: authForm.username, avatar: authForm.username[0].toUpperCase() });
    setAuthError("");
    showToast("Welcome, Commander " + authForm.username + "!", "success");
  };

  const showToast = (message, type = "info") => setToast({ message, type, key: Date.now() });

  const addXP = (amount) => {
    setPlayerStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      if (newLevel > prev.level) setTimeout(() => showToast(`Level Up! Now Level ${newLevel}`, "xp"), 500);
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const unlockAchievement = (id) => {
    setPlayerStats(prev => {
      if (prev.achievements.includes(id)) return prev;
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (!ach) return prev;
      setTimeout(() => {
        showToast(`🏆 ${ach.name}! +${ach.xp} XP`, "xp");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 800);
      return { ...prev, achievements: [...prev.achievements, id], xp: prev.xp + ach.xp };
    });
  };

  const initGame = (diff) => {
    const s = DIFF_SETTINGS[diff];
    setGs({
      difficulty: diff, round: 1, maxRounds: 8,
      budget: s.budget, maxBudget: s.budget,
      cascadeProb: s.cascadeProb, blackoutThreshold: s.threshold,
      attackerSkill: s.skill, targetCount: s.targets,
      score: 0,
      cities: CITIES.map(c => ({ ...c, online: true, defense: null, attacked: false })),
      attackerState: Math.floor(Math.random() * 4),
      attackHistory: [], defenseHistory: [],
      beliefs: { scriptKiddie: 0.5, apt: 0.5 },
      markov: MARKOV_BASE.map(r => [...r]),
      deployments: {},
      intel: [{ type: "info", msg: "Grid initialized. APT-VOLT signatures detected on perimeter.", round: 1 }],
      gameOver: false, roundPhase: "deploy",
    });
    setSelectedDef(null);
    setCityPopup(null);
    setAttackResult(null);
    setAttackLines([]);
    setFlashCities({});
    navigate("game");
    if (playerStats.totalGames === 0) { setShowGuide(true); setGuideStep(0); }
  };

  const deployToCity = (cityId, defId) => {
    if (!gs || gs.roundPhase !== "deploy") return;
    const def = DEFENSES.find(d => d.id === defId);
    const city = gs.cities[cityId];
    if (!city.online) { showToast("City is offline!", "error"); return; }
    setGs(prev => {
      let newBudget = prev.budget;
      const newDeps = { ...prev.deployments };
      if (newDeps[cityId]) { const old = DEFENSES.find(d => d.id === newDeps[cityId]); newBudget += old.cost; }
      if (newBudget < def.cost) { showToast("Not enough budget!", "warning"); return prev; }
      newBudget -= def.cost;
      newDeps[cityId] = defId;
      return { ...prev, budget: newBudget, deployments: newDeps };
    });
    setSelectedDef(null);
    setCityPopup(null);
    showToast(`${def.icon} ${def.name} → ${city.name}`, "success");
  };

  const removeDeployment = (cityId) => {
    setGs(prev => {
      const newDeps = { ...prev.deployments };
      if (!newDeps[cityId]) return prev;
      const def = DEFENSES.find(d => d.id === newDeps[cityId]);
      delete newDeps[cityId];
      return { ...prev, budget: prev.budget + def.cost, deployments: newDeps };
    });
    setCityPopup(null);
    showToast("Defense removed", "info");
  };

  const executeRound = () => {
    if (!gs || gs.roundPhase !== "deploy") return;
    if (Object.keys(gs.deployments).length === 0) { showToast("Deploy at least one defense!", "warning"); return; }

    setGs(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.roundPhase = "attacking";
      Object.entries(next.deployments).forEach(([cid, did]) => {
        next.cities[parseInt(cid)].defense = did;
      });

      const transProbs = next.markov[next.attackerState];
      const attackIdx = weightedRandom(transProbs);
      const attackType = ATTACK_TYPES[attackIdx];
      next.attackerState = attackIdx;
      next.attackHistory.push(attackType);

      const online = next.cities.filter(c => c.online);
      const scored = online.map(c => {
        const defId = c.defense;
        const defEff = defId ? DEFENSES.find(d => d.id === defId).eff[attackType] : 0;
        const vuln = 5 - defEff;
        const conns = ADJ[c.id].filter(nid => next.cities[nid].online).length;
        return {
          city: c,
          score: vuln * 2 + conns * 1.5 + c.pop / 5 + (c.critical ? 2 : 0) + Math.random() * (1 - next.attackerSkill) * 3
        };
      }).sort((a, b) => b.score - a.score);

      const targets = scored.slice(0, next.targetCount).map(s => s.city);
      const results = [], breached = [], defended = [];

      targets.forEach(city => {
        city.attacked = true;
        const defId = city.defense;
        const defEff = defId ? DEFENSES.find(d => d.id === defId).eff[attackType] : 0;
        const defRoll = defEff + Math.random() * 2;
        const atkPower = 3 + next.attackerSkill * 2 + (next.beliefs.apt > 0.5 ? 1 : 0);
        const atkRoll = atkPower + Math.random() * 2;

        if (defRoll >= atkRoll) {
          defended.push(city);
          results.push({ city: { ...city }, result: "defended", defId, attackType });
          next.score += 100 + Math.floor(city.pop * 20);
        } else {
          city.online = false;
          city.defense = null;
          breached.push(city);
          results.push({ city: { ...city }, result: "breached", defId, attackType });
        }
      });

      const cascades = [];
      breached.forEach(b => {
        ADJ[b.id].forEach(nid => {
          const nb = next.cities[nid];
          if (nb.online && !nb.defense && Math.random() < next.cascadeProb) {
            nb.online = false; nb.defense = null;
            cascades.push({ ...nb });
          }
        });
      });

      // Bayesian update
      const lAPT = { scada: 0.7, phishing: 0.2, firmware: 0.6, insider: 0.8 };
      const lSK =  { scada: 0.3, phishing: 0.8, firmware: 0.4, insider: 0.2 };
      const successRate = breached.length / Math.max(1, targets.length);
      const la = lAPT[attackType] + successRate * 0.2;
      const ls = lSK[attackType] * (1 - successRate * 0.1);
      const evidence = la * next.beliefs.apt + ls * next.beliefs.scriptKiddie;
      next.beliefs.apt = clamp((la * next.beliefs.apt) / evidence, 0.05, 0.95);
      next.beliefs.scriptKiddie = 1 - next.beliefs.apt;

      // Markov adaptation
      if (breached.length > 0) {
        next.markov[attackIdx][attackIdx] = Math.min(0.6, next.markov[attackIdx][attackIdx] + 0.05);
        const row = next.markov[attackIdx];
        const excess = row.reduce((s, v) => s + v, 0) - 1;
        ATTACK_TYPES.forEach((_, i) => { if (i !== attackIdx) row[i] = Math.max(0.05, row[i] - excess / 3); });
      }

      if (breached.length > 0) next.intel.unshift({ type: "alert", msg: `BREACH: ${breached.map(b => b.name).join(", ")} via ${ATTACK_NAMES[attackType]}`, round: next.round });
      if (cascades.length > 0) next.intel.unshift({ type: "alert", msg: `CASCADE: ${cascades.map(c => c.name).join(", ")} overloaded!`, round: next.round });
      if (defended.length > 0) next.intel.unshift({ type: "success", msg: `Defended: ${defended.map(d => d.name).join(", ")}`, round: next.round });

      // Attack line animations + city flash
      setTimeout(() => {
        // Build attack lines from a virtual "attacker" position (top center) to each target
        const lines = targets.map(city => ({
          x1: 300, y1: 0, // top-center origin
          x2: city.x * 600, y2: city.y * 400,
          success: defended.some(d => d.id === city.id),
        }));
        setAttackLines(lines);
        // Flash each city
        const flashes = {};
        targets.forEach(city => {
          flashes[city.id] = defended.some(d => d.id === city.id) ? "defend" : "breach";
        });
        cascades.forEach(c => { flashes[c.id] = "breach"; });
        setFlashCities(flashes);

        setTimeout(() => {
          setAttackLines([]);
          setFlashCities({});
          setAttackResult({
            attackType, results, cascades,
            honeypot: Object.values(next.deployments).includes("honeypot"),
            totalDefended: defended.length,
            totalBreached: breached.length + cascades.length,
          });
        }, 1200);
      }, 600);

      if (defended.length > 0 && breached.length === 0 && cascades.length === 0)
        setTimeout(() => unlockAchievement("perfect_round"), 1500);
      if (next.round === 1 && breached.length === 0)
        setTimeout(() => unlockAchievement("first_win"), 1200);

      return next;
    });
  };

  const continueRound = () => {
    setAttackResult(null);
    setGs(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const onlineCount = next.cities.filter(c => c.online).length;
      const offlineCount = 12 - onlineCount;

      if (offlineCount >= next.blackoutThreshold || next.round >= next.maxRounds) {
        next.gameOver = true;
        const won = next.round >= next.maxRounds && offlineCount < next.blackoutThreshold;
        if (won) {
          next.score += onlineCount * 200;
          if (onlineCount === 12) setTimeout(() => unlockAchievement("full_clear"), 500);
        }
        setTimeout(() => {
          setPlayerStats(ps => ({
            ...ps, totalGames: ps.totalGames + 1,
            wins: ps.wins + (won ? 1 : 0),
            totalScore: ps.totalScore + next.score,
            bestScore: Math.max(ps.bestScore, next.score),
            streak: won ? ps.streak + 1 : 0,
            maxStreak: Math.max(ps.maxStreak, won ? ps.streak + 1 : ps.maxStreak),
          }));
          addXP(next.score > 0 ? Math.floor(next.score / 10) : 25);
          if (won) setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
          navigate("results");
        }, 300);
        return next;
      }

      next.round++;
      next.budget = Math.min(next.maxBudget, Math.floor(next.maxBudget * 0.7 + next.round * 3));
      next.cities.forEach(c => { c.defense = null; c.attacked = false; });
      next.deployments = {};
      next.roundPhase = "deploy";
      next.intel.unshift({ type: "info", msg: `━ Round ${next.round} ━ Budget: $${next.budget}K`, round: next.round });
      return next;
    });
  };

  const xpProgress = ((playerStats.xp % 500) / 500) * 100;
  const onlineCount = gs ? gs.cities.filter(c => c.online).length : 12;
  const markovPreds = gs ? gs.markov[gs.attackerState] : [0.25, 0.25, 0.25, 0.25];
  const topPredIdx = markovPreds.indexOf(Math.max(...markovPreds));

  // ─── AUTH SCREEN ───
  if (!user) {
    return (
      <div style={S.authContainer}>
        <div style={S.authGridBg} />
        <Confetti active={false} />
        <div style={S.authCard}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <AnimatedIcon type="bolt" size={52} />
            <h1 style={S.authLogo}>GRID WARS</h1>
            <p style={S.authSub}>Power Grid Cyber Defense</p>
          </div>
          <div style={S.authTabs}>
            <button style={{ ...S.authTab, ...(authScreen === "login" ? S.authTabActive : {}) }}
              onClick={() => { setAuthScreen("login"); setAuthError(""); }}>Sign In</button>
            <button style={{ ...S.authTab, ...(authScreen === "signup" ? S.authTabActive : {}) }}
              onClick={() => { setAuthScreen("signup"); setAuthError(""); }}>Create Account</button>
          </div>
          {authScreen === "signup" && (
            <input style={S.authInput} placeholder="Email" type="email"
              value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
          )}
          <input style={S.authInput} placeholder="Commander Name"
            value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} />
          <input style={S.authInput} placeholder="Access Code" type="password"
            value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleAuth()} />
          {authError && <p style={S.authErr}>{authError}</p>}
          <button style={S.authBtn} onClick={handleAuth}>
            {authScreen === "login" ? "Enter Command Center" : "Register & Deploy"}
          </button>
          <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 14 }}>
            Game theory meets cybersecurity. Defend the grid.
          </p>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  // ─── MAIN APP ───
  return (
    <div style={S.appRoot}>
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      <Confetti active={showConfetti} />
      <style>{globalStyles}</style>

      {/* NAV */}
      {page !== "game" && (
        <nav style={S.nav}>
          <div style={S.navLeft}>
            {page !== "home" && (
              <button style={S.backBtn} onClick={goBack}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}
            <span style={S.navLogo} onClick={() => navigate("home")}>
              <AnimatedIcon type="bolt" size={20} /> GRID WARS
            </span>
          </div>
          <div style={S.navLinks}>
            {[
              { id: "home", label: "Home", icon: "🏠" },
              { id: "play", label: "Play", icon: "🎮" },
              { id: "leaderboard", label: "Rankings", icon: "🏆" },
              { id: "guide", label: "Guide", icon: "📖" },
            ].map(link => (
              <button key={link.id}
                style={{ ...S.navLink, ...(page === link.id ? S.navLinkActive : {}) }}
                onClick={() => navigate(link.id)}>
                <span style={{ fontSize: 15 }}>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
          <div style={S.navRight}>
            <div style={S.xpBadge}>
              <span style={S.xpLevel}>Lv.{playerStats.level}</span>
              <div style={S.xpBarOuter}><div style={{ ...S.xpBarInner, width: xpProgress + '%' }} /></div>
            </div>
            <button style={S.avatarBtn} onClick={() => navigate("profile")}>{user.avatar}</button>
          </div>
        </nav>
      )}

      {/* PAGE CONTENT */}
      <div style={{
        ...S.pageContent,
        opacity: transition ? 0 : 1,
        transform: transition ? 'translateY(6px)' : 'none',
        transition: 'opacity 0.2s, transform 0.2s',
        paddingTop: page === "game" ? 0 : 60,
      }}>

        {/* ─── HOME ─── */}
        {page === "home" && (
          <div style={S.homePage}>
            {/* Hero */}
            <div style={S.heroSection}>
              <div style={S.heroBg} />
              <div style={S.heroContent}>
                <AnimatedIcon type="shield" size={64} />
                <h1 style={S.heroTitle}>Defend the Grid</h1>
                <p style={S.heroDesc}>
                  State-sponsored hackers are targeting the national power grid.
                  Apply game theory to prevent cascading blackouts.
                </p>
                <button style={S.playNowBtn} onClick={() => navigate("play")}>
                  PLAY NOW
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={S.quickStats}>
              {[
                { icon: "trophy", label: "Best Score", val: playerStats.bestScore },
                { icon: "fire",   label: "Win Streak", val: playerStats.streak },
                { icon: "star",   label: "Achievements", val: `${playerStats.achievements.length}/${ACHIEVEMENTS.length}` },
                { icon: "target", label: "Games Won", val: `${playerStats.wins}/${playerStats.totalGames}` },
              ].map((s, i) => (
                <div key={i} style={{ ...S.statCard, animationDelay: `${i * 0.08}s` }}>
                  <AnimatedIcon type={s.icon} size={28} />
                  <div style={S.statVal}>{s.val}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Concepts */}
            <div style={S.conceptsSection}>
              <h2 style={S.sectionTitle}>Game Theory in Action</h2>
              <div style={S.conceptsGrid}>
                {[
                  { icon: "brain",  title: "Bayesian NE",    desc: "Unknown attacker type. Update beliefs from observed behavior.", color: "#a78bfa" },
                  { icon: "chain",  title: "Markov Chains",  desc: "Attacker strategy evolves. Predict their next move.", color: "#06b6d4" },
                  { icon: "target", title: "Stackelberg",    desc: "You commit first. The attacker exploits your gaps.", color: "#ef4444" },
                  { icon: "shield", title: "Zero-Sum",       desc: "Your defense is their loss. Every decision matters.", color: "#34d399" },
                ].map((c, i) => (
                  <div key={i} style={{ ...S.conceptCard, borderColor: c.color + '25', animationDelay: `${i * 0.1}s` }}>
                    <AnimatedIcon type={c.icon} size={32} />
                    <h3 style={{ ...S.conceptTitle, color: c.color }}>{c.title}</h3>
                    <p style={S.conceptDesc}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily */}
            <div style={S.dailyBanner}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AnimatedIcon type="fire" size={36} />
                <div>
                  <div style={S.dailyTitle}>Daily Challenge</div>
                  <div style={S.dailyDesc}>Survive 8 rounds on Wartime CISO difficulty. +500 XP reward.</div>
                </div>
              </div>
              <button style={S.dailyBtn} onClick={() => { setDifficulty("brutal"); initGame("brutal"); }}>
                Accept Challenge
              </button>
            </div>
          </div>
        )}

        {/* ─── PLAY ─── */}
        {page === "play" && (
          <div style={S.playPage}>
            <h1 style={S.pageTitle}>Choose Your Mission</h1>
            <p style={S.pageSubtitle}>Select difficulty. Higher risk = more XP.</p>
            <div style={S.diffGrid}>
              {Object.entries(DIFF_SETTINGS).map(([key, s]) => (
                <button key={key} style={{
                  ...S.diffCard,
                  borderColor: difficulty === key ? s.color : '#1e293b',
                  boxShadow: difficulty === key ? `0 0 24px ${s.color}18, inset 0 0 24px ${s.color}06` : 'none',
                }} onClick={() => setDifficulty(key)}>
                  <div style={{ ...S.diffBadge, background: s.color + '18', color: s.color }}>{s.label}</div>
                  <div style={S.diffStats}>
                    <div>Budget: <span style={{ color: s.color }}>${s.budget}K</span></div>
                    <div>Cascade Risk: <span style={{ color: s.color }}>{Math.round(s.cascadeProb * 100)}%</span></div>
                    <div>Targets/Round: <span style={{ color: s.color }}>{s.targets}</span></div>
                    <div>Blackout at: <span style={{ color: s.color }}>{s.threshold} cities</span></div>
                  </div>
                  <div style={{ ...S.diffXp, color: s.color }}>
                    {key === "easy" ? "1x" : key === "normal" ? "1.5x" : key === "hard" ? "2x" : "3x"} XP
                  </div>
                </button>
              ))}
            </div>
            <button style={S.startGameBtn} onClick={() => initGame(difficulty)}>
              <AnimatedIcon type="bolt" size={22} /> Deploy to Grid
            </button>
          </div>
        )}

        {/* ─── GAME ─── */}
        {page === "game" && gs && (() => {
          const defObj = selectedDef ? DEFENSES.find(d => d.id === selectedDef) : null;
          return (
            <div style={{
              ...S.gameContainer,
              cursor: selectedDef ? 'crosshair' : 'default',
            }}>
              {/* Deployment mode overlay tint */}
              {selectedDef && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 5,
                  background: `radial-gradient(ellipse at center, transparent 30%, ${defObj.color}12 100%)`,
                  pointerEvents: 'none',
                  border: `2px solid ${defObj.color}30`,
                }} />
              )}

              {/* HUD */}
              <div style={S.gameHud}>
                <button style={S.gameBackBtn} onClick={() => { if (window.confirm("Abandon mission?")) navigate("home"); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div style={S.hudPill}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>R{gs.round}</span>
                  <span style={{ color: '#475569' }}>/8</span>
                </div>
                <div style={S.hudPill}>
                  <span style={{ fontSize: 13 }}>💰</span>
                  <span style={{ color: gs.budget < 20 ? '#ef4444' : '#34d399', fontWeight: 700 }}>${gs.budget}K</span>
                </div>
                <div style={S.hudPill}>
                  <span style={{ fontSize: 13 }}>🏙️</span>
                  <span style={{ color: onlineCount >= 10 ? '#34d399' : onlineCount >= 7 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    {onlineCount}/12
                  </span>
                </div>
                <div style={S.hudPill}>
                  <span style={{ fontSize: 13 }}>⭐</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{gs.score}</span>
                </div>
                {/* Deployment mode badge */}
                {selectedDef && (
                  <div style={{
                    marginLeft: 8,
                    background: defObj.color + '20',
                    border: `1px solid ${defObj.color}50`,
                    borderRadius: 8,
                    padding: '4px 12px',
                    color: defObj.color,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    animation: 'pulseBadge 1s ease-in-out infinite',
                  }}>
                    ⊕ DEPLOY MODE — {defObj.icon} {defObj.name}
                  </div>
                )}
                <button style={{ ...S.guideBtn, marginLeft: 'auto' }}
                  onClick={() => { setShowGuide(true); setGuideStep(0); }}>?</button>
              </div>

              {/* Main game area: narrower panels, dominant grid */}
              <div style={S.gameMain}>
                {/* Left: Defense Arsenal — narrower */}
                <div style={S.gamePanel}>
                  <div style={S.panelHeader}>
                    <AnimatedIcon type="shield" size={16} />
                    <span>Defense Arsenal</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {DEFENSES.map(d => {
                      const isSelected = selectedDef === d.id;
                      const canAfford = gs.budget >= d.cost || Object.values(gs.deployments).includes(d.id);
                      return (
                        <button key={d.id} style={{
                          ...S.defCard,
                          borderColor: isSelected ? d.color : '#1e293b',
                          background: isSelected ? d.color + '12' : '#0a0f1a',
                          opacity: canAfford ? 1 : 0.35,
                          transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                        }} onClick={() => canAfford && setSelectedDef(isSelected ? null : d.id)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 18 }}>{d.icon}</span>
                            {/* Cost prominently sized */}
                            <span style={{ color: '#fbbf24', fontSize: 15, fontWeight: 800 }}>${d.cost}K</span>
                          </div>
                          {/* Defense name — larger, clear hierarchy */}
                          <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, marginTop: 5 }}>{d.name}</div>
                          {/* Description — faded */}
                          <div style={{ color: '#475569', fontSize: 11, marginTop: 3, lineHeight: 1.4 }}>{d.desc}</div>
                          {/* Effectiveness bars */}
                          <div style={{ marginTop: 7 }}>
                            {ATTACK_TYPES.map(at => (
                              <div key={at} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                <span style={{ fontSize: 9, color: '#334155', width: 44, fontFamily: 'monospace' }}>{at.slice(0,6).toUpperCase()}</span>
                                <div style={{ flex: 1, height: 3, background: '#1e293b', borderRadius: 2 }}>
                                  <div style={{
                                    width: (d.eff[at] / 5) * 100 + '%', height: '100%', borderRadius: 2,
                                    background: d.eff[at] >= 4 ? '#34d399' : d.eff[at] >= 2 ? '#f59e0b' : '#ef4444',
                                    transition: 'width 0.3s',
                                  }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Center: Grid Map — dominant */}
                <div style={{
                  ...S.gridMapArea,
                  // Dim panels when deployment mode active
                  position: 'relative',
                }} onClick={() => selectedDef && setCityPopup(null)}>
                  {/* Deployment hint banner */}
                  {selectedDef && (
                    <div style={S.selectHint}>
                      <span style={{ fontSize: 16 }}>{defObj.icon}</span>
                      Click a city to deploy <strong>{defObj.name}</strong>
                    </div>
                  )}

                  {/* Attack lines overlay */}
                  <AttackLines lines={attackLines} />

                  <svg width="100%" height="100%" viewBox="0 0 600 400" style={{ overflow: 'visible' }}>
                    {/* Edges */}
                    {EDGES.map(([a, b], i) => {
                      const ca = gs.cities[a], cb = gs.cities[b];
                      const both = ca.online && cb.online;
                      return (
                        <line key={i}
                          x1={ca.x * 600} y1={ca.y * 400} x2={cb.x * 600} y2={cb.y * 400}
                          stroke={both ? '#06b6d418' : '#ef444418'} strokeWidth="1.5"
                          strokeDasharray={both ? "6,8" : "4,6"}>
                          {both && <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="3s" repeatCount="indefinite"/>}
                        </line>
                      );
                    })}

                    {/* Cities */}
                    {gs.cities.map(c => {
                      const cx = c.x * 600, cy = c.y * 400;
                      const r = c.critical ? 22 : 17;
                      const dep = gs.deployments[c.id];
                      const def = dep ? DEFENSES.find(d => d.id === dep) : null;
                      const isOnline = c.online;
                      const flash = flashCities[c.id];

                      return (
                        <g key={c.id}
                          style={{ cursor: isOnline ? 'pointer' : 'not-allowed' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOnline) return;
                            if (selectedDef) {
                              deployToCity(c.id, selectedDef);
                            } else {
                              const rect = e.currentTarget.closest('svg').getBoundingClientRect();
                              setCityPopup(prev => prev?.cityId === c.id ? null : {
                                cityId: c.id,
                                screenX: rect.left + (cx / 600) * rect.width,
                                screenY: rect.top + (cy / 400) * rect.height,
                              });
                            }
                          }}>

                          {/* Subtle glow — reduced, only on defended/critical */}
                          {isOnline && def && (
                            <circle cx={cx} cy={cy} r={r + 6} fill="none"
                              stroke={def.color} strokeWidth="1" opacity="0.15">
                              <animate attributeName="r" values={`${r+4};${r+8};${r+4}`} dur="4s" repeatCount="indefinite"/>
                            </circle>
                          )}

                          {/* Flash ring on attack result */}
                          {flash && (
                            <circle cx={cx} cy={cy} r={r + 10} fill="none"
                              stroke={flash === "defend" ? '#34d399' : '#ef4444'} strokeWidth="2.5" opacity="0.7">
                              <animate attributeName="r" values={`${r};${r+18};${r}`} dur="0.6s" repeatCount="2"/>
                              <animate attributeName="opacity" values="0.7;0;0.7" dur="0.6s" repeatCount="2"/>
                            </circle>
                          )}

                          {/* Main circle */}
                          <circle cx={cx} cy={cy} r={r}
                            fill={!isOnline ? '#1f0808' : def ? def.color + '12' : '#0f1a2e'}
                            stroke={!isOnline ? '#ef4444' : def ? def.color : '#1e3a5f'}
                            strokeWidth={def ? 2 : 1.5}
                            // Valid target highlight in deploy mode
                            style={{ filter: selectedDef && isOnline ? `drop-shadow(0 0 6px ${defObj.color}60)` : 'none' }}
                          />

                          {/* Icon */}
                          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={isOnline ? 15 : 13} opacity={isOnline ? 1 : 0.4}>
                            {!isOnline ? "💀" : dep ? "🛡️" : c.emoji}
                          </text>

                          {/* Name label */}
                          <text x={cx} y={cy + r + 13} textAnchor="middle" fontSize="9"
                            fill={isOnline ? '#64748b' : '#ef4444'} fontFamily="'Space Grotesk', sans-serif">
                            {c.name}
                          </text>

                          {/* Pop micro label */}
                          {isOnline && !dep && (
                            <text x={cx + r + 3} y={cy - r + 5} fontSize="8" fill="#334155" fontFamily="monospace">
                              {c.pop}M
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* City Popup */}
                  {cityPopup && (() => {
                    const city = gs.cities[cityPopup.cityId];
                    const dep = gs.deployments[cityPopup.cityId];
                    return (
                      <div style={{
                        ...S.cityPopup,
                        left: Math.min(cityPopup.screenX, window.innerWidth - 265),
                        top: cityPopup.screenY + 28,
                      }}>
                        <div style={S.popupHeader}>
                          <span style={{ fontSize: 20 }}>{city.emoji}</span>
                          <div>
                            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{city.name}</div>
                            <div style={{ color: '#475569', fontSize: 11 }}>{city.pop}M pop · {ADJ[city.id].length} connections</div>
                          </div>
                          <button style={S.popupClose} onClick={() => setCityPopup(null)}>✕</button>
                        </div>
                        {dep ? (
                          <div style={{ padding: '6px 0' }}>
                            <div style={{ color: '#34d399', fontSize: 12, marginBottom: 8 }}>
                              Protected by {DEFENSES.find(d => d.id === dep)?.icon} {DEFENSES.find(d => d.id === dep)?.name}
                            </div>
                            <button style={S.popupRemoveBtn} onClick={() => removeDeployment(cityPopup.cityId)}>
                              Remove Defense
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 7 }}>Deploy defense:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {DEFENSES.filter(d => gs.budget >= d.cost || gs.deployments[cityPopup.cityId] === d.id).map(d => (
                                <button key={d.id} style={S.popupDefBtn}
                                  onClick={() => deployToCity(cityPopup.cityId, d.id)}>
                                  <span style={{ fontSize: 15 }}>{d.icon}</span>
                                  <span style={{ flex: 1, textAlign: 'left', color: '#e2e8f0', fontSize: 12 }}>{d.name}</span>
                                  <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>${d.cost}K</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right: Intel Panel — tabbed to reduce cognitive load */}
                <div style={{ ...S.gamePanel, borderLeft: '1px solid #1e293b40', borderRight: 'none' }}>
                  {/* Tab headers */}
                  <div style={{ display: 'flex', gap: 2, marginBottom: 8, background: '#0a0f1a', borderRadius: 8, padding: 3 }}>
                    {[
                      { id: 'intel', label: 'Intel' },
                      { id: 'predictions', label: 'Predict' },
                      { id: 'analysis', label: 'Analysis' },
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setIntelTab(tab.id)} style={{
                        flex: 1, padding: '5px 4px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: intelTab === tab.id ? '#1e293b' : 'transparent',
                        color: intelTab === tab.id ? '#e2e8f0' : '#475569',
                        transition: 'all 0.2s',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>{tab.label}</button>
                    ))}
                  </div>

                  {/* Tab: Intel Feed */}
                  {intelTab === 'intel' && (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Live Feed</div>
                      {gs.intel.slice(0, 10).map((entry, i) => {
                        const colors = { alert: '#ef4444', success: '#34d399', info: '#06b6d4', warn: '#f59e0b' };
                        return (
                          <div key={i} style={{
                            ...S.intelEntry,
                            borderLeftColor: colors[entry.type] || '#334155',
                            animation: i === 0 ? 'fadeInRight 0.4s ease-out' : 'none',
                          }}>
                            <div style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace' }}>R{entry.round}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, lineHeight: 1.4 }}>{entry.msg}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab: Predictions */}
                  {intelTab === 'predictions' && (
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Markov Prediction</div>
                      <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, marginBottom: 10, background: '#f59e0b10', borderRadius: 8, padding: '6px 10px' }}>
                        Likely next: {ATTACK_ICONS[ATTACK_TYPES[topPredIdx]]} {ATTACK_NAMES[ATTACK_TYPES[topPredIdx]]}
                      </div>
                      {ATTACK_TYPES.map((at, i) => (
                        <div key={at} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: i === topPredIdx ? '#f59e0b' : '#64748b' }}>
                              {ATTACK_ICONS[at]} {ATTACK_NAMES[at]}
                            </span>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: i === topPredIdx ? '#f59e0b' : '#475569' }}>
                              {(markovPreds[i] * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: 5, background: '#1e293b', borderRadius: 3 }}>
                            <div style={{
                              width: markovPreds[i] * 100 + '%', height: '100%', borderRadius: 3,
                              background: i === topPredIdx ? '#f59e0b' : '#1e3a5f',
                              transition: 'width 0.6s',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Analysis */}
                  {intelTab === 'analysis' && (
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Bayesian Profile</div>
                      {[
                        { label: "Script Kiddie", val: gs.beliefs.scriptKiddie, color: "#34d399" },
                        { label: "APT Group",     val: gs.beliefs.apt,          color: "#ef4444" },
                      ].map(b => (
                        <div key={b.label} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{b.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: b.color }}>
                              {(b.val * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: 7, background: '#1e293b', borderRadius: 4 }}>
                            <div style={{
                              width: b.val * 100 + '%', height: '100%', borderRadius: 4,
                              background: b.color, transition: 'width 0.8s cubic-bezier(0.25,0.8,0.25,1)',
                            }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Attack History</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {gs.attackHistory.slice(-6).map((at, i) => (
                          <span key={i} style={{
                            background: '#1e293b', borderRadius: 5, padding: '3px 7px',
                            fontSize: 11, color: '#94a3b8',
                          }}>{ATTACK_ICONS[at]} {at}</span>
                        ))}
                        {gs.attackHistory.length === 0 && <span style={{ color: '#334155', fontSize: 11 }}>No attacks yet</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div style={S.gameActionBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#475569', fontSize: 12 }}>Deployed:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Object.entries(gs.deployments).map(([cid, did]) => {
                      const def = DEFENSES.find(d => d.id === did);
                      return (
                        <span key={cid} title={`${gs.cities[cid].name}: ${def.name}`}
                          style={{ fontSize: 15 }}>{def.icon}</span>
                      );
                    })}
                    {Object.keys(gs.deployments).length === 0 && (
                      <span style={{ color: '#334155', fontSize: 11 }}>None yet</span>
                    )}
                  </div>
                </div>
                <button style={{
                  ...S.endTurnBtn,
                  opacity: Object.keys(gs.deployments).length === 0 || gs.roundPhase !== "deploy" ? 0.35 : 1,
                  cursor: Object.keys(gs.deployments).length === 0 || gs.roundPhase !== "deploy" ? 'not-allowed' : 'pointer',
                }} onClick={executeRound} disabled={Object.keys(gs.deployments).length === 0 || gs.roundPhase !== "deploy"}>
                  <AnimatedIcon type="target" size={18} /> End Turn
                </button>
              </div>

              {/* Attack Result Modal */}
              {attackResult && (
                <div style={S.modalOverlay}>
                  <div style={S.resultModal}>
                    <div style={{
                      fontSize: 40, marginBottom: 6,
                    }}>
                      {attackResult.totalBreached === 0 ? "🛡️" : attackResult.totalDefended > 0 ? "⚠️" : "💥"}
                    </div>
                    <h2 style={{
                      fontSize: 20, fontWeight: 800, marginBottom: 10,
                      color: attackResult.totalBreached === 0 ? '#34d399' : attackResult.totalDefended > 0 ? '#f59e0b' : '#ef4444',
                    }}>
                      {attackResult.totalBreached === 0 ? "All Attacks Repelled!" : attackResult.totalDefended > 0 ? "Partial Breach" : "Grid Compromised!"}
                    </h2>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                      Attack: <span style={{ color: '#f59e0b' }}>{ATTACK_ICONS[attackResult.attackType]} {ATTACK_NAMES[attackResult.attackType]}</span>
                    </div>
                    <div style={{ textAlign: 'left', marginBottom: 14 }}>
                      {attackResult.results.map((r, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
                          borderBottom: '1px solid #1e293b',
                        }}>
                          <span style={{ fontSize: 16 }}>{r.result === "defended" ? "✅" : "❌"}</span>
                          <span style={{ flex: 1, color: '#e2e8f0', fontSize: 13 }}>{r.city.name}</span>
                          <span style={{ color: '#475569', fontSize: 11 }}>
                            {r.defId ? DEFENSES.find(d => d.id === r.defId)?.name : "No defense"}
                          </span>
                        </div>
                      ))}
                      {attackResult.cascades.length > 0 && (
                        <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8, padding: '7px 10px',
                          background: '#ef444410', borderRadius: 7 }}>
                          ⚡ Cascade: {attackResult.cascades.map(c => c.name).join(", ")} lost power!
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: '#a78bfa0a', border: '1px solid #a78bfa18', borderRadius: 8,
                      padding: '10px 12px', marginBottom: 14, textAlign: 'left',
                    }}>
                      <div style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Game Theory</div>
                      <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.6 }}>
                        📐 <strong style={{ color: '#94a3b8' }}>Stackelberg:</strong> Attacker targeted weakest city.
                        {' '}🧠 <strong style={{ color: '#94a3b8' }}>Bayesian:</strong> P(APT) → {(gs.beliefs.apt * 100).toFixed(0)}%.
                        {' '}⛓ <strong style={{ color: '#94a3b8' }}>Markov:</strong> Next: {ATTACK_NAMES[ATTACK_TYPES[topPredIdx]]}.
                      </div>
                    </div>
                    <button style={S.continueBtn} onClick={continueRound}>
                      Continue to Round {gs.round + 1 <= gs.maxRounds ? gs.round + 1 : "Final"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ─── RESULTS ─── */}
        {page === "results" && gs && (
          <div style={S.resultsPage}>
            <div style={{ fontSize: 60, marginBottom: 10 }}>
              {gs.cities.filter(c => c.online).length >= gs.blackoutThreshold ? "🏆" : "💀"}
            </div>
            <h1 style={{
              ...S.resultsTitle,
              color: 12 - gs.cities.filter(c => c.online).length < gs.blackoutThreshold ? '#34d399' : '#ef4444',
            }}>
              {12 - gs.cities.filter(c => c.online).length < gs.blackoutThreshold ? "GRID SECURED" : "TOTAL BLACKOUT"}
            </h1>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 24 }}>
              {12 - gs.cities.filter(c => c.online).length < gs.blackoutThreshold
                ? `Survived ${gs.round} rounds. The grid endures.`
                : "Cascading failure could not be contained."}
            </p>
            <div style={S.resultsStats}>
              {[
                { val: gs.score, label: "Final Score" },
                { val: `${gs.cities.filter(c => c.online).length}/12`, label: "Cities Saved" },
                { val: `${gs.cities.filter(c => c.online).reduce((s, c) => s + c.pop, 0).toFixed(1)}M`, label: "Pop. Protected" },
                { val: gs.round, label: "Rounds Survived" },
                { val: `${(gs.beliefs.apt * 100).toFixed(0)}%`, label: "Final P(APT)" },
              ].map((s, i) => (
                <div key={i} style={S.resultStatBox}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={S.debriefBox}>
              <h3 style={{ color: '#a78bfa', fontSize: 13, fontWeight: 700, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                📐 Game Theory Debrief
              </h3>
              <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.8 }}>
                <p><strong style={{ color: '#06b6d4' }}>Stackelberg Leadership:</strong> You committed defenses each round as the Leader. The AI attacker observed and best-responded by targeting your weakest nodes.</p>
                <p style={{ marginTop: 10 }}><strong style={{ color: '#f59e0b' }}>Bayesian NE:</strong> Starting at 50/50, belief updated to P(APT) = {(gs.beliefs.apt * 100).toFixed(0)}% over {gs.round} rounds.</p>
                <p style={{ marginTop: 10 }}><strong style={{ color: '#a78bfa' }}>Markov Dynamics:</strong> Attack sequence: {gs.attackHistory.slice(0, 4).map(a => ATTACK_NAMES[a]).join(" → ")}.</p>
                <p style={{ marginTop: 10 }}><strong style={{ color: '#ef4444' }}>Cascade Effect:</strong> Grid topology created externalities — each offline node increased risk for neighbors.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
              <button style={S.startGameBtn} onClick={() => initGame(gs.difficulty)}>Play Again</button>
              <button style={{ ...S.startGameBtn, background: '#1e293b', color: '#94a3b8', boxShadow: 'none' }}
                onClick={() => navigate("home")}>Back to Home</button>
            </div>
          </div>
        )}

        {/* ─── LEADERBOARD ─── */}
        {page === "leaderboard" && (
          <div style={S.leaderboardPage}>
            <h1 style={S.pageTitle}><AnimatedIcon type="trophy" size={28} /> Rankings</h1>
            <div style={S.lbList}>
              {leaderboard.map((entry, i) => (
                <div key={i} style={{
                  ...S.lbRow,
                  background: entry.isUser ? '#06b6d408' : 'transparent',
                  borderColor: entry.isUser ? '#06b6d425' : '#1e293b',
                }}>
                  <div style={{ width: 36, textAlign: 'center', color: entry.rank <= 3 ? '#fbbf24' : '#475569',
                    fontSize: entry.rank <= 3 ? 18 : 14, fontWeight: 800 }}>
                    {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </div>
                  <div style={S.lbAvatar}>{entry.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                      {entry.name} {entry.isUser && <span style={{ color: '#06b6d4', fontSize: 10 }}>(You)</span>}
                    </div>
                    <div style={{ color: '#475569', fontSize: 11 }}>Level {entry.level}</div>
                  </div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 15 }}>{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PROFILE ─── */}
        {page === "profile" && (
          <div style={S.profilePage}>
            <div style={S.profileCard}>
              <div style={S.profileAvatar}>{user.avatar}</div>
              <h2 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700 }}>{user.username}</h2>
              <div style={{ color: '#06b6d4', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Level {playerStats.level} Commander</div>
              <div style={{ ...S.xpBarOuter, width: '70%', margin: '12px auto', height: 6 }}>
                <div style={{ ...S.xpBarInner, width: xpProgress + '%', height: '100%' }} />
              </div>
              <div style={{ color: '#475569', fontSize: 11 }}>{playerStats.xp % 500} / 500 XP to next level</div>
            </div>
            <div style={S.profileStats}>
              {[
                { label: "Games Played", val: playerStats.totalGames },
                { label: "Wins",         val: playerStats.wins },
                { label: "Best Score",   val: playerStats.bestScore },
                { label: "Best Streak",  val: playerStats.maxStreak },
              ].map((s, i) => (
                <div key={i} style={S.profileStatBox}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ color: '#a78bfa', fontSize: 13, marginTop: 24, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Achievements</h3>
            <div style={S.achGrid}>
              {ACHIEVEMENTS.map(a => {
                const unlocked = playerStats.achievements.includes(a.id);
                return (
                  <div key={a.id} style={{ ...S.achCard, opacity: unlocked ? 1 : 0.3, borderColor: unlocked ? '#a78bfa25' : '#1e293b' }}>
                    <AnimatedIcon type={a.icon} size={26} />
                    <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, marginTop: 6 }}>{a.name}</div>
                    <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>{a.desc}</div>
                    <div style={{ color: '#a78bfa', fontSize: 10, marginTop: 4 }}>+{a.xp} XP</div>
                  </div>
                );
              })}
            </div>
            <button style={{ ...S.startGameBtn, background: '#ef444420', color: '#ef4444', boxShadow: 'none', marginTop: 24 }}
              onClick={() => { setUser(null); setPlayerStats({ totalGames: 0, wins: 0, totalScore: 0, bestScore: 0, streak: 0, maxStreak: 0, achievements: [], xp: 0, level: 1, dailyPlayed: false, gamesHistory: [] }); }}>
              Sign Out
            </button>
          </div>
        )}

        {/* ─── GUIDE ─── */}
        {page === "guide" && (
          <div style={S.guidePage}>
            <h1 style={S.pageTitle}>📖 How to Play</h1>
            {[
              { title: "🎯 Your Mission", body: "You're the CISO of a national power grid with 12 interconnected cities. State-sponsored hackers (APT-VOLT) are attacking. Survive 8 rounds without losing too many cities." },
              { title: "🛡️ Deploy Defenses", body: "Each round you get a budget. Pick a defense from the left panel — it enters Deployment Mode (cursor changes, valid cities glow). Click any online city to deploy." },
              { title: "⚡ Cascade Failures", body: "When a city goes offline, undefended neighbors can overload and crash too. Protect hub cities with many connections to prevent chain reactions." },
              { title: "🧠 Use the Intel Tabs", body: "Intel tab shows live events. Predictions tab shows Markov chain forecasts for the next attack. Analysis tab shows Bayesian threat profiling. Don't ignore them!" },
              { title: "📐 Stackelberg Model", body: "You're the Leader — you deploy first, and the attacker sees your setup and targets your weakest point. Never leave critical cities fully undefended." },
              { title: "🍯 Honeypot Tip", body: "Deploy Honeypot Decoys to reveal attacker intent. They're cheap and give you strategic information advantage." },
              { title: "🏆 Scoring", body: "Earn points for each repelled attack. Bonus for population protected and cities saved. Higher difficulty = more XP. Unlock achievements for bonus XP!" },
            ].map((item, i) => (
              <div key={i} style={S.guideCard}>
                <h3 style={{ color: '#e2e8f0', fontSize: 15, marginBottom: 6, fontWeight: 700 }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-game tutorial overlay */}
      {showGuide && page === "game" && (
        <div style={S.tutorialOverlay}>
          <div style={S.tutorialCard}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>
              {["🛡️", "🗺️", "🧠", "⚡", "🎯"][guideStep]}
            </div>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, marginBottom: 7, fontWeight: 700 }}>
              {["Pick Your Defense", "Tap Cities to Deploy", "Use the Intel Tabs", "Watch for Cascades", "End Your Turn"][guideStep]}
            </h3>
            <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
              {[
                "Select a defense card. The cursor changes to crosshair and a tint overlay shows you're in deployment mode.",
                "After selecting, tap any online city on the map. Cities glow to show they're valid targets. Or tap a city first for a popup menu.",
                "The right panel now has 3 tabs: Intel (live feed), Predictions (Markov chains), Analysis (Bayesian profiling). Check them each round!",
                "When a city falls, undefended neighbors can cascade offline. Protect hub cities with many connections first!",
                "Once you've deployed defenses, hit 'End Turn'. Attack line animations show which cities were targeted.",
              ][guideStep]}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {guideStep > 0 && (
                <button style={{ ...S.tutorialBtn, background: '#1e293b', color: '#64748b' }}
                  onClick={() => setGuideStep(s => s - 1)}>Back</button>
              )}
              {guideStep < 4 ? (
                <button style={S.tutorialBtn} onClick={() => setGuideStep(s => s + 1)}>
                  Next ({guideStep + 1}/5)
                </button>
              ) : (
                <button style={{ ...S.tutorialBtn, background: '#34d399', color: '#0f172a' }}
                  onClick={() => setShowGuide(false)}>Start Playing!</button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: i === guideStep ? '#06b6d4' : '#1e293b',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════

const S = {
  // AUTH
  authContainer: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080d18', padding: 20, position: 'relative', overflow: 'hidden',
  },
  authGridBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  authCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 18,
    padding: '36px 32px', width: '100%', maxWidth: 380, position: 'relative', zIndex: 1,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  authLogo: {
    fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", fontSize: 30, fontWeight: 800,
    background: 'linear-gradient(135deg, #06b6d4, #818cf8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 8,
  },
  authSub: { color: '#475569', fontSize: 12, marginTop: 4 },
  authTabs: {
    display: 'flex', gap: 0, marginBottom: 18, background: '#1e293b', borderRadius: 9, padding: 3,
  },
  authTab: {
    flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 13, fontWeight: 600,
    color: '#475569', background: 'transparent', transition: 'all 0.25s',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  authTabActive: { background: '#0c1425', color: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  authInput: {
    width: '100%', padding: '12px 14px', marginBottom: 10, borderRadius: 9,
    border: '1px solid #1e293b', background: '#080d18', color: '#e2e8f0',
    fontSize: 13, fontFamily: "'Space Grotesk', sans-serif",
  },
  authErr: { color: '#ef4444', fontSize: 12, marginBottom: 8 },
  authBtn: {
    width: '100%', padding: '13px', borderRadius: 9,
    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    color: 'white', fontSize: 14, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif", marginTop: 6,
    boxShadow: '0 4px 16px rgba(6,182,212,0.25)',
  },

  // NAV
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 18px', height: 52,
    background: 'rgba(8,13,24,0.92)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #1e293b30',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 30, height: 30, borderRadius: 7, background: '#1e293b', color: '#64748b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navLogo: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700,
    color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },
  navLinks: { display: 'flex', gap: 2 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 7,
    background: 'transparent', color: '#475569', fontSize: 12, fontWeight: 500,
    transition: 'all 0.2s', fontFamily: "'Space Grotesk', sans-serif",
  },
  navLinkActive: { background: '#1e293b', color: '#e2e8f0' },
  navRight: { display: 'flex', alignItems: 'center', gap: 10 },
  xpBadge: { display: 'flex', alignItems: 'center', gap: 7 },
  xpLevel: { color: '#818cf8', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
  xpBarOuter: { width: 52, height: 3, background: '#1e293b', borderRadius: 2 },
  xpBarInner: {
    height: '100%', borderRadius: 2,
    background: 'linear-gradient(90deg, #818cf8, #06b6d4)', transition: 'width 0.5s',
  },
  avatarBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #06b6d4, #6d28d9)',
    color: 'white', fontSize: 13, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  appRoot: {
    minHeight: '100vh', background: '#080d18', color: '#e2e8f0',
    fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
  },
  pageContent: { minHeight: '100vh' },

  // HOME
  homePage: { maxWidth: 960, margin: '0 auto', padding: '0 20px 40px' },
  heroSection: {
    position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 22,
    background: 'linear-gradient(135deg, #0c1425 0%, #141b35 50%, #0c1425 100%)',
    border: '1px solid #1e293b',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      radial-gradient(circle at 25% 35%, rgba(6,182,212,0.07) 0%, transparent 55%),
      radial-gradient(circle at 75% 65%, rgba(109,40,217,0.05) 0%, transparent 50%),
      linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
    `,
    backgroundSize: 'auto, auto, 50px 50px, 50px 50px',
  },
  heroContent: {
    position: 'relative', zIndex: 1, padding: '44px 36px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, marginTop: 10,
    background: 'linear-gradient(135deg, #e2e8f0, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroDesc: { color: '#64748b', fontSize: 15, maxWidth: 480, marginTop: 10, lineHeight: 1.7 },
  playNowBtn: {
    marginTop: 22, padding: '14px 44px', borderRadius: 12,
    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    color: 'white', fontSize: 16, fontWeight: 800,
    fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 2,
    boxShadow: '0 6px 24px rgba(6,182,212,0.25)',
  },
  quickStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 },
  statCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 12,
    padding: 18, textAlign: 'center', animation: 'fadeInUp 0.4s ease-out both',
  },
  statVal: { fontSize: 22, fontWeight: 800, color: '#e2e8f0', marginTop: 7 },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 3 },
  conceptsSection: { marginBottom: 22 },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700,
    color: '#e2e8f0', marginBottom: 14,
  },
  conceptsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  conceptCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 12,
    padding: 18, textAlign: 'center', animation: 'fadeInUp 0.4s ease-out both',
  },
  conceptTitle: { fontSize: 13, fontWeight: 700, marginTop: 7 },
  conceptDesc: { fontSize: 11, color: '#64748b', marginTop: 5, lineHeight: 1.5 },
  dailyBanner: {
    background: 'linear-gradient(135deg, #6d28d908, #06b6d408)',
    border: '1px solid #818cf818', borderRadius: 14, padding: '18px 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  },
  dailyTitle: { color: '#fbbf24', fontSize: 14, fontWeight: 700 },
  dailyDesc: { color: '#64748b', fontSize: 12 },
  dailyBtn: {
    padding: '10px 22px', borderRadius: 9, background: '#6d28d9',
    color: 'white', fontSize: 13, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // PLAY
  playPage: { maxWidth: 860, margin: '0 auto', padding: '20px 20px 40px', textAlign: 'center' },
  pageTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800,
    color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8,
  },
  pageSubtitle: { color: '#475569', fontSize: 13, marginBottom: 24 },
  diffGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  diffCard: {
    background: '#0c1425', border: '2px solid #1e293b', borderRadius: 14,
    padding: 22, textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s',
  },
  diffBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 5,
    fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 14,
  },
  diffStats: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#64748b' },
  diffXp: { marginTop: 12, fontSize: 13, fontWeight: 700 },
  startGameBtn: {
    marginTop: 24, padding: '14px 36px', borderRadius: 12,
    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    color: 'white', fontSize: 15, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 8,
    boxShadow: '0 6px 24px rgba(6,182,212,0.2)',
  },

  // GAME
  gameContainer: {
    height: '100vh', display: 'flex', flexDirection: 'column', background: '#080d18',
    position: 'relative',
  },
  gameHud: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
    background: '#0c1425', borderBottom: '1px solid #1e293b',
    flexWrap: 'nowrap', overflowX: 'auto',
  },
  gameBackBtn: {
    width: 28, height: 28, borderRadius: 7, background: '#1e293b', color: '#64748b',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  hudPill: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    background: '#1e293b', borderRadius: 7, fontSize: 12, fontFamily: 'monospace',
    flexShrink: 0,
  },
  guideBtn: {
    width: 26, height: 26, borderRadius: '50%',
    background: '#1e293b', color: '#475569', fontSize: 13, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gameMain: { flex: 1, display: 'flex', overflow: 'hidden' },
  // Narrower panels (200px instead of 240px) — grid dominates
  gamePanel: {
    width: 200, background: '#0c1425', padding: 10,
    display: 'flex', flexDirection: 'column', gap: 6,
    overflowY: 'auto', flexShrink: 0,
    borderRight: '1px solid #1e293b40',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700,
    color: '#475569', letterSpacing: 0.5, paddingBottom: 7,
    borderBottom: '1px solid #1e293b', marginBottom: 2, textTransform: 'uppercase',
  },
  defCard: {
    padding: 9, borderRadius: 9, border: '1px solid #1e293b', cursor: 'pointer',
    transition: 'all 0.18s', textAlign: 'left',
  },
  gridMapArea: {
    flex: 1, position: 'relative', overflow: 'hidden',
    background: 'radial-gradient(ellipse at 50% 50%, #0c1a2e 0%, #080d18 100%)',
  },
  selectHint: {
    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
    background: '#1e293b', border: '1px solid #06b6d430', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, color: '#06b6d4', zIndex: 10,
    display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  cityPopup: {
    position: 'fixed', zIndex: 200, background: '#0c1425', border: '1px solid #1e293b',
    borderRadius: 12, padding: 14, width: 248, boxShadow: '0 10px 36px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.2s ease-out',
  },
  popupHeader: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 },
  popupClose: {
    marginLeft: 'auto', width: 22, height: 22, borderRadius: 5,
    background: '#1e293b', color: '#475569', fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  popupDefBtn: {
    display: 'flex', alignItems: 'center', gap: 7, width: '100%',
    padding: '7px 9px', borderRadius: 7, background: '#1e293b',
    border: '1px solid #1e3a5f', transition: 'all 0.15s', cursor: 'pointer',
  },
  popupRemoveBtn: {
    width: '100%', padding: '7px', borderRadius: 7, background: '#ef444415',
    color: '#ef4444', fontSize: 12, fontWeight: 600,
  },
  theoryBox: {
    background: '#080d18', border: '1px solid #1e293b', borderRadius: 8, padding: 9,
  },
  theoryLabel: { fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' },
  intelEntry: {
    padding: '6px 8px', borderLeft: '2px solid #334155', marginBottom: 4,
    background: '#080d18', borderRadius: '0 5px 5px 0',
  },
  gameActionBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 18px', background: '#0c1425', borderTop: '1px solid #1e293b',
  },
  endTurnBtn: {
    padding: '10px 24px', borderRadius: 10,
    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    color: 'white', fontSize: 13, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    display: 'flex', alignItems: 'center', gap: 7,
    boxShadow: '0 3px 14px rgba(6,182,212,0.2)', transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    backdropFilter: 'blur(5px)',
  },
  resultModal: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 18,
    padding: '28px 24px', maxWidth: 460, width: '100%', textAlign: 'center',
    maxHeight: '88vh', overflowY: 'auto',
    animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  continueBtn: {
    padding: '12px 28px', borderRadius: 10,
    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    color: 'white', fontSize: 14, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 3px 14px rgba(6,182,212,0.2)',
  },
  tutorialOverlay: {
    position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.82)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  tutorialCard: {
    background: '#0c1425', border: '1px solid #06b6d425', borderRadius: 18,
    padding: '28px 24px', maxWidth: 400, width: '100%', textAlign: 'center',
    boxShadow: '0 0 50px rgba(6,182,212,0.06)',
  },
  tutorialBtn: {
    padding: '9px 22px', borderRadius: 9, background: '#06b6d4',
    color: 'white', fontSize: 12, fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // RESULTS
  resultsPage: { maxWidth: 680, margin: '0 auto', padding: '40px 20px', textAlign: 'center' },
  resultsTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10,
  },
  resultsStats: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 22,
  },
  resultStatBox: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 10, padding: 14,
  },
  debriefBox: {
    background: '#0c1425', border: '1px solid #818cf818', borderRadius: 14,
    padding: 22, textAlign: 'left',
  },

  // LEADERBOARD
  leaderboardPage: { maxWidth: 660, margin: '0 auto', padding: '20px 20px 40px' },
  lbList: { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 5 },
  lbRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 10,
  },
  lbAvatar: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #1e293b, #0c1425)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b', fontSize: 13, fontWeight: 700,
  },

  // PROFILE
  profilePage: { maxWidth: 660, margin: '0 auto', padding: '20px 20px 40px', textAlign: 'center' },
  profileCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 18,
    padding: 28, marginBottom: 20,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 14, margin: '0 auto 10px',
    background: 'linear-gradient(135deg, #06b6d4, #6d28d9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 24, fontWeight: 800,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  profileStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  profileStatBox: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 10, padding: 14,
  },
  achGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  achCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 10,
    padding: 14, textAlign: 'center',
  },

  // GUIDE
  guidePage: { maxWidth: 660, margin: '0 auto', padding: '20px 20px 40px' },
  guideCard: {
    background: '#0c1425', border: '1px solid #1e293b', borderRadius: 12,
    padding: 18, marginTop: 10,
  },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=DM+Mono:ital,wght@0,300;0,400;0,500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #080d18; font-family: 'Space Grotesk', 'DM Sans', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

  @keyframes slideInRight {
    from { transform: translateX(80px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeInRight {
    from { transform: translateX(16px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeInUp {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes pulseBadge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  input:focus { outline: none; border-color: #06b6d440 !important; }
  button:focus { outline: none; }
  button { border: none; cursor: pointer; }
`;