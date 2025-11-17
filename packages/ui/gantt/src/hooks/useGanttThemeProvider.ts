import {defaultGanttTheme, GanttThemeConfig} from '@wms/core';
import {useMemo} from 'react';
import {useGetTheme} from './useThemeApi';

interface UseGanttThemeProviderProps {
  theme?: GanttThemeConfig;
  projectId?: string;
  previewTheme?: GanttThemeConfig | null;
}

// Helper function to sanitize color values
function sanitizeColors(colors: any): any {
  if (!colors || typeof colors !== 'object') return {};

  const sanitized: any = {};

  Object.entries(colors).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // For color arrays (like primary: ['#fff', '#000', ...])
      const sanitizedArray = value.filter(
        color => color && typeof color === 'string' && color.trim() !== '',
      );
      if (sanitizedArray.length > 0) {
        sanitized[key] = sanitizedArray;
      }
    } else if (value && typeof value === 'string' && value.trim() !== '') {
      // For single color values
      sanitized[key] = value;
    }
  });

  return sanitized;
}

export function useGanttThemeProvider({
  theme,
  projectId,
  previewTheme,
}: UseGanttThemeProviderProps) {
  // Fetch theme from API whenever projectId changes
  const {
    data: apiThemeResponse,
    isLoading: isThemeLoading,
    refetch: refetchTheme,
  } = useGetTheme({
    projectId: projectId || '',
    options: {
      enabled: !!projectId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  });

  // Determine if we should show loading state
  const shouldShowLoading = !!projectId && isThemeLoading && !apiThemeResponse;

  // Use preview theme, provided theme, API theme, or default theme (in priority order)
  const finalTheme = useMemo(() => {
    if (previewTheme) return previewTheme; // Preview theme takes highest priority
    if (theme) return theme; // Use provided theme if available
    if (apiThemeResponse?.data) return apiThemeResponse.data; // Use API theme when available
    return defaultGanttTheme; // Fallback to default (used when no project ID or loading failed)
  }, [previewTheme, theme, apiThemeResponse?.data]);

  // Generate base colors for Mantine theme
  const baseColors = useMemo(() => {
    const defaultColors = sanitizeColors(defaultGanttTheme.mantine?.colors);
    const themeColors = sanitizeColors(finalTheme.mantine?.colors);

    return {
      ...defaultColors,
      ...themeColors,
    };
  }, [finalTheme.mantine?.colors]);

  // Generate CSS variables for theme application
  const cssVariables = useMemo(() => {
    const vars: Record<string, string> = {};

    // Apply Tailwind custom colors as CSS variables
    if (finalTheme.tailwind?.customColors) {
      Object.entries(finalTheme.tailwind.customColors).forEach(
        ([key, value]) => {
          vars[`--gantt-${key}`] =
            typeof value === 'string' ? value : String(value);
        },
      );
    }

    // Apply font families as CSS variables
    if (finalTheme.mantine?.fontFamilies) {
      const {primary, numeric, mono} = finalTheme.mantine.fontFamilies;
      if (primary) vars['--gantt-font-primary'] = primary;
      if (numeric) vars['--gantt-font-numeric'] = numeric;
      if (mono) vars['--gantt-font-mono'] = mono;
    }

    return vars;
  }, [finalTheme.tailwind?.customColors, finalTheme.mantine?.fontFamilies]);

  return {
    finalTheme,
    baseColors,
    cssVariables,
    shouldShowLoading,
    isThemeLoading,
    refetchTheme,
  };
}
