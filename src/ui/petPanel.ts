import type { AnimalId } from '../data/crops';
import { petById } from '../data/pets';
import { canFeedPet, isFavoriteFood } from '../systems/pets';
import { getLang, t } from './i18n';
import { el } from './dom';
import { icon } from './icons';
import { Sheet } from './sheet';
import type { Progress } from '../save/save';

export interface PetPanelHandlers {
  onTalk: (animalId: string, optionIndex: number) => void;
  onFeed: (animalId: string, itemId: string) => void;
  onClose?: () => void;
}

export class PetPanel {
  readonly sheet: Sheet;
  private progress: Progress | null = null;
  private animalId: string = 'cimoy';
  private readonly handlers: PetPanelHandlers;

  constructor(handlers: PetPanelHandlers) {
    this.handlers = handlers;
    this.sheet = new Sheet({ onClose: () => handlers.onClose?.() });
  }

  open(animalId: string, progress: Progress): void {
    this.animalId = animalId;
    this.progress = progress;
    this.render();
    this.sheet.open();
  }

  close(): void {
    this.sheet.close();
  }

  isOpen(): boolean {
    return this.sheet.isOpen();
  }

  private render(): void {
    const progress = this.progress!;
    const lang = getLang();
    const pet = petById(this.animalId);
    if (!pet) return;
    const name = progress.animalNames[this.animalId] ?? pet.label?.[lang] ?? this.animalId;
    const affection = progress.animalAffection[this.animalId] ?? 0;
    const level = Math.min(3, Math.floor(affection / 25));

    this.sheet.setTitle(name);
    this.sheet.setCloseLabel(t('journal.close'));

    const levelLabels = [
      t('pet.levelNew'),
      t('pet.levelFriend'),
      t('pet.levelClose'),
      t('pet.levelBest')
    ];

    const affectionBar = el('div', { className: 'pet-affection__track' }, [
      el('div', {
        className: 'pet-affection__fill',
        attrs: { style: `width:${affection}%` }
      })
    ]);

    const food = this.foodList(lang, progress);

    this.sheet.setContent([
      el('div', { className: 'pet-head' }, [
        el('span', { className: 'pet-head__level', text: levelLabels[level] }),
        el('span', { className: 'pet-head__note', text: pet.favoriteFoodNote[lang] })
      ]),
      el('div', { className: 'pet-affection' }, [
        el('span', { className: 'field-label', text: t('pet.affection') }),
        affectionBar,
        el('span', { className: 'pet-affection__value', text: `${affection} / 100` })
      ]),
      el('span', { className: 'field-label', text: t('pet.chat') }),
      ...pet.chatOptions.map((option, index) =>
        el(
          'button',
          {
            className: 'btn btn--quiet pet-chat-option',
            attrs: { type: 'button' },
            on: { click: () => this.handlers.onTalk(this.animalId, index) }
          },
          [el('span', { html: icon('smile', 15) }), el('span', { text: option[lang] })]
        )
      ),
      el('span', { className: 'field-label', text: t('pet.feed') }),
      food
    ]);
  }

  private foodList(lang: 'id' | 'en', progress: Progress): HTMLElement {
      const inventory = progress.inventory;
      const rows: HTMLElement[] = [];

    const foodCandidates = [
      { id: 'ikan-mas', color: 0xe8923f },
      { id: 'mawar', color: 0xea8fa6 },
      { id: 'wortel', color: 0xe08a4b },
      { id: 'stroberi', color: 0xe2666f }
    ];

    for (const food of foodCandidates) {
      if (!canFeedPet(this.animalId, food.id)) continue;
      const count = inventory[food.id] ?? 0;
      const favorite = isFavoriteFood(this.animalId, food.id);
      const label = this.foodLabel(food.id, lang);

      rows.push(
        el('div', { className: 'pet-food-row' }, [
          el('span', {
            className: 'pet-food-row__swatch',
            attrs: { style: `background:#${food.color.toString(16).padStart(6, '0')}` }
          }),
          el('div', { className: 'pet-food-row__info' }, [
            el('strong', { text: label }),
            el('span', { text: `${count}×${favorite ? ` · ${t('pet.favorite')}` : ''}` })
          ]),
          el(
            'button',
            {
              className: 'btn btn--ghost btn--tiny',
              attrs: { type: 'button' },
              on: {
                click: () => {
                  if (count <= 0) return;
                  this.handlers.onFeed(this.animalId, food.id);
                }
              }
            },
            [el('span', { html: icon('sparkle', 13) }), el('span', { text: t('pet.give') })]
          )
        ])
      );
    }

    if (rows.length === 0) {
      return el('p', { className: 'field-note', text: t('pet.noFood') });
    }
    return el('div', { className: 'pet-food-list' }, rows);
  }

  private foodLabel(id: string, lang: 'id' | 'en'): string {
    const map: Record<string, { id: string; en: string }> = {
      'ikan-mas': { id: 'Ikan mas', en: 'Goldfish' },
      mawar: { id: 'Mawar', en: 'Rose' },
      wortel: { id: 'Wortel', en: 'Carrot' },
      stroberi: { id: 'Stroberi', en: 'Strawberry' }
    };
    return (map[id]?.[lang] as string) ?? id;
  }
}

export function petDisplayName(progress: Progress, animalId: string, lang: 'id' | 'en'): string {
  const pet = petById(animalId);
  return progress.animalNames[animalId] ?? pet?.label?.[lang] ?? animalId;
}

export type { AnimalId };