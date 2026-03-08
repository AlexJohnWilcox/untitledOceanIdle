// ═══════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════

function loop(timestamp) {
  const t  = timestamp / 1000;
  if (gamePaused) { currentT = t; requestAnimationFrame(loop); return; }
  const dt = Math.min(t - currentT, 0.25);
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
    f.x += def.speed * (f.speedScale || 1) * f.dir * dt;
    // Fish vertical drift (#8)
    if (f.driftRate) {
      f.baseY += f.driftRate * dt;
      f.baseY = Math.max(canvasH * 0.08, Math.min(canvasH * 0.88, f.baseY));
    }
    f.currentY = def.wave
      ? f.baseY + Math.sin(t * def.wave.freq + f.waveOffset) * def.wave.amp
      : f.baseY;
    f.currentY = Math.max(36, Math.min(canvasH - 44, f.currentY));
    if ((f.dir === 1 && f.x > canvasW + 90) || (f.dir === -1 && f.x < -90)) cv.fish.splice(i, 1);
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
        y: canvasH * 0.065 + Math.random() * canvasH * 0.02,
        dir, speed: 22 + Math.random() * 18,
        size: 0.7 + Math.random() * 0.5,
      });
    }
    for (let i = cv.ships.length - 1; i >= 0; i--) {
      cv.ships[i].x += cv.ships[i].dir * cv.ships[i].speed * dt;
      if (cv.ships[i].x > canvasW + 300 || cv.ships[i].x < -300) cv.ships.splice(i, 1);
    }
  }

  // Placed nets: catch fish that swim through
  for (const pn of cv.placedNets) {
    for (const f of cv.fish) {
      if (f.caught) continue;
      const dx = pn.x - f.x, dy = pn.y - f.currentY;
      if (Math.sqrt(dx * dx + dy * dy) < pn.radius) {
        catchFish(f.id, f.type);
      }
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

  // Auto-hook: casts toward cursor position
  if (state.flags.autoHookEnabled && state.upgrades.auto_hook > 0 && !cv.hook && cv.cooldown <= 0) {
    state.autoHookTimer += dt;
    if (state.autoHookTimer >= getAutoHookInterval()) {
      state.autoHookTimer = 0;
      let tx, ty;
      if (cv.inCanvas && (cv.mouseX !== 0 || cv.mouseY !== 0)) {
        tx = cv.mouseX;
        ty = cv.mouseY;
      } else {
        tx = canvasW / 2 + (Math.random() - 0.5) * canvasW * 0.4;
        ty = canvasH * 0.15 + Math.random() * canvasH * 0.3;
      }
      castHook(tx, ty);
      if (cv.hook) cv.hook.isAutoHook = true;
    }
    updateAutoHookUI();
  } else if (!state.flags.autoHookEnabled) {
    state.autoHookTimer = 0;
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
      const retractMult = h.quickRetract ? (1 + (Math.max(0, state.upgrades.instant_retract - 1) * 0.18)) : 1;
      const step = Math.max(SPEED, 600) * retractMult * dt;
      if (step >= dist) {
        const wasAutoHook = cv.hook.isAutoHook;
        cv.hook = null;
        cv.cooldown = wasAutoHook ? getAutoHookRecastCooldown() : getRecastCooldown();
      }
      else { h.x += (dx / dist) * step; h.y += (dy / dist) * step; }
      checkHookCollision(h.x, h.y);
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

  cv.ambientTimer -= dt;
  if (cv.ambientTimer <= 0 && zone.ambientMessages.length) {
    cv.ambientTimer = 36 + Math.random() * 52;
  }

  if (state.currentZone === 0) updateCrab(dt);
  if (state.currentZone === 1) updateZoneSpecial(cv.starfish, dt);
  if (state.currentZone === 2) updateZoneSpecial(cv.sandDollar, dt);
  if (state.currentZone === 3) updateZoneSpecial(cv.reefUrchin, dt);
  if (state.currentZone === 4) updateZoneSpecial(cv.coralPearl, dt);
  if (state.currentZone === 5) updateZoneSpecial(cv.sandFossil, dt);
  if (state.currentZone === 6) updateZoneSpecial(cv.mineGem, dt);
  if (state.currentZone === 7) updateZoneSpecial(cv.looseTooth, dt);
  if (state.currentZone === 8) updateZoneSpecial(cv.cityRelic, dt);
  if (state.currentZone === 9) updateZoneSpecial(cv.wallShard, dt);

  // Net placement cooldown timer
  if (state.netZoneCooldown > 0) {
    state.netZoneCooldown = Math.max(0, state.netZoneCooldown - dt);
  }
  if (state.netCooldown > 0) {
    state.netCooldown = Math.max(0, state.netCooldown - dt);
    updatePlaceNetBtn();
  }

  checkMilestones();
}

// ═══════════════════════════════════════════════════════════════
//  EVENT WIRING
// ═══════════════════════════════════════════════════════════════

document.getElementById('btn-shop').addEventListener('click',     () => switchScreen('screen-shop'));
document.getElementById('btn-upgrades').addEventListener('click', () => switchScreen('screen-upgrades'));
document.getElementById('btn-atlas').addEventListener('click',    () => switchScreen('screen-atlas'));
document.getElementById('btn-boat').addEventListener('click',     () => switchScreen('screen-boat'));
document.getElementById('btn-catalog').addEventListener('click', () => switchScreen('screen-catalog'));

document.getElementById('btn-back-shop').addEventListener('click',     () => { const b = document.getElementById('btn-back-shop'); b.classList.remove('pulse-hint'); const a = b.querySelector('.guide-arrow'); if (a) a.remove(); switchScreen('screen-fishing'); });
document.getElementById('btn-back-upgrades').addEventListener('click', () => { document.getElementById('btn-back-upgrades').classList.remove('pulse-hint'); switchScreen('screen-fishing'); });
document.getElementById('btn-back-atlas').addEventListener('click',    () => switchScreen('screen-fishing'));
document.getElementById('btn-back-boat').addEventListener('click',     () => switchScreen('screen-fishing'));
document.getElementById('btn-back-catalog').addEventListener('click', () => switchScreen('screen-fishing'));

document.getElementById('btn-bait').addEventListener('click', () => { document.getElementById('btn-bait').classList.remove('pulse-new'); useBait(); });
document.getElementById('btn-multicast').addEventListener('click', () => { document.getElementById('btn-multicast').classList.remove('pulse-new'); useMultiCast(); });
document.getElementById('btn-place-net').addEventListener('click', () => {
  const btn = document.getElementById('btn-place-net');
  if (state.netCooldown > 0) return;
  if (cv.placedNets.length >= getMaxNets()) return;
  if (state.activeConsumable === 'place_net') {
    state.activeConsumable = null;
    btn.classList.remove('active');
  } else {
    state.activeConsumable = 'place_net';
    btn.classList.add('active');
  }
});

document.getElementById('btn-sell-all').addEventListener('click', sellAll);

// Auto-hook toggle in nav bar
document.getElementById('auto-hook-checkbox').addEventListener('change', (e) => {
  state.flags.autoHookEnabled = e.target.checked;
  state.autoHookTimer = 0;
  updateAutoHookUI();
});

function updateAutoHookUI() {
  const cb = document.getElementById('auto-hook-checkbox');
  const label = document.getElementById('auto-hook-label');
  const bar = document.getElementById('auto-hook-bar');
  const timerEl = document.getElementById('auto-hook-timer');
  if (state.upgrades.auto_hook > 0) {
    bar.style.display = 'flex';
  }
  cb.checked = state.flags.autoHookEnabled;
  label.textContent = state.flags.autoHookEnabled ? `AUTO ${Math.ceil(getAutoHookInterval())}s` : 'AUTO';
  label.classList.toggle('active', state.flags.autoHookEnabled);
  if (timerEl) {
    if (state.flags.autoHookEnabled && state.upgrades.auto_hook > 0 && !cv.hook && cv.cooldown <= 0) {
      const interval = getAutoHookInterval();
      const remaining = Math.ceil(interval - state.autoHookTimer);
      timerEl.textContent = `${remaining}s`;
      timerEl.style.display = 'block';
    } else {
      timerEl.style.display = 'none';
    }
  }
}

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
  if (e.key === 'Escape') {
    if (!document.getElementById('screen-fishing').classList.contains('active')) {
      document.getElementById('save-modal').style.display = 'none';
      document.getElementById('load-modal').style.display = 'none';
      switchScreen('screen-fishing');
    }
    return;
  }
  if (e.key.length === 1) {
    _devBuffer = (_devBuffer + e.key.toLowerCase()).slice(-7);
    if (_devBuffer.endsWith('lol')) {
      state.gold += 5000;
      updateAllGoldDisplays();
      checkMilestones();
      _devBuffer = '';
    }
    if (_devBuffer === 'ajmemes') {
      // Force spawn a golden fish
      const pool = getSpawnPool(state.currentZone);
      const weights = pool.weights;
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total, typeId = pool.fish[0];
      for (let i = 0; i < pool.fish.length; i++) { r -= weights[i]; if (r <= 0) { typeId = pool.fish[i]; break; } }
      const dir = Math.random() < 0.5 ? 1 : -1;
      const baseY = canvasH * 0.1 + Math.random() * canvasH * 0.76;
      const sizeScale = 0.7 + Math.random() * 0.6;
      cv.fish.push({
        id: cv.fishIdCounter++, type: typeId,
        x: dir === 1 ? -80 : canvasW + 80,
        baseY, currentY: baseY, dir,
        waveOffset: Math.random() * Math.PI * 2,
        caught: false, catchAnim: 0, sizeScale, speedScale: 0.8 + Math.random() * 0.4,
        golden: true,
      });
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

  // Clicking while auto-hook is on disables it
  if (state.flags.autoHookEnabled) {
    state.flags.autoHookEnabled = false;
    state.autoHookTimer = 0;
    updateAutoHookUI();
  }

  if (clickZoneSpecial(cx, cy)) return;
  const ac = state.activeConsumable;
  if (ac === 'place_net') { placeNet(cx, cy); return; }
  if (ac === 'small_net' || ac === 'big_net') { throwNet(cx, cy, ac); return; }
  castHook(cx, cy);
});
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvasW / rect.width);
  const cy = (e.clientY - rect.top)  * (canvasH / rect.height);

  // Right-click on placed net to remove it and start 2 min cooldown
  for (let i = cv.placedNets.length - 1; i >= 0; i--) {
    const pn = cv.placedNets[i];
    const dx = cx - pn.x, dy = cy - pn.y;
    if (Math.sqrt(dx * dx + dy * dy) < pn.radius) {
      cv.placedNets.splice(i, 1);
      state.netCooldown = 120;
      updatePlaceNetBtn();
      return;
    }
  }

  // Right-click retract hook
  if (state.upgrades.instant_retract >= 1 && cv.hook && cv.hook.state !== 'retracting') {
    cv.hook.quickRetract = true;
    cv.hook.state = 'retracting';
  }
});

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  TITLE SCREEN
// ═══════════════════════════════════════════════════════════════

