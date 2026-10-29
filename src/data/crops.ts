export type CropKind = 'flower' | 'vegetable' | 'fruit';

export interface CropDef {
  id: string;
  kind: CropKind;
  name: { id: string; en: string };
  /** Seconds of watered growth needed to be ready. */
  growSeconds: number;
  stages: number;
  seedCost: number;
  sellPrice: number;
  /** Emoji-free short label for the seed packet icon. */
  leafColor: number;
  bloomColor: number;
  favoriteOf?: 'bubu' | 'dudu';
}

export const CROPS: CropDef[] = [
  {
    id: 'mawar',
    kind: 'flower',
    name: { id: 'Mawar', en: 'Rose' },
    growSeconds: 42,
    stages: 4,
    seedCost: 12,
    sellPrice: 30,
    leafColor: 0x8fae78,
    bloomColor: 0xea8fa6,
    favoriteOf: 'bubu'
  },
  {
    id: 'matahari',
    kind: 'flower',
    name: { id: 'Bunga matahari', en: 'Sunflower' },
    growSeconds: 58,
    stages: 4,
    seedCost: 16,
    sellPrice: 42,
    leafColor: 0x8fae78,
    bloomColor: 0xf2c14e
  },
  {
    id: 'stroberi',
    kind: 'fruit',
    name: { id: 'Stroberi', en: 'Strawberry' },
    growSeconds: 50,
    stages: 4,
    seedCost: 14,
    sellPrice: 36,
    leafColor: 0x7fa36a,
    bloomColor: 0xe2666f
  },
  {
    id: 'wortel',
    kind: 'vegetable',
    name: { id: 'Wortel', en: 'Carrot' },
    growSeconds: 38,
    stages: 3,
    seedCost: 10,
    sellPrice: 26,
    leafColor: 0x86ab74,
    bloomColor: 0xe08a4b,
    favoriteOf: 'dudu'
  }
];

export function cropById(id: string | null | undefined): CropDef | undefined {
  if (!id) return undefined;
  return CROPS.find((crop) => crop.id === id);
}

export type FishId = 'jamal' | 'koi-krem' | 'cupang-biru' | 'lele-kecil' | 'botol-pesan';

export interface FishDef {
  id: FishId;
  name: { id: string; en: string };
  rarity: 'common' | 'uncommon' | 'rare';
  /** Tap window in milliseconds once the float dips. */
  biteWindowMs: number;
  /** How long the reel bar takes to fill while holding, in ms. */
  reelMs: number;
  story: { id: string; en: string };
  bodyColor: number;
  finColor: number;
}

export const FISH: FishDef[] = [
  {
    id: 'cupang-biru',
    name: { id: 'Cupang biru', en: 'Blue betta' },
    rarity: 'common',
    biteWindowMs: 1200,
    reelMs: 1600,
    story: {
      id: 'Ikan yang paling sering main ke kolam kita. Warnanya mirip langit sore pas kamu senyum.',
      en: 'The fish that visits our pond most often. Its colour matches the evening sky when you smile.'
    },
    bodyColor: 0x7fb2d9,
    finColor: 0xa9d0e8
  },
  {
    id: 'koi-krem',
    name: { id: 'Koi krem', en: 'Cream koi' },
    rarity: 'common',
    biteWindowMs: 1300,
    reelMs: 2100,
    story: {
      id: 'Koi yang katanya bawa keberuntungan. Aku percaya, soalnya aku ketemu kamu.',
      en: 'A koi that supposedly brings luck. I believe it, because I found you.'
    },
    bodyColor: 0xf7e3c4,
    finColor: 0xefc79a
  },
  {
    id: 'botol-pesan',
    name: { id: 'Botol pesan', en: 'Message bottle' },
    rarity: 'uncommon',
    biteWindowMs: 900,
    reelMs: 1500,
    story: {
      id: 'Botol kecil, isinya cuma satu kalimat: "kalau kamu nemu ini, berarti kamu memang jodohku".',
      en: 'A tiny bottle with one line inside: "if you found this, you really are my person".'
    },
    bodyColor: 0xbcd9c9,
    finColor: 0xf3d6a0
  },
  {
    id: 'jamal',
    name: { id: 'Jamal', en: 'Jamal' },
    rarity: 'rare',
    biteWindowMs: 700,
    reelMs: 2600,
    story: {
      id: 'Jamal suka ngambek kalau kolamnya berisik. Tapi kalau kamu yang datang, dia keluar.',
      en: 'Jamal sulks when the pond is loud. But when you arrive, he comes out.'
    },
    bodyColor: 0xd96a7c,
    finColor: 0xf0a9b8
  },
  {
    id: 'lele-kecil',
    name: { id: 'Lele kumis', en: 'Whisker catfish' },
    rarity: 'uncommon',
    biteWindowMs: 1100,
    reelMs: 2400,
    story: {
      id: 'Kumisnya panjang, mukanya sok serius. Dia bilang dia jaga kolam, padahal cuma cari makan.',
      en: 'Long whiskers, very serious face. He says he guards the pond, but he is just here for snacks.'
    },
    bodyColor: 0x9a8f7d,
    finColor: 0xc0b39c
  }
];

export function fishById(id: string): FishDef | undefined {
  return FISH.find((fish) => fish.id === id);
}

export type AnimalId = 'cimoy' | 'jamal' | 'anak-ayam';

export interface AnimalDef {
  id: AnimalId;
  role: 'cat' | 'fish' | 'chick';
  defaultName: string;
  label: { id: string; en: string };
  hint: { id: string; en: string };
  home: { x: number; z: number };
}

export const ANIMALS: AnimalDef[] = [
  {
    id: 'cimoy',
    role: 'cat',
    defaultName: 'Cimoy',
    label: { id: 'Cimoy', en: 'Cimoy' },
    hint: {
      id: 'Kucing oranye yang ngikutin kamu ke mana-mana, kecuali kalau lagi tidur.',
      en: 'An orange cat who follows you everywhere, except when napping.'
    },
    home: { x: -3.1, z: -1.2 }
  },
  {
    id: 'jamal',
    role: 'fish',
    defaultName: 'Jamal',
    label: { id: 'Jamal', en: 'Jamal' },
    hint: {
      id: 'Cupang di dalam mangkuk kaca dekat kolam. Sok cuek, padahal suka dilihatin.',
      en: 'A betta in a glass bowl near the pond. Pretends not to care, loves being watched.'
    },
    home: { x: 2.1, z: -4.2 }
  },
  {
    id: 'anak-ayam',
    role: 'chick',
    defaultName: 'Kuning',
    label: { id: 'Anak ayam', en: 'Chick' },
    hint: {
      id: 'Anak ayam kecil yang lari ke arah kamu kalau dipanggil. Namanya bisa kamu ganti.',
      en: 'A tiny chick that runs to you when called. You can rename it.'
    },
    home: { x: -1.4, z: -2.6 }
  }
];

export function animalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((animal) => animal.id === id);
}