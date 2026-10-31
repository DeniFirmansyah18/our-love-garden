import type { LocalizedText } from './config';

export interface DialogueLine {
  speaker: 'bubu' | 'dudu';
  text: LocalizedText;
}

export const INTRO: DialogueLine[] = [
  {
    speaker: 'dudu',
    text: {
      id: 'Akhirnya kita sampai juga, adek ihankuu. Pulau ini kecil, tapi semuanya aku siapin buat kamu.',
      en: 'We finally made it, adek ihankuu. The island is small, but I made all of it for you.'
    }
  },
  {
    speaker: 'bubu',
    text: {
      id: 'Mas denikuu... kok hangat banget di sini? Aku belum apa-apa udah meleleh.',
      en: 'Mas denikuu... why is it so warm here? I am melting already.'
    }
  },
  {
    speaker: 'dudu',
    text: {
      id: 'Kalau meleleh, aku tampung pakai hati. Jalan pelan-pelan ya, kita punya seharian.',
      en: 'If you melt, I will catch you with my heart. Walk slowly, we have all day.'
    }
  }
];

export const DUDU_IDLE: LocalizedText[] = [
  {
    id: 'Adek ihankuu, jangan jauh-jauh ya. Aku gampang panik kalau kamu nggak kelihatan.',
    en: 'Adek ihankuu, do not wander too far. I panic easily when I cannot see you.'
  },
  {
    id: 'Rumahnya aku bikin agak miring. Biar kayak kita: nggak sempurna, tapi selalu pas.',
    en: 'I built the house a little crooked. Like us: not perfect, but always fits.'
  },
  {
    id: 'Bunga di taman itu aku tanam sambil nyanyi. Sekarang bunganya malu-malu kalau kamu lihat.',
    en: 'I planted the garden flowers while singing. Now they get shy when you look at them.'
  },
  {
    id: 'Kalau capek, duduk aja. Aku jagain awan sampai kamu selesai istirahat.',
    en: 'If you are tired, just sit. I will babysit the clouds until you are done resting.'
  },
  {
    id: 'Aku nggak jago bikin kejutan. Jadi aku bikin pulau. Semoga cukup, ya.',
    en: 'I am not great at surprises. So I made an island. I hope it is enough.'
  },
  {
    id: 'Tadi aku ngomong sama kupu-kupu. Katanya kamu paling manis kalau lagi fokus jalan.',
    en: 'I talked to a butterfly earlier. It says you are sweetest when you are focused on walking.'
  },
  {
    id: 'Adek, kamu tahu nggak? Air kolam itu aku kasih warna favorit kamu. Jangan bilang siapa-siapa.',
    en: 'Adek, did you know? I tinted the pond with your favourite colour. Do not tell anyone.'
  }
];

export const BUBU_REPLIES: LocalizedText[] = [
  {
    id: 'Mas denikuu, kok tumben romantis? Aku cek suhu kamu dulu, ah.',
    en: 'Mas denikuu, romantic all of a sudden? Let me check your temperature first.'
  },
  {
    id: 'Rumahnya miring? Nggak apa-apa, aku juga miring kalau lihat kamu.',
    en: 'The house is crooked? That is fine, I tilt too when I look at you.'
  },
  {
    id: 'Aku bukan jauh, aku cuma muter-muter nyari bunga buat kamu.',
    en: 'I am not far, I was just circling around looking for flowers for you.'
  },
  {
    id: 'Mas, aku lapar. Ini pulau atau restoran?',
    en: 'Mas, I am hungry. Is this an island or a restaurant?'
  },
  {
    id: 'Kalau aku duduk, kamu ikut duduk. Jangan cuma jagain awan.',
    en: 'If I sit, you sit too. Do not just babysit the clouds.'
  },
  {
    id: 'Mas denikuu, aku simpen semua ini di hati ya. Yang besar, yang kayak kamu.',
    en: 'Mas denikuu, I am keeping all of this in my heart. The big one, the one like you.'
  }
];

export const DUDU_PROXIMITY: LocalizedText[] = [
  {
    id: 'Dek... deket banget. Aku nggak bisa mikir kalau kamu segini deketnya.',
    en: 'Dek... so close. I cannot think when you are this close.'
  },
  {
    id: 'Aku pura-pura lihat awan, ya. Padahal lihat kamu.',
    en: 'I am pretending to look at the clouds. Actually I am looking at you.'
  },
  {
    id: 'Pipiku panas. Ini salah kamu, adek ihankuu.',
    en: 'My cheeks are warm. This is your fault, adek ihankuu.'
  }
];