function initTitleScreen() {
  const tc = document.getElementById('title-canvas');
  const tctx = tc.getContext('2d');
  let tW, tH;

  function resizeTitle() {
    tW = window.innerWidth;
    tH = window.innerHeight;
    tc.width = tW;
    tc.height = tH;
  }
  resizeTitle();
  window.addEventListener('resize', resizeTitle);

  const bubbles = [];
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: Math.random() * tW,
      y: Math.random() * tH,
      r: 1 + Math.random() * 4,
      speed: 10 + Math.random() * 25,
      opacity: 0.04 + Math.random() * 0.12,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.8 + Math.random() * 2,
    });
  }

  let titleT = 0;
  function drawTitle(ts) {
    const t = ts / 1000;
    const dt = Math.min(t - titleT, 0.1);
    titleT = t;

    // Background gradient
    const bg = tctx.createLinearGradient(0, 0, 0, tH);
    bg.addColorStop(0, '#001108');
    bg.addColorStop(0.4, '#001a0a');
    bg.addColorStop(0.7, '#00120a');
    bg.addColorStop(1, '#000805');
    tctx.fillStyle = bg;
    tctx.fillRect(0, 0, tW, tH);

    // Subtle grid
    tctx.strokeStyle = 'rgba(0,60,30,0.08)';
    tctx.lineWidth = 0.5;
    for (let x = 50; x < tW; x += 50) {
      tctx.beginPath(); tctx.moveTo(x, 0); tctx.lineTo(x, tH); tctx.stroke();
    }
    for (let y = 50; y < tH; y += 50) {
      tctx.beginPath(); tctx.moveTo(0, y); tctx.lineTo(tW, y); tctx.stroke();
    }

    // Light rays from top
    tctx.save();
    for (let i = 0; i < 4; i++) {
      const rx = tW * (0.15 + i * 0.22 + Math.sin(t * 0.15 + i * 1.6) * 0.04);
      const w = tW * 0.06;
      const rayGrad = tctx.createLinearGradient(rx, 0, rx, tH * 0.7);
      rayGrad.addColorStop(0, 'rgba(0,255,136,0.06)');
      rayGrad.addColorStop(1, 'rgba(0,255,136,0)');
      tctx.fillStyle = rayGrad;
      tctx.beginPath();
      tctx.moveTo(rx - w * 0.3, 0);
      tctx.lineTo(rx + w, tH * 0.7);
      tctx.lineTo(rx - w, tH * 0.7);
      tctx.closePath();
      tctx.fill();
    }
    tctx.restore();

    // Bubbles
    for (const b of bubbles) {
      b.y -= b.speed * dt;
      b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.4;
      if (b.y < -10) { b.y = tH + 10; b.x = Math.random() * tW; }
      tctx.beginPath();
      tctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      tctx.strokeStyle = `rgba(0,255,136,${b.opacity})`;
      tctx.lineWidth = 0.5;
      tctx.stroke();
    }

    // Floating particles
    tctx.save();
    for (let i = 0; i < 15; i++) {
      const px = (tW * ((i * 0.618 + 0.05) % 1.0));
      const py = ((t * 12 * (0.3 + (i % 4) * 0.15) + i * tH / 15) % tH);
      const alpha = 0.05 + Math.abs(Math.sin(t * 0.5 + i)) * 0.1;
      tctx.fillStyle = `rgba(0,255,136,${alpha})`;
      tctx.beginPath();
      tctx.arc(px, py, 1.5, 0, Math.PI * 2);
      tctx.fill();
    }
    tctx.restore();

    if (document.getElementById('screen-title').style.display !== 'none') {
      requestAnimationFrame(drawTitle);
    }
  }

  requestAnimationFrame(drawTitle);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

