import { ANIMALS, CROPS, cropById } from '../data/crops';
import { FISH, fishById, junkById, type FishTier } from '../data/fish';
import { giftResult } from '../data/gifts';
import {
  BIRTHDAYS,
  FLOWER_CROWN_MEMORIES,
  MEMORIES,
  MEMORY_COUNT,
  daysUntilBirthday
} from '../data/memories';
import { LOVE } from '../data/config';
import { DECOR_ITEMS, DECOR_SLOTS, decorById, type DecorState } from '../data/decor';
import { SPOTS, ZONES, zoneById } from '../data/zones';
import { zoneProgress } from '../systems/exploration';
import type { Progress } from '../save/save';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';
import { Sheet } from './sheet';

export type JournalTab = 'bag' | 'fish' | 'crops' | 'animals' | 'memories' | 'us' | 'explore' | 'home';

export interface JournalHandlers {
  onSell: (itemId: string, quantity: number) => void;
  onGift: (itemId: string) => void;
  onRename: (animalId: string, name: string) => void;
  onOpenMemory: (id: string) => void;
  onReplayFinale: () => void;
  onOpenMap: () => void;
  onBuyDecor: (itemId: string) => void;
  onPlaceDecor: (slot: number, itemId: string) => void;
  onStoreDecor: (slot: number) => void;
  onMoveDecor: (fromSlot: number, toSlot: number) => void;
  onSetDecorPhoto: (slot: number, photoIndex: number) => void;
  onSetDecorFish: (slot: number, fishId: string | null) => void;
  onClose?: () => void;
}

const TABS: Array<[JournalTab, 'basket' | 'fish' | 'seed' | 'paw' | 'heart' | 'book' | 'globe' | 'home']> = [
  ['bag', 'basket'],
  ['fish', 'fish'],
  ['crops', 'seed'],
  ['animals', 'paw'],
  ['memories', 'heart'],
  ['explore', 'globe'],
  ['home', 'home'],
  ['us', 'book']
];

const DECOR_SWATCHES: Record<string, number> = {
  'photo-frame': 0xd9a58c,
  'aquarium': 0x9fd3d0,
  'flower-pots': 0xd98a6a,
  'harvest-shelf': 0xc09068,
  'garden-lamp': 0xffd79a,
  'reading-bench': 0x8a6152,
  'tea-table': 0xe08d9e,
  'picnic-rug': 0xe08d9e
};

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

function birthdayLabel(month: number, day: number): string {
  if (getLang() === 'en') {
    return `${MONTHS_ID[month - 1]} ${day}`;
  }
  return `${day} ${MONTHS_ID[month - 1]}`;
}

export class Journal {
  readonly sheet: Sheet;
  private tab: JournalTab = 'bag';
  private homeSlot: number | null = null;
  private progress: Progress | null = null;
  private readonly handlers: JournalHandlers;
  private readonly tabs = el('div', {
    className: 'segmented segmented--wrap',
    attrs: { role: 'tablist', 'aria-label': 'Jurnal' }
  });

  constructor(handlers: JournalHandlers) {
    this.handlers = handlers;
      this.sheet = new Sheet({ onClose: () => handlers.onClose?.() });
  }

  open(progress: Progress, tab: JournalTab = 'bag', homeSlot: number | null = null): void {
    this.progress = progress;
    this.tab = tab;
    this.homeSlot = homeSlot;
    this.render();
    this.sheet.open();
  }

  close(): void {
    this.sheet.close();
  }

  isOpen(): boolean {
    return this.sheet.isOpen();
  }

  refresh(progress: Progress): void {
    this.progress = progress;
    if (this.sheet.isOpen()) this.render();
  }