export const DUDU_FLOWER: LocalizedText[] = [
  {
    id: 'Ini bunga buat kamu. Aku petik yang paling berani, biar cocok sama adek ihankuu.',
    en: 'This flower is for you. I picked the bravest one, to match adek ihankuu.'
  },
  {
    id: 'Aku cuma punya satu tangan, jadi bunganya cuma satu. Tapi niatnya dua, kok.',
    en: 'I only have one hand, so only one flower. But the intention is double, I promise.'
  }
];

export const DUDU_SLEEP: LocalizedText[] = [
  {
    id: 'Aku istirahat sebentar ya... bangunin kalau kamu kangen.',
    en: 'I will rest for a moment... wake me if you miss me.'
  }
];

export const DUDU_GIFT_FAVORITE: LocalizedText[] = [
  {
    id: 'Ini... kesukaanku. Kamu ingat? Pipiku panas sekarang, adek ihankuu.',
    en: 'This... is my favourite. You remembered? My cheeks are hot now, adek ihankuu.'
  },
  {
    id: 'Kamu ngasih yang paling aku suka. Aku nggak akan jual ini, seumur hidup.',
    en: 'You gave me my favourite. I will never sell this, not ever.'
  }
];

export const DUDU_GIFT_FIRST_FAVORITE: LocalizedText[] = [
  {
    id: 'Pertama kalinya kamu kasih ini buat aku. Aku simpen di tempat paling aman: di hati.',
    en: 'The first time you gave this to me. I will keep it in the safest place: my heart.'
  }
];

export const DUDU_GIFT_REGULAR: LocalizedText[] = [
  {
    id: 'Ini buat aku? Beneran? Oke, sekarang ini barang paling berharga di pulau.',
    en: 'This is for me? Really? Okay, this is now the most precious thing on the island.'
  },
  {
    id: 'Aku taruh di dekat tempat tidur biar tiap bangun ingetnya sama kamu.',
    en: 'I will put it near the bed so I remember you every time I wake up.'
  }
];

export const BUBU_GIFT_THANKS: LocalizedText[] = [
  {
    id: 'Mas denikuu, makasih! Aku sayang banget, sampai aku nggak tahu gimana cara mejahit rasanya.',
    en: 'Mas denikuu, thank you! I love it so much I do not know how to sew the feeling.'
  }
];

export const EMOTE_REACTIONS: Record<string, LocalizedText> = {
  happy: {
    id: 'Adek ihankuu senyum. Aku ikut senyum, nggak bisa nolak.',
    en: 'Adek ihankuu is smiling. I smile too, cannot help it.'
  },
  shy: {
    id: 'Jangan dilihatin terus, nanti aku lupa cara jalan.',
    en: 'Do not stare, I will forget how to walk.'
  },
  wave: {
    id: 'Hai juga, adek. Aku dari tadi ngeliatin kamu, tapi pura-pura sibuk.',
    en: 'Hi back, adek. I have been watching you, but pretending to be busy.'
  },
  hug: {
    id: 'Peluknya jangan lama-lama... bohong, lamain aja.',
    en: 'Do not hug for too long... kidding, stay forever.'
  },
  hold: {
    id: 'Tangan kamu hangat. Aku simpan ya, buat musim hujan nanti.',
    en: 'Your hand is warm. I will save it for the rainy season.'
  },
  kiss: {
    id: 'Ciuman pipi diterima. Aku mau laporin ke hati, ini kejadian penting.',
    en: 'Cheek kiss received. I am reporting this to my heart, it is important.'
  },
  dance: {
    id: 'Aku nggak bisa dansa. Tapi kalau sama kamu, aku pura-pura bisa.',
    en: 'I cannot dance. But with you, I pretend I can.'
  }
};

export const HINTS = {
  desktop: {
    id: 'Klik tanah untuk jalan, atau pakai W A S D. Scroll untuk zoom.',
    en: 'Click the ground to walk, or use W A S D. Scroll to zoom.'
  },
  touch: {
    id: 'Geser joystick untuk jalan, tap tanah untuk mendekat, cubit untuk zoom.',
    en: 'Move the joystick to walk, tap the ground to approach, pinch to zoom.'
  }
};