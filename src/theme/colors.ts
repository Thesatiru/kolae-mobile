// Identidade do app (Figma "Identidade visual Kolae"): #0084FF, #000000, #FFFFFF.
// Em Configurações › Aparência a pessoa escolhe uma COR e um MODO (claro, escuro ou automático):
//   Kolae: destaque azul, logo branca sobre azul (no escuro: botões azuis, logo branca);
//   Neutro: destaque preto e logo preta (no escuro: destaque branco);
//   Verde, Vermelho, Rosa, Roxo: como o Kolae, trocando o azul pela cor;
//   Orgulho: botões em azul escuro; arco-íris na logo, nas curvas do cabeçalho, no anel do
//   avatar e em faixas de destaque. Nunca há texto em cima das faixas;
//   Alto contraste: preto e branco puros, bordas grossas e links sublinhados
//   (no escuro: amarelo sobre preto).
// Contraste (WCAG AA): texto branco sobre "primary" >= 4,5:1 e "link" sobre o fundo >= 4,5:1.
// No escuro o botão mantém a cor forte e o link usa um tom claro da mesma cor.
// Confira o contraste antes de mudar um hex.
// "brand" é o fundo do cabeçalho com a logo (login, cadastro, esqueci a senha).

export type ThemeColor = 'kolae' | 'neutral' | 'green' | 'red' | 'pink' | 'purple' | 'pride' | 'contrast';
export type ThemeMode = 'light' | 'dark' | 'system';

// Ordem em que aparecem em Configurações › Aparência.
export const THEME_COLORS: ThemeColor[] = ['kolae', 'neutral', 'green', 'red', 'pink', 'purple', 'pride', 'contrast'];

export type ThemeColors = {
  scheme: 'light' | 'dark';
  background: string;
  surface: string;
  border: string;
  divider: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  link: string;
  selected: string;
  onSelected: string;
  danger: string;
  brand: string;
  onBrand: string;
  brandStatusBar: 'light' | 'dark'; // ícones da barra de status sobre o cabeçalho da marca
  rainbow: string[] | null; // faixas do tema Orgulho (logo, curvas, anel do avatar...); null nos outros
  highContrast: boolean; // bordas grossas em volta de grupos/campos e links sempre sublinhados
};

const kolaeLight: ThemeColors = {
  scheme: 'light',
  background: '#FFFFFF',
  surface: '#F0F1F3', // grupos de configurações, busca, círculos de categoria
  border: '#B0B0B0',
  divider: '#E0E0E0',
  text: '#111111',
  textMuted: '#6B6B6B',
  primary: '#0084FF',
  onPrimary: '#FFFFFF',
  link: '#0069CC',
  selected: '#111111', // categoria selecionada
  onSelected: '#FFFFFF',
  danger: '#C62828',
  brand: '#0084FF',
  onBrand: '#FFFFFF',
  brandStatusBar: 'light',
  rainbow: null,
  highContrast: false,
};

const kolaeDark: ThemeColors = {
  scheme: 'dark',
  background: '#121417',
  surface: '#1D2025',
  border: '#3A3F47',
  divider: '#2A2E34',
  text: '#F2F2F2',
  textMuted: '#A0A4AB',
  primary: '#0084FF',
  onPrimary: '#FFFFFF',
  link: '#4DA8FF',
  selected: '#F2F2F2',
  onSelected: '#121417',
  danger: '#FF6B6B',
  brand: '#1D2025',
  onBrand: '#FFFFFF',
  brandStatusBar: 'light',
  rainbow: null,
  highContrast: false,
};

// Claro: a cor entra nos botões, links, cabeçalho e num tom leve no fundo dos grupos.
// Escuro: botão na cor forte (texto branco) e um tom claro para links e logo.
function accent(strong: string, lightSurface: string, darkStrong: string, darkTint: string) {
  return {
    light: { ...kolaeLight, primary: strong, link: strong, brand: strong, surface: lightSurface },
    dark: { ...kolaeDark, primary: darkStrong, link: darkTint, onBrand: darkTint },
  };
}

