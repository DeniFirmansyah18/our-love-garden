import { fishById, type FishDef } from '../data/crops';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';
import { FishingRound } from '../systems/fishing';

export interface FishingPanelHandlers {
  onCaught: (fish: FishDef) => void;
  onClose: () => void;
}

export class FishingPanel {
  readonly element: HTMLDivElement;
  private readonly round = new FishingRound();
  private readonly handlers: FishingPanelHandlers;
  private readonly pond: HTMLButtonElement;
  private readonly pondLabel: HTMLSpanElement;
  private readonly progressFill: HTMLDivElement;
  private readonly hint: HTMLParagraphElement;
  private readonly actions: HTMLDivElement;
  private readonly result: HTMLDivElement;
  private holding = false;
  private raf = 0;
  private open = false;
  private reported = false;
  private pointerId: number | null = null;

  constructor(handlers: FishingPanelHandlers) {
    this.handlers = handlers;

    this.pondLabel = el('span', { className: 'fishing__label' });
    this.pond = el(
      'button',
      {
        className: 'fishing__pond',
        attrs: { type: 'button', 'aria-label': t('fish.cast') }
      },
      [
        el('span', { className: 'fishing__ripple fishing__ripple--a' }),
        el('span', { className: 'fishing__ripple fishing__ripple--b' }),
        el('span', { className: 'fishing__float' }),
        this.pondLabel
      ]
    );
    this.progressFill = el('div', { className: 'fishing__bar-fill' });
    this.hint = el('p', { className: 'fishing__hint', text: t('fish.hint') });
    this.actions = el('div', { className: 'fishing__actions' });
    this.result = el('div', { className: 'fishing__result', attrs: { 'aria-live': 'polite' } });

    this.element = el(
      'div',
      {
        className: 'fishing',
        attrs: {
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'fishing-title',
          hidden: ''
        }
      },
      [
        el('div', { className: 'fishing__sheet' }, [
          el('div', { className: 'fishing__head' }, [
            el('h2', {
              className: 'fishing__title',
              attrs: { id: 'fishing-title' },
              text: t('fish.title')
            }),
            el(
              'button',
              {
                className: 'icon-btn',
                attrs: { type: 'button', 'aria-label': t('journal.close') },
                on: { click: () => this.close() }
              },
              [el('span', { html: icon('close', 18) })]
            )
          ]),
          this.result,
          this.pond,
          el('div', {
            className: 'fishing__bar',
            attrs: { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' }
          }, [this.progressFill]),
          this.hint,
          this.actions
        ])
      ]
    );

    this.pond.addEventListener('pointerdown', this.onDown);
    this.pond.addEventListener('pointerup', this.onUp);
    this.pond.addEventListener('pointercancel', this.onUp);
    this.pond.addEventListener('pointerleave', this.onUp);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    if (event.code === 'Space' || event.code === 'Enter') {
      if (event.target === this.pond) return;
      event.preventDefault();
      this.press();
      window.setTimeout(() => this.release(), 420);
    }
  };

  private onDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.press();
  };

