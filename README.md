# Our Love Garden

Pulau 3D kecil untuk **Deni & Jihan**. Kamu main sebagai **BUBU** (panda putih),
ditemani **DUDU** (beruang cokelat) yang mengikuti, mengomentari, dan sesekali
malu-malu kalau kamu dekat. Semua model dibuat prosedural dari primitive
Three.js, tanpa aset pihak ketiga.

Status pengembangan: **R1 (dunia luas) selesai** — 7 distrik, kabut eksplorasi,
peta + fast travel, di atas semua fitur sebelumnya (bertani, hewan, memancing,
7 peti kenangan, event ulang tahun, kejutan akhir, suara sintetis, PWA offline).

## Yang bisa dimainkan sekarang

- Jalan-jalan di pulau, atur kamera, ganti siang/malam otomatis.
- **7 distrik**: Taman Bunga & Kebun, Rumah Kecil, Danau Cinta (dermaga + perahu +
  teratai), Hutan Kunang-kunang (pohon raksasa + jamur bercahaya + piknik),
  Bukit Angin (layang-layang + bangku sunset), Pantai Pasir Pink (kerang,
  kepiting, tulisan nama, jembatan ke pulau mungil), dan Gua Kristal yang terbuka
  setelah 3 kenangan.
- **Eksplorasi**: distrik tertutup kabut pastel yang memudar saat kamu masuk.
  Popup "Tempat baru ditemukan" menandai distrik dan 10 spot rahasia (bangku
  romantis, kolam kecil, lampu taman, patung panda & beruang, kucing liar,
  tulisan di pasir, tikar piknik, teratai Jamal, layang-layang, kristal). Spot
  memberi koin dan tercatat di tab **Jelajah**.
- **Peta**: minimap di kiri atas, tombol **Peta** di HUD, dan tab Jelajah. Peta
  penuh menampilkan distrik yang sudah dikunjungi, yang masih terbuka, dan yang
  masih kabut, plus **fast travel** ke distrik yang sudah didatangi.
- **Bertani**: tap petak kebun di taman, pilih benih, siram, panen, jual di jurnal.
  Ada 16 tanaman (6 bunga, 5 buah, 5 sayur) dengan bentuk prosedural yang
  berbeda-beda; mawar kesukaan Bubu, wortel kesukaan Dudu. Tanaman tetap tumbuh
  saat game ditutup (waktu nyata).
- **Hewan**: Cimoy (kucing oranye) mengikuti kamu, Jamal (cupang) tinggal di
  mangkuk kaca dekat dermaga, dan seekor anak ayam yang lari ke arahmu. Tap mereka
  untuk menyapa; ganti nama di tab Hewan pada jurnal.
- **Memancing**: tap kolam, Bubu berjalan ke tepi, lalu tap air saat ikan
  menggigit dan tahan untuk menarik. 5 spesies dengan cerita masing-masing.
- **Dekorasi rumah**: buka tab **Rumah** di jurnal (atau tap furnitur di halaman
  depan rumah) untuk beli mebel, pindah/menyimpan furnitur di 8 tempat halaman,
  ganti foto bingkai, dan isi akuarium dengan ikan hasil pancingan. Furnitur yang
  dimiliki tersimpan permanen dan muncul langsung di pulau.
- **Peti kenangan**: 7 peti tersebar di ketujuh distrik, satu di Gua Kristal.
  Tap untuk membuka surat + foto (atau ilustrasi polaroid kalau fotonya belum
  ada). Peti ke-5 membuka mahkota bunga Dudu, peti ke-3 memberi 20 koin.
- **Profil**: tab "Kita" di jurnal berisi Bubu (Jihan) dan Dudu (Deni), tanggal
  ulang tahun, hitungan hari, dan jumlah kenangan.
- **Event ulang tahun**: otomatis muncul di 12 Juli (Bubu) dan 18 Oktober (Dudu),
  dengan balon, kembang api, dan pesan khusus. Bisa dicoba kapan saja dengan
  `?birthday=bubu` atau `?birthday=dudu` di URL.
- **Kejutan akhir**: setelah ketujuh peti terbuka, langit berubah malam, lentera
  naik, kembang api, dan surat panjang terbuka. Bisa diputar lagi dari tab "Kita".
- **Jurnal**: tas (jual panen), koleksi ikan, koleksi tanaman, hewan, kenangan,
  jelajah (zona + spot), rumah (dekorasi furnitur + akuarium), dan profil.
- **Suara**: semua efek (pop, ding, air, panen, gigitan ikan, langkah, peti) dan
  musik latar disintesis langsung dengan WebAudio, tanpa file audio. Musik mulai
  setelah sentuhan pertama, dan bisa diatur di Pengaturan (volume, musik, efek).