  private render(): void {
    if (!this.progress) return;
    const lang = getLang();
    this.sheet.setTitle(t('journal.title'));
    this.sheet.setCloseLabel(t('journal.close'));

    this.tabs.replaceChildren(
          ...TABS.map(([id, iconName]) =>
            el('button', {
              className: 'segmented__btn',
              attrs: {
                type: 'button',
                role: 'tab',
                'aria-selected': this.tab === id ? 'true' : 'false',
                'aria-pressed': this.tab === id ? 'true' : 'false'
              },
              html: `${icon(iconName, 15)}<span>${t(`journal.tab.${id}`)}</span>`,
              on: {
                click: () => {
                  this.tab = id;
                                this.homeSlot = null;
                                this.render();
                              }
                            }
            })
          )
        );

    const body: HTMLElement[] = [
      el('div', { className: 'sheet-meta' }, [
        el('span', { html: `${icon('coin', 14)}<span>${this.progress.coins} ${t('journal.coins')}</span>` })
      ]),
      this.tabs
    ];

    if (this.tab === 'bag') body.push(this.renderBag(lang));
    else if (this.tab === 'fish') body.push(this.renderFish(lang));
    else if (this.tab === 'crops') body.push(this.renderCrops(lang));
        else if (this.tab === 'memories') body.push(this.renderMemories(lang));
        else if (this.tab === 'explore') body.push(this.renderExplore(lang));
            else if (this.tab === 'home') body.push(this.renderHome(lang));
            else if (this.tab === 'us') body.push(this.renderProfiles());
            else body.push(this.renderAnimals(lang));

        this.sheet.setContent(body);
      }

      private renderExplore(lang: 'id' | 'en'): HTMLElement {
        const progress = this.progress!;
        const summary = zoneProgress(progress.visitedZones, progress.discoveredSpots);

        const zoneRows = ZONES.map((zone) => {
          const visited = progress.visitedZones.includes(zone.id);
          const unlocked =
            visited ||
            zone.unlock === 'start' ||
            (typeof zone.unlock === 'object' && progress.memories.length >= zone.unlock.memories);

          return el('div', { className: `explore-zone ${visited ? 'is-visited' : unlocked ? 'is-open' : 'is-locked'}` }, [
            el('span', {
              className: 'explore-zone__dot',
              attrs: { style: `background:#${zone.color.toString(16).padStart(6, '0')}` }
            }),
            el('div', { className: 'explore-zone__info' }, [
              el('strong', { text: visited || unlocked ? zone.name[lang] : t('map.unknown') }),
              el('span', { text: visited ? zone.blurb[lang] : zone.hint[lang] }),
              el('span', {
                className: 'explore-zone__state',
                text: visited ? t('explore.visited') : unlocked ? t('explore.opened') : t('explore.lockedZone')
              })
            ])
          ]);
        });

        const spotRows = SPOTS.map((spot) => {
          const found = progress.discoveredSpots.includes(spot.id);
          const zoneVisited = progress.visitedZones.includes(spot.zone);
          const zoneName = zoneById(spot.zone)?.name[lang] ?? spot.zone;
          return el('div', { className: `explore-spot ${found ? 'is-found' : 'is-hidden'}` }, [
            el('span', { className: 'explore-spot__icon', html: icon(found ? 'flower' : 'lock', 14) }),
            el('div', { className: 'explore-spot__info' }, [
              el('strong', { text: found ? spot.name[lang] : t('explore.lockedSpot') }),
              el('span', {
                text: found ? spot.blurb[lang] : zoneVisited ? `${spot.name[lang]} · ${zoneName}` : zoneName
              })
            ])
          ]);
        });

        return el('div', { className: 'explore-list' }, [
          el('div', { className: 'codex-progress' }, [
            el('span', {
              html: `${icon('globe', 14)}<span>${t('explore.progress')
                .replace('{zones}', String(summary.zones))
                .replace('{totalZones}', String(summary.totalZones))
                .replace('{spots}', String(summary.spots))
                .replace('{totalSpots}', String(summary.totalSpots))}</span>`
            })
          ]),
          el(
            'button',
            {
              className: 'btn btn--quiet',
              attrs: { type: 'button' },
              on: { click: () => this.handlers.onOpenMap() }
            },
            [el('span', { html: icon('globe', 16) }), el('span', { text: t('explore.openMap') })]
          ),
          el('span', { className: 'field-label', text: t('explore.zones') }),
          ...zoneRows,
          el('span', { className: 'field-label', text: t('explore.spots') }),
          ...spotRows
        ]);
      }

