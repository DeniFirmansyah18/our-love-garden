import type { LocalizedText } from './config';

export type ZoneId = 'garden' | 'home' | 'lake' | 'forest' | 'hill' | 'beach' | 'cave';

export const ZONE_IDS: ZoneId[] = ['garden', 'home', 'lake', 'forest', 'hill', 'beach', 'cave'];

export interface ZoneDef {
  id: ZoneId;
  name: LocalizedText;
  blurb: LocalizedText;
  hint: LocalizedText;
  center: { x: number; z: number };
  radius: number;
  /** Opened from the first second, by walking in, or after N memories. */
  unlock: 'start' | 'proximity' | { memories: number };
  /** Where fast travel drops the player. */
  arrival: { x: number; z: number };
  color: number;
  fogColor: number;
}

export const ZONES: ZoneDef[] = [
  {
    id: 'garden',
    name: { id: 'Taman Bunga & Kebun Kami', en: 'Our Flower Garden' },
    blurb: {
      id: 'Petak tanam, kincir angin kecil, dan bunga pertama yang kita tanam bareng.',
      en: 'Garden beds, a little windmill, and the first flower we planted together.'
    },
    hint: { id: 'Di timur pelataran.', en: 'East of the plaza.' },
    center: { x: 9, z: 2 },
    radius: 8,
    unlock: 'start',
    arrival: { x: 5.8, z: 2.6 },
    color: 0xe28aa0,
    fogColor: 0xfde8ec
  },
  {
    id: 'home',
    name: { id: 'Rumah Kecil Kami', en: 'Our Little House' },
    blurb: {
      id: 'Rumah miring yang sengaja dibangun miring, dan patung kecil kita di halamannya.',
      en: 'A crooked little house built crooked on purpose, with our tiny statues outside.'
    },
    hint: { id: 'Di barat pelataran.', en: 'West of the plaza.' },
    center: { x: -11, z: -1 },
    radius: 8,
    unlock: 'start',
    arrival: { x: -9.6, z: 2.4 },
    color: 0xd9a58c,
    fogColor: 0xfbe6cf
  },
  {
    id: 'lake',
    name: { id: 'Danau Cinta', en: 'Love Lake' },
    blurb: {
      id: 'Danau besar dengan dermaga kayu, perahu kecil, dan teratai yang suka disembunyikan Jamal.',
      en: 'A big lake with a wooden dock, a little boat, and lilies Jamal likes to hide under.'
    },
    hint: { id: 'Jalan ke utara sampai ujung.', en: 'Walk north until the path ends.' },
    center: { x: 0, z: -16 },
    radius: 9,
    unlock: 'proximity',
    arrival: { x: 0, z: -8.2 },
    color: 0x7bbcc0,
    fogColor: 0xd9eef0
  },
  {
    id: 'forest',
    name: { id: 'Hutan Kunang-kunang', en: 'Firefly Forest' },
    blurb: {
      id: 'Pohon raksasa, jamur bercahaya, dan tikar piknik yang selalu siap untuk dua orang.',
      en: 'Giant trees, glowing mushrooms, and a picnic blanket always ready for two.'
    },
    hint: { id: 'Ke barat daya, di balik pepohonan.', en: 'Southwest, past the trees.' },
    center: { x: -16, z: 10 },
    radius: 8,
    unlock: 'proximity',
    arrival: { x: -13.4, z: 8.2 },
    color: 0x7d9a6a,
    fogColor: 0xdfe9d3
  },
  {
    id: 'hill',
    name: { id: 'Bukit Angin', en: 'Windy Hill' },
    blurb: {
      id: 'Padang luas tempat layang-layang, dan bangku yang menghadap matahari terbenam.',
      en: 'A wide meadow for kites, and a bench facing the sunset.'
    },
    hint: { id: 'Ke tenggara, naik sedikit.', en: 'Southeast, a small climb.' },
    center: { x: 13, z: 15 },
    radius: 9,
    unlock: 'proximity',
    arrival: { x: 11.5, z: 12.2 },
    color: 0xf2c14e,
    fogColor: 0xfdf1dc
  },
  {
    id: 'beach',
    name: { id: 'Pantai Pasir Pink', en: 'Pink Sand Beach' },
    blurb: {
      id: 'Kerang, kepiting kecil, tulisan nama di pasir, dan jembatan ke pulau mungil.',
      en: 'Shells, a tiny crab, our names in the sand, and a bridge to a tiny island.'
    },
    hint: { id: 'Ke timur sampai bertemu pasir.', en: 'East until the sand starts.' },
    center: { x: 25, z: 2 },
    radius: 8.5,
    unlock: 'proximity',
    arrival: { x: 23.2, z: 2.2 },
    color: 0xf3d4b6,
    fogColor: 0xfdeee2
  },
  {
    id: 'cave',
    name: { id: 'Gua Kristal', en: 'Crystal Cave' },
    blurb: {
      id: 'Tersembunyi di balik batu. Katanya isinya ikan langka dan cahaya yang tidak masuk akal.',
      en: 'Hidden behind the rocks. They say it holds rare fish and impossible light.'
    },
    hint: { id: 'Buka tiga kenangan dulu, lalu cari di barat laut.', en: 'Open three memories first, then look northwest.' },
    center: { x: -21, z: -13 },
    radius: 6,
    unlock: { memories: 3 },
    arrival: { x: -19.4, z: -11.2 },
    color: 0x9f8ad6,
    fogColor: 0xe4dcf6
  }
];

export function zoneById(id: string): ZoneDef | undefined {
  return ZONES.find((zone) => zone.id === id);
}

