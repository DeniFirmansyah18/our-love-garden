import { LOVE, QUALITIES } from '../data/config';
import type { Lang, Quality } from '../data/config';
import type { SoundSettings } from '../audio/settings';
import { clear, el, prefersTouch } from './dom';
import { icon, type IconName } from './icons';
import { getLang, onLangChange, t } from './i18n';
import { Joystick } from './joystick';
import { Sheet } from './sheet';

export type EmoteId = 'happy' | 'shy' | 'wave' | 'hug' | 'hold' | 'kiss' | 'dance';

export interface HudHandlers {
  onEmote: (emote: EmoteId) => void;
  onQuality: (quality: Quality) => void;
  onLang: (lang: Lang) => void;
  onRestart: () => void;
  onReset: () => void;
  onJournal: () => void;
    onMap: () => void;
    onVolume: (volume: number) => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onSheetToggle: (open: boolean) => void;
}

const EMOTES: Array<{ id: EmoteId; icon: IconName; key: string }> = [
  { id: 'happy', icon: 'smile', key: 'emote.happy' },
  { id: 'shy', icon: 'shy', key: 'emote.shy' },
  { id: 'wave', icon: 'wave', key: 'emote.wave' },
  { id: 'hug', icon: 'hug', key: 'emote.hug' },
  { id: 'hold', icon: 'hold', key: 'emote.hold' },
  { id: 'kiss', icon: 'kiss', key: 'emote.kiss' },
  { id: 'dance', icon: 'dance', key: 'emote.dance' }
];

export class Hud {
  readonly element = el('div', { className: 'hud is-hidden' });
  readonly joystick: Joystick | null;
  readonly sheet: Sheet;

  private readonly status = el('div', { className: 'hud__status' });
  private readonly emoteDock = el('div', { className: 'emote-dock' });
  private readonly qualityGroup = el('div', {
    className: 'segmented',
    attrs: { role: 'group', 'aria-label': 'Kualitas grafis' }
  });
  private readonly langGroup = el('div', {
    className: 'segmented',
    attrs: { role: 'group', 'aria-label': 'Bahasa' }
  });
  private readonly resetButton = el('button', {
    className: 'btn btn--ghost',
    attrs: { type: 'button' }
  });
  private readonly handlers: HudHandlers;
  private quality: Quality = 'auto';
    private sound: SoundSettings;
    private armedReset = false;
  private readonly settingsButton: HTMLButtonElement;
    private readonly journalButton: HTMLButtonElement;
    private readonly mapButton: HTMLButtonElement;
    private readonly coinChip: HTMLSpanElement;

