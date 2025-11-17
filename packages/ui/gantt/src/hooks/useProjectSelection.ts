import {useEffect, useMemo} from 'react';
import {TProject} from '@wms/core';

interface UseProjectSelectionProps {
  pProjectId: string | null;
  projectId?: string | null;
  projects?: TProject[];
  replaceParams: (params: Record<string, string | undefined>) => void;
}

export function useProjectSelection({
  pProjectId,
  projectId,
  projects,
  replaceParams,
}: UseProjectSelectionProps) {
  // Get projectId from localStorage
  const getProjectIdFromStorage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedProjectId');
    }
    return null;
  };

  // Priority: 1. URL param (pProjectId), 2. prop (projectId), 3. localStorage
  const candidateProjectId =
    pProjectId || projectId || getProjectIdFromStorage();

  // Check if candidateProjectId exists in projects list
  const isValidProjectId =
    candidateProjectId && projects?.some(p => p.id === candidateProjectId);

  // If projectId is invalid (not in projects list), clear it
  const currentProjectId = isValidProjectId ? candidateProjectId : null;

  // Find current project
  const currentProject = useMemo(
    () => projects?.find(p => p.id === currentProjectId),
    [projects, currentProjectId],
  );

  // Clean up invalid projectId from URL and localStorage
  useEffect(() => {
    if (
      candidateProjectId &&
      !isValidProjectId &&
      projects &&
      projects.length > 0
    ) {
      // Remove invalid projectId from URL
      if (pProjectId) {
        replaceParams({projectId: undefined});
      }
      // Remove invalid projectId from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedProjectId');
      }
    }
  }, [candidateProjectId, isValidProjectId, projects, pProjectId, replaceParams]);

  // Update URL parameter when projectId changes from localStorage or prop (and is valid)
  useEffect(() => {
    if (currentProjectId && !pProjectId && isValidProjectId) {
      replaceParams({projectId: currentProjectId});
    }
  }, [currentProjectId, pProjectId, replaceParams, isValidProjectId]);

  return {
    currentProjectId,
    currentProject,
    isValidProjectId,
  };
}
