// ═══════════════════════════════════════════════════════════════
//  FISH SPAWNING & MECHANICS
// ═══════════════════════════════════════════════════════════════

function getSpawnPool(zoneId) {
  const zone = ZONES[zoneId];
  const fish = [...zone.fish];
  const weights = [...zone.spawnWeights];

  // Add extra coast fish to zone 0 spawn pool
  if (zoneId === 0) {
    fish.push('coast_clownfish', 'coast_puffer');
    weights.push(25, 18);
  }

  // Bleedthrough from previous 2 zones
  for (let dist = 1; dist <= 2; dist++) {
    const prevId = zoneId - dist;
    if (prevId < 0) continue;
    const prev = ZONES[prevId];
    const distPenalty = dist === 2 ? (BLEED_DISTANCE_PENALTY || 0.35) : 1;
    for (let i = 0; i < prev.fish.length; i++) {
      const fishId = prev.fish[i];
      const bleed = prev.spawnWeights[i] * BLEED_MULTIPLIERS[FISH[fishId].rarity] * distPenalty;
      if (bleed >= 0.3) { fish.push(fishId); weights.push(bleed); }
    }
  }

  // Item 18: luck_boost adjusts weights
  const luckLevel = state.upgrades.luck_boost || 0;
  if (luckLevel > 0) {
    for (let i = 0; i < fish.length; i++) {
      const def = FISH[fish[i]];
      if (def.rarity === 'COMMON') weights[i] *= Math.max(0.4, 1 - luckLevel * 0.04);
      else if (def.rarity === 'UNCOMMON') weights[i] *= Math.max(0.6, 1 - luckLevel * 0.02);
      else if (def.rarity === 'RARE') weights[i] *= (1 + luckLevel * 0.06);
      else if (def.rarity === 'EPIC') weights[i] *= (1 + luckLevel * 0.08);
      else if (def.rarity === 'LEGENDARY') weights[i] *= (1 + luckLevel * 0.10);
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
  const sizeScale  = 0.7 + Math.random() * 0.6;
  const def = FISH[typeId];
  let speedScale = 0.8 + Math.random() * 0.4;
  if (def.rarity === 'LEGENDARY') speedScale *= 3.0;
  else if (def.rarity === 'EPIC') speedScale *= 1.8;
  const golden = Math.random() < 0.01;
  // Fish drift: slight vertical movement as fish crosses screen
  const driftRate = (Math.random() - 0.35) * 12; // slightly biased downward
  cv.fish.push({
    id: cv.fishIdCounter++, type: typeId,
    x: dir === 1 ? -80 : canvasW + 80,
    baseY, currentY: baseY, dir,
    waveOffset: Math.random() * Math.PI * 2,
    caught: false, catchAnim: 0, sizeScale, speedScale,
    golden, driftRate,
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
  // Keep net mode active if player still has nets of this type (#10)
  if ((state.consumables[typeId] || 0) <= 0) {
    state.activeConsumable = null;
  }
  const radius = def.netRadius;
  cv.nets.push({ x: cx, y: cy, radius, timer: 1.4, maxTimer: 1.4 });
  for (const f of cv.fish) {
    if (f.caught) continue;
    const dx = cx - f.x, dy = cy - f.currentY;
    if (Math.sqrt(dx*dx + dy*dy) < radius) { catchFish(f.id, f.type); }
  }

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

  // Multi-cast: fire extra hooks with offset
  if (state.multiCastTimer > 0) {
    const extraRods = 2 + (state.upgrades.multi_rods || 0);
    const offsets = [];
    for (let i = 1; i <= extraRods; i++) {
      const side = (i % 2 === 1) ? 1 : -1;
      const dist = Math.ceil(i / 2) * 100;
      offsets.push(side * dist);
    }
    for (const offset of offsets) {
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

function catchFish(fishId, typeId) {
  const fish = cv.fish.find(f => f.id === fishId);
  if (!fish || fish.caught) return;
  fish.caught = true;

  const def    = FISH[typeId];
  const rar    = def.rarity;
  const rc     = RARITY_COLORS[rar];

  // Golden fish: separate inventory key, no catalog entry, 10x value
  if (fish.golden) {
    const goldenKey = 'golden_' + typeId;
    state.inventory[goldenKey] = (state.inventory[goldenKey] || 0) + 1;
    state.stats.totalCaught++;
    cv.catchFlashes.push({ x: fish.x, y: fish.currentY, timer: 2.4, text: `★ GOLDEN ${def.name}!`, color: '#ffee44' });
    audio.play('catch_rare');
    checkMilestones();
    updateAllGoldDisplays();
    return;
  }

  state.inventory[typeId] = (state.inventory[typeId] || 0) + 1;

  const prevCaught = state.catalogCaught[typeId] || 0;
  state.catalogCaught[typeId] = prevCaught + 1;
  state.stats.totalCaught++;

  // "New Fish!" text on first-ever catch
  const isNew = prevCaught === 0;
  const flashText = isNew ? `✦ NEW FISH! ${def.name} [${rar}]` : `${def.name} [${rar}]`;
  const flashColor = isNew ? '#ffffff' : rc.glow;
  cv.catchFlashes.push({ x: fish.x, y: fish.currentY, timer: isNew ? 2.4 : 1.6, text: flashText, color: flashColor });

  // Item 20: material drop chance (only if boat unlocked)
  if (state.flags.boatUnlocked) {
    for (const [matId, mat] of Object.entries(MATERIALS)) {
      if (mat.source === typeId && Math.random() < mat.dropChance) {
        state.materials[matId] = (state.materials[matId] || 0) + 1;
        cv.catchFlashes.push({
          x: fish.x, y: fish.currentY - 30, timer: 2.5,
          text: `⬡ ${mat.name}`, color: '#ffdd88',
        });
      }
    }
  }

  audio.play(rar === 'COMMON' ? 'catch_common' : 'catch_rare');
  checkMilestones();
  updateAllGoldDisplays();
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

// ─── Zone specials (crab, starfish, sand dollar) ───

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
    state.catalogCaught['shore_crab'] = (state.catalogCaught['shore_crab'] || 0) + 1;
    state.stats.totalCaught++;
    cv.catchFlashes.push({ x: rx, y: ry, timer: 1.6, text: 'SHORE CRAB [RARE]', color: RARITY_COLORS.RARE.glow });
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
  if (state.currentZone === 3) return clickSpecial(cv.reefUrchin, 'reef_urchin', cx, cy);
  if (state.currentZone === 4) return clickSpecial(cv.coralPearl, 'coral_pearl', cx, cy);
  if (state.currentZone === 5) return clickSpecial(cv.sandFossil, 'sand_fossil', cx, cy);
  if (state.currentZone === 6) return clickSpecial(cv.mineGem, 'mine_gem', cx, cy);
  if (state.currentZone === 7) return clickSpecial(cv.looseTooth, 'loose_tooth', cx, cy);
  if (state.currentZone === 8) return clickSpecial(cv.cityRelic, 'city_relic', cx, cy);
  if (state.currentZone === 9) return clickSpecial(cv.wallShard, 'wall_shard', cx, cy);
  return false;
}

function clickSpecial(obj, typeId, cx, cy) {
  if (!obj.active || obj.peekAnim < 0.3) return false;
  const rx = obj.fx * canvasW;
  const ry = obj.fy * canvasH;
  if (Math.sqrt((cx - rx) ** 2 + (cy - ry) ** 2) < 36) {
    const def = FISH[typeId];
    state.inventory[typeId] = (state.inventory[typeId] || 0) + 1;
    state.catalogCaught[typeId] = (state.catalogCaught[typeId] || 0) + 1;
    state.stats.totalCaught++;
    cv.catchFlashes.push({ x: rx, y: ry, timer: 1.6, text: `${def.name} [RARE]`, color: RARITY_COLORS.RARE.glow });
    audio.play('catch_rare');
    obj.active = false;
    obj.spawnTimer = 35 + Math.random() * 45;
    checkMilestones();
    return true;
  }
  return false;
}
