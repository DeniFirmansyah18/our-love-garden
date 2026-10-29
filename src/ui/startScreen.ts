import {
  BUBU_ACCESSORY_META,
  DUDU_ACCESSORY_META,
  LOVE,
  RIBBONS
} from '../data/config';
import type { BubuAccessory, DuduAccessory, Lang, RibbonId } from '../data/config';
import type { Loadout } from '../save/save';
import { el, prefersTouch } from './dom';
import { icon, type IconName } from './icons';
import { getLang, onLangChange, setLang, t } from './i18n';

export interface StartScreenHandlers {
  onStart: () => void;
  onLoadout: (loadout: Loadout) => void;
  onLang: (lang: Lang) => void;
}

const ICONS: Record<string, IconName> = {
  none: 'none',
  straw: 'hat',
  band: 'band',
  scarf: 'scarf',
  glasses: 'glasses',
  leaf: 'leaf',
  bowtie: 'bowtie',
  crown: 'crown'
};

export class StartScreen {
  readonly element: HTMLDivElement;
  private loadout: Loadout;
  private readonly handlers: StartScreenHandlers;
  private readonly unlockedDudu: DuduAccessory[];
  private readonly bubuChips = el('div', { className: 'chip-grid' });
  private readonly bubuSwatches = el('div', { className: 'swatch-row' });
  private readonly duduChips = el('div', { className: 'chip-grid' });
  private readonly langGroup = el('div', {
    className: 'segmented segmented--compact',
      attrs: { role: 'group', 'aria-label': t('settings.language') }
  });
  private readonly unlisten: () => void;

  constructor(loadout: Loadout, unlockedDudu: DuduAccessory[], handlers: StartScreenHandlers) {
    this.loadout = { bubu: { ...loadout.bubu }, dudu: { ...loadout.dudu } };
    this.unlockedDudu = unlockedDudu;
    this.handlers = handlers;

    this.element = el(
      'div',
      {
        className: 'start',
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'start-title' }
      },
      [
              el('div', { className: 'start__inner' }, [
                el('div', { className: 'start__scroll' }, [
                  this.buildCrest(),
                  this.buildCustomizer()
                ]),
                this.buildActions()
              ])
            ]
          );

