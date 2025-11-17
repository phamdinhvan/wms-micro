"use client";

import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  GanttThemeApiResponse,
  GanttThemeConfig,
  defaultGanttTheme,
} from "../types/theme";
import { useAppMutation } from "./useAppMutation";
import { AppQueryOptions, useAppQuery } from "./useAppQuery";

type GetThemeParams = {
  projectId: string;
  options?: AppQueryOptions<"ganttGetTheme">;
};

// Hook to get theme configuration for a project
export const useGetTheme = (params: GetThemeParams) => {
  const { projectId, options = {} } = params;

  const queryRes = useAppQuery({
    key: "ganttGetTheme",
    url: {
      baseUrl: "/gantt/:projectId/theme",
      urlParams: { projectId },
    },
    options: {
      enabled: options.enabled !== undefined ? options.enabled : !!projectId,
      ...options,
      queryKey: "ganttGetTheme", // Explicitly set queryKey
      select: (data: GanttThemeApiResponse) => {
        // Merge API response with default theme values
        const apiData = data.data;
        return {
          ...data,
          data: mergeWithDefaults(apiData),
        };
      },
    },
  });
  return queryRes;
};

// Hook to update theme configuration
export const useUpdateTheme = (projectId: string) => {
  const { t } = useTranslation("gantt");
  const { mutateAsync, isPending } = useAppMutation("ganttUpdateTheme");
  const queryClient = useQueryClient();

  const onUpdateTheme = useCallback(
    async (
      data: GanttThemeConfig,
      onSuccess?: (res: GanttThemeApiResponse) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await mutateAsync({
          url: {
            baseUrl: "/gantt/:projectId/theme",
            urlParams: { projectId },
          },
          method: "put",
          payload: data,
        });

        onSuccess?.(res);
        notifications.show({
          message: t("theme.notification.update", "Theme updated successfully"),
          color: "green",
        });

        // Force refetch theme queries for this specific project
        await queryClient.refetchQueries({
          predicate: (q) =>
            q.queryKey &&
            q.queryKey.length >= 2 &&
            typeof q.queryKey[0] === "string" &&
            q.queryKey[0].includes(`/gantt/${projectId}/theme`) &&
            q.queryKey[1] === "ganttGetTheme",
        });
      } catch (error) {
        onError?.(error);
        notifications.show({
          message: t("theme.notification.error", "Failed to update theme"),
          color: "red",
        });
      }
    },
    [mutateAsync, queryClient, t, projectId],
  );

  return { onUpdateTheme, isUpdating: isPending };
};

// Helper function to merge API response with default values
function mergeWithDefaults(apiData: GanttThemeConfig): GanttThemeConfig {
  const merged: GanttThemeConfig = {
    theme: apiData.theme || defaultGanttTheme.theme,
    primaryColor: apiData.primaryColor || defaultGanttTheme.primaryColor,
    secondaryColor: apiData.secondaryColor || defaultGanttTheme.secondaryColor,
    mantine: {
      primaryColor:
        apiData.mantine?.primaryColor ||
        defaultGanttTheme.mantine?.primaryColor,
      fontFamily:
        apiData.mantine?.fontFamily || defaultGanttTheme.mantine?.fontFamily,
      defaultRadius:
        apiData.mantine?.defaultRadius ||
        defaultGanttTheme.mantine?.defaultRadius,
      colors: {
        ...defaultGanttTheme.mantine?.colors,
        ...apiData.mantine?.colors,
      },
    },
    tailwind: {
      primaryColor:
        apiData.tailwind?.primaryColor ||
        defaultGanttTheme.tailwind?.primaryColor,
      fontFamily:
        apiData.tailwind?.fontFamily || defaultGanttTheme.tailwind?.fontFamily,
      customColors: {
        ...defaultGanttTheme.tailwind?.customColors,
        ...apiData.tailwind?.customColors,
      },
      fontFamilies: {
        ...defaultGanttTheme.tailwind?.fontFamilies,
        ...apiData.tailwind?.fontFamilies,
      },
    },
    customVariables: {
      ...defaultGanttTheme.customVariables,
      ...apiData.customVariables,
    },
    displayFeatures:
      apiData.displayFeatures || defaultGanttTheme.displayFeatures,
    customColors: apiData.customColors,
    templateTheme: apiData.templateTheme,
    // Merge other properties
    colors: apiData.colors,
    spacing: apiData.spacing,
    fonts: apiData.fonts,
    borders: apiData.borders,
    shadows: apiData.shadows,
  };

  return merged;
}
