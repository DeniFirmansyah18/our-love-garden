import type { LocalizedText } from './config';

export type FishTier = 'common' | 'rare' | 'secret';
export type BaitId = 'bait-cacing' | 'bait-roti' | 'bait-bunga' | 'bait-hati';
export type WaterSpot = 'tepi' | 'tengah' | 'teratai';
export type DayTime = 'day' | 'night';

export interface FishNeeds {
  bait?: BaitId;
  time?: DayTime;
  spot?: WaterSpot;
  /** Memory chest id that must be open first. */
  memory?: string;
  minCatches?: number;
}

export interface FishDef {
  id: string;
  tier: FishTier;
  name: LocalizedText;
  /** Size range in cm; the caught size is rolled inside it. */
  sizeMin: number;
  sizeMax: number;
  sell: number;
  bodyColor: number;
  finColor: number;
  story: LocalizedText;
  /** Shown under a locked silhouette. */
  hint: LocalizedText;
  /** Hard requirements; the fish never appears without them. */
  needs?: FishNeeds;
  /** Baits the fish likes; multiplies its weight. */
  baits?: BaitId[];
  /** How hard it pulls during the reel, 0.45 (gentle) to 1.2 (strong). */
  pull: number;
  /** Milliseconds of holding needed to land it. */
  reelMs: number;
}

export const BAITS: Array<{
  id: BaitId;
  name: LocalizedText;
  price: number;
  color: number;
  note: LocalizedText;
}> = [
  {
    id: 'bait-cacing',
    name: { id: 'Cacing', en: 'Worm' },
    price: 0,
    color: 0xc98a6a,
    note: { id: 'Selalu tersedia. Semua ikan biasa suka.', en: 'Always available. Every common fish likes it.' }
  },
  {
    id: 'bait-roti',
    name: { id: 'Roti', en: 'Bread' },
    price: 8,
    color: 0xf3d6a0,
    note: { id: 'Favorit ikan kecil dan ikan balon.', en: 'A favourite of small fish and balloon fish.' }
  },
  {
    id: 'bait-bunga',
    name: { id: 'Kelopak bunga', en: 'Flower petals' },
    price: 12,
    color: 0xf0a9b8,
    note: { id: 'Ikan cantik dan ikan sakura datang untuk ini.', en: 'Pretty fish and sakura fish come for this.' }
  },
  {
    id: 'bait-hati',
    name: { id: 'Umpan hati', en: 'Heart bait' },
    price: 30,
    color: 0xe2666f,
    note: { id: 'Buat ikan yang hanya datang kalau umpannya tulus.', en: 'For fish that only come when the bait is sincere.' }
  }
];

export function baitById(id: string) {
  return BAITS.find((bait) => bait.id === id);
}

export const BAIT_WORM: BaitId = 'bait-cacing';

