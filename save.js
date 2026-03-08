// ═══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ═══════════════════════════════════════════════════════════════

function exportSave() {
  return btoa(JSON.stringify({
    v: 12,
    gold: Math.floor(state.gold),
    totalGoldEarned: Math.floor(state.totalGoldEarned),
    currentZone: state.currentZone,
    unlockedZones: state.unlockedZones,
    inventory: state.inventory,
    upgrades: state.upgrades,
    consumables: state.consumables,
    stats: state.stats,
    baitCooldown: state.baitCooldown,
    multiCastCooldown: state.multiCastCooldown,
    boatSettings: state.boatSettings,
    flags: state.flags,
    catalogCaught: state.catalogCaught,
    materials: state.materials,
  }));
}

function importSave(code) {
  try {
    const d = JSON.parse(atob(code.trim()));
    if (![5,6,7,8,9,10,11,12].includes(d.v)) throw new Error('version mismatch');
    state.gold            = d.gold || 0;
    state.totalGoldEarned = d.totalGoldEarned || 0;
    state.currentZone     = Math.min(d.currentZone || 0, ZONES.length - 1);
    state.unlockedZones   = (d.unlockedZones || [0]).filter(z => z < ZONES.length);
    state.inventory       = d.inventory || {};
    state.upgrades        = { ...state.upgrades, ...d.upgrades };
    // Migrate salvaged_net to auto_hook if present
    if (d.upgrades && d.upgrades.salvaged_net && !d.upgrades.auto_hook) {
      state.upgrades.auto_hook = Math.min(d.upgrades.salvaged_net, 30);
    }
    delete state.upgrades.salvaged_net;
    state.consumables     = { ...state.consumables, ...(d.consumables || {}) };
    delete state.consumables.worm;
    state.stats           = { ...state.stats, ...d.stats };
    state.baitCooldown    = d.baitCooldown || 0;
    state.multiCastCooldown = d.multiCastCooldown || 0;
    state.boatSettings    = { ...state.boatSettings, ...(d.boatSettings || {}) };
    state.flags           = { ...state.flags, ...d.flags };
    state.catalogCaught   = { ...state.catalogCaught, ...(d.catalogCaught || {}) };
    state.materials       = { ...state.materials, ...(d.materials || {}) };
    cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.placedNets = [];
    updateZoneOverlay();
    applyFlagsToDOM();
    updateAllGoldDisplays();
    return true;
  } catch {
    return false;
  }
}

// Auto-save locally every 60 seconds
let _autoSaveInterval = null;
function startAutoSave() {
  if (_autoSaveInterval) clearInterval(_autoSaveInterval);
  _autoSaveInterval = setInterval(() => {
    try {
      localStorage.setItem('oceanIdleSave', exportSave());
    } catch (e) { /* storage full or unavailable */ }
  }, 60000);
}

function loadLocalSave() {
  try {
    const saved = localStorage.getItem('oceanIdleSave');
    if (saved) return importSave(saved);
  } catch (e) { /* unavailable */ }
  return false;
}

function applyFlagsToDOM() {
  const f = state.flags;
  if (f.shopUnlocked)     showBubble('btn-shop', false);
  if (f.upgradesUnlocked) showBubble('btn-upgrades', !f.upgradesVisited);
  if (f.atlasUnlocked)    showBubble('btn-atlas', !f.atlasVisited);
  if (f.boatUnlocked)     showBubble('btn-boat', !f.boatVisited);
  if (f.catalogUnlocked)  showBubble('btn-catalog', false);
  if (f.saveUnlocked)     document.getElementById('fishing-save-btns').classList.add('visible');
  if (f.baitVisible) {
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
    if (!f.baitUsed) { b.classList.add('pulse-new'); addGuideArrow(b, 'right'); }
  }
  if (f.multiCastVisible) {
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
  }
  renderConsumablesPanel();
  if (typeof updateAutoHookUI === 'function') updateAutoHookUI();
}