    this.refresh();
    this.unlisten = onLangChange(() => this.refresh());
  }

  private buildCrest(): HTMLElement {
    const title = el('h1', { className: 'start__title', attrs: { id: 'start-title' } });
    title.innerHTML = 'Our <em>Love Garden</em>';

    return el('header', { className: 'start__crest' }, [
      el('p', {
        className: 'start__eyebrow',
        attrs: { 'data-i18n': 'start.eyebrow' },
        text: t('start.eyebrow')
      }),
      title,
      el('p', { className: 'start__names', text: LOVE.tagline }),
      el('p', {
        className: 'start__lede',
        attrs: { 'data-i18n': 'start.lede' },
        text: t('start.lede')
      })
    ]);
  }

  private buildCustomizer(): HTMLElement {
    return el('section', { className: 'start__customize' }, [
      el('div', { className: 'start__section-head' }, [
        el('h2', {
          className: 'start__section-title',
          attrs: { 'data-i18n': 'start.customize' },
          text: t('start.customize')
        })
      ]),
      el('p', {
        className: 'start__section-note',
        attrs: { 'data-i18n': 'start.customizeNote' },
        text: t('start.customizeNote')
      }),
      el('div', { className: 'field-group' }, [
        el('span', { className: 'field-label', text: t('start.bubu') }),
        this.bubuChips,
        el('span', { className: 'field-label', text: t('start.ribbon') }),
        this.bubuSwatches
      ]),
      el('div', { className: 'field-group' }, [
        el('span', { className: 'field-label', text: t('start.dudu') }),
        this.duduChips
      ])
    ]);
  }

  private buildActions(): HTMLElement {
    return el('div', { className: 'start__actions' }, [
      el(
        'button',
        {
          className: 'btn',
          attrs: { type: 'button', id: 'start-enter' },
          on: { click: () => this.handlers.onStart() }
        },
        [
          el('span', { className: 'btn__icon', html: icon('heart', 18) }),
          el('span', {
            text: t('start.enter'),
            attrs: { 'data-i18n': 'start.enter' }
          })
        ]
      ),
      el('p', {
        className: 'start__footnote',
        attrs: { 'data-i18n': 'start.enterNote' },
        text: t('start.enterNote')
      }),
      el('div', { className: 'start__legal' }, [
        el('span', { html: icon(prefersTouch() ? 'hold' : 'sparkle', 14) }),
        el('span', {
          text: prefersTouch() ? t('start.controlsTouch') : t('start.controlsDesktop'),
          attrs: {
            'data-i18n': prefersTouch() ? 'start.controlsTouch' : 'start.controlsDesktop'
          }
        })
      ]),
      this.langGroup
    ]);
  }

  private refresh(): void {
    this.element.querySelectorAll<HTMLElement>('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (key) node.textContent = t(key);
    });
    this.renderChips();
    this.renderSwatches();
    this.renderLang();
  }

  private renderChips(): void {
    this.bubuChips.replaceChildren(
      ...BUBU_ACCESSORY_META.map((option) =>
        this.chipNode(
          option.icon,
          option.label[getLang()],
          this.loadout.bubu.accessory === option.id,
          false,
          () => {
            this.loadout.bubu.accessory = option.id as BubuAccessory;
            this.commit();
          }
        )
      )
    );

    this.duduChips.replaceChildren(
      ...DUDU_ACCESSORY_META.map((option) => {
        const unlocked = !option.locked || this.unlockedDudu.includes(option.id);
        return this.chipNode(
          option.icon,
          option.label[getLang()],
          this.loadout.dudu.accessory === option.id,
          !unlocked,
          () => {
            if (!unlocked) return;
            this.loadout.dudu.accessory = option.id as DuduAccessory;
            this.commit();
          }
        );
      })
    );
  }

  private chipNode(
    iconName: string,
    label: string,
    pressed: boolean,
    locked: boolean,
    action: () => void
  ): HTMLButtonElement {
    const button = el(
      'button',
      {
        className: 'chip',
        attrs: {
          type: 'button',
          'aria-pressed': pressed ? 'true' : 'false',
          ...(locked ? { disabled: '', title: t('start.locked') } : {})
        },
        on: { click: action }
      },
      [
        el('span', { className: 'chip__icon', html: icon(ICONS[iconName] ?? 'none', 30) }),
        el('span', { text: label })
      ]
    );
    if (locked) {
      button.append(
        el('span', {
          className: 'chip__lock',
          html: `${icon('lock', 11)}<span>${t('start.locked')}</span>`
        })
      );
    }
    return button;
  }

  private renderSwatches(): void {
    this.bubuSwatches.replaceChildren(
      ...RIBBONS.map((ribbon) =>
        el(
          'button',
          {
            className: 'swatch',
            attrs: {
              type: 'button',
              'aria-pressed': this.loadout.bubu.ribbon === ribbon.id ? 'true' : 'false'
            },
            on: {
              click: () => {
                this.loadout.bubu.ribbon = ribbon.id as RibbonId;
                this.commit();
              }
            }
          },
          [
            el('span', {
              className: 'swatch__dot',
              attrs: { style: `background:${ribbon.hex}` }
            }),
            el('span', { text: ribbon.label[getLang()] })
          ]
        )
      )
    );
  }

  private renderLang(): void {
    const lang = getLang();
    this.langGroup.replaceChildren(
      ...(['id', 'en'] as Lang[]).map((code) =>
        el('button', {
          className: 'segmented__btn',
          attrs: {
            type: 'button',
            'aria-pressed': lang === code ? 'true' : 'false'
          },
          text: code === 'id' ? 'Indonesia' : 'English',
          on: {
            click: () => {
              setLang(code);
              this.handlers.onLang(code);
            }
          }
        })
      )
    );
  }

  private commit(): void {
    this.handlers.onLoadout({
      bubu: { ...this.loadout.bubu },
      dudu: { ...this.loadout.dudu }
    });
    this.renderChips();
    this.renderSwatches();
  }

  setLoadout(loadout: Loadout): void {
    this.loadout = { bubu: { ...loadout.bubu }, dudu: { ...loadout.dudu } };
    this.renderChips();
    this.renderSwatches();
  }

    setUnlockedDudu(list: DuduAccessory[]): void {
      this.unlockedDudu.length = 0;
      this.unlockedDudu.push(...list);
      this.renderChips();
    }

  show(): void {
    this.element.hidden = false;
    this.element.classList.add('is-open');
    const focusTarget = this.element.querySelector<HTMLElement>('#start-enter');
    focusTarget?.focus({ preventScroll: true });
  }

  hide(): void {
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
      this.element.hidden = true;
    }, 420);
  }

  isOpen(): boolean {
    return !this.element.hidden;
  }

  dispose(): void {
    this.unlisten();
  }
}