// Bandeira do orgulho em tons mais vivos: cada faixa tem contraste >= 3:1 com o cabeçalho.
const PRIDE_STRIPES = ['#FF4D4D', '#FF8C00', '#FFED00', '#24A148', '#3D7BFF', '#A33BC7'];

export const palette: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
  kolae: { light: kolaeLight, dark: kolaeDark },
  neutral: {
    light: { ...kolaeLight, primary: '#000000', link: '#111111', brand: '#FFFFFF', onBrand: '#000000', brandStatusBar: 'dark' },
    dark: { ...kolaeDark, primary: '#F2F2F2', onPrimary: '#121417', link: '#F2F2F2' },
  },
  green: accent('#15803D', '#EDF5EF', '#15803D', '#4ADE80'),
  red: (() => {
    const red = accent('#D32F2F', '#F8EEEE', '#DC2626', '#F87171');
    // erro mais escuro (claro) / mais claro (escuro) que o destaque, para não se confundir com ele
    return { light: { ...red.light, danger: '#8E1B1B' }, dark: { ...red.dark, danger: '#FFB4B4' } };
  })(),
  pink: accent('#D81B60', '#FAEEF3', '#DB2777', '#F472B6'),
  purple: accent('#7E22CE', '#F3EEFA', '#9333EA', '#C084FC'),
  pride: {
    light: {
      ...kolaeLight,
      primary: '#24408E',
      link: '#24408E',
      brand: '#181A1F',
      surface: '#F3F0FA', // lilás bem leve nos grupos e na busca
      rainbow: PRIDE_STRIPES,
    },
    dark: { ...kolaeDark, primary: '#3D5BC4', link: '#8FA8FF', brand: '#181A1F', rainbow: PRIDE_STRIPES },
  },
  contrast: {
    light: {
      scheme: 'light',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      border: '#000000',
      divider: '#000000',
      text: '#000000',
      textMuted: '#333333',
      primary: '#000000',
      onPrimary: '#FFFFFF',
      link: '#0040C1',
      selected: '#000000',
      onSelected: '#FFFFFF',
      danger: '#B00000',
      brand: '#000000',
      onBrand: '#FFFFFF',
      brandStatusBar: 'light',
      rainbow: null,
      highContrast: true,
    },
    dark: {
      scheme: 'dark',
      background: '#000000',
      surface: '#000000',
      border: '#FFFFFF',
      divider: '#FFFFFF',
      text: '#FFFFFF',
      textMuted: '#E0E0E0',
      primary: '#FFD600',
      onPrimary: '#000000',
      link: '#FFD600',
      selected: '#FFD600',
      onSelected: '#000000',
      danger: '#FF6B6B',
      brand: '#000000',
      onBrand: '#FFD600',
      brandStatusBar: 'light',
      rainbow: null,
      highContrast: true,
    },
  },
};

/** Borda em volta de blocos cinza no alto contraste, onde o fundo do bloco some no fundo da tela. */
export function contrastOutline(c: ThemeColors) {
  return c.highContrast ? { borderWidth: 2, borderColor: c.border } : null;
}

/** Links sublinhados no alto contraste (não dependem só da cor). */
export function linkDecoration(c: ThemeColors) {
  return c.highContrast ? ({ textDecorationLine: 'underline' } as const) : null;
}

// Status da quadra: sempre com texto junto, nunca só a cor. Iguais em todos os temas.
export const statusColors = {
  available: { accent: '#0084FF', background: '#E5F2FF', text: '#0B3A66' },
  in_use: { accent: '#D96500', background: '#FFF1E5', text: '#6B2F00' },
  closed: { accent: '#8A8A8A', background: '#F1F2F4', text: '#4A4A4A' },
};