      private renderHome(lang: 'id' | 'en'): HTMLElement {
        return this.homeSlot === null
          ? this.renderHomeOverview(lang)
          : this.renderHomeSlot(lang, this.homeSlot);
      }

      private renderHomeOverview(lang: 'id' | 'en'): HTMLElement {
        const progress = this.progress!;
        return el('div', { className: 'decor-view' }, [
          el('p', { className: 'field-note', text: t('decor.hint') }),
          el('span', { className: 'field-label', text: t('decor.shop') }),
          this.renderDecorShop(lang, progress),
          el('span', { className: 'field-label', text: t('decor.yard') }),
          this.renderDecorYard(lang, progress)
        ]);
      }

      private renderDecorShop(lang: 'id' | 'en', progress: Progress): HTMLElement {
        const rows = DECOR_ITEMS.map((item) => {
          const owned = progress.decor.owned.includes(item.id);
          const affordable = progress.coins >= item.price;
          const swatch = DECOR_SWATCHES[item.id] ?? 0xd9a58c;
          const action = owned
            ? el('span', { className: 'decor-shop-row__state', text: t('decor.owned') })
            : el(
                'button',
                {
                  className: 'btn btn--quiet btn--tiny',
                  attrs: affordable ? { type: 'button' } : { type: 'button', disabled: 'true' },
                  html: `${icon('coin', 13)}<span>${item.price}</span>`,
                  on: affordable ? { click: () => this.handlers.onBuyDecor(item.id) } : {}
                },
                []
              );
          return el('div', { className: 'decor-shop-row' }, [
            el('span', {
              className: 'decor-shop-row__swatch',
              attrs: { style: `background:#${swatch.toString(16).padStart(6, '0')}` }
            }),
            el('div', { className: 'decor-shop-row__info' }, [
              el('strong', { text: item.name[lang] }),
              el('span', { text: item.blurb[lang] })
            ]),
            action
          ]);
        });
        return el('div', { className: 'decor-shop-list' }, rows);
      }

      private renderDecorYard(lang: 'id' | 'en', progress: Progress): HTMLElement {
        const chips = DECOR_SLOTS.map((_slot, index) => {
          const placed = progress.decor.placed.find((entry) => entry.slot === index);
          const def = placed ? decorById(placed.item) : undefined;
          const swatch = placed ? DECOR_SWATCHES[placed.item] : undefined;
          return el(
            'button',
            {
              className: `decor-slot ${placed ? 'is-filled' : 'is-empty'}`,
              attrs: { type: 'button' },
              on: {
                click: () => {
                  this.homeSlot = index;
                  this.render();
                }
              }
            },
            [
              el('span', {
                className: 'decor-slot__dot',
                attrs:
                  swatch != null ? { style: `background:#${swatch.toString(16).padStart(6, '0')}` } : {}
              }),
              el('span', {
                className: 'decor-slot__label',
                text: placed ? def?.name[lang] ?? placed.item : t('decor.empty')
              })
            ]
          );
        });
        return el('div', { className: 'decor-slot-grid' }, chips);
      }