  constructor(handlers: HudHandlers, quality: Quality, sound: SoundSettings) {
    this.handlers = handlers;
    this.quality = quality;
      this.sound = { ...sound };
    const touch = prefersTouch();
    this.joystick = touch ? new Joystick(t('hud.hintTouch'), t('hud.joystick')) : null;

    this.settingsButton = el(
      'button',
      {
        className: 'icon-btn',
        attrs: {
          type: 'button',
          'aria-label': t('hud.settings'),
          'aria-expanded': 'false'
        },
        on: { click: () => this.toggleSettings() }
      },
      [el('span', { html: icon('settings', 19) })]
    );

    this.sheet = new Sheet({
      onOpen: () => {
        this.settingsButton.setAttribute('aria-expanded', 'true');
        this.handlers.onSheetToggle(true);
      },
      onClose: () => {
        this.settingsButton.setAttribute('aria-expanded', 'false');
        this.armedReset = false;
        this.handlers.onSheetToggle(false);
      }
    });

    this.journalButton = el(
          'button',
          {
            className: 'icon-btn',
            attrs: { type: 'button', 'aria-label': t('hud.journal') },
            on: { click: () => this.handlers.onJournal() }
          },
          [el('span', { html: icon('book', 19) })]
        );

        this.coinChip = el('span', {
          className: 'hud__coins',
          html: `${icon('coin', 14)}<span>0</span>`
        });

        this.mapButton = el(
          'button',
          {
            className: 'icon-btn',
            attrs: { type: 'button', 'aria-label': t('hud.map') },
            on: { click: () => this.handlers.onMap() }
          },
          [el('span', { html: icon('globe', 19) })]
        );

        this.element.append(
          el('div', { className: 'hud__top' }, [
            el('div', { className: 'hud__brand' }, [
              el('strong', { text: LOVE.title }),
              el('span', { text: LOVE.tagline })
            ]),
            el('div', { className: 'hud__tools' }, [
              this.coinChip,
              this.mapButton,
              this.journalButton,
              this.settingsButton
            ])
          ]),
          el('div', { className: 'hud__bottom' }, [
            this.status,
            el('div', { className: 'hud__dock' }, [this.emoteDock, this.joystick?.element ?? null])
          ])
        );

    this.renderEmotes();
    this.renderSettings();
    this.setStatus('sun', t('hud.morning'), 1);

    onLangChange(() => {
      if (this.joystick) {
        const hint = this.joystick.element.querySelector('.joystick__hint');
        if (hint) hint.textContent = t('hud.hintTouch');
      }
      this.settingsButton.setAttribute('aria-label', t('hud.settings'));
            this.journalButton.setAttribute('aria-label', t('hud.journal'));
      this.mapButton.setAttribute('aria-label', t('hud.map'));
            this.renderEmotes();
            this.renderSettings();
          });
        }

        setCoins(coins: number): void {
          const label = this.coinChip.querySelector('span');
          if (label) label.textContent = String(coins);
          this.coinChip.setAttribute('title', `${coins} ${t('hud.coins')}`);
        }

  private renderEmotes(): void {
    this.emoteDock.replaceChildren(
      ...EMOTES.map((emote) =>
        el(
          'button',
          {
            className: 'emote-dock__btn',
            attrs: { type: 'button', 'aria-label': t(emote.key) },
            on: { click: () => this.handlers.onEmote(emote.id) }
          },
          [el('span', { html: icon(emote.icon, 21) }), el('span', { text: t(emote.key) })]
        )
      )
    );
  }

  private renderSettings(): void {
    const lang = getLang();

    this.qualityGroup.replaceChildren(
      ...QUALITIES.map((quality) =>
        el('button', {
          className: 'segmented__btn',
          attrs: {
            type: 'button',
            'aria-pressed': this.quality === quality ? 'true' : 'false'
          },
          text: t(`settings.quality.${quality}`),
          on: {
            click: () => {
              this.quality = quality;
              this.handlers.onQuality(quality);
              this.renderSettings();
            }
          }
        })
      )
    );

    this.langGroup.replaceChildren(
      ...(['id', 'en'] as Lang[]).map((code) =>
        el('button', {
          className: 'segmented__btn',
          attrs: { type: 'button', 'aria-pressed': lang === code ? 'true' : 'false' },
          text: code === 'id' ? 'Indonesia' : 'English',
          on: {
            click: () => {
              this.handlers.onLang(code);
              this.renderSettings();
            }
          }
        })
      )
    );

    this.resetButton.textContent = this.armedReset
      ? t('settings.resetConfirm')
      : t('settings.reset');
    this.resetButton.className = `btn ${this.armedReset ? 'btn--danger' : 'btn--ghost'}`;
    this.resetButton.onclick = () => {
      if (!this.armedReset) {
        this.armedReset = true;
        this.renderSettings();
        return;
      }
      this.armedReset = false;
      this.handlers.onReset();
      this.renderSettings();
    };

    this.sheet.setTitle(t('settings.title'));
        this.sheet.setCloseLabel(t('settings.close'));
        this.qualityGroup.setAttribute('aria-label', t('settings.quality'));
        this.langGroup.setAttribute('aria-label', t('settings.language'));
        this.sheet.setContent([
          this.buildSoundGroup(),
          el('div', { className: 'field-group' }, [
            el('span', { className: 'field-label', text: t('settings.quality') }),
            this.qualityGroup,
            el('p', { className: 'field-note', text: t('settings.quality.note') })
          ]),
          el('div', { className: 'field-group' }, [
            el('span', { className: 'field-label', text: t('settings.language') }),
            this.langGroup
          ]),
          el('div', { className: 'row-actions' }, [
            el(
              'button',
              {
                className: 'btn btn--ghost',
                attrs: { type: 'button' },
                on: { click: () => this.handlers.onRestart() }
              },
              [
                el('span', { html: icon('refresh', 16) }),
                el('span', { text: t('settings.restart') })
              ]
            ),
            this.resetButton,
            el('p', { className: 'sheet__note', text: t('settings.about') })
          ])
        ]);
      }

