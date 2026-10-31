import type { LocalizedText } from './config';

/**
 * Per-animal personality: what it loves to eat and what it says when Bubu
 * chats or feeds it. Kept data-only so the logic in systems/pets.ts stays pure.
 */
export interface PetPersonality {
  id: string;
  role: 'cat' | 'fish' | 'chick';
  label: LocalizedText;
  favoriteFood: string;
  favoriteFoodNote: LocalizedText;
  chatOptions: LocalizedText[];
  chatReplies: LocalizedText[];
  fedFavorite: LocalizedText[];
  fedRegular: LocalizedText[];
  petted: LocalizedText[];
}

export const PETS: PetPersonality[] = [
  {
    id: 'cimoy',
      role: 'cat',
      label: { id: 'Cimoy', en: 'Cimoy' },
      favoriteFood: 'ikan-mas',
    favoriteFoodNote: {
      id: 'Ikan mas. Katanya kucing selalu jatuh cinta sama ikan, dan Cimoy jatuh cinta sama kamu juga.',
      en: 'Goldfish. They say cats always fall for fish, and Cimoy falls for you too.'
    },
    chatOptions: [
      { id: 'Hai Cimoy, lagi ngapain?', en: 'Hi Cimoy, what are you doing?' },
      { id: 'Aku kangen kamu, tau.', en: 'I missed you, you know.' },
      { id: 'Mau ikut jalan-jalan?', en: 'Want to come for a walk?' }
    ],
    chatReplies: [
      { id: 'Meong. Lagi jaga rumah supaya kamu nggak ke mana-mana sendirian.', en: 'Meow. Guarding the house so you do not wander off alone.' },
      { id: 'Aku juga. Tapi aku gengsi ngaku, jadi aku tidur saja.', en: 'Me too. But I am too proud to admit it, so I will just nap.' },
      { id: 'Jalan? Aku ikut, asal kamu yang pilih arahnya.', en: 'A walk? I am in, as long as you pick the way.' }
    ],
    fedFavorite: [
      { id: 'Ikan mas! Bubu tahu banget. Meong puas.', en: 'Goldfish! Bubu really knows. A very satisfied meow.' }
    ],
    fedRegular: [
      { id: 'Lumayan. Aku simpan buat camilan tengah malam.', en: 'Not bad. Saving it for a midnight snack.' }
    ],
    petted: [
      { id: 'Puurrr... tepat di belakang telinga. Kamu jago.', en: 'Purrr... right behind the ear. You are good at this.' }
    ]
  },
  {
    id: 'jamal',
      role: 'fish',
      label: { id: 'Jamal', en: 'Jamal' },
      favoriteFood: 'stroberi',
    favoriteFoodNote: {
      id: 'Stroberi. Jamal pura-pura cuek, tapi gelembungnya pecah kalau dikasih ini.',
      en: 'Strawberries. Jamal acts indifferent, but his bubbles pop when you give him this.'
    },
    chatOptions: [
      { id: 'Jamal, kamu kelihatan dramatis hari ini.', en: 'Jamal, you look dramatic today.' },
      { id: 'Aku bawa salam dari Cimoy.', en: 'I bring greetings from Cimoy.' },
      { id: 'Kolammu udah aku bersihin, loh.', en: 'I already cleaned your bowl.' }
    ],
    chatReplies: [
      { id: 'Dramatis? Aku cuma keren. Ada bedanya, adek ihankuu.', en: 'Dramatic? I am simply cool. There is a difference, adek ihankuu.' },
      { id: 'Cimoy? Bilang ke dia aku masih yang paling jago renang.', en: 'Cimoy? Tell him I am still the best swimmer.' },
      { id: 'Makasih. Gelembungku tadi bilang kamu punya selera bagus.', en: 'Thanks. My bubbles just said you have good taste.' }
    ],
    fedFavorite: [
      { id: 'Stroberi! Ini rahasia kecilku. Kamu tahu... aku tersipu di dalam air.', en: 'Strawberries! That is my little secret. You found it... I am blushing underwater.' }
    ],
    fedRegular: [
      { id: 'Oke. Aku terima. Jangan bilang Cimoy, ya.', en: 'Okay. I accept. Do not tell Cimoy.' }
    ],
    petted: [
      { id: 'Jangan kaca-kaca kolamnya dipegang terus... eh, sekali lagi boleh.', en: 'Do not tap the glass all the time... okay, one more time.' }
    ]
  },
  {
    id: 'anak-ayam',
      role: 'chick',
      label: { id: 'Anak ayam', en: 'Chick' },
      favoriteFood: 'wortel',
    favoriteFoodNote: {
      id: 'Wortel. Anak ayam kecil ini lari paling cepat kalau lihat kamu bawa wortel.',
      en: 'Carrots. This little chick runs fastest when it sees you bring a carrot.'
    },
    chatOptions: [
      { id: 'Cip! Kamu mau main kejar-kejaran?', en: 'Cheep! Do you want to play chase?' },
      { id: 'Kamu makin lucu dari kemarin.', en: 'You got cuter than yesterday.' },
      { id: 'Aku bawain kamu sesuatu, tebak.', en: 'I brought you something, guess.' }
    ],
    chatReplies: [
      { id: 'Cip cip! Aku lari dulu, kamu susul ya!', en: 'Cheep cheep! I run first, you catch up!' },
      { id: 'Cip... kamu tahu aja. Aku ganti bulu biar makin fluffy.', en: 'Cheep... you always know. I am molting to get fluffier.' },
      { id: 'Cip? Wortel? Wortel!', en: 'Cheep? Carrot? Carrot!' }
    ],
    fedFavorite: [
      { id: 'Cip cip cip! Wortel! Aku melompat sampai lupa caranya mendarat.', en: 'Cheep cheep cheep! Carrots! I jumped and forgot how to land.' }
    ],
    fedRegular: [
      { id: 'Cip. Terima kasih. Aku simpan dua gigitan.', en: 'Cheep. Thank you. I will save two bites.' }
    ],
    petted: [
      { id: 'Cip... geli. Tapi jangan berhenti, ya.', en: 'Cheep... ticklish. But do not stop, okay?' }
    ]
  }
];

export function petById(id: string): PetPersonality | undefined {
  return PETS.find((pet) => pet.id === id);
}