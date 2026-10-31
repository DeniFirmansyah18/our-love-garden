import { BAITS, fishById, junkById, type BaitId } from '../data/fish';
import { FishingRound } from '../systems/fishing';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';

export interface FishingContext {
  memories: string[];
  totalCatches: number;
  timeOfDay: 'day' | 'night';
  assist: boolean;
}

export interface FishingPanelHandlers {
  onCaught: (catchId: string, isJunk: boolean, sizeCm: number | null) => void;
  onClose: () => void;
  onGetContext: () => FishingContext;
  onBaitChange?: (bait: BaitId) => void;
}

const CHARGE_STEP_MS = 16;

export class FishingPanel {
  readonly element: HTMLDivElement;
  private readonly round = new FishingRound();
  private readonly handlers: FishingPanelHandlers;
  private readonly pond: HTMLButtonElement;
    private readonly float: HTMLSpanElement;
    private readonly reelBtn: HTMLButtonElement;
  private readonly powerFill: HTMLDivElement;
  private readonly powerLabel: HTMLDivElement;
  private readonly tensionFill: HTMLDivElement;
  private readonly tensionBand: HTMLDivElement;
  private readonly tensionMarker: HTMLDivElement;
  private readonly actionBtn: HTMLButtonElement;
  private readonly secondaryBtn: HTMLButtonElement;
  private readonly baitPicker: HTMLDivElement;
  private readonly hint: HTMLParagraphElement;
  private readonly result: HTMLDivElement;
  private readonly stageHint: HTMLParagraphElement;

  private raf = 0;
  private open = false;
  private reported = false;
  private holding = false;
  private pointerId: number | null = null;
  private bait: BaitId = 'bait-cacing';
  private lastTick = 0;
  private vibratedBite = false;

  constructor(handlers: FishingPanelHandlers) {
    this.handlers = handlers;

    this.float = el('span', { className: 'fishing__float' });
    this.pond = el(
      'button',
      {
        className: 'fishing__pond',
        attrs: { type: 'button', 'aria-label': t('fish.cast') }
      },
      [
        el('span', { className: 'fishing__ripple fishing__ripple--a' }),
        el('span', { className: 'fishing__ripple fishing__ripple--b' }),
        this.float,
        el('span', { className: 'fishing__pond-hint', text: t('fish.pressCast') })
      ]
    );

    this.powerFill = el('div', { className: 'power__fill' });
    this.powerLabel = el('div', { className: 'power__label', text: t('fish.power') });

    this.tensionFill = el('div', { className: 'tension__line' });
    this.tensionBand = el('div', {
      className: 'tension__band',
      attrs: { 'aria-hidden': 'true' }
    });
    this.tensionMarker = el('div', { className: 'tension__marker' });

    this.stageHint = el('p', { className: 'fishing__stage' });
    this.hint = el('p', { className: 'fishing__hint', text: t('fish.hint') });
    this.result = el('div', { className: 'fishing__result', attrs: { 'aria-live': 'polite' } });

    this.actionBtn = el(
      'button',
      {
        className: 'btn',
        attrs: { type: 'button' },
        on: { click: () => this.action() }
      },
      [el('span', { html: icon('fish', 17) }), el('span', { text: t('fish.cast') })]
    );

    this.secondaryBtn = el(
      'button',
      {
        className: 'btn btn--ghost',
        attrs: { type: 'button' },
        on: { click: () => this.close() }
      },
      [el('span', { text: t('fish.done') })]
    );

    this.reelBtn = el(
      'button',
      {
        className: 'btn btn--reel',
        attrs: { type: 'button' },
        on: { click: () => undefined }
      },
      [el('span', { html: icon('hold', 18) }), el('span', { text: t('fish.reel') })]
    );
    this.reelBtn.addEventListener('pointerdown', this.onReelDown);
    this.reelBtn.addEventListener('pointerup', this.onReelUp);
    this.reelBtn.addEventListener('pointercancel', this.onReelUp);
    this.reelBtn.addEventListener('pointerleave', this.onReelUp);

    this.baitPicker = el('div', { className: 'bait-picker', attrs: { role: 'group', 'aria-label': t('fish.bait') } });

    this.element = el(
      'div',
      {
        className: 'fishing',
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fishing-title', hidden: '' }
      },
      [
        el('div', { className: 'fishing__sheet' }, [
          el('div', { className: 'fishing__head' }, [
            el('h2', { className: 'fishing__title', attrs: { id: 'fishing-title' }, text: t('fish.title') }),
            el(
              'button',
              {
                className: 'icon-btn',
                attrs: { type: 'button', 'aria-label': t('fish.done') },
                on: { click: () => this.close() }
              },
              [el('span', { html: icon('close', 18) })]
            )
          ]),
          this.result,
          this.stageHint,
          this.pond,
          this.baitPicker,
          el('div', { className: 'power' }, [this.powerLabel, this.powerFill]),
          el('div', { className: 'fishing__barWrap' }, [
            el('div', {
              className: 'fishing__bar',
              attrs: {
                role: 'progressbar',
                'aria-valuemin': '0',
                'aria-valuemax': '100',
                'aria-label': t('fish.tension')
              }
            }, [this.tensionFill])
          ]),
          el('div', { className: 'tension', attrs: { 'aria-hidden': 'true' } }, [
            this.tensionBand,
            this.tensionMarker
          ]),
          this.hint,
          el('div', { className: 'fishing__actions' }, [this.actionBtn, this.secondaryBtn])
        ])
      ]
    );

    this.renderBaitPicker();
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const code = event.code;
    if (code === 'Space' && event.target instanceof HTMLElement && event.target !== this.pond && event.target !== this.reelBtn) {
      event.preventDefault();
      const state = this.round.getState();
      if (state.phase === 'charging') {
        this.cast();
      } else if (state.phase === 'waiting' || state.phase === 'bite') {
        this.tap();
      } else if (state.phase === 'idle') {
        this.charge();
      }
    }
  };

