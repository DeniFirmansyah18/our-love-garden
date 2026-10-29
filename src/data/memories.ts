import type { LocalizedText } from './config';

export interface MemoryReward {
  coins?: number;
  unlock?: 'flower-crown';
}

export interface MemoryChest {
  id: string;
  index: number;
  position: { x: number; z: number };
  title: LocalizedText;
  hint: LocalizedText;
  letter: LocalizedText;
  /** File name inside /public/photos, or null for a procedural polaroid. */
  photo: string | null;
  reward?: MemoryReward;
}

/**
 * Tujuh peti kenangan. Ganti teks `letter` dengan tulisan kalian sendiri:
 * tidak ada aturan panjang, tapi 2-4 kalimat paling enak dibaca di kartu.
 */
export const MEMORIES: MemoryChest[] = [
  {
    id: 'awal',
    index: 1,
    position: { x: -9.5, z: 3.0 },
    title: { id: 'Pertama kali', en: 'The first time' },
    hint: { id: 'Dekat bangku di sisi barat pulau.', en: 'Near the bench on the west side.' },
    letter: {
      id: 'Aku masih ingat waktu itu aku deg-degan cuma buat nyapa kamu. Sekarang aku deg-degan tiap kamu ketawa. Lucu ya, rasa yang sama, beda alasan.',
      en: 'I still remember being nervous just to say hi to you. Now I get nervous every time you laugh. Funny how it is the same feeling with a different reason.'
    },
    photo: 'foto-1.jpg'
  },
  {
    id: 'hujan',
    index: 2,
    position: { x: -4.2, z: 6.8 },
    title: { id: 'Hujan kecil', en: 'A little rain' },
    hint: { id: 'Di balik pohon utara.', en: 'Behind the northern trees.' },
    letter: {
      id: 'Waktu hujan, kita cuma diam dan dengerin. Katanya diam itu awkward, tapi sama kamu diamnya kayak peluk yang nggak perlu tangan.',
      en: 'When it rained we just sat and listened. People say silence is awkward, but with you it feels like a hug that needs no arms.'
    },
    photo: null
  },
  {
    id: 'makan',
    index: 3,
    position: { x: 1.2, z: 8.6 },
    title: { id: 'Kamu selalu lapar', en: 'You are always hungry' },
    hint: { id: 'Di ujung jalan setapak selatan.', en: 'At the end of the south path.' },
    letter: {
      id: 'Kita pesan dua menu, tapi yang habis menu kamu dan setengah menu aku. Aku nggak pernah protes, karena lihat kamu makan itu hiburan tersendiri.',
      en: 'We ordered two meals, but yours disappeared and half of mine too. I never complain; watching you eat is its own entertainment.'
    },
    photo: null,
    reward: { coins: 20 }
  },
  {
    id: 'miring',
    index: 4,
    position: { x: 7.6, z: 6.2 },
    title: { id: 'Rumah miring', en: 'The crooked house' },
    hint: { id: 'Di timur taman bunga.', en: 'East of the flower garden.' },
    letter: {
      id: 'Rumah ini sengaja aku bikin miring sedikit. Supaya kalau kamu bilang "ini aneh", aku bisa jawab "iya, kayak kita, tapi tetap berdiri".',
      en: 'I built this house slightly crooked on purpose. So when you say "this is odd", I can answer "yes, like us, and still standing".'
    },
    photo: 'foto-2.jpg'
  },
  {
    id: 'malu',
    index: 5,
    position: { x: 9.8, z: -1.8 },
    title: { id: 'Malu-malu', en: 'Shy shy' },
    hint: { id: 'Di sisi timur pulau, dekat pohon besar.', en: 'East side, near the big tree.' },
    letter: {
      id: 'Kamu tahu nggak, aku sering pura-pura lihat awan padahal ngeliatin kamu dari ekor mata. Kalau ketahuan, aku langsung benerin topi. Itu modus.',
      en: 'Did you know I often pretend to watch the clouds while watching you from the corner of my eye? If caught, I fix my hat. That is the plan.'
    },
    photo: null,
    reward: { unlock: 'flower-crown' }
  },
  {
    id: 'kolam',
    index: 6,
    position: { x: 0.4, z: -7.4 },
    title: { id: 'Kolam kita', en: 'Our pond' },
    hint: { id: 'Di selatan kolam, dekat batu besar.', en: 'South of the pond, near the big rock.' },
    letter: {
      id: 'Aku kasih nama ikanmu Jamal, soalnya kamu ketawa waktu itu dan aku pengen ketawa itu kedengeran tiap kali aku ke kolam.',
      en: 'I named the fish Jamal because you laughed then, and I wanted that laugh to be there every time I visit the pond.'
    },
    photo: null
  },
  {
    id: 'pulang',
    index: 7,
    position: { x: -8.6, z: -6.4 },
    title: { id: 'Selalu pulang', en: 'Always coming home' },
    hint: { id: 'Di belakang rumah kecil kita.', en: 'Behind our little house.' },
    letter: {
      id: 'Kata orang, rumah itu tempat. Buat aku, rumah itu kamu. Makanya pulang ke mana pun, ujungnya ya cari kamu.',
      en: 'People say home is a place. For me, home is you. So wherever I go back to, it always ends with finding you.'
    },
    photo: 'foto-3.jpg'
  }
];