export const FISH: FishDef[] = [
  // ---- common ----
  {
    id: 'ikan-mas',
    tier: 'common',
    name: { id: 'Ikan mas', en: 'Goldfish' },
    sizeMin: 12,
    sizeMax: 34,
    sell: 12,
    bodyColor: 0xe8923f,
    finColor: 0xf3b56a,
    story: {
      id: 'Ikan pertama yang pernah kita lihat bareng di danau ini. Katanya pembawa rezeki.',
      en: 'The first fish we ever watched together at this lake. Supposedly lucky.'
    },
    hint: { id: 'Muncul kapan saja, dengan umpan apa pun.', en: 'Shows up anytime, on any bait.' },
    pull: 0.5,
    reelMs: 1500
  },
  {
    id: 'ikan-pastel',
    tier: 'common',
    name: { id: 'Ikan pastel', en: 'Pastel fish' },
    sizeMin: 6,
    sizeMax: 16,
    sell: 10,
    bodyColor: 0xcfe3f2,
    finColor: 0xe8f2fa,
    story: {
      id: 'Warnanya kayak langit sore. Dudu bilang ikan ini pasti juga suka lihat kamu senyum.',
      en: 'Coloured like an evening sky. Dudu says this fish must also like watching you smile.'
    },
    hint: { id: 'Muncul kapan saja, dengan umpan apa pun.', en: 'Shows up anytime, on any bait.' },
    pull: 0.45,
    reelMs: 1300
  },
  {
    id: 'cupang-biru',
    tier: 'common',
    name: { id: 'Cupang biru', en: 'Blue betta' },
    sizeMin: 5,
    sizeMax: 12,
    sell: 14,
    bodyColor: 0x7fb2d9,
    finColor: 0xa9d0e8,
    story: {
      id: 'Ikan yang paling sering main ke kolam kita. Warnanya mirip langit sore pas kamu senyum.',
      en: 'The fish that visits our pond most often. Its colour matches the evening sky when you smile.'
    },
    hint: { id: 'Muncul kapan saja, dengan umpan apa pun.', en: 'Shows up anytime, on any bait.' },
    pull: 0.55,
    reelMs: 1600
  },
  {
    id: 'koi-krem',
    tier: 'common',
    name: { id: 'Koi krem', en: 'Cream koi' },
    sizeMin: 22,
    sizeMax: 52,
    sell: 16,
    bodyColor: 0xf7e3c4,
    finColor: 0xefc79a,
    story: {
      id: 'Koi yang katanya bawa keberuntungan. Aku percaya, soalnya aku ketemu kamu.',
      en: 'A koi that supposedly brings luck. I believe it, because I found you.'
    },
    hint: { id: 'Muncul kapan saja, dengan umpan apa pun.', en: 'Shows up anytime, on any bait.' },
    pull: 0.65,
    reelMs: 2100
  },
  {
    id: 'lele-kecil',
    tier: 'common',
    name: { id: 'Lele kumis', en: 'Whisker catfish' },
    sizeMin: 18,
    sizeMax: 44,
    sell: 12,
    bodyColor: 0x9a8f7d,
    finColor: 0xc0b39c,
    story: {
      id: 'Kumisnya panjang, mukanya sok serius. Dia bilang dia jaga danau, padahal cuma cari makan.',
      en: 'Long whiskers, very serious face. He says he guards the lake, but he is just here for snacks.'
    },
    hint: { id: 'Muncul kapan saja, dengan umpan apa pun.', en: 'Shows up anytime, on any bait.' },
    pull: 0.7,
    reelMs: 2300
  },
  {
    id: 'ikan-balon',
    tier: 'common',
    name: { id: 'Ikan balon', en: 'Balloon fish' },
    sizeMin: 9,
    sizeMax: 22,
    sell: 13,
    bodyColor: 0xf2d8a0,
    finColor: 0xf7e6c2,
    story: {
      id: 'Kalau kaget dia mengembang kayak bola. Kamu juga gitu pas kaget kemarin, lucu banget.',
      en: 'When startled it puffs up like a ball. You did the same thing yesterday; adorable.'
    },
    hint: { id: 'Suka roti yang direndam air.', en: 'Likes bread soaked in water.' },
    baits: ['bait-roti'],
    pull: 0.5,
    reelMs: 1500
  },
  {
    id: 'ikan-ceper',
    tier: 'common',
    name: { id: 'Ikan cepor', en: 'Flounder' },
    sizeMin: 14,
    sizeMax: 30,
    sell: 11,
    bodyColor: 0xd8cfc0,
    finColor: 0xe9dcc6,
    story: {
      id: 'Ikan yang tidurnya nyamping. Aku juga gitu kalau tidur di rumahmu, kan?',
      en: 'A fish that sleeps on its side. I do that too when I nap at your place, right?'
    },
    hint: { id: 'Sering muncul di tepi danau.', en: 'Often shows up near the shore.' },
    pull: 0.5,
    reelMs: 1600
  },
  {
    id: 'ikan-pelangi',
    tier: 'common',
    name: { id: 'Ikan pelangi', en: 'Rainbow fish' },
    sizeMin: 8,
    sizeMax: 20,
    sell: 15,
    bodyColor: 0x9fd3a8,
    finColor: 0xc4e8c9,
    story: {
      id: 'Kilauannya ganti-ganti warna. Kayak perasaanku tiap kamu bilang sayang.',
      en: 'Its shimmer keeps changing colour. Like my feelings every time you say you love me.'
    },
    hint: { id: 'Suka umpan kelopak bunga.', en: 'Likes flower-petal bait.' },
    baits: ['bait-bunga', 'bait-roti'],
    pull: 0.55,
    reelMs: 1700
  },
  // ---- rare ----
  {
    id: 'jamal',
    tier: 'rare',
    name: { id: 'Jamal', en: 'Jamal' },
    sizeMin: 6,
    sizeMax: 11,
    sell: 30,
    bodyColor: 0xd96a7c,
    finColor: 0xf0a9b8,
    story: {
      id: 'Jamal suka ngambek kalau danunya berisik. Tapi kalau kamu yang datang, dia keluar.',
      en: 'Jamal sulks when the lake is loud. But when you arrive, he comes out.'
    },
    hint: { id: 'Tinggal di area teratai. Umpan apa pun boleh, yang penting lokasinya.', en: 'Lives around the lilies. Any bait works, the spot matters.' },
    needs: { spot: 'teratai' },
    pull: 0.8,
    reelMs: 2400
  },
  {
    id: 'koi-hati',
    tier: 'rare',
    name: { id: 'Koi hati', en: 'Heart koi' },
    sizeMin: 28,
    sizeMax: 58,
    sell: 38,
    bodyColor: 0xe28aa0,
    finColor: 0xf8cdd6,
    story: {
      id: 'Punya corak hati di sisinya. Aku yakin ini ikan yang ditugaskan buat kita.',
      en: 'It has a heart pattern on its side. I am convinced this fish was assigned to us.'
    },
    hint: { id: 'Hanya mau menyentuh umpan hati.', en: 'Only touches the heart bait.' },
    needs: { bait: 'bait-hati' },
    pull: 0.9,
    reelMs: 2600
  },
  {
    id: 'ikan-lentera',
    tier: 'rare',
    name: { id: 'Ikan lentera', en: 'Lantern fish' },
    sizeMin: 16,
    sizeMax: 38,
    sell: 34,
    bodyColor: 0xf7d59a,
    finColor: 0xffe6b0,
    story: {
      id: 'Sisinya berpendar kayak lentera finale. Aku nyimpen cahayanya buat kamu.',
      en: 'Its scales glow like the finale lanterns. I am saving its light for you.'
    },
    hint: { id: 'Baru muncul setelah matahari tenggelam.', en: 'Only appears after sundown.' },
    needs: { time: 'night' },
    pull: 0.85,
    reelMs: 2500
  },
  {
    id: 'ikan-sakura',
    tier: 'rare',
    name: { id: 'Ikan sakura', en: 'Sakura fish' },
    sizeMin: 12,
    sizeMax: 30,
    sell: 32,
    bodyColor: 0xf8cdd6,
    finColor: 0xfde8ec,
    story: {
      id: 'Kelopak sakura suka nempel di punggungnya. Dia juga, kayaknya, suka sama kamu.',
      en: 'Sakura petals like to rest on its back. It, apparently, likes you too.'
    },
    hint: { id: 'Datang untuk kelopak bunga, atau pagi di area teratai.', en: 'Comes for flower petals, or mornings near the lilies.' },
    baits: ['bait-bunga'],
    pull: 0.75,
    reelMs: 2200
  },
  {
    id: 'ikan-bintang',
    tier: 'rare',
    name: { id: 'Ikan bintang', en: 'Star fish' },
    sizeMin: 14,
    sizeMax: 34,
    sell: 36,
    bodyColor: 0xc9d4f2,
    finColor: 0xe4ecfb,
    story: {
      id: 'Katanya dia jatuh dari langit pas kita lihat bintang bareng. Aku nggak berani cek.',
      en: 'They say it fell from the sky the night we watched stars together. I dare not check.'
    },
    hint: { id: 'Malam hari, di tengah danau.', en: 'At night, in the middle of the lake.' },
    needs: { time: 'night', spot: 'tengah' },
    pull: 0.95,
    reelMs: 2700
  },
  // ---- secret ----
  {
    id: 'ikan-panda',
    tier: 'secret',
    name: { id: 'Ikan Panda', en: 'Panda fish' },
    sizeMin: 40,
    sizeMax: 88,
    sell: 90,
    bodyColor: 0xffffff,
    finColor: 0x4a1f1a,
    story: {
      id: 'Motifnya sama persis kayak kamu: putih dengan telinga gelap. Dudu nangis waktu lihat ini.',
      en: 'Its pattern is exactly like yours: white with dark ears. Dudu cried when he saw it.'
    },
    hint: { id: 'Malam hari, umpan hati, di area teratai.', en: 'At night, with heart bait, near the lilies.' },
    needs: { time: 'night', bait: 'bait-hati', spot: 'teratai' },
    pull: 1.1,
    reelMs: 3000
  },
  {
    id: 'ikan-dudu',
    tier: 'secret',
    name: { id: 'Ikan Dudu', en: 'Dudu cod' },
    sizeMin: 34,
    sizeMax: 72,
    sell: 85,
    bodyColor: 0xd9a58c,
    finColor: 0xb07a60,
    story: {
      id: 'Mukanya mirip Dudu waktu malu. Aku sempat minta maaf ke ikannya karena salah panggil.',
      en: 'Its face looks like Dudu when he is shy. I apologised to the fish for calling it the wrong name.'
    },
    hint: { id: 'Malam hari, umpan cacing, di tengah danau.', en: 'At night, with a worm, in the middle of the lake.' },
    needs: { time: 'night', bait: 'bait-cacing', spot: 'tengah' },
    pull: 1.05,
    reelMs: 2900
  },
  {
    id: 'cupang-jamal-legend',
    tier: 'secret',
    name: { id: 'Cupang Jamal Legendaris', en: 'Legendary Jamal betta' },
    sizeMin: 8,
    sizeMax: 14,
    sell: 80,
    bodyColor: 0xb3547a,
    finColor: 0xf0a9b8,
    story: {
      id: 'Katanya kerabat Jamal yang pergi keliling danau. Dia balik kalau kenangan tentang Jamal sudah dibuka.',
      en: 'Supposedly Jamal\'s relative who travels the lake. It returns once Jamal\'s memory is open.'
    },
    hint: { id: 'Buka kenangan "Kolam kita", lalu umpan kelopak bunga di teratai.', en: 'Open the "Our pond" memory, then use petals near the lilies.' },
    needs: { memory: 'kolam', bait: 'bait-bunga', spot: 'teratai' },
    pull: 1.0,
    reelMs: 2800
  },
  {
    id: 'lentera-emas',
    tier: 'secret',
    name: { id: 'Ikan lentera emas', en: 'Golden lantern fish' },
    sizeMin: 26,
    sizeMax: 60,
    sell: 120,
    bodyColor: 0xf2c14e,
    finColor: 0xffe9a8,
    story: {
      id: 'Cahayanya hangat kayak lampu taman kita. Katanya dia cuma mampir ke danau yang paling dicintai.',
      en: 'Its light is as warm as our garden lamp. They say it only visits the most beloved lakes.'
    },
    hint: { id: 'Siang hari, umpan hati, di tengah danau. Butuh ketekunan.', en: 'Daytime, heart bait, middle of the lake. Takes patience.' },
    needs: { time: 'day', bait: 'bait-hati', spot: 'tengah' },
    pull: 1.15,
    reelMs: 3200
  }
];

