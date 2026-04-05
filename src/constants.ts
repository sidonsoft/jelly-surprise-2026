export const ELEMENTS = ['Fire', 'Water', 'Sky', 'Forest', 'Mystic'] as const;
export type Element = typeof ELEMENTS[number];

export const ELEMENT_COLORS: Record<Element, number> = {
  Fire: 0xff6b35,
  Water: 0x3498db,
  Sky: 0x9b59b6,
  Forest: 0x27ae60,
  Mystic: 0xf1c40f
};

export const ELEMENT_EMOJI: Record<Element, string> = {
  Fire: '🔥',
  Water: '💧',
  Sky: '🌬️',
  Forest: '🍃',
  Mystic: '✨'
};

export const CREATURES: { name: string; element: Element }[] = [
  { name: 'Ember Jelly', element: 'Fire' },
  { name: 'Aqua Jelly', element: 'Water' },
  { name: 'Breeze Jelly', element: 'Sky' },
  { name: 'Leaf Jelly', element: 'Forest' },
  { name: 'Star Jelly', element: 'Mystic' }
];