let gamePaused = false;

function init() {
  resizeCanvas();
  window.addEventListener('resize', () => setTimeout(resizeCanvas, 40));
  updateZoneOverlay();

  checkMilestones();
  updateAllGoldDisplays();

  currentT = performance.now() / 1000;

  // Auto-save every minute
  startAutoSave();

  // Pause when window is not maximized/focused
  function checkPause() {
    const isMax = document.visibilityState === 'visible' &&
      window.innerWidth >= screen.availWidth * 0.8 &&
      window.innerHeight >= screen.availHeight * 0.8;
    const pauseEl = document.getElementById('pause-overlay');
    if (!isMax && !gamePaused) {
      gamePaused = true;
      pauseEl.style.display = 'flex';
    } else if (isMax && gamePaused) {
      gamePaused = false;
      pauseEl.style.display = 'none';
      currentT = performance.now() / 1000;
    }
  }
  window.addEventListener('resize', checkPause);
  document.addEventListener('visibilitychange', checkPause);
  setInterval(checkPause, 1000);
}

initTitleScreen();

document.getElementById('btn-title-import').addEventListener('click', () => {
  document.getElementById('load-modal').style.display = 'flex';
});

// Try loading local auto-save on start
loadLocalSave();

document.getElementById('btn-enter').addEventListener('click', () => {
  const titleScreen = document.getElementById('screen-title');
  titleScreen.classList.add('title-fade-out');
  setTimeout(() => {
    titleScreen.style.display = 'none';
    document.getElementById('screen-fishing').classList.add('active');
    init();
    requestAnimationFrame(loop);
    spawnFish(); spawnFish(); spawnFish();
    setTimeout(flashZoneOverlay, 400);
  }, 800);
});