export function fishById(id: string): FishDef | undefined {
  return FISH.find((fish) => fish.id === id);
}

export interface JunkDef {
  id: string;
  name: LocalizedText;
  sell: number;
  color: number;
  story: LocalizedText;
}

export const JUNK: JunkDef[] = [
  {
    id: 'sepatu-bekas',
    name: { id: 'Sepatu bekas', en: 'Old shoe' },
    sell: 4,
    color: 0x9a8f7d,
    story: {
      id: 'Ukurannya kecil. Dudu bilang mungkin punya ikan yang juga suka jalan-jalan.',
      en: 'It is tiny. Dudu says it may belong to a fish that also enjoys walks.'
    }
  },
  {
    id: 'botol-pesan',
    name: { id: 'Botol pesan', en: 'Message bottle' },
    sell: 8,
    color: 0xbcd9c9,
    story: {
      id: 'Isinya satu kalimat: "kalau kamu nemu ini, berarti kamu memang jodohku".',
      en: 'Inside, one line: "if you found this, you really are my person".'
    }
  },
  {
    id: 'bintang-laut',
    name: { id: 'Bintang laut', en: 'Starfish' },
    sell: 6,
    color: 0xf0a9b8,
    story: {
      id: 'Bintang laut yang tersesat ke danau. Dudu ngasih nama: Bintang Jihan.',
      en: 'A starfish lost in a lake. Dudu named it: Jihan\'s Star.'
    }
  }
];

export function junkById(id: string): JunkDef | undefined {
  return JUNK.find((junk) => junk.id === id);
}

export const TIER_WEIGHT: Record<FishTier, number> = {
  common: 5,
  rare: 2.2,
  secret: 0.55
};

export function baitBonus(fish: FishDef, bait: BaitId): number {
  if (fish.needs?.bait) return fish.needs.bait === bait ? 1 : 0;
  if (fish.baits?.includes(bait)) return 2.4;
  return 1;
}

/**
 * Whether a fish may appear right now. Requirements are hard gates; bait
 * preference is soft and handled by weights.
 */
export function fishAvailable(
  fish: FishDef,
  bait: BaitId,
  time: DayTime,
  spot: WaterSpot,
  context: { memories: string[]; totalCatches: number }
): boolean {
  const needs = fish.needs;
  if (!needs) return true;
  if (needs.bait && needs.bait !== bait) return false;
  if (needs.time && needs.time !== time) return false;
  if (needs.spot && needs.spot !== spot) return false;
  if (needs.memory && !context.memories.includes(needs.memory)) return false;
  if (needs.minCatches && context.totalCatches < needs.minCatches) return false;
  return true;
}