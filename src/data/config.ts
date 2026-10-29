export interface LocalizedText {
  id: string;
  en: string;
}

export const LANGS = ['id', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const QUALITIES = ['auto', 'sharp', 'saver'] as const;
export type Quality = (typeof QUALITIES)[number];

export const BUBU_ACCESSORIES = ['none', 'straw', 'flower-band', 'scarf', 'glasses'] as const;
export type BubuAccessory = (typeof BUBU_ACCESSORIES)[number];

export const DUDU_ACCESSORIES = ['none', 'leaf-hat', 'bowtie', 'flower-crown'] as const;
export type DuduAccessory = (typeof DUDU_ACCESSORIES)[number];

export const RIBBONS = [
  { id: 'rose', hex: '#EA8FA6', label: { id: 'Mawar', en: 'Rose' } },
  { id: 'cherry', hex: '#D96A7C', label: { id: 'Ceri', en: 'Cherry' } },
  { id: 'cocoa', hex: '#6B3A33', label: { id: 'Cokelat', en: 'Cocoa' } },
  { id: 'cream', hex: '#FFF1DA', label: { id: 'Krim', en: 'Cream' } }
] as const;
export type RibbonId = (typeof RIBBONS)[number]['id'];

export interface AccessoryOption<T extends string> {
  id: T;
  label: LocalizedText;
  icon: string;
  locked?: boolean;
}

export const BUBU_ACCESSORY_META: AccessoryOption<BubuAccessory>[] = [
  { id: 'none', label: { id: 'Tanpa aksesori', en: 'No accessory' }, icon: 'none' },
  { id: 'straw', label: { id: 'Topi jerami', en: 'Straw hat' }, icon: 'straw' },
  { id: 'flower-band', label: { id: 'Bando bunga', en: 'Flower band' }, icon: 'band' },
  { id: 'scarf', label: { id: 'Syal hangat', en: 'Warm scarf' }, icon: 'scarf' },
  { id: 'glasses', label: { id: 'Kacamata', en: 'Glasses' }, icon: 'glasses' }
];

export const DUDU_ACCESSORY_META: AccessoryOption<DuduAccessory>[] = [
  { id: 'none', label: { id: 'Tanpa aksesori', en: 'No accessory' }, icon: 'none' },
  { id: 'leaf-hat', label: { id: 'Topi daun', en: 'Leaf hat' }, icon: 'leaf' },
  { id: 'bowtie', label: { id: 'Dasi kupu', en: 'Bow tie' }, icon: 'bowtie' },
  {
    id: 'flower-crown',
    label: { id: 'Mahkota bunga', en: 'Flower crown' },
    icon: 'crown',
    locked: true
  }
];

export const LOVE = {
  title: 'Our Love Garden',
  tagline: 'Deni & Jihan',
  playerRealName: 'Jihan',
  companionRealName: 'Deni',
  bubuNickname: 'adek ihankuu',
  duduNickname: 'mas denikuu',
  bubuBirthday: { month: 7, day: 12 },
  duduBirthday: { month: 10, day: 18 },
  photos: ['foto-1.jpg', 'foto-2.jpg', 'foto-3.jpg', 'foto-4.jpg']
} as const;

export const ISLAND = {
  radius: 14.2,
  walkRadius: 13.4,
  groundY: 1.05,
  dayLengthSeconds: 300,
  startTime: 0.2
} as const;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function isQuality(value: unknown): value is Quality {
  return typeof value === 'string' && (QUALITIES as readonly string[]).includes(value);
}

export function isBubuAccessory(value: unknown): value is BubuAccessory {
  return typeof value === 'string' && (BUBU_ACCESSORIES as readonly string[]).includes(value);
}

export function isDuduAccessory(value: unknown): value is DuduAccessory {
  return typeof value === 'string' && (DUDU_ACCESSORIES as readonly string[]).includes(value);
}

export function isRibbon(value: unknown): value is RibbonId {
  return RIBBONS.some((ribbon) => ribbon.id === value);
}

export function ribbonHex(id: RibbonId): string {
  return RIBBONS.find((ribbon) => ribbon.id === id)?.hex ?? RIBBONS[0].hex;
}