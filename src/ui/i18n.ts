import type { Lang, LocalizedText } from '../data/config';

type Dict = Record<string, LocalizedText>;

const STRINGS: Dict = {
  'start.eyebrow': { id: 'Pulau kecil untuk kita', en: 'A tiny island for us' },
  'start.lede': {
    id: 'Sebuah taman yang dibangun pelan-pelan, buat kamu yang selalu bikin hari biasa jadi hangat.',
    en: 'A garden built slowly, for the one who makes ordinary days feel warm.'
  },
  'start.customize': { id: 'Dandani Bubu & Dudu', en: 'Dress up Bubu & Dudu' },
  'start.customizeNote': {
    id: 'Bubu yang kamu mainkan. Dudu ikut ke mana pun kamu pergi.',
    en: 'You play as Bubu. Dudu follows wherever you go.'
  },
  'start.bubu': { id: 'Bubu', en: 'Bubu' },
  'start.dudu': { id: 'Dudu', en: 'Dudu' },
  'start.ribbon': { id: 'Warna pita Bubu', en: "Bubu's ribbon colour" },
  'start.enter': { id: 'Masuk ke pulau', en: 'Enter the island' },
  'start.enterNote': {
    id: 'Tidak ada kalah, tidak ada waktu habis. Santai saja.',
    en: 'No losing, no timers. Take your time.'
  },
  'start.locked': { id: 'Dibuka dari peti kenangan', en: 'Unlocked from a memory chest' },
  'start.saved': { id: 'Tersimpan otomatis di perangkat ini', en: 'Saved automatically on this device' },
    'start.controlsDesktop': {
      id: 'Klik tanah atau pakai W A S D untuk jalan',
      en: 'Click the ground or use W A S D to walk'
    },
    'start.controlsTouch': {
      id: 'Joystick untuk jalan, tap tanah untuk mendekat',
      en: 'Joystick to walk, tap the ground to approach'
    },

  'hud.brand': { id: 'Our Love Garden', en: 'Our Love Garden' },
  'hud.settings': { id: 'Pengaturan', en: 'Settings' },
  'hud.emote': { id: 'Ekspresi', en: 'Emotes' },
  'hud.qualityReduced': {
    id: 'Mode hemat daya aktif supaya tetap lancar',
    en: 'Battery saver turned on to keep things smooth'
  },
  'hud.morning': { id: 'Pagi', en: 'Morning' },
  'hud.afternoon': { id: 'Siang', en: 'Afternoon' },
  'hud.evening': { id: 'Sore', en: 'Evening' },
  'hud.night': { id: 'Malam', en: 'Night' },
  'hud.dayCount': { id: 'Hari', en: 'Day' },
  'hud.chestSoon': {
    id: 'Peti kenangan akan muncul di fase berikutnya',
    en: 'Memory chests arrive in the next phase'
  },
    'hud.hintDesktop': { id: 'Klik tanah untuk jalan', en: 'Click the ground to walk' },
    'hud.hintTouch': { id: 'Geser untuk jalan', en: 'Drag to walk' },
    'hud.joystick': { id: 'Joystick gerak', en: 'Movement joystick' },
    'hud.journal': { id: 'Jurnal', en: 'Journal' },
    'hud.coins': { id: 'Koin', en: 'Coins' },

    'farm.title': { id: 'Pilih benih', en: 'Pick a seed' },
    'farm.note': {
      id: 'Tanam, siram, lalu panen. Bunga kesukaan kita tumbuh lebih cepat kalau disiram.',
      en: 'Plant, water, harvest. Our favourite flowers grow faster when watered.'
    },
    'farm.cost': { id: 'Benih', en: 'Seed' },
  'farm.plant': { id: 'Tanam', en: 'Plant' },
    'farm.sell': { id: 'Panen dijual', en: 'Sells for' },
    'farm.favorite': { id: 'Kesukaan', en: 'Favourite of' },
    'farm.noCoins': {
      id: 'Koinmu belum cukup. Jual hasil panen dulu, ya.',
      en: 'Not enough coins. Sell some harvest first.'
    },
    'farm.planted': { id: 'Benih ditanam. Jangan lupa disiram!', en: 'Seed planted. Do not forget to water it!' },
    'farm.watered': { id: 'Sudah disiram. Tumbuh lebih cepat sekarang.', en: 'Watered. It grows faster now.' },
    'farm.alreadyWet': { id: 'Tanahnya masih basah, kok.', en: 'The soil is still wet.' },
    'farm.growing': { id: 'Masih tumbuh, sabar ya.', en: 'Still growing, be patient.' },
    'farm.harvested': { id: 'Panen! Masuk ke tas kamu.', en: 'Harvested! Added to your bag.' },
    'farm.ready': { id: 'Siap dipanen', en: 'Ready to harvest' },
    'farm.needsWater': { id: 'Butuh air', en: 'Needs water' },
    'farm.emptyPlot': { id: 'Tanah kosong', en: 'Empty soil' },
  'farm.walkFirst': { id: 'Kita ke petaknya dulu, ya.', en: 'Let us walk over to the bed first.' },
    'farm.left': { id: 'lagi', en: 'left' },

    'fish.title': { id: 'Memancing', en: 'Fishing' },
    'fish.cast': { id: 'Lempar pancing', en: 'Cast the line' },
    'fish.waiting': { id: 'Tunggu... jangan buru-buru.', en: 'Wait... do not rush.' },
    'fish.bite': { id: 'Menggigit! Tap sekarang!', en: 'A bite! Tap now!' },
    'fish.reel': { id: 'Tahan untuk menarik!', en: 'Hold to reel in!' },
    'fish.early': { id: 'Kegeseran. Ikan kecilnya kabur.', en: 'Too early. The little fish slipped away.' },
    'fish.slipped': { id: 'Lepas. Coba lagi, aku temani.', en: 'It got away. Try again, I am right here.' },
    'fish.caught': { id: 'Dapat!', en: 'Caught!' },
    'fish.again': { id: 'Lempar lagi', en: 'Cast again' },
    'fish.done': { id: 'Selesai', en: 'Done' },
    'fish.hint': {
      id: 'Tap air saat ikan menggigit, lalu tahan tombol untuk menarik.',
      en: 'Tap the water when the fish bites, then hold the button to reel.'
    },
    'fish.newCatch': { id: 'Spesies baru masuk koleksi!', en: 'New species added to your collection!' },
    'fish.sellHint': { id: 'Ikan disimpan di jurnal, bukan dijual.', en: 'Fish go to the journal, not the shop.' },
    'fish.walkFirst': {
      id: 'Kita ke tepi kolam dulu, ya.',
      en: 'Let us walk to the pond edge first.'
    },

    'journal.title': { id: 'Jurnal kita', en: 'Our journal' },
    'journal.tab.bag': { id: 'Tas', en: 'Bag' },
    'journal.tab.fish': { id: 'Ikan', en: 'Fish' },
    'journal.tab.crops': { id: 'Tanaman', en: 'Crops' },
    'journal.tab.animals': { id: 'Hewan', en: 'Animals' },
  'journal.tab.memories': { id: 'Kenangan', en: 'Memories' },
  'journal.tab.us': { id: 'Kita', en: 'Us' },
    'journal.coins': { id: 'Koin', en: 'Coins' },
    'journal.emptyBag': {
      id: 'Tasmu masih kosong. Tanam bunga atau mancing dulu, yuk.',
      en: 'Your bag is empty. Plant something or go fishing.'
    },
    'journal.emptyFish': {
      id: 'Belum ada ikan. Kolamnya menunggu, kok.',
      en: 'No fish yet. The pond is waiting.'
    },
    'journal.emptyCrops': {
      id: 'Belum ada panen. Petak kebunmu masih terbuka.',
      en: 'Nothing harvested yet. Your garden beds are open.'
    },
    'journal.sellOne': { id: 'Jual satu', en: 'Sell one' },
    'journal.sellAll': { id: 'Jual semua', en: 'Sell all' },
    'journal.sold': { id: 'Terjual. Koinmu bertambah.', en: 'Sold. Your coins grew.' },
    'journal.rename': { id: 'Ganti nama', en: 'Rename' },
    'journal.renameSave': { id: 'Simpan', en: 'Save' },
    'journal.renameHint': { id: 'Maksimal 14 huruf', en: '14 characters max' },
    'journal.renamed': { id: 'Nama baru disimpan.', en: 'New name saved.' },
    'journal.locked': { id: 'Belum ketemu', en: 'Not met yet' },
    'journal.animalHint': { id: 'Tap hewannya di pulau untuk menyapa.', en: 'Tap the animal on the island to say hi.' },
    'journal.close': { id: 'Tutup', en: 'Close' },

    'animal.hi': { id: 'Hai, {name}!', en: 'Hi, {name}!' },
    'animal.petted': { id: '{name} senang banget dipanggil.', en: '{name} is delighted you said hi.' },
    'animal.renameLabel': { id: 'Nama hewan', en: 'Animal name' },

    'memory.title': { id: 'Peti kenangan', en: 'Memory chest' },
    'memory.counter': { id: 'kenangan terbuka', en: 'memories opened' },
    'memory.close': { id: 'Simpan kembali', en: 'Keep it safe' },
    'memory.next': { id: 'Peti berikutnya', en: 'Next chest' },
    'memory.allOpen': { id: 'Semua peti terbuka', en: 'Every chest is open' },
    'memory.rewardCoins': { id: 'Kamu dapat koin', en: 'You found coins' },
    'memory.rewardUnlock': { id: 'Aksesori Dudu terbuka: mahkota bunga', en: "Dudu's accessory unlocked: flower crown" },
    'memory.hint': { id: 'Petunjuk', en: 'Hint' },
    'memory.openFinale': { id: 'Buka kejutan terakhir', en: 'Open the last surprise' },
    'memory.photoCaption': { id: 'foto kita', en: 'our photo' },
    'memory.emptyPhoto': {
      id: 'Taruh foto kalian di public/photos untuk mengganti gambar ini.',
      en: 'Drop your own photo into public/photos to replace this drawing.'
    },
    'memory.locked': { id: 'Belum dibuka', en: 'Still closed' },

    'profile.title': { id: 'Kita', en: 'Us' },
    'profile.bubu': { id: 'Bubu · Jihan', en: 'Bubu · Jihan' },
    'profile.dudu': { id: 'Dudu · Deni', en: 'Dudu · Deni' },
    'profile.bubuTag': {
      id: 'Panda putih pemilik taman. Manja, receh, gampang meleleh.',
      en: 'The white panda who owns the garden. Affectionate, silly, easily melted.'
    },
    'profile.duduTag': {
      id: 'Beruang cokelat yang bikin pulau ini. Suka pura-pura sibuk.',
      en: 'The brown bear who built this island. Pretends to be busy a lot.'
    },
    'profile.birthday': { id: 'Ulang tahun', en: 'Birthday' },
    'profile.today': { id: 'Hari ini!', en: 'Today!' },
    'profile.days': { id: 'hari lagi', en: 'days to go' },
    'profile.love': { id: 'Sudah membangun', en: 'Built together' },
    'profile.memories': { id: 'kenangan', en: 'memories' },
    'profile.accessory': { id: 'Aksesori', en: 'Accessory' },
    'profile.flowerCrownHint': {
      id: 'Buka 4 peti kenangan untuk mahkota bunga Dudu.',
      en: 'Open 4 memory chests for Dudu’s flower crown.'
    },

    'birthday.title': { id: 'Hari istimewa', en: 'A special day' },
    'birthday.continue': { id: 'Masuk ke pulau', en: 'Enter the island' },
    'birthday.note': {
      id: 'Kue, balon, dan kembang api sudah disiapkan Dudu di pulau.',
      en: 'Dudu already set up cake, balloons and fireworks on the island.'
    },
    'birthday.toast': { id: 'Selamat ulang tahun, {name}!', en: 'Happy birthday, {name}!' },

    'finale.title': { id: 'Kejutan terakhir', en: 'The last surprise' },
    'finale.lede': {
      id: 'Semua peti sudah terbuka. Dudu minta kamu melihat ke langit.',
      en: 'Every chest is open. Dudu asks you to look at the sky.'
    },
    'finale.close': { id: 'Simpan malam ini', en: 'Keep this night' },
    'finale.replay': { id: 'Lihat lagi', en: 'Watch again' },
    'finale.night': { id: 'Malam terakhir di pulau kecil kita', en: 'The last night on our little island' },

    'settings.title': { id: 'Pengaturan', en: 'Settings' },
  'settings.close': { id: 'Tutup', en: 'Close' },
  'settings.quality': { id: 'Kualitas grafis', en: 'Graphics quality' },
  'settings.quality.auto': { id: 'Auto', en: 'Auto' },
  'settings.quality.sharp': { id: 'Tajam', en: 'Sharp' },
  'settings.quality.saver': { id: 'Hemat', en: 'Saver' },
  'settings.quality.note': {
    id: 'Auto menurunkan bayangan sendiri kalau perangkat mulai berat.',
    en: 'Auto turns shadows down if your device starts to struggle.'
  },
    'settings.sound': { id: 'Suara', en: 'Sound' },
    'settings.volume': { id: 'Volume', en: 'Volume' },
    'settings.music': { id: 'Musik', en: 'Music' },
    'settings.sfx': { id: 'Efek suara', en: 'Sound effects' },
    'settings.soundNote': {
      id: 'Semua suara dibuat langsung di browser, tanpa file audio.',
      en: 'Every sound is synthesised in the browser, no audio files.'
    },
    'settings.on': { id: 'Nyala', en: 'On' },
    'settings.off': { id: 'Mati', en: 'Off' },
  'settings.language': { id: 'Bahasa', en: 'Language' },
  'settings.language.id': { id: 'Indonesia', en: 'Indonesian' },
  'settings.language.en': { id: 'English', en: 'English' },
  'settings.restart': { id: 'Kembali ke layar awal', en: 'Back to start screen' },
  'settings.reset': { id: 'Hapus simpanan', en: 'Erase saved data' },
  'settings.resetConfirm': {
    id: 'Hapus semua simpanan dan mulai dari awal?',
    en: 'Erase all saved data and start over?'
  },
  'settings.resetDone': { id: 'Simpanan dihapus', en: 'Saved data erased' },
  'settings.about': {
    id: 'Dibuat pelan-pelan, dengan sayang.',
    en: 'Made slowly, with love.'
  },

  'emote.happy': { id: 'Senang', en: 'Happy' },
  'emote.shy': { id: 'Malu', en: 'Shy' },
  'emote.wave': { id: 'Lambaikan', en: 'Wave' },
  'emote.hug': { id: 'Peluk', en: 'Hug' },
  'emote.hold': { id: 'Gandengan', en: 'Hold hands' },
  'emote.kiss': { id: 'Cium pipi', en: 'Kiss cheek' },
  'emote.dance': { id: 'Dansa', en: 'Dance' }
};

let current: Lang = 'id';
const listeners = new Set<() => void>();

export function setLang(lang: Lang): void {
  if (current === lang) return;
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  listeners.forEach((listener) => listener());
}

export function getLang(): Lang {
  return current;
}

export function onLangChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function t(key: string): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[current];
}

export function pick(text: LocalizedText): string {
  return text[current];
}