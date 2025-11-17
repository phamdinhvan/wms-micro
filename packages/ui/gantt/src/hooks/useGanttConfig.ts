import {
  ApiTaskOption,
  CommonUtils,
  TaskPriority,
  TaskStatus,
} from '@wms/core';
import {useMemo} from 'react';
import {useProjectConfig} from './useGanttApi';

export function useGanttConfig(projectId: string | null, language: string) {
  const {statuses: statusesResponse, priorities: prioritiesResponse} =
    useProjectConfig(projectId!);

  const statuses = useMemo(
    () =>
      CommonUtils.mapTaskOptions(
        statusesResponse,
        language as keyof ApiTaskOption,
      ) as TaskStatus[],
    [statusesResponse, language],
  );

  const priorities = useMemo(
    () =>
      CommonUtils.mapTaskOptions(
        prioritiesResponse,
        language as keyof ApiTaskOption,
      ) as TaskPriority[],
    [prioritiesResponse, language],
  );

  return {statuses, priorities};
}
