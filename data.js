'use strict';

// ═══════════════════════════════════════════════════════════════
//  ZONE ARCHITECTURE  (from masterGameLayout.md)
//  Beginner: Coast → Shallows → Sandbank → Reef → Coral Sprawl
//  Intermediate: Sand Dunes → Old Mine → Shark Den → Abandoned City → Seawall
// ═══════════════════════════════════════════════════════════════

const ZONES = [
  {
    id: 0, name: 'THE COAST', code: 'ZONE-00', depth: 5, tier: 'BEGINNER',
    unlockCost: null, implemented: true,
    fish: ['glow_anchovy', 'blister_crab', 'hollow_mackerel', 'tide_gazer', 'shore_wraith'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 4,
    color: '#00cc88',
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
    unlockCost: 1500, implemented: true,
    fish: ['pale_goby', 'linked_eel', 'jaw_fish', 'signal_carp', 'mirror_scale'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    color: '#44aadd',
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
    unlockCost: 6000, implemented: true,
    fish: ['dust_feeder', 'multi_eye', 'the_knot', 'depth_worm', 'sandborn'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    color: '#ccaa44',
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
    unlockCost: 20000, implemented: true,
    fish: ['irradiated_perch', 'rust_eel', 'deep_scout', 'abyssal_leech', 'the_watcher'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    color: '#cc55aa',
    ambientMessages: [
      '> The reef is alive. It is also watching.',
      '> [SONAR PING] Contact at 140m. Classification: ERROR. Reclassification: IGNORE.',
      '> Bioluminescence detected. Pattern: non-random. Meaning: unknown.',
      '> Irradiation levels above threshold. Your equipment says this is fine.',
      '> The coral here grows toward you when you are not looking.',
    ],
  },
  {
    id: 4, name: 'THE CORAL SPRAWL', code: 'ZONE-04', depth: 300, tier: 'BEGINNER',
    unlockCost: 55000, implemented: true,
    fish: ['coral_drifter', 'polyp_snapper', 'branch_crawler', 'neon_medusa', 'the_colony'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 6,
    color: '#ff6644',
    ambientMessages: [
      '> The coral here is not growing. It is assembling.',
      '> Colors shift when you look directly at them. Peripheral vision shows the truth.',
      '> A polyp opened its mouth. Inside: another polyp. Inside that: teeth.',
      '> Bioluminescent pulses detected. Frequency matches your heartbeat.',
      '> The sprawl extends further than your scanner can reach. It was not this large yesterday.',
    ],
  },
  {
    id: 5, name: 'THE SAND DUNES', code: 'ZONE-05', depth: 600, tier: 'INTERMEDIATE',
    unlockCost: 100000, implemented: true,
    fish: ['dune_slider', 'silt_phantom', 'glass_ray', 'storm_warden', 'the_buried'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 6,
    color: '#ddaa44',
    ambientMessages: [
      '> The dunes migrate. They do not follow the current.',
      '> Sand composition: 40% silica, 30% calcium, 30% UNKNOWN ORGANIC.',
      '> Something large moved beneath the dune. The dune did not shift.',
      '> Visibility dropping. The sand is rising. There is no current.',
      '> A dune collapsed. Beneath it: another dune. Beneath that: something breathing.',
    ],
  },
  {
    id: 6, name: 'THE OLD MINE', code: 'ZONE-06', depth: 900, tier: 'INTERMEDIATE',
    unlockCost: 350000, implemented: true,
    fish: ['ore_nibbler', 'slag_eel', 'drill_fish', 'vein_crawler', 'the_foreman'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 6,
    color: '#8888aa',
    ambientMessages: [
      '> Mine shaft 7 is still operational. Records show it was sealed in 1987.',
      '> Pick marks on the walls. They were made from the inside.',
      '> Ore deposits detected. The ore is warm. It should not be warm.',
      '> A rail cart moved past on rusted tracks. No one was pushing it.',
      '> The mine shaft groans. It sounds like language.',
    ],
  },
  {
    id: 7, name: 'THE SHARK DEN', code: 'ZONE-07', depth: 1200, tier: 'INTERMEDIATE',
    unlockCost: 900000, implemented: true,
    fish: ['reef_pup', 'hammerhead_ghost', 'blood_fin', 'apex_shadow', 'the_matriarch'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 5,
    color: '#cc3333',
    ambientMessages: [
      '> Tooth marks on the scanner housing. The scanner was in your hand.',
      '> Blood in the water. Analysis: not from any known species.',
      '> Shark count: 7. Shark count: 12. Shark count: ERROR. Shark count: 1.',
      '> The den has a hierarchy. You are being ranked.',
      '> Something circled you three times. Your sonar only detected it once.',
    ],
  },
  {
    id: 8, name: 'THE ABANDONED CITY', code: 'ZONE-08', depth: 1800, tier: 'INTERMEDIATE',
    unlockCost: 2500000, implemented: true,
    fish: ['pipe_swimmer', 'ruin_lurker', 'glass_walker', 'signal_ghost', 'the_architect'],
    spawnWeights: [40, 30, 20, 8, 2], maxFish: 6,
    color: '#6688bb',
    ambientMessages: [
      '> The city was not abandoned. The inhabitants simply stopped being visible.',
      '> Street signs in a language that predates language.',
      '> A window opened. Light came from inside. There is no power source.',
      '> The buildings are too symmetrical. Geometry this precise requires intent.',
      '> Population records found. The last census counted something that is not a number.',
    ],
  },
  {
    id: 9, name: 'THE SEAWALL', code: 'ZONE-09', depth: 2500, tier: 'INTERMEDIATE',
    unlockCost: 6000000, implemented: true,
    fish: ['wall_clinger', 'breach_eel', 'abyss_angler', 'pressure_pike', 'void_sentinel', 'the_barrier'],
    spawnWeights: [40, 30, 25, 20, 8, 2], maxFish: 5,
    color: '#556677',
    ambientMessages: [
      '> The wall was not built to keep things out. It was built to keep things in.',
      '> Structural analysis: the wall is growing. 2.3mm per year. For how long?',
      '> A crack in the wall. Something is looking through it. From the other side.',
      '> Pressure readings on both sides of the wall are identical. They should not be.',
      '> The wall hums at a frequency that makes your teeth ache. The fish do not seem to mind.',
    ],
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
    speed: 72, size: 18, wave: { amp: 4, freq: 3 },
    desc: 'Bioluminescent. Edible, probably.',
  },
  blister_crab: {
    name: 'BLISTER CRAB', zone: 0, rarity: 'UNCOMMON', goldValue: 3,
    speed: 57, size: 24, wave: { amp: 8, freq: 4 },
    desc: 'Calcified protrusions on the shell. Not natural.', shape: 'crab',
  },
  hollow_mackerel: {
    name: 'HOLLOW MACKEREL', zone: 0, rarity: 'RARE', goldValue: 12,
    speed: 105, size: 20, wave: { amp: 6, freq: 2.5 },
    desc: 'Interior completely empty. Still alive.', shape: 'slim',
  },
  tide_gazer: {
    name: 'TIDE GAZER', zone: 0, rarity: 'EPIC', goldValue: 38,
    speed: 141, size: 26, wave: { amp: 28, freq: 2.2 },
    desc: 'Its eye tracks you even after being caught.', shape: 'blob',
  },
  shore_wraith: {
    name: 'SHORE WRAITH', zone: 0, rarity: 'LEGENDARY', goldValue: 135,
    speed: 178, size: 15, wave: { amp: 45, freq: 1.0 },
    desc: 'You saw it. Your scanner did not.',
  },

  // ── ZONE 0: extra coast shapes ──
  coast_clownfish: {
    name: 'SIGNAL CLOWN', zone: 0, rarity: 'COMMON', goldValue: 1,
    speed: 64, size: 16, wave: { amp: 10, freq: 3.5 },
    desc: 'Stripes alternate between warning and camouflage.', shape: 'clown',
  },
  coast_puffer: {
    name: 'BLOAT PUFFER', zone: 0, rarity: 'UNCOMMON', goldValue: 4,
    speed: 46, size: 22, wave: { amp: 5, freq: 2 },
    desc: 'Inflates when stressed. Currently inflated.', shape: 'puffer',
  },

  // ── ZONE 1: THE SHALLOWS ──
  pale_goby: {
    name: 'PALE GOBY', zone: 1, rarity: 'COMMON', goldValue: 2,
    speed: 79, size: 20, wave: { amp: 5, freq: 2.8 }, shape: 'slim',
    desc: 'No pigment. Appears to have lost something recently.',
  },
  linked_eel: {
    name: 'LINKED EEL', zone: 1, rarity: 'UNCOMMON', goldValue: 6,
    speed: 116, size: 32, wave: { amp: 36, freq: 1.8 }, shape: 'eel',
    desc: 'Always found in pairs. The other is never caught.',
  },
  jaw_fish: {
    name: 'JAW FISH', zone: 1, rarity: 'RARE', goldValue: 24,
    speed: 152, size: 25, wave: { amp: 7, freq: 2.2 }, shape: 'jaw',
    desc: 'Mouth constitutes 60% of body mass.',
  },
  signal_carp: {
    name: 'SIGNAL CARP', zone: 1, rarity: 'EPIC', goldValue: 75,
    speed: 174, size: 22, wave: { amp: 20, freq: 3.0 }, shape: 'flat',
    desc: 'Constantly broadcasting. No one is responding.',
  },
  mirror_scale: {
    name: 'MIRROR SCALE', zone: 1, rarity: 'LEGENDARY', goldValue: 260,
    speed: 226, size: 18, wave: { amp: 50, freq: 0.9 }, shape: 'flat',
    desc: 'It shows you something. You cannot repeat what you saw.',
  },

  // ── ZONE 2: THE SANDBANK ──
  dust_feeder: {
    name: 'DUST FEEDER', zone: 2, rarity: 'COMMON', goldValue: 3,
    speed: 88, size: 21, wave: { amp: 6, freq: 5 }, shape: 'fish',
    desc: 'Consumes sediment. Excretes something crystalline.',
  },
  multi_eye: {
    name: 'MULTI-EYE', zone: 2, rarity: 'UNCOMMON', goldValue: 11,
    speed: 123, size: 28, wave: { amp: 24, freq: 2.5 }, shape: 'blob',
    desc: 'Eleven eyes. None of them blink at the same time.',
  },
  the_knot: {
    name: 'THE KNOT', zone: 2, rarity: 'RARE', goldValue: 45,
    speed: 156, size: 19, wave: { amp: 8, freq: 3.0 }, shape: 'eel',
    desc: 'Spine tied into a reef knot. Still functional.',
  },
  depth_worm: {
    name: 'DEPTH WORM', zone: 2, rarity: 'EPIC', goldValue: 135,
    speed: 185, size: 38, wave: { amp: 55, freq: 1.5 }, shape: 'eel',
    desc: 'Pressure at this depth should kill it. Noted.',
  },
  sandborn: {
    name: 'SANDBORN', zone: 2, rarity: 'LEGENDARY', goldValue: 450,
    speed: 220, size: 22, wave: { amp: 30, freq: 2.0 }, shape: 'blob',
    desc: 'Did not swim here. Emerged from below.',
  },

  // ── ZONE 3: THE REEF ──
  irradiated_perch: {
    name: 'IRRADIATED PERCH', zone: 3, rarity: 'COMMON', goldValue: 6,
    speed: 79, size: 24, wave: { amp: 5, freq: 2.5 }, shape: 'fish',
    desc: 'Glows faintly. Probably fine.',
  },
  rust_eel: {
    name: 'RUST EEL', zone: 3, rarity: 'UNCOMMON', goldValue: 21,
    speed: 132, size: 34, wave: { amp: 34, freq: 2.0 }, shape: 'eel',
    desc: 'Corroded metallic scales. Moves in waves.',
  },
  deep_scout: {
    name: 'DEEP SCOUT', zone: 3, rarity: 'RARE', goldValue: 80,
    speed: 218, size: 26, wave: { amp: 10, freq: 1.8 }, shape: 'shark',
    desc: 'It appears to be studying you. Do not make eye contact.',
  },
  abyssal_leech: {
    name: 'ABYSSAL LEECH', zone: 3, rarity: 'EPIC', goldValue: 240,
    speed: 163, size: 28, wave: { amp: 22, freq: 3.2 }, shape: 'blob',
    desc: 'Parasitic. It has been following you longer than you realize.',
  },
  the_watcher: {
    name: 'THE WATCHER', zone: 3, rarity: 'LEGENDARY', goldValue: 800,
    speed: 220, size: 38, wave: { amp: 18, freq: 0.7 }, shape: 'shark',
    desc: 'You cannot be certain if you caught it, or if it allowed itself to be caught.',
  },

  // ── ZONE 4: THE CORAL SPRAWL ──
  coral_drifter: {
    name: 'CORAL DRIFTER', zone: 4, rarity: 'COMMON', goldValue: 11,
    speed: 85, size: 22, wave: { amp: 7, freq: 2.6 }, shape: 'fish',
    desc: 'Camouflaged as coral. Only visible when it moves.',
  },
  polyp_snapper: {
    name: 'POLYP SNAPPER', zone: 4, rarity: 'UNCOMMON', goldValue: 40,
    speed: 130, size: 26, wave: { amp: 12, freq: 2.8 }, shape: 'jaw',
    desc: 'Feeds exclusively on polyps. The polyps do not resist.',
  },
  branch_crawler: {
    name: 'BRANCH CRAWLER', zone: 4, rarity: 'RARE', goldValue: 150,
    speed: 170, size: 20, wave: { amp: 15, freq: 3.2 }, shape: 'crab',
    desc: 'Walks along coral branches upside down. Gravity is a suggestion.',
  },
  neon_medusa: {
    name: 'NEON MEDUSA', zone: 4, rarity: 'EPIC', goldValue: 450,
    speed: 195, size: 30, wave: { amp: 35, freq: 1.4 }, shape: 'jellyfish',
    desc: 'Tentacles emit light in patterns that induce calm. Do not stare.',
  },
  the_colony: {
    name: 'THE COLONY', zone: 4, rarity: 'LEGENDARY', goldValue: 1500,
    speed: 245, size: 35, wave: { amp: 20, freq: 0.8 }, shape: 'blob',
    desc: 'Not one organism. Not many. The distinction does not apply.',
  },

  // ── ZONE 5: THE SAND DUNES ──
  dune_slider: {
    name: 'DUNE SLIDER', zone: 5, rarity: 'COMMON', goldValue: 22,
    speed: 110, size: 24, wave: { amp: 5, freq: 2.2 }, shape: 'flat',
    desc: 'Glides along the sand surface. Leaves no trail.',
  },
  silt_phantom: {
    name: 'SILT PHANTOM', zone: 5, rarity: 'UNCOMMON', goldValue: 75,
    speed: 167, size: 22, wave: { amp: 18, freq: 2.5 }, shape: 'slim',
    desc: 'Visible only in disturbed sediment. Invisible otherwise.',
  },
  glass_ray: {
    name: 'GLASS RAY', zone: 5, rarity: 'RARE', goldValue: 280,
    speed: 220, size: 30, wave: { amp: 10, freq: 1.6 }, shape: 'flat',
    desc: 'Transparent body reveals internal organs. All of them are wrong.',
  },
  storm_warden: {
    name: 'STORM WARDEN', zone: 5, rarity: 'EPIC', goldValue: 800,
    speed: 253, size: 28, wave: { amp: 28, freq: 2.0 }, shape: 'shark',
    desc: 'Appears before underwater storms. The storms follow it.',
  },
  the_buried: {
    name: 'THE BURIED', zone: 5, rarity: 'LEGENDARY', goldValue: 2800,
    speed: 310, size: 26, wave: { amp: 40, freq: 1.2 }, shape: 'eel',
    desc: 'Erupts from the sand. Returns before you can look away.',
  },

  // ── ZONE 6: THE OLD MINE ──
  ore_nibbler: {
    name: 'ORE NIBBLER', zone: 6, rarity: 'COMMON', goldValue: 40,
    speed: 120, size: 20, wave: { amp: 4, freq: 3.0 }, shape: 'fish',
    desc: 'Teeth made of mineral deposits. It eats the walls.',
  },
  slag_eel: {
    name: 'SLAG EEL', zone: 6, rarity: 'UNCOMMON', goldValue: 140,
    speed: 184, size: 34, wave: { amp: 30, freq: 1.8 }, shape: 'eel',
    desc: 'Body coated in industrial waste. Thriving.',
  },
  drill_fish: {
    name: 'DRILL FISH', zone: 6, rarity: 'RARE', goldValue: 520,
    speed: 242, size: 26, wave: { amp: 8, freq: 2.6 }, shape: 'slim',
    desc: 'Rotating head segment. Bores through rock. And other things.',
  },
  vein_crawler: {
    name: 'VEIN CRAWLER', zone: 6, rarity: 'EPIC', goldValue: 1500,
    speed: 282, size: 32, wave: { amp: 22, freq: 1.5 }, shape: 'crab',
    desc: 'Follows mineral veins through solid stone. Should not be possible.',
  },
  the_foreman: {
    name: 'THE FOREMAN', zone: 6, rarity: 'LEGENDARY', goldValue: 5200,
    speed: 345, size: 40, wave: { amp: 15, freq: 0.7 }, shape: 'shark',
    desc: 'Wears something on its head. It looks like a helmet. It is not a helmet.',
  },

  // ── ZONE 7: THE SHARK DEN ──
  reef_pup: {
    name: 'REEF PUP', zone: 7, rarity: 'COMMON', goldValue: 75,
    speed: 150, size: 26, wave: { amp: 6, freq: 2.4 }, shape: 'shark',
    desc: 'Juvenile predator. Curious. Hungry.',
  },
  hammerhead_ghost: {
    name: 'HAMMERHEAD GHOST', zone: 7, rarity: 'UNCOMMON', goldValue: 260,
    speed: 220, size: 32, wave: { amp: 14, freq: 1.8 }, shape: 'shark',
    desc: 'A hammerhead that is not entirely there. Translucent in direct light.',
  },
  blood_fin: {
    name: 'BLOOD FIN', zone: 7, rarity: 'RARE', goldValue: 950,
    speed: 294, size: 28, wave: { amp: 10, freq: 2.2 }, shape: 'shark',
    desc: 'Fins stained permanently red. The color spreads to nearby water.',
  },
  apex_shadow: {
    name: 'APEX SHADOW', zone: 7, rarity: 'EPIC', goldValue: 2800,
    speed: 338, size: 36, wave: { amp: 18, freq: 1.2 }, shape: 'shark',
    desc: 'Casts a shadow but is not visible. The shadow has teeth.',
  },
  the_matriarch: {
    name: 'THE MATRIARCH', zone: 7, rarity: 'LEGENDARY', goldValue: 9500,
    speed: 412, size: 44, wave: { amp: 12, freq: 0.6 }, shape: 'shark',
    desc: 'She has been here longer than the ocean. The den is hers.',
  },

  // ── ZONE 8: THE ABANDONED CITY ──
  pipe_swimmer: {
    name: 'PIPE SWIMMER', zone: 8, rarity: 'COMMON', goldValue: 135,
    speed: 169, size: 22, wave: { amp: 5, freq: 2.8 }, shape: 'slim',
    desc: 'Lives inside rusted pipes. Emerges to feed on rust.',
  },
  ruin_lurker: {
    name: 'RUIN LURKER', zone: 8, rarity: 'UNCOMMON', goldValue: 480,
    speed: 244, size: 28, wave: { amp: 20, freq: 2.0 }, shape: 'blob',
    desc: 'Hides in collapsed structures. Multiple eyes reflect no light.',
  },
  glass_walker: {
    name: 'GLASS WALKER', zone: 8, rarity: 'RARE', goldValue: 1750,
    speed: 325, size: 24, wave: { amp: 8, freq: 2.4 }, shape: 'crab',
    desc: 'Walks on broken windows. The glass does not cut it. It should.',
  },
  signal_ghost: {
    name: 'SIGNAL GHOST', zone: 8, rarity: 'EPIC', goldValue: 5200,
    speed: 375, size: 30, wave: { amp: 25, freq: 1.6 }, shape: 'jellyfish',
    desc: 'Emits radio signals on frequencies abandoned decades ago. Someone is listening.',
  },
  the_architect: {
    name: 'THE ARCHITECT', zone: 8, rarity: 'LEGENDARY', goldValue: 17500,
    speed: 456, size: 42, wave: { amp: 15, freq: 0.5 }, shape: 'blob',
    desc: 'It did not build the city. But it remembers who did.',
  },

  // ── ZONE 9: THE SEAWALL ──
  wall_clinger: {
    name: 'WALL CLINGER', zone: 9, rarity: 'COMMON', goldValue: 250,
    speed: 195, size: 24, wave: { amp: 4, freq: 3.2 }, shape: 'crab',
    desc: 'Attached to the wall. Has been attached for a very long time.',
  },
  breach_eel: {
    name: 'BREACH EEL', zone: 9, rarity: 'UNCOMMON', goldValue: 880,
    speed: 280, size: 36, wave: { amp: 32, freq: 1.6 }, shape: 'eel',
    desc: 'Squeezes through cracks in the wall. What it brings back is concerning.',
  },
  abyss_angler: {
    name: 'ABYSS ANGLER', zone: 9, rarity: 'UNCOMMON', goldValue: 1000,
    speed: 250, size: 32, wave: { amp: 15, freq: 1.2 }, shape: 'angler',
    desc: 'A light dangles before its mouth. It is not a lure. It is a warning.',
  },
  pressure_pike: {
    name: 'PRESSURE PIKE', zone: 9, rarity: 'RARE', goldValue: 3300,
    speed: 370, size: 28, wave: { amp: 6, freq: 2.0 }, shape: 'slim',
    desc: 'Body adapted to impossible pressure. It moves like a bullet.',
  },
  void_sentinel: {
    name: 'VOID SENTINEL', zone: 9, rarity: 'EPIC', goldValue: 9500,
    speed: 429, size: 34, wave: { amp: 20, freq: 1.0 }, shape: 'shark',
    desc: 'Guards something beyond the wall. It does not want you to know what.',
  },
  the_barrier: {
    name: 'THE BARRIER', zone: 9, rarity: 'LEGENDARY', goldValue: 33000,
    speed: 520, size: 48, wave: { amp: 10, freq: 0.4 }, shape: 'blob',
    desc: 'It is the wall. A piece of the wall that decided to swim.',
  },

  // ── SPECIAL: clickable creatures per zone ──
  shore_crab: {
    name: 'SHORE CRAB', zone: 0, rarity: 'RARE', goldValue: 38,
    speed: 0, size: 22, wave: null,
    desc: 'Spotted watching from the rocks. You were faster.',
  },
  tide_starfish: {
    name: 'TIDE STARFISH', zone: 1, rarity: 'RARE', goldValue: 48,
    speed: 0, size: 20, wave: null,
    desc: 'Five arms. Each one points somewhere different.',
  },
  buried_dollar: {
    name: 'BURIED DOLLAR', zone: 2, rarity: 'RARE', goldValue: 65,
    speed: 0, size: 18, wave: null,
    desc: 'Partially exposed. The sand was hiding it deliberately.',
  },
  reef_urchin: {
    name: 'REEF URCHIN', zone: 3, rarity: 'RARE', goldValue: 120,
    speed: 0, size: 18, wave: null,
    desc: 'Spines retract when observed directly. Extend when you look away.',
  },
  coral_pearl: {
    name: 'CORAL PEARL', zone: 4, rarity: 'RARE', goldValue: 185,
    speed: 0, size: 16, wave: null,
    desc: 'Found nestled in living coral. The coral tried to close around it.',
  },
  sand_fossil: {
    name: 'SAND FOSSIL', zone: 5, rarity: 'RARE', goldValue: 370,
    speed: 0, size: 20, wave: null,
    desc: 'A fossil of something that should not have existed. The dating is wrong.',
  },
  mine_gem: {
    name: 'MINE GEM', zone: 6, rarity: 'RARE', goldValue: 650,
    speed: 0, size: 16, wave: null,
    desc: 'Embedded in the wall. Glows when no one is watching.',
  },
  loose_tooth: {
    name: 'LOOSE TOOTH', zone: 7, rarity: 'RARE', goldValue: 1200,
    speed: 0, size: 20, wave: null,
    desc: 'Not from any species on record. The bite marks match nothing.',
  },
  city_relic: {
    name: 'CITY RELIC', zone: 8, rarity: 'RARE', goldValue: 2200,
    speed: 0, size: 18, wave: null,
    desc: 'A piece of something that was important once. It still hums.',
  },
  wall_shard: {
    name: 'WALL SHARD', zone: 9, rarity: 'RARE', goldValue: 4000,
    speed: 0, size: 22, wave: null,
    desc: 'Broke from the wall. The wall did not notice. Or chose not to.',
  },
};

// ═══════════════════════════════════════════════════════════════
//  MATERIALS (item 20)
// ═══════════════════════════════════════════════════════════════

const MATERIALS = {
  glowing_rod: {
    name: 'GLOWING ROD', desc: 'A faintly luminescent rod pulled from the catch. Warm to the touch.',
    source: 'glow_anchovy', dropChance: 0.05,
  },
  hollow_scale: {
    name: 'HOLLOW SCALE', desc: 'A scale with nothing inside. Lighter than air.',
    source: 'hollow_mackerel', dropChance: 0.08,
  },
  depth_crystal: {
    name: 'DEPTH CRYSTAL', desc: 'Crystallized pressure. It hums at a frequency you cannot hear.',
    source: 'dust_feeder', dropChance: 0.04,
  },
};

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DECORATION DATA
// ═══════════════════════════════════════════════════════════════

const COAST_SAND_LEVEL = 0.85;
const COAST_ROCKS = [
  { fx: 0.14, fy: 0.82 },
  { fx: 0.50, fy: 0.84 },
  { fx: 0.80, fy: 0.81 },
];

// ═══════════════════════════════════════════════════════════════
//  UPGRADES
// ═══════════════════════════════════════════════════════════════

const UPGRADE_CATEGORIES = [
  { name: 'ROD ENHANCEMENTS', ids: ['rod_speed', 'faster_reel', 'instant_retract', 'targeting_scope'] },
  { name: 'AUTOMATION',   ids: ['fish_density', 'luck_boost'] },
  { name: 'AUTO HOOK',    ids: ['auto_hook', 'auto_hook_speed', 'auto_hook_reload'] },
  { name: 'ABILITIES',    ids: ['bait_bomb', 'bait_cooldown', 'bait_strength', 'multi_cast', 'multi_cooldown', 'multi_duration', 'multi_rods'], special: 'abilities' },
  { name: 'NETS',         ids: ['net_place', 'net_slots', 'net_size'] },
  { name: 'CONSUMABLES',  ids: [], special: 'consumables' },
  { name: 'MAP LOCATIONS', ids: ['boat_access', 'atlas_access', 'catalog_access'] },
];

const CONSUMABLES_DEF = [
  { id: 'small_net', name: 'SMALL NET',  desc: 'Throw a net that captures all fish in a small area. Click to activate, then click on the water.',  cost: 120, netRadius: 90  },
  { id: 'big_net',   name: 'BIG NET',    desc: 'A larger net. Captures all fish in a wide area. Click to activate, then click on the water.',       cost: 320, netRadius: 180 },
];

const UPGRADES_DEF = [
  // ROD ENHANCEMENTS
  { id: 'rod_speed',       name: 'FASTER ROD',        desc: 'Increase speed of cast.',                                                               baseCost: 25,  max: 30, costScale: 1.18, revealAt: 0   },
  { id: 'faster_reel',     name: 'FASTER RELOAD',     desc: 'Decrease cooldown of cast.',                                                             baseCost: 15,  max: 30, costScale: 1.18, revealAt: 0   },
  { id: 'instant_retract', name: 'RETRACT SPEED',     desc: 'Right click to retract your rod! Upgrade further to increase retraction speed.',          baseCost: 20,  max: 30, costScale: 1.18, revealAt: 0   },
  { id: 'targeting_scope', name: 'HOOK SIZE',          desc: 'Increase hook catch radius.',                                                            baseCost: 18,  max: 30, costScale: 1.18, revealAt: 0   },
  // AUTOMATION
  { id: 'fish_density',    name: 'DEEP BROADCAST',    desc: 'Increase rate of fish spawning.',                                                        baseCost: 40,  max: 30, costScale: 1.22, revealAt: 15  },
  { id: 'luck_boost',      name: 'RARE FREQUENCY',    desc: 'Slightly increases chances of rarer fish and lowers common spawn rates.',                 baseCost: 500, max: 8, costScale: 1.8, revealAt: 0  },
  // AUTO HOOK
  { id: 'auto_hook',       name: 'AUTO HOOK',         desc: 'Unlocks automatic casting. Your hook fires on its own when idle.',                        baseCost: 150, max: 1, costScale: 1, revealAt: 0  },
  { id: 'auto_hook_speed', name: 'AUTO HOOK SPEED',   desc: 'Reduces auto hook interval by 1 second per level.',                                      baseCost: 200, max: 29, costScale: 1.18, revealAt: 0, parent: 'auto_hook'  },
  { id: 'auto_hook_reload',name: 'AUTO HOOK RELOAD',  desc: 'Reduces recast delay after auto hook cast. Near-instant at max.',                        baseCost: 180, max: 14, costScale: 1.2, revealAt: 0, parent: 'auto_hook'  },
  // ABILITIES
  { id: 'bait_bomb',       name: 'BAIT BOMB',         desc: 'Unlocks the BAIT button. Scatter bait to draw a frenzy of fish for 5s.',                 baseCost: 200, max: 1,  costScale: 1,   revealAt: 150 },
  { id: 'bait_cooldown',   name: 'BAIT EFFICIENCY',   desc: 'Reduces bait cooldown by 30s per level.',                                                baseCost: 400, max: 5,  costScale: 2.5, revealAt: 300, parent: 'bait_bomb' },
  { id: 'bait_strength',   name: 'BAIT POTENCY',      desc: 'Bait attracts +6 extra fish per level.',                                                 baseCost: 450, max: 5,  costScale: 2.4, revealAt: 300, parent: 'bait_bomb' },
  { id: 'multi_cast',      name: 'MULTI-CAST',        desc: 'Unlocks MULTI-CAST. Casts your line in 3 directions for 15s. 3 min cooldown.',           baseCost: 600, max: 1,  costScale: 1,   revealAt: 400 },
  { id: 'multi_cooldown',  name: 'MULTI-CAST SPEED',  desc: 'Reduces multi-cast cooldown by 15s per level.',                                          baseCost: 800, max: 5,  costScale: 2.5, revealAt: 600, parent: 'multi_cast' },
  { id: 'multi_duration',  name: 'MULTI-CAST EXTEND', desc: 'Increases multi-cast duration by 3s per level.',                                         baseCost: 750, max: 5,  costScale: 2.4, revealAt: 600, parent: 'multi_cast' },
  { id: 'multi_rods',      name: 'MULTI-CAST RODS',   desc: '+1 extra rod per level during multi-cast.',                                              baseCost: 1000, max: 4, costScale: 2.8, revealAt: 600, parent: 'multi_cast' },
  // NETS
  { id: 'net_place',       name: 'CAST NET',           desc: 'Unlocks placeable nets. Place a net on the water — fish that swim through are caught automatically.',  baseCost: 3000, max: 1,  costScale: 1,    revealAt: 0   },
  { id: 'net_slots',       name: 'NET SLOTS',          desc: '+1 additional net you can place at a time.',                                                            baseCost: 5000, max: 3,  costScale: 3.5,  revealAt: 0, parent: 'net_place' },
  { id: 'net_size',        name: 'NET RADIUS',         desc: 'Increases the catch radius of your placed nets.',                                                       baseCost: 4000, max: 8, costScale: 2.8,  revealAt: 0, parent: 'net_place' },
  // MAP LOCATIONS
  { id: 'boat_access',     name: 'THE BOAT',          desc: 'Access your vessel. Tune rod configuration and equipment.',                               baseCost: 400, max: 1,  costScale: 1,   revealAt: 0   },
  { id: 'atlas_access',    name: 'THE ATLAS',         desc: 'Chart the depths. View all zones and travel between them.',                               baseCost: 500, max: 1,  costScale: 1,   revealAt: 0   },
  { id: 'catalog_access',  name: 'THE CATALOG',       desc: 'A database of all ocean life. Track every species you have encountered.',                 baseCost: 1000, max: 1, costScale: 1,   revealAt: 0   },
];

const BLEED_MULTIPLIERS = { COMMON: 0.03, UNCOMMON: 0.10, RARE: 0.40, EPIC: 1.5, LEGENDARY: 4.0 };
const BLEED_DISTANCE_PENALTY = 0.35; // multiplier for fish 2 zones away

// Progression unlock thresholds (total fish caught)
const PROGRESSION_THRESHOLDS = {
  AUTOMATION: 10,
  AUTO_HOOK: 10,
  CONSUMABLES: 25,
  ABILITIES: 40,
  NETS: 75,
  MAP_LOCATIONS: 100,
};
