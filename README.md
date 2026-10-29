# Our Love Garden

Pulau 3D kecil untuk **Deni & Jihan**. Kamu main sebagai **BUBU** (panda putih),
ditemani **DUDU** (beruang cokelat) yang mengikuti, mengomentari, dan sesekali
malu-malu kalau kamu dekat. Semua model dibuat prosedural dari primitive
Three.js, tanpa aset pihak ketiga.

Status pengembangan: **Fase 4 selesai** — dunia, karakter, kontrol, siang/malam,
bertani, hewan, memancing, inventori, 7 peti kenangan, profil, event ulang tahun,
kejutan akhir, suara sintetis, dan PWA offline.

## Yang bisa dimainkan sekarang

- Jalan-jalan di pulau, atur kamera, ganti siang/malam otomatis.
- **Bertani**: tap petak kebun di taman, pilih benih, siram, panen, jual di jurnal.
  Ada 4 tanaman (mawar, bunga matahari, stroberi, wortel); mawar kesukaan Bubu,
  wortel kesukaan Dudu. Tanaman tetap tumbuh saat game ditutup (waktu nyata).
- **Hewan**: Cimoy (kucing oranye) mengikuti kamu, Jamal (cupang) tinggal di
  mangkuk kaca dekat kolam, dan seekor anak ayam yang lari ke arahmu. Tap mereka
  untuk menyapa; ganti nama di tab Hewan pada jurnal.
- **Memancing**: tap kolam, Bubu berjalan ke tepi, lalu tap air saat ikan
  menggigit dan tahan untuk menarik. 5 spesies dengan cerita masing-masing.
- **Peti kenangan**: 7 peti tersebar di pulau. Tap untuk membuka surat + foto
  (atau ilustrasi polaroid kalau fotonya belum ada). Peti ke-5 membuka mahkota
  bunga Dudu, peti ke-3 memberi 20 koin.
- **Profil**: tab "Kita" di jurnal berisi Bubu (Jihan) dan Dudu (Deni), tanggal
  ulang tahun, hitungan hari, dan jumlah kenangan.
- **Event ulang tahun**: otomatis muncul di 12 Juli (Bubu) dan 18 Oktober (Dudu),
  dengan balon, kembang api, dan pesan khusus. Bisa dicoba kapan saja dengan
  `?birthday=bubu` atau `?birthday=dudu` di URL.
- **Kejutan akhir**: setelah ketujuh peti terbuka, langit berubah malam, lentera
  naik, kembang api, dan surat panjang terbuka. Bisa diputar lagi dari tab "Kita".
- **Jurnal**: tas (jual panen), koleksi ikan, koleksi tanaman, hewan, kenangan,
  dan profil.
- **Suara**: semua efek (pop, ding, air, panen, gigitan ikan, langkah, peti) dan
  musik latar disintesis langsung dengan WebAudio, tanpa file audio. Musik mulai
  setelah sentuhan pertama, dan bisa diatur di Pengaturan (volume, musik, efek).
- **PWA offline**: setelah dibuka sekali, game bisa dibuka lagi tanpa internet
  dan bisa di-*install* ke home screen HP.
- Progres (koin, petak, tas, koleksi, nama hewan, kenangan, event yang sudah
  dilihat, aksesori, suara, bahasa, kualitas) tersimpan otomatis di localStorage.

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
- **Kolam**: tap airnya untuk memancing.
- **Hewan**: tap badannya untuk menyapa.
- **Jurnal**: tombol buku di kanan atas (jual hasil panen, lihat koleksi, ganti
  nama hewan, buka lagi surat kenangan, lihat profil & putar ulang kejutan).
- **Peti kenangan**: tap peti untuk membuka surat. Kalau masih jauh, Bubu akan
  berjalan ke peti itu dulu.

## Struktur

```
src/
  game.ts            loop utama, penyambung dunia + UI
  data/              config.ts (nama, tanggal), dialogues.ts (dialog),
                     crops.ts (tanaman, ikan, hewan), memories.ts (peti,
                     surat akhir, ulang tahun)
  world/             island.ts, props.ts, sky.ts, weather.ts, farm.ts,
                     chests.ts, lanterns.ts
  entities/          character.ts, face.ts, accessories.ts, particles.ts,
                     animals.ts, toon.ts
  systems/           camera.ts, controls.ts, farming.ts (logika tumbuh),
                     fishing.ts (state machine memancing)
    audio/             synth.ts (WebAudio + musik), settings.ts (volume/toggle)
    ui/                startScreen.ts, hud.ts, joystick.ts, bubble.ts, sheet.ts,
                       toast.ts, i18n.ts, icons.ts, dom.ts, seedPicker.ts,
                       journal.ts, fishingPanel.ts, memoryPanel.ts, finale.ts,
                       birthday.ts
    save/              save.ts (localStorage schema v4 + sanitasi data)
  tests/               save.test.ts, farming.test.ts, fishing.test.ts,
                       memories.test.ts, sound.test.ts
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
| Tanaman (harga, waktu tumbuh), ikan, hewan | `src/data/crops.ts` |
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
- Rumput, bunga, dan jalan memakai `InstancedMesh`.
- Kalau FPS turun di bawah 36 selama dua detik, mode hemat otomatis aktif
  (bayangan mati, resolusi turun, kelopak sakura dan sebagian kunang-kunang
  dimatikan) dan muncul pesan kecil.
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
  version: 4,
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
    birthdaySeen: string[]                                      // mis. "2026-bubu"
  }
}
```

Data yang rusak atau tidak dikenal dibuang otomatis (`sanitizeSave`), jadi save
lama tidak akan membuat game gagal jalan.

## Tes

```bash
npm test
```

52 tes: sanitasi save (termasuk migrasi v3 → v4), pertumbuhan tanaman, panen,
state machine memancing, logika kenangan/ulang tahun, dan pengaturan suara.