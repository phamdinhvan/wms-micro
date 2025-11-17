// Theme configuration types for Gantt library
export type MantineColorTuple = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface FontFamilyConfig {
  /** Primary font family for general text, headings, and UI elements */
  primary?: string;
  /** Numeric font family for numbers, dates, and numeric data */
  numeric?: string;
  /** Monospace font family for code, IDs, and fixed-width text */
  mono?: string;
}

export interface MantineThemeConfig {
  /** Primary color for Mantine components */
  primaryColor?: string;
  /** Default radius for Mantine components */
  defaultRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Font families configuration */
  fontFamilies?: FontFamilyConfig;
  /** Colors configuration */
  colors?: Record<string, MantineColorTuple | string>;
  /** Font family (legacy support) */
  fontFamily?: string;
}

export interface TailwindThemeConfig {
  /** Primary color for Tailwind classes */
  primaryColor?: string;
  /** Custom color palette */
  customColors?: Record<string, string | Record<string, string>>;
  /** Font family */
  fontFamily?: string;
  /** Font families configuration */
  fontFamilies?: FontFamilyConfig;
}

export interface GanttThemeColors {
  // Primary colors
  primary?: string;
  primaryHover?: string;
  primaryLight?: string;
  primaryDark?: string;

  // Secondary colors
  secondary?: string;
  secondaryHover?: string;

  // Status colors
  statusNew?: string;
  statusInProgress?: string;
  statusCompleted?: string;
  statusCancelled?: string;
  statusOnHold?: string;

  // Priority colors
  priorityLow?: string;
  priorityNormal?: string;
  priorityHigh?: string;
  priorityUrgent?: string;

  // UI colors
  background?: string;
  surface?: string;
  border?: string;
  borderLight?: string;
  text?: string;
  textSecondary?: string;
  textMuted?: string;

  // Interactive colors
  hover?: string;
  selected?: string;
  focus?: string;

  // Task bar colors
  taskBar?: string;
  taskBarHover?: string;
  taskBarSelected?: string;
  taskBarProgress?: string;

  // Timeline colors
  timelineHeader?: string;
  timelineGrid?: string;
  timelineWeekend?: string;
  timelineToday?: string;
}

export interface GanttThemeSpacing {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}

export interface GanttThemeFonts {
  fontFamily?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  fontWeight?: {
    normal?: string;
    medium?: string;
    semibold?: string;
    bold?: string;
  };
}

export interface GanttThemeBorders {
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  width?: {
    thin?: string;
    normal?: string;
    thick?: string;
  };
}

export interface GanttThemeShadows {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

export interface GanttThemeConfig {
  /** Theme mode */
  theme?: 'light' | 'dark';
  /** Mantine theme configuration */
  mantine?: MantineThemeConfig;
  /** Tailwind theme configuration */
  tailwind?: TailwindThemeConfig;
  /** Legacy color configuration */
  colors?: GanttThemeColors;
  spacing?: GanttThemeSpacing;
  fonts?: GanttThemeFonts;
  borders?: GanttThemeBorders;
  shadows?: GanttThemeShadows;
  /** Custom CSS variables */
  customVariables?: Record<string, string>;
  /** Custom colors (legacy) */
  customColors?: Record<string, string> | null;
  /** Primary color */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Template theme configuration */
  templateTheme?: any | null;
  /** Display features configuration */
  displayFeatures?: {
    showProgress?: boolean;
    compactMode?: boolean;
    showDependencies?: boolean;
    dateFormat?: string;
    timezone?: string;
  } | null;
}

// Default theme configuration
export const defaultGanttTheme: GanttThemeConfig = {
  theme: 'light',
  primaryColor: '#3F51B5',
  secondaryColor: '#dc004e',
  mantine: {
    primaryColor: 'primary',
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
    },
    fontFamily: 'sans-serif',
    defaultRadius: 'md',
  },
  tailwind: {
    primaryColor: '#FF9800',
    fontFamily: 'sans-serif',
    customColors: {
      borderTimeline: '#E5E7EB',
      borderTimelineMonthEnd: '#9CA3AF',
    },
    fontFamilies: {
      primary: 'Inter',
      numeric: 'Inter',
      mono: 'Inter',
    },
  },
  customVariables: {
    focus: '#FF9800',
    selected: '#FFF3E0',
  },
  customColors: null,
  templateTheme: null,
  displayFeatures: {
    showProgress: true,
    compactMode: false,
    showDependencies: true,
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Ho_Chi_Minh',
  },
};

// API Response type for theme endpoints
export interface GanttThemeApiResponse {
  success: boolean;
  statusCode: number;
  data: GanttThemeConfig;
  message: string;
  timestamp: string;
  path: string;
}
