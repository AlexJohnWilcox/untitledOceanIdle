// ═══════════════════════════════════════════════════════════════
//  ECONOMY
// ═══════════════════════════════════════════════════════════════

// Item 19: exponential cost past 10 upgrades for /30 upgrades
function upgradeCost(id) {
  const def = UPGRADES_DEF.find(u => u.id === id);
  const level = state.upgrades[id];
  let cost = def.baseCost * Math.pow(def.costScale, level);
  if (def.max >= 30 && level >= 10) {
    cost *= Math.pow(1.08, level - 10);
  }
  return Math.ceil(cost);
}

function buyUpgrade(id) {
  const def  = UPGRADES_DEF.find(u => u.id === id);
  const cost = upgradeCost(id);
  if (state.upgrades[id] >= def.max || state.gold < cost) return;
  state.gold -= cost;
  state.upgrades[id]++;
  state.stats.totalUpgradesBought++;
  audio.play('upgrade');

  // Auto_hook first purchase — show toggle with guide arrow (default off)
  if (id === 'auto_hook' && state.upgrades.auto_hook === 1) {
    if (typeof updateAutoHookUI === 'function') {
      updateAutoHookUI();
      const bar = document.getElementById('auto-hook-bar');
      if (bar) {
        bar.classList.add('pulse-hint');
        addGuideArrow(bar);
      }
    }
  }
  // Update auto hook label when upgrading speed/reload
  if ((id === 'auto_hook_speed' || id === 'auto_hook_reload') && typeof updateAutoHookUI === 'function') {
    updateAutoHookUI();
  }
  // Update net button when upgrading net slots/size
  if (id === 'net_place' || id === 'net_slots' || id === 'net_size') {
    updatePlaceNetBtn();
  }

  updateAllGoldDisplays();
  renderUpgrades();
  checkMilestones();
}

function placeNet(cx, cy) {
  if (state.upgrades.net_place < 1) return;
  if (state.netCooldown > 0) return;
  const maxNets = getMaxNets();
  const radius = getNetRadius();
  if (cv.placedNets.length >= maxNets) return;
  cv.placedNets.push({ x: cx, y: cy, radius });
  state.activeConsumable = null;
  document.getElementById('btn-place-net').classList.remove('active');
  updatePlaceNetBtn();
}

function updatePlaceNetBtn() {
  const btn = document.getElementById('btn-place-net');
  if (state.upgrades.net_place >= 1) {
    btn.style.display = 'flex';
    const maxNets = getMaxNets();
    if (state.netCooldown > 0) {
      btn.textContent = `NET ${Math.ceil(state.netCooldown)}s`;
      btn.classList.add('cooldown');
      btn.classList.remove('active');
      btn.title = `NET COOLDOWN (${Math.ceil(state.netCooldown)}s)`;
    } else {
      btn.textContent = `NET ${cv.placedNets.length}/${maxNets}`;
      btn.classList.remove('cooldown');
      btn.title = `PLACE NET (${cv.placedNets.length}/${maxNets})`;
    }
  }
}

function useBait() {
  if (state.baitCooldown > 0 || state.upgrades.bait_bomb < 1) return;
  state.flags.baitUsed = true;
  state.baitTimer   = 5;
  state.baitCooldown = 300 - state.upgrades.bait_cooldown * 30;
  const fishCount = 18 + state.upgrades.bait_strength * 6;
  const interval = (5 * 1000) / fishCount;
  for (let i = 0; i < fishCount; i++) setTimeout(() => spawnFish(), i * interval);
  updateBaitBtn();
}

function useMultiCast() {
  if (state.multiCastCooldown > 0 || state.upgrades.multi_cast < 1) return;
  const duration = 15 + state.upgrades.multi_duration * 3;
  state.multiCastTimer = duration;
  state.multiCastCooldown = 180 - state.upgrades.multi_cooldown * 15;
  updateMultiCastBtn();
}

