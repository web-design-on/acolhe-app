/** Espaçamentos, raios e tipografia do app. Tamanhos generosos: o público inclui pessoas idosas. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 18,
  pill: 999,
} as const;

/** Nomes das fontes carregadas em src/app/_layout.tsx. */
export const fontFamily = {
  regular: "AtkinsonHyperlegible_400Regular",
  bold: "AtkinsonHyperlegible_700Bold",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 27,
  display: 34,
} as const;

/** Altura mínima de áreas de toque (acessibilidade). */
export const touchTarget = 52;

export const shadow = {
  card: {
    boxShadow: "0 3px 8px rgba(62, 105, 142, 0.10), 0 12px 24px rgba(62, 105, 142, 0.12)",
  },
} as const;
