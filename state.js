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
    rod_speed: 0, rod_speed_2: 0, rod_speed_3: 0,
    faster_reel: 0, faster_reel_2: 0,
    instant_retract: 0, retract_speed: 0, retract_speed_2: 0,
    targeting_scope: 0, targeting_scope_2: 0,
    fish_magnet: 0, fish_magnet_2: 0,
    net_place: 0, net_slots: 0, net_size: 0,
    auto_hook: 0,
    auto_hook_speed: 0, auto_hook_speed_2: 0,
    auto_hook_reload: 0, auto_hook_reload_2: 0,
    fish_density: 0, fish_density_2: 0, fish_density_3: 0,
    gold_boost: 0, gold_boost_2: 0,
    luck_boost: 0, luck_boost_2: 0, legendary_slow: 0,
    auto_sell: 0,
    harpoon: 0, harpoon_damage: 0, harpoon_damage_2: 0, harpoon_speed: 0, harpoon_speed_2: 0,
    bait_bomb: 0, bait_cooldown: 0, bait_strength: 0, auto_bait: 0,
    multi_cast: 0, multi_cooldown: 0, multi_duration: 0, multi_rods: 0, auto_multi: 0,
    bf_spawn_rate: 0, bf_spawn_rate_2: 0, bf_effect_duration: 0, bf_sell_multiplier: 0, bf_frenzy_count: 0,
    atlas_access: 0, boat_access: 0, catalog_access: 0,
  },
  consumables: { small_net: 0, big_net: 0, black_fish_bait: 0 },
  activeConsumable: null,
  playTime: 0,
  stats: { totalCaught: 0, totalCasts: 0, totalUpgradesBought: 0 },
  catalogCaught: {},
  materials: {},
  baitTimer: 0,
  baitCooldown: 0,
  multiCastTimer: 0,
  multiCastCooldown: 0,
  autoHookTimer: 0,
  autoHookTarget: null,
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
    autoSellEnabled: false,
    autoBaitEnabled: false,
    autoMultiEnabled: false,
    prestigeUnlocked: false,
  },
  showMaxedUpgrades: false,
  feedingFrenzyTimer: 0,
  fishmongerBoonTimer: 0,
  treasureChestTimer: 0,
  labSaleTimer: 0,
  sellMultiplier: 1,
  weaponMode: 'rod', // 'rod' | 'harpoon'
  bossFight: null, // { targetZone, hp, maxHp, timer, bossData, x, y, dir, wobble, hitFlash }
  bossesDefeated: [], // zone IDs of defeated bosses
  sfxVolume: 0.5,
  musicVolume: 0.5,
  prestige: {
    pearls: 0,
    timesPrestiged: 0,
    upgrades: {
      infinite_kelp: 0,
      pearl_sell_boost: 0,
      pearl_rod_speed: 0,
      pearl_spawn_rate: 0,
      pearl_extra_tiers: 0,
      pearl_blender: 0,
    },
  },
  blender: { fish: 0, timer: 0, active: false },
};

// ─── Derived ───

function getRecastCooldown() {
  return Math.max(0.05, 2.5 - getUpgradeLevel('faster_reel') * 0.08);
}

function getCastSpeed() {
  const baseSpeed = 380;
  const maxSpeed = baseSpeed * (1 + getUpgradeLevel('rod_speed') * 0.06);
  return maxSpeed * state.boatSettings.rodSpeedFactor * getPrestigeRodSpeedMultiplier();
}

function getMaxFish() {
  return Math.ceil(ZONES[state.currentZone].maxFish * (1 + getUpgradeLevel('fish_density') * 0.06));
}

function getCatchRadius(typeId) {
  const base  = 36;
  const scope = base * getUpgradeLevel('targeting_scope') * 0.06;
  return base + scope;
}

function getNetRadius() {
  return 38 + (state.upgrades.net_size || 0) * 18;
}

function getMaxNets() {
  return 1 + (state.upgrades.net_slots || 0);
}

function getAutoHookInterval() {
  return Math.max(1, 30 - getUpgradeLevel('auto_hook_speed'));
}

function getAutoHookRecastCooldown() {
  return Math.max(0.05, 1.5 - getUpgradeLevel('auto_hook_reload') * 0.1);
}

// ═══════════════════════════════════════════════════════════════
//  AUDIO
// ═══════════════════════════════════════════════════════════════

