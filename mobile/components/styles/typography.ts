// components/styles/typography.ts
export const typography = {
  // Font families
  fonts: {
    primary: 'Inter', // Headings, buttons, emphasis
    secondary: 'Manrope', // Body text, UI elements
  },

  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  } as const,

  // Font sizes (optimized for mobile)
  sizes: {
    // Headings
    hero: 32,      // Hero titles
    h1: 28,        // Page titles
    h2: 24,        // Section headers
    h3: 20,        // Card titles
    h4: 18,        // Subsection headers
    
    // Body text
    large: 17,     // Prominent body text
    body: 15,      // Default body text
    small: 13,     // Secondary info
    caption: 11,   // Captions, timestamps
    
    // UI elements
    button: 16,    // Button text
    tab: 14,       // Tab labels
    badge: 12,     // Badges, chips
  },

  // Line heights
  lineHeights: {
    tight: 1.2,    // Headings
    normal: 1.4,   // UI elements
    relaxed: 1.6,  // Body text
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,   // Large headings
    normal: 0,     // Default
    wide: 0.5,     // Small caps, badges
  },
};