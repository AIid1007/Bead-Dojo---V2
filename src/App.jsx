import { useState, useEffect, useCallback, useRef } from "react";
import './style.css';

// ═══════════════════════════════════════════════════════════
// BEAD DOJO v2 — Full Curriculum + Anzan Training
// ═══════════════════════════════════════════════════════════

// --- CONSTANTS ---
const BELTS = [
  { id:0, name:"White Belt",    color:"#f2f0e8", xp:0,   kanji:"一" },
  { id:1, name:"Yellow Belt",   color:"#e8c84a", xp:15,  kanji:"二" },
  { id:2, name:"Orange Belt",   color:"#e08a3c", xp:40,  kanji:"三" },
  { id:3, name:"Green Belt",    color:"#5c7d68", xp:75,  kanji:"四" },
  { id:4, name:"Blue Belt",     color:"#4a6fa5", xp:120, kanji:"五" },
  { id:5, name:"Purple Belt",   color:"#7a5c8a", xp:180, kanji:"六" },
  { id:6, name:"Brown Belt",    color:"#8a5a3b", xp:260, kanji:"七" },
  { id:7, name:"Red Belt",      color:"#a8382f", xp:360, kanji:"八" },
  { id:8, name:"Black Belt",    color:"#1a1a1a", xp:480, kanji:"九" },
  { id:9, name:"2-Dan",         color:"#1a1a1a", xp:620, kanji:"十" },
];

const WORLDS = [
  { id:0, name:"The Soroban",      icon:"算", color:"#e8c84a", lessons:[0,1,2] },
  { id:1, name:"Addition",         icon:"加", color:"#5c7d68", lessons:[3,4,5,6] },
  { id:2, name:"Subtraction",      icon:"減", color:"#4a6fa5", lessons:[7,8,9,10] },
  { id:3, name:"Multi-Digit",      icon:"位", color:"#7a5c8a", lessons:[11,12,13] },
  { id:4, name:"Multiplication",   icon:"乗", color:"#e08a3c", lessons:[14,15,16] },
  { id:5, name:"Mental Abacus",    icon:"暗", color:"#a8382f", lessons:[17,18,19,20] },
];

const LESSONS = [
  // WORLD 0: The Soroban
  { id:0, title:"Meet the Soroban", desc:"Parts & anatomy", world:0, type:"read",
    learn: [
      "The soroban (Japanese abacus) has vertical rods, each holding 5 beads.",
      "A horizontal beam divides each rod: 1 heaven bead above, 4 earth beads below.",
      "Beads count when pushed TOWARD the beam. Away from beam = inactive.",
      "Each rod is one place value: ones, tens, hundreds (right to left).",
    ],
    examples: [0, 5, 3, 7, 9] },
  { id:1, title:"Reading Numbers", desc:"Decode bead positions", world:0, type:"read",
    learn: [
      "Earth beads pushed UP = their count (0–4).",
      "Heaven bead pushed DOWN = 5.",
      "A rod shows: heaven value + earth value. Example: heaven down + 2 earth up = 7.",
      "Read multi-digit numbers left to right, one rod per digit.",
    ],
    examples: [12, 45, 73, 86, 91] },
  { id:2, title:"Setting Numbers", desc:"Place beads correctly", world:0, type:"set",
    learn: [
      "To set a number, work left to right (highest place first).",
      "For each digit: if ≥5, push heaven bead down first, then push up the remainder.",
      "Example: To set 8 → heaven down (5) + 3 earth beads up.",
      "Always clear the rod first (all beads away from beam).",
    ],
    examples: [24, 57, 63, 89, 10] },

  // WORLD 1: Addition
  { id:3, title:"Simple Add (1–4)", desc:"Push earth beads up", world:1, type:"add_simple",
    learn: [
      "To add 1–4: simply push that many earth beads UP toward the beam.",
      "Example: 2 + 3 → start with 2 beads up, push 3 more up = 5 beads... wait!",
      "If the result is under 5 on that rod, it's just a push. Easy!",
      "Try these: 1+2, 2+1, 3+1, 1+3.",
    ],
    maxNum: 4 },
  { id:4, title:"Adding 5", desc:"The heaven bead", world:1, type:"add_5",
    learn: [
      "When you add 5, push the heaven bead DOWN toward the beam.",
      "Example: 3 + 5 → earth shows 3, push heaven down = 8.",
      "If earth beads are up AND you add 5, the heaven bead joins them.",
      "5 + 5 = 10 → that's a carry to the next rod! (We'll learn carries soon.)",
    ],
    maxNum: 9 },
  { id:5, title:"Friends of 5", desc:"Complement pairs", world:1, type:"friends5_add",
    learn: [
      "Problem: 4 + 3. You have 4 earth beads up — no room to push 3 more!",
      "Solution: ADD 5 (heaven down), SUBTRACT the complement.",
      "The 'friend of 5' for 3 is 2 (because 3 + 2 = 5).",
      "So: 4 + 3 → push heaven down, pull 2 earth beads down = 7. ✓",
    ],
    pairs: [[1,4],[2,3],[3,2],[4,1]] },
  { id:6, title:"Friends of 10", desc:"Carrying to the next rod", world:1, type:"friends10_add",
    learn: [
      "Problem: 8 + 6. The ones rod can't hold 14!",
      "Solution: ADD 1 to the tens rod (carry), SUBTRACT the complement of 10.",
      "The 'friend of 10' for 6 is 4 (because 6 + 4 = 10).",
      "So: 8 + 6 → add 1 to tens, subtract 4 from ones = 14. ✓",
    ],
    maxNum: 18 },

  // WORLD 2: Subtraction
  { id:7, title:"Simple Subtract", desc:"Pull earth beads down", world:2, type:"sub_simple",
    learn: [
      "To subtract 1–4: pull that many earth beads DOWN (away from beam).",
      "Example: 7 – 3 → 7 is heaven + 2 earth. Pull 2 earth down, then...",
      "Wait — we need to subtract one more. That requires the friend of 5!",
      "For now, practice simple cases where earth beads are sufficient.",
    ],
    maxNum: 4 },
  { id:8, title:"Subtracting 5", desc:"Lift the heaven bead", world:2, type:"sub_5",
    learn: [
      "To subtract 5: push the heaven bead UP (away from beam).",
      "Example: 8 – 5 → heaven was down + 3 earth. Push heaven up = 3.",
      "Simple and clean — just remove the 5.",
      "This only works when the heaven bead IS down. Otherwise, we borrow.",
    ],
    maxNum: 9 },
  { id:9, title:"Friends of 5 (Sub)", desc:"Reverse complements", world:2, type:"friends5_sub",
    learn: [
      "Problem: 7 – 3. Earth shows 2 — can't pull 3 down!",
      "Solution: SUBTRACT 5 (heaven up), ADD the complement back.",
      "Friend of 5 for 3 is 2. So: 7 – 3 → heaven up, push 2 earth up = 4. ✓",
      "It's the reverse of adding with friends of 5.",
    ],
    pairs: [[1,4],[2,3],[3,2],[4,1]] },
  { id:10, title:"Borrowing", desc:"Friends of 10 for subtraction", world:2, type:"friends10_sub",
    learn: [
      "Problem: 12 – 7. Ones rod shows 2 — not enough!",
      "Solution: SUBTRACT 1 from tens rod (borrow), ADD complement of 10.",
      "Friend of 10 for 7 is 3. So: 12 – 7 → subtract 1 from tens, add 3 to ones = 5. ✓",
      "The tens rod gives you 10, you take 7, leaving the complement (3).",
    ],
    maxNum: 18 },

  // WORLD 3: Multi-Digit
  { id:11, title:"Two-Digit Addition", desc:"Rod by rod", world:3, type:"multi_add",
    learn: [
      "Add multi-digit numbers from RIGHT to LEFT (ones first, then tens).",
      "Apply the same rules on each rod: direct add, friend of 5, or friend of 10.",
      "Carries propagate left — if ones rod overflows, tens rod gets +1.",
      "Example: 37 + 45 → ones: 7+5=12 (carry 1), tens: 3+4+1=8 → 82.",
    ],
    digits: 2 },
  { id:12, title:"Two-Digit Subtraction", desc:"Borrow across rods", world:3, type:"multi_sub",
    learn: [
      "Subtract right to left. If a rod can't subtract, borrow from the next.",
      "Borrowing = subtract 1 from the left rod, add 10 to the current rod.",
      "Then apply friend-of-5 or friend-of-10 rules as needed.",
      "Example: 82 – 47 → ones: 2-7 (borrow from tens: 12-7=5), tens: 7-4=3 → 35.",
    ],
    digits: 2 },
  { id:13, title:"Speed Drills", desc:"Mix add & subtract", world:3, type:"mixed",
    learn: [
      "Now combine everything: addition and subtraction, multi-digit.",
      "Work each rod carefully, applying the right technique.",
      "Speed comes from pattern recognition — you start to 'see' the answer.",
      "The goal: solve 2-digit add/sub in under 5 seconds.",
    ],
    digits: 2 },

  // WORLD 4: Multiplication
  { id:14, title:"Times Tables", desc:"Foundation for ×", world:4, type:"multiply_basic",
    learn: [
      "Multiplication on abacus uses the times table as building blocks.",
      "You must know 1×1 through 9×9 instantly — no hesitation.",
      "Each multiplication breaks into: multiply each digit pair, place on correct rod.",
      "Let's refresh your times tables first.",
    ] },
  { id:15, title:"Single × Single", desc:"Place the product", world:4, type:"multiply_single",
    learn: [
      "To multiply 7 × 8: mentally get 56, then set it on the abacus.",
      "The product of two 1-digit numbers is at most 2 digits.",
      "Place tens digit on the tens rod, ones digit on the ones rod.",
      "Practice: get fast at multiplying and placing the result.",
    ] },
  { id:16, title:"Multi × Single", desc:"Distribute and sum", world:4, type:"multiply_multi",
    learn: [
      "23 × 7: break it down → (20 × 7) + (3 × 7) = 140 + 21 = 161.",
      "Work left to right: multiply the tens digit first, add to the abacus.",
      "Then multiply the ones digit and add to the running total.",
      "Each partial product is placed and accumulated on the rods.",
    ] },

  // WORLD 5: Mental Abacus (Anzan)
  { id:17, title:"See the Beads", desc:"Visualization begins", world:5, type:"anzan_intro",
    learn: [
      "Anzan = mental abacus. You imagine a soroban in your mind.",
      "Start small: close your eyes, picture a single rod. Set 3. Now add 2.",
      "Can you 'see' 5 beads? The heaven bead should come down in your mind.",
      "This is the skill that makes mental math superhuman. It takes practice.",
    ] },
  { id:18, title:"Flash Anzan — Slow", desc:"Numbers appear, sum mentally", world:5, type:"anzan_slow",
    learn: [
      "Numbers will flash on screen. Add them on your mental abacus.",
      "Start with 2 numbers, single digits, slow speed.",
      "Don't say the numbers in words — SEE them as beads.",
      "Words are slow. Images are instant. This is the art of anzan.",
    ] },
  { id:19, title:"Flash Anzan — Medium", desc:"Faster, more numbers", world:5, type:"anzan_medium",
    learn: [
      "Now: 3–4 numbers, faster flashing.",
      "Trust your mental abacus. The answer should 'appear' without narration.",
      "If you're still talking through the math, slow down and focus on seeing.",
      "The discomfort is the muscle growing.",
    ] },
  { id:20, title:"Speed Mastery", desc:"The beads become the mind", world:5, type:"anzan_fast",
    learn: [
      "5+ numbers, 2-digit, fast flash. This is black-belt territory.",
      "At this level, the digit may disappear — only beads flash.",
      "You must visualize entirely. No crutches.",
      "Welcome to mastery. A black belt is a white belt who never stopped.",
    ] },
];

