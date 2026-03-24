export const Colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8F65',
  primaryDark: '#E55A25',
  secondary: '#004E89',
  secondaryLight: '#1A6AAA',
  background: '#FAFAFA',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#666666',
  grayLight: '#999999',
  grayLighter: '#E0E0E0',
  grayLightest: '#F5F5F5',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  star: '#FFB800',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