      private buildSoundGroup(): HTMLElement {
        const volumeId = 'settings-volume';
        const slider = el('input', {
          className: 'slider',
          attrs: {
            id: volumeId,
            type: 'range',
            min: '0',
            max: '100',
            step: '5',
            value: String(Math.round(this.sound.volume * 100)),
            'aria-label': t('settings.volume')
          },
          on: {
            input: (event) => {
              const value = Number((event.target as HTMLInputElement).value) / 100;
              this.sound.volume = value;
              const label = this.sheet.body.querySelector('.range-value');
              if (label) label.textContent = `${Math.round(value * 100)}%`;
              this.handlers.onVolume(value);
            }
          }
        });

        const toggle = (label: string, value: boolean, action: () => void): HTMLButtonElement =>
          el(
            'button',
            {
              className: 'toggle-chip',
              attrs: {
                type: 'button',
                'aria-pressed': value ? 'true' : 'false'
              },
              on: { click: action }
            },
            [
              el('span', { className: 'toggle-chip__dot', attrs: { 'aria-hidden': 'true' } }),
              el('span', { text: label }),
              el('span', { className: 'toggle-chip__state', text: value ? t('settings.on') : t('settings.off') })
            ]
          );

        return el('div', { className: 'field-group' }, [
          el('div', { className: 'range-head' }, [
            el('label', {
              className: 'field-label',
              attrs: { for: volumeId },
              text: t('settings.volume')
            }),
            el('span', { className: 'range-value', text: `${Math.round(this.sound.volume * 100)}%` })
          ]),
          slider,
          el('div', { className: 'toggle-row' }, [
            toggle(t('settings.music'), this.sound.music, () => {
              this.sound.music = !this.sound.music;
              this.handlers.onToggleMusic();
              this.renderSettings();
            }),
            toggle(t('settings.sfx'), this.sound.sfx, () => {
              this.sound.sfx = !this.sound.sfx;
              this.handlers.onToggleSfx();
              this.renderSettings();
            })
          ]),
          el('p', { className: 'field-note', text: t('settings.soundNote') })
        ]);
      }

  setStatus(iconName: 'sun' | 'moon', label: string, day: number): void {
    clear(this.status);
    this.status.append(
      el('span', { html: icon(iconName, 13) }),
      el('span', { text: label }),
      el('span', { className: 'dot', attrs: { 'aria-hidden': 'true' } }),
      el('span', { text: `${t('hud.dayCount')} ${day}` })
    );
  }

  toggleSettings(): void {
    if (this.sheet.isOpen()) this.sheet.close();
    else this.sheet.open();
  }

  show(): void {
    this.element.classList.remove('is-hidden');
  }

  hide(): void {
    this.element.classList.add('is-hidden');
    this.sheet.close();
  }

  setQuality(quality: Quality): void {
    this.quality = quality;
    this.renderSettings();
  }

    setSound(sound: SoundSettings): void {
      this.sound = { ...sound };
      this.renderSettings();
    }
}