const SENSEI_GREETINGS = [
  "The beads do not care how you feel today. They only ask that you sit.",
  "A black belt is a white belt who never stopped showing up.",
  "Small practice, done daily, defeats grand practice done once.",
  "The abacus in your hands is temporary. The abacus in your mind is forever.",
  "Do not chase the answer. Chase the calm from which the answer comes.",
  "Even one round moves the mountain by one stone.",
  "Your streak is not a number. It is a promise you keep to yourself.",
];
const SENSEI_WIN = [
  "Good. The beads moved before your doubt did.",
  "Clean. Return tomorrow.",
  "The mind sharpens. I saw it.",
  "Correct. Speed will come; you brought presence.",
];
const SENSEI_LOSS = [
  "A miss. Now we know where the edge of your skill lives.",
  "Wrong answer, right effort. Only one of those matters.",
  "Every master has missed this exact sum.",
];
const SCROLLS = [
  { t:"Scroll of the Empty Hand", b:"When a number flashes, do not say it in words. See it as beads." },
  { t:"Scroll of the Five", b:"Every digit is a question of five: is the heaven bead down?" },
  { t:"Scroll of Breath", b:"Exhale before the round begins." },
  { t:"Scroll of Hands", b:"Twitch your fingers as if moving real beads. The body remembers." },
  { t:"Scroll of Quiet", b:"If the sums feel loud, you're still translating. Mastery is silent." },
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const todayStr = () => new Date().toISOString().slice(0, 10);

function beltFor(xp) {
  let b = BELTS[0];
  for (const belt of BELTS) if (xp >= belt.xp) b = belt;
  return b;
}
function nextBelt(xp) {
  for (const belt of BELTS) if (xp < belt.xp) return belt;
  return null;
}

// ═══════════════════════════════════════════════════════════
// SOROBAN DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════
function Soroban({ number, showDigits = true, size = "md", highlight = null }) {
  const digits = String(Math.abs(number)).split("").map(Number);
  const sz = size === "lg" ? { rod: 36, bead: 22, h: 180, gap: 10 } :
             size === "sm" ? { rod: 20, bead: 13, h: 100, gap: 5 } :
             { rod: 28, bead: 17, h: 140, gap: 8 };

  return (
    <div className="flex items-center justify-center" style={{ gap: sz.gap }}>
      {digits.map((d, i) => {
        const upper = d >= 5;
        const lower = d % 5;
        const isHighlighted = highlight === i;
        return (
          <div key={i} className="flex flex-col items-center relative"
            style={{
              width: sz.rod, height: sz.h, borderRadius: 3,
              background: "linear-gradient(180deg, #8a5a3b, #6b4429)",
              padding: "6px 0",
              boxShadow: isHighlighted ? "0 0 12px rgba(201,162,90,0.7)" : "none",
              transition: "box-shadow 0.3s"
            }}>
            {/* Heaven bead area */}
            <div style={{
              width: sz.bead, height: sz.bead - 3, borderRadius: "50%",
              background: upper
                ? "radial-gradient(circle at 35% 30%, #ff8a70, #d94f3d 70%, #7c2418)"
                : "radial-gradient(circle at 35% 30%, #888, #555)",
              opacity: upper ? 1 : 0.15,
              margin: "1.5px 0",
              boxShadow: upper ? "0 1px 3px rgba(0,0,0,0.4)" : "none",
              transition: "all 0.2s"
            }} />
            {/* Beam */}
            <div style={{ flex: 1, width: "100%", position: "relative" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "rgba(0,0,0,0.4)"
              }} />
            </div>
            {/* Earth beads */}
            {[0,1,2,3].map(j => (
              <div key={j} style={{
                width: sz.bead, height: sz.bead - 3, borderRadius: "50%",
                background: j < lower
                  ? "radial-gradient(circle at 35% 30%, #ff8a70, #d94f3d 70%, #7c2418)"
                  : "radial-gradient(circle at 35% 30%, #888, #555)",
                opacity: j < lower ? 1 : 0.15,
                margin: "1.5px 0",
                boxShadow: j < lower ? "0 1px 3px rgba(0,0,0,0.4)" : "none",
                transition: "all 0.2s"
              }} />
            ))}
            {/* Digit label */}
            {showDigits && (
              <div style={{
                position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                color: "rgba(237,230,214,0.6)"
              }}>{d}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROBLEM GENERATORS
// ═══════════════════════════════════════════════════════════
function genProblem(lesson) {
  const l = LESSONS[lesson];
  switch(l.type) {
    case "read":
    case "set":
      return { type: l.type, num: l.examples ? pick(l.examples) : rnd(1,99), op: null };
    case "add_simple":
      { const a = rnd(1, l.maxNum || 4), b = rnd(1, l.maxNum || 4);
        return a+b<=9 ? {type:"add",a,b,answer:a+b} : genProblem(lesson); }
    case "add_5":
      { const a = rnd(0,4), b = 5; return {type:"add",a,b,answer:a+b}; }
    case "friends5_add":
      { const a = rnd(1,4), comp = 5-a, b = rnd(comp,4);
        return a+b < 10 ? {type:"add",a,b,answer:a+b} : genProblem(lesson); }
    case "friends10_add":
      { const a = rnd(5,9), b = rnd(10-a, 9);
        return {type:"add",a,b,answer:a+b}; }
    case "sub_simple":
      { const a = rnd(2, l.maxNum||4), b = rnd(1, a); return {type:"sub",a,b,answer:a-b}; }
    case "sub_5":
      { const a = rnd(5,9), b = 5; return {type:"sub",a,b,answer:a-b}; }
    case "friends5_sub":
      { const a = rnd(5,9), b = rnd(1,4);
        return a-b>=0 ? {type:"sub",a,b,answer:a-b} : genProblem(lesson); }
    case "friends10_sub":
      { const a = rnd(10,18), b = rnd(a-9, 9);
        return a-b>=0 ? {type:"sub",a,b,answer:a-b} : genProblem(lesson); }
    case "multi_add":
      { const a = rnd(11,49), b = rnd(11,49); return {type:"add",a,b,answer:a+b}; }
    case "multi_sub":
      { const a = rnd(30,99), b = rnd(11, a-1); return {type:"sub",a,b,answer:a-b}; }
    case "mixed":
      { const op = Math.random()>0.5 ? "add" : "sub";
        if(op==="add"){ const a=rnd(11,49),b=rnd(11,49); return {type:"add",a,b,answer:a+b}; }
        else { const a=rnd(30,99),b=rnd(11,a-1); return {type:"sub",a,b,answer:a-b}; }
      }
    case "multiply_basic":
    case "multiply_single":
      { const a=rnd(2,9),b=rnd(2,9); return {type:"mul",a,b,answer:a*b}; }
    case "multiply_multi":
      { const a=rnd(11,29),b=rnd(2,9); return {type:"mul",a,b,answer:a*b}; }
    case "anzan_intro":
      { const nums=[rnd(1,5),rnd(1,5)]; return {type:"anzan",seq:nums,answer:nums.reduce((a,b)=>a+b,0),speed:2000}; }
    case "anzan_slow":
      { const nums=Array.from({length:2},()=>rnd(1,9)); return {type:"anzan",seq:nums,answer:nums.reduce((a,b)=>a+b,0),speed:1600}; }
    case "anzan_medium":
      { const nums=Array.from({length:3},()=>rnd(1,9)); return {type:"anzan",seq:nums,answer:nums.reduce((a,b)=>a+b,0),speed:1200}; }
    case "anzan_fast":
      { const cnt=rnd(4,6), nums=Array.from({length:cnt},()=>rnd(1,19));
        return {type:"anzan",seq:nums,answer:nums.reduce((a,b)=>a+b,0),speed:800}; }
    default:
      { const a=rnd(1,9),b=rnd(1,9); return {type:"add",a,b,answer:a+b}; }
  }
}

// Flash anzan difficulty by belt
function diffFor(beltId) {
  const table = [
    { count:2, max:9,   flashMs:1600, beadOnly:0 },
    { count:3, max:9,   flashMs:1400, beadOnly:0 },
    { count:3, max:19,  flashMs:1250, beadOnly:0.2 },
    { count:3, max:29,  flashMs:1100, beadOnly:0.35 },
    { count:4, max:29,  flashMs:1000, beadOnly:0.5 },
    { count:4, max:49,  flashMs:900,  beadOnly:0.6 },
    { count:5, max:49,  flashMs:820,  beadOnly:0.7 },
    { count:5, max:79,  flashMs:750,  beadOnly:0.8 },
    { count:6, max:99,  flashMs:680,  beadOnly:0.9 },
    { count:7, max:99,  flashMs:620,  beadOnly:1.0 },
  ];
  return table[Math.min(beltId, table.length - 1)];
}

// ═══════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════
let AC = null;
function beep(freq, dur = 0.07, vol = 0.04) {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + dur);
  } catch(e) {}
}
const sfx = {
  tick: () => beep(340, 0.05, 0.03),
  good: () => { beep(520, 0.08); setTimeout(() => beep(720, 0.1), 90); },
  bad: () => beep(160, 0.18, 0.04),
  belt: () => { beep(440,0.1); setTimeout(()=>beep(550,0.1),110); setTimeout(()=>beep(660,0.1),220); setTimeout(()=>beep(880,0.18),330); },
  star: () => { beep(660,0.06); setTimeout(()=>beep(880,0.1),80); },
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function BeadDojo() {
  // --- STATE ---
  const [screen, setScreen] = useState("profiles"); // profiles, home, lesson, play
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState("");

  // Player progress
  const [xp, setXp] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastTrainDate, setLastTrainDate] = useState(null);
  const [todayRounds, setTodayRounds] = useState(0);
  const [todayDate, setTodayDate] = useState(null);
  const [shields, setShields] = useState(0);
  const [sound, setSound] = useState(true);
  const [lessonProgress, setLessonProgress] = useState({}); // { lessonId: { completed, stars, bestScore } }

  // Current activity
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonTab, setLessonTab] = useState("learn"); // learn, practice, quiz
  const [learnStep, setLearnStep] = useState(0);

  // Practice/Quiz state
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null, "correct", "wrong"
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, maxTotal: 5 });
  const [quizDone, setQuizDone] = useState(false);

  // Flash anzan state
  const [playMode, setPlayMode] = useState(null); // daily, survival, timeattack, zen
  const [flashState, setFlashState] = useState(null); // { seq, idx, answer, phase }
  const [survivalLevel, setSurvivalLevel] = useState(0);
  const [taScore, setTaScore] = useState(0);
  const [taEnd, setTaEnd] = useState(null);
  const [dailyDone, setDailyDone] = useState(false);

  // Sensei
  const [senseiMsg, setSenseiMsg] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [scrollContent, setScrollContent] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // --- Persistent storage (localStorage) ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bead-dojo-v2");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.playerName) {
          setPlayerName(d.playerName);
          setXp(d.xp || 0);
          setTotalSolved(d.totalSolved || 0);
          setStreak(d.streak || 0);
          setBestStreak(d.bestStreak || 0);
          setLastTrainDate(d.lastTrainDate);
          setTodayRounds(d.todayRounds || 0);
          setTodayDate(d.todayDate);
          setShields(d.shields || 0);
          setLessonProgress(d.lessonProgress || {});
          setPlayer("loaded");
        }
      }
    } catch(e) {}
  }, []);

  const saveProgress = useCallback((overrides = {}) => {
    const data = {
      playerName, xp, totalSolved, streak, bestStreak,
      lastTrainDate, todayRounds, todayDate, shields, lessonProgress,
      ...overrides
    };
    try {
      localStorage.setItem("bead-dojo-v2", JSON.stringify(data));
    } catch(e) {}
  }, [playerName, xp, totalSolved, streak, bestStreak, lastTrainDate, todayRounds, todayDate, shields, lessonProgress]);

  useEffect(() => {
    if (player) saveProgress();
  }, [xp, totalSolved, streak, lessonProgress, todayRounds]);

  // --- Rollover day ---
  useEffect(() => {
    const t = todayStr();
    if (todayDate && todayDate !== t) {
      setTodayRounds(0);
      setTodayDate(t);
      setDailyDone(false);
    }
  }, [screen]);

  // Sensei greeting
  useEffect(() => {
    if (screen === "home") {
      const hash = todayStr().split("").reduce((h,c) => ((h<<5)-h)+c.charCodeAt(0), 0);
      setSenseiMsg(SENSEI_GREETINGS[Math.abs(hash) % SENSEI_GREETINGS.length]);
    }
  }, [screen]);

  // --- PROFILE SCREEN ---
  const startGame = (name) => {
    setPlayerName(name);
    setPlayer("active");
    setTodayDate(todayStr());
    setScreen("home");
    saveProgress({ playerName: name, todayDate: todayStr() });
  };

  // --- LESSON FLOW ---
  const openLesson = (lessonId) => {
    setCurrentLesson(lessonId);
    setLessonTab("learn");
    setLearnStep(0);
    setFeedback(null);
    setUserAnswer("");
    setQuizScore({ correct: 0, total: 0, maxTotal: 5 });
    setQuizDone(false);
    setScreen("lesson");
  };

  const startPractice = () => {
    setLessonTab("practice");
    setFeedback(null);
    setUserAnswer("");
    setProblem(genProblem(currentLesson));
  };

  const startQuiz = () => {
    setLessonTab("quiz");
    setFeedback(null);
    setUserAnswer("");
    setQuizScore({ correct: 0, total: 0, maxTotal: 5 });
    setQuizDone(false);
    setProblem(genProblem(currentLesson));
  };

  const submitAnswer = (isQuiz = false) => {
    if (!problem || userAnswer === "") return;
    const ans = parseInt(userAnswer, 10);
    const correct = ans === (problem.answer !== undefined ? problem.answer : problem.num);

    if (correct && sound) sfx.good();
    if (!correct && sound) sfx.bad();

    setFeedback(correct ? "correct" : "wrong");

    if (isQuiz) {
      const newScore = {
        ...quizScore,
        correct: quizScore.correct + (correct ? 1 : 0),
        total: quizScore.total + 1
      };
      setQuizScore(newScore);

      if (newScore.total >= newScore.maxTotal) {
        // Quiz complete
        const stars = newScore.correct >= 5 ? 3 : newScore.correct >= 4 ? 2 : newScore.correct >= 3 ? 1 : 0;
        const prev = lessonProgress[currentLesson];
        const newStars = Math.max(stars, prev?.stars || 0);
        const earnedXp = stars * 2 + (prev?.completed ? 0 : 3);

        setLessonProgress(p => ({
          ...p,
          [currentLesson]: { completed: true, stars: newStars, bestScore: Math.max(newScore.correct, prev?.bestScore || 0) }
        }));
        setXp(x => x + earnedXp);
        setTotalSolved(t => t + newScore.correct);
        setQuizDone(true);
        if (sound) sfx.star();
      }
    }
  };

  const nextProblem = (isQuiz = false) => {
    setFeedback(null);
    setUserAnswer("");
    if (isQuiz && quizScore.total >= quizScore.maxTotal) return;
    setProblem(genProblem(currentLesson));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // --- FLASH ANZAN ---
  const startFlashAnzan = (mode) => {
    setPlayMode(mode);
    setScreen("play");
    setUserAnswer("");
    setFeedback(null);

    const belt = beltFor(xp);
    const cfg = mode === "survival" ? diffFor(belt.id) :
                mode === "timeattack" ? diffFor(belt.id) :
                mode === "zen" ? { ...diffFor(belt.id), flashMs: null } :
                diffFor(belt.id);

    if (mode === "survival") setSurvivalLevel(0);
    if (mode === "timeattack") { setTaScore(0); setTaEnd(Date.now() + 60000); }

    const seq = Array.from({ length: cfg.count }, () => rnd(1, cfg.max));
    const answer = seq.reduce((a, b) => a + b, 0);

    if (mode === "zen") {
      setFlashState({ seq, answer, idx: 0, phase: "show", speed: null });
    } else {
      setFlashState({ seq, answer, idx: 0, phase: "flashing", speed: cfg.flashMs, beadOnly: cfg.beadOnly || 0 });
      runFlash(seq, cfg.flashMs, cfg.beadOnly || 0);
    }
  };

  const runFlash = (seq, speed, beadOnly) => {
    let i = 0;
    const step = () => {
      if (sound) sfx.tick();
      setFlashState(prev => ({...prev, idx: i, phase: "flashing", currentBeadOnly: Math.random() < beadOnly }));
      i++;
      if (i < seq.length) {
        timerRef.current = setTimeout(step, speed);
      } else {
        timerRef.current = setTimeout(() => {
          setFlashState(prev => ({...prev, phase: "answer"}));
          setTimeout(() => inputRef.current?.focus(), 50);
        }, speed);
      }
    };
    step();
  };

  const submitFlashAnswer = () => {
    if (!flashState || userAnswer === "") return;
    const ans = parseInt(userAnswer, 10);
    const correct = ans === flashState.answer;

    if (correct && sound) sfx.good();
    if (!correct && sound) sfx.bad();

    setFeedback(correct ? "correct" : "wrong");

    if (playMode === "daily") {
      if (correct) {
        setXp(x => x + 1);
        setTotalSolved(t => t + 1);
      }
      const newRounds = todayRounds + 1;
      setTodayRounds(newRounds);
      if (newRounds >= 3) {
        setDailyDone(true);
        setStreak(s => {
          const ns = s + 1;
          setBestStreak(b => Math.max(b, ns));
          return ns;
        });
        setLastTrainDate(todayStr());
      }
    } else if (playMode === "survival") {
      if (correct) {
        setSurvivalLevel(l => l + 1);
      }
    } else if (playMode === "timeattack") {
      if (correct) setTaScore(s => s + 1);
    }
  };

  const nextFlashRound = () => {
    setFeedback(null);
    setUserAnswer("");

    if (playMode === "daily" && todayRounds >= 3) {
      setScreen("home");
      return;
    }

    if (playMode === "survival" && feedback === "wrong") {
      // Game over
      return;
    }

    if (playMode === "timeattack" && Date.now() >= taEnd) {
      // Time's up
      return;
    }

    const belt = beltFor(xp);
    const cfg = diffFor(belt.id);

    if (playMode === "survival") {
      const speedup = Math.max(0.45, 1 - survivalLevel * 0.06);
      const adjCfg = {
        count: cfg.count + Math.floor(survivalLevel / 3),
        max: cfg.max,
        flashMs: Math.round(cfg.flashMs * speedup),
        beadOnly: cfg.beadOnly
      };
      const seq = Array.from({ length: adjCfg.count }, () => rnd(1, adjCfg.max));
      const answer = seq.reduce((a, b) => a + b, 0);
      setFlashState({ seq, answer, idx: 0, phase: "flashing", speed: adjCfg.flashMs, beadOnly: adjCfg.beadOnly || 0 });
      runFlash(seq, adjCfg.flashMs, adjCfg.beadOnly || 0);
    } else {
      const seq = Array.from({ length: cfg.count }, () => rnd(1, cfg.max));
      const answer = seq.reduce((a, b) => a + b, 0);
      setFlashState({ seq, answer, idx: 0, phase: "flashing", speed: cfg.flashMs, beadOnly: cfg.beadOnly || 0 });
      runFlash(seq, cfg.flashMs, cfg.beadOnly || 0);
    }
  };

  // Anzan in lessons
  const startLessonAnzan = () => {
    const p = genProblem(currentLesson);
    setProblem(p);
    setFeedback(null);
    setUserAnswer("");
    if (p.type === "anzan") {
      setFlashState({ seq: p.seq, answer: p.answer, idx: 0, phase: "flashing", speed: p.speed });
      runFlash(p.seq, p.speed, 0);
    }
  };

  // Cleanup timers
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const belt = beltFor(xp);
  const nBelt = nextBelt(xp);

  // ═════ NUMPAD ═════
  const Numpad = ({ onSubmit }) => (
    <div className="grid grid-cols-3 gap-2 mt-3 max-w-xs mx-auto">
      {["1","2","3","4","5","6","7","8","9","⌫","0","↩"].map(k => (
        <button key={k} onClick={() => {
          if (k === "⌫") setUserAnswer(v => v.slice(0, -1));
          else if (k === "↩") onSubmit();
          else setUserAnswer(v => v + k);
        }}
          className="py-3 rounded-lg font-mono text-xl transition-all active:scale-95"
          style={{
            background: k === "↩" ? "#a8382f" : "rgba(237,230,214,0.08)",
            border: "1px solid rgba(237,230,214,0.2)",
            color: k === "↩" ? "#ede6d6" : "#ede6d6",
            fontWeight: k === "↩" ? 700 : 400
          }}>
          {k}
        </button>
      ))}
    </div>
  );

  // ═════ STARS DISPLAY ═════
  const Stars = ({ count, max = 3 }) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < count ? "#e8c84a" : "rgba(237,230,214,0.2)", fontSize: 18 }}>★</span>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  // --- PROFILES ---
  if (screen === "profiles") {
    return (
      <div style={styles.container}>
        <div className="text-center" style={{ marginTop: 40, marginBottom: 36 }}>
          <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 64, color: "#a8382f", textShadow: "0 0 30px rgba(168,56,47,0.4)" }}>算</div>
          <h1 style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 32, margin: "8px 0 4px", color: "#ede6d6", letterSpacing: ".03em" }}>Bead Dojo</h1>
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(237,230,214,0.55)", letterSpacing: ".1em" }}>learn abacus · master anzan · the beads become the mind</p>
        </div>

        {player === "loaded" ? (
          <div>
            <button onClick={() => { setPlayer("active"); setScreen("home"); }} style={styles.profileCard}>
              <div>
                <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 20, fontWeight: 700, color: "#1c1f26" }}>{playerName}</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(28,31,38,0.55)", marginTop: 3 }}>
                  {belt.name} · streak {streak} · {totalSolved} solved · {Object.values(lessonProgress).filter(l=>l.completed).length}/{LESSONS.length} lessons
                </div>
              </div>
              <div style={{ width: 44, height: 10, borderRadius: 2, background: belt.color, boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }} />
            </button>
            <button onClick={() => { setPlayer(null); setPlayerName(""); setXp(0); setTotalSolved(0); setStreak(0); setBestStreak(0); setLessonProgress({}); setTodayRounds(0); }}
              style={{ ...styles.ghostBtn, display: "block", margin: "16px auto" }}>
              Start fresh
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p style={{ color: "rgba(237,230,214,0.7)", marginBottom: 16, fontSize: 14 }}>Enter your name to begin</p>
            <input value={playerName} onChange={e => setPlayerName(e.target.value.slice(0,16))}
              placeholder="Your name"
              onKeyDown={e => { if (e.key === "Enter" && playerName.trim()) startGame(playerName.trim()); }}
              style={{ ...styles.input, width: 200, marginBottom: 12 }} />
            <br />
            <button onClick={() => playerName.trim() && startGame(playerName.trim())}
              disabled={!playerName.trim()}
              style={{ ...styles.primaryBtn, opacity: playerName.trim() ? 1 : 0.4 }}>
              Enter the Dojo
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- HOME ---
  if (screen === "home") {
    const completedLessons = Object.values(lessonProgress).filter(l => l.completed).length;
    const totalStars = Object.values(lessonProgress).reduce((s, l) => s + (l.stars || 0), 0);
    const isDailyDone = todayRounds >= 3;

    return (
      <div style={styles.container}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 22, fontWeight: 700, color: "#c9a25a" }}>{belt.name}</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(237,230,214,0.55)", marginTop: 2 }}>
              {playerName} · {totalSolved} solved · streak {streak}{bestStreak > streak ? ` (best ${bestStreak})` : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSound(s => !s); }} style={{ ...styles.iconBtn, opacity: sound ? 1 : 0.4 }}>♪</button>
            <button onClick={() => setScreen("profiles")} style={styles.iconBtn}>⇄</button>
          </div>
        </div>

        {/* Belt Journey */}
        <div className="flex items-center gap-0 overflow-x-auto" style={{ padding: "14px 10px", background: "rgba(0,0,0,0.25)", borderRadius: 8, marginBottom: 16 }}>
          {BELTS.map((b, i) => {
            const isCurrent = belt.id === b.id;
            const isDone = xp >= b.xp && !isCurrent;
            return (
              <React.Fragment key={i}>
                <div className="flex items-center justify-center flex-shrink-0" style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: `2px solid ${isCurrent || isDone ? (b.color === "#1a1a1a" ? "#c9a25a" : b.color) : "rgba(237,230,214,0.25)"}`,
                  background: isDone ? (b.color === "#1a1a1a" ? "#c9a25a" : b.color) : "transparent",
                  color: isDone ? "#1c1f26" : (isCurrent ? (b.color === "#1a1a1a" ? "#c9a25a" : b.color) : "rgba(237,230,214,0.35)"),
                  fontFamily: "'Shippori Mincho', serif", fontSize: 12, fontWeight: 700,
                  boxShadow: isCurrent ? "0 0 14px rgba(201,162,90,0.45)" : "none",
                }}>
                  {b.kanji}
                </div>
                {i < BELTS.length - 1 && (
                  <div style={{ height: 2, minWidth: 12, flex: 1, background: xp >= BELTS[i+1]?.xp ? "#c9a25a" : "rgba(237,230,214,0.15)" }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* XP bar */}
        {nBelt && (
          <div className="mb-4" style={{ padding: "0 4px" }}>
            <div className="flex justify-between mb-1" style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(237,230,214,0.5)" }}>
              <span>{xp} XP</span>
              <span>{nBelt.name} at {nBelt.xp} XP</span>
            </div>
            <div style={{ height: 4, background: "rgba(237,230,214,0.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(100, ((xp - belt.xp) / (nBelt.xp - belt.xp)) * 100)}%`, background: "#c9a25a", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {/* Sensei */}
        <div style={styles.senseiBox}>
          <b style={{ fontStyle: "normal", color: "#c9a25a", fontFamily: "monospace", fontSize: 11, letterSpacing: ".1em", display: "block", marginBottom: 4 }}>SENSEI</b>
          {senseiMsg}
        </div>

        {/* ═════ LESSON WORLDS ═════ */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: ".15em", color: "#c9a25a", marginBottom: 12 }}>LESSON JOURNEY</div>
          {WORLDS.map(world => {
            const worldLessons = world.lessons.map(id => LESSONS[id]);
            const allComplete = worldLessons.every(l => lessonProgress[l.id]?.completed);
            const prevWorldComplete = world.id === 0 || WORLDS[world.id - 1].lessons.every(id => lessonProgress[id]?.completed);

            return (
              <div key={world.id} className="mb-3" style={{
                background: "rgba(237,230,214,0.04)",
                border: `1px solid ${allComplete ? world.color : "rgba(237,230,214,0.12)"}`,
                borderRadius: 10, padding: "14px 16px",
                opacity: prevWorldComplete ? 1 : 0.4,
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: allComplete ? world.color : "rgba(237,230,214,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Shippori Mincho', serif", fontSize: 20,
                    color: allComplete ? "#1c1f26" : "rgba(237,230,214,0.5)"
                  }}>{world.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 16, fontWeight: 700 }}>{world.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(237,230,214,0.5)" }}>
                      {worldLessons.filter(l => lessonProgress[l.id]?.completed).length}/{worldLessons.length} complete
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {worldLessons.map((lesson, li) => {
                    const prog = lessonProgress[lesson.id];
                    const prevDone = li === 0 || lessonProgress[worldLessons[li-1].id]?.completed;
                    const unlocked = prevWorldComplete && (li === 0 || prevDone);

                    return (
                      <button key={lesson.id}
                        onClick={() => unlocked && openLesson(lesson.id)}
                        disabled={!unlocked}
                        className="flex items-center gap-3 text-left transition-all active:scale-98"
                        style={{
                          background: prog?.completed ? "rgba(92,125,104,0.15)" : "rgba(237,230,214,0.04)",
                          border: "1px solid rgba(237,230,214,0.1)",
                          borderRadius: 8, padding: "10px 12px",
                          opacity: unlocked ? 1 : 0.35,
                          cursor: unlocked ? "pointer" : "default",
                          color: "#ede6d6",
                        }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: prog?.completed ? "#5c7d68" : "rgba(237,230,214,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                          color: prog?.completed ? "#ede6d6" : "rgba(237,230,214,0.4)"
                        }}>
                          {prog?.completed ? "✓" : lesson.id + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lesson.title}</div>
                          <div style={{ fontSize: 11, color: "rgba(237,230,214,0.5)", fontFamily: "monospace" }}>{lesson.desc}</div>
                        </div>
                        {prog?.completed && <Stars count={prog.stars} />}
                        {!prog?.completed && unlocked && (
                          <div style={{ fontSize: 11, color: "#c9a25a", fontFamily: "monospace", flexShrink: 0 }}>START →</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═════ DAILY TRAINING ═════ */}
        <div style={styles.dailyCard}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: ".15em", color: "#a8382f", marginBottom: 12 }}>DAILY ANZAN TRAINING</div>
          <div className="flex gap-3 justify-center mb-4">
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 40, height: 40, borderRadius: "50%",
                border: `2px solid ${i < todayRounds ? "#a8382f" : "#1c1f26"}`,
                background: i < todayRounds ? "#a8382f" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Shippori Mincho', serif", fontSize: 16, fontWeight: 700,
                color: i < todayRounds ? "#ede6d6" : "transparent",
              }}>印</div>
            ))}
          </div>
          <button onClick={() => !isDailyDone && startFlashAnzan("daily")}
            disabled={isDailyDone}
            style={{ ...styles.primaryBtn, opacity: isDailyDone ? 0.4 : 1 }}>
            {isDailyDone ? "Training complete — return tomorrow" : todayRounds === 0 ? "Begin training" : `Round ${todayRounds + 1} of 3`}
          </button>
          {shields > 0 && <div style={{ marginTop: 10, fontFamily: "monospace", fontSize: 11, color: "#5c7d68" }}>🛡 {shields} streak shield{shields>1?"s":""}</div>}
        </div>

        {/* ═════ DOJO MODES ═════ */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { mode: "survival", name: "Survival", desc: "faster until you fall" },
            { mode: "timeattack", name: "Time Attack", desc: "60 sec, max solves" },
          ].map(m => (
            <button key={m.mode}
              onClick={() => isDailyDone && startFlashAnzan(m.mode)}
              className="text-left transition-all active:scale-97"
              style={{
                background: "rgba(237,230,214,0.06)",
                border: "1px solid rgba(237,230,214,0.18)",
                borderRadius: 8, padding: "14px 12px",
                opacity: isDailyDone ? 1 : 0.35,
                cursor: isDailyDone ? "pointer" : "default",
                color: "#ede6d6"
              }}>
              <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "rgba(237,230,214,0.55)", fontFamily: "monospace" }}>{m.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(237,230,214,0.5)", textAlign: "center", marginBottom: 20 }}>
          {isDailyDone ? "Dojo floor open. Free practice." : "Finish today's training to open the dojo floor."}
        </div>

        {/* Stats */}
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: ".15em", color: "#c9a25a", marginBottom: 10 }}>GROWTH MIRROR</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#c9a25a" }}>{completedLessons}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(237,230,214,0.5)" }}>Lessons</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#e8c84a" }}>{totalStars}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(237,230,214,0.5)" }}>Stars</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#5c7d68" }}>{totalSolved}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(237,230,214,0.5)" }}>Solved</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LESSON SCREEN ---
  if (screen === "lesson" && currentLesson !== null) {
    const lesson = LESSONS[currentLesson];
    const isAnzan = lesson.type.startsWith("anzan");

    return (
      <div style={styles.container}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { clearTimeout(timerRef.current); setScreen("home"); }} style={styles.iconBtn}>✕</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 18, fontWeight: 700 }}>{lesson.title}</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(237,230,214,0.55)" }}>
              World {lesson.world + 1}: {WORLDS[lesson.world].name} · Lesson {currentLesson + 1}
            </div>
          </div>
          {lessonProgress[currentLesson]?.completed && <Stars count={lessonProgress[currentLesson].stars} />}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5" style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 3 }}>
          {["learn", "practice", "quiz"].map(tab => (
            <button key={tab}
              onClick={() => {
                if (tab === "learn") { setLessonTab("learn"); setLearnStep(0); }
                else if (tab === "practice") startPractice();
                else startQuiz();
              }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 6, border: "none",
                background: lessonTab === tab ? "rgba(237,230,214,0.12)" : "transparent",
                color: lessonTab === tab ? "#ede6d6" : "rgba(237,230,214,0.4)",
                fontFamily: "monospace", fontSize: 12, fontWeight: 600,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: ".08em"
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* LEARN TAB */}
        {lessonTab === "learn" && (
          <div>
            <div style={styles.stageBox}>
              {/* Show soroban example */}
              {lesson.examples && (
                <div className="mb-4">
                  <Soroban number={lesson.examples[learnStep % lesson.examples.length]} size="lg" />
                  <div style={{ fontFamily: "monospace", fontSize: 20, marginTop: 16, color: "#c9a25a" }}>
                    = {lesson.examples[learnStep % lesson.examples.length]}
                  </div>
                </div>
              )}
              {!lesson.examples && lesson.type.includes("add") && (
                <Soroban number={rnd(1,9)} size="lg" />
              )}
            </div>

            <div style={{ background: "rgba(237,230,214,0.05)", borderRadius: 8, padding: 16, marginTop: 16, marginBottom: 16 }}>
              {lesson.learn.map((text, i) => (
                <p key={i} style={{
                  marginBottom: i < lesson.learn.length - 1 ? 12 : 0,
                  fontSize: 14, lineHeight: 1.6,
                  color: i === learnStep ? "#ede6d6" : "rgba(237,230,214,0.5)",
                  borderLeft: i === learnStep ? "3px solid #c9a25a" : "3px solid transparent",
                  paddingLeft: 12,
                  transition: "all 0.2s"
                }}>
                  {text}
                </p>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              {learnStep > 0 && (
                <button onClick={() => setLearnStep(s => s - 1)} style={styles.ghostBtn}>← Back</button>
              )}
              {learnStep < lesson.learn.length - 1 ? (
                <button onClick={() => setLearnStep(s => s + 1)} style={styles.primaryBtn}>Next →</button>
              ) : (
                <button onClick={startPractice} style={styles.primaryBtn}>Start Practice →</button>
              )}
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {lessonTab === "practice" && problem && (
          <div>
            <div style={styles.stageBox}>
              {/* Problem display */}
              {(problem.type === "read" || problem.type === "set") && (
                <div>
                  {problem.type === "read" ? (
                    <>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(237,230,214,0.5)", marginBottom: 12 }}>What number do the beads show?</div>
                      <Soroban number={problem.num} size="lg" showDigits={false} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(237,230,214,0.5)", marginBottom: 12 }}>Set this number on the abacus:</div>
                      <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 700, color: "#c9a25a" }}>{problem.num}</div>
                      <div className="mt-4">
                        <Soroban number={problem.num} size="md" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {(problem.type === "add" || problem.type === "sub" || problem.type === "mul") && (
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(237,230,214,0.5)", marginBottom: 8 }}>Solve:</div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Soroban number={problem.a} size="sm" />
                    <span style={{ fontSize: 28, color: "#c9a25a", fontFamily: "monospace" }}>
                      {problem.type === "add" ? "+" : problem.type === "sub" ? "−" : "×"}
                    </span>
                    <Soroban number={problem.b} size="sm" />
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 24, color: "rgba(237,230,214,0.7)" }}>
                    {problem.a} {problem.type === "add" ? "+" : problem.type === "sub" ? "−" : "×"} {problem.b} = ?
                  </div>
                </div>
              )}

              {problem.type === "anzan" && flashState && (
                <div>
                  {flashState.phase === "flashing" && (
                    <div>
                      <Soroban number={flashState.seq[flashState.idx]} size="lg" />
                      <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 700, marginTop: 16 }}>
                        {flashState.seq[flashState.idx]}
                      </div>
                    </div>
                  )}
                  {flashState.phase === "answer" && (
                    <div style={{ color: "rgba(237,230,214,0.5)", fontSize: 15 }}>Total?</div>
                  )}
                </div>
              )}
            </div>

            {/* Answer input */}
            {feedback === null && (problem.type !== "anzan" || flashState?.phase === "answer") && (
              <div className="mt-4">
                <div className="flex gap-2 justify-center">
                  <input ref={inputRef} type="text" inputMode="numeric" pattern="[0-9]*"
                    value={userAnswer} onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={e => { if (e.key === "Enter") submitAnswer(false); }}
                    style={styles.input} autoFocus placeholder="?" />
                  <button onClick={() => submitAnswer(false)} style={styles.primaryBtn}>Go</button>
                </div>
                <Numpad onSubmit={() => submitAnswer(false)} />
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="mt-4 text-center">
                <div style={{
                  fontSize: 20, fontWeight: 700, marginBottom: 8,
                  color: feedback === "correct" ? "#5c7d68" : "#a8382f",
                  fontFamily: "'Shippori Mincho', serif"
                }}>
                  {feedback === "correct" ? "Correct!" : `Answer: ${problem.answer !== undefined ? problem.answer : problem.num}`}
                </div>
                {feedback === "correct" && (
                  <Soroban number={problem.answer !== undefined ? problem.answer : problem.num} size="sm" />
                )}
                <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(237,230,214,0.6)", marginTop: 8 }}>
                  {feedback === "correct" ? pick(SENSEI_WIN) : pick(SENSEI_LOSS)}
                </p>
                <button onClick={() => { if (isAnzan) startLessonAnzan(); else nextProblem(false); }}
                  style={{ ...styles.primaryBtn, marginTop: 12 }}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {lessonTab === "quiz" && (
          <div>
            {!quizDone && problem && (
              <div>
                {/* Progress */}
                <div className="flex gap-2 justify-center mb-4">
                  {Array.from({ length: quizScore.maxTotal }).map((_, i) => (
                    <div key={i} style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: i < quizScore.total
                        ? (i < quizScore.correct ? "#5c7d68" : "#a8382f")
                        : "rgba(237,230,214,0.15)"
                    }} />
                  ))}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 11, textAlign: "center", color: "rgba(237,230,214,0.5)", marginBottom: 12 }}>
                  Question {quizScore.total + 1} of {quizScore.maxTotal}
                </div>

                <div style={styles.stageBox}>
                  {(problem.type === "read" || problem.type === "set") && (
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(237,230,214,0.5)", marginBottom: 12 }}>
                        {problem.type === "read" ? "What number?" : `Set: ${problem.num}`}
                      </div>
                      <Soroban number={problem.num} size="lg" showDigits={problem.type === "set"} />
                    </div>
                  )}
                  {(problem.type === "add" || problem.type === "sub" || problem.type === "mul") && (
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 32, fontWeight: 700, color: "#ede6d6" }}>
                        {problem.a} {problem.type === "add" ? "+" : problem.type === "sub" ? "−" : "×"} {problem.b}
                      </div>
                    </div>
                  )}
                  {problem.type === "anzan" && flashState && (
                    <div>
                      {flashState.phase === "flashing" && (
                        <div>
                          <Soroban number={flashState.seq[flashState.idx]} size="lg" />
                          <div style={{ fontFamily: "monospace", fontSize: 48, fontWeight: 700, marginTop: 12 }}>
                            {flashState.seq[flashState.idx]}
                          </div>
                        </div>
                      )}
                      {flashState.phase === "answer" && (
                        <div style={{ color: "rgba(237,230,214,0.5)", fontSize: 15 }}>Total?</div>
                      )}
                    </div>
                  )}
                </div>

                {feedback === null && (problem.type !== "anzan" || flashState?.phase === "answer") && (
                  <div className="mt-4">
                    <div className="flex gap-2 justify-center">
                      <input ref={inputRef} type="text" inputMode="numeric" pattern="[0-9]*"
                        value={userAnswer} onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={e => { if (e.key === "Enter") submitAnswer(true); }}
                        style={styles.input} autoFocus placeholder="?" />
                      <button onClick={() => submitAnswer(true)} style={styles.primaryBtn}>Go</button>
                    </div>
                    <Numpad onSubmit={() => submitAnswer(true)} />
                  </div>
                )}

                {feedback && !quizDone && (
                  <div className="mt-4 text-center">
                    <div style={{
                      fontSize: 20, fontWeight: 700,
                      color: feedback === "correct" ? "#5c7d68" : "#a8382f",
                    }}>
                      {feedback === "correct" ? "✓" : `✗ Answer: ${problem.answer !== undefined ? problem.answer : problem.num}`}
                    </div>
                    <button onClick={() => nextProblem(true)}
                      style={{ ...styles.primaryBtn, marginTop: 12 }}>
                      {quizScore.total >= quizScore.maxTotal ? "See Results" : "Next →"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {quizDone && (
              <div className="text-center">
                <div style={styles.stageBox}>
                  <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 28, fontWeight: 700, color: "#c9a25a", marginBottom: 8 }}>
                    {quizScore.correct}/{quizScore.maxTotal}
                  </div>
                  <Stars count={quizScore.correct >= 5 ? 3 : quizScore.correct >= 4 ? 2 : quizScore.correct >= 3 ? 1 : 0} />
                  <p style={{ fontSize: 14, marginTop: 12, color: "rgba(237,230,214,0.7)" }}>
                    {quizScore.correct >= 5 ? "Perfect! The beads are with you." :
                     quizScore.correct >= 4 ? "Excellent. One step from perfection." :
                     quizScore.correct >= 3 ? "Passing. Keep practicing." :
                     "Keep training. The path is patience."}
                  </p>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(237,230,214,0.4)", marginTop: 8 }}>
                    +{(quizScore.correct >= 5 ? 3 : quizScore.correct >= 4 ? 2 : quizScore.correct >= 3 ? 1 : 0) * 2 + (lessonProgress[currentLesson]?.completed ? 0 : 3)} XP earned
                  </div>
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={startQuiz} style={styles.ghostBtn}>Retry</button>
                  <button onClick={() => setScreen("home")} style={styles.primaryBtn}>Continue</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- PLAY SCREEN (Flash Anzan) ---
  if (screen === "play" && flashState) {
    return (
      <div style={styles.container}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { clearTimeout(timerRef.current); setScreen("home"); }} style={styles.iconBtn}>✕</button>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(237,230,214,0.55)", flex: 1, textAlign: "right" }}>
            {playMode === "daily" && `Daily · round ${todayRounds + 1}/3 · ${belt.name}`}
            {playMode === "survival" && `Survival · wave ${survivalLevel + 1}`}
            {playMode === "timeattack" && `Time Attack · ${taScore} solved`}
          </div>
        </div>

        <div style={styles.stageBox}>
          {flashState.phase === "flashing" && (
            <div>
              <Soroban number={flashState.seq[flashState.idx]} size="lg" />
              {!flashState.currentBeadOnly && (
                <div style={{ fontFamily: "monospace", fontSize: 52, fontWeight: 700, marginTop: 16 }}>
                  {flashState.seq[flashState.idx]}
                </div>
              )}
              {flashState.currentBeadOnly && (
                <div style={{ fontFamily: "monospace", fontSize: 34, color: "rgba(237,230,214,0.35)", marginTop: 16 }}>·</div>
              )}
            </div>
          )}

          {flashState.phase === "answer" && feedback === null && (
            <div style={{ color: "rgba(237,230,214,0.5)", fontFamily: "monospace", fontSize: 16 }}>total?</div>
          )}

          {feedback && (
            <div>
              <div style={{
                fontFamily: "'Shippori Mincho', serif", fontSize: 28, fontWeight: 700,
                color: feedback === "correct" ? "#5c7d68" : "#a8382f", marginBottom: 8
              }}>
                {flashState.answer}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(237,230,214,0.55)", marginBottom: 8 }}>
                {feedback === "correct" ? "correct" : `you answered ${userAnswer || "—"}`}
              </div>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(237,230,214,0.6)" }}>
                {feedback === "correct" ? pick(SENSEI_WIN) : pick(SENSEI_LOSS)}
              </p>

              {/* Survival game over */}
              {playMode === "survival" && feedback === "wrong" && (
                <div className="mt-4">
                  <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 18, color: "#a8382f", marginBottom: 12 }}>
                    Fallen at wave {survivalLevel + 1}
                  </div>
                  <button onClick={() => { setSurvivalLevel(0); setFeedback(null); setUserAnswer(""); startFlashAnzan("survival"); }} style={{ ...styles.primaryBtn, marginRight: 8 }}>Again</button>
                  <button onClick={() => setScreen("home")} style={styles.ghostBtn}>Return</button>
                </div>
              )}

              {/* Time attack done */}
              {playMode === "timeattack" && Date.now() >= taEnd && (
                <div className="mt-4">
                  <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 22, color: "#c9a25a", marginBottom: 4 }}>
                    {taScore} solves in 60s
                  </div>
                  <button onClick={() => setScreen("home")} style={{ ...styles.primaryBtn, marginTop: 8 }}>Return</button>
                </div>
              )}

              {/* Continue buttons for daily / survival (not dead) / timeattack (not done) */}
              {!(playMode === "survival" && feedback === "wrong") && !(playMode === "timeattack" && Date.now() >= taEnd) && (
                <button onClick={nextFlashRound} style={{ ...styles.primaryBtn, marginTop: 12 }}>
                  {playMode === "daily" && todayRounds >= 3 ? "Return to Dojo" : "Next →"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Answer input */}
        {flashState.phase === "answer" && feedback === null && (
          <div className="mt-4">
            <div className="flex gap-2 justify-center">
              <input ref={inputRef} type="text" inputMode="numeric" pattern="[0-9]*"
                value={userAnswer} onChange={e => setUserAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => { if (e.key === "Enter") submitFlashAnswer(); }}
                style={styles.input} autoFocus placeholder="?" />
              <button onClick={submitFlashAnswer} style={styles.primaryBtn}>Go</button>
            </div>
            <Numpad onSubmit={submitFlashAnswer} />
          </div>
        )}
      </div>
    );
  }

  return <div style={styles.container}><p>Loading...</p></div>;
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = {
  container: {
    maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#ede6d6", minHeight: "100vh",
    background: "radial-gradient(circle at 50% -10%, #262b36, #1c1f26 65%)",
  },
  primaryBtn: {
    background: "#a8382f", color: "#ede6d6", border: "none", borderRadius: 6,
    padding: "12px 24px", fontFamily: "monospace", fontSize: 13, fontWeight: 700,
    letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer",
    transition: "transform 0.1s",
  },
  ghostBtn: {
    background: "none", border: "1px solid rgba(237,230,214,0.25)",
    color: "rgba(237,230,214,0.55)", borderRadius: 5, padding: "8px 14px",
    fontFamily: "monospace", fontSize: 11, cursor: "pointer",
  },
  iconBtn: {
    background: "rgba(237,230,214,0.08)", border: "1px solid rgba(237,230,214,0.2)",
    color: "#ede6d6", width: 36, height: 36, borderRadius: 6,
    cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
  },
  input: {
    width: 120, fontFamily: "monospace", fontSize: 28, textAlign: "center",
    padding: 10, borderRadius: 6, border: "2px solid #c9a25a",
    background: "rgba(237,230,214,0.95)", color: "#1c1f26",
    outline: "none",
  },
  profileCard: {
    width: "100%", background: "#ede6d6", color: "#1c1f26", border: "none",
    borderRadius: 6, padding: 18, display: "flex", justifyContent: "space-between",
    alignItems: "center", cursor: "pointer", textAlign: "left",
    transition: "transform 0.12s",
  },
  senseiBox: {
    background: "rgba(237,230,214,0.05)", borderLeft: "3px solid #a8382f",
    padding: "12px 14px", borderRadius: "0 6px 6px 0",
    fontSize: 13.5, lineHeight: 1.55, marginBottom: 18,
    fontStyle: "italic", color: "rgba(237,230,214,0.85)",
  },
  dailyCard: {
    background: "#ede6d6", color: "#1c1f26", borderRadius: 8,
    padding: 18, marginBottom: 16, textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  },
  stageBox: {
    background: "linear-gradient(160deg, #2a2f3a, #1c1f26)",
    borderRadius: 14, minHeight: 200,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.45)",
    padding: 24, textAlign: "center", position: "relative", overflow: "hidden",
    flexDirection: "column",
  },
};