- **PWA offline**: setelah dibuka sekali, game bisa dibuka lagi tanpa internet
  dan bisa di-*install* ke home screen HP.
- Progres (koin, petak, tas, koleksi, nama hewan, kenangan, event yang sudah
  dilihat, distrik & spot yang ditemukan, aksesori, suara, bahasa, kualitas)
  tersimpan otomatis di localStorage.

## Jalankan

```bash
npm install
npm run dev        # buka http://localhost:5173
```

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # cek hasil build
npm test           # unit test (vitest)
```

## Kontrol

- **Desktop**: klik tanah untuk jalan, `W A S D` / panah untuk gerak, drag untuk
  memutar kamera, scroll untuk zoom.
- **HP**: joystick di kanan bawah, tap tanah untuk mendekat, cubit untuk zoom.
- Tombol emosi (senang, malu, lambaikan, peluk, gandengan, cium pipi, dansa) ada
  di dok bawah.
- **Petak kebun**: tap untuk menanam (kalau kosong), menyiram (kalau kering),
  atau memanen (kalau sudah siap). Ikon cincin di atas tanaman menandakan siap panen.
- **Kolam / Danau Cinta**: tap airnya untuk memancing (Bubu jalan ke tepi dulu).
- **Peta**: tap minimap di kiri atas atau tombol Peta untuk peta penuh, lalu
  tekan **Pergi** pada distrik yang sudah dikunjungi untuk fast travel.
- **Hewan**: tap badannya untuk menyapa.
- **Jurnal**: tombol buku di kanan atas (jual hasil panen, lihat koleksi, ganti
  nama hewan, buka lagi surat kenangan, dekorasi rumah, lihat profil & putar
  ulang kejutan).
- **Peti kenangan**: tap peti untuk membuka surat. Kalau masih jauh, Bubu akan
  berjalan ke peti itu dulu.

## Struktur

```
src/
  game.ts            loop utama, penyambung dunia + UI
  data/              config.ts (nama, tanggal), dialogues.ts (dialog),
                     crops.ts (tanaman, ikan, hewan), memories.ts (peti,
                       surat akhir, ulang tahun), zones.ts (7 distrik + spot)
    world/             island.ts, districts.ts (rumah, kincir, dermaga, hutan,
                       bukit, pantai, gua), fog.ts, props.ts, sky.ts, weather.ts,
                     farm.ts, chests.ts, lanterns.ts, interior.ts (model
                     furnitur), homeDecor.ts (sinkronisasi dekorasi halaman)
    entities/          character.ts, face.ts, accessories.ts, particles.ts,
                       animals.ts, toon.ts
    systems/           camera.ts, controls.ts, farming.ts (logika tumbuh),
                       fishing.ts (state machine memancing), exploration.ts
                       (buka zona, penemuan spot, progres jelajah)
      audio/             synth.ts (WebAudio + musik), settings.ts (volume/toggle)
      ui/                startScreen.ts, hud.ts, joystick.ts, bubble.ts, sheet.ts,
                         toast.ts, i18n.ts, icons.ts, dom.ts, seedPicker.ts,
                         journal.ts, fishingPanel.ts, memoryPanel.ts, finale.ts,
                         birthday.ts, map.ts (minimap + peta), discovery.ts
      save/              save.ts (localStorage schema v5 + sanitasi data)
    tests/               save.test.ts, farming.test.ts, fishing.test.ts,
                         memories.test.ts, sound.test.ts, exploration.test.ts
  public/photos/       foto untuk bingkai & peti (lihat PANDUAN.md)
  public/sw.js         service worker offline
  public/manifest.webmanifest + public/icons/
  ```

## Kustomisasi cepat

| Mau ubah apa | Di file mana |
| --- | --- |
| Nama, tagline, tanggal ulang tahun | `src/data/config.ts` → `LOVE` |
| Dialog Dudu & Bubu, reaksi emosi | `src/data/dialogues.ts` |
| Isi 7 peti kenangan, surat akhir, pesan ulang tahun | `src/data/memories.ts` |
| Posisi peti di pulau | `src/data/memories.ts` → `position` |
| Isi & posisi 7 distrik, 10 spot rahasia, syarat buka Gua | `src/data/zones.ts` |
| Nama/tema distrik di peta & jurnal | `src/data/zones.ts` → `name`, `blurb` |
| Batas pulau, panjang hari | `src/data/config.ts` → `ISLAND` |
| Tanaman (harga, waktu tumbuh), ikan, hewan | `src/data/crops.ts` |
| Furnitur (harga, collider, nama), tempat halaman depan | `src/data/decor.ts` |
| Model furnitur & isi akuarium | `src/world/interior.ts` |
| Warna pita & pilihan aksesori | `src/data/config.ts` |
| Foto untuk bingkai & peti | `public/photos/` (lihat `PANDUAN.md`) |
| Panjang satu hari (detik) | `src/data/config.ts` → `ISLAND.dayLengthSeconds` |
| Lama siraman bertahan / kecepatan tumbuh kering | `src/systems/farming.ts` |
| Lama tunggu & jendela gigitan ikan | `src/data/crops.ts` per ikan |
| Kapan mahkota bunga terbuka | `src/data/memories.ts` → `FLOWER_CROWN_MEMORIES` |
| Volume & musik default | `src/audio/settings.ts` → `DEFAULT_SOUND` |
| Karakter suara (nada, durasi) | `src/audio/synth.ts` → `play()` |
| Isi cache offline | `public/sw.js` → `PRECACHE` |

## Deploy ke GitHub Pages

1. Push repo ke GitHub.
2. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` akan build dengan
   `VITE_BASE=/<nama-repo>/` lalu publish folder `dist`.

