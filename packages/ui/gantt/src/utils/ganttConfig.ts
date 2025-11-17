// Removed DEFAULT_ASSIGNEE_OPTIONS - now using dynamic assignees from useGetUsers API

// Status options for dropdowns
export const getStatusOptions = (t: (key: string) => string) => [
  {value: 'new', label: t('common.status.new')},
  {value: 'in_progress', label: t('common.status.in_progress')},
  {value: 'completed', label: t('common.status.completed')},
  {value: 'cancelled', label: t('common.status.cancelled')},
  {value: 'on_hold', label: t('common.status.on_hold')},
];

// Filter options
export const getFilterOptions = (t: (key: string) => string) => ({
  type: [
    {value: 'task', label: t('gantt.filters.type.task')},
    {value: 'milestone', label: t('gantt.filters.type.milestone')},
    {value: 'project', label: t('gantt.filters.type.project')},
  ],
  status: [
    {value: 'new', label: t('gantt.filters.status.new')},
    {value: 'in_progress', label: t('gantt.filters.status.inProgress')},
    {value: 'completed', label: t('gantt.filters.status.completed')},
    {value: 'cancelled', label: t('gantt.filters.status.cancelled')},
    {value: 'on_hold', label: t('gantt.filters.status.onHold')},
  ],
  priority: [
    {value: 'low', label: t('gantt.filters.priority.low')},
    {value: 'normal', label: t('gantt.filters.priority.normal')},
    {value: 'high', label: t('gantt.filters.priority.high')},
    {value: 'urgent', label: t('gantt.filters.priority.urgent')},
  ],
});

// View mode options
export const getViewModeOptions = (t: (key: string) => string) => [
  {value: 'days', label: t('gantt.viewMode.days')},
  {value: 'weeks', label: t('gantt.viewMode.weeks')},
  {value: 'months', label: t('gantt.viewMode.months')},
];

// UI Constants
export const UI_CONSTANTS = {
  SCROLLBAR_HEIGHT: 18,
  DRAG_THRESHOLD_PX: 3,
  MIN_TREE_WIDTH: 300,
  MAX_TREE_WIDTH: 600,
  DEFAULT_TREE_WIDTH: 350,
} as const;
