import { CROPS, type CropDef } from '../data/crops';
import { LOVE } from '../data/config';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';
import { Sheet } from './sheet';

export interface SeedPickerHandlers {
  onPick: (cropId: string) => void;
  onClose?: () => void;
}

export class SeedPicker {
  readonly sheet: Sheet;
  private coins = 0;
  private readonly handlers: SeedPickerHandlers;

  constructor(handlers: SeedPickerHandlers) {
    this.handlers = handlers;
    this.sheet = new Sheet({ onClose: () => handlers.onClose?.() });
    this.sheet.setTitle(t('farm.title'));
  }

  open(coins: number): void {
    this.coins = coins;
    this.render();
    this.sheet.open();
  }

  close(): void {
    this.sheet.close();
  }

  setCoins(coins: number): void {
    this.coins = coins;
    if (this.sheet.isOpen()) this.render();
  }

  private render(): void {
    const lang = getLang();
    this.sheet.setTitle(t('farm.title'));
    this.sheet.setCloseLabel(t('journal.close'));

    const rows = CROPS.map((crop) => this.seedRow(crop, lang));
    this.sheet.setContent([
      el('div', { className: 'sheet-meta' }, [
        el('span', { html: `${icon('coin', 14)}<span>${this.coins} ${t('journal.coins')}</span>` })
      ]),
      el('p', { className: 'field-note', text: t('farm.note') }),
      el('div', { className: 'seed-list' }, rows)
    ]);
  }

  private seedRow(crop: CropDef, lang: 'id' | 'en'): HTMLElement {
    const affordable = this.coins >= crop.seedCost;
    const favorite =
      crop.favoriteOf === 'bubu'
        ? `Bubu · ${LOVE.playerRealName}`
        : crop.favoriteOf === 'dudu'
          ? `Dudu · ${LOVE.companionRealName}`
          : null;

    return el('div', { className: 'seed-row' }, [
      el('span', {
        className: 'seed-row__swatch',
        attrs: { style: `background:#${crop.bloomColor.toString(16).padStart(6, '0')}` }
      }),
      el('div', { className: 'seed-row__info' }, [
        el('strong', { text: crop.name[lang] }),
        el('span', {
          className: 'seed-row__meta',
          text: `${Math.round(crop.growSeconds)}s · ${t('farm.cost')} ${crop.seedCost} · ${t('farm.sell')} ${crop.sellPrice}`
        }),
        favorite ? el('span', { className: 'seed-row__tag', text: favorite }) : null
      ]),
      el(
        'button',
        {
          className: 'btn btn--quiet seed-row__btn',
          attrs: {
            type: 'button',
            ...(affordable ? {} : { disabled: '', title: t('farm.noCoins') })
          },
          on: {
            click: () => {
              if (!affordable) return;
              this.handlers.onPick(crop.id);
              this.sheet.close();
            }
          }
        },
                  [el('span', { html: icon('seed', 16) }), el('span', { text: t('farm.plant') })]
      )
    ]);
  }
}