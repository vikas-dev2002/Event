export const typography = {
  display: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700' as const,
    letterSpacing: -1.2,
  },
  screenTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
};

export type TypographyVariant = keyof typeof typography;
