export type CropKind = 'flower' | 'vegetable' | 'fruit';

/** Which procedural shape the mature crop renders as. Defaults by kind. */
export type CropShape =
  | 'bloom'
  | 'tulip'
  | 'spike'
  | 'puff'
  | 'carrot'
  | 'tomato'
  | 'cob'
  | 'eggplant'
  | 'leafy'
  | 'berry'
  | 'melon'
  | 'apple'
  | 'grapes'
  | 'peach';

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
  shape?: CropShape;
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
      shape: 'bloom',
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
      bloomColor: 0xf2c14e,
      shape: 'bloom'
    },
    {
      id: 'tulip',
      kind: 'flower',
      name: { id: 'Tulip', en: 'Tulip' },
      growSeconds: 46,
      stages: 4,
      seedCost: 14,
      sellPrice: 34,
      leafColor: 0x9aa878,
      bloomColor: 0xe58db8,
      shape: 'tulip',
      favoriteOf: 'bubu'
    },
    {
      id: 'lavender',
      kind: 'flower',
      name: { id: 'Lavender', en: 'Lavender' },
      growSeconds: 54,
      stages: 4,
      seedCost: 15,
      sellPrice: 38,
      leafColor: 0x8fae78,
      bloomColor: 0x9d8bd6,
      shape: 'spike',
      favoriteOf: 'dudu'
    },
    {
      id: 'sakura-mini',
      kind: 'flower',
      name: { id: 'Sakura mini', en: 'Mini sakura' },
      growSeconds: 66,
      stages: 5,
      seedCost: 20,
      sellPrice: 50,
      leafColor: 0x9aa878,
      bloomColor: 0xf7c3d2,
      shape: 'puff',
      favoriteOf: 'bubu'
    },
    {
      id: 'bunga-rahasia',
      kind: 'flower',
      name: { id: 'Bunga rahasia', en: 'Secret flower' },
      growSeconds: 90,
      stages: 5,
      seedCost: 40,
      sellPrice: 120,
      leafColor: 0x7fa36a,
      bloomColor: 0xb9a3e8,
      shape: 'puff',
      favoriteOf: 'dudu'
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
      bloomColor: 0xe2666f,
      shape: 'berry'
    },
    {
      id: 'semangka',
      kind: 'fruit',
      name: { id: 'Semangka', en: 'Watermelon' },
      growSeconds: 78,
      stages: 4,
      seedCost: 22,
      sellPrice: 64,
      leafColor: 0x7fa36a,
      bloomColor: 0x69b568,
      shape: 'melon'
    },
    {
      id: 'apel',
      kind: 'fruit',
      name: { id: 'Apel', en: 'Apple' },
      growSeconds: 70,
      stages: 4,
      seedCost: 20,
      sellPrice: 58,
      leafColor: 0x86ab74,
      bloomColor: 0xd95a4a,
      shape: 'apple'
    },
    {
      id: 'anggur',
      kind: 'fruit',
      name: { id: 'Anggur', en: 'Grapes' },
      growSeconds: 74,
      stages: 4,
      seedCost: 24,
      sellPrice: 70,
      leafColor: 0x8fae78,
      bloomColor: 0x8a63c9,
      shape: 'grapes'
    },
    {
      id: 'persik',
      kind: 'fruit',
      name: { id: 'Persik', en: 'Peach' },
      growSeconds: 72,
      stages: 4,
      seedCost: 24,
      sellPrice: 68,
      leafColor: 0x9aa878,
      bloomColor: 0xf5a48a,
      shape: 'peach'
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
      shape: 'carrot',
      favoriteOf: 'dudu'
    },
    {
      id: 'tomat',
      kind: 'vegetable',
      name: { id: 'Tomat', en: 'Tomato' },
      growSeconds: 52,
      stages: 3,
      seedCost: 13,
      sellPrice: 34,
      leafColor: 0x7fa36a,
      bloomColor: 0xe0564c,
      shape: 'tomato'
    },
    {
      id: 'jagung',
      kind: 'vegetable',
      name: { id: 'Jagung', en: 'Corn' },
      growSeconds: 62,
      stages: 4,
      seedCost: 16,
      sellPrice: 40,
      leafColor: 0x9aa878,
      bloomColor: 0xf2c14e,
      shape: 'cob'
    },
    {
      id: 'terong',
      kind: 'vegetable',
      name: { id: 'Terong', en: 'Eggplant' },
      growSeconds: 58,
      stages: 3,
      seedCost: 15,
      sellPrice: 38,
      leafColor: 0x8fae78,
      bloomColor: 0x8a5f9e,
      shape: 'eggplant',
      favoriteOf: 'dudu'
    },
    {
      id: 'bayam',
      kind: 'vegetable',
      name: { id: 'Bayam', en: 'Spinach' },
      growSeconds: 40,
      stages: 3,
      seedCost: 9,
      sellPrice: 24,
      leafColor: 0x5d8a4e,
      bloomColor: 0x5d8a4e,
      shape: 'leafy'
    }
  ];

export function cropById(id: string | null | undefined): CropDef | undefined {
  if (!id) return undefined;
  return CROPS.find((crop) => crop.id === id);
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
    home: { x: -8, z: 3.4 }
  },
  {
    id: 'jamal',
    role: 'fish',
    defaultName: 'Jamal',
    label: { id: 'Jamal', en: 'Jamal' },
    hint: {
          id: 'Cupang di dalam mangkuk kaca dekat dermaga. Sok cuek, padahal suka dilihatin.',
          en: 'A betta in a glass bowl near the dock. Pretends not to care, loves being watched.'
    },
        home: { x: 2.6, z: -8.9 }
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
    home: { x: 7, z: 5 }
  }
];

export function animalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((animal) => animal.id === id);
}