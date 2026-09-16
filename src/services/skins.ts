// Minecraft Skin Avatars & 3D Character Customizer

export interface MinecraftSkin {
  id: string;
  name: string;
  title: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  headColor: string;
  hairColor: string;
  eyeColor: string;
  bodyColor: string;
  armsColor: string;
  legsColor: string;
  pantsColor: string;
  capeColor?: string;
  armorColor?: string;
  hasCape?: boolean;
  glow?: boolean;
  avatarIcon: string;
}

export const MINECRAFT_SKINS: MinecraftSkin[] = [
  {
    id: 'steve',
    name: 'Classic Steve',
    title: 'The Original Pioneer',
    rarity: 'Common',
    headColor: '#c89578',
    hairColor: '#452b1b',
    eyeColor: '#2b3ea0',
    bodyColor: '#009ba6',
    armsColor: '#c89578',
    legsColor: '#2b3ea0',
    pantsColor: '#253589',
    avatarIcon: '⛏️'
  },
  {
    id: 'alex',
    name: 'Classic Alex',
    title: 'Wilderness Wanderer',
    rarity: 'Common',
    headColor: '#e0ae8b',
    hairColor: '#d66224',
    eyeColor: '#2d7842',
    bodyColor: '#587343',
    armsColor: '#e0ae8b',
    legsColor: '#533b28',
    pantsColor: '#422f20',
    avatarIcon: '🏹'
  },
  {
    id: 'diamond_knight',
    name: 'Diamond Knight',
    title: 'Protector of the Realm',
    rarity: 'Epic',
    headColor: '#5ce8df',
    hairColor: '#3bbdb5',
    eyeColor: '#12544f',
    bodyColor: '#4dede2',
    armsColor: '#42d8ce',
    legsColor: '#36c2b8',
    pantsColor: '#2ba89f',
    armorColor: '#63f7ed',
    hasCape: true,
    capeColor: '#183861',
    glow: true,
    avatarIcon: '💎'
  },
  {
    id: 'netherite_warrior',
    name: 'Netherite Warrior',
    title: 'Lord of the Debris',
    rarity: 'Legendary',
    headColor: '#3a3438',
    hairColor: '#221f22',
    eyeColor: '#a133d9',
    bodyColor: '#2e282c',
    armsColor: '#383035',
    legsColor: '#292427',
    pantsColor: '#1f1b1e',
    armorColor: '#4f454c',
    hasCape: true,
    capeColor: '#591673',
    glow: true,
    avatarIcon: '⚔️'
  },
  {
    id: 'creeper_suit',
    name: 'Creeper Suit',
    title: 'Silent Boom Master',
    rarity: 'Rare',
    headColor: '#4eb43b',
    hairColor: '#1a5c10',
    eyeColor: '#151515',
    bodyColor: '#3ca829',
    armsColor: '#349b22',
    legsColor: '#2e8a1e',
    pantsColor: '#257318',
    avatarIcon: '💥'
  },
  {
    id: 'enderman',
    name: 'Enderman Suit',
    title: 'Void Teleporter',
    rarity: 'Epic',
    headColor: '#161616',
    hairColor: '#0a0a0a',
    eyeColor: '#c744f5',
    bodyColor: '#121212',
    armsColor: '#111111',
    legsColor: '#0d0d0d',
    pantsColor: '#080808',
    glow: true,
    hasCape: true,
    capeColor: '#2f083d',
    avatarIcon: '👁️'
  },
  {
    id: 'cyber_steve',
    name: 'Cyber Steve 2077',
    title: 'Neon Overclocked',
    rarity: 'Epic',
    headColor: '#1f2937',
    hairColor: '#06b6d4',
    eyeColor: '#22d3ee',
    bodyColor: '#0f172a',
    armsColor: '#38bdf8',
    legsColor: '#1e293b',
    pantsColor: '#0284c7',
    glow: true,
    avatarIcon: '⚡'
  },
  {
    id: 'redstone_engineer',
    name: 'Redstone Engineer',
    title: 'Master of Mechanisms',
    rarity: 'Rare',
    headColor: '#e0ae8b',
    hairColor: '#854d0e',
    eyeColor: '#ef4444',
    bodyColor: '#b91c1c',
    armsColor: '#e0ae8b',
    legsColor: '#475569',
    pantsColor: '#334155',
    glow: true,
    avatarIcon: '🔴'
  },
  {
    id: 'sakura_explorer',
    name: 'Sakura Explorer',
    title: 'Cherry Blossom Traveler',
    rarity: 'Rare',
    headColor: '#fce7f3',
    hairColor: '#f472b6',
    eyeColor: '#db2777',
    bodyColor: '#fbcfe8',
    armsColor: '#fce7f3',
    legsColor: '#be185d',
    pantsColor: '#9d174d',
    avatarIcon: '🌸'
  },
  {
    id: 'astronaut',
    name: 'Apollo Astronaut',
    title: 'Earth Orbit Surveyor',
    rarity: 'Legendary',
    headColor: '#e2e8f0',
    hairColor: '#0284c7',
    eyeColor: '#f59e0b',
    bodyColor: '#f8fafc',
    armsColor: '#e2e8f0',
    legsColor: '#cbd5e1',
    pantsColor: '#94a3b8',
    hasCape: true,
    capeColor: '#2563eb',
    avatarIcon: '🚀'
  }
];
