import {ProjectFormSchemaType, TaskFormSchemaType} from '@wms/core';

// Default task form values
export function getDefaultTaskValues(
  projectId: string,
  defaultValues?: Partial<TaskFormSchemaType>,
): TaskFormSchemaType {
  return {
    projectId: projectId || '',
    externalId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'new',
    priority: 'normal',
    level: 0,
    category: '',
    assignee: '',
    manager: '',
    parentId: '',
    progress: 0,
    tags: [],
    ...defaultValues,
  };
}

// Default project form values
export function getDefaultProjectValues(
  appId: string,
  defaultValues?: Partial<ProjectFormSchemaType>,
): ProjectFormSchemaType {
  return {
    appId: appId || '',
    externalId: '',
    name: '',
    description: '',
    code: '',
    startDate: '',
    endDate: '',
    status: 'active',
    priority: 'low',
    manager: '',
    owner: '',
    department: '',
    budget: 0,
    ...defaultValues,
  };
}

// Transform form data to API payload for tasks
export function transformTaskFormData(data: TaskFormSchemaType) {
  return {
    projectId: data.projectId,
    externalId: data.externalId || undefined,
    name: data.name,
    description: data.description || undefined,
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    status: data.status,
    priority: data.priority,
    level: data.level || 0,
    category: data.category || undefined,
    assignee: data.assignee || undefined,
    manager: data.manager || undefined,
    parentId: data.parentId || undefined,
    progress:
      typeof data.progress === 'number' && !Number.isNaN(data.progress)
        ? data.progress
        : 0,
    tags: data.tags || [],
  };
}

// Transform form data to API payload for projects
export function transformProjectFormData(data: ProjectFormSchemaType) {
  return {
    appId: data.appId,
    externalId: data.externalId || undefined,
    name: data.name,
    description: data.description || undefined,
    code: data.code || undefined,
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    status: data.status,
    priority: data.priority,
    manager: data.manager || undefined,
    owner: data.owner || undefined,
    department: data.department || undefined,
    budget:
      typeof data.budget === 'number' && !Number.isNaN(data.budget)
        ? data.budget
        : 0,
  };
}

// Common form options
export function getStatusOptions(t: (key: string) => string) {
  return [
    {value: 'new', label: t('common.status.new')},
    {value: 'in_progress', label: t('common.status.in_progress')},
    {value: 'completed', label: t('common.status.completed')},
    {value: 'cancelled', label: t('common.status.cancelled')},
    {value: 'on_hold', label: t('common.status.on_hold')},
  ];
}

export function getPriorityOptions(t: (key: string) => string) {
  return [
    {value: 'low', label: t('common.priority.low')},
    {value: 'normal', label: t('common.priority.normal')},
    {value: 'high', label: t('common.priority.high')},
    {value: 'urgent', label: t('common.priority.urgent')},
  ];
}

export function getTypeOptions(t: (key: string) => string) {
  return [
    {value: 'task', label: t('common.type.task')},
    {value: 'milestone', label: t('common.type.milestone')},
    {value: 'project', label: t('common.type.project')},
  ];
}
