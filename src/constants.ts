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

export const CREATURES: { name: string; element: Element; ability: string }[] = [
  { name: 'Ember Jelly', element: 'Fire', ability: 'Blazing Trail — leaves fire behind as you move' },
  { name: 'Aqua Jelly', element: 'Water', ability: 'Bubble Shield — absorbs one hit before bursting' },
  { name: 'Breeze Jelly', element: 'Sky', ability: 'Gust Dash — double speed burst' },
  { name: 'Leaf Jelly', element: 'Forest', ability: 'Vine Net — slows enemies on contact' },
  { name: 'Star Jelly', element: 'Mystic', ability: 'Lucky Star — bonus essence drops' }
];