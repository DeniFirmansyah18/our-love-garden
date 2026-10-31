import type { LocalizedText } from './config';

export type DecorId =
  | 'photo-frame'
  | 'aquarium'
  | 'flower-pots'
  | 'harvest-shelf'
  | 'garden-lamp'
  | 'reading-bench'
  | 'tea-table'
  | 'picnic-rug';

export const DECOR_IDS: DecorId[] = [
  'photo-frame',
  'aquarium',
  'flower-pots',
  'harvest-shelf',
  'garden-lamp',
  'reading-bench',
  'tea-table',
  'picnic-rug'
];

/** What the item can hold on top of looking pretty. */
export type DecorSpecial = 'photo' | 'fish';

export interface DecorDef {
  id: DecorId;
  name: LocalizedText;
  blurb: LocalizedText;
  /** Coins to buy it once. Owned furniture can be moved forever. */
  price: number;
  /** Radius used as a walk collider while it stands in the yard. */
  collider: number;
  special?: DecorSpecial;
}

export interface DecorSlot {
  x: number;
  z: number;
  /** Facing of the item, in radians. */
  rotation: number;
}

/**
 * Eight anchors in the front yard. The house sits at (-11, -1) and its door
 * faces +X, so the yard is the strip between x -9 and -6. The first four are
 * where the original starter props stood, which keeps old saves looking the same.
 */
export const DECOR_SLOTS: DecorSlot[] = [
  { x: -7.9, z: -4.5, rotation: Math.PI / 2 },
  { x: -7.9, z: -2.5, rotation: Math.PI / 2 + 0.15 },
  { x: -7.7, z: 0.7, rotation: 0 },
  { x: -8.3, z: 2.5, rotation: 0 },
  { x: -6.9, z: -4.9, rotation: Math.PI / 2 },
  { x: -6.5, z: -0.6, rotation: -Math.PI / 2 },
  { x: -7.0, z: 2.9, rotation: 0 },
  { x: -8.9, z: -5.7, rotation: Math.PI / 2 }
];

export const DECOR_ITEMS: DecorDef[] = [
  {
    id: 'photo-frame',
    name: { id: 'Bingkai foto', en: 'Photo frame' },
    blurb: {
      id: 'Bingkai kayu untuk foto kita. Fotonya bisa diganti kapan saja.',
      en: 'A wooden frame for our photo. Swap the picture whenever you like.'
    },
    price: 60,
    collider: 0.5,
    special: 'photo'
  },
  {
    id: 'aquarium',
    name: { id: 'Akuarium', en: 'Aquarium' },
    blurb: {
      id: 'Mangkuk kaca di atas meja. Ikan hasil pancingan boleh tinggal di sini.',
      en: 'A glass bowl on a little table. Any fish you catch may live here.'
    },
    price: 90,
    collider: 0.5,
    special: 'fish'
  },
  {
    id: 'flower-pots',
    name: { id: 'Pot bunga', en: 'Flower pots' },
    blurb: {
      id: 'Dua pot tanah liat yang selalu punya bunga baru.',
      en: 'Two terracotta pots that always have a fresh bloom.'
    },
    price: 45,
    collider: 0.45
  },
  {
    id: 'harvest-shelf',
    name: { id: 'Rak panen', en: 'Harvest shelf' },
    blurb: {
      id: 'Rak kecil untuk menyimpan hasil kebun dan surat-surat pendek.',
      en: 'A small shelf for harvests and short little notes.'
    },
    price: 60,
    collider: 0.7
  },
  {
    id: 'garden-lamp',
    name: { id: 'Lampu taman', en: 'Garden lamp' },
    blurb: {
      id: 'Lampu hangat yang menyala sendiri saat malam datang.',
      en: 'A warm lamp that switches itself on when night falls.'
    },
    price: 80,
    collider: 0.35
  },
  {
    id: 'reading-bench',
    name: { id: 'Bangku baca', en: 'Reading bench' },
    blurb: {
      id: 'Bangku kayu dengan buku yang selalu terbuka di halaman yang sama.',
      en: 'A wooden bench with a book that never leaves the same page.'
    },
    price: 120,
    collider: 0.6
  },
  {
    id: 'tea-table',
    name: { id: 'Meja teh', en: 'Tea table' },
    blurb: {
      id: 'Meja rendah dengan dua bantal dan teko yang masih hangat.',
      en: 'A low table with two cushions and a pot that is still warm.'
    },
    price: 75,
    collider: 0.45
  },
  {
    id: 'picnic-rug',
    name: { id: 'Tikar piknik', en: 'Picnic rug' },
    blurb: {
      id: 'Tikar anyaman untuk duduk berdua tanpa harus jauh-jauh ke hutan.',
      en: 'A woven rug for sitting together without walking to the forest.'
    },
    price: 55,
    collider: 0
  }
];

export function decorById(id: string): DecorDef | undefined {
  return DECOR_ITEMS.find((item) => item.id === id);
}

export function isDecorId(value: unknown): value is DecorId {
  return typeof value === 'string' && (DECOR_IDS as string[]).includes(value);
}

export interface DecorPlacement {
  /** Index into DECOR_SLOTS. */
  slot: number;
  item: string;
  /** Which photo the frame shows, as an index into LOVE.photos. */
  photo: number;
  /** Fish id living in the aquarium, or null when it is empty. */
  fish: string | null;
}

export interface DecorState {
  /** Furniture the couple owns. Buying is permanent. */
  owned: string[];
  placed: DecorPlacement[];
}

export const STARTER_DECOR: string[] = ['harvest-shelf', 'photo-frame', 'aquarium', 'flower-pots'];

export function defaultDecor(): DecorState {
  return {
    owned: [...STARTER_DECOR],
    placed: [
      { slot: 0, item: 'harvest-shelf', photo: 0, fish: null },
      { slot: 1, item: 'photo-frame', photo: 0, fish: null },
      { slot: 2, item: 'aquarium', photo: 0, fish: null },
      { slot: 3, item: 'flower-pots', photo: 0, fish: null }
    ]
  };
}