export interface SpotDef {
  id: string;
  zone: ZoneId;
  name: LocalizedText;
  blurb: LocalizedText;
  position: { x: number; z: number };
  radius: number;
  reward?: { coins: number };
}

export const SPOTS: SpotDef[] = [
  {
    id: 'bench-romantic',
    zone: 'hill',
    name: { id: 'Bangku romantis', en: 'The romantic bench' },
    blurb: {
      id: 'Satu bangku, dua orang, satu matahari terbenam. Dudu bilang ini kursi paling mahal di pulau.',
      en: 'One bench, two people, one sunset. Dudu says it is the most expensive seat on the island.'
    },
    position: { x: 15.5, z: 12.2 },
    radius: 2.4,
    reward: { coins: 15 }
  },
  {
    id: 'mini-pond',
    zone: 'forest',
    name: { id: 'Kolam kecil', en: 'The little pond' },
    blurb: {
      id: 'Kolam seukuran bak mandi. Katanya ada ikan yang tinggal di sini karena tidak mau jauh dari kita.',
      en: 'A pond the size of a bathtub. A fish supposedly lives here because it refuses to be far from us.'
    },
    position: { x: -19.5, z: 12.2 },
    radius: 2.2,
    reward: { coins: 15 }
  },
  {
    id: 'garden-lamp',
    zone: 'garden',
    name: { id: 'Lampu taman', en: 'The garden lamp' },
    blurb: {
      id: 'Lampu pertama yang kita pasang. Sampai sekarang masih nyala tiap malam, tidak pernah minta ganti.',
      en: 'The first lamp we installed. It still turns on every night and never asks for a replacement.'
    },
    position: { x: 5.5, z: 5.5 },
    radius: 2.2,
    reward: { coins: 10 }
  },
  {
    id: 'statues',
    zone: 'home',
    name: { id: 'Patung panda & beruang', en: 'Panda and bear statues' },
    blurb: {
      id: 'Patung kita berdua, dibuat pas aku kangen dan nggak bisa ketemu kamu.',
      en: 'Statues of us, made on a day I missed you and could not come over.'
    },
    position: { x: -14.5, z: 2.5 },
    radius: 2.4,
    reward: { coins: 15 }
  },
  {
    id: 'sand-names',
    zone: 'beach',
    name: { id: 'Tulisan di pasir', en: 'Names in the sand' },
    blurb: {
      id: 'Deni & Jihan, ditulis agak miring. Ombak menghapusnya tiap pagi, dan aku menulisnya lagi.',
      en: 'Deni & Jihan, written a little crooked. The tide erases it every morning, and I write it again.'
    },
    position: { x: 26.5, z: 4.5 },
    radius: 2.6,
    reward: { coins: 20 }
  },
  {
    id: 'wild-cat',
    zone: 'beach',
    name: { id: 'Kucing liar', en: 'The stray cat' },
    blurb: {
      id: 'Kucing oranye yang tidak mau pulang. Dudu bilang dia mirip Cimoy, cuma lebih sok sibuk.',
      en: 'An orange cat who refuses to go home. Dudu says it is like Cimoy, only busier.'
    },
    position: { x: 24.5, z: 0.5 },
    radius: 2.4,
    reward: { coins: 15 }
  },
  {
    id: 'picnic-spot',
    zone: 'forest',
    name: { id: 'Tikar piknik', en: 'The picnic blanket' },
    blurb: {
      id: 'Tikar yang selalu terhampar. Kalau kamu duduk, Dudu langsung datang bawa dua roti.',
      en: 'A blanket that is always laid out. Sit down and Dudu appears with two sandwiches.'
    },
    position: { x: -14.5, z: 12 },
    radius: 2.4,
    reward: { coins: 20 }
  },
  {
    id: 'lily-spot',
    zone: 'lake',
    name: { id: 'Teratai Jamal', en: "Jamal's lilies" },
    blurb: {
      id: 'Teratai tempat Jamal sembunyi kalau lagi malu. Jangan bilang dia yang ngasih tahu.',
      en: 'The lilies Jamal hides under when he is shy. Do not tell him I told you.'
    },
    position: { x: 2.2, z: -13.2 },
    radius: 2.6,
    reward: { coins: 15 }
  },
  {
    id: 'kite-spot',
    zone: 'hill',
    name: { id: 'Layang-layang', en: 'The kite' },
    blurb: {
      id: 'Layang-layang yang aku buat dari kertas bekas surat. Talinya panjang, biar bisa lihat kamu dari atas.',
      en: 'A kite made from an old letter. The string is long, so it can see you from above.'
    },
    position: { x: 10, z: 17.5 },
    radius: 2.6,
    reward: { coins: 15 }
  },
  {
    id: 'cave-crystal',
    zone: 'cave',
    name: { id: 'Kristal besar', en: 'The big crystal' },
    blurb: {
      id: 'Kristal yang katanya menyimpan suara. Aku sudah coba, yang keluar suara kamu ketawa.',
      en: 'A crystal that supposedly stores voices. I tried it; what came out was your laugh.'
    },
    position: { x: -21.5, z: -15 },
    radius: 2.6,
    reward: { coins: 30 }
  }
];

export function spotById(id: string): SpotDef | undefined {
  return SPOTS.find((spot) => spot.id === id);
}

export function spotsInZone(zoneId: ZoneId): SpotDef[] {
  return SPOTS.filter((spot) => spot.zone === zoneId);
}

export const STARTING_ZONES: ZoneId[] = ['garden', 'home'];