      private renderHomeSlot(lang: 'id' | 'en', slot: number): HTMLElement {
        const progress = this.progress!;
        const placed = progress.decor.placed.find((entry) => entry.slot === slot);
        const back = el(
          'button',
          {
            className: 'btn btn--ghost btn--tiny',
            attrs: { type: 'button' },
            on: {
              click: () => {
                this.homeSlot = null;
                this.render();
              }
            }
          },
          [el('span', { html: icon('chevron', 13) }), el('span', { text: t('decor.back') })]
        );

        const head = el('span', { className: 'field-label', text: this.slotLabel(slot) });

        if (!placed) {
          const options = this.placeableIds(progress.decor);
          const body =
            options.length === 0
              ? el('p', { className: 'field-note', text: t('decor.noPlaceable') })
              : el(
                  'div',
                  { className: 'decor-place-list' },
                  options.map((itemId) => {
                    const def = decorById(itemId)!;
                    const swatch = DECOR_SWATCHES[itemId] ?? 0xd9a58c;
                    return el(
                      'button',
                      {
                        className: 'btn btn--ghost btn--tiny decor-place-row',
                        attrs: { type: 'button' },
                        on: { click: () => this.handlers.onPlaceDecor(slot, itemId) }
                      },
                      [
                        el('span', {
                          className: 'decor-place-row__swatch',
                          attrs: { style: `background:#${swatch.toString(16).padStart(6, '0')}` }
                        }),
                        el('span', { text: def.name[lang] })
                      ]
                    );
                  })
                );
          return el('div', { className: 'decor-view decor-view--slot' }, [
            back,
            head,
            el('span', { className: 'field-label', text: t('decor.place') }),
            body
          ]);
        }

        const def = decorById(placed.item)!;
        const parts: HTMLElement[] = [
          back,
          head,
          el('div', { className: 'decor-detail-head' }, [
            el('strong', { text: def.name[lang] }),
            el('span', { text: def.blurb[lang] })
          ])
        ];

        if (def.special === 'photo') {
          parts.push(el('span', { className: 'field-label', text: t('decor.photo') }));
          parts.push(
            this.decorChoiceRow(
              LOVE.photos.map((_file, index) => ({
                key: String(index),
                label: t('decor.photoLabel').replace('{n}', String(index + 1)),
                color: 0xd9a58c,
                active: placed.photo === index,
                onClick: () => this.handlers.onSetDecorPhoto(slot, index)
              }))
            )
          );
        }

        if (def.special === 'fish') {
          parts.push(el('span', { className: 'field-label', text: t('decor.fish') }));
          const choices = progress.collection.fish.map((fishId) => {
            const fish = fishById(fishId)!;
            return {
              key: fishId,
              label: fish.name[lang],
              color: fish.bodyColor,
              active: placed.fish === fishId,
              onClick: () => this.handlers.onSetDecorFish(slot, fishId)
            };
          });
          choices.push({
            key: '__empty__',
            label: t('decor.fishEmpty'),
            color: 0xd8cfc0,
            active: placed.fish === null,
            onClick: () => this.handlers.onSetDecorFish(slot, null)
          });
          parts.push(
            progress.collection.fish.length === 0
              ? el('p', { className: 'field-note', text: t('decor.noFish') })
              : this.decorChoiceRow(choices)
          );
        }

        const emptySlots = DECOR_SLOTS.map((_entry, index) => index).filter(
          (index) => !progress.decor.placed.some((entry) => entry.slot === index)
        );
        parts.push(el('span', { className: 'field-label', text: t('decor.move') }));
        if (emptySlots.length === 0) {
          parts.push(el('p', { className: 'field-note', text: t('decor.noEmpty') }));
        } else {
          parts.push(
            el(
              'div',
              { className: 'decor-choice-row' },
              emptySlots.map((target) =>
                el(
                  'button',
                  {
                    className: 'decor-choice',
                    attrs: { type: 'button' },
                    on: {
                      click: () => {
                        this.homeSlot = target;
                        this.handlers.onMoveDecor(slot, target);
                      }
                    }
                  },
                  [el('span', { text: this.slotLabel(target) })]
                )
              )
            )
          );
        }

        parts.push(
          el(
            'button',
            {
              className: 'btn btn--danger',
              attrs: { type: 'button' },
              on: { click: () => this.handlers.onStoreDecor(slot) }
            },
            [el('span', { html: icon('trash', 13) }), el('span', { text: t('decor.store') })]
          )
        );

        return el('div', { className: 'decor-view decor-view--slot' }, parts);
      }