export const MEMORY_COUNT = MEMORIES.length;

export function memoryById(id: string): MemoryChest | undefined {
  return MEMORIES.find((memory) => memory.id === id);
}

export const FINALE_LETTER: LocalizedText = {
  id: 'Aku nggak tahu harus mulai dari mana, jadi aku mulai dari yang paling jujur: aku merasa sangat beruntung ketemu kamu, dan karena kamu terus memilih aku setiap hari. Kamu adalah hal paling indah yang pernah terjadi dalam hidupku. wuff you so much, adek ihankuu.',
  en: 'I do not know where to begin, so I will begin with the most honest thing: I feel very lucky to have met you, and because you continue to choose me everyday. you are the most beautiful thing that has ever happened to me, wuff u so much adek ihankuu.'
};

export const FINALE_TITLE: LocalizedText = {
  id: 'Untuk adek ihankuu',
  en: 'For adek ihankuu'
};

export const FINALE_SIGNATURE: LocalizedText = {
  id: 'Dari mas denikuu, yang selalu pulang.',
  en: 'From mas denikuu, who always comes home.'
};

export interface BirthdayEvent {
  character: 'bubu' | 'dudu';
  name: string;
  date: { month: number; day: number };
  title: LocalizedText;
  message: LocalizedText;
}

export const BIRTHDAYS: BirthdayEvent[] = [
  {
    character: 'bubu',
    name: 'Jihan',
    date: { month: 7, day: 12 },
    title: { id: 'Selamat ulang tahun, Bubu', en: 'Happy birthday, Bubu' },
    message: {
      id: 'Hari ini aku nggak mau ngasih barang. Aku ngasih satu pulau kecil, satu taman yang tumbuh tiap hari, dan satu aku yang nggak ke mana-mana. Selamat ulang tahun, Jihan. Makasih sudah lahir dan milih aku.',
      en: 'Today I am not giving you a thing. I am giving you a small island, a garden that grows every day, and one me who is not going anywhere. Happy birthday, Jihan. Thank you for being born and for choosing me.'
    }
  },
  {
    character: 'dudu',
    name: 'Deni',
    date: { month: 10, day: 18 },
    title: { id: 'Selamat ulang tahun, Dudu', en: 'Happy birthday, Dudu' },
    message: {
      id: 'Mas denikuu, selamat ulang tahun. Tahun ini kamu nambah tua, tapi cara kamu manggil aku nggak pernah tua. Makasih sudah sabar, sudah pulang, sudah jadi tempat paling aman. Aku sayang kamu, banyak.',
      en: 'Mas denikuu, happy birthday. You are a year older, but the way you call me never gets old. Thank you for being patient, for coming home, for being the safest place. I love you, a lot.'
    }
  }
];

/** Returns the birthday happening on this calendar day, if any. */
export function birthdayOn(date: Date): BirthdayEvent | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return BIRTHDAYS.find((event) => event.date.month === month && event.date.day === day) ?? null;
}

export function daysUntilBirthday(date: Date, event: BirthdayEvent): number {
  const year = date.getFullYear();
  const today = new Date(year, date.getMonth(), date.getDate());
  let target = new Date(year, event.date.month - 1, event.date.day);
  if (target < today) target = new Date(year + 1, event.date.month - 1, event.date.day);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  return diff;
}

/** Flower crown unlocks once four memories are open. */
export const FLOWER_CROWN_MEMORIES = 4;

export function unlockedDuduAccessories(memoryCount: number): Array<'flower-crown'> {
  return memoryCount >= FLOWER_CROWN_MEMORIES ? ['flower-crown'] : [];
}

export function nextMemoryHint(collected: string[]): MemoryChest | null {
  return MEMORIES.find((memory) => !collected.includes(memory.id)) ?? null;
}