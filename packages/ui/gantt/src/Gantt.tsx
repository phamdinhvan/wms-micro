'use client';
import {
  EnhancedExternalFieldsConfig,
  ExternalFieldsAPIProvider,
  ExternalFieldsConfigProvider,
  GanttEventCallbacks,
  GanttThemeConfig,
  TUser,
  TaskAssignee,
  appConfig,
  useGetUsers,
} from '@wms/core';
import {useEffect, useMemo, useState} from 'react';
import {GanttBusEvents, GanttEmitter} from './bus';
import GanttChart from './components/GanttChart';
import {useGetProjects} from './hooks/useGanttApi';
import {useGanttThemeProvider} from './hooks/useGanttThemeProvider';
import {useProjectIdTracking} from './hooks/useProjectIdTracking';
import './styles/gantt.css';
import './styles/theme-variables.css';

export type GanttProps = {
  locale?: 'en' | 'vi' | 'ja';
  customTexts?: Record<string, string>;
  assignees?: TaskAssignee[]; // Optional external assignee list
  contextKey?: string; // Context key for fetching users
  appId?: string; // Application ID for filtering projects
  code?: string; // Application code for filtering projects
  taskFieldsConfig?: EnhancedExternalFieldsConfig; // External fields configuration for tasks

  /** React-style callbacks */
  eventCallbacks?: GanttEventCallbacks;

  /** Decoupled bus */
  bus?: GanttEmitter<GanttBusEvents>;
};
export function Gantt({
  assignees,
  bus,
  customTexts,
  eventCallbacks,
  locale = 'en',
  contextKey,
  appId,
  code,
  taskFieldsConfig,
}: GanttProps) {
  // Initialize appConfig if appId or code is provided
  useEffect(() => {
    if (appId || code) {
      appConfig.initialize({
        appId,
        code,
        lang: locale,
      });
    }
  }, [appId, code, locale]);

  const [previewTheme, setPreviewTheme] = useState<GanttThemeConfig | null>(
    null,
  );
  const actualProjectId = useProjectIdTracking();
  const {data: projectsData, isLoading: isProjectsLoading} = useGetProjects({
    pageSize: 500,
    contextKey,
  });
  const projects = useMemo(
    () => projectsData?.data?.items ?? [],
    [projectsData?.data],
  );

  // Fetch users from API with contextKey
  const {data: usersData} = useGetUsers({
    contextKey,
    enabled: true,
  });

  // Transform API users to TaskAssignee format
  const apiAssignees = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data.map((user: TUser) => ({
      id: user.id,
      name: user.name,
    }));
  }, [usersData?.data]);

  const [validatedProjectId, setValidatedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isProjectsLoading) return; // Wait for projects to load

    if (!actualProjectId) {
      setValidatedProjectId(null);
      return;
    }

    if (projects.length > 0) {
      const isValidProject = projects.some(p => p.id === actualProjectId);
      if (isValidProject) {
        setValidatedProjectId(actualProjectId);
      } else {
        console.warn(
          `Project ID ${actualProjectId} not found in available projects. Clearing localStorage.`,
        );
        setValidatedProjectId(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedProjectId');
        }
      }
    }
  }, [actualProjectId, projects, isProjectsLoading]);

  const {
    finalTheme,
    baseColors,
    cssVariables,
    shouldShowLoading,
    refetchTheme,
  } = useGanttThemeProvider({
    projectId: validatedProjectId!,
    previewTheme,
  });

  // Use enhanced config with defaults
  const enhancedConfig: EnhancedExternalFieldsConfig = taskFieldsConfig || {
    fields: {},
    sourceDataMap: {},
  };

  return (
    <ExternalFieldsConfigProvider taskFieldsConfig={enhancedConfig.fields}>
      <ExternalFieldsAPIProvider config={enhancedConfig}>
        <GanttChart
          projectId={validatedProjectId}
          projects={projects}
          isProjectsLoading={isProjectsLoading}
          eventCallbacks={eventCallbacks}
          bus={bus}
          assignees={assignees || apiAssignees}
          className="gantt-chart-root"
        />
      </ExternalFieldsAPIProvider>
    </ExternalFieldsConfigProvider>
  );
}
