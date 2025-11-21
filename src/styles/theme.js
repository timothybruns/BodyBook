// src/styles/theme.js
export const colors = {
  // Primary colors - iOS Clock inspired
  primary: '#FF9500', // Orange accent (iOS orange)
  primaryDark: '#FF8C00',
  
  // Backgrounds
  background: '#000000', // Pure black
  backgroundLight: '#1C1C1E', // Dark gray (iOS dark mode)
  backgroundCard: '#2C2C2E', // Card background
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93', // iOS secondary text
  textTertiary: '#636366',
  
  // Status colors (preserve for trends)
  positive: '#10b981', // Green
  negative: '#ef4444', // Red
  neutral: '#8E8E93',
  
  // Score colors
  scoreExcellent: '#10b981',
  scoreGood: '#84cc16',
  scoreNeutral: '#FF9500',
  scorePoor: '#f97316',
  scoreBad: '#ef4444',
};

export const spacing = {
  sm: 8,
  md: 12,
  lg: 20,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  cardStrong: {
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }
};