function sellFish(typeId) {
  const count = state.inventory[typeId] || 0;
  if (!count) return;
  const earned = count * FISH[typeId].goldValue;
  state.gold += earned;
  state.totalGoldEarned += earned;
  delete state.inventory[typeId];
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function sellGoldenFish(goldenId) {
  const count = state.inventory[goldenId] || 0;
  if (!count) return;
  const baseId = goldenId.replace('golden_', '');
  const earned = count * FISH[baseId].goldValue * 10;
  state.gold += earned;
  state.totalGoldEarned += earned;
  delete state.inventory[goldenId];
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function sellAll() {
  let total = 0, count = 0;
  for (const [id, qty] of Object.entries(state.inventory)) {
    if (id.startsWith('golden_')) {
      const baseId = id.replace('golden_', '');
      total += qty * FISH[baseId].goldValue * 10;
    } else {
      total += qty * FISH[id].goldValue;
    }
    count += qty; delete state.inventory[id];
  }
  if (!count) return;
  state.gold += total;
  state.totalGoldEarned += total;
  audio.play('sell');
  if (!state.flags.sellAllUsed) {
    state.flags.sellAllUsed = true;
    const backBtn = document.getElementById('btn-back-shop');
    backBtn.classList.add('pulse-hint');
    addGuideArrow(backBtn, 'right');
  }
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
  audio.play('unlock');
  travelToZone(zoneId);
}

// ─── Milestones ───

function checkMilestones() {
  const f = state.flags;

  if (!f.shopUnlocked && state.stats.totalCaught >= 3) {
    f.shopUnlocked = true;
    showBubble('btn-shop', true);
  }
  if (!f.upgradesUnlocked && state.gold >= 15) {
    f.upgradesUnlocked = true;
    showBubble('btn-upgrades', true);
  }
  if (!f.saveUnlocked && state.totalGoldEarned >= 200) {
    f.saveUnlocked = true;
    document.getElementById('fishing-save-btns').classList.add('visible');
  }

  if (!f.atlasUnlocked && state.upgrades.atlas_access >= 1) {
    f.atlasUnlocked = true;
    showBubble('btn-atlas', true);
  }
  if (!f.boatUnlocked && state.upgrades.boat_access >= 1) {
    f.boatUnlocked = true;
    showBubble('btn-boat', true);
  }
  if (!f.catalogUnlocked && state.upgrades.catalog_access >= 1) {
    f.catalogUnlocked = true;
    showBubble('btn-catalog', true);
  }

  if (!f.baitVisible && state.upgrades.bait_bomb >= 1) {
    f.baitVisible = true;
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
    b.classList.add('pulse-new');
    b.offsetHeight;
    addGuideArrow(b, 'right');
  }
  if (f.baitVisible && !f.baitUsed) {
    const b = document.getElementById('btn-bait');
    if (!b.querySelector('.guide-arrow')) addGuideArrow(b, 'right');
  }

  // Net placement button
  if (state.upgrades.net_place >= 1) {
    const nb = document.getElementById('btn-place-net');
    if (nb.style.display === 'none') {
      nb.style.display = 'flex';
      nb.classList.add('pulse-new');
      addGuideArrow(nb, 'right');
    }
    updatePlaceNetBtn();
  }

  if (!f.multiCastVisible && state.upgrades.multi_cast >= 1) {
    f.multiCastVisible = true;
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
    mc.classList.add('pulse-new');
    mc.offsetHeight;
  }
}

// ═══════════════════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════════════════

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
  btn.offsetHeight;
  btn.classList.add('revealed');
  if (unread) {
    btn.classList.add('unread');
    addGuideArrow(btn);
  }
}

function addGuideArrow(el, side) {
  if (!el || el.querySelector('.guide-arrow')) return;
  const arrow = document.createElement('span');
  arrow.className = 'guide-arrow' + (side === 'right' ? ' arrow-right' : side === 'left' ? ' arrow-left' : '');
  arrow.textContent = '▼';
  el.style.position = el.style.position || 'relative';
  el.appendChild(arrow);
  el.addEventListener('click', () => {
    const a = el.querySelector('.guide-arrow');
    if (a) a.remove();
    el.classList.remove('pulse-hint', 'unread', 'pulse-new');
  }, { once: true });
}

function updateAllGoldDisplays() {
  const g = Math.floor(state.gold);
  ['gold-fishing', 'gold-shop', 'gold-upgrades', 'gold-atlas', 'gold-boat', 'gold-catalog'].forEach(id => {
    const elem = document.getElementById(id);
    if (!elem) return;
    elem.textContent = g;
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
  el.offsetHeight;
  el.classList.add('zone-flash');
}

// ─── Screen management ───

const ALL_SCREENS = ['screen-fishing', 'screen-shop', 'screen-upgrades', 'screen-atlas', 'screen-boat', 'screen-catalog'];

function switchScreen(to) {
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('flash');
  setTimeout(() => {
    ALL_SCREENS.forEach(id => {
      document.getElementById(id).classList.toggle('active', id === to);
    });
    overlay.classList.remove('flash');

    if (to === 'screen-shop') {
      state.flags.shopVisited = true;
      renderShop();
    }
    if (to === 'screen-upgrades') {
      document.getElementById('btn-upgrades').classList.remove('unread');
      const firstVisit = !state.flags.upgradesVisited;
      state.flags.upgradesVisited = true;
      renderUpgrades();
      if (firstVisit && !state.flags.firstUpgradeHinted) {
        state.flags.firstUpgradeHinted = true;
        const firstCard = document.querySelector('.upg-card');
        if (firstCard) {
          firstCard.classList.add('pulse-hint');
          addGuideArrow(firstCard);
        }
      }
    }
    if (to === 'screen-atlas') {
      document.getElementById('btn-atlas').classList.remove('unread');
      state.flags.atlasVisited = true;
      renderAtlas();
    }
    if (to === 'screen-boat') {
      document.getElementById('btn-boat').classList.remove('unread');
      state.flags.boatVisited = true;
      renderBoat();
    }
    if (to === 'screen-catalog') {
      document.getElementById('btn-catalog').classList.remove('unread');
      renderCatalog();
    }
  }, 180);
}

// ─── Travel animation ───

function travelToZone(zoneId) {
  // Can't travel while net cooldown is active
  if (state.netCooldown > 0) {
    cv.catchFlashes.push({
      x: canvasW / 2, y: canvasH / 2, timer: 2.0,
      text: `NET COOLDOWN: ${Math.ceil(state.netCooldown)}s`, color: '#ff4466',
    });
    return;
  }
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
      // Remove nets and start 2 min cooldown if nets were placed
      if (cv.placedNets.length > 0) {
        state.netCooldown = 120;
      }
      cv.placedNets = [];
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
//  SHOP RENDERING
// ═══════════════════════════════════════════════════════════════

function renderShop() {
  renderInventory();
  updateSellAllBtn();
  renderFishmongerArt();
}

function renderFishmongerArt() {
  const container = document.getElementById('fishmonger-art');
  if (!container) return;
  container.innerHTML = '';
  const shopRight = document.getElementById('shop-right');
  const artH = Math.max(500, shopRight.clientHeight || 600);
  const W = 380;
  const cx = W / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = artH;
  container.appendChild(c);
  const x = c.getContext('2d');

  x.fillStyle = '#010a04';
  x.fillRect(0, 0, W, artH);

  const counterY = 310;
  x.fillStyle = '#0a1a0a';
  x.fillRect(10, counterY, W - 20, 60);
  x.strokeStyle = '#00cc8844';
  x.lineWidth = 1;
  x.strokeRect(10, counterY, W - 20, 60);
  x.fillStyle = '#0e2a12';
  x.fillRect(12, counterY + 2, W - 24, 5);

  x.fillStyle = '#061208';
  x.fillRect(cx - 50, 160, 100, 150);

  x.fillStyle = '#0a2a10';
  x.fillRect(cx - 42, 210, 84, 100);
  x.strokeStyle = '#00885544';
  x.strokeRect(cx - 42, 210, 84, 100);

  x.fillStyle = '#0c1e0c';
  x.beginPath();
  x.arc(cx, 140, 42, 0, Math.PI * 2);
  x.fill();

  x.fillStyle = '#00ff88';
  x.shadowColor = '#00ff88';
  x.shadowBlur = 12;
  x.beginPath(); x.arc(cx - 14, 135, 4.5, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(cx + 14, 135, 4.5, 0, Math.PI * 2); x.fill();
  x.shadowBlur = 0;

  x.fillStyle = '#00886644';
  x.fillRect(cx - 44, 102, 88, 16);

  x.fillStyle = '#061208';
  x.fillRect(cx - 80, 220, 32, 85);
  x.fillRect(cx + 48, 220, 32, 85);

  x.fillStyle = '#0c1e0c';
  x.beginPath(); x.arc(cx - 64, counterY - 4, 14, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(cx + 64, counterY - 4, 14, 0, Math.PI * 2); x.fill();

  const fishColors = ['#00cc66', '#88ccff', '#ff4466', '#cc44ff', '#ffcc44'];
  const fishXs = [50, 120, 190, 260, 330];
  for (let i = 0; i < 5; i++) {
    const fy = 45 + Math.sin(i * 1.5) * 12;
    x.strokeStyle = '#004422';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(fishXs[i], 8); x.lineTo(fishXs[i], fy); x.stroke();
    x.strokeStyle = '#00885544';
    x.beginPath(); x.arc(fishXs[i], fy + 5, 5, 0, Math.PI); x.stroke();
    x.fillStyle = fishColors[i];
    x.shadowColor = fishColors[i];
    x.shadowBlur = 8;
    x.beginPath();
    x.ellipse(fishXs[i], fy + 22, 18, 9, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(fishXs[i] - 16, fy + 22);
    x.lineTo(fishXs[i] - 28, fy + 12);
    x.lineTo(fishXs[i] - 28, fy + 32);
    x.closePath();
    x.fill();
    x.shadowBlur = 0;
    x.fillStyle = '#000';
    x.beginPath(); x.arc(fishXs[i] + 8, fy + 19, 2.5, 0, Math.PI * 2); x.fill();
  }

  x.strokeStyle = '#003a20';
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(20, 90); x.lineTo(W - 20, 90); x.stroke();

  x.fillStyle = '#001a0a';
  for (const jx of [40, 100, 280, 340]) {
    x.fillRect(jx - 10, 68, 20, 22);
    x.strokeStyle = '#00cc6622';
    x.strokeRect(jx - 10, 68, 20, 22);
  }

  x.fillStyle = '#060e06';
  x.fillRect(0, counterY + 60, W, artH - counterY - 60);
  x.strokeStyle = '#003a20';
  x.lineWidth = 0.5;
  for (let lx = 0; lx < W; lx += 45) {
    x.beginPath(); x.moveTo(lx, counterY + 60); x.lineTo(lx, artH); x.stroke();
  }

  x.fillStyle = 'rgba(0,204,221,0.06)';
  x.fillRect(10, counterY - 2, W - 20, 4);
}

function renderInventory() {
  const el = document.getElementById('inventory-grid');
  el.innerHTML = '';

  const entries = Object.entries(state.inventory)
    .filter(([id, c]) => c > 0 && !id.startsWith('golden_'))
    .sort(([a], [b]) => RARITY_ORDER[FISH[a].rarity] - RARITY_ORDER[FISH[b].rarity]);

  const goldenEntries = Object.entries(state.inventory)
    .filter(([id, c]) => c > 0 && id.startsWith('golden_'))
    .sort(([a], [b]) => {
      const aBase = a.replace('golden_', ''), bBase = b.replace('golden_', '');
      return RARITY_ORDER[FISH[aBase].rarity] - RARITY_ORDER[FISH[bBase].rarity];
    });

  if (!entries.length && !goldenEntries.length) {
    el.innerHTML = '<div class="inv-empty">// FISH HOLD EMPTY</div>';
    return;
  }

  // Golden fish first (special display)
  for (const [goldenId, count] of goldenEntries) {
    const baseId = goldenId.replace('golden_', '');
    const def = FISH[baseId]; if (!def) continue;
    const goldValue = def.goldValue * 10;
    const total = count * goldValue;

    const card = document.createElement('div');
    card.className = 'inv-card rarity-golden';
    card.innerHTML = `
      <div class="inv-card-top">
        <div class="inv-card-top-left">
          <div class="inv-fish-name" style="color:#ffcc44">★ ${def.name}</div>
          <div class="inv-rarity-tag" style="color:#ffcc44">GOLDEN</div>
        </div>
        <div class="inv-card-top-right">
          <button class="sell-btn" data-type="${goldenId}">SELL ALL</button>
          <div class="inv-value" style="color:#ffcc44">${goldValue}◈ each · = ${total}◈</div>
        </div>
      </div>
      <div class="inv-card-bottom">
        <div class="inv-count" style="color:#ffcc44">${count}</div>
      </div>
    `;
    card.querySelector('.sell-btn').addEventListener('click', () => sellGoldenFish(goldenId));
    el.appendChild(card);
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
  btn.style.display = '';
  const total = Object.entries(state.inventory)
    .reduce((s, [id, q]) => {
      if (id.startsWith('golden_')) {
        const baseId = id.replace('golden_', '');
        return s + q * (FISH[baseId]?.goldValue || 0) * 10;
      }
      return s + q * (FISH[id]?.goldValue || 0);
    }, 0);
  btn.textContent = total > 0 ? `[ SELL ALL — ${total}◈ ]` : '[ SELL ALL ]';
  if (!state.flags.sellAllUsed && total > 0) {
    if (!btn.querySelector('.guide-arrow')) {
      btn.classList.add('pulse-hint');
      addGuideArrow(btn);
    }
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
  state.flags.consumableBought = true;
  audio.play('upgrade');
  updateAllGoldDisplays();
  renderUpgrades();
  renderConsumablesPanel();
}

function renderConsumablesPanel() {
  const bar = document.getElementById('consumables-bar');
  if (!bar) return;
  bar.innerHTML = '';
  let anyOwned = false;
  for (const def of CONSUMABLES_DEF) {
    const owned = state.consumables[def.id] || 0;
    if (owned <= 0) continue;
    anyOwned = true;
    const isActive = state.activeConsumable === def.id;
    const btn = document.createElement('button');
    btn.className = `consumable-nav-btn${isActive ? ' active' : ''}`;
    btn.title = def.name;
    const iconChar = def.id === 'small_net' ? 'S' : 'B';
    btn.innerHTML = `<span class="consumable-nav-icon">${iconChar}</span>${owned > 0 ? `<span class="consumable-nav-count">${owned}x</span>` : ''}`;
    btn.addEventListener('click', () => {
      state.activeConsumable = (state.activeConsumable === def.id) ? null : def.id;
      renderConsumablesPanel();
    });
    bar.appendChild(btn);
  }
  if (anyOwned) {
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════
//  UPGRADES RENDERING
// ═══════════════════════════════════════════════════════════════

let activeUpgradeTab = 0;

// Progression system (#13): tabs unlock based on total fish caught
// ROD ENHANCEMENTS: always unlocked
// AUTOMATION + AUTO HOOK: visible at start, unlocked at 10 fish
// CONSUMABLES: visible after AUTOMATION unlocked, unlocked at 25 fish
// ABILITIES: visible after AUTOMATION unlocked, unlocked at 40 fish
// NETS: visible after CONSUMABLES+ABILITIES unlocked, unlocked at 75 fish
// MAP LOCATIONS: visible after NETS unlocked, unlocked at 100 fish
function getCategoryState(catName) {
  const caught = state.stats.totalCaught || 0;
  const T = PROGRESSION_THRESHOLDS;
  switch (catName) {
    case 'ROD ENHANCEMENTS': return { visible: true, unlocked: true };
    case 'AUTOMATION':       return { visible: true, unlocked: caught >= T.AUTOMATION, threshold: T.AUTOMATION };
    case 'AUTO HOOK':        return { visible: true, unlocked: caught >= T.AUTO_HOOK, threshold: T.AUTO_HOOK };
    case 'CONSUMABLES':      return { visible: caught >= T.AUTOMATION, unlocked: caught >= T.CONSUMABLES, threshold: T.CONSUMABLES };
    case 'ABILITIES':        return { visible: caught >= T.AUTOMATION, unlocked: caught >= T.ABILITIES, threshold: T.ABILITIES };
    case 'NETS':             return { visible: caught >= T.ABILITIES, unlocked: caught >= T.NETS, threshold: T.NETS };
    case 'MAP LOCATIONS':    return { visible: caught >= T.NETS, unlocked: caught >= T.MAP_LOCATIONS, threshold: T.MAP_LOCATIONS };
    default: return { visible: false, unlocked: false };
  }
}

function getVisibleCategories() {
  return UPGRADE_CATEGORIES.filter(cat => getCategoryState(cat.name).visible);
}

let _previousVisibleTabNames = null;

function renderUpgradeTabs() {
  const tabsEl = document.getElementById('upgrades-tabs');
  tabsEl.innerHTML = '';
  const visibleCats = getVisibleCategories();
  if (!visibleCats.length) return;
  if (activeUpgradeTab >= visibleCats.length) activeUpgradeTab = 0;

  const currentNames = visibleCats.map(c => c.name);
  const newTabs = _previousVisibleTabNames
    ? currentNames.filter(n => !_previousVisibleTabNames.includes(n))
    : [];
  _previousVisibleTabNames = currentNames;

  visibleCats.forEach((cat, i) => {
    const catState = getCategoryState(cat.name);
    const btn = document.createElement('button');
    const isNew = newTabs.includes(cat.name);
    const isLocked = !catState.unlocked;
    btn.className = `upg-tab${i === activeUpgradeTab && !isLocked ? ' active' : ''}${isNew && !isLocked ? ' tab-new' : ''}${isLocked ? ' tab-locked' : ''}`;
    if (isLocked) {
      const caught = state.stats.totalCaught || 0;
      btn.textContent = `${cat.name} (${caught}/${catState.threshold})`;
      btn.disabled = true;
    } else {
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        btn.classList.remove('tab-new');
        const a = btn.querySelector('.guide-arrow');
        if (a) a.remove();
        activeUpgradeTab = i;
        renderUpgrades();
      });
    }
    if (isNew && !isLocked) {
      btn.classList.add('pulse-hint');
      addGuideArrow(btn);
    }
    tabsEl.appendChild(btn);
  });
}

function renderUpgrades() {
  renderUpgradeTabs();
  const el = document.getElementById('upgrades-grid');
  el.innerHTML = '';

  const visibleCats = getVisibleCategories();

  if (!visibleCats.length) {
    el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
    return;
  }

  // If active tab is locked, select the first unlocked tab
  let cat = visibleCats[activeUpgradeTab] || visibleCats[0];
  const catState = getCategoryState(cat.name);
  if (!catState.unlocked) {
    const firstUnlocked = visibleCats.findIndex(c => getCategoryState(c.name).unlocked);
    if (firstUnlocked >= 0) {
      activeUpgradeTab = firstUnlocked;
      cat = visibleCats[activeUpgradeTab];
    } else {
      el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
      return;
    }
  }

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

  {
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'upg-maxed-toggle';
    toggleDiv.innerHTML = `
      <label class="toggle-switch">
        <input type="checkbox" ${state.showMaxedUpgrades ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label">SHOW PURCHASED</span>`;
    toggleDiv.querySelector('input').addEventListener('change', (e) => {
      state.showMaxedUpgrades = e.target.checked;
      renderUpgrades();
    });
    el.appendChild(toggleDiv);
  }

  let defs = cat.ids
    .map(id => UPGRADES_DEF.find(u => u.id === id))
    .filter(Boolean);

  // Filter child upgrades: only show if parent is purchased
  defs = defs.filter(def => {
    if (!def.parent) return true;
    return (state.upgrades[def.parent] || 0) >= 1;
  });

  if (!state.showMaxedUpgrades) {
    defs = defs.filter(def => {
      if (state.upgrades[def.id] >= def.max) {
        // Keep maxed parents if they have visible (non-maxed) children in this category
        if (cat.special === 'abilities' && !def.parent) {
          const hasVisibleChild = cat.ids.some(id => {
            const childDef = UPGRADES_DEF.find(u => u.id === id);
            return childDef && childDef.parent === def.id && (state.upgrades[id] || 0) < childDef.max;
          });
          return hasVisibleChild;
        }
        return false;
      }
      return true;
    });
  }

  if (!defs.length) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'upg-empty';
    emptyDiv.textContent = '// ALL UPGRADES PURCHASED';
    el.appendChild(emptyDiv);
    return;
  }

  const catDiv = document.createElement('div');
  catDiv.className = 'upg-category';

  const header = document.createElement('div');
  header.className = 'upg-category-header';
  header.textContent = cat.name;
  catDiv.appendChild(header);

  function makeCard(def) {
    const owned  = state.upgrades[def.id];
    const maxed  = owned >= def.max;
    const cost   = upgradeCost(def.id);
    const canBuy = !maxed && state.gold >= cost;
    const card = document.createElement('div');
    card.className = `upg-card${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}${def.parent ? ' upg-child' : ''}`;
    card.innerHTML = `
      <div class="upg-card-top">
        <div class="upg-name">${def.name}</div>
        <div class="upg-desc">${def.desc}</div>
      </div>
      <div class="upg-card-bottom">
        <div class="upg-level">${owned} / ${def.max}</div>
        ${maxed
          ? `<div class="upg-maxed-label">[ MAX ]</div>`
          : `<button class="upg-btn" data-id="${def.id}" ${canBuy ? '' : 'disabled'}>${fmt(cost)}◈</button>`
        }
      </div>
    `;
    if (!maxed) card.querySelector('.upg-btn').addEventListener('click', () => buyUpgrade(def.id));
    return card;
  }

  // Item 11: ability color coding for child upgrades
  if (cat.special === 'abilities') {
    const parents = defs.filter(d => !d.parent);
    const children = defs.filter(d => d.parent);
    const abilityColors = { bait_bomb: 'ability-red', multi_cast: 'ability-purple' };
    for (const parent of parents) {
      const group = document.createElement('div');
      group.className = `upg-ability-group ${abilityColors[parent.id] || ''}`;
      const groupLabel = document.createElement('div');
      groupLabel.className = 'upg-ability-group-label';
      groupLabel.textContent = parent.name;
      group.appendChild(groupLabel);
      const groupGrid = document.createElement('div');
      groupGrid.className = 'upg-category-grid';
      groupGrid.appendChild(makeCard(parent));
      const kids = children.filter(d => d.parent === parent.id);
      for (const kid of kids) groupGrid.appendChild(makeCard(kid));
      group.appendChild(groupGrid);
      catDiv.appendChild(group);
    }
    const shownParentIds = parents.map(p => p.id);
    const orphans = children.filter(d => !shownParentIds.includes(d.parent));
    if (orphans.length) {
      const grid = document.createElement('div');
      grid.className = 'upg-category-grid';
      for (const def of orphans) grid.appendChild(makeCard(def));
      catDiv.appendChild(grid);
    }
  } else {
    const grid = document.createElement('div');
    grid.className = 'upg-category-grid';
    for (const def of defs) grid.appendChild(makeCard(def));
    catDiv.appendChild(grid);
  }

  el.appendChild(catDiv);
}

// ═══════════════════════════════════════════════════════════════
//  ATLAS RENDERING
// ═══════════════════════════════════════════════════════════════

// Item 10: zone colors, only zones 0-3, item 17: much bigger font
function renderAtlas() {
  const el = document.getElementById('atlas-chart');
  el.innerHTML = '';

  // Net cooldown warning
  if (state.netCooldown > 0) {
    const warning = document.createElement('div');
    warning.className = 'atlas-cooldown-warning';
    warning.textContent = `NET COOLDOWN: ${Math.ceil(state.netCooldown)}s — Cannot travel while cooldown is active.`;
    el.appendChild(warning);
  }

  let lastTier = '';
  for (let i = 0; i < ZONES.length; i++) {
    const zone     = ZONES[i];

    // Tier separator
    if (zone.tier !== lastTier) {
      lastTier = zone.tier;
      const tierDiv = document.createElement('div');
      tierDiv.className = 'atlas-tier-label';
      tierDiv.textContent = `── ${zone.tier} ZONES ──`;
      el.appendChild(tierDiv);
    }

    const unlocked = state.unlockedZones.includes(zone.id);
    const isCur    = state.currentZone === zone.id;
    const canBuy   = !unlocked && zone.unlockCost && state.gold >= zone.unlockCost && zone.implemented;

    const nodeDiv = document.createElement('div');
    nodeDiv.className = `atlas-node ${isCur ? 'current' : unlocked ? 'visited' : 'locked'}`;

    const nameRevealed = (unlocked || isCur) || (zone.unlockCost && state.gold >= zone.unlockCost * 0.8);

    let actionBlock = '';
    if (isCur) {
      actionBlock = `<div class="atlas-here-label">[ YOU ARE HERE ]</div>`;
    } else if (unlocked) {
      actionBlock = `<button class="descend-btn" data-zone="${zone.id}">TRAVEL HERE</button>`;
    } else if (zone.implemented) {
      actionBlock = `
        <div class="atlas-lock-info">Requires <strong>${fmt(zone.unlockCost)}◈</strong> to unlock · you have <strong>${fmt(Math.floor(state.gold))}◈</strong></div>
        <button class="descend-btn" data-zone="${zone.id}" ${canBuy ? '' : 'disabled'}>DESCEND — ${fmt(zone.unlockCost)}◈</button>
      `;
    } else {
      actionBlock = `<div class="atlas-lock-info">[ NOT YET CHARTED ]</div>`;
    }

    // Item 10: per-zone color
    const zoneColor = zone.color || '#00cc88';

    nodeDiv.innerHTML = `
      <div class="atlas-node-left">
        <div class="atlas-dot" style="border-color:${isCur ? zoneColor : ''}; ${isCur ? `background:${zoneColor}` : unlocked ? `background:${zoneColor}55` : ''}"></div>
        ${i < ZONES.length - 1 ? '<div class="atlas-connector-line"></div>' : ''}
      </div>
      <div class="atlas-node-right">
        <div class="atlas-zone-id">${zone.code}</div>
        <div class="atlas-zone-name${nameRevealed && !unlocked && !isCur ? ' atlas-name-preview' : ''}" style="color:${unlocked || isCur ? zoneColor : ''}">${nameRevealed ? zone.name : '???'}</div>
        <div class="atlas-zone-depth">~${zone.depth}m depth</div>
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
//  BOAT RENDERING (item 20: show materials)
// ═══════════════════════════════════════════════════════════════

function renderBoat() {
  const el = document.getElementById('boat-settings');
  el.innerHTML = '';

  const hasRodSpeed = state.upgrades.rod_speed > 0;
  const hasMaterials = Object.values(state.materials).some(v => v > 0);

  if (!hasRodSpeed && !hasMaterials) {
    el.innerHTML = '<div class="boat-empty">// NOTHING INSTALLED YET<br><br>Purchase FASTER ROD from Upgrades<br>to unlock cast speed tuning.</div>';
    return;
  }

  if (hasRodSpeed) {
    const header = document.createElement('div');
    header.className = 'boat-section-header';
    header.textContent = 'ROD CONFIGURATION';
    el.appendChild(header);

    const maxPct = 100 + state.upgrades.rod_speed * 6;
    const minPct = Math.round((150 / (450 * (1 + state.upgrades.rod_speed * 0.06))) * 100);
    const curPct = Math.round(state.boatSettings.rodSpeedFactor * 100);

    const setting = document.createElement('div');
    setting.className = 'boat-setting';
    setting.innerHTML = `
      <div class="boat-setting-label">CAST SPEED</div>
      <div class="boat-setting-desc">Adjust your rod's cast speed. Lower speeds give more control. Max speed scales with FASTER ROD level (currently ${maxPct}%).</div>
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

  // Item 20: Materials display
  if (hasMaterials) {
    const matHeader = document.createElement('div');
    matHeader.className = 'boat-section-header';
    matHeader.textContent = 'MATERIALS';
    matHeader.style.marginTop = '28px';
    el.appendChild(matHeader);

    const matGrid = document.createElement('div');
    matGrid.className = 'materials-grid';
    for (const [matId, mat] of Object.entries(MATERIALS)) {
      const count = state.materials[matId] || 0;
      if (count <= 0) continue;
      const matCard = document.createElement('div');
      matCard.className = 'material-card';
      matCard.innerHTML = `
        <div class="material-name">${mat.name}</div>
        <div class="material-desc">${mat.desc}</div>
        <div class="material-count">×${count}</div>
      `;
      matGrid.appendChild(matCard);
    }
    el.appendChild(matGrid);
  }

}

// ═══════════════════════════════════════════════════════════════
//  CATALOG RENDERING
// ═══════════════════════════════════════════════════════════════

let catalogSort = 'rarity';

function renderCatalog() {
  const el = document.getElementById('catalog-content-inner');
  if (!el) return;
  el.innerHTML = '';

  const controls = document.createElement('div');
  controls.className = 'catalog-controls';
  controls.innerHTML = `
    <button class="catalog-sort-btn${catalogSort === 'rarity' ? ' active' : ''}" data-sort="rarity">SORT: RARITY</button>
    <button class="catalog-sort-btn${catalogSort === 'zone' ? ' active' : ''}" data-sort="zone">SORT: ZONE</button>
  `;
  controls.querySelectorAll('.catalog-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      catalogSort = btn.dataset.sort;
      renderCatalog();
    });
  });
  el.appendChild(controls);

  const allFish = Object.entries(FISH);
  let sorted;
  if (catalogSort === 'zone') {
    sorted = allFish.sort(([,a], [,b]) => a.zone - b.zone || RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
  } else {
    sorted = allFish.sort(([,a], [,b]) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.zone - b.zone);
  }

  const discovered = sorted.filter(([id]) => (state.catalogCaught[id] || 0) > 0).length;
  const summary = document.createElement('div');
  summary.className = 'catalog-summary';
  summary.textContent = `SPECIES DISCOVERED: ${discovered} / ${sorted.length}`;
  el.appendChild(summary);

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';

  for (const [fishId, def] of sorted) {
    const caught = state.catalogCaught[fishId] || 0;
    const known = caught > 0;
    const rc = RARITY_COLORS[def.rarity];
    const zoneName = ZONES[def.zone]?.name || '???';

    const card = document.createElement('div');
    card.className = `catalog-card${known ? '' : ' catalog-unknown'} rarity-${def.rarity.toLowerCase()}`;
    card.innerHTML = known ? `
      <div class="catalog-card-header">
        <span class="catalog-fish-name" style="color:${rc.color}">${def.name}</span>
        <span class="catalog-rarity" style="color:${rc.color}">${def.rarity}</span>
      </div>
      <div class="catalog-card-body">
        <div class="catalog-desc">${def.desc}</div>
        <div class="catalog-meta">
          <span>${zoneName}</span>
          <span>${def.goldValue}◈</span>
          <span>caught: ${caught}</span>
        </div>
      </div>
    ` : `
      <div class="catalog-card-header">
        <span class="catalog-fish-name">???</span>
        <span class="catalog-rarity">${def.rarity}</span>
      </div>
      <div class="catalog-card-body">
        <div class="catalog-desc">[ NOT YET ENCOUNTERED ]</div>
        <div class="catalog-meta"><span>${zoneName}</span></div>
      </div>
    `;
    grid.appendChild(card);
  }

  el.appendChild(grid);
}