      private decorChoiceRow(
        choices: Array<{ key: string; label: string; color: number; active: boolean; onClick: () => void }>
      ): HTMLElement {
        return el(
          'div',
          { className: 'decor-choice-row' },
          choices.map((choice) =>
            el(
              'button',
              {
                className: 'decor-choice',
                attrs: { type: 'button', 'aria-pressed': choice.active ? 'true' : 'false' },
                on: { click: choice.onClick }
              },
              [
                el('span', {
                  className: 'decor-choice__dot',
                  attrs: { style: `background:#${choice.color.toString(16).padStart(6, '0')}` }
                }),
                el('span', { text: choice.label })
              ]
            )
          )
        );
      }

      private placeableIds(decor: DecorState): string[] {
        return decor.owned.filter((id) => !decor.placed.some((entry) => entry.item === id));
      }

      private slotLabel(slot: number): string {
        return t('decor.slot').replace('{n}', String(slot + 1));
      }

      private renderMemories(lang: 'id' | 'en'): HTMLElement {
        const collected = new Set(this.progress!.memories);
        const list = MEMORIES.map((memory) => {
          const found = collected.has(memory.id);
          const card = el('div', { className: `memory-item ${found ? 'is-found' : 'is-locked'}` }, [
            el('div', { className: 'memory-item__head' }, [
              el('span', { className: 'memory-item__index', text: String(memory.index).padStart(2, '0') }),
              el('strong', { text: found ? memory.title[lang] : t('memory.locked') })
            ]),
            el('p', {
              className: 'memory-item__body',
              text: found ? memory.letter[lang] : memory.hint[lang]
            }),
            found
              ? el(
                  'button',
                  {
                    className: 'btn btn--ghost btn--tiny',
                    attrs: { type: 'button' },
                    on: { click: () => this.handlers.onOpenMemory(memory.id) }
                  },
                  [el('span', { html: icon('book', 13) }), el('span', { text: t('finale.replay') })]
                )
              : null
          ]);
          return card;
        });

        return el('div', { className: 'memory-list' }, [
          el('div', { className: 'codex-progress' }, [
            el('span', {
              html: `${icon('heart', 14)}<span>${collected.size} / ${MEMORY_COUNT} ${t('memory.counter')}</span>`
            })
          ]),
          ...list
        ]);
      }

      private renderProfiles(): HTMLElement {
        const progress = this.progress!;
        const today = new Date();

        const cards = BIRTHDAYS.map((birthday) => {
          const days = daysUntilBirthday(today, birthday);
          const isToday = days === 0;
          const isBubu = birthday.character === 'bubu';
          return el('div', { className: `profile-card profile-card--${birthday.character}` }, [
            el('div', { className: 'profile-card__head' }, [
              el('strong', {
                text: isBubu ? t('profile.bubu') : t('profile.dudu')
              }),
              el('span', { className: 'profile-card__role', text: isBubu ? 'BUBU' : 'DUDU' })
            ]),
            el('p', {
              className: 'profile-card__tag',
              text: isBubu ? t('profile.bubuTag') : t('profile.duduTag')
            }),
            el('dl', { className: 'profile-card__facts' }, [
              el('div', {}, [
                el('dt', { text: t('profile.birthday') }),
                el('dd', {
                  text: `${birthdayLabel(birthday.date.month, birthday.date.day)} · ${
                    isToday ? t('profile.today') : `${days} ${t('profile.days')}`
                  }`
                })
              ]),
              el('div', {}, [
                el('dt', { text: t('profile.love') }),
                el('dd', { text: `${progress.memories.length} ${t('profile.memories')}` })
              ])
            ])
          ]);
        });

        const crownUnlocked = progress.memories.length >= FLOWER_CROWN_MEMORIES;
        const extra: HTMLElement[] = [];
        if (!crownUnlocked) {
          extra.push(el('p', { className: 'field-note', text: t('profile.flowerCrownHint') }));
        }
        if (progress.finaleSeen) {
          extra.push(
            el(
              'button',
              {
                className: 'btn btn--quiet',
                attrs: { type: 'button' },
                on: { click: () => this.handlers.onReplayFinale() }
              },
              [el('span', { html: icon('sparkle', 16) }), el('span', { text: t('finale.replay') })]
            )
          );
        }

        return el('div', { className: 'profile-list' }, [
          el('p', {
            className: 'field-note',
            text: `${LOVE.title} · ${LOVE.tagline}`
          }),
          ...cards,
          ...extra
        ]);
      }