  private onReelDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.pointerId = event.pointerId;
    this.holding = true;
  };

  private onReelUp = (event?: PointerEvent): void => {
    if (event && this.pointerId !== null && event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.holding = false;
  };

  private charge(): void {
    this.reported = false;
    this.vibratedBite = false;
    this.round.press();
    this.result.replaceChildren();
    this.sync();
  }

  private cast(): void {
    if (this.round.getState().phase !== 'charging') return;
    this.round.release();
    this.sync();
  }

  private tap(): void {
    this.round.tap();
    this.sync();
  }

  private action(): void {
    const state = this.round.getState();
    if (state.phase === 'idle') this.charge();
    else if (state.phase === 'charging') this.cast();
    else if (state.phase === 'waiting') this.tap();
    else if (state.phase === 'missed' || state.phase === 'caught') this.reset();
  }

  private updateContext(): void {
    const context = this.handlers.onGetContext();
    this.round.setContext({ memories: context.memories, totalCatches: context.totalCatches });
    this.round.setTimeOfDay(context.timeOfDay);
    this.round.setAssist(context.assist);
  }

  openPanel(): void {
    if (this.open) return;
    this.open = true;
    this.reported = false;
    this.holding = false;
    this.round.reset();
    this.round.setBait(this.bait);
    this.updateContext();
    this.element.hidden = false;
    requestAnimationFrame(() => {
      if (!this.open) return;
      this.element.classList.add('is-open');
    });
    this.renderBaitPicker();
    this.renderIdle();
    this.lastTick = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.holding = false;
    cancelAnimationFrame(this.raf);
    this.element.classList.remove('is-open');
    window.setTimeout(() => {
      if (this.open) return;
      this.element.hidden = true;
    }, 320);
    this.handlers.onClose();
  }

  isOpen(): boolean {
    return this.open;
  }

  private tick = (now: number): void => {
    if (!this.open) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = now - this.lastTick;
    this.lastTick = now;

    const state = this.round.getState();
    if (state.phase === 'charging') {
      this.round.tick();
    } else if (state.phase === 'waiting' || state.phase === 'bite') {
      this.round.tick();
      if (state.phase === 'bite' && !this.vibratedBite) {
        this.vibratedBite = true;
        this.vibrate(60);
      }
    } else if (state.phase === 'reeling') {
      this.round.holdTick(this.holding);
    }

    if (dt > 0 && state.phase === 'reeling') {
      // The round holds its own lastTick; nothing extra needed.
    }

    this.sync();
  };

  private vibrate(ms: number): void {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
    } catch {
      void ms;
    }
  }

  private sync(): void {
    const state = this.round.getState();
    const phase = state.phase;
    this.element.dataset.phase = phase;

    this.hint.hidden = phase === 'reeling';
    this.hint.textContent = this.hintForPhase(phase);

    this.pond.hidden = false;
    this.baitPicker.hidden = phase !== 'idle';
    this.reelBtn.hidden = phase !== 'reeling';
    this.actionBtn.hidden = phase === 'reeling';
    this.secondaryBtn.hidden = phase === 'reeling';

    this.float.hidden = phase === 'reeling' || phase === 'caught' || phase === 'missed';

    this.powerFill.style.width = `${Math.round(state.power * 100)}%`;
    this.powerLabel.textContent = `${t('fish.power')} ${Math.round(state.power * 100)}%`;

    const bar = this.tensionFill.parentElement;
    const tensionPct = Math.round(state.reelProgress * 100);
    bar?.setAttribute('aria-valuenow', String(tensionPct));
    this.tensionFill.style.width = `${tensionPct}%`;

    this.tensionMarker.style.left = `${Math.round(state.tension * 100)}%`;

    this.stageHint.textContent = this.stageForPhase(phase);
    this.actionBtn.textContent = this.actionForPhase(phase);
    void CHARGE_STEP_MS;

    if (phase === 'caught' && !this.reported) {
      this.reported = true;
      this.vibrate(80);
      this.showCaught();
    } else if (phase === 'missed' && !this.reported) {
      this.reported = true;
      this.showMissed(state.outcome);
    }
  }

  private hintForPhase(phase: string): string {
    switch (phase) {
      case 'idle':
        return t('fish.hint');
      case 'charging':
        return t('fish.chargingHint');
      case 'waiting':
        return t('fish.waiting');
      case 'bite':
        return t('fish.bite');
      case 'reeling':
        return '';
      case 'caught':
        return t('fish.sellHint');
      case 'missed':
        return t('fish.slipped');
      default:
        return t('fish.hint');
    }
  }

  private stageForPhase(phase: string): string {
    switch (phase) {
      case 'idle':
        return t('fish.idleStage');
      case 'charging':
        return t('fish.chargingStage');
      case 'waiting':
        return t('fish.waitingStage');
      case 'bite':
        return t('fish.biteStage');
      case 'reeling':
        return t('fish.reelStage');
      case 'caught':
        return '';
      case 'missed':
        return '';
      default:
        return '';
    }
  }

  private actionForPhase(phase: string): string {
    switch (phase) {
      case 'idle':
        return t('fish.charge');
      case 'charging':
        return t('fish.release');
      case 'waiting':
        return t('fish.tap');
      case 'bite':
        return t('fish.tap');
      case 'caught':
        return t('fish.again');
      case 'missed':
        return t('fish.again');
      default:
        return t('fish.cast');
    }
  }

  private renderIdle(): void {
    const state = this.round.getState();
    void state;
    this.result.replaceChildren();
    this.stageHint.textContent = t('fish.idleStage');
    this.hint.textContent = t('fish.hint');
    this.hint.hidden = false;
    this.pond.hidden = false;
    this.baitPicker.hidden = false;
    this.reelBtn.hidden = true;
    this.actionBtn.hidden = false;
    this.secondaryBtn.hidden = false;
    this.float.hidden = false;
    this.tensionFill.style.width = '0%';
    this.powerFill.style.width = '0%';
    this.tensionMarker.style.left = '62%';
    this.element.dataset.phase = 'idle';
  }

  private showCaught(): void {
    const state = this.round.getState();
    const lang = getLang();
    if (state.isJunk) {
      const junk = junkById(state.catchId ?? '');
      this.result.replaceChildren(
        el('strong', { text: junk ? junk.name[lang] : state.catchId ?? '?' }),
        el('p', { text: junk ? junk.story[lang] : '' }),
        el('p', { className: 'result__meta', text: `${t('fish.sell')} ${junk?.sell ?? 0} ${t('journal.coins')}` })
      );
      this.handlers.onCaught(state.catchId ?? '', true, null);
    } else {
      const fish = fishById(state.catchId ?? '');
      this.result.replaceChildren(
        el('span', { className: 'result__size', text: `${state.catchSize ?? 0} cm` }),
        el('strong', { text: fish ? fish.name[lang] : state.catchId ?? '?' }),
        el('p', { className: 'result__tier', text: fish ? t(`fish.tier.${fish.tier}`) : '' }),
        el('p', { text: fish ? fish.story[lang] : '' })
      );
      this.handlers.onCaught(state.catchId ?? '', false, state.catchSize ?? null);
    }
    this.actionBtn.textContent = t('fish.again');
    this.secondaryBtn.textContent = t('fish.done');
  }

  private showMissed(outcome: string | null): void {
    const message = outcome === 'early' ? t('fish.early') : t('fish.slipped');
    this.result.replaceChildren(el('p', { text: message }));
    this.actionBtn.textContent = t('fish.again');
    this.secondaryBtn.textContent = t('fish.done');
  }

  private reset(): void {
    this.reported = false;
    this.vibratedBite = false;
    this.round.reset();
    this.round.setBait(this.bait);
    this.updateContext();
    this.renderIdle();
  }

  private renderBaitPicker(): void {
    this.baitPicker.replaceChildren(
      ...BAITS.map((bait) =>
        el(
          'button',
          {
            className: 'bait-chip',
            attrs: {
              type: 'button',
              'aria-pressed': this.bait === bait.id ? 'true' : 'false'
            },
            on: {
              click: () => {
                this.bait = bait.id;
                this.round.setBait(bait.id);
                this.handlers.onBaitChange?.(bait.id);
                this.renderBaitPicker();
              }
            }
          },
          [
            el('span', {
              className: 'bait-chip__dot',
              attrs: { style: `background:#${bait.color.toString(16).padStart(6, '0')}` }
            }),
            el('span', { text: bait.name[getLang()] })
          ]
        )
      )
    );
  }

  setBait(bait: BaitId): void {
    this.bait = bait;
    this.round.setBait(bait);
    this.renderBaitPicker();
  }
}