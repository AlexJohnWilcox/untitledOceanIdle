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
  reefUrchin: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 45 },
  coralPearl: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  sandFossil: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  mineGem: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  looseTooth: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  cityRelic: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  wallShard: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  screenShake: { x: 0, y: 0 },
  nets: [],
  placedNets: [],
  ships: [], shipTimer: 15,
};

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  canvasW = wrap.clientWidth  || 800;
  canvasH = wrap.clientHeight || 500;
  canvas.width  = canvasW;
  canvas.height = canvasH;
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS DRAWING
// ═══════════════════════════════════════════════════════════════

function draw() {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const skyH = canvasH * 0.08;
  if (state.currentZone === 0) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH);
    skyGrad.addColorStop(0, '#001122'); skyGrad.addColorStop(1, '#003333');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvasW, skyH);
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
    if (cv.reefUrchin && cv.reefUrchin.active) drawClickReefUrchin(cv.reefUrchin);
  } else if (state.currentZone === 4) {
    drawCoralSprawlBackground();
    if (cv.coralPearl && cv.coralPearl.active) drawClickCoralPearl(cv.coralPearl);
  } else if (state.currentZone === 5) {
    drawSandDunesBackground();
    if (cv.sandFossil && cv.sandFossil.active) drawClickSandFossil(cv.sandFossil);
  } else if (state.currentZone === 6) {
    drawOldMineBackground();
    if (cv.mineGem && cv.mineGem.active) drawClickMineGem(cv.mineGem);
  } else if (state.currentZone === 7) {
    drawSharkDenBackground();
    if (cv.looseTooth && cv.looseTooth.active) drawClickLooseTooth(cv.looseTooth);
  } else if (state.currentZone === 8) {
    drawAbandonedCityBackground();
    if (cv.cityRelic && cv.cityRelic.active) drawClickCityRelic(cv.cityRelic);
  } else if (state.currentZone === 9) {
    drawSeawallBackground();
    if (cv.wallShard && cv.wallShard.active) drawClickWallShard(cv.wallShard);
  }

  if (cv.screenShake.x !== 0 || cv.screenShake.y !== 0) {
    ctx.save();
    ctx.translate(cv.screenShake.x, cv.screenShake.y);
  }

  for (const b of cv.bubbles) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,255,136,${b.opacity})`; ctx.lineWidth = 0.5; ctx.stroke();
  }

  for (const pn of cv.placedNets) drawPlacedNet(pn);
  if (cv.inCanvas && !cv.hook && cv.cooldown <= 0) drawReticle(cv.mouseX, cv.mouseY);
  for (const f of cv.fish) drawFish(f);
  if (cv.hook) drawHook(cv.hook);
  if (cv.extraHooks) for (const eh of cv.extraHooks) drawHook(eh);
  for (const net of cv.nets) drawNet(net);

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
    const bw = 160, bx = canvasW / 2 - bw / 2, by = canvasH - 52;
    ctx.fillStyle = '#001a08'; ctx.fillRect(bx, by, bw, 7);
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#00ff88'; ctx.fillRect(bx, by, bw * (1 - frac), 7);
    ctx.shadowBlur = 0;
    ctx.font = '10px "Space Mono"'; ctx.fillStyle = '#005530'; ctx.textAlign = 'center';
    ctx.fillText('RELOADING...', canvasW / 2, by - 6);
  }

  // Item 13: show multi-cast remaining time
  if (state.multiCastTimer > 0) {
    ctx.save();
    ctx.font = 'bold 12px "Space Mono"';
    ctx.fillStyle = '#bb77ff'; ctx.shadowColor = '#bb77ff'; ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(`MULTI-CAST: ${Math.ceil(state.multiCastTimer)}s`, canvasW / 2, 28);
    ctx.restore();
  }

}

// ═══════════════════════════════════════════════════════════════
//  FISH DRAWING
// ═══════════════════════════════════════════════════════════════

function drawFish(f) {
  // Golden fish: draw pulsing outer aura before the fish itself
  if (f.golden) {
    ctx.save();
    const pulse = 0.6 + Math.sin(currentT * 4 + f.waveOffset) * 0.4;
    ctx.globalAlpha = 0.25 * pulse;
    ctx.fillStyle = '#ffee44';
    ctx.shadowColor = '#ffee44';
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(f.x, f.currentY, (FISH[f.type].size || 20) * (f.sizeScale || 1) * 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Star sparkles around golden fish
    ctx.globalAlpha = 0.7 * pulse;
    ctx.font = 'bold 10px "Space Mono"';
    ctx.fillStyle = '#ffee88';
    ctx.shadowBlur = 12;
    for (let i = 0; i < 3; i++) {
      const angle = currentT * 2.5 + i * (Math.PI * 2 / 3) + f.waveOffset;
      const dist = (FISH[f.type].size || 20) * (f.sizeScale || 1) * 1.6;
      const sx = f.x + Math.cos(angle) * dist;
      const sy = f.currentY + Math.sin(angle) * dist * 0.6;
      ctx.fillText('*', sx - 3, sy + 4);
    }
    ctx.restore();
  }

  const shape = FISH[f.type].shape || 'fish';
  if (shape === 'eel')    return drawEel(f);
  if (shape === 'shark')  return drawShark(f);
  if (shape === 'blob')   return drawBlob(f);
  if (shape === 'flat')   return drawFlat(f);
  if (shape === 'slim')   return drawSlim(f);
  if (shape === 'jaw')    return drawJaw(f);
  if (shape === 'clown')  return drawClown(f);
  if (shape === 'puffer') return drawPuffer(f);
  if (shape === 'crab')      return drawCrabFish(f);
  if (shape === 'jellyfish') return drawJellyfish(f);
  if (shape === 'angler')    return drawAngler(f);
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
  return { alpha, sc, golden: f.golden };
}

function goldenRC(f, rc) {
  // Golden fish keep their original colors - only the aura circle marks them
  return rc;
}

function drawDefaultFish(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
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
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
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
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
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
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
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
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 16; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.4, sz * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.3, 0);
  ctx.lineTo(-sz * 2.2, -sz * 0.65); ctx.lineTo(-sz * 1.6, 0);
  ctx.lineTo(-sz * 2.2,  sz * 0.65); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.2, -sz * 0.38);
  ctx.lineTo(sz * 0.4, -sz * 1.2);
  ctx.lineTo(sz * 0.8, -sz * 0.38);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, sz * 0.2);
  ctx.lineTo(-sz * 0.4, sz * 0.85);
  ctx.lineTo(sz * 0.5, sz * 0.3);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBlob(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 18; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = rc.glow;
  ctx.beginPath(); ctx.arc(-sz * 0.3, -sz * 0.2, sz * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.9, 0); ctx.lineTo(-sz * 1.5, -sz * 0.5); ctx.lineTo(-sz * 1.5, sz * 0.5);
  ctx.closePath(); ctx.fill();
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
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.3, sz * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.2, 0); ctx.lineTo(-sz * 2.0, -sz * 0.6); ctx.lineTo(-sz * 2.0, sz * 0.6);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.65;
  ctx.beginPath(); ctx.ellipse(0, sz * 0.55, sz * 0.9, sz * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -sz * 0.55, sz * 0.9, sz * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.7, -sz * 0.05, sz * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Clown fish shape ──
function drawClown(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12;
  // body - orange with white stripes (golden override)
  ctx.fillStyle = f.golden ? '#ffcc44' : '#ff8833';
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  // white stripes
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = alpha * 0.7;
  ctx.fillRect(-sz * 0.1, -sz * 0.5, sz * 0.15, sz);
  ctx.fillRect(sz * 0.4, -sz * 0.45, sz * 0.12, sz * 0.9);
  ctx.globalAlpha = alpha;
  // tail
  ctx.fillStyle = f.golden ? '#ddaa22' : '#ff6622';
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.5, -sz * 0.5); ctx.lineTo(-sz * 1.5, sz * 0.5);
  ctx.closePath(); ctx.fill();
  // eye
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Puffer fish shape ──
function drawPuffer(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14;
  // round puffy body
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
  // spines
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * sz * 0.9, Math.sin(a) * sz * 0.9);
    ctx.lineTo(Math.cos(a) * sz * 1.35, Math.sin(a) * sz * 1.35);
    ctx.stroke();
  }
  // belly highlight
  ctx.globalAlpha = alpha * 0.3; ctx.fillStyle = '#ffffcc';
  ctx.beginPath(); ctx.ellipse(0, sz * 0.3, sz * 0.6, sz * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  // small tail
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.4, -sz * 0.35); ctx.lineTo(-sz * 1.4, sz * 0.35);
  ctx.closePath(); ctx.fill();
  // eye
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.4, -sz * 0.2, sz * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.4, -sz * 0.2, sz * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Swimming crab shape (for blister_crab) ──
function drawCrabFish(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12;
  // body
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = rc.color; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = -sz * 0.4 + i * sz * 0.4;
    ctx.beginPath(); ctx.moveTo(lx, sz * 0.4); ctx.lineTo(lx - 4, sz * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, -sz * 0.4); ctx.lineTo(lx - 4, -sz * 0.9); ctx.stroke();
  }
  // claws
  ctx.beginPath(); ctx.ellipse(sz * 0.9, -sz * 0.4, sz * 0.3, sz * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sz * 0.9, sz * 0.4, sz * 0.3, sz * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  // eyes
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.3, -sz * 0.25, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.3, sz * 0.25, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.3, -sz * 0.25, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.3, sz * 0.25, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  HOOK / RETICLE / NET DRAWING
// ═══════════════════════════════════════════════════════════════

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

  if (ac === 'place_net') {
    const r = getNetRadius();
    ctx.strokeStyle = 'rgba(68,255,170,0.4)'; ctx.lineWidth = 1.2;
    ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 10;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 0.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath(); ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(a) * r, my + Math.sin(a) * r); ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (netDef) {
    ctx.strokeStyle = 'rgba(68,255,170,0.5)'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 12;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(mx, my, netDef.netRadius, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    return;
  }

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

function drawNet(net) {
  const progress = 1 - net.timer / net.maxTimer;
  const r = net.radius * (0.25 + progress * 0.75);
  const alpha = (net.timer / net.maxTimer) * 0.8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#44ffaa'; ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 16;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(net.x, net.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.shadowBlur = 6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
    ctx.beginPath();
    ctx.moveTo(net.x, net.y);
    ctx.lineTo(net.x + Math.cos(a) * r, net.y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(net.x, net.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawPlacedNet(pn) {
  const r = pn.radius;
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#44ffaa'; ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 10;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r, 0, Math.PI * 2); ctx.stroke();
  // net mesh
  ctx.lineWidth = 0.6; ctx.shadowBlur = 4;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(pn.x, pn.y);
    ctx.lineTo(pn.x + Math.cos(a) * r, pn.y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r * 0.75, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DRAWING
// ═══════════════════════════════════════════════════════════════

function drawCoastBackground() {
  const sandY = canvasH * COAST_SAND_LEVEL;
  const t = currentT;

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

  ctx.save();
  const sandGrad = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sandGrad.addColorStop(0, '#141f0d'); sandGrad.addColorStop(1, '#080f06');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  drawCoral(canvasW * 0.07, sandY, 0.85, '#ff5533', '#ff8855');
  drawCoral(canvasW * 0.22, sandY, 0.60, '#ff3377', '#ff77aa');
  drawCoral(canvasW * 0.63, sandY, 0.90, '#ff5533', '#ffaa55');
  drawCoral(canvasW * 0.88, sandY, 0.70, '#33cc77', '#55ffaa');

  drawSeaweed(canvasW * 0.38, sandY, 55, '#00aa44');
  drawSeaweed(canvasW * 0.41, sandY, 40, '#008833');
  drawSeaweed(canvasW * 0.94, sandY, 62, '#00bb55');

  for (const rock of COAST_ROCKS) {
    drawRock(rock.fx * canvasW, canvasH * rock.fy);
  }

  drawStarfish(canvasW * 0.32, sandY + 12, 8, '#ff8844');
  drawStarfish(canvasW * 0.47, sandY + 8,  6, '#ff6622');
  drawStarfish(canvasW * 0.70, sandY + 14, 9, '#ff9933');
  drawStarfish(canvasW * 0.90, sandY + 10, 7, '#ffbb44');

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

  ctx.strokeStyle = '#1144aa'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = -6 + i * 6;
    ctx.beginPath(); ctx.moveTo(lx - 12, 4); ctx.lineTo(lx - 21, 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-lx + 12, 4); ctx.lineTo(-lx + 21, 14); ctx.stroke();
  }

  ctx.fillStyle = '#1155cc'; ctx.shadowColor = '#4499ff'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(-22, -4, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22, -4, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 0; ctx.strokeStyle = '#1155cc'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-5, -17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(5, -17); ctx.stroke();

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
  // Item 16: platform rock
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = '#0c1a0c';
  ctx.beginPath(); ctx.ellipse(x, y + 16, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
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
  // Item 16: platform rock
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = '#131508';
  ctx.beginPath(); ctx.ellipse(x, y + 14, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
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
  ctx.beginPath();
  ctx.moveTo(-55, 0); ctx.lineTo(-48, 12); ctx.lineTo(55, 12); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(-18, -18, 38, 18);
  ctx.fillStyle = 'rgba(0,20,10,0.95)';
  ctx.fillRect(-1, -46, 3, 28);
  ctx.fillStyle = 'rgba(0,15,8,0.85)';
  ctx.fillRect(-8, -30, 18, 12);
  ctx.restore();
}

// ─── Zone 1: The Shallows ───────────────────────────────────────
function drawShallowsBackground() {
  const sandY = canvasH * 0.87;
  const t = currentT;

  ctx.save();
  const sg = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sg.addColorStop(0, '#16200e'); sg.addColorStop(1, '#0a1208');
  ctx.fillStyle = sg; ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

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

  drawSeaweed(canvasW * 0.12, sandY, 45, '#007733');
  drawSeaweed(canvasW * 0.15, sandY, 32, '#006622');
  drawSeaweed(canvasW * 0.55, sandY, 50, '#008844');
  drawSeaweed(canvasW * 0.72, sandY, 38, '#007733');
  drawSeaweed(canvasW * 0.75, sandY, 26, '#005522');

  ctx.save();
  ctx.fillStyle = '#0c1a0c'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.ellipse(canvasW * 0.28, sandY + 8, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.68, sandY + 6, 14, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.88, sandY + 10, 22, 11, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  for (const ax of [0.3, 0.7, 0.9]) {
    drawAnemone(canvasW * ax, sandY, '#88ffcc');
  }

  // Item 16: floating particles (non-catchable decor)
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((currentT * 12 * (0.4 + (i % 3) * 0.2) + i * canvasH / 8) % (canvasH * 0.8));
    const alpha = 0.08 + Math.abs(Math.sin(currentT * 0.6 + i)) * 0.15;
    ctx.fillStyle = `rgba(100,255,200,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
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

  ctx.save();
  ctx.fillStyle = '#131508';
  for (let i = 0; i < 4; i++) {
    const dx = canvasW * (0.1 + i * 0.25);
    ctx.beginPath();
    ctx.ellipse(dx, sandY + 2, canvasW * 0.12, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const cx of [0.08, 0.35, 0.62, 0.91]) {
    drawCrystal(canvasW * cx, sandY);
  }

  ctx.save();
  ctx.fillStyle = 'rgba(0,80,30,0.25)'; ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 12;
  for (let i = 0; i < 6; i++) {
    const bx = canvasW * (0.05 + i * 0.18);
    ctx.beginPath();
    ctx.ellipse(bx, sandY + 28, 20 + Math.sin(i * 2.3) * 8, 14, Math.sin(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Item 16: floating sand particles
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const px = (canvasW * ((i * 0.37 + 0.12) % 1.0));
    const py = ((currentT * 8 * (0.3 + (i % 4) * 0.15) + i * canvasH / 12) % (canvasH * 0.75));
    const alpha = 0.06 + Math.abs(Math.sin(currentT * 0.5 + i * 1.3)) * 0.12;
    ctx.fillStyle = `rgba(180,160,80,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
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

// ─── Zone 3: The Reef ──────────────────────────────────────────
function drawReefBackground() {
  const t = currentT;
  const baseY = canvasH * 0.84;

  // Sea floor
  const floorGrad = ctx.createLinearGradient(0, baseY - 10, 0, canvasH);
  floorGrad.addColorStop(0, '#0a160a'); floorGrad.addColorStop(1, '#040a04');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, baseY - 10, canvasW, canvasH - baseY + 10);

  // Reef formations growing from floor
  ctx.save();
  ctx.fillStyle = '#080c08';
  for (let i = 0; i < 7; i++) {
    const rx = canvasW * (0.05 + i * 0.14);
    const rh = 30 + Math.sin(i * 1.7) * 18;
    ctx.beginPath();
    ctx.moveTo(rx - 22, canvasH);
    ctx.lineTo(rx - 22, baseY + 10);
    ctx.lineTo(rx - 10, baseY - rh);
    ctx.lineTo(rx, baseY - rh - 12);
    ctx.lineTo(rx + 10, baseY - rh + 4);
    ctx.lineTo(rx + 22, baseY + 10);
    ctx.lineTo(rx + 22, canvasH);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Glowing particles
  ctx.save();
  const particleCount = 22;
  for (let i = 0; i < particleCount; i++) {
    const px = (canvasW * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 18 * (0.5 + (i % 3) * 0.3) + i * (canvasH / particleCount)) % (canvasH * 0.78));
    const alpha = 0.15 + Math.abs(Math.sin(t * 0.8 + i)) * 0.35;
    const r = 1 + (i % 3) * 0.8;
    ctx.fillStyle = `rgba(0,255,136,${alpha})`;
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Branching coral structures
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

// ─── Zone 4: The Coral Sprawl ────────────────────────────────────
function drawCoralSprawlBackground() {
  const t = currentT;
  const baseY = canvasH * 0.82;

  // Deep coral gradient
  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a0808'); bg2.addColorStop(0.5, '#0d0404'); bg2.addColorStop(1, '#060202');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid
  ctx.strokeStyle = '#220808'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Coral floor
  ctx.save();
  const sg = ctx.createLinearGradient(0, baseY, 0, canvasH);
  sg.addColorStop(0, '#1a0d08'); sg.addColorStop(1, '#0a0504');
  ctx.fillStyle = sg; ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  ctx.restore();

  // Large coral formations
  for (const cx of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    drawCoral(canvasW * cx, baseY, 0.9 + Math.sin(cx * 5) * 0.3, '#ff4422', '#ff8844');
  }
  for (const cx of [0.2, 0.6, 0.85]) {
    drawCoral(canvasW * cx, baseY, 0.7, '#ff2266', '#ff66aa');
  }

  // Bioluminescent particles
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((t * 10 * (0.3 + (i % 4) * 0.15) + i * canvasH / 18) % (canvasH * 0.78));
    const alpha = 0.1 + Math.abs(Math.sin(t * 0.7 + i * 1.1)) * 0.25;
    const colors = ['rgba(255,100,68,', 'rgba(255,50,100,', 'rgba(255,150,80,'];
    ctx.fillStyle = colors[i % 3] + alpha + ')';
    ctx.shadowColor = '#ff6644'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Anemones
  for (const ax of [0.15, 0.45, 0.75]) {
    drawAnemone(canvasW * ax, baseY, '#ff8866');
  }
}

// ─── Zone 5: The Sand Dunes ─────────────────────────────────────
function drawSandDunesBackground() {
  const t = currentT;
  const baseY = canvasH * 0.78;

  // Deeper, more dramatic gradient
  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a1205'); bg2.addColorStop(0.3, '#0d0802'); bg2.addColorStop(0.7, '#080501'); bg2.addColorStop(1, '#040300');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#1a1408'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Background dune layer (distant, subtle)
  ctx.save();
  ctx.fillStyle = '#0e0c04';
  ctx.beginPath(); ctx.moveTo(0, canvasH);
  for (let x = 0; x <= canvasW; x += 4) {
    const dy = Math.sin(x * 0.005 + 0.8) * 40 + Math.sin(x * 0.012 + 2.5) * 20;
    ctx.lineTo(x, baseY - 30 + dy);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Foreground dune layer - rolling hills with slow drift
  ctx.save();
  const sg = ctx.createLinearGradient(0, baseY - 40, 0, canvasH);
  sg.addColorStop(0, '#221a08'); sg.addColorStop(0.3, '#1a1508'); sg.addColorStop(1, '#0a0b04');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(0, canvasH);
  for (let x = 0; x <= canvasW; x += 4) {
    const dy = Math.sin(x * 0.008 + t * 0.08) * 30 + Math.sin(x * 0.02 + 1.5) * 15 + Math.sin(x * 0.035 + 3.0) * 8;
    ctx.lineTo(x, baseY + dy);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Sand streams - horizontal particle currents
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 4; i++) {
    const sy = canvasH * (0.25 + i * 0.15);
    const streamGrad = ctx.createLinearGradient(0, sy, canvasW, sy);
    streamGrad.addColorStop(0, 'transparent');
    streamGrad.addColorStop(0.3, 'rgba(200,170,60,0.08)');
    streamGrad.addColorStop(0.7, 'rgba(200,170,60,0.12)');
    streamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = streamGrad;
    ctx.fillRect(0, sy - 3 + Math.sin(t * 0.3 + i) * 5, canvasW, 6);
  }
  ctx.restore();

  // Sand particles drifting (more particles, more dramatic)
  ctx.save();
  for (let i = 0; i < 35; i++) {
    const px = ((t * (12 + i % 5 * 3) + i * canvasW / 35 + Math.sin(i * 2.1) * 40) % (canvasW + 40)) - 20;
    const py = canvasH * 0.15 + (i * canvasH * 0.65 / 35) + Math.sin(t * 0.5 + i) * 12;
    const alpha = 0.05 + Math.abs(Math.sin(t * 0.4 + i * 1.5)) * 0.12;
    ctx.fillStyle = `rgba(220,180,60,${alpha})`;
    ctx.shadowColor = '#ccaa44'; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Crystals poking out of dunes
  for (const cx of [0.08, 0.25, 0.42, 0.58, 0.75, 0.92]) {
    drawCrystal(canvasW * cx, baseY + Math.sin(cx * 8) * 15);
  }

  // Glowing heat vents
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const vx = canvasW * (0.2 + i * 0.3);
    const vy = baseY + Math.sin(vx * 0.01) * 15 + 5;
    const pulse = 0.3 + Math.sin(t * 1.5 + i * 2) * 0.2;
    ctx.fillStyle = `rgba(255,140,40,${pulse})`;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
    // Rising heat particles
    for (let j = 0; j < 4; j++) {
      const hx = vx + Math.sin(t * 2 + j * 1.5) * 8;
      const hy = vy - 10 - ((t * 20 + j * 15) % 40);
      const ha = Math.max(0, 0.3 - ((t * 20 + j * 15) % 40) / 50);
      ctx.fillStyle = `rgba(255,160,60,${ha})`;
      ctx.beginPath(); ctx.arc(hx, hy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Zone 6: The Old Mine ───────────────────────────────────────
function drawOldMineBackground() {
  const t = currentT;
  const baseY = canvasH * 0.85;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#0a0a10'); bg2.addColorStop(0.5, '#060608'); bg2.addColorStop(1, '#030304');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Mine shaft walls
  ctx.save();
  ctx.fillStyle = '#0c0c12';
  ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  // Support beams
  ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const bx = canvasW * (0.1 + i * 0.2);
    ctx.beginPath(); ctx.moveTo(bx, baseY); ctx.lineTo(bx, baseY - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 30, baseY - 58); ctx.lineTo(bx + 30, baseY - 58); ctx.stroke();
  }
  ctx.restore();

  // Rail tracks on the floor
  ctx.save();
  ctx.strokeStyle = '#1a1a28'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, baseY + 15); ctx.lineTo(canvasW, baseY + 15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, baseY + 25); ctx.lineTo(canvasW, baseY + 25); ctx.stroke();
  // Ties
  ctx.lineWidth = 3;
  for (let x = 0; x < canvasW; x += 35) {
    ctx.beginPath(); ctx.moveTo(x, baseY + 12); ctx.lineTo(x, baseY + 28); ctx.stroke();
  }
  ctx.restore();

  // Glowing ore veins
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const ox = canvasW * ((i * 0.618 + 0.05) % 1.0);
    const oy = canvasH * (0.15 + (i % 4) * 0.18);
    const alpha = 0.15 + Math.abs(Math.sin(t * 0.6 + i * 2)) * 0.3;
    ctx.fillStyle = `rgba(136,136,170,${alpha})`;
    ctx.shadowColor = '#8888aa'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(136,136,170,${alpha * 0.5})`; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(i * 1.3) * 20, oy + Math.sin(i * 1.3) * 15);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Zone 7: The Shark Den ──────────────────────────────────────
function drawSharkDenBackground() {
  const t = currentT;
  const baseY = canvasH * 0.88;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a0505'); bg2.addColorStop(0.5, '#0d0303'); bg2.addColorStop(1, '#050101');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#1a0505'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Rocky cave walls
  ctx.save();
  ctx.fillStyle = '#0a0404';
  for (let i = 0; i < 8; i++) {
    const rx = canvasW * (0.04 + i * 0.13);
    const rh = 40 + Math.sin(i * 2.1) * 20;
    ctx.beginPath();
    ctx.moveTo(rx - 25, baseY + 10);
    ctx.lineTo(rx - 12, baseY - rh);
    ctx.lineTo(rx + 5, baseY - rh - 8);
    ctx.lineTo(rx + 15, baseY - rh + 6);
    ctx.lineTo(rx + 25, baseY + 10);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Teeth/bone fragments on the floor
  ctx.save();
  ctx.fillStyle = '#221a1a';
  for (let i = 0; i < 12; i++) {
    const tx = canvasW * ((i * 0.37 + 0.05) % 1.0);
    const ty = baseY + 5 + (i % 3) * 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(tx - 2, ty - 8 - (i % 3) * 3); ctx.lineTo(tx + 2, ty - 8 - (i % 3) * 3);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Blood-red particles
  ctx.save();
  for (let i = 0; i < 15; i++) {
    const px = (canvasW * ((i * 0.618 + 0.08) % 1.0));
    const py = ((t * 8 * (0.4 + (i % 3) * 0.2) + i * canvasH / 15) % (canvasH * 0.8));
    const alpha = 0.08 + Math.abs(Math.sin(t * 0.5 + i * 1.2)) * 0.15;
    ctx.fillStyle = `rgba(200,50,50,${alpha})`;
    ctx.shadowColor = '#cc3333'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 8: The Abandoned City ─────────────────────────────────
function drawAbandonedCityBackground() {
  const t = currentT;
  const baseY = canvasH * 0.86;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#080d14'); bg2.addColorStop(0.5, '#040608'); bg2.addColorStop(1, '#020304');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#0a0d14'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Buildings in background
  ctx.save();
  ctx.fillStyle = '#060a10';
  const buildings = [
    { x: 0.05, w: 0.08, h: 0.35 }, { x: 0.15, w: 0.06, h: 0.5 },
    { x: 0.28, w: 0.1, h: 0.4 },  { x: 0.42, w: 0.07, h: 0.55 },
    { x: 0.55, w: 0.09, h: 0.3 },  { x: 0.68, w: 0.06, h: 0.45 },
    { x: 0.78, w: 0.08, h: 0.38 }, { x: 0.9, w: 0.07, h: 0.5 },
  ];
  for (const b of buildings) {
    const bx = canvasW * b.x, bw = canvasW * b.w, bh = canvasH * b.h;
    ctx.fillRect(bx, baseY - bh, bw, bh + 20);
    // Windows
    ctx.fillStyle = '#0a1020';
    for (let wy = baseY - bh + 12; wy < baseY - 10; wy += 18) {
      for (let wx = bx + 4; wx < bx + bw - 6; wx += 10) {
        ctx.fillRect(wx, wy, 6, 8);
        // Random lit window
        if (Math.sin(wx * 3.7 + wy * 2.1 + t * 0.02) > 0.92) {
          ctx.save();
          ctx.fillStyle = 'rgba(100,130,180,0.3)';
          ctx.shadowColor = '#6688bb'; ctx.shadowBlur = 8;
          ctx.fillRect(wx, wy, 6, 8);
          ctx.restore();
        }
      }
    }
    ctx.fillStyle = '#060a10';
  }
  ctx.restore();

  // Floor debris
  ctx.save();
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  ctx.restore();

  // Floating particles (dust/debris)
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const px = (canvasW * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 6 * (0.3 + (i % 3) * 0.15) + i * canvasH / 12) % (canvasH * 0.8));
    const alpha = 0.06 + Math.abs(Math.sin(t * 0.4 + i)) * 0.12;
    ctx.fillStyle = `rgba(100,136,187,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 9: The Seawall ────────────────────────────────────────
function drawSeawallBackground() {
  const t = currentT;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#080a0d'); bg2.addColorStop(0.5, '#040506'); bg2.addColorStop(1, '#020203');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#0a0c10'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // The massive wall on the right side
  ctx.save();
  const wallX = canvasW * 0.82;
  ctx.fillStyle = '#0c0e12';
  ctx.fillRect(wallX, 0, canvasW - wallX, canvasH);

  // Wall texture - bricks
  ctx.strokeStyle = '#14161a'; ctx.lineWidth = 1;
  for (let y = 0; y < canvasH; y += 20) {
    ctx.beginPath(); ctx.moveTo(wallX, y); ctx.lineTo(canvasW, y); ctx.stroke();
    const offset = (Math.floor(y / 20) % 2) * 15;
    for (let x = wallX + offset; x < canvasW; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 20); ctx.stroke();
    }
  }

  // Cracks with light
  ctx.strokeStyle = 'rgba(85,102,119,0.4)'; ctx.lineWidth = 1.5;
  ctx.shadowColor = '#556677'; ctx.shadowBlur = 10;
  for (let i = 0; i < 4; i++) {
    const cy = canvasH * (0.15 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(wallX + 5, cy);
    ctx.lineTo(wallX + 15, cy + 8);
    ctx.lineTo(wallX + 8, cy + 20);
    ctx.stroke();
  }
  ctx.restore();

  // Bottom rubble
  ctx.save();
  ctx.fillStyle = '#0a0c10';
  for (let i = 0; i < 6; i++) {
    const rx = canvasW * (0.05 + i * 0.13);
    ctx.beginPath(); ctx.ellipse(rx, canvasH * 0.9, 20 + (i % 3) * 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Dim particles
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const px = (canvasW * 0.75 * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 5 * (0.3 + (i % 3) * 0.2) + i * canvasH / 10) % canvasH);
    const alpha = 0.05 + Math.abs(Math.sin(t * 0.3 + i)) * 0.1;
    ctx.fillStyle = `rgba(85,102,119,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Clickable specials for new zones ────────────────────────────
function drawClickCoralPearl(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffccaa';
  ctx.shadowColor = '#ffaa88';
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickSandFossil(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#aa8855';
  ctx.shadowColor = '#ccaa77';
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ccbb88'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = a * 1.5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── Clickable specials for zones 3, 6, 7, 8, 9 ────────────────

function drawClickReefUrchin(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#cc55aa';
  ctx.shadowColor = '#ff66cc';
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ff88cc'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
    ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawClickMineGem(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8888cc';
  ctx.shadowColor = '#aaaaff';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(x, y - 12); ctx.lineTo(x + 10, y - 4); ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x - 8, y + 8); ctx.lineTo(x - 10, y - 4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ccccff'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x - 2, y - 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickLooseTooth(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ddccbb';
  ctx.shadowColor = '#ffddcc';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 10); ctx.lineTo(x, y - 14); ctx.lineTo(x + 5, y + 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#cc3333'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.arc(x, y + 8, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickCityRelic(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#6688bb';
  ctx.shadowColor = '#88aadd';
  ctx.shadowBlur = 14;
  ctx.fillRect(x - 8, y - 6, 16, 12);
  ctx.strokeStyle = '#aaccff'; ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 6, 16, 12);
  ctx.fillStyle = '#aaccff'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickWallShard(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#556677';
  ctx.shadowColor = '#778899';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 8); ctx.lineTo(x - 6, y - 10); ctx.lineTo(x + 4, y - 12);
  ctx.lineTo(x + 10, y + 2); ctx.lineTo(x + 4, y + 10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8899aa'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x + 6, y + 4); ctx.stroke();
  ctx.restore();
}

// ─── New fish shapes: jellyfish & angler ────────────────────────

function drawJellyfish(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(baseSc, baseSc);
  // Dome
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 20;
  ctx.fillStyle = rc.color;
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.9, sz * 0.7, 0, Math.PI, 0); ctx.fill();
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = rc.glow;
  ctx.beginPath(); ctx.ellipse(0, -sz * 0.15, sz * 0.6, sz * 0.4, 0, Math.PI, 0); ctx.fill();
  ctx.globalAlpha = alpha;
  // Tentacles
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.shadowBlur = 8;
  for (let i = 0; i < 5; i++) {
    const tx = (i - 2) * sz * 0.35;
    ctx.beginPath(); ctx.moveTo(tx, sz * 0.05);
    const wave = Math.sin(currentT * 3 + i * 1.2 + f.waveOffset);
    ctx.quadraticCurveTo(tx + wave * 8, sz * 0.5, tx + wave * 12, sz * 1.2);
    ctx.stroke();
  }
  // Eyes
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-sz * 0.2, -sz * 0.15, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.15, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(-sz * 0.2, -sz * 0.15, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.15, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawAngler(f) {
  const def = FISH[f.type], rc = goldenRC(f, RARITY_COLORS[def.rarity]), sz = def.size;
  const { alpha } = fishTransform(f);
  // Dark body
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10;
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.1, sz * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  // Huge mouth
  ctx.fillStyle = '#000500';
  ctx.beginPath();
  ctx.ellipse(sz * 0.6, sz * 0.1, sz * 0.6, sz * 0.4, 0.2, 0, Math.PI * 2); ctx.fill();
  // Teeth
  ctx.fillStyle = '#ddeedd';
  ctx.shadowBlur = 0;
  for (let i = 0; i < 5; i++) {
    const a = -0.6 + i * 0.3;
    const tx = sz * 0.6 + Math.cos(a) * sz * 0.55;
    const ty = sz * 0.1 + Math.sin(a) * sz * 0.35;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(tx + 3, ty + (a < 0 ? 6 : -6)); ctx.lineTo(tx - 3, ty + (a < 0 ? 6 : -6));
    ctx.closePath(); ctx.fill();
  }
  // Tail
  ctx.fillStyle = rc.color;
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(-sz * 1.0, 0); ctx.lineTo(-sz * 1.7, -sz * 0.5); ctx.lineTo(-sz * 1.7, sz * 0.5);
  ctx.closePath(); ctx.fill();
  // Lure - dangling light on stalk
  const lureWave = Math.sin(currentT * 3 + f.waveOffset) * 5;
  const lureX = sz * 0.3 + lureWave;
  const lureY = -sz * 0.8 - Math.abs(Math.sin(currentT * 2)) * 4;
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1; ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(sz * 0.2, -sz * 0.5);
  ctx.quadraticCurveTo(sz * 0.1, -sz * 0.7, lureX, lureY);
  ctx.stroke();
  // Glowing lure bulb
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.arc(lureX, lureY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 40;
  ctx.beginPath(); ctx.arc(lureX, lureY, 3, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.2, sz * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.2, sz * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