  private renderBag(lang: 'id' | 'en'): HTMLElement {
    const progress = this.progress!;
    const entries = Object.entries(progress.inventory).filter(([, count]) => count > 0);
    if (entries.length === 0) {
      return el('p', { className: 'field-note', text: t('journal.emptyBag') });
    }

    const rows = entries.map(([id, count]) => {
          const crop = cropById(id);
          const fish = fishById(id);
          const junk = junkById(id);
          const label = crop ? crop.name[lang] : fish ? fish.name[lang] : junk ? junk.name[lang] : id;
          const price = crop ? crop.sellPrice : fish ? fish.sell : junk ? junk.sell : 0;
          const color = crop?.bloomColor ?? fish?.bodyColor ?? junk?.color ?? 0xd9a58c;
              const favorited = progress.giftedFavorites.includes(id);
              const giftable = giftResult(id, progress.giftedFavorites) !== null;
              const actions: HTMLElement[] = [];
              if (giftable) {
                actions.push(
                  el(
                    'button',
                    {
                      className: 'btn btn--ghost btn--tiny',
                      attrs: { type: 'button' },
                      html: `${icon('gift', 13)}<span>${t('journal.giftOne')}</span>`,
                      on: { click: () => this.handlers.onGift(id) }
                    },
                    []
                  )
                );
              }
              if (price > 0) {
                actions.push(
                  el(
                    'button',
                    {
                      className: 'btn btn--quiet btn--tiny',
                      attrs: { type: 'button' },
                      text: t('journal.sellOne'),
                      on: { click: () => this.handlers.onSell(id, 1) }
                    },
                    []
                  ),
                  el(
                    'button',
                    {
                      className: 'btn btn--quiet btn--tiny',
                      attrs: { type: 'button' },
                      text: t('journal.sellAll'),
                      on: { click: () => this.handlers.onSell(id, count) }
                    },
                    []
                  )
                );
              }
              const note = favorited ? t('journal.giftDone') : price === 0 && !giftable ? t('farm.favorite') : '';
              return el('div', { className: 'bag-row' }, [
                el('span', {
                  className: 'bag-row__swatch',
                  attrs: { style: `background:#${color.toString(16).padStart(6, '0')}` }
                }),
                el('div', { className: 'bag-row__info' }, [
                  el('strong', { text: label }),
                  el('span', { text: `${count}×${price > 0 ? ` · ${price} ${t('journal.coins')}` : ''}` })
                ]),
                actions.length > 0
                  ? el('div', { className: 'bag-row__actions' }, actions)
                  : note
                  ? el('span', { className: 'bag-row__note', text: note })
                  : null
          ]);
        });

    return el('div', { className: 'bag-list' }, rows);
  }

