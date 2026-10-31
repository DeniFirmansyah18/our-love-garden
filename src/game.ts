import * as THREE from 'three';
import { LOVE, ISLAND, ribbonHex } from './data/config';
import type { Lang, LocalizedText, Quality } from './data/config';
import {
  BUBU_GIFT_THANKS,
  BUBU_REPLIES,
  DUDU_FLOWER,
  DUDU_GIFT_FAVORITE,
  DUDU_GIFT_FIRST_FAVORITE,
  DUDU_GIFT_REGULAR,
  DUDU_IDLE,
  DUDU_PROXIMITY,
  DUDU_SLEEP,
  EMOTE_REACTIONS,
  HINTS,
  INTRO
} from './data/dialogues';
import { giftResult } from './data/gifts';
import { petById } from './data/pets';
import { applyAffection, canFeedPet, feedAffection, isFavoriteFood, petAffection, talkToPet } from './systems/pets';
import { DECOR_SLOTS, decorById } from './data/decor';
import { Character } from './entities/character';
import { createAnimals, type AnimalActor } from './entities/animals';
import { ParticleSystem } from './entities/particles';
import { CameraRig } from './systems/camera';
import { Controls } from './systems/controls';
import { advanceAll, harvest, isReady, needsWater, plant, waterPlot } from './systems/farming';
import { ANIMALS, CROPS, animalById, cropById } from './data/crops';
import { FISH, fishById } from './data/fish';
import { BIRTHDAYS, MEMORIES, MEMORY_COUNT, birthdayOn, memoryById, nextMemoryHint, unlockedDuduAccessories, type BirthdayEvent } from './data/memories';
import { SPOTS, ZONES, zoneById, type ZoneId } from './data/zones';
import {
  initialVisitedZones,
  shouldDiscoverZone,
  spotInReach,
  withVisited,
  zoneUnlockedByMemories
} from './systems/exploration';
import { FarmGrid } from './world/farm';
import { FogOfWar } from './world/fog';
import { MemoryChests } from './world/chests';
import { LanternShow, fireworkPositions } from './world/lanterns';
import { Island } from './world/island';
import { HomeDecor } from './world/homeDecor';
import { SkySystem, DayNightClock } from './world/sky';
import { PetalWeather } from './world/weather';
import { AudioEngine } from './audio/synth';
import { BubbleLayer } from './ui/bubble';
import { DiscoveryBanner } from './ui/discovery';
import { prefersTouch } from './ui/dom';
import { Hud, type EmoteId } from './ui/hud';
import { Journal } from './ui/journal';
import type { JournalTab } from './ui/journal';
import { MapSheet, MiniMap, type MapState } from './ui/map';
import { SeedPicker } from './ui/seedPicker';
import { FishingPanel } from './ui/fishingPanel';
import { PetPanel } from './ui/petPanel';
import { MemoryPanel } from './ui/memoryPanel';
import { FinalePanel } from './ui/finale';
import { BirthdayPanel } from './ui/birthday';
import { StartScreen } from './ui/startScreen';
import { Toast } from './ui/toast';
import { getLang, pick, setLang, t } from './ui/i18n';
import {
  addItem,
  clearSave,
  defaultSave,
  loadSave,
  writeSave,
  type Loadout,
  type SaveState
} from './save/save';

type Mode = 'start' | 'playing';

const KEYBOARD = { x: 0, z: 0 };

