import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const DEFAULT_ICON: IconName = 'trophy-outline';

// O site guarda a classe do Font Awesome (v5 e v6 têm nomes diferentes para alguns ícones).
const FA_TO_MCI: Record<string, IconName> = {
  'fa-futbol': 'soccer',
  'fa-soccer-ball': 'soccer',
  'fa-basketball': 'basketball',
  'fa-basketball-ball': 'basketball',
  'fa-volleyball': 'volleyball',
  'fa-volleyball-ball': 'volleyball',
  'fa-table-tennis': 'table-tennis',
  'fa-table-tennis-paddle-ball': 'table-tennis',
  'fa-baseball': 'baseball',
  'fa-baseball-ball': 'baseball',
  'fa-baseball-bat-ball': 'baseball-bat',
  'fa-football': 'football',
  'fa-football-ball': 'football',
  'fa-hockey-puck': 'hockey-puck',
  'fa-golf-ball': 'golf',
  'fa-golf-ball-tee': 'golf',
  'fa-bowling-ball': 'bowling',
  'fa-person-running': 'run',
  'fa-running': 'run',
  'fa-person-swimming': 'swim',
  'fa-swimmer': 'swim',
  'fa-bicycle': 'bike',
  'fa-person-biking': 'bike',
  'fa-dumbbell': 'dumbbell',
  'fa-hand-fist': 'boxing-glove',
  'fa-medal': 'medal-outline',
  'fa-trophy': 'trophy-outline',
};

// Classes de estilo/tamanho que vêm junto do nome (ex.: "fas fa-futbol", "fa-solid fa-futbol fa-2x").
const FA_MODIFIERS = new Set(['fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-brands', 'fa-fw']);

/** Converte o `icon_path` do esporte (Font Awesome) para o ícone do app; desconhecido = troféu. */
export function sportIcon(iconPath: string | null): IconName {
  const name = iconPath
    ?.trim()
    .toLowerCase()
    .split(/\s+/)
    .find((cls) => cls.startsWith('fa-') && !FA_MODIFIERS.has(cls) && !/^fa-\d*x$|^fa-(xs|sm|lg)$/.test(cls));
  return (name && FA_TO_MCI[name]) || DEFAULT_ICON;
}