  private onUp = (event?: PointerEvent): void => {
      if (event && this.pointerId !== null && event.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.release();
    };

  private press(): void {
    const state = this.round.getState();
    if (state.phase === 'waiting' || state.phase === 'bite') {
      this.round.tap();
      this.holding = true;
      this.sync();
      return;
    }
    if (state.phase === 'reeling') {
      this.holding = true;
    }
  }

  private release(): void {
    this.holding = false;
  }

  openPanel(): void {
    if (this.open) return;
    this.open = true;
    this.reported = false;
    this.round.reset();
    this.element.hidden = false;
    this.element.classList.add('is-open');
    this.renderIdle();
    this.pond.focus({ preventScroll: true });
    this.tick();
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.holding = false;
    cancelAnimationFrame(this.raf);
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
      this.element.hidden = true;
    }, 320);
    this.handlers.onClose();
  }

  isOpen(): boolean {
    return this.open;
  }

  private renderIdle(): void {
    const fish = this.round.getState().fish;
    this.pondLabel.textContent = t('fish.cast');
    this.hint.textContent = t('fish.hint');
    this.progressFill.style.width = '0%';
    this.result.replaceChildren();
    this.element.dataset.phase = 'idle';
    this.actions.replaceChildren(
      el(
        'button',
        {
          className: 'btn',
          attrs: { type: 'button' },
          on: {
            click: () => {
              this.cast();
            }
          }
        },
        [el('span', { html: icon('fish', 18) }), el('span', { text: t('fish.cast') })]
      ),
      el(
        'button',
        {
          className: 'btn btn--ghost',
          attrs: { type: 'button' },
          on: { click: () => this.close() }
        },
        [el('span', { text: t('fish.done') })]
      )
    );
    void fish;
  }

  private cast(): void {
    this.reported = false;
    this.round.start();
    this.result.replaceChildren();
    this.actions.replaceChildren();
    this.pondLabel.textContent = '...';
    this.hint.textContent = t('fish.hint');
    this.element.dataset.phase = 'waiting';
    this.sync();
  }

  private tick = (): void => {
    if (!this.open) return;
    this.raf = requestAnimationFrame(this.tick);
    const state = this.round.getState();

    if (state.phase === 'reeling') {
      this.round.holdTick(this.holding);
    } else if (state.phase === 'waiting' || state.phase === 'bite') {
      this.round.tick();
    }
    this.sync();
  };

  private sync(): void {
    const state = this.round.getState();
    const phase = state.phase;
    this.element.dataset.phase = phase;

    if (phase === 'waiting') {
      this.pondLabel.textContent = t('fish.waiting');
      this.hint.textContent = t('fish.hint');
    } else if (phase === 'bite') {
      this.pondLabel.textContent = t('fish.bite');
      this.hint.textContent = t('fish.bite');
    } else if (phase === 'reeling') {
      this.pondLabel.textContent = t('fish.reel');
      this.hint.textContent = t('fish.reel');
    }

    this.progressFill.style.width = `${Math.round(state.reelProgress * 100)}%`;
    const bar = this.progressFill.parentElement;
    bar?.setAttribute('aria-valuenow', String(Math.round(state.reelProgress * 100)));

    if (phase === 'caught' && !this.reported) {
      this.reported = true;
      const fish = state.fish;
      if (fish) {
        this.handlers.onCaught(fish);
        this.showCaught(fish);
      }
    } else if (phase === 'missed' && !this.reported) {
      this.reported = true;
      this.showMissed(state.outcome);
    }
  }

  private showCaught(fish: FishDef): void {
    const lang = getLang();
    this.pondLabel.textContent = t('fish.caught');
      this.hint.textContent = t('fish.sellHint');
      this.result.replaceChildren(
      el('strong', { text: fish.name[lang] }),
      el('p', { text: fish.story[lang] })
    );
    this.actions.replaceChildren(
      el(
        'button',
        {
          className: 'btn',
          attrs: { type: 'button' },
          on: { click: () => this.cast() }
        },
        [el('span', { html: icon('fish', 17) }), el('span', { text: t('fish.again') })]
      ),
      el(
        'button',
        {
          className: 'btn btn--ghost',
          attrs: { type: 'button' },
          on: { click: () => this.close() }
        },
        [el('span', { text: t('fish.done') })]
      )
    );
  }

  private showMissed(outcome: string | null): void {
    const message = outcome === 'early' ? t('fish.early') : t('fish.slipped');
    this.result.replaceChildren(el('p', { text: message }));
    this.pondLabel.textContent = t('fish.cast');
      this.hint.textContent = t('fish.hint');
      this.actions.replaceChildren(
      el(
        'button',
        {
          className: 'btn',
          attrs: { type: 'button' },
          on: { click: () => this.cast() }
        },
        [el('span', { html: icon('refresh', 17) }), el('span', { text: t('fish.again') })]
      ),
      el(
        'button',
        {
          className: 'btn btn--ghost',
          attrs: { type: 'button' },
          on: { click: () => this.close() }
        },
        [el('span', { text: t('fish.done') })]
      )
    );
  }

  /** Exposed for the game loop to detect a landed fish outside of rAF timing. */
  currentFishId(): string | null {
    return this.round.getState().fish?.id ?? null;
  }

  fishName(id: string): string {
    const fish = fishById(id);
    return fish ? fish.name[getLang()] : id;
  }
}