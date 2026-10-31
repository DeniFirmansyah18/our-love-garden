import { SPOTS, ZONES, type ZoneId } from '../data/zones';
import { el } from './dom';
import { icon } from './icons';
import { getLang, t } from './i18n';
import { Sheet } from './sheet';

export interface MapState {
  player: { x: number; z: number; angle: number };
  dudu: { x: number; z: number };
  visited: string[];
  discoveredSpots: string[];
  memoryCount: number;
}

const WORLD_RADIUS = 40.5;

function drawMap(
  canvas: HTMLCanvasElement,
  state: MapState,
  options: { size: number; detailed: boolean }
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = options.size;
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const scale = (size * 0.46) / WORLD_RADIUS;
  const toScreen = (x: number, z: number) => ({
    x: center + x * scale,
    y: center + z * scale
  });

  ctx.fillStyle = '#dff0ee';
  ctx.beginPath();
  ctx.arc(center, center, size * 0.49, 0, Math.PI * 2);
  ctx.fill();

  const islandPoint = toScreen(0, 0);
  ctx.fillStyle = '#efdfc1';
  ctx.beginPath();
  ctx.arc(islandPoint.x, islandPoint.y, 34 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#accb90';
  ctx.beginPath();
  ctx.arc(islandPoint.x, islandPoint.y, 33 * scale, 0, Math.PI * 2);
  ctx.fill();

  const lake = toScreen(0, -16);
  ctx.fillStyle = '#9fd3d0';
  ctx.beginPath();
  ctx.arc(lake.x, lake.y, 7.3 * scale, 0, Math.PI * 2);
  ctx.fill();

  const islet = toScreen(37, 11);
  ctx.fillStyle = '#accb90';
  ctx.beginPath();
  ctx.arc(islet.x, islet.y, 3.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#c09068';
  ctx.lineWidth = Math.max(2, size * 0.012);
  ctx.beginPath();
  const bridgeStart = toScreen(31.4, 9.4);
  const bridgeEnd = toScreen(35.2, 11.2);
  ctx.moveTo(bridgeStart.x, bridgeStart.y);
  ctx.lineTo(bridgeEnd.x, bridgeEnd.y);
  ctx.stroke();

  for (const zone of ZONES) {
    const point = toScreen(zone.center.x, zone.center.z);
    const visited = state.visited.includes(zone.id);
    const unlocked =
      visited ||
      zone.unlock === 'start' ||
      (typeof zone.unlock === 'object' && state.memoryCount >= zone.unlock.memories);

    if (visited) {
      ctx.fillStyle = `#${zone.color.toString(16).padStart(6, '0')}`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(3, size * 0.016), 0, Math.PI * 2);
      ctx.fill();
      if (options.detailed) {
        ctx.fillStyle = '#4a1f1a';
        ctx.font = `${Math.round(size * 0.032)}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(zone.name[getLang()], point.x, point.y - size * 0.035);
      }
    } else if (unlocked) {
      ctx.strokeStyle = `#${zone.color.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(4, size * 0.019), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = 'rgba(74, 31, 26, 0.28)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(4, size * 0.018), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 250, 242, 0.9)';
      ctx.font = `bold ${Math.round(size * 0.026)}px "Segoe UI", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', point.x, point.y);
      ctx.textBaseline = 'alphabetic';
    }

    if (options.detailed && state.discoveredSpots.length > 0) {
      for (const spot of SPOTS.filter((entry) => entry.zone === zone.id)) {
        if (!state.discoveredSpots.includes(spot.id)) continue;
        const spotPoint = toScreen(spot.position.x, spot.position.z);
        ctx.fillStyle = '#cf7189';
        ctx.beginPath();
        ctx.arc(spotPoint.x, spotPoint.y, size * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const dudu = toScreen(state.dudu.x, state.dudu.z);
  ctx.fillStyle = '#d9a58c';
  ctx.beginPath();
  ctx.arc(dudu.x, dudu.y, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fffaf2';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const player = toScreen(state.player.x, state.player.z);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(state.player.angle);
  ctx.fillStyle = '#a9546a';
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.028);
  ctx.lineTo(size * 0.019, size * 0.02);
  ctx.lineTo(0, size * 0.01);
  ctx.lineTo(-size * 0.019, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fffaf2';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

export class MiniMap {
  readonly element: HTMLButtonElement;
  readonly canvas = document.createElement('canvas');
  private handler: (() => void) | null = null;

  constructor() {
    this.canvas.className = 'minimap__canvas';
    this.element = el(
      'button',
      {
        className: 'minimap',
        attrs: {
          type: 'button',
          'aria-label': t('map.open'),
          title: t('map.open')
        },
        on: { click: () => this.handler?.() }
      },
      [this.canvas]
    );
  }

  onClick(handler: () => void): void {
    this.handler = handler;
  }

  update(state: MapState): void {
    drawMap(this.canvas, state, { size: 92, detailed: false });
    this.element.setAttribute('aria-label', t('map.open'));
  }
}

export class MapSheet {
  readonly sheet: Sheet;
  readonly canvas = document.createElement('canvas');
  private state: MapState | null = null;
  private onTravel: ((zone: ZoneId) => void) | null = null;

  constructor(handlers: { onClose?: () => void } = {}) {
    this.sheet = new Sheet({ onClose: () => handlers.onClose?.() });
  }

  open(state: MapState, onTravel: (zone: ZoneId) => void): void {
    this.state = state;
    this.onTravel = onTravel;
    this.render();
    this.sheet.open();
  }

  close(): void {
    this.sheet.close();
  }

  isOpen(): boolean {
    return this.sheet.isOpen();
  }

  refresh(state: MapState): void {
    this.state = state;
    if (this.sheet.isOpen()) this.render();
  }

  private render(): void {
    if (!this.state) return;
    this.sheet.setTitle(t('map.title'));
    this.sheet.setCloseLabel(t('map.close'));

    const lang = getLang();
    drawMap(this.canvas, this.state, { size: Math.min(320, window.innerWidth - 72), detailed: true });

    const rows = ZONES.map((zone) => {
      const visited = this.state!.visited.includes(zone.id);
      const unlocked =
        visited ||
        zone.unlock === 'start' ||
        (typeof zone.unlock === 'object' && this.state!.memoryCount >= zone.unlock.memories);

      const action = visited
        ? el(
            'button',
            {
              className: 'btn btn--quiet btn--tiny',
              attrs: { type: 'button' },
              on: { click: () => this.onTravel?.(zone.id) }
            },
            [el('span', { html: icon('sparkle', 13) }), el('span', { text: t('map.travel') })]
          )
        : el('span', {
            className: 'map-row__hint',
            text: unlocked ? t('map.walkThere') : t('map.locked')
          });

      return el('div', { className: `map-row ${visited ? 'is-visited' : unlocked ? 'is-open' : 'is-locked'}` }, [
        el('span', {
          className: 'map-row__dot',
          attrs: { style: `background:#${zone.color.toString(16).padStart(6, '0')}` }
        }),
        el('div', { className: 'map-row__info' }, [
          el('strong', { text: visited || unlocked ? zone.name[lang] : t('map.unknown') }),
          el('span', { text: visited ? zone.blurb[lang] : zone.hint[lang] })
        ]),
        action
      ]);
    });

    this.sheet.setContent([
      el('div', { className: 'map-canvas-wrap' }, [this.canvas]),
      el('p', { className: 'field-note', text: t('map.legend') }),
      el('div', { className: 'map-list' }, rows)
    ]);
  }
}