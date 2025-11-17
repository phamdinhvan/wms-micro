'use client';
import {
  createTheme,
  DEFAULT_THEME,
  DefaultMantineColor,
  MantineColorsTuple,
  rem,
  VariantColorResolverResult,
  VariantColorsResolver,
} from '@mantine/core';

type ExtendedCustomColors =
  | 'primary'
  | 'lightBlue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'priority'
  | 'pending'
  | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}

const customVariantColorResolver: VariantColorsResolver = input => {
  const {variant, color = '', theme} = input;

  // Get full 10-color scale from the theme
  const colors = theme.colors[color] || DEFAULT_THEME.colors.gray;

  const filled = {
    background: colors[5],
    color: color === 'yellow' ? '#070A30' : '#ffffff',
    border: 'transparent',
    hover: colors[7],
  } as VariantColorResolverResult;

  const light = {
    background: colors[0],
    color: colors[7],
    border: 'transparent',
    hover: colors[1],
  } as VariantColorResolverResult;

  const outline = {
    background: 'transparent',
    color: colors[6],
    border: `1px solid ${colors[4]}`,
    hover: colors[0],
  } as VariantColorResolverResult;

  const subtle = {
    background: 'transparent',
    color: colors[6],
    border: 'transparent',
    hover: colors[1],
  } as VariantColorResolverResult;

  const white = {
    background: '#ffffff',
    color: colors[6],
    border: 'transparent',
    hover: colors[0],
  } as VariantColorResolverResult;

  const transparent = {
    background: 'transparent',
    color: colors[6],
    border: 'transparent',
    hover: 'transparent',
  } as VariantColorResolverResult;

  const variants = {
    filled,
    light,
    outline,
    subtle,
    white,
    transparent,
    default: filled,
  };

  return variants[variant as never] || variants.default;
};

export const customAppTheme = createTheme({
  fontFamily: 'var(--font-primary), sans-serif',
  fontFamilyMonospace: 'var(--font-mono), monospace',
  autoContrast: true,
  headings: {
    fontFamily: 'var(--font-primary), sans-serif',
    fontWeight: '600',
    sizes: {
      h1: {fontSize: rem(36), lineHeight: '1.25', fontWeight: '700'},
      h2: {fontSize: rem(30), lineHeight: '1.25', fontWeight: '700'},
      h3: {fontSize: rem(24), lineHeight: '1.25', fontWeight: '600'},
      h4: {fontSize: rem(20), lineHeight: '1.5', fontWeight: '600'},
      h5: {fontSize: rem(18), lineHeight: '1.5', fontWeight: '500'},
      h6: {fontSize: rem(16), lineHeight: '1.5', fontWeight: '500'},
    },
  },
  colors: {
    primary: [
      '#E8EAF6',
      '#D1D5ED',
      '#C5CAE9',
      '#7986CB',
      '#3F51B5',
      '#111770',
      '#0F1460',
      '#0D1150',
      '#0A0E40',
      '#070A30',
    ],
    cyan: [
      '#E0F7FA',
      '#B2EBF2',
      '#80DEEA',
      '#4DD0E1',
      '#26C6DA',
      '#00BCD4',
      '#00ACC1',
      '#0097A7',
      '#00838F',
      '#006064',
    ],
    yellow: [
      '#FFF8E1',
      '#FFECB3',
      '#FFE082',
      '#FFD54F',
      '#FFCA28',
      '#FFC107',
      '#FFB300',
      '#FFA000',
      '#FF8F00',
      '#FF6F00',
    ],
    lightBlue: [
      '#E1F5FE',
      '#B3E5FC',
      '#81D4FA',
      '#4FC3F7',
      '#29B6F6',
      '#03A9F4',
      '#039BE5',
      '#0288D1',
      '#0277BD',
      '#01579B',
    ],
    success: [
      '#E8F5E9',
      '#C8E6C9',
      '#A5D6A7',
      '#81C784',
      '#66BB6A',
      '#4CAF50',
      '#43A047',
      '#388E3C',
      '#2E7D32',
      '#1B5E20',
    ],
    warning: [
      '#FFF3E0',
      '#FFE0B2',
      '#FFCC80',
      '#FFB74D',
      '#FFA726',
      '#FF9800',
      '#FB8C00',
      '#F57C00',
      '#EF6C00',
      '#E65100',
    ],
    danger: [
      '#FFEBEE',
      '#FFCDD2',
      '#EF9A9A',
      '#E57373',
      '#EF5350',
      '#F44336',
      '#E53935',
      '#D32F2F',
      '#C62828',
      '#B71C1C',
    ],
    info: [
      '#E0F7FA',
      '#B2EBF2',
      '#80DEEA',
      '#4DD0E1',
      '#26C6DA',
      '#00ACC1',
      '#0097A7',
      '#00838F',
      '#00796B',
      '#004D40',
    ],
    priority: [
      '#F3E5F5',
      '#E1BEE7',
      '#CE93D8',
      '#BA68C8',
      '#AB47BC',
      '#9C27B0',
      '#8E24AA',
      '#7B1FA2',
      '#6A1B9A',
      '#4A148C',
    ],
    pending: [
      '#ECEFF1',
      '#CFD8DC',
      '#B0BEC5',
      '#90A4AE',
      '#78909C',
      '#607D8B',
      '#546E7A',
      '#455A64',
      '#37474F',
      '#263238',
    ],
    gray: [
      '#FAFBFC',
      '#F5F6F8',
      '#ECEDEF',
      '#E1E2E5',
      '#BDBEC2',
      '#9E9FA3',
      '#787A7E',
      '#5C5D61',
      '#3A3B3F',
      '#1A1B1E',
    ],
  },
  primaryColor: 'primary',
  primaryShade: 5,
  defaultRadius: 8,
  spacing: {
    xs: rem(8),
    sm: rem(16),
    md: rem(24),
    lg: rem(32),
    xl: rem(40),
  },
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
    '2xl': rem(24),
    '3xl': rem(30),
    '4xl': rem(36),
  },
  lineHeights: {
    xs: '1.25',
    sm: '1.5',
    md: '1.75',
  },
  breakpoints: {
    xs: '640px',
    sm: '768px',
    md: '1024px',
    lg: '1440px',
    xl: '1920px',
  },
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
    sm: '0 4px 12px rgba(0, 0, 0, 0.15)',
    md: '0 6px 20px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.25)',
  },
  variantColorResolver: customVariantColorResolver,
  components: {
    Button: {
      defaultProps: {
        radius: 6,
        fw: '500',
      },
    },
    Card: {
      styles: {
        root: {
          borderRadius: 8,
          padding: 24,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E1E2E5',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    Tooltip: {
      defaultProps: {
        radius: 8,
        withArrow: true,
      },
    },
    DateInput: {
      defaultProps: {
        styles: {
          monthRow: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    DatePickerInput: {
      defaultProps: {
        styles: {
          monthRow: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    DateTimePicker: {
      defaultProps: {
        styles: {
          monthRow: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    DatePicker: {
      defaultProps: {
        styles: {
          monthRow: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    Modal: {
      styles: {
        header: {
          backgroundColor: 'var(--mantine-color-primary-5)',
          paddingTop: 16,
          paddingBottom: 16,
        },
        title: {
          fontWeight: 500,
          color: '#FFFFFF',
        },
        body: {
          paddingTop: 20,
          overflow: 'auto',
          flex: 1,
        },
        content: {
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    Select: {
      defaultProps: {
        allowDeselect: false,
      },
    },
  },
});

export default customAppTheme;
