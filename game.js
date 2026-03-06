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
    spawnWeights: [50, 30, 10, 8, 2], maxFish: 4,
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
    spawnWeights: [50, 30, 10, 8, 2], maxFish: 5,
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
    spawnWeights: [50, 30, 10, 8, 2], maxFish: 5,
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
    spawnWeights: [50, 30, 10, 8, 2], maxFish: 5,
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

  // ── SPECIAL: COAST CRAB (click mechanic, not spawned normally) ──
  shore_crab: {
    name: 'SHORE CRAB', zone: 0, rarity: 'RARE', goldValue: 50,
    speed: 0, size: 22, wave: null,
    desc: 'Spotted watching from the rocks. You were faster.',
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
  { name: 'TARGETING',    ids: ['targeting_scope', 'precision_hook'] },
  { name: 'AUTOMATION',   ids: ['salvaged_net', 'sell_batch', 'fish_density'] },
  { name: 'ABILITIES',    ids: ['bait_bomb'] },
];

const UPGRADES_DEF = [
  // LINE CONTROL
  { id: 'faster_reel',     name: 'FASTER REEL',       desc: 'Recast cooldown reduced by 0.4s per level',                                   baseCost: 15,  max: 4,  costScale: 1.8, revealAt: 0   },
  { id: 'instant_retract', name: 'QUICK RELEASE',     desc: 'Right-click on canvas to instantly retract your hook',                        baseCost: 25,  max: 1,  costScale: 1,   revealAt: 0   },
  { id: 'rod_speed',       name: 'OVERCLOCKED DRIVE', desc: 'Increases max cast speed by +80px/s per level. Tune it in The Boat.',         baseCost: 55,  max: 5,  costScale: 2.0, revealAt: 10  },
  // TARGETING
  { id: 'targeting_scope', name: 'TARGETING SCOPE',   desc: 'Hook catch radius +18% per level',                                            baseCost: 40,  max: 5,  costScale: 1.9, revealAt: 32  },
  { id: 'precision_hook',  name: 'PRECISION HOOK',    desc: 'Catch radius for RARE+ fish +20% per level',                                  baseCost: 90,  max: 4,  costScale: 2.1, revealAt: 80  },
  // AUTOMATION
  { id: 'salvaged_net',    name: 'SALVAGED NET',      desc: '+1 passive fish caught every 20 seconds per level',                           baseCost: 60,  max: 8,  costScale: 1.7, revealAt: 50  },
  { id: 'sell_batch',      name: 'BATCH SELLER',      desc: 'Unlocks the [SELL ALL] button in the shop',                                   baseCost: 30,  max: 1,  costScale: 1,   revealAt: 20  },
  { id: 'fish_density',    name: 'DEEP BROADCAST',    desc: '+5% max active fish per level. The water gets crowded.',                      baseCost: 45,  max: 10, costScale: 1.6, revealAt: 15  },
  // ABILITIES
  { id: 'bait_bomb',       name: 'BAIT BOMB',         desc: 'Unlocks the BAIT button. Scatter bait to draw a frenzy of fish for 10s.',    baseCost: 200, max: 1,  costScale: 1,   revealAt: 150 },
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
    targeting_scope: 0, precision_hook: 0,
    salvaged_net: 0, sell_batch: 0, fish_density: 0,
    bait_bomb: 0,
  },
  stats: { totalCaught: 0, totalCasts: 0 },
  passiveTimer: 0,
  baitTimer: 0,
  baitCooldown: 0,
  boatSettings: { rodSpeedFactor: 1.0 },
  flags: {
    shopUnlocked:     false,
    logUnlocked:      false,
    upgradesUnlocked: false,
    atlasUnlocked:    false,
    boatUnlocked:     false,
    upgradesVisited:  false,
    atlasVisited:     false,
    logVisited:       false,
    shopVisited:      false,
    boatVisited:      false,
    saveUnlocked:     false,
    baitVisible:      false,
  },
};

// ─── Derived ───

function getRecastCooldown() {
  return Math.max(0.3, 1.5 - state.upgrades.faster_reel * 0.4);
}

function getCastSpeed() {
  const maxSpeed = 450 + state.upgrades.rod_speed * 80;
  return maxSpeed * state.boatSettings.rodSpeedFactor;
}

function getMaxFish() {
  return Math.ceil(ZONES[state.currentZone].maxFish * (1 + state.upgrades.fish_density * 0.05));
}