const audio = {
  ctx: null,
  buffers: {},
  music: { main: null, lab: null },
  musicScale: { main: 1, lab: 1.8 },
  musicGain: null,
  sfxGain: null,
  activeMusic: null,   // 'main' | 'lab'
  _fadeInterval: null,
  _initPromise: null,

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = state.musicVolume;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = state.sfxVolume;
    this.sfxGain.connect(this.ctx.destination);

    // Load SFX buffers
    const sfxFiles = {
      cast: 'Audio/CastReel.mp3',
      catch1: 'Audio/GetFish.mp3',
      catch2: 'Audio/GetFish2.mp3',
      catch3: 'Audio/GetFish3.mp3',
      catch4: 'Audio/GetFish4.mp3',
      catch_rare: 'Audio/GetRareFish.mp3',
      click: 'Audio/ButtonClickGeneric.mp3',
    };
    for (const [key, path] of Object.entries(sfxFiles)) {
      try {
        const res = await fetch(path);
        const buf = await res.arrayBuffer();
        this.buffers[key] = await this.ctx.decodeAudioData(buf);
      } catch (e) { /* skip missing files */ }
    }

    // Load music as looping HTML Audio elements (streams, doesn't need full decode)
    this.music.main = new Audio('Audio/MainMusic.mp3');
    this.music.main.loop = true;
    this.music.main.volume = 0;

    this.music.lab = new Audio('Audio/LabAudio.mp3');
    this.music.lab.loop = true;
    this.music.lab.volume = 0;

  },

  play(sound) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    let bufferKey;
    if (sound === 'cast') {
      bufferKey = 'cast';
    } else if (sound === 'catch_common') {
      const picks = ['catch1', 'catch2', 'catch3', 'catch4'];
      bufferKey = picks[Math.floor(Math.random() * picks.length)];
    } else if (sound === 'catch_rare') {
      bufferKey = 'catch_rare';
    } else if (sound === 'click') {
      bufferKey = 'click';
    } else {
      return;
    }
    const buffer = this.buffers[bufferKey];
    if (!buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    if (bufferKey === 'click') {
      const boost = this.ctx.createGain();
      boost.gain.value = 3.0;
      src.connect(boost);
      boost.connect(this.sfxGain);
    } else {
      src.connect(this.sfxGain);
    }
    src.start(0);
  },

  startMusic() {
    if (!this.music.main) return;
    this.music.main.play().catch(() => {});
    this.activeMusic = 'main';
    this._fadeTo('main');
  },

  switchMusic(target) {
    if (this.activeMusic === target) return;
    this.activeMusic = target;
    const fadeIn = this.music[target];
    if (fadeIn.paused) fadeIn.play().catch(() => {});
    // Fade out all other tracks, fade in target
    const outs = [];
    for (const key of Object.keys(this.music)) {
      if (key !== target && this.music[key] && !this.music[key].paused) outs.push(this.music[key]);
    }
    this._crossFadeMulti(outs, fadeIn, target);
  },

  _crossFadeMulti(outs, into, targetKey) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const targetVol = state.musicVolume * (this.musicScale[targetKey] || 1);
    const step = 0.02;
    this._fadeInterval = setInterval(() => {
      let done = true;
      for (const out of outs) {
        if (out.volume > 0) { out.volume = Math.max(0, out.volume - step); done = false; }
      }
      if (into.volume < targetVol) { into.volume = Math.min(targetVol, into.volume + step); done = false; }
      if (done) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        for (const out of outs) { if (out.volume === 0) out.pause(); }
      }
    }, 30);
  },

  _crossFade(out, into) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const targetVol = state.musicVolume;
    const step = 0.02;
    this._fadeInterval = setInterval(() => {
      let done = true;
      if (out.volume > 0) { out.volume = Math.max(0, out.volume - step); done = false; }
      if (into.volume < targetVol) { into.volume = Math.min(targetVol, into.volume + step); done = false; }
      if (done) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
        if (out.volume === 0) out.pause();
      }
    }, 30);
  },

  _fadeTo(target) {
    if (this._fadeInterval) clearInterval(this._fadeInterval);
    const track = this.music[target];
    const targetVol = state.musicVolume * (this.musicScale[target] || 1);
    this._fadeInterval = setInterval(() => {
      if (track.volume < targetVol) {
        track.volume = Math.min(targetVol, track.volume + 0.02);
      } else {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
      }
    }, 30);
  },

  setSfxVolume(v) {
    state.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  },

  setMusicVolume(v) {
    state.musicVolume = v;
    // Update whichever track is currently playing
    for (const key of Object.keys(this.music)) {
      if (this.music[key] && !this.music[key].paused) {
        this.music[key].volume = v * (this.musicScale[key] || 1);
      }
    }
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

function dist(x1, x2, y1, y2) {
  const dx = x1 - x2, dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