Build manual untuk sub-folder:

```bash
# PowerShell
$env:VITE_BASE="/nama-repo/"; npm run build

# bash
VITE_BASE=/nama-repo/ npm run build
```

Untuk domain sendiri atau user site (`username.github.io`), biarkan `VITE_BASE`
kosong sehingga base path menjadi `/`.

Service worker mendaftar dengan scope `BASE_URL`, jadi PWA tetap jalan di
sub-folder. Setelah mengubah isi game, naikkan `CACHE` di `public/sw.js`
(mis. `our-love-garden-v3`) supaya pengunjung lama mendapat versi baru.

## Install di HP (PWA)

1. Buka situsnya sekali saat online.
2. Android/Chrome: menu → **Add to Home screen**. iPhone/Safari: Share →
   **Add to Home Screen**.
3. Setelah itu game bisa dibuka tanpa internet; progres tetap tersimpan lokal.

## Suara

Semua suara dibuat di browser. Klik atau sentuh sekali untuk membuka izin audio
(browser melarang bunyi otomatis). Di **Pengaturan** ada volume, musik, dan efek
suara; pilihannya ikut tersimpan.

## Performa

- Pixel ratio dibatasi maksimal 2.
- Rumput, bunga, jalan, pohon, semak, dan batu memakai `InstancedMesh`.
- Kabut distrik hanya beberapa mesh per zona, bukan partikel mahal.
- Kalau FPS turun di bawah 36 selama dua detik, mode hemat otomatis aktif
  (bayangan mati, resolusi turun, kelopak sakura dan sebagian kunang-kunang
  dimatikan) dan muncul pesan kecil.
- Bayangan matahari mengikuti pemain supaya tetap tajam di pulau radius 34.
- Kualitas grafis bisa dipaksa di **Pengaturan**: Auto / Tajam / Hemat.
- Tab yang tidak aktif menghentikan render loop sampai dibuka lagi.

## Ide lanjutan (opsional)

- Suara langkah berbeda untuk rumput dan jalan setapak.
- Foto polaroid tambahan untuk dekorasi rumah.
- Mode "pekan kenangan": memutar ulang semua surat berurutan.

## Format simpanan

`localStorage["our-love-garden:save"]` menyimpan:

```ts
{
  version: 5,
  lang: 'id' | 'en',
  quality: 'auto' | 'sharp' | 'saver',
  sound: { volume: number, music: boolean, sfx: boolean },
  loadout: { bubu: { accessory, ribbon }, dudu: { accessory } },
  progress: {
    coins: number,
    plots: { cropId, growthMs, lastTickMs, wateredUntilMs }[],  // 9 petak
    inventory: Record<string, number>,                          // hasil panen & ikan
    collection: { fish: string[], crops: string[], animals: string[] },
    animalNames: Record<string, string>,                        // maks 14 huruf
    memories: string[],                                         // id peti yang terbuka
    finaleSeen: boolean,
    birthdaySeen: string[],                                     // mis. "2026-bubu"
    visitedZones: string[],                                     // distrik yang sudah didatangi
    discoveredSpots: string[]                                   // spot rahasia yang ditemukan
  }
}
```

Data yang rusak atau tidak dikenal dibuang otomatis (`sanitizeSave`), jadi save
lama tidak akan membuat game gagal jalan. Save v3/v4 otomatis mendapat
`visitedZones: ["garden", "home"]` tanpa kehilangan koin, koleksi, atau kenangan.

## Tes

```bash
npm test
```

67 tes: sanitasi save + migrasi v3/v4 → v5, pertumbuhan tanaman, panen,
state machine memancing, logika kenangan/ulang tahun, dan pengaturan suara.