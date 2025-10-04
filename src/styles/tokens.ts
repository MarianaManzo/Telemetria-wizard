export const spacing = {
  unit: 8,
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
} as const;

export const radii = {
  base: 8,
  sm: 4,
  lg: 16,
} as const;

export const lineHeights = {
  base: 1.5,
} as const;

export const designTokens = {
  spacing,
  fontSizes,
  radii,
  lineHeights,
};

export const toPx = (value: number) => `${value}px` as const;

export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof fontSizes;
export type RadiusToken = keyof typeof radii;
export type LineHeightToken = keyof typeof lineHeights;