  private renderFish(lang: 'id' | 'en'): HTMLElement {
      const progress = this.progress!;
      const caught = new Set(progress.collection.fish);
      const tierOrder: FishTier[] = ['common', 'rare', 'secret'];

      const stats: HTMLElement[] = [
        el('div', { className: 'codex-progress fish-stats' }, [
          el('span', {
            html: `${icon('fish', 14)}<span>${caught.size} / ${FISH.length}</span>`
          }),
          el('span', {
            html: `${icon('sparkle', 13)}<span>${t('fish.totalCatches')}: ${progress.fishRecords.totalCatches}</span>`
          }),
          el('span', {
            html: `${icon('heart', 13)}<span>${t('fish.largest')}: ${progress.fishRecords.largestCm > 0 ? `${progress.fishRecords.largestCm} cm` : '—'}</span>`
          })
        ])
      ];

      for (const tier of tierOrder) {
        const fish = FISH.filter((entry) => entry.tier === tier);
        if (fish.length === 0) continue;

        const rows = fish.map((entry) => {
          const found = caught.has(entry.id);
          const badge = progress.fishBadges[entry.id] ?? 0;
          return el('div', { className: `codex-row fish-codex ${found ? 'is-found' : 'is-locked'} tier-${tier}` }, [
            el('span', {
              className: 'codex-row__swatch',
              attrs: {
                style: `background:#${(found ? entry.bodyColor : 0xd8cfc0).toString(16).padStart(6, '0')}`
              },
              html: found ? icon('fish', 16) : icon('lock', 14)
            }),
            el('div', { className: 'codex-row__info' }, [
              el('strong', { text: found ? entry.name[lang] : '???' }),
              el('span', {
                text: found
                  ? entry.story[lang]
                  : entry.hint[lang]
              }),
              found
                ? el('span', {
                    className: 'codex-row__badge',
                    text: badge >= 3 ? t('fish.badgeFull') : `${badge} / 3 ${t('fish.badge')}`
                  })
                : null
            ])
          ]);
        });

        stats.push(
          el('span', { className: 'field-label fish-tier-head', text: `${t(`fish.tier.${tier}`)} · ${fish.length}` }),
          el('div', { className: 'codex-list' }, rows)
        );
      }

      const note =
        caught.size === 0
          ? el('p', { className: 'field-note', text: t('journal.emptyFish') })
          : null;
      return el('div', { className: 'fish-collection' }, [note, ...stats]);
    }

  private renderCrops(lang: 'id' | 'en'): HTMLElement {
    const harvested = new Set(this.progress!.collection.crops);
    const rows = CROPS.map((crop) =>
      el('div', { className: `codex-row ${harvested.has(crop.id) ? 'is-found' : 'is-locked'}` }, [
        el('span', {
          className: 'codex-row__swatch',
          attrs: {
            style: `background:#${crop.bloomColor.toString(16).padStart(6, '0')}`
          },
          html: icon('seed', 16)
        }),
        el('div', { className: 'codex-row__info' }, [
          el('strong', { text: crop.name[lang] }),
          el('span', {
            text: `${Math.round(crop.growSeconds)}s · ${t('farm.sell')} ${crop.sellPrice} ${t('journal.coins')}`
          })
        ])
      ])
    );
    const note =
      harvested.size === 0
        ? el('p', { className: 'field-note', text: t('journal.emptyCrops') })
        : null;
    return el('div', { className: 'codex-list' }, [note, ...rows]);
  }

  private renderAnimals(lang: 'id' | 'en'): HTMLElement {
    const progress = this.progress!;
    const cards = ANIMALS.map((animal) => {
      const current = progress.animalNames[animal.id] ?? animal.defaultName;
      const input = el('input', {
        className: 'text-input',
        attrs: {
          type: 'text',
          maxlength: '14',
          value: current,
          'aria-label': `${t('animal.renameLabel')} ${animal.label[lang]}`
        }
      });
      const save = el(
        'button',
        {
          className: 'btn btn--quiet btn--tiny',
          attrs: { type: 'button' },
          on: {
            click: () => {
              const next = input.value.trim().slice(0, 14);
              if (!next) return;
              this.handlers.onRename(animal.id, next);
            }
          }
        },
        [el('span', { html: icon('check', 14) }), el('span', { text: t('journal.renameSave') })]
      );

      return el('div', { className: 'animal-card' }, [
        el('div', { className: 'animal-card__head' }, [
          el('strong', { text: current }),
          el('span', { className: 'animal-card__kind', text: animal.label[lang] })
        ]),
        el('p', { className: 'animal-card__hint', text: animal.hint[lang] }),
        el('div', { className: 'animal-card__row' }, [input, save]),
        el('p', { className: 'animal-card__meta', text: t('journal.renameHint') })
      ]);
    });

    return el('div', { className: 'animal-list' }, [
      el('p', { className: 'field-note', text: t('journal.animalHint') }),
      ...cards
    ]);
  }
}