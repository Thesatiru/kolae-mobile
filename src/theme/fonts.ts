// Kanit para títulos e marca; o resto usa a fonte do sistema.
export const fonts = {
  regular: 'Kanit_400Regular',
  medium: 'Kanit_500Medium',
  bold: 'Kanit_700Bold',
};

// "Fonte para leitura fácil" (Configurações › Aparência): Atkinson Hyperlegible, feita para
// baixa visão e com letras bem diferentes entre si (I/l/1, O/0), o que ajuda na dislexia.
// Tem só regular e negrito: pesos a partir de 600 (e a Kanit medium/bold) viram negrito.
export const readableFonts = {
  regular: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
};

const BOLD_WEIGHTS = new Set(['600', '700', '800', '900', 'bold']);

export function readableFamily(fontFamily: string | undefined, fontWeight: string | number | undefined) {
  const bold = BOLD_WEIGHTS.has(String(fontWeight)) || fontFamily === fonts.medium || fontFamily === fonts.bold;
  return bold ? readableFonts.bold : readableFonts.regular;
}
