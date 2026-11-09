import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { FloorType } from '@/api/types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Um ícone por tipo de piso (D15). Chave desconhecida (piso novo no site) = ícone genérico.
const FLOOR_ICONS: Record<FloorType, IconName> = {
  synthetic: 'soccer-field', // grama sintética
  court: 'texture-box', // quadra (cimento, poliesportiva)
  sand: 'beach', // areia
  clay: 'terrain', // saibro
  grass: 'grass', // grama natural
  wood: 'reorder-horizontal', // madeira (tábuas)
};

export function floorIcon(floor: FloorType): IconName {
  return FLOOR_ICONS[floor] ?? 'texture-box';
}
