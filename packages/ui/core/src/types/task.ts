import {ExternalFieldsData} from './externalFields';

export type TaskDetail = {
  id: string;
  projectId: string;
  externalId: string | null;
  name: string;
  description: string;
  notes: string | null;
  key: string;
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  attributes: {
    tags: [];
    status: string;
    assignee: {
      id: string;
      name?: string;
      email?: string;
    } | null;
    parentId: string;
    priority: string;
    taskDepth: number;
    parentChain: string;
  };
  customFields: [
    {
      createdAt: string;
      updatedAt: string;
      id: string;
      typeId: string;
      name: string;
      key: string;
      description: string;
      value: string;
      entityId: string;
      orderIndex: number;
      isRequired: boolean;
      type: {
        createdAt: string;
        updatedAt: string;
        id: string;
        name: string;
        displayName: string;
        typeConfig: any;
      };
    },
  ];
  externalFields?: ExternalFieldsData;
  relations: RelationTask[];
};

export type RelationTask = {
  id: string;
  sourceTask: {
    id: string;
    name: string;
  };
  targetTask: {
    id: string;
    name: string;
  };
  relationType?: 'SS' | 'FS' | 'SF' | 'FF';
  delayDays?: number;
};

// Form type for creating/editing relations
export type RelationFormData = {
  targetTaskId: string;
  relationType: 'SS' | 'FS' | 'SF' | 'FF';
  delayDays?: number;
};
