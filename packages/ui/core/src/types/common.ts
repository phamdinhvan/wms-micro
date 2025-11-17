import {ExternalFieldsData} from './externalFields';
import {RelationTask} from './task';

export type TaskStatusCode = 'new' | 'in_progress' | 'completed' | 'cancelled';

export type TaskStatus = {
  code: TaskStatusCode;
  label: string;
  color: string;
};

export type TaskPriorityCode = 'low' | 'normal' | 'high' | 'urgent';

export type TaskPriority = {
  code: TaskPriorityCode;
  label: string;
  color: string;
};

// Custom Field Types
export type CustomFieldType = {
  id: string;
  name: string;
  displayName: string;
  typeConfig?: {
    max?: number;
    min?: number;
    options?: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomField = {
  typeId: string;
  name: string;
  key: string;
  description?: string;
  value: any;
  orderIndex: number;
  isRequired: boolean;
};

export type CustomFieldValue = {
  fieldId: string;
  value: any;
};

export type TaskAssignee = {
  name: string;
  iconUrl?: string | null;
  boardUser?: {
    timeZone: string | null;
  };
  id: string;
};

export interface Task {
  id: string;
  sortOrder?: number;
  projectId: string;
  projectKey: string;
  projectName: string;
  projectIcon: string | null;
  parentId: string | null;
  key: string;
  name: string;
  workDays: number;
  status: TaskStatus;
  assignee: {email?: string; id: string} | null;
  reporter: any | null;
  progress: number;
  priority: TaskPriority;
  timeTracking: {
    originalEstimate: string;
    remainingEstimate: string;
    timeSpent: string;
  };
  description: string;
  created: string; // ISO8601 format
  updated: string; // ISO8601 format
  resolution: string | null;
  startDate: string; // ISO8601 format
  endDate: string; // ISO8601 format
  externalFields?: ExternalFieldsData;
}

export type TaskResponse = {
  status: TaskStatusCode;
  progress: number;
  priority: TaskPriorityCode;
  level: number;
  createdAt: string; // ISO8601 format
  updatedAt: string; // ISO8601 format
  id: string;
  projectId: string;
  externalId: string | null;
  name: string;
  description: string;
  notes?: string;
  startDate: string; // ISO8601 format
  endDate: string; // ISO8601 format
  category: string | null;
  assignee: string | null;
  manager: string | null;
  parentId: string | null;
  tags: string[];
  lastSyncedAt: string | null; // ISO8601 format
  externalUpdatedAt: string | null; // ISO8601 format
  syncVersion: string;
  // New fields for modern task structure
  attributes?: {
    status: TaskStatusCode;
    priority: TaskPriorityCode;
    assignee?: string;
  };
  customFields?: CustomField[];
  externalFields?: ExternalFieldsData;
  relations?: RelationTask[];
};


export type TaskConfig = {
  fields?: {
    tags?: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      maxItems: number;
      required: boolean;
    };
    status?: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      default: string;
      options: {
        [key: string]: {
          en?: string;
          ja?: string;
          vi?: string;
          icon: string;
          color: string;
        };
      };
      required: boolean;
    };
    dueDate?: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      required: boolean;
      allowPast: boolean;
    };
    assignee: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      required: boolean;
      multiSelect: false;
    };
    priority?: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      default: string;
      options: {
        [key: string]: {
          en: string;
          ja: string;
          icon: string;
          color: string;
        };
      };
    };
    attachments?: {
      type: string;
      label: {
        en: string;
        ja: string;
      };
      required: boolean;
      maxSizeMB: number;
      allowedTypes: string[];
    };
  };
  version: 1;
  features?: {
    subtask: {
      label: {
        en: string;
        ja: string;
      };
      enabled: boolean;
      maxDepth: number;
    };
    comments?: {
      label: {
        en: string;
        ja: string;
      };
      enabled: boolean;
      maxLength: number;
    };
    activityLog?: {
      label: {
        en: string;
        ja: string;
      };
      enabled: boolean;
    };
    notifications?: {
      label: {
        en: string;
        ja: string;
      };
      enabled: boolean;
      channels: string[];
    };
  };
  displayOrder?: string[];
  systemFields?: string[];
  validationRules?: {
    mutualExclusion?: [
      {
        rule: string;
        fields: string[];
      },
    ];
    conditionalRequired?: [
      {
        rule: string;
        fields: string[];
      },
    ];
  };
};

export type ApiTaskOption = {
  en?: string;
  ja?: string;
  vi?: string;
  icon: string;
  color: string;
};
export type ApiTaskOptionsResponse = Record<string, ApiTaskOption>;

export type ListResponse<T> = {
  data: {
    items: T[];
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type ItemResponse<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

export type TProjectListResponse = ListResponse<TProject>;

export type TProject = {
  status: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  appId: string;
  externalId?: string;
  name: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  }; // Full user object from /external/users API
  description: string;
  key: string;
  contextKey?: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  attributes?: any;
  collaborators?: {id: string; name?: string; email?: string}[];
};

export type Assignee = string;

// Event system types for external integration
export interface TaskEventData {
  task: TaskResponse;
  eventType: 'created' | 'updated' | 'deleted';
  timestamp: string;
  changes?: Partial<TaskResponse>; // For updates, what fields changed
}

export interface ExternalLinkRequest {
  taskId: string;
  externalId: string;
  externalType?: string; // e.g., 'issue', 'requirement', 'feature'
  externalData?: Record<string, any>; // Additional metadata
}

export type ViewMode = 'days' | 'weeks' | 'months';
