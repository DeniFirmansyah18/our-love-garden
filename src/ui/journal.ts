import { ANIMALS, CROPS, FISH, cropById, fishById } from '../data/crops';
import {
  BIRTHDAYS,
  FLOWER_CROWN_MEMORIES,
  MEMORIES,
  MEMORY_COUNT,
  daysUntilBirthday
} from '../data/memories';
import { LOVE } from '../data/config';
import type { Progress } from '../save/save';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';
import { Sheet } from './sheet';

export type JournalTab = 'bag' | 'fish' | 'crops' | 'animals' | 'memories' | 'us';

export interface JournalHandlers {
  onSell: (itemId: string, quantity: number) => void;
  onRename: (animalId: string, name: string) => void;
  onOpenMemory: (id: string) => void;
  onReplayFinale: () => void;
  onClose?: () => void;
}

const TABS: Array<[JournalTab, 'basket' | 'fish' | 'seed' | 'paw' | 'heart' | 'book']> = [
  ['bag', 'basket'],
  ['fish', 'fish'],
  ['crops', 'seed'],
  ['animals', 'paw'],
  ['memories', 'heart'],
  ['us', 'book']
];

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

  open(progress: Progress, tab: JournalTab = 'bag'): void {
    this.progress = progress;
    this.tab = tab;
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
        else if (this.tab === 'us') body.push(this.renderProfiles());
        else body.push(this.renderAnimals(lang));

        this.sheet.setContent(body);
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
      const label = crop ? crop.name[lang] : fish ? fish.name[lang] : id;
      const price = crop ? crop.sellPrice : 0;
      return el('div', { className: 'bag-row' }, [
        el('span', {
          className: 'bag-row__swatch',
          attrs: {
            style: `background:#${((crop?.bloomColor ?? fish?.bodyColor) ?? 0xd9a58c)
              .toString(16)
              .padStart(6, '0')}`
          }
        }),
        el('div', { className: 'bag-row__info' }, [
          el('strong', { text: label }),
          el('span', { text: `${count}×${price > 0 ? ` · ${price} ${t('journal.coins')}` : ''}` })
        ]),
        price > 0
          ? el(
              'div',
              { className: 'bag-row__actions' },
              [
                el(
                  'button',
                  {
                    className: 'btn btn--ghost btn--tiny',
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
              ]
            )
          : el('span', { className: 'bag-row__note', text: t('farm.favorite') })
      ]);
    });

    return el('div', { className: 'bag-list' }, rows);
  }

  private renderFish(lang: 'id' | 'en'): HTMLElement {
    const caught = new Set(this.progress!.collection.fish);
    const rows = FISH.map((fish) => {
      const found = caught.has(fish.id);
      return el('div', { className: `codex-row ${found ? 'is-found' : 'is-locked'}` }, [
        el('span', {
          className: 'codex-row__swatch',
          attrs: {
            style: `background:#${(found ? fish.bodyColor : 0xd8cfc0).toString(16).padStart(6, '0')}`
          },
          html: found ? icon('fish', 16) : icon('lock', 14)
        }),
        el('div', { className: 'codex-row__info' }, [
          el('strong', { text: found ? fish.name[lang] : t('journal.locked') }),
          el('span', {
            text: found
              ? fish.story[lang]
              : `${t('journal.tab.fish')} · ${fish.rarity}`
          })
        ])
      ]);
    });

    const note = caught.size === 0 ? el('p', { className: 'field-note', text: t('journal.emptyFish') }) : null;
    return el('div', { className: 'codex-list' }, [note, ...rows]);
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