const KNOWN_IDS = {
  crops: CROPS.map((crop) => crop.id),
  fish: FISH.map((fish) => fish.id),
  animals: ANIMALS.map((animal) => animal.id),
  memories: MEMORIES.map((memory) => memory.id),
  zones: ZONES.map((zone) => zone.id),
  spots: SPOTS.map((spot) => spot.id),
  gifts: [...CROPS.map((crop) => crop.id), ...FISH.map((fish) => fish.id)],
  photos: LOVE.photos.length
};

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly rig: CameraRig;
  private readonly island: Island;
  private readonly sky: SkySystem;
  private readonly clock: DayNightClock;
  private readonly particles: ParticleSystem;
  private readonly petals: PetalWeather;
  private readonly bubu: Character;
  private readonly dudu: Character;
  private readonly controls: Controls;
  private readonly hud: Hud;
  private readonly startScreen: StartScreen;
  private readonly bubbles = new BubbleLayer();
  private readonly toast = new Toast();
    private readonly farm: FarmGrid;
      private readonly decor: HomeDecor;
      private readonly animals: AnimalActor[] = [];
    private readonly seedPicker: SeedPicker;
    private readonly journal: Journal;
    private readonly fishingPanel: FishingPanel;
    private readonly petPanel: PetPanel;
    private readonly memoryPanel: MemoryPanel;
    private readonly finalePanel: FinalePanel;
    private readonly birthdayPanel: BirthdayPanel;
    private readonly chests: MemoryChests;
    private readonly lanterns: LanternShow;
    private readonly audio: AudioEngine;
      private readonly fog: FogOfWar;
      private readonly miniMap = new MiniMap();
      private readonly mapSheet = new MapSheet({ onClose: () => this.updateControlsEnabled() });
      private readonly discovery = new DiscoveryBanner();
      private zoneCheckAt = 0;
      private mapRefreshAt = 0;
      private spotCheckAt = 0;
      private caveAnnounced = false;
      private traveling = false;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly tmp = new THREE.Vector3();
  private readonly tmpB = new THREE.Vector3();
  private readonly focusPoint = new THREE.Vector3();
  private readonly headBubu = new THREE.Vector3();
  private readonly headDudu = new THREE.Vector3();
    private readonly midPoint = new THREE.Vector3();
    private readonly axisRight = new THREE.Vector3();
    private readonly axisUp = new THREE.Vector3();
    private showcasePanelRect: { top: number; right: number } | null = null;
    private showcaseRectAt = 0;

  private save: SaveState;
  private mode: Mode = 'start';
  private lastTime = 0;
  private elapsed = 0;
  private raf = 0;
  private paused = false;
  private coupleUntil = 0;
    private nextIdleChatter = 12;
    private nextHeartBeat = 0;
    private nextShowcaseEmote = 3;
    private nextCompanionAction = 18;
    private dialogueTimers: number[] = [];
  private statusRefresh = 0;
  private qualityReduced = false;
    private frames = 0;
    private fpsWindowStart = 0;
    private slowSeconds = 0;
    private shadowsEnabled = true;
    private lastQuality: Quality = 'auto';
    private duduSleeping = false;
      private pendingFishing = false;
      private lastFarmSync = 0;
      private farmSyncDirty = true;
      private pendingPlot: number | null = null;
        private finaleActive = false;
  private birthdayActive = false;
  private activeBirthday: BirthdayEvent | null = null;
  private fireworksTimer = 0;
  private finaleTimer = 0;
  private birthdayTimer = 0;
    private nextStepAt = 0;
    private lowEffects = false;

  constructor(private readonly mount: HTMLElement) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.append(this.renderer.domElement);

    this.save = loadSave(undefined, { knownIds: KNOWN_IDS });
        this.save.progress.plots = advanceAll(this.save.progress.plots, Date.now());
        setLang(this.save.lang);
        this.audio = new AudioEngine(this.save.sound);

        this.rig = new CameraRig(width / height);
        this.rig.setViewport(width / height);

        this.island = new Island();
        this.scene.add(this.island.group);

        this.farm = new FarmGrid(
          new THREE.Vector3(this.island.landmarks.garden.x, 0.14, this.island.landmarks.garden.z),
          0.28
        );
        this.scene.add(this.farm.group);
        this.farm.sync(this.save.progress.plots, Date.now());

                this.decor = new HomeDecor();
                this.scene.add(this.decor.group);
                this.syncDecor();

                for (const animal of createAnimals()) {
          const def = animalById(animal.id);
          if (def) {
            animal.root.position.set(def.home.x, 0, def.home.z);
          }
          this.scene.add(animal.root);
          this.animals.push(animal);
        }

        this.chests = new MemoryChests(this.scene);
        this.chests.sync(this.save.progress.memories);
        this.lanterns = new LanternShow(this.scene);

                this.fog = new FogOfWar(this.scene, this.save.progress.visitedZones);
                this.island.setCaveLocked(this.save.progress.memories.length < 3);
                for (const spot of SPOTS) {
                  this.island.setSpotDiscovered(spot.id, this.save.progress.discoveredSpots.includes(spot.id));
                }

    this.sky = new SkySystem(this.scene);
    this.clock = new DayNightClock(ISLAND.startTime, ISLAND.dayLengthSeconds);
    this.particles = new ParticleSystem(this.scene);
    this.petals = new PetalWeather(this.scene, 90, 40);

    this.bubu = new Character({
      role: 'bubu',
      headColor: 0xffffff,
      bodyColor: 0xffffff,
      earColor: 0x4a1f1a,
      earInnerColor: 0x7a3b31,
      cheekColor: 0xf7b5b0,
      hasRibbon: true,
            scale: 1.16
    });
    this.dudu = new Character({
      role: 'dudu',
      headColor: 0xd9a58c,
      bodyColor: 0xd9a58c,
      earColor: 0xb07a60,
      earInnerColor: 0x8a5741,
      muzzleColor: 0xf3d6bd,
      cheekColor: 0xf9c48a,
            scale: 1.24
    });

    this.scene.add(this.bubu.root, this.dudu.root);

        this.bubu.root.position.set(-0.72, 0, 0.8);
        this.dudu.root.position.set(0.86, 0, 0.44);
        this.applyLoadout(this.save.loadout, false);

    this.controls = new Controls(this.renderer.domElement, this.rig, {
      onTap: (x, y) => this.handleTap(x, y),
      onRotate: (dx, dy) => this.rig.rotateBy(dx, dy),
      onZoom: (factor) => this.rig.zoomBy(factor),
      onFirstInteract: () => undefined
    });
    this.controls.setEnabled(false);

    this.hud = new Hud(
      {
        onEmote: (emote) => this.performEmote(emote),
        onQuality: (quality) => this.setQuality(quality),
        onLang: (lang) => this.setLanguage(lang),
        onRestart: () => this.returnToStart(),
        onReset: () => this.resetProgress(),
            onJournal: () => this.openJournal(),
                        onMap: () => this.openMap(),
                        onVolume: (volume) => this.setVolume(volume),
            onToggleMusic: () => this.toggleMusic(),
            onToggleSfx: () => this.toggleSfx(),
            onSheetToggle: (open) => {
              this.audio.play(open ? 'open' : 'close');
              this.updateControlsEnabled();
            }
          },
          this.save.quality,
          this.save.sound
        );

        this.seedPicker = new SeedPicker({
          onPick: (cropId) => this.plantPendingPlot(cropId),
          onClose: () => this.updateControlsEnabled()
        });

        this.journal = new Journal({
          onSell: (itemId, quantity) => this.sellItem(itemId, quantity),
                  onGift: (itemId) => this.giveGift(itemId),
                  onRename: (animalId, name) => this.renameAnimal(animalId, name),
          onOpenMemory: (id) => this.openMemoryFromJournal(id),
                    onOpenMap: () => {
                      this.journal.close();
                      this.openMap();
                    },
                    onReplayFinale: () => {
            this.journal.close();
            this.startFinale();
          },
                    onBuyDecor: (itemId) => this.buyDecorItem(itemId),
                    onPlaceDecor: (slot, itemId) => this.placeDecorItem(slot, itemId),
                    onStoreDecor: (slot) => this.storeDecorItem(slot),
                    onMoveDecor: (fromSlot, toSlot) => this.moveDecorItem(fromSlot, toSlot),
                    onSetDecorPhoto: (slot, photoIndex) => this.setDecorPhoto(slot, photoIndex),
                    onSetDecorFish: (slot, fishId) => this.setDecorFish(slot, fishId),
                  onClose: () => this.updateControlsEnabled()
                });

        this.fishingPanel = new FishingPanel({
                  onCaught: (catchId, isJunk, sizeCm) => this.completeFishing(catchId, isJunk, sizeCm),
                  onGetContext: () => ({
                    memories: this.save.progress.memories,
                    totalCatches: this.save.progress.fishRecords.totalCatches,
                    timeOfDay: this.clock.time < 0.27 || this.clock.time > 0.85 ? 'night' : 'day',
                    assist: this.save.progress.animalNames.jamal ? true : true
                  }),
                  onBaitChange: (bait) => {
                    // Bait is pocket-change data kept in memory; persist on catch.
                    void bait;
                  },
                  onClose: () => {
                    this.pendingFishing = false;
                    this.updateControlsEnabled();
                  }
                });

                          this.petPanel = new PetPanel({
                            onTalk: (animalId, optionIndex) => this.talkToAnimal(animalId, optionIndex),
                            onFeed: (animalId, itemId) => this.feedAnimal(animalId, itemId),
                            onClose: () => this.updateControlsEnabled()
                          });

                          this.memoryPanel = new MemoryPanel({
          onClose: () => {
            this.updateControlsEnabled();
            if (
              this.save.progress.memories.length >= MEMORY_COUNT &&
              !this.save.progress.finaleSeen &&
              !this.finaleActive
            ) {
              this.startFinale();
            }
          },
          onFinale: () => this.startFinale()
        });

        this.finalePanel = new FinalePanel({
          onClose: () => this.endFinale()
        });

        this.birthdayPanel = new BirthdayPanel({
          onEnter: () => this.celebrate()
        });

        this.hud.setCoins(this.save.progress.coins);

    this.startScreen = new StartScreen(
          this.save.loadout,
          unlockedDuduAccessories(this.save.progress.memories.length),
          {
            onStart: () => this.begin(),
            onLoadout: (loadout) => {
              this.save.loadout = loadout;
              this.applyLoadout(loadout, true);
              this.persist();
            },
            onLang: (lang) => {
              this.save.lang = lang;
              this.persist();
            }
          }
        );

    this.mount.append(
      this.startScreen.element,
      this.bubbles.element,
      this.hud.element,
          this.miniMap.element,
          this.discovery.element,
          this.hud.sheet.backdrop,
          this.hud.sheet.element,
              this.seedPicker.sheet.backdrop,
              this.seedPicker.sheet.element,
              this.journal.sheet.backdrop,
              this.journal.sheet.element,
              this.mapSheet.sheet.backdrop,
              this.mapSheet.sheet.element,
              this.fishingPanel.element,
                            this.petPanel.sheet.backdrop,
                            this.petPanel.sheet.element,
                            this.memoryPanel.element,
              this.birthdayPanel.element,
              this.finalePanel.element,
              this.toast.element
            );

        this.miniMap.onClick(() => this.openMap());
        this.miniMap.element.classList.add('is-hidden');

    document.body.classList.add('is-playing');
    this.rig.setMode('showcase');
    this.rig.snapTo(new THREE.Vector3(0, 1.05, 0.6));
    this.startScreen.show();

        window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
            window.addEventListener('pagehide', this.onPageHide);
            window.addEventListener('pointerdown', this.unlockAudio, { once: true });
            window.addEventListener('keydown', this.unlockAudio, { once: true });
            document.addEventListener('click', this.onUiClick);

    this.lastQuality = this.save.quality;
        this.applyQuality(this.save.quality, false);
        this.lastTime = performance.now();
        this.fpsWindowStart = this.lastTime;
        this.loop(this.lastTime);
      }

  private applyLoadout(loadout: Loadout, animate: boolean): void {
    this.bubu.setAccessory(loadout.bubu.accessory);
    this.bubu.setRibbonColor(ribbonHex(loadout.bubu.ribbon));
    this.dudu.setAccessory(loadout.dudu.accessory);
    if (animate) {
      this.burstAt(this.bubu.getHeadWorldPosition(this.tmp), 'star', 5);
    }
  }

  private begin(): void {
    if (this.mode === 'playing') return;
      this.audio.unlock();
      this.audio.play('open');
      this.mode = 'playing';
    this.startScreen.hide();
    this.hud.show();
    this.controls.setEnabled(true);
    this.rig.setMode('play');

    this.bubu.root.position.set(0.6, 0, 4.6);
        this.dudu.root.position.set(-0.8, 0, 5.4);
    this.bubu.clearDestination();
    this.dudu.clearDestination();
    this.bubu.setExpression('neutral');
    this.dudu.setExpression('neutral');
        this.miniMap.element.classList.remove('is-hidden');
        this.refreshMap();
        this.island.setCaveLocked(this.save.progress.memories.length < 3);
        this.checkMemoryUnlocks();

    this.clock.setTime(0.26);
        this.lastTime = performance.now();
        this.nextIdleChatter = this.elapsed + 16;

    this.persist();
        this.toast.show(pick(prefersTouch() ? HINTS.touch : HINTS.desktop), 3400);
        this.playIntro();

            this.birthdayTimer = window.setTimeout(() => {
              this.birthdayTimer = 0;
              if (this.mode === 'playing') this.maybeStartBirthday();
            }, 1700);
          }

  private playIntro(): void {
    this.clearDialogueTimers();
    let delay = 900;
    INTRO.forEach((line) => {
      const timer = window.setTimeout(() => {
        if (this.mode !== 'playing') return;
        if (line.speaker === 'bubu') {
          this.sayBubu(line.text, 5.2);
          this.bubu.playEmote('happy', 1.2);
        } else {
          this.sayDudu(line.text, 5.2);
          this.dudu.playEmote('wave', 1.4);
        }
      }, delay);
      this.dialogueTimers.push(timer);
      delay += 5200;
    });
  }

  private clearDialogueTimers(): void {
    this.dialogueTimers.forEach((timer) => window.clearTimeout(timer));
    this.dialogueTimers = [];
  }

  private sayBubu(text: { id: string; en: string }, seconds = 4.4): void {
    this.bubbles.show('bubu', LOVE.playerRealName, pick(text), seconds);
  }

  private sayDudu(text: { id: string; en: string }, seconds = 4.4): void {
    this.bubbles.show('dudu', LOVE.companionRealName, pick(text), seconds);
  }

  private handleTap(clientX: number, clientY: number): void {
    if (this.mode !== 'playing') return;
      if (this.isOverlayOpen()) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.rig.camera);

    const characterHits = this.raycaster.intersectObjects(
      [this.bubu.root, this.dudu.root],
      true
    );
    if (characterHits.length > 0) {
      const hit = characterHits[0].object;
      let node: THREE.Object3D | null = hit;
      let owner: 'bubu' | 'dudu' | null = null;
      while (node) {
        if (node === this.bubu.root) {
          owner = 'bubu';
          break;
        }
        if (node === this.dudu.root) {
          owner = 'dudu';
          break;
        }
        node = node.parent;
      }
      if (owner === 'bubu') this.petCharacter(this.bubu, 'bubu');
      else if (owner === 'dudu') this.petCharacter(this.dudu, 'dudu');
      return;
    }

      const animalHits = this.raycaster.intersectObjects(
        this.animals.map((animal) => animal.root),
        true
      );
      if (animalHits.length > 0) {
        const actor = this.animals.find((animal) => animal.hits(animalHits[0].object));
        if (actor) {
                this.openPetPanel(actor.id);
          return;
        }
      }

      const plotHits = this.raycaster.intersectObjects(this.farm.tiles, false);
      if (plotHits.length > 0) {
        const index = this.farm.getIndexFromObject(plotHits[0].object);
        if (index !== null) {
          this.handlePlotTap(index);
          return;
        }
      }

      const chestHits = this.raycaster.intersectObjects(this.chests.meshes, true);
      if (chestHits.length > 0) {
        const id = this.chests.getIdFromObject(chestHits[0].object);
        if (id) {
          this.handleChestTap(id);
          return;
        }
      }

      const pondHits = this.raycaster.intersectObject(this.island.getPondMesh(), false);
            if (pondHits.length > 0) {
              this.walkToPond();
              return;
            }

            const decorHits = this.raycaster.intersectObjects([this.decor.group], true);
            if (decorHits.length > 0) {
              const slot = this.decor.slotFromObject(decorHits[0].object);
              if (slot !== null) {
                this.openJournal('home', slot);
                return;
              }
            }

            const groundHits = this.raycaster.intersectObject(this.island.getGroundMesh(), false);
            if (groundHits.length > 0) {
              const point = groundHits[0].point;
        this.island.clampPosition(point, 0.25);
        this.bubu.setDestination(point.x, point.z);
        return;
      }

      const planePoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.groundPlane, planePoint)) {
        this.island.clampPosition(planePoint, 0.25);
        if (Math.hypot(planePoint.x, planePoint.z) < ISLAND.radius) {
          this.bubu.setDestination(planePoint.x, planePoint.z);
        }
      }
    }

    private isOverlayOpen(): boolean {
      return (
        this.hud.sheet.isOpen() ||
        this.seedPicker.sheet.isOpen() ||
        this.journal.isOpen() ||
        this.mapSheet.isOpen() ||
        this.fishingPanel.isOpen() ||
                this.petPanel.isOpen() ||
                this.memoryPanel.isOpen() ||
        this.finalePanel.isOpen() ||
        this.birthdayPanel.isOpen()
      );
    }

    private updateControlsEnabled(): void {
      const open = this.isOverlayOpen();
      this.controls.setEnabled(!open && this.mode === 'playing');
      if (open) this.bubu.stop();
    }

    private handlePlotTap(index: number): void {
      const now = Date.now();
      const plots = this.save.progress.plots;
      const plot = plots[index];
      if (!plot) return;

      const distance = Math.hypot(
        this.bubu.root.position.x - this.farm.group.position.x,
        this.bubu.root.position.z - this.farm.group.position.z
      );
      if (distance > 4.6) {
        const target = this.farm.tiles[index].getWorldPosition(new THREE.Vector3());
        this.island.clampPosition(target, 0.4);
        this.bubu.setDestination(target.x, target.z);
        this.toast.show(t('farm.walkFirst'), 1800);
        return;
      }

      if (!plot.cropId) {
        this.pendingPlot = index;
        this.seedPicker.open(this.save.progress.coins);
        this.updateControlsEnabled();
        return;
      }

      if (isReady(plot)) {
        const result = harvest(plot, now);
        if (result.ready && result.cropId) {
          plots[index] = result.plot;
          addItem(this.save.progress.inventory, result.cropId, 1);
          if (!this.save.progress.collection.crops.includes(result.cropId)) {
            this.save.progress.collection.crops.push(result.cropId);
          }
          this.audio.play('harvest');
          const crop = cropById(result.cropId);
          const head = this.farm.tiles[index].getWorldPosition(this.tmp);
          head.y += 0.6;
          this.particles.burst('petal', head, 8, 1.2);
          this.particles.burst('star', head, 3, 1);
          this.toast.show(`${t('farm.harvested')} ${crop ? crop.name[getLang()] : ''}`, 2600);
          this.bubu.playEmote('happy', 1.4);
          this.dudu.playEmote('happy', 1.2);
          this.farmSyncDirty = true;
          this.persist();
        }
        return;
      }

      if (needsWater(plot, now)) {
        plots[index] = waterPlot(plot, now);
        this.audio.play('water');
        const head = this.farm.tiles[index].getWorldPosition(this.tmp);
        head.y += 0.4;
        this.particles.burst('star', head, 3, 0.6);
        this.toast.show(t('farm.watered'), 2200);
        this.farmSyncDirty = true;
        this.persist();
        return;
      }

      this.toast.show(t('farm.alreadyWet'), 1800);
    }

    private plantPendingPlot(cropId: string): void {
      const index = this.pendingPlot;
      this.pendingPlot = null;
      this.updateControlsEnabled();
      if (index === null) return;

      const crop = cropById(cropId);
      if (!crop) return;
      if (this.save.progress.coins < crop.seedCost) {
        this.toast.show(t('farm.noCoins'), 2400);
        return;
      }

      const now = Date.now();
      this.save.progress.coins -= crop.seedCost;
      this.save.progress.plots[index] = plant(this.save.progress.plots[index], cropId, now);
      this.audio.play('plant');
      this.hud.setCoins(this.save.progress.coins);
      this.farmSyncDirty = true;
      this.farm.sync(this.save.progress.plots, now);
      this.toast.show(t('farm.planted'), 2400);

      const head = this.farm.tiles[index].getWorldPosition(this.tmp);
      head.y += 0.3;
      this.particles.burst('petal', head, 3, 0.5);
      this.persist();
    }

    private walkToPond(): void {
      const shore = this.island.shorePointNear(this.bubu.root.position, new THREE.Vector3());
      this.island.clampPosition(shore, 0.4);
      this.bubu.setDestination(shore.x, shore.z);
      this.pendingFishing = true;
      this.toast.show(t('fish.walkFirst'), 2200);
    }

    private startFishing(): void {
      this.pendingFishing = false;
      this.bubu.stop();
      this.audio.play('open');
      this.bubu.faceToward(this.island.waterCenter, 1);
      this.fishingPanel.openPanel();
      this.updateControlsEnabled();
      this.sayDudu(
        {
          id: 'Aku jagain embernya. Kamu fokus ke pancingan, ya.',
          en: 'I will watch the bucket. You focus on the line, okay?'
        },
        3.6
      );
    }

    private completeFishing(catchId: string, isJunk: boolean, sizeCm: number | null): void {
          addItem(this.save.progress.inventory, catchId, 1);
      this.audio.play('catch');

          if (isJunk) {
            this.persist();
            this.journal.refresh(this.save.progress);
            return;
          }

          const fish = fishById(catchId);
          const isNew = !this.save.progress.collection.fish.includes(catchId);
          if (isNew) this.save.progress.collection.fish.push(catchId);
          this.save.progress.fishRecords.totalCatches += 1;
          if (sizeCm !== null) {
            this.save.progress.fishRecords.largestCm = Math.max(
              this.save.progress.fishRecords.largestCm,
              sizeCm
            );
          }
          this.save.progress.fishBadges[catchId] = (this.save.progress.fishBadges[catchId] ?? 0) + 1;
          this.persist();
          this.journal.refresh(this.save.progress);

          const head = this.dudu.getHeadWorldPosition(this.tmp);
          head.y += 0.5;
          this.particles.burst('heart', head, 6, 1);
          if (isNew) {
            this.toast.show(`${fish ? fish.name[getLang()] : catchId} · ${t('fish.newCatch')}`, 3400);
            this.sayBubu(
              {
                id: 'Mas denikuu, lihat! Ini masuk koleksi kita.',
                en: 'Mas denikuu, look! This one is going into our collection.'
              },
              3.8
            );
          } else {
            this.toast.show(t('fish.caught'), 2000);
          }
        }

    private petAnimal(actor: AnimalActor): void {
      actor.react();
      this.audio.play('pop');
          const pet = petById(actor.id);
          const name = this.save.progress.animalNames[actor.id] ?? pet?.label[getLang()] ?? actor.id;
          const head = actor.getHeadPosition(new THREE.Vector3());
          this.particles.burst('heart', head, 6, 0.9);
          this.particles.burst('star', head, 2, 0.8);
          this.toast.show(t('animal.petted').replace('{name}', name), 2200);
          if (!this.save.progress.collection.animals.includes(actor.id)) {
            this.save.progress.collection.animals.push(actor.id);
            this.persist();
          }

          const before = this.save.progress.animalAffection[actor.id] ?? 0;
          const next = petAffection(before);
          const change = applyAffection(before, next);
          this.save.progress.animalAffection[actor.id] = next;
          if (change.leveledUp) {
            this.toast.show(t('pet.levelUpToast').replace('{name}', name), 2800);
          }
          this.persist();
        }

      private openPetPanel(animalId: string): void {
        const actor = this.animals.find((animal) => animal.id === animalId);
        if (actor) this.petAnimal(actor);
        this.petPanel.open(animalId, this.save.progress);
        this.updateControlsEnabled();
      }

      private talkToAnimal(animalId: string, optionIndex: number): void {
        const pet = petById(animalId);
        if (!pet) return;
        const actor = this.animals.find((animal) => animal.id === animalId);
        actor?.react();

        const reply = pet.chatReplies[optionIndex] ?? pet.chatReplies[0];
        const name = this.save.progress.animalNames[animalId] ?? pet.label[getLang()];
        this.petPanel.close();

        const head = actor?.getHeadPosition(this.tmp.clone()) ?? this.tmp.clone().setY(1.2);
        this.particles.burst('heart', head, 3, 0.7);
        this.audio.play('pop');

        this.toast.show(`${name}: ${reply[getLang()]}`, 3800);

        const before = this.save.progress.animalAffection[animalId] ?? 0;
        const next = talkToPet(before);
        const change = applyAffection(before, next);
        this.save.progress.animalAffection[animalId] = next;
        if (change.leveledUp) {
          this.toast.show(t('pet.levelUpToast').replace('{name}', name), 2800);
        }
        this.persist();
        this.updateControlsEnabled();
      }

      private feedAnimal(animalId: string, itemId: string): void {
        const pet = petById(animalId);
        if (!pet) return;
        if (!canFeedPet(animalId, itemId)) {
          this.toast.show(t('pet.notFood').replace('{name}', pet.label[getLang()]), 2200);
          return;
        }
        const available = this.save.progress.inventory[itemId] ?? 0;
        if (available <= 0) return;

        addItem(this.save.progress.inventory, itemId, -1);
        const favorite = isFavoriteFood(animalId, itemId);
        const before = this.save.progress.animalAffection[animalId] ?? 0;
        const next = feedAffection(before, favorite);
        const change = applyAffection(before, next);
        this.save.progress.animalAffection[animalId] = next;

        const actor = this.animals.find((animal) => animal.id === animalId);
        actor?.react();
        const head = actor?.getHeadPosition(this.tmp.clone()) ?? this.tmp.clone().setY(1.2);
        this.particles.burst(favorite ? 'petal' : 'star', head, favorite ? 10 : 4, 1);
        this.audio.play('harvest');

        const name = this.save.progress.animalNames[animalId] ?? pet.label[getLang()];
        const line = favorite ? pet.fedFavorite[0] : pet.fedRegular[0];
        this.toast.show(`${name}: ${line[getLang()]}`, 3400);
        if (change.leveledUp) {
          this.toast.show(t('pet.levelUpToast').replace('{name}', name), 3200);
        }

        this.persist();
        this.journal.refresh(this.save.progress);
        this.petPanel.open(animalId, this.save.progress);
        this.updateControlsEnabled();
      }

    private openJournal(tab: JournalTab = 'bag', homeSlot: number | null = null): void {
          this.journal.open(this.save.progress, tab, homeSlot);
      this.updateControlsEnabled();
    }

    private mapState(): MapState {
      return {
        player: {
          x: this.bubu.root.position.x,
          z: this.bubu.root.position.z,
          angle: this.bubu.getFacing()
        },
        dudu: { x: this.dudu.root.position.x, z: this.dudu.root.position.z },
        visited: this.save.progress.visitedZones,
        discoveredSpots: this.save.progress.discoveredSpots,
        memoryCount: this.save.progress.memories.length
      };
    }

    private refreshMap(): void {
      const state = this.mapState();
      this.miniMap.update(state);
      this.mapSheet.refresh(state);
    }

    private openMap(): void {
      if (this.mode !== 'playing') return;
      this.bubu.stop();
      this.mapSheet.open(this.mapState(), (zone) => this.travelTo(zone));
      this.updateControlsEnabled();
    }

    private travelTo(zoneId: ZoneId): void {
      const zone = zoneById(zoneId);
      if (!zone) return;
      if (!this.save.progress.visitedZones.includes(zoneId)) return;

      this.traveling = true;
      const target = new THREE.Vector3(zone.arrival.x, 0, zone.arrival.z);
      this.island.clampPosition(target, 0.4);
      this.bubu.stop();
      this.dudu.stop();
      this.bubu.root.position.copy(target);
      const offset = new THREE.Vector3(Math.cos(0.8) * 1.1, 0, Math.sin(0.8) * 1.1);
      const duduTarget = target.clone().add(offset);
      this.island.clampPosition(duduTarget, 0.4);
      this.dudu.root.position.copy(duduTarget);
      this.bubu.setExpression('surprised');
      this.dudu.setExpression('surprised');
      window.setTimeout(() => {
        this.bubu.setExpression('happy');
        this.dudu.setExpression('happy');
      }, 500);

      this.particles.burst('star', target.clone().setY(1.2), 10, 1.6);
      this.particles.burst('heart', duduTarget.clone().setY(1.1), 5, 1.1);
      this.audio.play('sparkle');
      this.rig.snapTo(target.clone().setY(0.9));
      this.mapSheet.close();
      this.updateControlsEnabled();
      this.refreshMap();
      this.toast.show(t('map.travelDone').replace('{zone}', zone.name[getLang()]), 2400);
      this.traveling = false;
    }

    private updateExploration(now: number): void {
      if (this.mode !== 'playing' || this.isOverlayOpen()) return;
      if (now < this.zoneCheckAt) return;
      this.zoneCheckAt = now + 260;

      const position = this.bubu.root.position;
      const visited = this.save.progress.visitedZones;
      const memoryCount = this.save.progress.memories.length;

      const zone = shouldDiscoverZone(position.x, position.z, visited, memoryCount);
      if (zone) {
        this.save.progress.visitedZones = withVisited(visited, zone.id);
        this.fog.reveal(zone.id);
        this.audio.play('ding');
        this.particles.burst('star', position.clone().setY(1.8), 12, 1.8);
        this.discovery.show(
          'zone',
          zone.name[getLang()],
          zone.blurb[getLang()],
          t('discovery.zoneLabel')
        );
        if (zone.id === 'lake') {
          this.sayDudu(
            {
              id: 'Nah, ini Danau Cinta. Aku pilih tempatnya yang paling tenang, biar kamu betah.',
              en: 'Here it is, Love Lake. I picked the calmest spot so you would want to stay.'
            },
            4.6
          );
        } else if (zone.id === 'beach') {
          this.sayBubu(
            {
              id: 'Pasirnya pink! Mas denikuu, ini kamu bikin sendiri?',
              en: 'The sand is pink! Mas denikuu, did you make this yourself?'
            },
            4.4
          );
        }
        this.persist();
        this.refreshMap();
        this.checkMemoryUnlocks();
      }

      if (now >= this.spotCheckAt) {
        this.spotCheckAt = now + 300;
        const spot = spotInReach(position.x, position.z, this.save.progress.discoveredSpots);
        if (spot && this.save.progress.visitedZones.includes(spot.zone)) {
          this.save.progress.discoveredSpots.push(spot.id);
          this.island.setSpotDiscovered(spot.id, true);
          const reward = spot.reward?.coins ?? 0;
          if (reward > 0) {
            this.save.progress.coins += reward;
            this.hud.setCoins(this.save.progress.coins);
            this.seedPicker.setCoins(this.save.progress.coins);
          }
          this.audio.play('ding');
          const point = new THREE.Vector3(spot.position.x, 1.2, spot.position.z);
          this.particles.burst('heart', point, 7, 1);
          this.particles.burst('star', point, 5, 1.4);
          this.discovery.show(
            'spot',
            spot.name[getLang()],
            reward > 0 ? t('discovery.reward').replace('{coins}', String(reward)) : spot.blurb[getLang()],
            t('discovery.spotLabel')
          );
          this.bubu.playEmote('happy', 1.6);
          this.dudu.playEmote('shy', 1.6);
          this.persist();
          this.refreshMap();
        }
      }
    }

    private checkMemoryUnlocks(): void {
      const zone = zoneUnlockedByMemories(
        this.save.progress.visitedZones,
        this.save.progress.memories.length
      );
      if (!zone || this.caveAnnounced) return;
      this.caveAnnounced = true;
      this.island.setCaveLocked(false);
      this.audio.play('sparkle');
      this.discovery.show(
        'cave',
        zone.name[getLang()],
        zone.hint[getLang()],
        t('discovery.caveLabel')
      );
      this.toast.show(t('discovery.caveToast'), 5200);
      this.refreshMap();
    }

    private sellItem(itemId: string, quantity: number): void {
      const crop = cropById(itemId);
      if (!crop) return;
      const available = this.save.progress.inventory[itemId] ?? 0;
      const amount = Math.max(0, Math.min(quantity, available));
      if (amount === 0) return;

      addItem(this.save.progress.inventory, itemId, -amount);
      this.save.progress.coins += crop.sellPrice * amount;
      this.hud.setCoins(this.save.progress.coins);
      this.seedPicker.setCoins(this.save.progress.coins);
      this.journal.refresh(this.save.progress);
      this.toast.show(`${t('journal.sold')} +${crop.sellPrice * amount}`, 2200);
      this.persist();
    }

    private renameAnimal(animalId: string, name: string): void {
      this.save.progress.animalNames[animalId] = name;
      this.journal.refresh(this.save.progress);
      this.toast.show(t('journal.renamed'), 2000);
      this.persist();
    }

        private syncDecor(): void {
          this.decor.sync(this.save.progress.decor, LOVE.photos);
          this.island.setDecorColliders(this.decor.colliders);
        }

        private buyDecorItem(itemId: string): void {
          const def = decorById(itemId);
          if (!def || this.save.progress.decor.owned.includes(itemId)) return;
          if (this.save.progress.coins < def.price) {
            this.toast.show(t('decor.noCoins'), 2400);
            return;
          }
          this.save.progress.coins -= def.price;
          this.save.progress.decor.owned.push(itemId);
          this.hud.setCoins(this.save.progress.coins);
          this.seedPicker.setCoins(this.save.progress.coins);
          this.audio.play('ding');
          this.toast.show(t('decor.bought'), 2800);
          this.persist();
          this.journal.refresh(this.save.progress);
        }

        private placeDecorItem(slot: number, itemId: string): void {
          const def = decorById(itemId);
          if (!def || !this.save.progress.decor.owned.includes(itemId)) return;
          if (slot < 0 || slot >= DECOR_SLOTS.length) return;
          const placed = this.save.progress.decor.placed;
          if (placed.some((entry) => entry.slot === slot)) return;
          if (placed.some((entry) => entry.item === itemId)) return;
          placed.push({ slot, item: itemId, photo: 0, fish: null });
          this.audio.play('pop');
          this.toast.show(t('decor.placed'), 2200);
          this.persist();
          this.syncDecor();
          this.journal.refresh(this.save.progress);
        }

        private storeDecorItem(slot: number): void {
          const placed = this.save.progress.decor.placed;
          const index = placed.findIndex((entry) => entry.slot === slot);
          if (index < 0) return;
          placed.splice(index, 1);
          this.audio.play('close');
          this.toast.show(t('decor.stored'), 2200);
          this.persist();
          this.syncDecor();
          this.journal.refresh(this.save.progress);
        }

        private moveDecorItem(fromSlot: number, toSlot: number): void {
          if (toSlot < 0 || toSlot >= DECOR_SLOTS.length) return;
          const placed = this.save.progress.decor.placed;
          const entry = placed.find((placement) => placement.slot === fromSlot);
          if (!entry) return;
          if (placed.some((placement) => placement.slot === toSlot)) return;
          entry.slot = toSlot;
          this.audio.play('pop');
          this.toast.show(t('decor.moved'), 2200);
          this.persist();
          this.syncDecor();
          this.journal.refresh(this.save.progress);
        }

        private setDecorPhoto(slot: number, photoIndex: number): void {
          const entry = this.save.progress.decor.placed.find((placement) => placement.slot === slot);
          if (!entry) return;
          entry.photo = Math.max(0, Math.min(LOVE.photos.length - 1, Math.round(photoIndex)));
          this.audio.play('sparkle');
          this.toast.show(t('decor.photoSet'), 2000);
          this.persist();
          this.syncDecor();
          this.journal.refresh(this.save.progress);
        }

        private setDecorFish(slot: number, fishId: string | null): void {
          const entry = this.save.progress.decor.placed.find((placement) => placement.slot === slot);
          if (!entry) return;
          entry.fish = fishId && this.save.progress.collection.fish.includes(fishId) ? fishId : null;
          this.audio.play('sparkle');
          this.toast.show(entry.fish ? t('decor.fishSet') : t('decor.fishCleared'), 2000);
          this.persist();
          this.syncDecor();
          this.journal.refresh(this.save.progress);
        }

          private giveGift(itemId: string): void {
        const result = giftResult(itemId, this.save.progress.giftedFavorites);
        if (!result) {
          this.toast.show(t('journal.giftCant'), 2200);
          return;
        }
        const available = this.save.progress.inventory[itemId] ?? 0;
        if (available <= 0) {
          this.toast.show(t('journal.giftEmpty'), 2200);
          return;
        }

        addItem(this.save.progress.inventory, itemId, -1);
        if (result.firstFavorite) this.save.progress.giftedFavorites.push(itemId);
        this.persist();
        this.journal.close();

        const pos = this.dudu.getHeadWorldPosition(this.tmp);
    pos.y += 0.35;
        this.dudu.clearDestination();
        this.dudu.playEmote('shy', 2.2);
        this.bubu.playEmote('happy', 1.6);
        this.dudu.setBlush(1);
        this.particles.burst('heart', pos, 8, 1.1);
        this.particles.ringOfHearts(pos, 0.7, 9);
        this.audio.play('sparkle');

        let line: LocalizedText[];
        if (result.firstFavorite) {
          line = DUDU_GIFT_FIRST_FAVORITE;
        } else if (result.favorite) {
          line = DUDU_GIFT_FAVORITE;
        } else {
          line = DUDU_GIFT_REGULAR;
        }
        this.sayDudu(line[Math.floor(Math.random() * line.length)], 4.4);
        window.setTimeout(() => {
          this.sayBubu(BUBU_GIFT_THANKS[0], 3.6);
        }, 1800);

        this.updateControlsEnabled();
      }

    private handleChestTap(id: string): void {
      if (this.save.progress.memories.includes(id)) {
        this.openMemoryFromJournal(id);
        return;
      }

      const memory = memoryById(id);
      if (!memory) return;

      const chestPos = this.chests.positionOf(id);
      const distance = chestPos
        ? Math.hypot(
            this.bubu.root.position.x - chestPos.x,
            this.bubu.root.position.z - chestPos.z
          )
        : 0;
      if (distance > 3.4 && chestPos) {
        this.island.clampPosition(chestPos, 0.4);
        this.bubu.setDestination(chestPos.x, chestPos.z);
        this.toast.show(memory.hint[getLang()], 2600);
        return;
      }

      this.openChest(id);
    }

    private openChest(id: string): void {
      const memory = memoryById(id);
      if (!memory) return;
      if (this.save.progress.memories.includes(id)) {
        this.openMemoryFromJournal(id);
        return;
      }

      this.save.progress.memories.push(id);
      this.chests.sync(this.save.progress.memories);
      this.audio.play('chest');
      this.bubu.stop();
      this.bubu.playEmote('happy', 1.8);
      this.dudu.playEmote('shy', 2);

      const point = this.chests.positionOf(id);
      if (point) {
        point.y += 0.35;
        this.particles.burst('heart', point, 10, 1.3);
        this.particles.burst('star', point, 6, 1.6);
      }

      const reward = memory.reward;
      if (reward?.coins) {
        this.save.progress.coins += reward.coins;
        this.hud.setCoins(this.save.progress.coins);
        this.toast.show(`${t('memory.rewardCoins')} +${reward.coins}`, 2600);
      }
      if (reward?.unlock === 'flower-crown') {
        this.startScreen.setUnlockedDudu(
          unlockedDuduAccessories(this.save.progress.memories.length)
        );
        this.toast.show(t('memory.rewardUnlock'), 3600);
      }

      this.persist();
      this.journal.refresh(this.save.progress);
            this.checkMemoryUnlocks();
            this.showMemory(id);
            this.updateControlsEnabled();
          }

    private showMemory(id: string): void {
      const memory = memoryById(id);
      if (!memory) return;
      const collected = this.save.progress.memories;
      const next = nextMemoryHint(collected);
      this.memoryPanel.show(memory, collected.length, collected.length >= MEMORY_COUNT, next?.hint[getLang()] ?? null);
      this.updateControlsEnabled();
    }

    private openMemoryFromJournal(id: string): void {
      if (!this.save.progress.memories.includes(id)) {
        const memory = memoryById(id);
        if (memory) this.toast.show(memory.hint[getLang()], 2600);
        return;
      }
      this.showMemory(id);
    }

    private startFinale(): void {
      if (this.finaleActive) return;
      this.finaleActive = true;
      this.finalePanel.close();
      this.memoryPanel.close();
      this.journal.close();
      this.controls.setEnabled(false);
      this.bubu.stop();
      this.dudu.stop();

      this.clock.setTime(0.985);
      this.lanterns.start();
      this.audio.play('sparkle');
      this.finalePanel.show();
      this.statusRefresh = 0;
      this.sayDudu(
        {
          id: 'Adek, lihat ke langit. Ini yang aku siapin paling lama.',
          en: 'Adek, look at the sky. This is the part I prepared the longest.'
        },
        5.2
      );

      this.finaleTimer = window.setInterval(() => {
        if (!this.finaleActive) return;
        const spots = fireworkPositions();
        const spot = spots[Math.floor(Math.random() * spots.length)];
        this.particles.burst('star', spot, 14, 2.6);
        this.particles.burst('heart', spot.clone().setY(spot.y - 0.6), 4, 1.8);
      }, 1500);
    }

    private endFinale(): void {
      if (!this.finaleActive) return;
      this.finaleActive = false;
      window.clearInterval(this.finaleTimer);
      this.finaleTimer = 0;
      this.lanterns.stop();
      this.save.progress.finaleSeen = true;
      this.persist();
      this.journal.refresh(this.save.progress);
      this.clock.setTime(0.3);
      this.updateControlsEnabled();
    }

    private maybeStartBirthday(): void {
      if (this.birthdayActive) return;
      const params = new URLSearchParams(window.location.search);
      const forced = params.get('birthday');
      const event =
        forced === 'bubu' || forced === 'dudu'
          ? BIRTHDAYS.find((entry) => entry.character === forced) ?? null
          : birthdayOn(new Date());

      if (!event) return;
      const key = `${new Date().getFullYear()}-${event.character}`;
      if (this.save.progress.birthdaySeen.includes(key) && forced === null) return;

      this.birthdayActive = true;
      this.activeBirthday = event;
      this.birthdayPanel.show(event);
      this.controls.setEnabled(false);
      if (!this.save.progress.birthdaySeen.includes(key)) {
        this.save.progress.birthdaySeen.push(key);
        this.persist();
      }
    }

    /** Runs after the birthday card is dismissed: balloons, fireworks, wishes. */
    private celebrate(): void {
      this.birthdayActive = false;
      this.updateControlsEnabled();
      const event = this.activeBirthday ?? birthdayOn(new Date()) ?? BIRTHDAYS[0];
      this.activeBirthday = null;
      const name = event.character === 'bubu' ? LOVE.playerRealName : LOVE.companionRealName;
      this.toast.show(t('birthday.toast').replace('{name}', name), 4200);
      this.clock.setTime(0.9);
      this.audio.play('sparkle');

      let bursts = 0;
      this.birthdayTimer = window.setInterval(() => {
        bursts += 1;
        const spots = fireworkPositions();
        const spot = spots[bursts % spots.length];
        this.particles.burst('star', spot, 16, 2.8);
        this.particles.burst('petal', spot.clone().setY(spot.y - 1.2), 6, 1.6);
        if (bursts >= 10) {
          window.clearInterval(this.birthdayTimer);
          this.birthdayTimer = 0;
        }
      }, 900);

      this.bubu.playEmote('dance', 3);
      this.dudu.playEmote('happy', 2.6);
      this.statusRefresh = 0;
      this.sayBubu(
        {
          id: 'Mas denikuu! Kembang apinya bagus banget. Aku nangis dikit, boleh ya.',
          en: 'Mas denikuu! The fireworks are so pretty. I am crying a little, is that okay?'
        },
        5
      );
    }

  private petCharacter(character: Character, who: 'bubu' | 'dudu'): void {
    character.pop();
      this.audio.play('pop');
    const head = character.getHeadWorldPosition(new THREE.Vector3());
    head.y += 0.35;
    this.particles.burst('heart', head, 7, 1.1);
    this.particles.burst('star', head, 4, 1.4);
    if (who === 'bubu') {
      this.sayDudu(
        {
          id: 'Hehe, adek ihankuu manisnya kebangetan. Aku mau simpan di bank hati.',
          en: 'Hehe, adek ihankuu is unbearably sweet. I am saving this in the heart bank.'
        },
        3.4
      );
    } else {
      this.sayBubu(
        {
          id: 'Mas denikuu jangan kaget, aku cuma pengen nyolek pipi kamu.',
          en: 'Mas denikuu do not be startled, I just wanted to poke your cheek.'
        },
        3.4
      );
    }
  }

  private performEmote(emote: EmoteId): void {
      if (this.mode !== 'playing') return;
      this.audio.play(emote === 'kiss' || emote === 'hug' ? 'sparkle' : 'ding');
      this.bubu.clearDestination();
      this.dudu.clearDestination();
      this.bubu.playEmote(emote, emote === 'dance' ? 2.8 : 2.2);

    const reaction = EMOTE_REACTIONS[emote];
    if (reaction) this.sayDudu(reaction, 4.2);

    const bubuPos = this.bubu.root.position;
    const facing = this.bubu.getFacing();
    const forward = this.tmp.set(Math.sin(facing), 0, Math.cos(facing));
    const side = this.tmpB.set(Math.cos(facing), 0, -Math.sin(facing));

    if (emote === 'hug' || emote === 'kiss') {
      const target = bubuPos.clone().add(forward.clone().multiplyScalar(1.05));
      this.island.clampPosition(target, 0.4);
      this.dudu.root.position.copy(target);
      this.dudu.playEmote(emote === 'kiss' ? 'kiss' : 'hug', 2.4);
      this.dudu.faceToward(bubuPos, 1);
      this.bubu.faceToward(this.dudu.root.position, 1);
      this.coupleUntil = this.elapsed + 2.6;
      const heartPoint = target.clone().add(bubuPos).multiplyScalar(0.5);
      heartPoint.y = 1.35;
      window.setTimeout(() => {
        this.particles.burst('heart', heartPoint, 12, 1.4);
        this.particles.ringOfHearts(heartPoint, 0.7, 9);
      }, 700);
    } else if (emote === 'hold') {
      const target = bubuPos
        .clone()
        .add(side.clone().multiplyScalar(0.92));
      this.island.clampPosition(target, 0.4);
      this.dudu.root.position.copy(target);
      this.dudu.faceToward(bubuPos, 1);
      this.bubu.faceToward(this.dudu.root.position, 1);
      this.dudu.playEmote('hold', 2.6);
      this.coupleUntil = this.elapsed + 2.6;
      this.particles.burst('heart', target.clone().setY(1.2), 5, 1);
    } else {
      const duduReaction: Record<string, 'happy' | 'shy' | 'wave' | 'dance' | 'hug'> = {
        happy: 'happy',
        shy: 'shy',
        wave: 'wave',
        dance: 'dance'
      };
      const kind = duduReaction[emote];
      if (kind) {
        window.setTimeout(() => this.dudu.playEmote(kind, 1.8), 320);
      }
    }

    this.bubbles.anchor('dudu', this.dudu.getHeadWorldPosition(this.headDudu));
  }

  private updateCompanion(): void {
    const playerPos = this.bubu.root.position;
    const duduPos = this.dudu.root.position;
    const distance = Math.hypot(playerPos.x - duduPos.x, playerPos.z - duduPos.z);

    if (this.elapsed < this.coupleUntil) {
      this.dudu.setBlush(1);
      return;
    }

    if (this.duduSleeping) {
      this.dudu.setBlush(0.35);
        if (!this.dudu.isEmoting()) this.dudu.playEmote('sleep', 30);
        if (distance < 2.2) {
          this.duduSleeping = false;
          this.dudu.playEmote('happy', 1.4);
          this.sayDudu(
            {
              id: 'Aku bangun. Ternyata yang datang bikin mimpi aku kalah manis.',
              en: 'I am awake. Turns out the one arriving is sweeter than my dream.'
            },
            3.4
          );
        }
        return;
      }

    this.dudu.setBlush(distance < 1.7 ? 1 : distance < 3.4 ? 0.7 : 0.4);

    if (distance > 2.1) {
      const facing = this.bubu.getFacing();
      const behind = this.tmp.set(
        playerPos.x - Math.sin(facing) * 1.5,
        0,
        playerPos.z - Math.cos(facing) * 1.5
      );
      this.island.clampPosition(behind, 0.4);
      this.dudu.setDestination(behind.x, behind.z);
    } else if (distance < 1.4 && !this.dudu.isEmoting()) {
      this.dudu.clearDestination();
      if (this.elapsed > this.nextCompanionAction - 6) {
        this.dudu.setExpression('shy');
        this.dudu.setBlush(1);
      }
    }

    if (distance > 8.5) {
      this.island.clampPosition(playerPos.clone(), 0.4);
      const target = playerPos
        .clone()
        .add(this.tmp.set(Math.sin(this.bubu.getFacing()), 0, Math.cos(this.bubu.getFacing())).multiplyScalar(-1.8));
      this.dudu.root.position.copy(target);
      this.particles.burst('star', this.dudu.getHeadWorldPosition(this.tmp), 5, 1);
    }

    if (this.elapsed >= this.nextCompanionAction) {
          this.runCompanionAction(distance);
          this.nextCompanionAction = this.elapsed + 22 + Math.random() * 14;
        }
      }

  private runCompanionAction(distance: number): void {
    if (this.mode !== 'playing' || distance > 3.2) return;
    const roll = Math.random();

    if (roll < 0.4) {
      this.dudu.playEmote('happy', 2);
            this.burstAt(this.dudu.getHeadWorldPosition(this.tmp), 'petal', 6, 0.7);
            this.sayDudu(DUDU_FLOWER[Math.floor(Math.random() * DUDU_FLOWER.length)], 4.6);
          } else if (roll < 0.72) {
      this.duduSleeping = true;
      this.dudu.clearDestination();
      this.dudu.playEmote('sleep', 8);
      this.sayDudu(DUDU_SLEEP[0], 4);
    } else {
      this.dudu.playEmote('shy', 3);
      this.sayDudu(DUDU_PROXIMITY[Math.floor(Math.random() * DUDU_PROXIMITY.length)], 4.2);
    }
  }

  private chaseHearts(distance: number): void {
    if (this.elapsed < this.nextHeartBeat) return;
    if (distance > 1.9) return;
    this.nextHeartBeat = this.elapsed + (distance < 1.2 ? 0.9 : 1.5);
    const point = this.bubu
      .getHeadWorldPosition(new THREE.Vector3())
      .add(this.dudu.getHeadWorldPosition(new THREE.Vector3()))
      .multiplyScalar(0.5);
    point.y = Math.max(this.bubu.root.position.y, this.dudu.root.position.y) + 1.55;
    this.particles.burst('heart', point, distance < 1.2 ? 3 : 2, 0.9);
  }

  private burstAt(position: THREE.Vector3, kind: 'heart' | 'star' | 'petal', count: number, spread = 1): void {
    this.particles.burst(kind, position, count, spread);
  }

  private updateShowcase(dt: number, time: number): void {
    this.bubu.faceToward(this.dudu.root.position, dt * 0.9);
    this.dudu.faceToward(this.bubu.root.position, dt * 0.9);
    this.bubu.setBlush(0.9);
    this.dudu.setBlush(0.85);

    if (time > this.nextShowcaseEmote) {
      this.nextShowcaseEmote = time + 4 + Math.random() * 4;
      const roll = Math.random();
      if (roll < 0.4) {
        this.bubu.playEmote('happy', 1.8);
        this.dudu.playEmote('wave', 1.6);
      } else if (roll < 0.7) {
        this.dudu.playEmote('shy', 2);
      } else {
        this.bubu.playEmote('wave', 1.6);
        this.dudu.playEmote('happy', 1.8);
      }
    }

    const point = this.bubu
      .getHeadWorldPosition(this.tmp)
      .add(this.dudu.getHeadWorldPosition(this.tmpB))
      .multiplyScalar(0.5);
    point.y += 0.4;
    if (time > this.nextHeartBeat) {
      this.nextHeartBeat = time + 1.4;
      this.particles.burst('heart', point, 2, 0.8);
    }
  }

      /**
       * Frames the pair inside the area the start panel leaves free: above the
       * sheet on phones, to the right of it on desktop. Offsetting the camera
       * target is enough, so the characters never need to be moved.
       */
      private computeShowcaseFocus(): THREE.Vector3 {
        this.midPoint
          .copy(this.bubu.root.position)
          .add(this.dudu.root.position)
          .multiplyScalar(0.5);
        this.midPoint.y = 1;

        const now = performance.now();
        if (!this.showcasePanelRect || now - this.showcaseRectAt > 220) {
          const panel = document.querySelector<HTMLElement>('.start__inner');
          const rect = panel?.getBoundingClientRect();
          this.showcasePanelRect = {
            top: rect?.top ?? window.innerHeight * 0.6,
            right: rect?.right ?? 0
          };
          this.showcaseRectAt = now;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;
        const desktop = width >= 700;
        const targetX = desktop
          ? (this.showcasePanelRect.right + width) / 2
          : width / 2;
        const targetY = desktop
          ? height * 0.5
          : Math.max(92, this.showcasePanelRect.top * 0.52);

        const ndcX = (targetX / width) * 2 - 1;
        const ndcY = 1 - (targetY / height) * 2;

        const camera = this.rig.camera;
        const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * this.rig.getDistance();
        const halfWidth = halfHeight * camera.aspect;

        camera.updateMatrixWorld();
        this.axisRight.setFromMatrixColumn(camera.matrixWorld, 0);
        this.axisUp.setFromMatrixColumn(camera.matrixWorld, 1);

        return this.midPoint
          .addScaledVector(this.axisRight, -ndcX * halfWidth)
          .addScaledVector(this.axisUp, -ndcY * halfHeight);
      }

  private updateFarm(dt: number): void {
    this.farm.animate(this.elapsed);

    this.lastFarmSync += dt;
    const due = this.lastFarmSync > 0.35 || this.farmSyncDirty;
    if (!due) return;
    this.lastFarmSync = 0;
    this.farmSyncDirty = false;

    const now = Date.now();
    this.save.progress.plots = advanceAll(this.save.progress.plots, now);
    this.farm.sync(this.save.progress.plots, now);

    for (let i = 0; i < this.save.progress.plots.length; i += 1) {
      const plot = this.save.progress.plots[i];
      if (!plot.cropId) continue;
      if (isReady(plot) && Math.random() < 0.25) {
        const point = this.farm.tiles[i].getWorldPosition(this.tmp);
        point.y += 0.5;
        this.particles.burst('star', point, 1, 0.4);
      }
    }
  }

  private updateAnimals(dt: number): void {
    const active = this.mode === 'playing';
    const player = this.bubu.root.position;
    for (const animal of this.animals) {
      animal.update(dt, this.elapsed, player, active);
      if (animal.id !== 'jamal') {
        this.island.clampPosition(animal.root.position, 0.26);
      }
    }
  }

    private updateFootsteps(): void {
      if (this.bubu.getSpeed() < 0.7) return;
      if (this.elapsed < this.nextStepAt) return;
      this.nextStepAt = this.elapsed + 0.42 / Math.max(0.6, this.bubu.getSpeed() / 2.9);
      this.audio.play('step');
    }

  private updateStatus(): void {
    if (this.elapsed < this.statusRefresh) return;
    this.statusRefresh = this.elapsed + 0.6;
    const phase = this.clock.phase;
    const daylight = this.sky.daylightAt(this.clock.time);
    const label = t(`hud.${phase}`);
    this.hud.setStatus(daylight > 0.22 ? 'sun' : 'moon', label, this.clock.day);
  }

  private updateIdleChatter(): void {
    if (this.mode !== 'playing' || this.elapsed < this.nextIdleChatter) return;
    const speed = this.bubu.getSpeed();
    if (speed > 0.2) {
      this.nextIdleChatter = this.elapsed + 4;
      return;
    }
    this.nextIdleChatter = this.elapsed + 18 + Math.random() * 14;
    const line = DUDU_IDLE[Math.floor(Math.random() * DUDU_IDLE.length)];
    this.sayDudu(line, 5);
    if (Math.random() < 0.45) {
      window.setTimeout(() => {
        if (this.mode !== 'playing') return;
        this.sayBubu(BUBU_REPLIES[Math.floor(Math.random() * BUBU_REPLIES.length)], 4.6);
      }, 3000);
    }
  }

  private loop = (now: number): void => {
    this.raf = requestAnimationFrame(this.loop);
    if (this.paused) {
      this.lastTime = now;
      return;
    }

    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.elapsed += dt;

    this.clock.tick(dt);
    const time = this.clock.time;

    this.sky.update(dt, time, this.rig.camera.position, this.focusPoint);

    const daylight = this.sky.daylightAt(time);
    this.island.setFireflyAmount(
          THREE.MathUtils.clamp((1 - daylight * 1.6) * (this.lowEffects ? 0.4 : 1), 0, 1)
        );
        this.island.setNightLightIntensity(THREE.MathUtils.clamp(1 - daylight * 2.4, 0, 1));
        this.island.update(dt, this.elapsed);
                this.decor.setNight(THREE.MathUtils.clamp(1 - daylight * 2.4, 0, 1));
                this.decor.update(dt, this.elapsed);
        if (!this.lowEffects) {
          this.petals.update(dt, this.elapsed, THREE.MathUtils.clamp(daylight * 0.9, 0, 1));
        }
        this.chests.animate(dt, this.elapsed);
        this.lanterns.update(dt, this.elapsed);
                this.fog.update(dt, this.elapsed);

        if (this.mode === 'start') {
          this.updateShowcase(dt, this.elapsed);
          this.focusPoint.copy(this.computeShowcaseFocus());
        } else {
          this.updatePlayerInput();
          this.updateCompanion();
        }

        this.bubu.update(dt, this.elapsed);
        this.dudu.update(dt, this.elapsed);

        if (this.mode === 'playing') {
          this.island.clampPosition(this.bubu.root.position, 0.32);
          this.island.clampPosition(this.dudu.root.position, 0.4);
          this.updateStatus();
          this.updateIdleChatter();
          this.updateFarm(dt);
          this.updateAnimals(dt);
          this.updateFootsteps();
                    this.updateExploration(now);

                    if (now >= this.mapRefreshAt && !this.traveling) {
                      this.mapRefreshAt = now + 400;
                      this.refreshMap();
                    }

          if (this.pendingFishing && !this.isOverlayOpen()) {
            const pondDistance = Math.hypot(
              this.bubu.root.position.x - this.island.waterCenter.x,
              this.bubu.root.position.z - this.island.waterCenter.z
            );
            if (pondDistance < this.island.waterRadius + 2.3) this.startFishing();
            else if (!this.bubu.hasDestination()) this.pendingFishing = false;
          }

          const distance = Math.hypot(
            this.bubu.root.position.x - this.dudu.root.position.x,
            this.bubu.root.position.z - this.dudu.root.position.z
          );
          this.chaseHearts(distance);
          if (distance < 1.6) {
            this.bubu.setBlush(0.85);
          } else if (this.elapsed > this.coupleUntil) {
            this.bubu.setBlush(0.42);
          }
          this.focusPoint.copy(this.bubu.root.position);
          this.focusPoint.y += 0.9;
        } else {
          this.updateFarm(dt);
          this.updateAnimals(dt);
        }

    this.rig.update(dt, this.focusPoint);
    this.particles.update(dt);

    this.bubbles.anchor('bubu', this.bubu.getHeadWorldPosition(this.headBubu));
    this.bubbles.anchor('dudu', this.dudu.getHeadWorldPosition(this.headDudu));
    this.bubbles.update(this.rig.camera);

    this.renderer.render(this.scene, this.rig.camera);
    this.measurePerformance(now);
  };

  private updatePlayerInput(): void {
    const keyboard = this.controls.getKeyboardVector(KEYBOARD);
    let x = keyboard.x;
    let z = keyboard.z;
    const stick = this.hud.joystick;
    if (stick) {
      x += stick.vector.x;
      z += stick.vector.z;
    }
    const length = Math.hypot(x, z);
    if (length > 1) {
      x /= length;
      z /= length;
    }
    if (length > 0.08) {
          this.bubu.setInput(x, z);
        } else {
          this.bubu.setInput(0, 0);
        }
  }

  private measurePerformance(now: number): void {
      this.frames += 1;
      const windowMs = now - this.fpsWindowStart;
      if (windowMs < 1000) return;

      const fps = (this.frames * 1000) / windowMs;
      this.frames = 0;
      this.fpsWindowStart = now;

      if (this.lastQuality !== 'auto' || this.qualityReduced || this.mode !== 'playing') {
        this.slowSeconds = 0;
        return;
      }

      if (fps < 36) this.slowSeconds += 1;
      else this.slowSeconds = 0;

      if (this.slowSeconds >= 2) {
        this.qualityReduced = true;
        this.applyQuality('saver', true);
        this.toast.show(t('hud.qualityReduced'), 4200);
      }
    }

  private setQuality(quality: Quality): void {
    this.save.quality = quality;
    this.lastQuality = quality;
    this.qualityReduced = false;
    this.applyQuality(quality, false);
    this.hud.setQuality(quality);
    this.persist();
  }

  private applyQuality(quality: Quality, automatic: boolean): void {
    const dpr = window.devicePixelRatio || 1;
      this.lowEffects = quality === 'saver';
      this.petals.setVisible(!this.lowEffects);
      if (quality === 'saver') {
        this.renderer.setPixelRatio(Math.min(dpr, 1.3));
        this.shadowsEnabled = false;
        this.sky.setShadowQuality(false, 512);
      } else if (quality === 'sharp') {
        this.renderer.setPixelRatio(Math.min(dpr, 2));
        this.shadowsEnabled = true;
        this.sky.setShadowQuality(true, 1536);
      } else {
        this.renderer.setPixelRatio(Math.min(dpr, automatic ? 1.4 : 1.75));
        this.shadowsEnabled = !automatic;
        this.sky.setShadowQuality(!automatic, automatic ? 512 : 1024);
      }
      this.renderer.shadowMap.enabled = this.shadowsEnabled;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.sky.sunLight.castShadow = this.shadowsEnabled;
    }

  private setLanguage(lang: Lang): void {
    this.save.lang = lang;
    setLang(lang);
    this.persist();
    this.updateStatus();
    this.statusRefresh = 0;
  }

  private returnToStart(): void {
    this.mode = 'start';
    this.clearDialogueTimers();
      window.clearTimeout(this.birthdayTimer);
      window.clearInterval(this.birthdayTimer);
      window.clearInterval(this.fireworksTimer);
      window.clearInterval(this.finaleTimer);
      this.birthdayTimer = 0;
      this.fireworksTimer = 0;
      this.finaleTimer = 0;
      this.finaleActive = false;
      this.birthdayActive = false;
      this.activeBirthday = null;
      this.lanterns.stop();
      this.controls.setEnabled(false);
      this.hud.hide();
      this.hud.sheet.close();
      this.seedPicker.close();
      this.journal.close();
            this.mapSheet.close();
            this.discovery.clear();
            this.miniMap.element.classList.add('is-hidden');
            this.memoryPanel.close();
      if (this.birthdayPanel.isOpen()) this.birthdayPanel.close(false);
      if (this.finalePanel.isOpen()) this.finalePanel.close();
      this.pendingFishing = false;
      this.pendingPlot = null;
      if (this.fishingPanel.isOpen()) this.fishingPanel.close();
      this.bubbles.hide('bubu');
      this.bubbles.hide('dudu');
      this.bubu.stop();
      this.dudu.stop();
      this.bubu.setExpression('neutral');
      this.dudu.setExpression('neutral');
      this.bubu.root.position.set(-0.72, 0, 0.8);
      this.dudu.root.position.set(0.86, 0, 0.44);
      this.rig.setMode('showcase');
            this.rig.snapTo(new THREE.Vector3(0, 1.05, 0.6));
      this.startScreen.setLoadout(this.save.loadout);
      this.startScreen.show();
      this.persist();
    }

    private resetProgress(): void {
      clearSave();
      this.save = defaultSave(Date.now());
      this.applyLoadout(this.save.loadout, false);
      this.setLanguage(this.save.lang);
      this.setQuality(this.save.quality);
      this.startScreen.setLoadout(this.save.loadout);
      this.hud.setQuality(this.save.quality);
      this.hud.setCoins(this.save.progress.coins);
            this.hud.setSound(this.save.sound);
            this.seedPicker.setCoins(this.save.progress.coins);
            this.journal.refresh(this.save.progress);
      this.farm.sync(this.save.progress.plots, Date.now());
      this.farmSyncDirty = true;
      this.chests.sync(this.save.progress.memories);
            this.syncDecor();
            this.startScreen.setUnlockedDudu(unlockedDuduAccessories(0));
            this.save.progress.visitedZones = initialVisitedZones();
            this.fog.reset(this.save.progress.visitedZones);
            this.caveAnnounced = false;
            this.island.setCaveLocked(true);
            this.island.hideAllSpotMarkers();
            this.refreshMap();
      for (const animal of this.animals) {
        const def = animalById(animal.id);
        if (def) animal.root.position.set(def.home.x, 0, def.home.z);
      }
      this.toast.show(t('settings.resetDone'), 2600);
      this.returnToStart();
    }

    private persist(): void {
      this.save.lang = getLang();
      writeSave(this.save);
    }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.rig.setViewport(width / height);
  };

  private onVisibility = (): void => {
    this.paused = document.hidden;
    this.lastTime = performance.now();
  };

    private onPageHide = (): void => {
      this.persist();
    };

    private unlockAudio = (): void => {
      this.audio.unlock();
    };

    private onUiClick = (event: Event): void => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('button')) return;
      if (target.closest('.emote-dock, .fishing, .memory, .finale, .birthday')) return;
      this.audio.play('ui');
    };

    private setVolume(volume: number): void {
      this.save.sound.volume = volume;
      this.audio.applySettings(this.save.sound);
      this.persist();
    }

    private toggleMusic(): void {
      this.save.sound.music = !this.save.sound.music;
      this.audio.applySettings(this.save.sound);
      if (this.save.sound.music) this.audio.unlock();
      this.persist();
    }

    private toggleSfx(): void {
      this.save.sound.sfx = !this.save.sound.sfx;
      this.audio.applySettings(this.save.sound);
      this.persist();
    }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.clearDialogueTimers();
        this.audio.dispose();
        this.controls.dispose();
        this.startScreen.dispose();
        this.particles.dispose();
        this.petals.dispose();
                this.decor.dispose();
                this.renderer.dispose();
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('visibilitychange', this.onVisibility);
        window.removeEventListener('pagehide', this.onPageHide);
        window.removeEventListener('pointerdown', this.unlockAudio);
        window.removeEventListener('keydown', this.unlockAudio);
        document.removeEventListener('click', this.onUiClick);
    }
}