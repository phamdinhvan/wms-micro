import {defaultGanttTheme, GanttThemeConfig} from '@wms/core';
import {useMemo} from 'react';

// Hook to generate CSS custom properties from theme config
export const useGanttTheme = (themeConfig?: GanttThemeConfig) => {
  const theme = useMemo(() => {
    // Merge user theme with default theme
    const mergedTheme: GanttThemeConfig = {
      colors: {...defaultGanttTheme.colors, ...themeConfig?.colors},
      spacing: {...defaultGanttTheme.spacing, ...themeConfig?.spacing},
      fonts: {
        ...defaultGanttTheme.fonts,
        ...themeConfig?.fonts,
        fontSize: {
          ...defaultGanttTheme.fonts?.fontSize,
          ...themeConfig?.fonts?.fontSize,
        },
        fontWeight: {
          ...defaultGanttTheme.fonts?.fontWeight,
          ...themeConfig?.fonts?.fontWeight,
        },
      },
      borders: {
        ...defaultGanttTheme.borders,
        ...themeConfig?.borders,
        radius: {
          ...defaultGanttTheme.borders?.radius,
          ...themeConfig?.borders?.radius,
        },
        width: {
          ...defaultGanttTheme.borders?.width,
          ...themeConfig?.borders?.width,
        },
      },
      shadows: {...defaultGanttTheme.shadows, ...themeConfig?.shadows},
      customVariables: {...themeConfig?.customVariables},
    };

    return mergedTheme;
  }, [themeConfig]);

  // Generate CSS custom properties
  const cssVariables = useMemo(() => {
    const variables: Record<string, string> = {};

    // Colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          variables[
            `--gantt-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
          ] = value;
        }
      });
    }

    // Spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (value) {
          variables[`--gantt-spacing-${key}`] = value;
        }
      });
    }

    // Fonts
    if (theme.fonts) {
      if (theme.fonts.fontFamily) {
        variables['--gantt-font-family'] = theme.fonts.fontFamily;
      }

      if (theme.fonts.fontSize) {
        Object.entries(theme.fonts.fontSize).forEach(([key, value]) => {
          if (value) {
            variables[`--gantt-font-size-${key}`] = value;
          }
        });
      }

      if (theme.fonts.fontWeight) {
        Object.entries(theme.fonts.fontWeight).forEach(([key, value]) => {
          if (value) {
            variables[`--gantt-font-weight-${key}`] = value;
          }
        });
      }
    }

    // Borders
    if (theme.borders) {
      if (theme.borders.radius) {
        Object.entries(theme.borders.radius).forEach(([key, value]) => {
          if (value) {
            variables[`--gantt-border-radius-${key}`] = value;
          }
        });
      }

      if (theme.borders.width) {
        Object.entries(theme.borders.width).forEach(([key, value]) => {
          if (value) {
            variables[`--gantt-border-width-${key}`] = value;
          }
        });
      }
    }

    // Shadows
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        if (value) {
          variables[`--gantt-shadow-${key}`] = value;
        }
      });
    }

    // Custom variables
    if (theme.customVariables) {
      Object.entries(theme.customVariables).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          variables[key.startsWith('--') ? key : `--${key}`] = value;
        }
      });
    }

    return variables;
  }, [theme]);

  // Convert to CSS style object
  const themeStyles = useMemo(() => {
    return cssVariables as React.CSSProperties;
  }, [cssVariables]);

  return {
    theme,
    cssVariables,
    themeStyles,
  };
};
