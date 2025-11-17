import {ActionIcon, Select, Switch} from '@mantine/core';
import {IconChevronDown} from '@tabler/icons-react';
import {TaskAssignee, ViewMode, useControlParams} from '@wms/core';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import {getViewModeOptions} from '../utils/ganttConfig';
import {DateNavigator} from './DateNavigator';
import { cn } from '@wms/core';

interface GanttFiltersProps {
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
  statuses: Array<{code: string; label: string}>;
  priorities: Array<{code: string; label: string}>;
  assignees: TaskAssignee[]; // Dynamic assignee list
  viewMode: ViewMode;
  isFlatView: boolean;
  showMountainChart: boolean;
  currentDateRange: {
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  };
  onFilterChange: (filterType: string, value: string | null) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  onViewTypeChange: (isFlatView: boolean) => void;
  onMountainChartToggle: (show: boolean) => void;
  onDateRangeChange: (start: dayjs.Dayjs, end: dayjs.Dayjs) => void;
  onResetToProject: () => void;
  onDateFilterChange: (from: string | null, to: string | null) => void;
  t: (key: string) => string;
  hideFilters: boolean;
}

export function GanttFilters({
  filters,
  statuses,
  priorities,
  assignees, // Use dynamic assignees
  viewMode,
  isFlatView,
  showMountainChart,
  currentDateRange,
  onFilterChange,
  onViewModeChange,
  onViewTypeChange,
  onMountainChartToggle,
  onDateRangeChange,
  onResetToProject,
  onDateFilterChange,
  t,
  hideFilters,
}: GanttFiltersProps) {
  const {replaceParams} = useControlParams();

  // Debug logging for viewMode (only when viewMode changes)
  useEffect(() => {
    console.log('GanttFilters viewMode changed:', {
      viewMode,
      viewModeOptions: getViewModeOptions(t),
    });
  }, [viewMode, t]);

  const createFilterHandler = (filterType: string) => (val: string | null) => {
    // Update URL parameters (same format as ListProjects)
    replaceParams({[filterType]: val});
    // Call the original handler
    onFilterChange(filterType, val);
  };

  return (
    <div className="wms-px-3 wms-py-2">
      {!hideFilters && (
        <div className="wms-grid wms-grid-cols-6 wms-gap-4">
          {/* Status */}
          <div className="wms-flex wms-flex-col wms-gap-1">
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('gantt.filters.status.placeholder')}
            </label>
            <Select
              size="xs"
              placeholder={t('gantt.filters.status.placeholder')}
              data={statuses.map(s => ({
                value: s.code,
                label: s.label,
              }))}
              value={filters.status}
              onChange={createFilterHandler('status')}
              clearable
              className="wms-bg-white wms-rounded wms-shadow-sm"
            />
          </div>

          {/* Assignee */}
          <div className="wms-flex wms-flex-col wms-gap-1">
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('gantt.filters.assignee.placeholder')}
            </label>
            <Select
              size="xs"
              placeholder={t('gantt.filters.assignee.placeholder')}
              data={assignees.map(assignee => ({
                value: assignee.id,
                label: assignee.name,
              }))}
              value={filters.assignee}
              onChange={createFilterHandler('assignee')}
              clearable
              className="wms-bg-white wms-rounded wms-shadow-sm"
            />
          </div>

          {/* Priority */}
          <div className="wms-flex wms-flex-col wms-gap-1">
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('gantt.filters.priority.placeholder')}
            </label>
            <Select
              size="xs"
              placeholder={t('gantt.filters.priority.placeholder')}
              data={priorities.map(p => ({
                value: p.code,
                label: p.label,
              }))}
              value={filters.priority}
              onChange={createFilterHandler('priority')}
              clearable
              className="wms-bg-white wms-rounded wms-shadow-sm"
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'wms-flex wms-items-center wms-justify-between',
          hideFilters ? 'wms-mt-0' : 'wms-mt-2',
        )}>
        <div className="wms-flex wms-items-center wms-gap-4">
          <div>
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('gantt.viewMode.placeholder')}
            </label>
            <Select
              size="xs"
              w={120}
              placeholder={t('gantt.viewMode.placeholder')}
              data={getViewModeOptions(t)}
              value={viewMode}
              onChange={val => {
                console.log('ViewMode onChange:', {
                  val,
                  currentViewMode: viewMode,
                });
                if (val) {
                  replaceParams({view: val});
                  onViewModeChange(val as ViewMode);
                }
              }}
              rightSection={
                <ActionIcon size="xs" variant="transparent" color="black">
                  <IconChevronDown />
                </ActionIcon>
              }
              className="wms-bg-white wms-rounded wms-shadow-sm"
            />
          </div>

          {/* Theme Configuration Button */}
          {/* <div>
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              Theme
            </label>
            <div>
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={onOpenThemeConfig}
                className="wms-border wms-border-gray-300 wms-rounded wms-shadow-sm">
                <IconSettings size={16} />
              </ActionIcon>
            </div>
          </div> */}

          {/* View Type Select */}
          <div className="wms-flex wms-flex-col wms-gap-1">
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('gantt.viewType.label')}
            </label>
            <Select
              size="xs"
              placeholder={t('gantt.viewType.placeholder')}
              data={[
                {value: 'tree', label: t('gantt.viewType.tree')},
                {value: 'flat', label: t('gantt.viewType.flat')},
              ]}
              value={isFlatView ? 'flat' : 'tree'}
              onChange={value => {
                replaceParams({flatView: value === 'flat' ? 'true' : 'false'});
                onViewTypeChange(value === 'flat');
              }}
              rightSection={
                <ActionIcon size="xs" variant="transparent" color="black">
                  <IconChevronDown />
                </ActionIcon>
              }
              className="wms-bg-white wms-rounded wms-shadow-sm"
            />
          </div>

          {/* Mountain Chart Toggle */}
          <div className="wms-flex wms-flex-col wms-gap-1">
            <label
              className="wms-text-xs wms-font-medium wms-text-gray-700"
              style={{
                fontFamily: 'var(--gantt-font-primary, sans-serif)',
              }}>
              {t('controls.showMountainChart')}
            </label>
            <Switch
              size="sm"
              checked={showMountainChart}
              onChange={e => {
                const newValue = e.currentTarget.checked;
                replaceParams({mountainChart: newValue ? 'true' : 'false'});
                onMountainChartToggle(newValue);
              }}
              styles={{
                track: {
                  cursor: 'pointer',
                },
              }}
            />
          </div>
        </div>

        {/* Date Navigator */}
        <DateNavigator
          startDate={currentDateRange.start}
          endDate={currentDateRange.end}
          viewMode={viewMode}
          onDateRangeChange={onDateRangeChange}
          onResetToProject={onResetToProject}
          onDateFilterChange={onDateFilterChange}
          t={t}
        />
      </div>
    </div>
  );
}
