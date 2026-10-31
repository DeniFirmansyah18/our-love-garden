export type IconName =
  | 'settings'
  | 'close'
  | 'heart'
  | 'smile'
  | 'shy'
  | 'wave'
  | 'hug'
  | 'hold'
  | 'kiss'
  | 'dance'
  | 'sun'
  | 'moon'
  | 'lock'
  | 'flower'
  | 'camera'
  | 'refresh'
  | 'trash'
  | 'sparkle'
  | 'hat'
  | 'band'
  | 'scarf'
  | 'glasses'
  | 'leaf'
  | 'bowtie'
  | 'crown'
  | 'none'
  | 'globe'
    | 'chevron'
    | 'book'
    | 'coin'
    | 'fish'
    | 'seed'
    | 'paw'
    | 'water'
    | 'basket'
    | 'cart'
        | 'check'
            | 'gift'
            | 'home';

const PATHS: Record<IconName, string> = {
  settings:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.2v2.1M12 18.7v2.1M4.8 7.9l1.8 1M17.4 15.1l1.8 1M4.8 16.1l1.8-1M17.4 8.9l1.8-1"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  heart:
    '<path d="M12 20.2c-4.4-2.9-7.4-5.9-7.4-9.2A4 4 0 0 1 12 8.8a4 4 0 0 1 7.4 2.2c0 3.3-3 6.3-7.4 9.2z"/>',
  smile:
    '<circle cx="12" cy="12" r="8.2"/><path d="M8.6 14.2c.9 1.4 2 2 3.4 2s2.5-.6 3.4-2"/><path d="M9 9.6h.01M15 9.6h.01"/>',
  shy: '<path d="M4.6 12.4c1.1-1.5 2.4-2.2 3.8-2.2 2.4 0 4.4 2.2 7.4 2.2 1.2 0 2.3-.5 3.3-1.4"/><path d="M7.2 16.6c1.5-1 3-1.2 4.8-.6 1.8.6 3.3.4 4.8-.6"/><path d="M7 6.4c.9-.5 1.8-.5 2.7 0M14.3 6.4c.9-.5 1.8-.5 2.7 0"/>',
  wave: '<path d="M8.2 12.2V6.6a1.5 1.5 0 0 1 3 0v4.6"/><path d="M11.2 10.4V5.4a1.5 1.5 0 0 1 3 0v5"/><path d="M14.2 10.8V7a1.5 1.5 0 0 1 3 0v6.4a6.4 6.4 0 0 1-6.4 6.4h-.6a5.6 5.6 0 0 1-5.6-5.6v-2.4a1.5 1.5 0 0 1 3 0v1.6"/>',
  hug: '<circle cx="8.4" cy="10" r="3.1"/><circle cx="15.6" cy="10" r="3.1"/><path d="M3.6 19.4c.7-2.6 2.4-4 4.8-4s4.1 1.4 4.8 4M10.8 19.4c.7-2.6 2.4-4 4.8-4s4.1 1.4 4.8 4"/>',
  hold: '<path d="M7.4 13.6l-1.6 1.6a3 3 0 0 0 4.2 4.2l3-3"/><path d="M16.6 10.4l1.6-1.6a3 3 0 0 0-4.2-4.2l-3 3"/><path d="M9.4 14.6l5.2-5.2"/><path d="M9 9.6l1.9 1.9M13.1 13.7l1.9 1.9"/>',
  kiss: '<path d="M12 20.2c-4.4-2.9-7.4-5.9-7.4-9.2A4 4 0 0 1 12 8.8a4 4 0 0 1 7.4 2.2c0 3.3-3 6.3-7.4 9.2z"/><path d="M9.4 12.6c.8.9 1.7 1.3 2.6 1.3s1.8-.4 2.6-1.3"/>',
  dance:
    '<path d="M10 17.4a2.6 2.6 0 1 1-2.6-2.6c.9 0 1.8.4 2.6 1.1V6.2l7.4-1.6v9.4"/><path d="M17.4 16.2a2.6 2.6 0 1 1-2.6-2.6c.9 0 1.8.4 2.6 1.1"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  moon: '<path d="M19.6 14.8A8 8 0 0 1 9.2 4.4a8.2 8.2 0 1 0 10.4 10.4z"/>',
  lock: '<rect x="5.2" y="10.4" width="13.6" height="9.2" rx="2.6"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4"/>',
  flower:
    '<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c0-2.2 1-3.6 2.6-4.4.8 1.9.6 3.6-.6 4.8M14.4 12c2.2 0 3.6 1 4.4 2.6-1.9.8-3.6.6-4.8-.6M12 14.4c0 2.2-1 3.6-2.6 4.4-.8-1.9-.6-3.6.6-4.8M9.6 12c-2.2 0-3.6-1-4.4-2.6 1.9-.8 3.6-.6 4.8.6"/>',
  camera:
    '<rect x="3.2" y="7.4" width="17.6" height="12.4" rx="3"/><circle cx="12" cy="13.6" r="3.4"/><path d="M9 7.4l1.2-2.2h3.6L15 7.4"/>',
  refresh: '<path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2"/><path d="M19.8 4.6v4.2h-4.2"/>',
  trash: '<path d="M4.8 7.4h14.4"/><path d="M9.4 7.4V5.2h5.2v2.2"/><path d="M6.6 7.4l.9 11.2c0 .9.8 1.6 1.7 1.6h5.6c.9 0 1.7-.7 1.7-1.6l.9-11.2"/>',
  sparkle: '<path d="M12 3.4l1.9 5.5 5.5 1.9-5.5 1.9L12 18.2l-1.9-5.5L4.6 10.8l5.5-1.9z"/><path d="M18.4 16.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  hat: '<path d="M3.4 15.4c0-1.3 3.9-2.3 8.6-2.3s8.6 1 8.6 2.3-3.9 2.3-8.6 2.3-8.6-1-8.6-2.3z"/><path d="M7.6 14.2c0-2.8.6-5 4.4-5s4.4 2.2 4.4 5"/>',
  band: '<path d="M4.6 15.6c1-4.2 3.8-6.8 7.4-6.8s6.4 2.6 7.4 6.8"/><circle cx="7.4" cy="9.8" r="2"/><circle cx="16.6" cy="9.8" r="2"/>',
  scarf:
    '<path d="M5.6 8.4c1.9 2.6 4 3.9 6.4 3.9s4.5-1.3 6.4-3.9"/><path d="M5.6 8.4c-.8 1.6-1 3.2-.6 4.8"/><path d="M14.8 12.1l2.6 6.2c.3.8-.1 1.6-.9 1.9l-1.6.5"/><path d="M18.4 8.4c.8 1.6 1 3.2.6 4.8"/>',
  glasses:
    '<circle cx="7.4" cy="12.4" r="3.4"/><circle cx="16.6" cy="12.4" r="3.4"/><path d="M10.8 12.2c.7-.5 1.7-.5 2.4 0"/><path d="M4 11.4L2.4 9.8M20 11.4l1.6-1.6"/>',
  leaf: '<path d="M20 4.2c-8.4-.6-13.4 3-13.4 8.6 0 2.2 1.2 4 3.4 5.2"/><path d="M20 4.2c.6 8.4-3 13.4-8.6 13.4-1 0-2-.2-2.8-.6"/><path d="M6 20.4c.8-4.4 3.2-8 7.2-10.8"/>',
  bowtie: '<path d="M12 12l-6.6-3.6v7.2z"/><path d="M12 12l6.6-3.6v7.2z"/><circle cx="12" cy="12" r="1.6"/>',
  crown: '<path d="M3.4 16.6l1.4-8.8 4.4 3.2L12 5.6l2.8 5.4 4.4-3.2 1.4 8.8z"/><path d="M3.4 16.6h17.2"/>',
  none: '<circle cx="12" cy="12" r="8.2"/><path d="M6.4 17.6L17.6 6.4"/>',
  globe: '<circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4"/><path d="M12 3.8c2.4 2.4 3.6 5.2 3.6 8.2s-1.2 5.8-3.6 8.2c-2.4-2.4-3.6-5.2-3.6-8.2s1.2-5.8 3.6-8.2z"/>',
  chevron: '<path d="M8.4 10.2L12 13.8l3.6-3.6"/>',
  book: '<path d="M4.6 5.4c2.6-1 5.2-1 7.4.6 2.2-1.6 4.8-1.6 7.4-.6v12.6c-2.6-1-5.2-1-7.4.6-2.2-1.6-4.8-1.6-7.4-.6z"/><path d="M12 6v12.6"/>',
  coin: '<circle cx="12" cy="12" r="7.8"/><path d="M9.6 9.4h4.8M9.6 12h4.8M9.6 14.6h4.8"/><path d="M12 8v8"/>',
  fish: '<path d="M3.4 12c2.6-4 6-6 9.2-6 2.8 0 5.2 1.6 7 4.6-1.8 3-4.2 4.6-7 4.6-3.2 0-6.6-2-9.2-4.6z"/><path d="M5.6 12c1.4 1.4 3 2.2 4.6 2.6"/><circle cx="15.4" cy="10.8" r="0.9" fill="currentColor" stroke="none"/>',
  seed: '<path d="M12 20.2c-3.8 0-6.6-2.8-6.6-6.4C5.4 9.2 8.4 4.4 12 3.4c3.6 1 6.6 5.8 6.6 10.4 0 3.6-2.8 6.4-6.6 6.4z"/><path d="M12 20.2V9.4"/>',
  paw: '<ellipse cx="8" cy="9" rx="1.9" ry="2.4"/><ellipse cx="16" cy="9" rx="1.9" ry="2.4"/><ellipse cx="5.2" cy="14" rx="1.6" ry="2"/><ellipse cx="18.8" cy="14" rx="1.6" ry="2"/><path d="M12 14.4c2.6 0 4.6 2 4.6 3.8 0 1.6-1.4 2.4-4.6 2.4s-4.6-.8-4.6-2.4c0-1.8 2-3.8 4.6-3.8z"/>',
  water: '<path d="M12 3.4c3.4 4.4 5.6 7.4 5.6 10.2A5.6 5.6 0 0 1 12 19.4a5.6 5.6 0 0 1-5.6-5.8c0-2.8 2.2-5.8 5.6-10.2z"/>',
  basket: '<path d="M4.4 9.6h15.2l-1.6 8.2a2 2 0 0 1-2 1.6H8a2 2 0 0 1-2-1.6z"/><path d="M8.6 9.6l1.2-4.4M15.4 9.6l-1.2-4.4M4.4 13.2h15.2"/>',
  cart: '<circle cx="9.2" cy="18.4" r="1.6"/><circle cx="17.2" cy="18.4" r="1.6"/><path d="M3.4 4.6h2.2l2.4 9.6h9.6l2-6.4H6.2"/>',
    check: '<path d="M5.2 12.6l4.4 4.4 9.2-9.6"/>',
        gift: '<rect x="3.6" y="8.4" width="16.8" height="11.8" rx="1.8"/><path d="M3.6 11.4h16.8"/><path d="M12 8.4v11.8"/><path d="M12 8.4c-2.4-2.2-5.4-.4-5.4 1.2 0 1.3 1.4 2.1 3.6 1.4"/><path d="M12 8.4c2.4-2.2 5.4-.4 5.4 1.2 0 1.3-1.4 2.1-3.6 1.4"/>',
        home: '<path d="M4.6 11.2 12 4.8l7.4 6.4"/><path d="M6.4 9.8v9.4h11.2V9.8"/><path d="M10 19.2v-5.4h4v5.4"/>'
    };

export function icon(name: IconName, size = 20): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}

export function iconSolid(name: IconName, size = 20): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}