function getCatchRadius(typeId) {
  const base  = 36;
  const scope = base * state.upgrades.targeting_scope * 0.18;
  let radius  = base + scope;
  if (typeId) {
    const r = FISH[typeId].rarity;
    if (r === 'RARE' || r === 'EPIC' || r === 'LEGENDARY') {
      radius *= (1 + state.upgrades.precision_hook * 0.20);
    }
  }
  return radius;
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
  screenShake: { x: 0, y: 0 },
};

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  canvasW = wrap.clientWidth  || 800;
  canvasH = wrap.clientHeight || 500;
  canvas.width  = canvasW;
  canvas.height = canvasH;
}

function spawnFish() {
  const zone    = ZONES[state.currentZone];
  if (!zone.implemented) return;
  const weights = zone.spawnWeights;
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total, typeId = zone.fish[0];
  for (let i = 0; i < zone.fish.length; i++) { r -= weights[i]; if (r <= 0) { typeId = zone.fish[i]; break; } }

  const dir   = Math.random() < 0.5 ? 1 : -1;
  const baseY = canvasH * 0.1 + Math.random() * canvasH * 0.76;
  cv.fish.push({
    id: cv.fishIdCounter++, type: typeId,
    x: dir === 1 ? -80 : canvasW + 80,
    baseY, currentY: baseY, dir,
    waveOffset: Math.random() * Math.PI * 2,
    caught: false, catchAnim: 0,
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

function castHook(tx, ty) {
  if (cv.cooldown > 0 || cv.hook) return;
  cv.hook = {
    x: canvasW / 2, y: canvasH + 10,
    ox: canvasW / 2, oy: canvasH + 10,
    tx, ty, state: 'traveling', lingerTimer: 0,
    biteChecked: false,
    stuckClicks: 0, stuckThreshold: 4, stuckTimer: 0,
    shakeX: 0, shakeY: 0, shakeIntensity: 6,
  };
  state.stats.totalCasts++;
  audio.play('cast');
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
  state.baitCooldown = 90;
  for (let i = 0; i < 18; i++) setTimeout(() => spawnFish(), i * 80);
  addLog('> BAIT DEPLOYED. Something stirs in the water.');
  updateBaitBtn();
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
    b.style.display = 'block';
    b.offsetHeight;
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
    btn.textContent = `BAIT (${Math.ceil(state.baitCooldown)}s)`;
  } else {
    btn.classList.remove('cooldown');
    btn.textContent = 'BAIT';
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
        // Log button appears on next return to water
        state.flags.logUnlocked = true;
        addLog('> FISHMONGER\'S REFUGE: connection established.');
        addLog('> Sell your catch. Return to water.');
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
  draw();
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
    f.x += def.speed * f.dir * dt;
    f.currentY = def.wave
      ? f.baseY + Math.sin(t * def.wave.freq + f.waveOffset) * def.wave.amp
      : f.baseY;
    f.currentY = Math.max(36, Math.min(canvasH - 44, f.currentY));
    if ((f.dir === 1 && f.x > canvasW + 90) || (f.dir === -1 && f.x < -90)) cv.fish.splice(i, 1);
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
      // Bite check — once per cast, after 0.15s of lingering
      if (!h.biteChecked && h.lingerTimer >= 0.15) {
        h.biteChecked = true;
        if (Math.random() < 0.20) {
          for (const f of cv.fish) {
            if (f.caught) continue;
            const dx = h.x - f.x, dy = h.y - f.currentY;
            if (Math.sqrt(dx * dx + dy * dy) < getCatchRadius(f.type) * 3.0) {
              h.state = 'stuck';
              h.stuckThreshold = 3 + Math.floor(Math.random() * 3);
              h.stuckTimer = 0;
              h.shakeIntensity = 5;
              addLog('> [ALERT] Something has the line.');
              break;
            }
          }
        }
      }
      if (h.state !== 'stuck' && h.lingerTimer >= 0.44) h.state = 'retracting';
    } else if (h.state === 'stuck') {
      h.stuckTimer += dt;
      h.shakeIntensity = Math.min(16, 5 + h.stuckTimer * 2.5);
      h.shakeX = (Math.random() - 0.5) * h.shakeIntensity;
      h.shakeY = (Math.random() - 0.5) * h.shakeIntensity;
      cv.screenShake.x = h.shakeX * 0.3;
      cv.screenShake.y = h.shakeY * 0.3;
      if (h.stuckTimer >= 5) {
        h.state = 'retracting'; h.shakeX = 0; h.shakeY = 0;
        cv.screenShake.x = 0; cv.screenShake.y = 0;
      }
    } else if (h.state === 'retracting') {
      const dx = h.ox - h.x, dy = h.oy - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = Math.max(600, SPEED * 1.7) * dt;
      if (step >= dist) { cv.hook = null; cv.cooldown = getRecastCooldown(); }
      else { h.x += (dx / dist) * step; h.y += (dy / dist) * step; }
      checkHookCollision(h.x, h.y); // ← catch on retract
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
      const common = zone.fish[0];
      const n = state.upgrades.salvaged_net;
      state.inventory[common] = (state.inventory[common] || 0) + n;
      state.stats.totalCaught += n;
      addLog(`> NET CATCH: +${n}× ${FISH[common].name}`);
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

// ═══════════════════════════════════════════════════════════════
//  CANVAS DRAWING
// ═══════════════════════════════════════════════════════════════

function draw() {
  ctx.clearRect(0, 0, canvasW, canvasH);

  if (state.currentZone === 0) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#003828'); bg.addColorStop(0.5, '#001e14'); bg.addColorStop(1, '#000e08');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#003322'; ctx.lineWidth = 0.5;
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#001508'); bg.addColorStop(0.5, '#000e05'); bg.addColorStop(1, '#000802');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#001a09'; ctx.lineWidth = 0.5;
  }
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Zone-specific decorations
  if (state.currentZone === 0) {
    drawCoastBackground();
    if (cv.crab.active) {
      const rock = COAST_ROCKS[cv.crab.rockIdx];
      drawCrab(rock.fx * canvasW, canvasH * rock.fy - 18, cv.crab.peekAnim);
    }
  } else if (state.currentZone === 1) {
    drawShallowsBackground();
  } else if (state.currentZone === 2) {
    drawSandbankBackground();
  } else if (state.currentZone === 3) {
    drawReefBackground();
  }

  // Screen shake when hook is stuck
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

  ctx.font = '10px "Space Mono"'; ctx.fillStyle = '#002612'; ctx.textAlign = 'left';
  ctx.fillText(`CASTS: ${state.stats.totalCasts}   CAUGHT: ${state.stats.totalCaught}`, 10, 18);
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
  const sc    = f.caught ? 1 + f.catchAnim * 0.5 : 1;
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
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  if (f.dir === -1) ctx.scale(-1, 1);
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
  const stuck = h.state === 'stuck';
  const hx = h.x + (h.shakeX || 0);
  const hy = h.y + (h.shakeY || 0);
  const col = stuck ? '#ff6600' : '#00ff88';
  const lineCol = stuck ? 'rgba(255,100,0,0.35)' : 'rgba(0,255,136,0.25)';

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
  ctx.beginPath(); ctx.arc(hx, hy, stuck ? 6 : 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawReticle(mx, my) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,136,0.16)'; ctx.lineWidth = 1;
  ctx.setLineDash([5, 9]);
  ctx.beginPath(); ctx.moveTo(canvasW/2, canvasH); ctx.lineTo(mx, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(0,255,136,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(mx, my, getCatchRadius(), 0, Math.PI*2); ctx.stroke();
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(0,255,136,0.58)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI*2); ctx.stroke();
  const r=13, g=7;
  ctx.strokeStyle = 'rgba(0,255,136,0.4)'; ctx.lineWidth = 1;
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
        <div class="inv-fish-name">${def.name}</div>
        <div class="inv-rarity-tag">${def.rarity} · ${def.goldValue}◈ each</div>
      </div>
      <div class="inv-card-bottom">
        <div class="inv-count">${count}</div>
        <div class="inv-sell-col">
          <div class="inv-value">= ${total}◈</div>
          <button class="sell-btn" data-type="${typeId}">SELL ALL</button>
        </div>
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
//  UPGRADES RENDERING
// ═══════════════════════════════════════════════════════════════

function renderUpgrades() {
  const el = document.getElementById('upgrades-grid');
  el.innerHTML = '';
  let anyRendered = false;

  for (const cat of UPGRADE_CATEGORIES) {
    const defs = cat.ids
      .map(id => UPGRADES_DEF.find(u => u.id === id))
      .filter(def => def && state.totalGoldEarned >= def.revealAt);

    if (!defs.length) continue;
    anyRendered = true;

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

  if (!anyRendered) {
    el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
  }
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

    const fishBreak = (unlocked || isCur) ? `
      <div class="atlas-fish-breakdown">
        <span class="fish-pct common">COMMON 50%</span>
        <span class="fish-pct uncommon">UNCOMMON 30%</span>
        <span class="fish-pct rare">RARE 10%</span>
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
        <div class="atlas-zone-tier">${zone.tier}</div>
        <div class="atlas-zone-id">${zone.code}</div>
        <div class="atlas-zone-name">${(unlocked || isCur) ? zone.name : '???'}</div>
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
      btn.addEventListener('click', () => {
        const zId = parseInt(btn.dataset.zone);
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
    el.innerHTML = '<div class="boat-empty">// NOTHING INSTALLED YET<br><br>Purchase OVERCLOCKED DRIVE from Upgrades<br>to unlock rod speed tuning.</div>';
    return;
  }

  const header = document.createElement('div');
  header.className = 'boat-section-header';
  header.textContent = 'ROD CONFIGURATION';
  el.appendChild(header);

  if (hasRodSpeed) {
    const maxSpeed = 450 + state.upgrades.rod_speed * 80;
    const minSpeed = 150;
    const curSpeed = Math.round(maxSpeed * state.boatSettings.rodSpeedFactor);

    const setting = document.createElement('div');
    setting.className = 'boat-setting';
    setting.innerHTML = `
      <div class="boat-setting-label">CAST SPEED</div>
      <div class="boat-setting-desc">Adjust your rod's cast speed. Lower speeds give more control. Max speed scales with OVERCLOCKED DRIVE level (currently ${maxSpeed}px/s).</div>
      <div class="boat-slider-row">
        <input type="range" class="boat-slider" id="slider-rod-speed"
          min="${minSpeed}" max="${maxSpeed}" step="10" value="${curSpeed}">
        <span class="boat-slider-val" id="rod-speed-val">${curSpeed}px/s</span>
      </div>
      <div class="boat-slider-labels">
        <span>SLOW (${minSpeed})</span><span>FAST (${maxSpeed})</span>
      </div>
    `;
    el.appendChild(setting);

    setting.querySelector('#slider-rod-speed').addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      state.boatSettings.rodSpeedFactor = v / maxSpeed;
      setting.querySelector('#rod-speed-val').textContent = `${v}px/s`;
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
    v: 5,
    gold: Math.floor(state.gold),
    totalGoldEarned: Math.floor(state.totalGoldEarned),
    currentZone: state.currentZone,
    unlockedZones: state.unlockedZones,
    inventory: state.inventory,
    upgrades: state.upgrades,
    stats: state.stats,
    passiveTimer: state.passiveTimer,
    baitCooldown: state.baitCooldown,
    boatSettings: state.boatSettings,
    flags: state.flags,
  }));
}

function importSave(code) {
  try {
    const d = JSON.parse(atob(code.trim()));
    if (d.v !== 5) throw new Error('version mismatch');
    state.gold            = d.gold || 0;
    state.totalGoldEarned = d.totalGoldEarned || 0;
    state.currentZone     = d.currentZone || 0;
    state.unlockedZones   = d.unlockedZones || [0];
    state.inventory       = d.inventory || {};
    state.upgrades        = { ...state.upgrades, ...d.upgrades };
    state.stats           = { ...state.stats, ...d.stats };
    state.passiveTimer    = d.passiveTimer || 0;
    state.baitCooldown    = d.baitCooldown || 0;
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
    b.style.display = 'block';
  }
  if (state.stats.totalCaught >= 1) document.getElementById('fishing-gold').classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════
//  EVENT WIRING
// ═══════════════════════════════════════════════════════════════

document.getElementById('btn-shop').addEventListener('click',     () => switchScreen('screen-shop'));
document.getElementById('btn-upgrades').addEventListener('click', () => switchScreen('screen-upgrades'));
document.getElementById('btn-atlas').addEventListener('click',    () => switchScreen('screen-atlas'));
document.getElementById('btn-log').addEventListener('click',      () => switchScreen('screen-log'));
document.getElementById('btn-boat').addEventListener('click',     () => switchScreen('screen-boat'));

document.getElementById('btn-back-shop').addEventListener('click',     () => switchScreen('screen-fishing'));
document.getElementById('btn-back-upgrades').addEventListener('click', () => switchScreen('screen-fishing'));
document.getElementById('btn-back-atlas').addEventListener('click',    () => switchScreen('screen-fishing'));
document.getElementById('btn-back-log').addEventListener('click',      () => switchScreen('screen-fishing'));
document.getElementById('btn-back-boat').addEventListener('click',     () => switchScreen('screen-fishing'));

document.getElementById('btn-bait').addEventListener('click', useBait);

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

  // Stuck hook — each click frees it a bit
  if (cv.hook && cv.hook.state === 'stuck') {
    cv.hook.stuckClicks++;
    cv.hook.shakeIntensity = 16;
    if (cv.hook.stuckClicks >= cv.hook.stuckThreshold) {
      cv.hook.state = 'retracting';
      cv.hook.shakeX = 0; cv.hook.shakeY = 0;
      cv.screenShake.x = 0; cv.screenShake.y = 0;
    }
    return;
  }

  if (state.currentZone === 0 && clickCrab(cx, cy)) return;
  castHook(cx, cy);
});
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (state.upgrades.instant_retract >= 1 && cv.hook && cv.hook.state !== 'retracting') {
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
