'use strict';

// ═══════════════════════════════════════════════════════════════
//  ZONE ARCHITECTURE  (from masterGameLayout.md)
//  Beginner: Coast → Shallows → Sandbank → Reef
//  Intermediate: Sand Dunes → Seawall
//  Advanced / Furthest: TBD
// ═══════════════════════════════════════════════════════════════

const ZONES = [
  {
    id: 0, name: 'THE COAST', code: 'ZONE-00', depth: 5, tier: 'BEGINNER',
    unlockCost: null, implemented: true,
    fish: ['glow_anchovy', 'blister_crab', 'hollow_mackerel', 'tide_gazer', 'shore_wraith'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 4,
    ambientMessages: [
      '> The water is warmer than it should be for this time of year.',
      '> Something glints under the surface. Your scanner shows nothing.',
      '> The birds left three days ago. No one mentioned it.',
      '> Salinity reading: NORMAL. Second reading: ERROR.',
      '> The tide is going out. It has not come back.',
    ],
  },
  {
    id: 1, name: 'THE SHALLOWS', code: 'ZONE-01', depth: 20, tier: 'BEGINNER',
    unlockCost: 200, implemented: true,
    fish: ['pale_goby', 'linked_eel', 'jaw_fish', 'signal_carp', 'mirror_scale'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    ambientMessages: [
      '> The shallows are quieter than they should be.',
      '> [PING] Sonar returned an unexpected shape. Logged and ignored.',
      '> Two fish moved in perfect synchrony. Neither noticed the other.',
      '> Depth: 20m. Something is pressed against the sand below.',
      '> The water here tastes like static electricity.',
    ],
  },
  {
    id: 2, name: 'THE SANDBANK', code: 'ZONE-02', depth: 60, tier: 'BEGINNER',
    unlockCost: 600, implemented: true,
    fish: ['dust_feeder', 'multi_eye', 'the_knot', 'depth_worm', 'sandborn'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    ambientMessages: [
      '> The sandbank shifts. It shifted the wrong direction.',
      '> Bio-scanner shows density clusters. Organic. Dense.',
      '> Something has been arranged under the sand. Deliberately.',
      '> Pressure anomaly at 55m. It moved when the scanner swept past it.',
      '> The sand here is too fine. Too uniform. Too deliberate.',
    ],
  },
  {
    id: 3, name: 'THE REEF', code: 'ZONE-03', depth: 150, tier: 'BEGINNER',
    unlockCost: 2000, implemented: true,
    fish: ['irradiated_perch', 'rust_eel', 'deep_scout', 'abyssal_leech', 'the_watcher'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    ambientMessages: [
      '> The reef is alive. It is also watching.',
      '> [SONAR PING] Contact at 140m. Classification: ERROR. Reclassification: IGNORE.',
      '> Bioluminescence detected. Pattern: non-random. Meaning: unknown.',
      '> Irradiation levels above threshold. Your equipment says this is fine.',
      '> The coral here grows toward you when you are not looking.',
    ],
  },
  {
    id: 4, name: 'THE SAND DUNES', code: 'ZONE-04', depth: 400, tier: 'INTERMEDIATE',
    unlockCost: 8000, implemented: false, fish: [], spawnWeights: [], maxFish: 0, ambientMessages: [],
  },
  {
    id: 5, name: 'THE SEAWALL', code: 'ZONE-05', depth: 1000, tier: 'INTERMEDIATE',
    unlockCost: 25000, implemented: false, fish: [], spawnWeights: [], maxFish: 0, ambientMessages: [],
  },
];

// ═══════════════════════════════════════════════════════════════
//  FISH DATA
// ═══════════════════════════════════════════════════════════════

const RARITY_ORDER  = { COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 };
const RARITY_COLORS = {
  COMMON:    { color: '#00cc66', glow: '#00ff88', eye: '#00ff88' },
  UNCOMMON:  { color: '#88ccff', glow: '#aaddff', eye: '#88ccff' },
  RARE:      { color: '#ff4466', glow: '#ff7799', eye: '#ff0033' },
  EPIC:      { color: '#cc44ff', glow: '#dd77ff', eye: '#cc00ff' },
  LEGENDARY: { color: '#ffcc44', glow: '#ffee88', eye: '#ffcc44' },
};

const FISH = {
  // ── ZONE 0: THE COAST ──
  glow_anchovy: {
    name: 'GLOW ANCHOVY', zone: 0, rarity: 'COMMON', goldValue: 1,
    speed: 65, size: 18, wave: null,
    desc: 'Bioluminescent. Edible, probably.',
  },
  blister_crab: {
    name: 'BLISTER CRAB', zone: 0, rarity: 'UNCOMMON', goldValue: 4,
    speed: 52, size: 24, wave: { amp: 8, freq: 4 },
    desc: 'Calcified protrusions on the shell. Not natural.',
  },
  hollow_mackerel: {
    name: 'HOLLOW MACKEREL', zone: 0, rarity: 'RARE', goldValue: 16,
    speed: 95, size: 20, wave: null,
    desc: 'Interior completely empty. Still alive.',
  },
  tide_gazer: {
    name: 'TIDE GAZER', zone: 0, rarity: 'EPIC', goldValue: 50,
    speed: 128, size: 26, wave: { amp: 28, freq: 2.2 },
    desc: 'Its eye tracks you even after being caught.',
  },
  shore_wraith: {
    name: 'SHORE WRAITH', zone: 0, rarity: 'LEGENDARY', goldValue: 180,
    speed: 162, size: 15, wave: { amp: 45, freq: 1.0 },
    desc: 'You saw it. Your scanner did not.',
  },

  // ── ZONE 1: THE SHALLOWS ──
  pale_goby: {
    name: 'PALE GOBY', zone: 1, rarity: 'COMMON', goldValue: 2,
    speed: 72, size: 20, wave: null, shape: 'slim',
    desc: 'No pigment. Appears to have lost something recently.',
  },
  linked_eel: {
    name: 'LINKED EEL', zone: 1, rarity: 'UNCOMMON', goldValue: 8,
    speed: 105, size: 32, wave: { amp: 36, freq: 1.8 }, shape: 'eel',
    desc: 'Always found in pairs. The other is never caught.',
  },
  jaw_fish: {
    name: 'JAW FISH', zone: 1, rarity: 'RARE', goldValue: 32,
    speed: 138, size: 25, wave: null, shape: 'jaw',
    desc: 'Mouth constitutes 60% of body mass.',
  },
  signal_carp: {
    name: 'SIGNAL CARP', zone: 1, rarity: 'EPIC', goldValue: 100,
    speed: 158, size: 22, wave: { amp: 20, freq: 3.0 }, shape: 'flat',
    desc: 'Constantly broadcasting. No one is responding.',
  },
  mirror_scale: {
    name: 'MIRROR SCALE', zone: 1, rarity: 'LEGENDARY', goldValue: 350,
    speed: 205, size: 18, wave: { amp: 50, freq: 0.9 }, shape: 'flat',
    desc: 'It shows you something. You cannot repeat what you saw.',
  },

  // ── ZONE 2: THE SANDBANK ──
  dust_feeder: {
    name: 'DUST FEEDER', zone: 2, rarity: 'COMMON', goldValue: 4,
    speed: 80, size: 21, wave: { amp: 6, freq: 5 }, shape: 'fish',
    desc: 'Consumes sediment. Excretes something crystalline.',
  },
  multi_eye: {
    name: 'MULTI-EYE', zone: 2, rarity: 'UNCOMMON', goldValue: 15,
    speed: 112, size: 28, wave: { amp: 24, freq: 2.5 }, shape: 'blob',
    desc: 'Eleven eyes. None of them blink at the same time.',
  },
  the_knot: {
    name: 'THE KNOT', zone: 2, rarity: 'RARE', goldValue: 60,
    speed: 142, size: 19, wave: null, shape: 'eel',
    desc: 'Spine tied into a reef knot. Still functional.',
  },
  depth_worm: {
    name: 'DEPTH WORM', zone: 2, rarity: 'EPIC', goldValue: 180,
    speed: 168, size: 38, wave: { amp: 55, freq: 1.5 }, shape: 'eel',
    desc: 'Pressure at this depth should kill it. Noted.',
  },
  sandborn: {
    name: 'SANDBORN', zone: 2, rarity: 'LEGENDARY', goldValue: 600,
    speed: 200, size: 22, wave: { amp: 30, freq: 2.0 }, shape: 'blob',
    desc: 'Did not swim here. Emerged from below.',
  },

  // ── ZONE 3: THE REEF ──
  irradiated_perch: {
    name: 'IRRADIATED PERCH', zone: 3, rarity: 'COMMON', goldValue: 8,
    speed: 72, size: 24, wave: null, shape: 'fish',
    desc: 'Glows faintly. Probably fine.',
  },
  rust_eel: {
    name: 'RUST EEL', zone: 3, rarity: 'UNCOMMON', goldValue: 28,
    speed: 120, size: 34, wave: { amp: 34, freq: 2.0 }, shape: 'eel',
    desc: 'Corroded metallic scales. Moves in waves.',
  },
  deep_scout: {
    name: 'DEEP SCOUT', zone: 3, rarity: 'RARE', goldValue: 110,
    speed: 198, size: 26, wave: null, shape: 'shark',
    desc: 'It appears to be studying you. Do not make eye contact.',
  },
  abyssal_leech: {
    name: 'ABYSSAL LEECH', zone: 3, rarity: 'EPIC', goldValue: 320,
    speed: 148, size: 28, wave: { amp: 22, freq: 3.2 }, shape: 'blob',
    desc: 'Parasitic. It has been following you longer than you realize.',
  },
  the_watcher: {
    name: 'THE WATCHER', zone: 3, rarity: 'LEGENDARY', goldValue: 1100,
    speed: 200, size: 38, wave: { amp: 18, freq: 0.7 }, shape: 'shark',
    desc: 'You cannot be certain if you caught it, or if it allowed itself to be caught.',
  },

  // ── SPECIAL: clickable creatures per zone ──
  shore_crab: {
    name: 'SHORE CRAB', zone: 0, rarity: 'RARE', goldValue: 50,
    speed: 0, size: 22, wave: null,
    desc: 'Spotted watching from the rocks. You were faster.',
  },
  tide_starfish: {
    name: 'TIDE STARFISH', zone: 1, rarity: 'RARE', goldValue: 65,
    speed: 0, size: 20, wave: null,
    desc: 'Five arms. Each one points somewhere different.',
  },
  buried_dollar: {
    name: 'BURIED DOLLAR', zone: 2, rarity: 'RARE', goldValue: 90,
    speed: 0, size: 18, wave: null,
    desc: 'Partially exposed. The sand was hiding it deliberately.',
  },
};

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DECORATION DATA
// ═══════════════════════════════════════════════════════════════

const COAST_SAND_LEVEL = 0.85; // fraction of canvas height
const COAST_ROCKS = [
  { fx: 0.14, fy: 0.82 },
  { fx: 0.50, fy: 0.84 },
  { fx: 0.80, fy: 0.81 },
];

// ═══════════════════════════════════════════════════════════════
//  UPGRADES
// ═══════════════════════════════════════════════════════════════

const UPGRADE_CATEGORIES = [
  { name: 'LINE CONTROL', ids: ['faster_reel', 'instant_retract', 'rod_speed'] },
  { name: 'TARGETING',    ids: ['targeting_scope'] },
  { name: 'AUTOMATION',   ids: ['salvaged_net', 'sell_batch', 'fish_density'] },
  { name: 'ABILITIES',    ids: ['bait_bomb', 'bait_cooldown', 'bait_strength', 'multi_cast', 'multi_cooldown', 'multi_duration'] },
  { name: 'CONSUMABLES',  ids: [], special: 'consumables' },
];

const CONSUMABLES_DEF = [
  { id: 'small_net', name: 'SMALL NET',  desc: 'Throw a net that captures all fish in a small area. Click to activate, then click on the water.',  cost: 120, netRadius: 90  },
  { id: 'big_net',   name: 'BIG NET',    desc: 'A larger net. Captures all fish in a wide area. Click to activate, then click on the water.',       cost: 320, netRadius: 180 },
  { id: 'worm',      name: 'WORM',       desc: 'Your next cast draws fish toward your hook from a large radius. They swim to it — catch them yourself.', cost: 75 },
];

const UPGRADES_DEF = [
  // LINE CONTROL
  { id: 'faster_reel',     name: 'FASTER RELOAD',     desc: 'Cooldown on recast reduced by 0.4s per level',                                baseCost: 15,  max: 4,  costScale: 1.8, revealAt: 0   },
  { id: 'instant_retract', name: 'QUICK RELEASE',     desc: 'Right-click to retract your hook. Each level increases retract speed by 40%',  baseCost: 25,  max: 5,  costScale: 1.6, revealAt: 0   },
  { id: 'rod_speed',       name: 'FASTER CAST',       desc: 'Increases max cast speed by 20% per level. Tune it in The Boat.',             baseCost: 55,  max: 5,  costScale: 2.0, revealAt: 10  },
  // TARGETING
  { id: 'targeting_scope', name: 'TARGETING SCOPE',   desc: 'Hook catch radius +18% per level',                                            baseCost: 40,  max: 5,  costScale: 1.9, revealAt: 32  },
  // AUTOMATION
  { id: 'salvaged_net',    name: 'SALVAGED NET',      desc: '+1 passive fish caught every 20 seconds per level',                           baseCost: 60,  max: 8,  costScale: 1.7, revealAt: 50  },
  { id: 'sell_batch',      name: 'BATCH SELLER',      desc: 'Unlocks the [SELL ALL] button in the shop',                                   baseCost: 30,  max: 1,  costScale: 1,   revealAt: 20  },
  { id: 'fish_density',    name: 'DEEP BROADCAST',    desc: '+5% max active fish per level. The water gets crowded.',                      baseCost: 45,  max: 10, costScale: 1.6, revealAt: 15  },
  // ABILITIES
  { id: 'bait_bomb',       name: 'BAIT BOMB',         desc: 'Unlocks the BAIT button. Scatter bait to draw a frenzy of fish for 10s.',    baseCost: 200, max: 1,  costScale: 1,   revealAt: 150 },
  { id: 'bait_cooldown',   name: 'BAIT EFFICIENCY',   desc: 'Reduces bait cooldown by 30s per level.',                                     baseCost: 300, max: 5,  costScale: 1.8, revealAt: 300 },
  { id: 'bait_strength',   name: 'BAIT POTENCY',      desc: 'Bait attracts +6 extra fish per level.',                                      baseCost: 350, max: 5,  costScale: 1.7, revealAt: 300 },
  { id: 'multi_cast',      name: 'MULTI-CAST',        desc: 'Unlocks MULTI-CAST. Casts your line in 3 directions for 15s. 3 min cooldown.',baseCost: 500, max: 1,  costScale: 1,   revealAt: 400 },
  { id: 'multi_cooldown',  name: 'MULTI-CAST SPEED',  desc: 'Reduces multi-cast cooldown by 15s per level.',                               baseCost: 600, max: 5,  costScale: 1.8, revealAt: 600 },
  { id: 'multi_duration',  name: 'MULTI-CAST EXTEND', desc: 'Increases multi-cast duration by 3s per level.',                              baseCost: 550, max: 5,  costScale: 1.7, revealAt: 600 },
];

// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════

let state = {
  gold: 0,
  totalGoldEarned: 0,
  currentZone: 0,
  unlockedZones: [0],
  inventory: {},
  upgrades: {
    faster_reel: 0, instant_retract: 0, rod_speed: 0,
    targeting_scope: 0,
    salvaged_net: 0, sell_batch: 0, fish_density: 0,
    bait_bomb: 0, bait_cooldown: 0, bait_strength: 0,
    multi_cast: 0, multi_cooldown: 0, multi_duration: 0,
  },
  consumables: { small_net: 0, big_net: 0, worm: 0 },
  activeConsumable: null,
  stats: { totalCaught: 0, totalCasts: 0 },
  passiveTimer: 0,
  baitTimer: 0,
  baitCooldown: 0,
  multiCastTimer: 0,
  multiCastCooldown: 0,
  boatSettings: { rodSpeedFactor: 1.0 },
  flags: {
    shopUnlocked:       false,
    logUnlocked:        false,
    upgradesUnlocked:   false,
    atlasUnlocked:      false,
    boatUnlocked:       false,
    upgradesVisited:    false,
    atlasVisited:       false,
    logVisited:         false,
    shopVisited:        false,
    boatVisited:        false,
    saveUnlocked:       false,
    baitVisible:        false,
    multiCastVisible:   false,
    consumablesSidebar: false,
  },
};

// ─── Derived ───

function getRecastCooldown() {
  return Math.max(0.3, 1.5 - state.upgrades.faster_reel * 0.4);
}

function getCastSpeed() {
  const baseSpeed = 450;
  const maxSpeed = baseSpeed * (1 + state.upgrades.rod_speed * 0.20);
  return maxSpeed * state.boatSettings.rodSpeedFactor;
}

function getMaxFish() {
  return Math.ceil(ZONES[state.currentZone].maxFish * (1 + state.upgrades.fish_density * 0.05));
}

function getCatchRadius(typeId) {
  const base  = 36;
  const scope = base * state.upgrades.targeting_scope * 0.18;
  return base + scope;
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS / LIVE STATE
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');
let canvasW = 0, canvasH = 0, currentT = 0;

const cv = {
  fish: [], hook: null, cooldown: 0,
  mouseX: 0, mouseY: 0, inCanvas: false,
  spawnTimer: 0,
  bubbles: [], bubbleTimer: 0,
  catchFlashes: [],
  ambientTimer: 28,
  fishIdCounter: 0,
  crab: { active: false, rockIdx: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 45 },
  starfish: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  sandDollar: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  screenShake: { x: 0, y: 0 },
  nets: [],
  ships: [], shipTimer: 15,
  wormExpiry: 0,
};

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  canvasW = wrap.clientWidth  || 800;
  canvasH = wrap.clientHeight || 500;
  canvas.width  = canvasW;
  canvas.height = canvasH;
}

// ─── Fish bleedthrough: rarer fish from previous zone bleed into deeper zones ───
const BLEED_MULTIPLIERS = { COMMON: 0.03, UNCOMMON: 0.10, RARE: 0.40, EPIC: 1.5, LEGENDARY: 4.0 };

function getSpawnPool(zoneId) {
  const zone = ZONES[zoneId];
  const fish = [...zone.fish];
  const weights = [...zone.spawnWeights];
  if (zoneId > 0) {
    const prev = ZONES[zoneId - 1];
    for (let i = 0; i < prev.fish.length; i++) {
      const fishId = prev.fish[i];
      const bleed = prev.spawnWeights[i] * BLEED_MULTIPLIERS[FISH[fishId].rarity];
      if (bleed >= 0.5) { fish.push(fishId); weights.push(bleed); }
    }
  }
  return { fish, weights };
}

function spawnFish() {
  const zone    = ZONES[state.currentZone];
  if (!zone.implemented) return;
  const pool    = getSpawnPool(state.currentZone);
  const weights = pool.weights;
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total, typeId = pool.fish[0];
  for (let i = 0; i < pool.fish.length; i++) { r -= weights[i]; if (r <= 0) { typeId = pool.fish[i]; break; } }

  const dir   = Math.random() < 0.5 ? 1 : -1;
  const baseY = canvasH * 0.1 + Math.random() * canvasH * 0.76;
  const sizeScale = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x
  cv.fish.push({
    id: cv.fishIdCounter++, type: typeId,
    x: dir === 1 ? -80 : canvasW + 80,
    baseY, currentY: baseY, dir,
    waveOffset: Math.random() * Math.PI * 2,
    caught: false, catchAnim: 0, sizeScale,
  });
}

function spawnBubble() {
  cv.bubbles.push({
    x: Math.random() * canvasW, y: canvasH + 5,
    r: 1 + Math.random() * 3.5,
    speed: 14 + Math.random() * 26,
    opacity: 0.06 + Math.random() * 0.18,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 1 + Math.random() * 2,
  });
}

function throwNet(cx, cy, typeId) {
  const def = CONSUMABLES_DEF.find(c => c.id === typeId);
  if (!def || (state.consumables[typeId] || 0) <= 0) return;
  state.consumables[typeId]--;
  state.activeConsumable = null;
  const radius = def.netRadius;
  cv.nets.push({ x: cx, y: cy, radius, timer: 1.4, maxTimer: 1.4 });
  let caught = 0;
  for (const f of cv.fish) {
    if (f.caught) continue;
    const dx = cx - f.x, dy = cy - f.currentY;
    if (Math.sqrt(dx*dx + dy*dy) < radius) { catchFish(f.id, f.type); caught++; }
  }
  addLog(`> NET THROWN: caught ${caught} fish.`);
  audio.play('catch_rare');
  renderConsumablesPanel();
}

function castHook(tx, ty) {
  if (cv.cooldown > 0 || cv.hook) return;
  cv.hook = {
    x: canvasW / 2, y: canvasH + 10,
    ox: canvasW / 2, oy: canvasH + 10,
    tx, ty, state: 'traveling', lingerTimer: 0,
  };
  state.stats.totalCasts++;
  audio.play('cast');

  // Worm: attract fish to cast point
  if (state.activeConsumable === 'worm' && (state.consumables.worm || 0) > 0) {
    state.consumables.worm--;
    state.activeConsumable = null;
    cv.wormExpiry = currentT + 15;
    const wormRadius = 210;
    for (const f of cv.fish) {
      if (f.caught) continue;
      const dx = tx - f.x, dy = ty - f.currentY;
      if (Math.sqrt(dx*dx + dy*dy) < wormRadius) f.attractedTo = { x: tx, y: ty };
    }
    addLog('> WORM DEPLOYED. Something stirs in the water...');
    renderConsumablesPanel();
  }

  // Multi-cast: fire two extra hooks with offset
  if (state.multiCastTimer > 0) {
    const spread = 120;
    for (const offset of [-spread, spread]) {
      const mtx = Math.max(20, Math.min(canvasW - 20, tx + offset));
      setTimeout(() => {
        if (cv.cooldown > 0) return;
        const extraHook = {
          x: canvasW / 2, y: canvasH + 10,
          ox: canvasW / 2, oy: canvasH + 10,
          tx: mtx, ty, state: 'traveling', lingerTimer: 0,
          isExtra: true,
        };
        cv.extraHooks = cv.extraHooks || [];
        cv.extraHooks.push(extraHook);
      }, 60);
    }
  }
}

// ─── Economy ───

function upgradeCost(id) {
  const def = UPGRADES_DEF.find(u => u.id === id);
  return Math.ceil(def.baseCost * Math.pow(def.costScale, state.upgrades[id]));
}

function buyUpgrade(id) {
  const def  = UPGRADES_DEF.find(u => u.id === id);
  const cost = upgradeCost(id);
  if (state.upgrades[id] >= def.max || state.gold < cost) return;
  state.gold -= cost;
  state.upgrades[id]++;
  addLog(`> UPGRADE INSTALLED: ${def.name} [LVL ${state.upgrades[id]}]`);
  audio.play('upgrade');
  updateAllGoldDisplays();
  renderUpgrades();
  if (id === 'sell_batch') updateSellAllBtn();
  checkMilestones();
}

function useBait() {
  if (state.baitCooldown > 0 || state.upgrades.bait_bomb < 1) return;
  state.baitTimer   = 10;
  state.baitCooldown = 300 - state.upgrades.bait_cooldown * 30;
  const fishCount = 18 + state.upgrades.bait_strength * 6;
  for (let i = 0; i < fishCount; i++) setTimeout(() => spawnFish(), i * 80);
  addLog('> BAIT DEPLOYED. Something stirs in the water.');
  updateBaitBtn();
}

function useMultiCast() {
  if (state.multiCastCooldown > 0 || state.upgrades.multi_cast < 1) return;
  const duration = 15 + state.upgrades.multi_duration * 3;
  state.multiCastTimer = duration;
  state.multiCastCooldown = 180 - state.upgrades.multi_cooldown * 15;
  addLog(`> MULTI-CAST ACTIVE for ${duration}s. Lines fly in triplicate.`);
  updateMultiCastBtn();
}

function sellFish(typeId) {
  const count = state.inventory[typeId] || 0;
  if (!count) return;
  const earned = count * FISH[typeId].goldValue;
  state.gold += earned;
  state.totalGoldEarned += earned;
  delete state.inventory[typeId];
  addLog(`> SOLD ${count}× ${FISH[typeId].name} — ${earned}◈`);
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function sellAll() {
  let total = 0, count = 0;
  for (const [id, qty] of Object.entries(state.inventory)) {
    total += qty * FISH[id].goldValue; count += qty; delete state.inventory[id];
  }
  if (!count) return;
  state.gold += total;
  state.totalGoldEarned += total;
  addLog(`> SOLD ALL (${count} fish) — ${total}◈`);
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function purchaseZone(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone || state.gold < zone.unlockCost) return;
  state.gold -= zone.unlockCost;
  state.unlockedZones.push(zoneId);
  updateAllGoldDisplays();
  addLog(`> ZONE ACQUIRED: ${zone.name}`);
  addLog(`> Descending. Something waits at ${zone.depth}m.`);
  audio.play('unlock');
  travelToZone(zoneId);
}

function catchFish(fishId, typeId) {
  const fish = cv.fish.find(f => f.id === fishId);
  if (!fish || fish.caught) return;
  fish.caught = true;
  state.inventory[typeId] = (state.inventory[typeId] || 0) + 1;
  state.stats.totalCaught++;

  const def    = FISH[typeId];
  const rar    = def.rarity;
  const rc     = RARITY_COLORS[rar];
  const logCls = { RARE: 'rare', EPIC: 'epic', LEGENDARY: 'legendary' }[rar] || '';

  cv.catchFlashes.push({ x: fish.x, y: fish.currentY, timer: 1.6, text: `${def.name} [${rar}]`, color: rc.glow });

  addLog(`> CAUGHT: ${def.name} (${rar}) — ${def.goldValue}◈`, logCls);
  if (rar !== 'COMMON' && rar !== 'UNCOMMON') addLog(`  ↳ ${def.desc}`, logCls);

  audio.play(rar === 'COMMON' ? 'catch_common' : 'catch_rare');
  checkMilestones();
  updateAllGoldDisplays();
}

// ─── Milestones ───

function checkMilestones() {
  const f = state.flags;

  if (!f.shopUnlocked && state.stats.totalCaught >= 3) {
    f.shopUnlocked = true;
    showBubble('btn-shop', false);
  }
  if (!f.upgradesUnlocked && state.gold >= 15) {
    f.upgradesUnlocked = true;
    showBubble('btn-upgrades', true);
  }
  if (!f.atlasUnlocked && state.totalGoldEarned >= 100) {
    f.atlasUnlocked = true;
    showBubble('btn-atlas', true);
  }
  if (!f.saveUnlocked && state.totalGoldEarned >= 200) {
    f.saveUnlocked = true;
    document.getElementById('fishing-save-btns').classList.add('visible');
  }

  // Boat unlocks after buying any first upgrade
  const anyUpgradeBought = Object.values(state.upgrades).some(v => v > 0);
  if (!f.boatUnlocked && anyUpgradeBought) {
    f.boatUnlocked = true;
    showBubble('btn-boat', true);
  }

  // Bait button visible once bait_bomb is owned
  if (!f.baitVisible && state.upgrades.bait_bomb >= 1) {
    f.baitVisible = true;
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
    b.classList.add('pulse-new');
    b.offsetHeight;
  }

  // Multi-cast button visible
  if (!f.multiCastVisible && state.upgrades.multi_cast >= 1) {
    f.multiCastVisible = true;
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
    mc.classList.add('pulse-new');
    mc.offsetHeight;
  }

  // Gold counter after first catch
  if (state.stats.totalCaught >= 1) {
    document.getElementById('fishing-gold').classList.add('visible');
  }
}

function updateBaitBtn() {
  const btn = document.getElementById('btn-bait');
  if (!state.flags.baitVisible) return;
  if (state.baitCooldown > 0) {
    btn.classList.add('cooldown');
    btn.classList.remove('pulse-new');
    btn.textContent = Math.ceil(state.baitCooldown);
    btn.title = `BAIT (${Math.ceil(state.baitCooldown)}s)`;
  } else {
    btn.classList.remove('cooldown');
    btn.textContent = 'B';
    btn.title = 'BAIT';
  }
}

function updateMultiCastBtn() {
  const btn = document.getElementById('btn-multicast');
  if (state.upgrades.multi_cast < 1) return;
  if (state.multiCastCooldown > 0) {
    btn.classList.add('cooldown');
    btn.classList.remove('pulse-new');
    btn.textContent = Math.ceil(state.multiCastCooldown);
    btn.title = `MULTI-CAST (${Math.ceil(state.multiCastCooldown)}s)`;
  } else {
    btn.classList.remove('cooldown');
    btn.textContent = 'M';
    btn.title = 'MULTI-CAST';
  }
}

function showBubble(id, unread) {
  const btn = document.getElementById(id);
  btn.style.display = 'block';
  // Force reflow so CSS transition fires
  btn.offsetHeight;
  btn.classList.add('revealed');
  if (unread) btn.classList.add('unread');
}

function updateAllGoldDisplays() {
  const g = Math.floor(state.gold);
  ['gold-fishing', 'gold-shop', 'gold-upgrades', 'gold-log', 'gold-atlas', 'gold-boat'].forEach(id => {
    document.getElementById(id).textContent = g;
  });
}

function updateZoneOverlay() {
  const zone = ZONES[state.currentZone];
  document.getElementById('zone-overlay-code').textContent = zone.code;
  document.getElementById('zone-overlay-name').textContent = zone.name;
  document.getElementById('fishing-zone-label').textContent = zone.name;
}

function flashZoneOverlay() {
  const el = document.getElementById('zone-overlay');
  el.classList.remove('zone-flash');
  el.offsetHeight; // force reflow so animation restarts
  el.classList.add('zone-flash');
}

// ─── Screen management ───

const ALL_SCREENS = ['screen-fishing', 'screen-shop', 'screen-upgrades', 'screen-log', 'screen-atlas', 'screen-boat'];

function switchScreen(to) {
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('flash');
  setTimeout(() => {
    ALL_SCREENS.forEach(id => {
      document.getElementById(id).classList.toggle('active', id === to);
    });
    overlay.classList.remove('flash');

    if (to === 'screen-shop') {
      if (!state.flags.shopVisited) {
        state.flags.shopVisited = true;
        state.flags.logUnlocked = true;
        addLog('> FISHMONGER\'S REFUGE: connection established.');
        addLog('> Sell your catch. Return to water.');
        document.getElementById('btn-back-shop').classList.add('pulse-hint');
      }
      renderShop();
    }
    if (to === 'screen-upgrades') {
      document.getElementById('btn-upgrades').classList.remove('unread');
      state.flags.upgradesVisited = true;
      renderUpgrades();
    }
    if (to === 'screen-atlas') {
      document.getElementById('btn-atlas').classList.remove('unread');
      state.flags.atlasVisited = true;
      renderAtlas();
    }
    if (to === 'screen-log') {
      document.getElementById('btn-log').classList.remove('unread');
      state.flags.logVisited = true;
    }
    if (to === 'screen-boat') {
      document.getElementById('btn-boat').classList.remove('unread');
      state.flags.boatVisited = true;
      renderBoat();
    }
    if (to === 'screen-fishing') {
      // Show log button if unlocked but not yet shown
      if (state.flags.logUnlocked && !document.getElementById('btn-log').classList.contains('revealed')) {
        showBubble('btn-log', !state.flags.logVisited);
      }
    }
  }, 180);
}

// ─── Travel animation ───

function travelToZone(zoneId) {
  const overlay  = document.getElementById('travel-overlay');
  const depthEl  = document.getElementById('travel-depth');
  const labelEl  = document.getElementById('travel-label');
  const zone     = ZONES[zoneId];
  const fromD    = ZONES[state.currentZone].depth;
  const toD      = zone.depth;
  const goingDown = toD > fromD;

  labelEl.textContent = goingDown ? `DESCENDING TO ${zone.name}...` : `ASCENDING TO ${zone.name}...`;
  document.getElementById('travel-sub').textContent = goingDown ? 'PRESSURE RISING' : 'PRESSURE DROPPING';

  let depth = fromD;
  depthEl.textContent = `${Math.round(depth)}m`;
  overlay.classList.add('active');

  const sign = goingDown ? 1 : -1;
  const timer = setInterval(() => {
    const diff = Math.abs(toD - depth);
    depth += sign * Math.max(1, diff * 0.045 + 1.5);
    if ((goingDown && depth >= toD) || (!goingDown && depth <= toD)) {
      depth = toD;
      depthEl.textContent = `${Math.round(depth)}m`;
      clearInterval(timer);
      state.currentZone = zoneId;
      cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 0;
      updateZoneOverlay();
      setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => { switchScreen('screen-fishing'); flashZoneOverlay(); }, 500);
      }, 800);
    } else {
      depthEl.textContent = `${Math.round(depth)}m`;
    }
  }, 28);
}

// ═══════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════

function loop(timestamp) {
  const t  = timestamp / 1000;
  const dt = Math.min(t - currentT, 0.1);
  currentT = t;
  update(dt, t);
  if (document.getElementById('screen-fishing').classList.contains('active')) draw();
  requestAnimationFrame(loop);
}

function update(dt, t) {
  const zone = ZONES[state.currentZone];

  for (let i = cv.fish.length - 1; i >= 0; i--) {
    const f = cv.fish[i];
    if (f.caught) {
      f.catchAnim = Math.min(1, f.catchAnim + dt * 2.8);
      if (f.catchAnim >= 1) cv.fish.splice(i, 1);
      continue;
    }
    const def = FISH[f.type];
    if (f.attractedTo) {
      const dx = f.attractedTo.x - f.x, dy = f.attractedTo.y - f.currentY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 8) {
        const spd = def.speed * 1.6 * dt;
        f.x += (dx/dist) * spd;
        f.currentY += (dy/dist) * spd * 0.6;
        f.baseY = f.currentY;
        f.dir = dx >= 0 ? 1 : -1;
      }
    } else {
      f.x += def.speed * f.dir * dt;
      f.currentY = def.wave
        ? f.baseY + Math.sin(t * def.wave.freq + f.waveOffset) * def.wave.amp
        : f.baseY;
    }
    f.currentY = Math.max(36, Math.min(canvasH - 44, f.currentY));
    if ((f.dir === 1 && f.x > canvasW + 90) || (f.dir === -1 && f.x < -90)) cv.fish.splice(i, 1);
  }

  // Worm expiry
  if (cv.wormExpiry > 0 && t > cv.wormExpiry) {
    cv.wormExpiry = 0;
    cv.fish.forEach(f => { delete f.attractedTo; });
  }

  // Nets
  for (let i = cv.nets.length - 1; i >= 0; i--) {
    cv.nets[i].timer -= dt;
    if (cv.nets[i].timer <= 0) cv.nets.splice(i, 1);
  }

  // Ships (coast only)
  if (state.currentZone === 0) {
    cv.shipTimer -= dt;
    if (cv.shipTimer <= 0) {
      cv.shipTimer = 22 + Math.random() * 35;
      const dir = Math.random() < 0.5 ? 1 : -1;
      cv.ships.push({
        x: dir === 1 ? -200 : canvasW + 200,
        y: canvasH * 0.025 + Math.random() * canvasH * 0.025,
        dir, speed: 22 + Math.random() * 18,
        size: 0.7 + Math.random() * 0.5,
      });
    }
    for (let i = cv.ships.length - 1; i >= 0; i--) {
      cv.ships[i].x += cv.ships[i].dir * cv.ships[i].speed * dt;
      if (cv.ships[i].x > canvasW + 300 || cv.ships[i].x < -300) cv.ships.splice(i, 1);
    }
  }

  cv.spawnTimer -= dt;
  if (cv.spawnTimer <= 0) {
    if (cv.fish.filter(f => !f.caught).length < getMaxFish()) spawnFish();
    cv.spawnTimer = 1.3 + Math.random() * 2.0;
  }

  // Bait timers
  if (state.baitTimer > 0) {
    state.baitTimer = Math.max(0, state.baitTimer - dt);
  }
  if (state.baitCooldown > 0) {
    state.baitCooldown = Math.max(0, state.baitCooldown - dt);
    updateBaitBtn();
  }
  if (state.multiCastTimer > 0) {
    state.multiCastTimer = Math.max(0, state.multiCastTimer - dt);
  }
  if (state.multiCastCooldown > 0) {
    state.multiCastCooldown = Math.max(0, state.multiCastCooldown - dt);
    updateMultiCastBtn();
  }

  if (cv.hook) {
    const h = cv.hook;
    const SPEED = getCastSpeed();
    if (h.state === 'traveling') {
      const dx = h.tx - h.x, dy = h.ty - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = SPEED * dt;
      if (step >= dist) {
        h.x = h.tx; h.y = h.ty; h.state = 'lingering'; h.lingerTimer = 0;
      } else {
        h.x += (dx / dist) * step; h.y += (dy / dist) * step;
      }
      checkHookCollision(h.x, h.y);
    } else if (h.state === 'lingering') {
      h.lingerTimer += dt;
      checkHookCollision(h.x, h.y);
      if (h.lingerTimer >= 0.44) h.state = 'retracting';
    } else if (h.state === 'retracting') {
      const dx = h.ox - h.x, dy = h.oy - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const retractMult = h.quickRetract ? (1 + (Math.max(0, state.upgrades.instant_retract - 1) * 0.40)) : 1;
      const step = Math.max(SPEED, 600) * retractMult * dt;
      if (step >= dist) {
        cv.hook = null; cv.cooldown = getRecastCooldown();
        cv.fish.forEach(f => { delete f.attractedTo; }); cv.wormExpiry = 0;
      }
      else { h.x += (dx / dist) * step; h.y += (dy / dist) * step; }
      checkHookCollision(h.x, h.y); // ← catch on retract
    }
  }

  // Extra hooks from multi-cast
  if (cv.extraHooks && cv.extraHooks.length) {
    const SPEED = getCastSpeed();
    for (let i = cv.extraHooks.length - 1; i >= 0; i--) {
      const h = cv.extraHooks[i];
      if (h.state === 'traveling') {
        const dx = h.tx - h.x, dy = h.ty - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = SPEED * dt;
        if (step >= dist) { h.x = h.tx; h.y = h.ty; h.state = 'lingering'; h.lingerTimer = 0; }
        else { h.x += (dx / dist) * step; h.y += (dy / dist) * step; }
        checkHookCollision(h.x, h.y);
      } else if (h.state === 'lingering') {
        h.lingerTimer += dt;
        checkHookCollision(h.x, h.y);
        if (h.lingerTimer >= 0.44) h.state = 'retracting';
      } else if (h.state === 'retracting') {
        const dx = h.ox - h.x, dy = h.oy - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(SPEED, 600) * dt;
        if (step >= dist) { cv.extraHooks.splice(i, 1); continue; }
        else { h.x += (dx / dist) * step; h.y += (dy / dist) * step; }
        checkHookCollision(h.x, h.y);
      }
    }
  }

  if (cv.cooldown > 0) cv.cooldown = Math.max(0, cv.cooldown - dt);

  cv.bubbleTimer -= dt;
  if (cv.bubbleTimer <= 0) { spawnBubble(); cv.bubbleTimer = 0.28 + Math.random() * 0.55; }
  for (let i = cv.bubbles.length - 1; i >= 0; i--) {
    const b = cv.bubbles[i];
    b.y -= b.speed * dt;
    b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.5;
    if (b.y < -8) cv.bubbles.splice(i, 1);
  }

  for (let i = cv.catchFlashes.length - 1; i >= 0; i--) {
    cv.catchFlashes[i].timer -= dt;
    if (cv.catchFlashes[i].timer <= 0) cv.catchFlashes.splice(i, 1);
  }

  if (state.upgrades.salvaged_net > 0) {
    state.passiveTimer += dt;
    if (state.passiveTimer >= 20) {
      state.passiveTimer -= 20;
      const highestZoneId = Math.max(...state.unlockedZones.filter(z => ZONES[z].implemented));
      const hz = ZONES[highestZoneId];
      const n = state.upgrades.salvaged_net;
      for (let pi = 0; pi < n; pi++) {
        const weights = hz.spawnWeights;
        const total = weights.reduce((a, b) => a + b, 0);
        let roll = Math.random() * total, passiveType = hz.fish[0];
        for (let wi = 0; wi < hz.fish.length; wi++) { roll -= weights[wi]; if (roll <= 0) { passiveType = hz.fish[wi]; break; } }
        state.inventory[passiveType] = (state.inventory[passiveType] || 0) + 1;
      }
      state.stats.totalCaught += n;
      addLog(`> NET CATCH: +${n} fish from ${hz.name}`);
      checkMilestones();
      updateAllGoldDisplays();
    }
  }

  cv.ambientTimer -= dt;
  if (cv.ambientTimer <= 0 && zone.ambientMessages.length) {
    cv.ambientTimer = 36 + Math.random() * 52;
    addLog(zone.ambientMessages[Math.floor(Math.random() * zone.ambientMessages.length)]);
  }

  if (state.currentZone === 0) updateCrab(dt);
  if (state.currentZone === 1) updateZoneSpecial(cv.starfish, dt);
  if (state.currentZone === 2) updateZoneSpecial(cv.sandDollar, dt);

  checkMilestones();
}

function checkHookCollision(hx, hy) {
  for (const f of cv.fish) {
    if (f.caught) continue;
    const dx = hx - f.x, dy = hy - f.currentY;
    if (Math.sqrt(dx * dx + dy * dy) < getCatchRadius(f.type) + FISH[f.type].size * 0.55) {
      catchFish(f.id, f.type);
    }
  }
}

function updateCrab(dt) {
  const c = cv.crab;
  if (!c.active) {
    c.spawnTimer -= dt;
    if (c.spawnTimer <= 0) {
      c.active = true;
      c.rockIdx = Math.floor(Math.random() * COAST_ROCKS.length);
      c.peekAnim = 0; c.peekDir = 1; c.lingerTimer = 0;
    }
    return;
  }
  if (c.peekDir === 1) {
    c.peekAnim = Math.min(1, c.peekAnim + dt / 0.55);
    if (c.peekAnim >= 1) { c.peekDir = 0; c.lingerTimer = 6; }
  } else if (c.peekDir === 0) {
    c.lingerTimer -= dt;
    if (c.lingerTimer <= 0) c.peekDir = -1;
  } else {
    c.peekAnim = Math.max(0, c.peekAnim - dt / 0.45);
    if (c.peekAnim <= 0) { c.active = false; c.spawnTimer = 45 + Math.random() * 55; }
  }
}

function clickCrab(cx, cy) {
  const c = cv.crab;
  if (!c.active || c.peekAnim < 0.3) return false;
  const rock = COAST_ROCKS[c.rockIdx];
  const rx = rock.fx * canvasW;
  const ry = canvasH * rock.fy - 18 - 12 + (1 - c.peekAnim) * 40;
  if (Math.sqrt((cx - rx) ** 2 + (cy - ry) ** 2) < 34) {
    state.inventory['shore_crab'] = (state.inventory['shore_crab'] || 0) + 1;
    state.stats.totalCaught++;
    cv.catchFlashes.push({ x: rx, y: ry, timer: 1.6, text: 'SHORE CRAB [RARE]', color: RARITY_COLORS.RARE.glow });
    addLog('> CAUGHT: SHORE CRAB (RARE) — 50◈', 'rare');
    audio.play('catch_rare');
    c.active = false;
    c.spawnTimer = 30 + Math.random() * 45;
    checkMilestones();
    return true;
  }
  return false;
}

function updateZoneSpecial(obj, dt) {
  if (!obj.active) {
    obj.spawnTimer -= dt;
    if (obj.spawnTimer <= 0) {
      obj.active = true;
      obj.fx = 0.15 + Math.random() * 0.7;
      obj.fy = 0.78 + Math.random() * 0.08;
      obj.peekAnim = 0; obj.peekDir = 1; obj.lingerTimer = 0;
    }
    return;
  }
  if (obj.peekDir === 1) {
    obj.peekAnim = Math.min(1, obj.peekAnim + dt / 0.6);
    if (obj.peekAnim >= 1) { obj.peekDir = 0; obj.lingerTimer = 5; }
  } else if (obj.peekDir === 0) {
    obj.lingerTimer -= dt;
    if (obj.lingerTimer <= 0) obj.peekDir = -1;
  } else {
    obj.peekAnim = Math.max(0, obj.peekAnim - dt / 0.5);
    if (obj.peekAnim <= 0) { obj.active = false; obj.spawnTimer = 40 + Math.random() * 50; }
  }
}

function clickZoneSpecial(cx, cy) {
  if (state.currentZone === 0) return clickCrab(cx, cy);
  if (state.currentZone === 1) return clickSpecial(cv.starfish, 'tide_starfish', cx, cy);
  if (state.currentZone === 2) return clickSpecial(cv.sandDollar, 'buried_dollar', cx, cy);
  return false;
}

function clickSpecial(obj, typeId, cx, cy) {
  if (!obj.active || obj.peekAnim < 0.3) return false;
  const rx = obj.fx * canvasW;
  const ry = obj.fy * canvasH;
  if (Math.sqrt((cx - rx) ** 2 + (cy - ry) ** 2) < 36) {
    const def = FISH[typeId];
    state.inventory[typeId] = (state.inventory[typeId] || 0) + 1;
    state.stats.totalCaught++;
    cv.catchFlashes.push({ x: rx, y: ry, timer: 1.6, text: `${def.name} [RARE]`, color: RARITY_COLORS.RARE.glow });
    addLog(`> CAUGHT: ${def.name} (RARE) — ${def.goldValue}◈`, 'rare');
    audio.play('catch_rare');
    obj.active = false;
    obj.spawnTimer = 35 + Math.random() * 45;
    checkMilestones();
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS DRAWING
// ═══════════════════════════════════════════════════════════════

function draw() {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const skyH = canvasH * 0.08;
  if (state.currentZone === 0) {
    // Sky strip
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH);
    skyGrad.addColorStop(0, '#001122'); skyGrad.addColorStop(1, '#003333');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvasW, skyH);
    // Water
    const bg = ctx.createLinearGradient(0, skyH, 0, canvasH);
    bg.addColorStop(0, '#009966'); bg.addColorStop(0.4, '#006644'); bg.addColorStop(1, '#002e1a');
    ctx.fillStyle = bg; ctx.fillRect(0, skyH, canvasW, canvasH - skyH);
    ctx.strokeStyle = '#006644'; ctx.lineWidth = 0.5;
  } else if (state.currentZone <= 2) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#006644'); bg.addColorStop(0.5, '#004433'); bg.addColorStop(1, '#001e10');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#004422'; ctx.lineWidth = 0.5;
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#003322'); bg.addColorStop(0.5, '#001e10'); bg.addColorStop(1, '#000e05');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#002214'; ctx.lineWidth = 0.5;
  }
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Zone-specific decorations
  if (state.currentZone === 0) {
    drawCoastBackground();
    drawWaterSurface(skyH);
    for (const ship of cv.ships) drawShip(ship);
    if (cv.crab.active) {
      const rock = COAST_ROCKS[cv.crab.rockIdx];
      drawCrab(rock.fx * canvasW, canvasH * rock.fy - 18, cv.crab.peekAnim);
    }
  } else if (state.currentZone === 1) {
    drawShallowsBackground();
    if (cv.starfish.active) drawClickStarfish(cv.starfish);
  } else if (state.currentZone === 2) {
    drawSandbankBackground();
    if (cv.sandDollar.active) drawClickSandDollar(cv.sandDollar);
  } else if (state.currentZone === 3) {
    drawReefBackground();
  }

  // Screen shake (unused, kept for future use)
  if (cv.screenShake.x !== 0 || cv.screenShake.y !== 0) {
    ctx.save();
    ctx.translate(cv.screenShake.x, cv.screenShake.y);
  }

  for (const b of cv.bubbles) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,255,136,${b.opacity})`; ctx.lineWidth = 0.5; ctx.stroke();
  }

  if (cv.inCanvas && !cv.hook && cv.cooldown <= 0) drawReticle(cv.mouseX, cv.mouseY);
  for (const f of cv.fish) drawFish(f);
  if (cv.hook) drawHook(cv.hook);
  if (cv.extraHooks) for (const eh of cv.extraHooks) drawHook(eh);
  for (const net of cv.nets) drawNet(net);

  // Close screen shake transform
  if (cv.screenShake.x !== 0 || cv.screenShake.y !== 0) ctx.restore();

  for (const fl of cv.catchFlashes) {
    const alpha = Math.min(1, fl.timer * 1.3);
    const rise  = (1.6 - fl.timer) * 44;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 13px "Space Mono",monospace';
    ctx.fillStyle = fl.color; ctx.shadowColor = fl.color; ctx.shadowBlur = 14;
    ctx.textAlign = 'center';
    ctx.fillText(fl.text, Math.max(100, Math.min(canvasW - 100, fl.x)), fl.y - rise - 14);
    ctx.restore();
  }

  if (cv.cooldown > 0) {
    const frac = cv.cooldown / getRecastCooldown();
    const bw = 160, bx = canvasW / 2 - bw / 2, by = canvasH - 22;
    ctx.fillStyle = '#001a08'; ctx.fillRect(bx, by, bw, 7);
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#00ff88'; ctx.fillRect(bx, by, bw * (1 - frac), 7);
    ctx.shadowBlur = 0;
    ctx.font = '10px "Space Mono"'; ctx.fillStyle = '#005530'; ctx.textAlign = 'center';
    ctx.fillText('RELOADING...', canvasW / 2, by - 6);
  }

  // zone indicator removed from canvas — shown in HUD instead
}

function drawFish(f) {
  const shape = FISH[f.type].shape || 'fish';
  if (shape === 'eel')   return drawEel(f);
  if (shape === 'shark') return drawShark(f);
  if (shape === 'blob')  return drawBlob(f);
  if (shape === 'flat')  return drawFlat(f);
  if (shape === 'slim')  return drawSlim(f);
  if (shape === 'jaw')   return drawJaw(f);
  drawDefaultFish(f);
}

function fishTransform(f) {
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff  = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  const sc    = f.caught ? baseSc * (1 + f.catchAnim * 0.5) : baseSc;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(sc * f.dir, sc);
  return { alpha, sc };
}

function drawDefaultFish(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.43, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.65, -sz * 0.46); ctx.lineTo(-sz * 1.65, sz * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.1, -sz * 0.43); ctx.lineTo(sz * 0.2, -sz * 0.88); ctx.lineTo(sz * 0.5, -sz * 0.43);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = '#000a03';
  ctx.beginPath(); ctx.arc(sz * 0.44, -sz * 0.1, sz * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = rc.eye; ctx.shadowBlur = 8; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.44, -sz * 0.1, sz * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSlim(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.2, sz * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.1, 0); ctx.lineTo(-sz * 2.0, -sz * 0.35); ctx.lineTo(-sz * 2.0, sz * 0.35);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.7, 0, sz * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawJaw(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  // Big mouth
  ctx.fillStyle = '#000500';
  ctx.beginPath(); ctx.ellipse(sz * 0.6, sz * 0.2, sz * 0.55, sz * 0.25, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(sz * 0.55, sz * 0.08, sz * 0.5, sz * 0.15, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.8, 0); ctx.lineTo(-sz * 1.6, -sz * 0.5); ctx.lineTo(-sz * 1.6, sz * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.25, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEel(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff  = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(f.dir * baseSc, baseSc);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10; ctx.strokeStyle = rc.color;
  ctx.lineWidth = sz * 0.32;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const segs = 8, len = sz * 2.8;
  ctx.moveTo(len * 0.5, 0);
  for (let i = 1; i <= segs; i++) {
    const p = i / segs;
    const wx = Math.sin(currentT * 3.5 + p * 4 + f.waveOffset) * sz * 0.6 * p;
    ctx.lineTo(len * 0.5 - len * p, wx);
  }
  ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(len * 0.45, -sz * 0.1, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawShark(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 16; ctx.fillStyle = rc.color;
  // Streamlined body
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.4, sz * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  // Tail (crescent)
  ctx.beginPath();
  ctx.moveTo(-sz * 1.3, 0);
  ctx.lineTo(-sz * 2.2, -sz * 0.65); ctx.lineTo(-sz * 1.6, 0);
  ctx.lineTo(-sz * 2.2,  sz * 0.65); ctx.closePath(); ctx.fill();
  // Dorsal fin (big, top)
  ctx.beginPath();
  ctx.moveTo(-sz * 0.2, -sz * 0.38);
  ctx.lineTo(sz * 0.4, -sz * 1.2);
  ctx.lineTo(sz * 0.8, -sz * 0.38);
  ctx.closePath(); ctx.fill();
  // Pectoral fin
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, sz * 0.2);
  ctx.lineTo(-sz * 0.4, sz * 0.85);
  ctx.lineTo(sz * 0.5, sz * 0.3);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha;
  // Eye (small, black)
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBlob(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 18; ctx.fillStyle = rc.color;
  // Lumpy round body
  ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = rc.glow;
  ctx.beginPath(); ctx.arc(-sz * 0.3, -sz * 0.2, sz * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  // Stubby tail
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.9, 0); ctx.lineTo(-sz * 1.5, -sz * 0.5); ctx.lineTo(-sz * 1.5, sz * 0.5);
  ctx.closePath(); ctx.fill();
  // Multiple eyes suggestion
  ctx.shadowBlur = 0;
  const eyePos = [{ x: sz*0.3, y: -sz*0.3 }, { x: sz*0.6, y: sz*0.1 }, { x: sz*0.1, y: sz*0.4 }];
  for (const ep of eyePos) {
    ctx.fillStyle = '#000500';
    ctx.beginPath(); ctx.arc(ep.x, ep.y, sz * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rc.eye;
    ctx.beginPath(); ctx.arc(ep.x, ep.y, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFlat(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12; ctx.fillStyle = rc.color;
  // Wide flat body
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.3, sz * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  // Flat tail
  ctx.beginPath();
  ctx.moveTo(-sz * 1.2, 0); ctx.lineTo(-sz * 2.0, -sz * 0.6); ctx.lineTo(-sz * 2.0, sz * 0.6);
  ctx.closePath(); ctx.fill();
  // Pectoral fins (wing-like)
  ctx.globalAlpha = alpha * 0.65;
  ctx.beginPath(); ctx.ellipse(0, sz * 0.55, sz * 0.9, sz * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -sz * 0.55, sz * 0.9, sz * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.7, -sz * 0.05, sz * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawHook(h) {
  const hx = h.x;
  const hy = h.y;
  const col = '#00ff88';
  const lineCol = 'rgba(0,255,136,0.25)';

  ctx.save();
  ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(h.ox, h.oy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(hx-s, hy); ctx.lineTo(hx+s, hy);
  ctx.moveTo(hx, hy-s); ctx.lineTo(hx, hy+s);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawReticle(mx, my) {
  ctx.save();
  const ac = state.activeConsumable;
  const netDef = ac && (ac === 'small_net' || ac === 'big_net') ? CONSUMABLES_DEF.find(c => c.id === ac) : null;
  const isWorm = ac === 'worm';

  if (netDef) {
    // Net mode: show net radius circle
    ctx.strokeStyle = 'rgba(68,255,170,0.5)'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 12;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(mx, my, netDef.netRadius, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = isWorm ? 'rgba(255,200,50,0.18)' : 'rgba(0,255,136,0.16)'; ctx.lineWidth = 1;
  ctx.setLineDash([5, 9]);
  ctx.beginPath(); ctx.moveTo(canvasW/2, canvasH); ctx.lineTo(mx, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = isWorm ? 'rgba(255,200,50,0.1)' : 'rgba(0,255,136,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(mx, my, getCatchRadius(), 0, Math.PI*2); ctx.stroke();
  if (isWorm) {
    ctx.strokeStyle = 'rgba(255,200,50,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(mx, my, 210, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.shadowColor = isWorm ? '#ffcc44' : '#00ff88'; ctx.shadowBlur = 10;
  ctx.strokeStyle = isWorm ? 'rgba(255,200,50,0.7)' : 'rgba(0,255,136,0.58)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI*2); ctx.stroke();
  const r=13, g=7;
  ctx.strokeStyle = isWorm ? 'rgba(255,200,50,0.5)' : 'rgba(0,255,136,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mx-r-g,my); ctx.lineTo(mx+r+g,my);
  ctx.moveTo(mx,my-r-g); ctx.lineTo(mx,my+r+g);
  ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DRAWING
// ═══════════════════════════════════════════════════════════════

function drawCoastBackground() {
  const sandY = canvasH * COAST_SAND_LEVEL;
  const t = currentT;

  // Sunlight rays drifting from above
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const rx = canvasW * (0.08 + i * 0.21 + Math.sin(t * 0.22 + i * 1.4) * 0.03);
    const w  = canvasW * 0.065;
    const rayGrad = ctx.createLinearGradient(rx, 0, rx, sandY);
    rayGrad.addColorStop(0, 'rgba(80,255,160,0.08)');
    rayGrad.addColorStop(1, 'rgba(80,255,160,0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rx - w * 0.4, 0); ctx.lineTo(rx + w, sandY); ctx.lineTo(rx - w, sandY);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Sandy bottom
  ctx.save();
  const sandGrad = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sandGrad.addColorStop(0, '#141f0d'); sandGrad.addColorStop(1, '#080f06');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  // Coral formations
  drawCoral(canvasW * 0.07, sandY, 0.85, '#ff5533', '#ff8855');
  drawCoral(canvasW * 0.22, sandY, 0.60, '#ff3377', '#ff77aa');
  drawCoral(canvasW * 0.63, sandY, 0.90, '#ff5533', '#ffaa55');
  drawCoral(canvasW * 0.88, sandY, 0.70, '#33cc77', '#55ffaa');

  // Seaweed
  drawSeaweed(canvasW * 0.38, sandY, 55, '#00aa44');
  drawSeaweed(canvasW * 0.41, sandY, 40, '#008833');
  drawSeaweed(canvasW * 0.94, sandY, 62, '#00bb55');

  // Rocks (crab hides behind these)
  for (const rock of COAST_ROCKS) {
    drawRock(rock.fx * canvasW, canvasH * rock.fy);
  }

  // Starfish scattered on the sand
  drawStarfish(canvasW * 0.32, sandY + 12, 8, '#ff8844');
  drawStarfish(canvasW * 0.47, sandY + 8,  6, '#ff6622');
  drawStarfish(canvasW * 0.70, sandY + 14, 9, '#ff9933');
  drawStarfish(canvasW * 0.90, sandY + 10, 7, '#ffbb44');

  // Small shell clusters (tiny arcs)
  ctx.save();
  ctx.strokeStyle = 'rgba(0,180,80,0.3)'; ctx.lineWidth = 1.2;
  for (const [sx, sy] of [[0.2, sandY+16], [0.58, sandY+20], [0.77, sandY+14]]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(canvasW * sx + i * 7, sy, 4, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCoral(x, baseY, scale, color1, color2) {
  ctx.save();
  ctx.translate(x, baseY);
  function branch(fx, fy, angle, len, depth) {
    if (len < 5) return;
    const tx = fx + Math.cos(angle) * len;
    const ty = fy - Math.abs(Math.sin(angle)) * len;
    ctx.strokeStyle = depth > 1 ? color1 : color2;
    ctx.lineWidth = Math.max(1.5, depth * 2.2);
    ctx.shadowColor = color2; ctx.shadowBlur = depth * 4;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke();
    if (depth <= 1) {
      ctx.fillStyle = color2; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    branch(tx, ty, angle + 0.55, len * 0.65, depth - 1);
    branch(tx, ty, angle - 0.45, len * 0.62, depth - 1);
  }
  branch(0, 0, Math.PI / 2, 55 * scale, 3);
  ctx.restore();
}

function drawSeaweed(x, baseY, height, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.shadowColor = color; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.moveTo(x, baseY);
  for (let i = 1; i <= 10; i++) {
    const p = i / 10;
    ctx.lineTo(x + Math.sin(currentT * 1.3 + p * 5) * 10 * p, baseY - height * p);
  }
  ctx.stroke(); ctx.restore();
}

function drawRock(x, y) {
  ctx.save();
  ctx.fillStyle = '#060e06';
  ctx.beginPath(); ctx.ellipse(x + 3, y + 6, 34, 16, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0e1e0e'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.ellipse(x, y, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#131f10'; ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.ellipse(x - 6, y - 5, 17, 8, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCrab(x, rockTopY, peekAnim) {
  const yOff  = (1 - peekAnim) * 40;
  const alpha = Math.min(1, peekAnim * 3.5);
  if (alpha <= 0.01) return;
  const cy = rockTopY - 12 + yOff;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, cy);

  // Legs (behind body)
  ctx.strokeStyle = '#1144aa'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = -6 + i * 6;
    ctx.beginPath(); ctx.moveTo(lx - 12, 4); ctx.lineTo(lx - 21, 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-lx + 12, 4); ctx.lineTo(-lx + 21, 14); ctx.stroke();
  }

  // Body
  ctx.fillStyle = '#1155cc'; ctx.shadowColor = '#4499ff'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();

  // Claws
  ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(-22, -4, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22, -4, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();

  // Eye stalks
  ctx.shadowBlur = 0; ctx.strokeStyle = '#1155cc'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-5, -17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(5, -17); ctx.stroke();

  // Eyes
  ctx.fillStyle = '#000a22';
  ctx.beginPath(); ctx.arc(-5, -17, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -17, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22aaff';
  ctx.beginPath(); ctx.arc(-5, -17, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -17, 1.8, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawStarfish(x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.translate(x, y);
  ctx.rotate(currentT * 0.05);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const b = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(b) * r * 0.42, Math.sin(b) * r * 0.42);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickStarfish(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 20;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff6644';
  ctx.shadowColor = '#ff8866';
  ctx.shadowBlur = 12;
  ctx.translate(x, y);
  ctx.rotate(Math.sin(currentT * 0.5) * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const b = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.lineTo(Math.cos(b) * 6, Math.sin(b) * 6);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickSandDollar(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#997755';
  ctx.shadowColor = '#bbaa88';
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#bbaa88'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaterSurface(y) {
  const t = currentT;
  ctx.save();
  ctx.shadowColor = '#44ffbb'; ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(80,255,180,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= canvasW; x += 4) {
    const wy = y + Math.sin(x * 0.025 + t * 1.1) * 3 + Math.sin(x * 0.06 + t * 0.7) * 1.5;
    x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(80,255,180,0.18)'; ctx.lineWidth = 1; ctx.shadowBlur = 0;
  ctx.beginPath();
  for (let x = 0; x <= canvasW; x += 4) {
    const wy = y + 7 + Math.sin(x * 0.04 + t * 0.85 + 1.5) * 2;
    x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawShip(ship) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.scale(ship.dir * ship.size, ship.size);
  ctx.fillStyle = 'rgba(0,15,8,0.85)';
  ctx.shadowColor = '#002211'; ctx.shadowBlur = 6;
  // Hull
  ctx.beginPath();
  ctx.moveTo(-55, 0); ctx.lineTo(-48, 12); ctx.lineTo(55, 12); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill();
  // Superstructure
  ctx.fillRect(-18, -18, 38, 18);
  // Mast
  ctx.fillStyle = 'rgba(0,20,10,0.95)';
  ctx.fillRect(-1, -46, 3, 28);
  // Small cabin top
  ctx.fillStyle = 'rgba(0,15,8,0.85)';
  ctx.fillRect(-8, -30, 18, 12);
  ctx.restore();
}

function drawNet(net) {
  const progress = 1 - net.timer / net.maxTimer;
  const r = net.radius * (0.25 + progress * 0.75);
  const alpha = (net.timer / net.maxTimer) * 0.8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#44ffaa'; ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 16;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(net.x, net.y, r, 0, Math.PI * 2); ctx.stroke();
  // Radial grid lines
  ctx.lineWidth = 0.8; ctx.shadowBlur = 6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
    ctx.beginPath();
    ctx.moveTo(net.x, net.y);
    ctx.lineTo(net.x + Math.cos(a) * r, net.y + Math.sin(a) * r);
    ctx.stroke();
  }
  // Inner ring
  ctx.beginPath(); ctx.arc(net.x, net.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ─── Zone 1: The Shallows ───────────────────────────────────────
function drawShallowsBackground() {
  const sandY = canvasH * 0.87;
  const t = currentT;

  // Lighter sandy bottom (shallows — more visible)
  ctx.save();
  const sg = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sg.addColorStop(0, '#16200e'); sg.addColorStop(1, '#0a1208');
  ctx.fillStyle = sg; ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  // Faint ripple lines in sand
  ctx.save();
  ctx.strokeStyle = 'rgba(0,180,80,0.07)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const ry = sandY + 10 + i * 16;
    ctx.beginPath();
    for (let x = 0; x < canvasW; x += 4) {
      const y = ry + Math.sin(x * 0.06 + t * 0.4 + i) * 3;
      i === 0 && x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Sparse seaweed clusters
  drawSeaweed(canvasW * 0.12, sandY, 45, '#007733');
  drawSeaweed(canvasW * 0.15, sandY, 32, '#006622');
  drawSeaweed(canvasW * 0.55, sandY, 50, '#008844');
  drawSeaweed(canvasW * 0.72, sandY, 38, '#007733');
  drawSeaweed(canvasW * 0.75, sandY, 26, '#005522');

  // A few small rocks
  ctx.save();
  ctx.fillStyle = '#0c1a0c'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.ellipse(canvasW * 0.28, sandY + 8, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.68, sandY + 6, 14, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.88, sandY + 10, 22, 11, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Pale anemones
  for (const ax of [0.3, 0.7, 0.9]) {
    drawAnemone(canvasW * ax, sandY, '#88ffcc');
  }
}

function drawAnemone(x, baseY, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowColor = color; ctx.shadowBlur = 6;
  const t = currentT;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const len = 14 + Math.sin(t * 1.5 + i) * 5;
    const wx  = Math.sin(t * 1.2 + i * 0.8) * 4;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + wx, baseY - len * 0.6, x + Math.cos(angle) * 8, baseY - len);
    ctx.stroke();
    ctx.fillStyle = color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(x + Math.cos(angle) * 8, baseY - len, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 2: The Sandbank ───────────────────────────────────────
function drawSandbankBackground() {
  const sandY = canvasH * 0.82;
  const t = currentT;

  ctx.save();
  const sg = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sg.addColorStop(0, '#181a09'); sg.addColorStop(1, '#0a0d04');
  ctx.fillStyle = sg; ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  // Sand dune silhouettes
  ctx.save();
  ctx.fillStyle = '#131508';
  for (let i = 0; i < 4; i++) {
    const dx = canvasW * (0.1 + i * 0.25);
    ctx.beginPath();
    ctx.ellipse(dx, sandY + 2, canvasW * 0.12, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Strange crystalline growths
  for (const cx of [0.08, 0.35, 0.62, 0.91]) {
    drawCrystal(canvasW * cx, sandY);
  }

  // Weird lumpy masses along the bottom
  ctx.save();
  ctx.fillStyle = 'rgba(0,80,30,0.25)'; ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 12;
  for (let i = 0; i < 6; i++) {
    const bx = canvasW * (0.05 + i * 0.18);
    ctx.beginPath();
    ctx.ellipse(bx, sandY + 28, 20 + Math.sin(i * 2.3) * 8, 14, Math.sin(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCrystal(x, baseY) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = 'rgba(100,200,120,0.3)'; ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(100,255,150,0.5)'; ctx.lineWidth = 1;
  const heights = [28, 18, 22, 14];
  const offsets = [-10, -3, 5, 12];
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i], ox = offsets[i];
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox - 4, -h); ctx.lineTo(ox + 4, -h);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// ─── Zone 3: The Reef ───────────────────────────────────────────
function drawReefBackground() {
  const t = currentT;
  const baseY = canvasH * 0.84;

  // Dark jagged reef formations
  ctx.save();
  ctx.fillStyle = '#080c08'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 0;
  for (let i = 0; i < 7; i++) {
    const rx = canvasW * (0.05 + i * 0.14);
    const rh = 30 + Math.sin(i * 1.7) * 18;
    ctx.beginPath();
    ctx.moveTo(rx - 22, baseY + 10);
    ctx.lineTo(rx - 10, baseY - rh);
    ctx.lineTo(rx, baseY - rh - 12);
    ctx.lineTo(rx + 10, baseY - rh + 4);
    ctx.lineTo(rx + 22, baseY + 10);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Bioluminescent particles drifting upward
  ctx.save();
  const particleCount = 22;
  for (let i = 0; i < particleCount; i++) {
    const px = (canvasW * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 18 * (0.5 + (i % 3) * 0.3) + i * (canvasH / particleCount)) % canvasH);
    const alpha = 0.15 + Math.abs(Math.sin(t * 0.8 + i)) * 0.35;
    const r = 1 + (i % 3) * 0.8;
    ctx.fillStyle = `rgba(0,255,136,${alpha})`;
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Dark coral-like formations
  ctx.save();
  ctx.strokeStyle = 'rgba(0,120,60,0.4)'; ctx.lineWidth = 2; ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 6;
  for (let i = 0; i < 5; i++) {
    const bx = canvasW * (0.1 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.lineTo(bx + Math.sin(i * 2) * 8, baseY - 35);
    ctx.lineTo(bx + Math.sin(i * 2) * 8 - 10, baseY - 50);
    ctx.moveTo(bx + Math.sin(i * 2) * 8, baseY - 35);
    ctx.lineTo(bx + Math.sin(i * 2) * 8 + 10, baseY - 48);
    ctx.stroke();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  SHOP RENDERING
// ═══════════════════════════════════════════════════════════════

function renderShop() {
  renderInventory();
  updateSellAllBtn();
  renderFishmongerArt();
  updatePassiveInfo();
}

function updatePassiveInfo() {
  const el = document.getElementById('shop-passive-info');
  if (state.upgrades.salvaged_net > 0) {
    const n = state.upgrades.salvaged_net;
    const rate = (n / 20).toFixed(1);
    const highestZoneId = Math.max(...state.unlockedZones.filter(z => ZONES[z].implemented));
    el.style.display = '';
    el.textContent = `NET: ${rate} fish/s from ${ZONES[highestZoneId].name}`;
  } else {
    el.style.display = 'none';
  }
}

function renderFishmongerArt() {
  const container = document.getElementById('fishmonger-art');
  if (!container) return;
  container.innerHTML = '';
  const shopRight = document.getElementById('shop-right');
  const artH = Math.max(600, shopRight.clientHeight || 700);
  const c = document.createElement('canvas');
  c.width = 280; c.height = artH;
  container.appendChild(c);
  const x = c.getContext('2d');

  // Background — dark shop interior
  x.fillStyle = '#010a04';
  x.fillRect(0, 0, 280, artH);

  // Counter
  x.fillStyle = '#0a1a0a';
  x.fillRect(10, 280, 260, 50);
  x.strokeStyle = '#00cc8844';
  x.lineWidth = 1;
  x.strokeRect(10, 280, 260, 50);

  // Counter surface highlight
  x.fillStyle = '#0e2a12';
  x.fillRect(12, 282, 256, 4);

  // Fishmonger body
  x.fillStyle = '#061208';
  x.fillRect(105, 160, 70, 120);

  // Apron
  x.fillStyle = '#0a2a10';
  x.fillRect(110, 200, 60, 80);
  x.strokeStyle = '#00885544';
  x.strokeRect(110, 200, 60, 80);

  // Head
  x.fillStyle = '#0c1e0c';
  x.beginPath();
  x.arc(140, 145, 30, 0, Math.PI * 2);
  x.fill();

  // Eyes (glowing green)
  x.fillStyle = '#00ff88';
  x.shadowColor = '#00ff88';
  x.shadowBlur = 8;
  x.beginPath(); x.arc(130, 140, 3, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(150, 140, 3, 0, Math.PI * 2); x.fill();
  x.shadowBlur = 0;

  // Hat / bandana
  x.fillStyle = '#00886644';
  x.fillRect(108, 118, 64, 12);

  // Arms
  x.fillStyle = '#061208';
  x.fillRect(80, 200, 25, 70);
  x.fillRect(175, 200, 25, 70);

  // Hands on counter
  x.fillStyle = '#0c1e0c';
  x.beginPath(); x.arc(92, 274, 10, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(188, 274, 10, 0, Math.PI * 2); x.fill();

  // Fish on hooks behind (hanging)
  const fishColors = ['#00cc66', '#88ccff', '#ff4466', '#cc44ff'];
  const fishX = [50, 110, 170, 230];
  for (let i = 0; i < 4; i++) {
    const fy = 50 + Math.sin(i * 1.5) * 10;
    // Hook line
    x.strokeStyle = '#004422';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(fishX[i], 10); x.lineTo(fishX[i], fy); x.stroke();
    // Hook
    x.strokeStyle = '#00885544';
    x.beginPath(); x.arc(fishX[i], fy + 4, 4, 0, Math.PI); x.stroke();
    // Fish body
    x.fillStyle = fishColors[i];
    x.shadowColor = fishColors[i];
    x.shadowBlur = 6;
    x.beginPath();
    x.ellipse(fishX[i], fy + 18, 14, 7, 0, 0, Math.PI * 2);
    x.fill();
    // Tail
    x.beginPath();
    x.moveTo(fishX[i] - 12, fy + 18);
    x.lineTo(fishX[i] - 22, fy + 10);
    x.lineTo(fishX[i] - 22, fy + 26);
    x.closePath();
    x.fill();
    x.shadowBlur = 0;
    // Eye
    x.fillStyle = '#000';
    x.beginPath(); x.arc(fishX[i] + 6, fy + 16, 2, 0, Math.PI * 2); x.fill();
  }

  // Shelves behind
  x.strokeStyle = '#003a20';
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(20, 90); x.lineTo(260, 90); x.stroke();

  // Jars on shelf
  x.fillStyle = '#001a0a';
  for (const jx of [35, 80, 200, 240]) {
    x.fillRect(jx - 8, 70, 16, 20);
    x.strokeStyle = '#00cc6622';
    x.strokeRect(jx - 8, 70, 16, 20);
  }

  // Floor
  x.fillStyle = '#060e06';
  x.fillRect(0, 330, 280, artH - 330);
  x.strokeStyle = '#003a20';
  x.lineWidth = 0.5;
  for (let lx = 0; lx < 280; lx += 40) {
    x.beginPath(); x.moveTo(lx, 330); x.lineTo(lx, artH); x.stroke();
  }

  // Accent glow on counter
  x.fillStyle = 'rgba(0,204,221,0.06)';
  x.fillRect(10, 278, 260, 4);
}

function renderInventory() {
  const el = document.getElementById('inventory-grid');
  el.innerHTML = '';

  const entries = Object.entries(state.inventory)
    .filter(([, c]) => c > 0)
    .sort(([a], [b]) => RARITY_ORDER[FISH[a].rarity] - RARITY_ORDER[FISH[b].rarity]);

  if (!entries.length) {
    el.innerHTML = '<div class="inv-empty">// FISH HOLD EMPTY</div>';
    return;
  }

  for (const [typeId, count] of entries) {
    const def   = FISH[typeId]; if (!def) continue;
    const total = count * def.goldValue;
    const rar   = def.rarity.toLowerCase();

    const card = document.createElement('div');
    card.className = `inv-card rarity-${rar}`;
    card.innerHTML = `
      <div class="inv-card-top">
        <div class="inv-card-top-left">
          <div class="inv-fish-name">${def.name}</div>
          <div class="inv-rarity-tag">${def.rarity}</div>
        </div>
        <div class="inv-card-top-right">
          <button class="sell-btn" data-type="${typeId}">SELL ALL</button>
          <div class="inv-value">${def.goldValue}◈ each · = ${total}◈</div>
        </div>
      </div>
      <div class="inv-card-bottom">
        <div class="inv-count">${count}</div>
      </div>
    `;
    card.querySelector('.sell-btn').addEventListener('click', () => sellFish(typeId));
    el.appendChild(card);
  }
}

function updateSellAllBtn() {
  const btn = document.getElementById('btn-sell-all');
  if (state.upgrades.sell_batch >= 1) {
    btn.style.display = '';
    const total = Object.entries(state.inventory)
      .reduce((s, [id, q]) => s + q * (FISH[id]?.goldValue || 0), 0);
    btn.textContent = total > 0 ? `[ SELL ALL — ${total}◈ ]` : '[ SELL ALL ]';
  } else {
    btn.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════
//  CONSUMABLES SIDEBAR
// ═══════════════════════════════════════════════════════════════

function buyConsumable(id) {
  const def = CONSUMABLES_DEF.find(c => c.id === id);
  if (!def || state.gold < def.cost) return;
  state.gold -= def.cost;
  state.consumables[id] = (state.consumables[id] || 0) + 1;
  state.totalGoldEarned += def.cost;
  addLog(`> PURCHASED: ${def.name} [×${state.consumables[id]}]`);
  audio.play('upgrade');
  updateAllGoldDisplays();
  renderUpgrades();
  renderConsumablesPanel();
  if (!state.flags.consumablesSidebar) {
    state.flags.consumablesSidebar = true;
    const sidebar = document.getElementById('consumables-sidebar');
    if (sidebar) {
      sidebar.classList.add('visible');
      sidebar.classList.add('open');
      document.getElementById('consumables-toggle').textContent = '◀';
    }
  }
}

function renderConsumablesPanel() {
  const panel = document.getElementById('consumables-panel');
  if (!panel) return;
  panel.innerHTML = '';
  let anyOwned = false;
  for (const def of CONSUMABLES_DEF) {
    const owned = state.consumables[def.id] || 0;
    if (owned <= 0) continue;
    anyOwned = true;
    const isActive = state.activeConsumable === def.id;
    const item = document.createElement('div');
    item.className = `consumable-item${isActive ? ' active' : ''}`;
    item.innerHTML = `
      <div class="consumable-item-top">
        <span class="consumable-name">${def.name}</span>
        <span class="consumable-count">×${owned}</span>
      </div>
      <button class="consumable-use-btn${isActive ? ' active' : ''}" data-id="${def.id}">${isActive ? '[ CANCEL ]' : '[ USE ]'}</button>
    `;
    item.querySelector('.consumable-use-btn').addEventListener('click', () => {
      state.activeConsumable = (state.activeConsumable === def.id) ? null : def.id;
      renderConsumablesPanel();
    });
    panel.appendChild(item);
  }
  if (!anyOwned) {
    panel.innerHTML = '<div class="consumable-empty">// NONE OWNED<br><small>Buy from Upgrades</small></div>';
  }
}

// ═══════════════════════════════════════════════════════════════
//  UPGRADES RENDERING
// ═══════════════════════════════════════════════════════════════

let activeUpgradeTab = 0;

function renderUpgradeTabs() {
  const tabsEl = document.getElementById('upgrades-tabs');
  tabsEl.innerHTML = '';
  const visibleCats = UPGRADE_CATEGORIES.filter(cat => {
    if (cat.special === 'consumables') return true;
    return cat.ids.some(id => {
      const def = UPGRADES_DEF.find(u => u.id === id);
      return def && state.totalGoldEarned >= def.revealAt;
    });
  });
  if (!visibleCats.length) return;
  if (activeUpgradeTab >= visibleCats.length) activeUpgradeTab = 0;

  visibleCats.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = `upg-tab${i === activeUpgradeTab ? ' active' : ''}`;
    btn.textContent = cat.name;
    btn.addEventListener('click', () => { activeUpgradeTab = i; renderUpgrades(); });
    tabsEl.appendChild(btn);
  });
}

function renderUpgrades() {
  renderUpgradeTabs();
  const el = document.getElementById('upgrades-grid');
  el.innerHTML = '';

  const visibleCats = UPGRADE_CATEGORIES.filter(cat => {
    if (cat.special === 'consumables') return true;
    return cat.ids.some(id => {
      const def = UPGRADES_DEF.find(u => u.id === id);
      return def && state.totalGoldEarned >= def.revealAt;
    });
  });

  if (!visibleCats.length) {
    el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
    return;
  }

  const cat = visibleCats[activeUpgradeTab] || visibleCats[0];

  // Consumables tab has special rendering
  if (cat.special === 'consumables') {
    const catDiv = document.createElement('div');
    catDiv.className = 'upg-category';
    const header = document.createElement('div');
    header.className = 'upg-category-header';
    header.textContent = 'CONSUMABLES — single-use items';
    catDiv.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'upg-category-grid';
    for (const def of CONSUMABLES_DEF) {
      const owned = state.consumables[def.id] || 0;
      const canBuy = state.gold >= def.cost;
      const card = document.createElement('div');
      card.className = `upg-card${canBuy ? ' can-buy' : ''}`;
      card.innerHTML = `
        <div class="upg-card-top">
          <div class="upg-name">${def.name}</div>
          <div class="upg-desc">${def.desc}</div>
        </div>
        <div class="upg-card-bottom">
          <div class="upg-level">owned: ${owned}</div>
          <button class="upg-btn" data-id="${def.id}" ${canBuy ? '' : 'disabled'}>${fmt(def.cost)}◈ each</button>
        </div>
      `;
      card.querySelector('.upg-btn').addEventListener('click', () => buyConsumable(def.id));
      grid.appendChild(card);
    }
    catDiv.appendChild(grid);
    el.appendChild(catDiv);
    return;
  }

  const defs = cat.ids
    .map(id => UPGRADES_DEF.find(u => u.id === id))
    .filter(def => def && state.totalGoldEarned >= def.revealAt);

  if (!defs.length) return;

  const catDiv = document.createElement('div');
  catDiv.className = 'upg-category';

  const header = document.createElement('div');
  header.className = 'upg-category-header';
  header.textContent = cat.name;
  catDiv.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'upg-category-grid';

  for (const def of defs) {
    const owned  = state.upgrades[def.id];
    const maxed  = owned >= def.max;
    const cost   = upgradeCost(def.id);
    const canBuy = !maxed && state.gold >= cost;

    const card = document.createElement('div');
    card.className = `upg-card${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}`;
    card.innerHTML = `
      <div class="upg-card-top">
        <div class="upg-name">${def.name}</div>
        <div class="upg-desc">${def.desc}</div>
      </div>
      <div class="upg-card-bottom">
        <div class="upg-level">${owned} / ${def.max} installed</div>
        ${maxed
          ? `<div class="upg-maxed-label">[ MAX ]</div>`
          : `<button class="upg-btn" data-id="${def.id}" ${canBuy ? '' : 'disabled'}>${fmt(cost)}◈</button>`
        }
      </div>
    `;
    if (!maxed) card.querySelector('.upg-btn').addEventListener('click', () => buyUpgrade(def.id));
    grid.appendChild(card);
  }

  catDiv.appendChild(grid);
  el.appendChild(catDiv);
}

// ═══════════════════════════════════════════════════════════════
//  ATLAS RENDERING
// ═══════════════════════════════════════════════════════════════

function renderAtlas() {
  const el = document.getElementById('atlas-chart');
  el.innerHTML = '';

  for (let i = 0; i < ZONES.length; i++) {
    const zone     = ZONES[i];
    const unlocked = state.unlockedZones.includes(zone.id);
    const isCur    = state.currentZone === zone.id;
    const canBuy   = !unlocked && zone.unlockCost && state.gold >= zone.unlockCost && zone.implemented;

    const nodeDiv = document.createElement('div');
    nodeDiv.className = `atlas-node ${isCur ? 'current' : unlocked ? 'visited' : 'locked'}`;

    const nameRevealed = (unlocked || isCur) || (zone.unlockCost && state.gold >= zone.unlockCost * 0.8);

    const fishBreak = (unlocked || isCur) ? `
      <div class="atlas-fish-breakdown">
        <span class="fish-pct common">COMMON 40%</span>
        <span class="fish-pct uncommon">UNCOMMON 30%</span>
        <span class="fish-pct rare">RARE 20%</span>
        <span class="fish-pct epic">EPIC 8%</span>
        <span class="fish-pct legendary">LEGENDARY 2%</span>
      </div>` : '';

    let actionBlock = '';
    if (isCur) {
      actionBlock = `<div class="atlas-here-label">[ YOU ARE HERE ]</div>`;
    } else if (unlocked) {
      actionBlock = `<button class="descend-btn" data-zone="${zone.id}">TRAVEL HERE</button>`;
    } else if (zone.implemented) {
      actionBlock = `
        <div class="atlas-lock-info">Requires <strong>${zone.unlockCost}◈</strong> to unlock · you have <strong>${Math.floor(state.gold)}◈</strong></div>
        <button class="descend-btn" data-zone="${zone.id}" ${canBuy ? '' : 'disabled'}>DESCEND — ${zone.unlockCost}◈</button>
      `;
    } else {
      actionBlock = `<div class="atlas-lock-info">[ NOT YET CHARTED ]</div>`;
    }

    nodeDiv.innerHTML = `
      <div class="atlas-node-left">
        <div class="atlas-dot"></div>
        ${i < ZONES.length - 1 ? '<div class="atlas-connector-line"></div>' : ''}
      </div>
      <div class="atlas-node-right">
        <div class="atlas-zone-id">${zone.code}</div>
        <div class="atlas-zone-name${nameRevealed && !unlocked && !isCur ? ' atlas-name-preview' : ''}">${nameRevealed ? zone.name : '???'}</div>
        <div class="atlas-zone-depth">~${zone.depth}m depth</div>
        ${fishBreak}
        ${actionBlock}
      </div>
    `;

    el.appendChild(nodeDiv);

    if (i < ZONES.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'atlas-connector';
      const diff = ZONES[i + 1].depth - zone.depth;
      conn.innerHTML = `
        <div style="width:2px;height:28px;background:var(--border);margin-left:11px"></div>
        <div class="atlas-connector-label">+${diff}m</div>
      `;
      el.appendChild(conn);
    }

    const btn = nodeDiv.querySelector('.descend-btn');
    if (btn) {
      const zId = parseInt(btn.dataset.zone);
      if (zId === 1 && canBuy) btn.classList.add('pulse-first');
      btn.addEventListener('click', () => {
        if (state.unlockedZones.includes(zId)) travelToZone(zId);
        else purchaseZone(zId);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  BOAT RENDERING
// ═══════════════════════════════════════════════════════════════

function renderBoat() {
  const el = document.getElementById('boat-settings');
  el.innerHTML = '';

  const hasRodSpeed = state.upgrades.rod_speed > 0;

  if (!hasRodSpeed) {
    el.innerHTML = '<div class="boat-empty">// NOTHING INSTALLED YET<br><br>Purchase FASTER CAST from Upgrades<br>to unlock cast speed tuning.</div>';
    return;
  }

  const header = document.createElement('div');
  header.className = 'boat-section-header';
  header.textContent = 'ROD CONFIGURATION';
  el.appendChild(header);

  if (hasRodSpeed) {
    const maxPct = 100 + state.upgrades.rod_speed * 20;
    const minPct = Math.round((150 / (450 * (1 + state.upgrades.rod_speed * 0.20))) * 100);
    const curPct = Math.round(state.boatSettings.rodSpeedFactor * 100);

    const setting = document.createElement('div');
    setting.className = 'boat-setting';
    setting.innerHTML = `
      <div class="boat-setting-label">CAST SPEED</div>
      <div class="boat-setting-desc">Adjust your rod's cast speed. Lower speeds give more control. Max speed scales with FASTER CAST level (currently ${maxPct}%).</div>
      <div class="boat-slider-row">
        <input type="range" class="boat-slider" id="slider-rod-speed"
          min="${minPct}" max="100" step="1" value="${curPct}">
        <span class="boat-slider-val" id="rod-speed-val">${curPct}%</span>
      </div>
      <div class="boat-slider-labels">
        <span>SLOW (${minPct}%)</span><span>FAST (100%)</span>
      </div>
    `;
    el.appendChild(setting);

    setting.querySelector('#slider-rod-speed').addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      state.boatSettings.rodSpeedFactor = v / 100;
      setting.querySelector('#rod-speed-val').textContent = `${v}%`;
    });
  }
}

// ═══════════════════════════════════════════════════════════════
//  LOG
// ═══════════════════════════════════════════════════════════════

const logEl = document.getElementById('log-list');

function addLog(msg, cls = '') {
  const ts    = new Date().toLocaleTimeString('en-US', { hour12: false });
  const entry = document.createElement('div');
  entry.className = `log-entry${cls ? ' log-' + cls : ''}`;
  entry.innerHTML = `<span class="log-ts">[${ts}]</span> ${esc(msg)}`;
  logEl.prepend(entry);
  while (logEl.children.length > 120) logEl.lastChild.remove();
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ═══════════════════════════════════════════════════════════════

function exportSave() {
  return btoa(JSON.stringify({
    v: 7,
    gold: Math.floor(state.gold),
    totalGoldEarned: Math.floor(state.totalGoldEarned),
    currentZone: state.currentZone,
    unlockedZones: state.unlockedZones,
    inventory: state.inventory,
    upgrades: state.upgrades,
    consumables: state.consumables,
    stats: state.stats,
    passiveTimer: state.passiveTimer,
    baitCooldown: state.baitCooldown,
    multiCastCooldown: state.multiCastCooldown,
    boatSettings: state.boatSettings,
    flags: state.flags,
  }));
}

function importSave(code) {
  try {
    const d = JSON.parse(atob(code.trim()));
    if (![5,6,7].includes(d.v)) throw new Error('version mismatch');
    state.gold            = d.gold || 0;
    state.totalGoldEarned = d.totalGoldEarned || 0;
    state.currentZone     = d.currentZone || 0;
    state.unlockedZones   = d.unlockedZones || [0];
    state.inventory       = d.inventory || {};
    state.upgrades        = { ...state.upgrades, ...d.upgrades };
    state.consumables     = { ...state.consumables, ...(d.consumables || {}) };
    state.stats           = { ...state.stats, ...d.stats };
    state.passiveTimer    = d.passiveTimer || 0;
    state.baitCooldown    = d.baitCooldown || 0;
    state.multiCastCooldown = d.multiCastCooldown || 0;
    state.boatSettings    = { ...state.boatSettings, ...(d.boatSettings || {}) };
    state.flags           = { ...state.flags, ...d.flags };
    cv.fish = []; cv.hook = null; cv.cooldown = 0;
    updateZoneOverlay();
    applyFlagsToDOM();
    updateAllGoldDisplays();
    addLog('> SAVE LOADED.');
    return true;
  } catch {
    addLog('> [ERROR] INVALID SAVE CODE.');
    return false;
  }
}

function applyFlagsToDOM() {
  const f = state.flags;
  if (f.shopUnlocked)     showBubble('btn-shop', false);
  if (f.upgradesUnlocked) showBubble('btn-upgrades', !f.upgradesVisited);
  if (f.atlasUnlocked)    showBubble('btn-atlas', !f.atlasVisited);
  if (f.logUnlocked)      showBubble('btn-log', !f.logVisited);
  if (f.boatUnlocked)     showBubble('btn-boat', !f.boatVisited);
  if (f.saveUnlocked)     document.getElementById('fishing-save-btns').classList.add('visible');
  if (f.baitVisible) {
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
  }
  if (f.multiCastVisible) {
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
  }
  if (f.consumablesSidebar) {
    const sidebar = document.getElementById('consumables-sidebar');
    if (sidebar) sidebar.classList.add('visible');
    // Don't auto-open on load — user can toggle
  }
  if (state.stats.totalCaught >= 1) document.getElementById('fishing-gold').classList.add('visible');
  renderConsumablesPanel();
}

// ═══════════════════════════════════════════════════════════════
//  EVENT WIRING
// ═══════════════════════════════════════════════════════════════

document.getElementById('consumables-toggle').addEventListener('click', () => {
  const sidebar = document.getElementById('consumables-sidebar');
  const wasOpen = sidebar.classList.contains('open');
  sidebar.classList.toggle('open');
  document.getElementById('consumables-toggle').textContent = wasOpen ? '▶' : '◀';
});

document.getElementById('btn-shop').addEventListener('click',     () => switchScreen('screen-shop'));
document.getElementById('btn-upgrades').addEventListener('click', () => switchScreen('screen-upgrades'));
document.getElementById('btn-atlas').addEventListener('click',    () => switchScreen('screen-atlas'));
document.getElementById('btn-log').addEventListener('click',      () => switchScreen('screen-log'));
document.getElementById('btn-boat').addEventListener('click',     () => switchScreen('screen-boat'));

document.getElementById('btn-back-shop').addEventListener('click',     () => { document.getElementById('btn-back-shop').classList.remove('pulse-hint'); switchScreen('screen-fishing'); });
document.getElementById('btn-back-upgrades').addEventListener('click', () => switchScreen('screen-fishing'));
document.getElementById('btn-back-atlas').addEventListener('click',    () => switchScreen('screen-fishing'));
document.getElementById('btn-back-log').addEventListener('click',      () => switchScreen('screen-fishing'));
document.getElementById('btn-back-boat').addEventListener('click',     () => switchScreen('screen-fishing'));

document.getElementById('btn-bait').addEventListener('click', () => { document.getElementById('btn-bait').classList.remove('pulse-new'); useBait(); });
document.getElementById('btn-multicast').addEventListener('click', () => { document.getElementById('btn-multicast').classList.remove('pulse-new'); useMultiCast(); });

document.getElementById('btn-sell-all').addEventListener('click', sellAll);

document.getElementById('btn-save').addEventListener('click', () => {
  document.getElementById('save-textarea').value = exportSave();
  document.getElementById('save-modal').style.display = 'flex';
});
document.getElementById('btn-load').addEventListener('click', () => {
  document.getElementById('load-modal').style.display = 'flex';
});
document.getElementById('modal-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('save-textarea').value).then(() => {
    const b = document.getElementById('modal-copy');
    b.textContent = 'COPIED!';
    setTimeout(() => { b.textContent = 'COPY TO CLIPBOARD'; }, 2000);
  });
});
document.getElementById('modal-save-close').addEventListener('click',  () => { document.getElementById('save-modal').style.display = 'none'; });
document.getElementById('modal-load-close').addEventListener('click',  () => { document.getElementById('load-modal').style.display = 'none'; });
document.getElementById('modal-import-btn').addEventListener('click',  () => {
  if (importSave(document.getElementById('load-textarea').value)) {
    document.getElementById('load-modal').style.display = 'none';
    document.getElementById('load-textarea').value = '';
  }
});

// ─── Dev mode ───
let _devBuffer = '';
document.addEventListener('keydown', (e) => {
  if (e.key.length === 1) {
    _devBuffer = (_devBuffer + e.key.toLowerCase()).slice(-7);
    if (_devBuffer === 'ajmemes') {
      state.gold += 100;
      updateAllGoldDisplays();
      addLog('> [DEV] +100◈ GRANTED. Someone left the keys in the boat.');
      checkMilestones();
      _devBuffer = '';
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  cv.mouseX = (e.clientX - rect.left) * (canvasW / rect.width);
  cv.mouseY = (e.clientY - rect.top)  * (canvasH / rect.height);
  cv.inCanvas = true;
});
canvas.addEventListener('mouseleave', () => { cv.inCanvas = false; });
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvasW / rect.width);
  const cy = (e.clientY - rect.top)  * (canvasH / rect.height);

  if (clickZoneSpecial(cx, cy)) return;
  const ac = state.activeConsumable;
  if (ac === 'small_net' || ac === 'big_net') { throwNet(cx, cy, ac); return; }
  castHook(cx, cy);
});
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (state.upgrades.instant_retract >= 1 && cv.hook && cv.hook.state !== 'retracting') {
    cv.hook.quickRetract = true;
    cv.hook.state = 'retracting';
  }
});

// ═══════════════════════════════════════════════════════════════
//  AUDIO (PLACEHOLDER)
// ═══════════════════════════════════════════════════════════════

const audio = {
  play(sound) {
    // Sounds: 'cast' | 'catch_common' | 'catch_rare' | 'sell' | 'upgrade' | 'unlock'
  },
};

// ═══════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e6) return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toString();
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

function init() {
  resizeCanvas();
  window.addEventListener('resize', () => setTimeout(resizeCanvas, 40));
  updateZoneOverlay();
  setTimeout(flashZoneOverlay, 400);

  spawnFish(); spawnFish(); spawnFish();

  checkMilestones();
  updateAllGoldDisplays();

  currentT = performance.now() / 1000;
  requestAnimationFrame(loop);
}

init();
