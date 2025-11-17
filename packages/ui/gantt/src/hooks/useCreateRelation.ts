import {useAppMutation} from '@wms/core';

export interface CreateRelationPayload {
  projectId?: string;
  sourceTaskId: string;
  targetTaskId: string;
  relationType: 'SS' | 'FS' | 'SF' | 'FF';
  delayDays?: number;
}

export const useCreateRelation = () => {
  return useAppMutation('ganttCreateRelation');
};
