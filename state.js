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
    auto_hook: 0, auto_hook_speed: 0, auto_hook_reload: 0, fish_density: 0, luck_boost: 0,
    bait_bomb: 0, bait_cooldown: 0, bait_strength: 0,
    multi_cast: 0, multi_cooldown: 0, multi_duration: 0, multi_rods: 0,
    net_place: 0, net_slots: 0, net_size: 0,
    atlas_access: 0, boat_access: 0, catalog_access: 0,
  },
  consumables: { small_net: 0, big_net: 0 },
  activeConsumable: null,
  stats: { totalCaught: 0, totalCasts: 0, totalUpgradesBought: 0 },
  catalogCaught: {},
  materials: {},
  baitTimer: 0,
  baitCooldown: 0,
  multiCastTimer: 0,
  multiCastCooldown: 0,
  autoHookTimer: 0,
  netZoneCooldown: 0,
  netCooldown: 0,
  boatSettings: { rodSpeedFactor: 1.0 },
  flags: {
    shopUnlocked:       false,
    upgradesUnlocked:   false,
    atlasUnlocked:      false,
    boatUnlocked:       false,
    upgradesVisited:    false,
    atlasVisited:       false,
    shopVisited:        false,
    boatVisited:        false,
    saveUnlocked:       false,
    baitVisible:        false,
    multiCastVisible:   false,
    consumablesSidebar: false,
    consumableBought:   false,
    firstUpgradeHinted: false,
    catalogUnlocked:    false,
    autoHookEnabled:    false,
  },
  showMaxedUpgrades: false,
};

// ─── Derived ───

function getRecastCooldown() {
  return Math.max(0.05, 2.5 - state.upgrades.faster_reel * 0.08);
}

function getCastSpeed() {
  const baseSpeed = 380;
  const maxSpeed = baseSpeed * (1 + state.upgrades.rod_speed * 0.06);
  return maxSpeed * state.boatSettings.rodSpeedFactor;
}

function getMaxFish() {
  return Math.ceil(ZONES[state.currentZone].maxFish * (1 + state.upgrades.fish_density * 0.06));
}

function getCatchRadius(typeId) {
  const base  = 36;
  const scope = base * state.upgrades.targeting_scope * 0.06;
  return base + scope;
}

function getNetRadius() {
  return 38 + (state.upgrades.net_size || 0) * 10;
}

function getMaxNets() {
  return 1 + (state.upgrades.net_slots || 0);
}

function getAutoHookInterval() {
  return Math.max(1, 30 - (state.upgrades.auto_hook_speed || 0));
}

function getAutoHookRecastCooldown() {
  return Math.max(0.05, 1.5 - (state.upgrades.auto_hook_reload || 0) * 0.1);
}

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

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
