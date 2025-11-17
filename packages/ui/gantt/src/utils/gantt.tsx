// File: src-wms-lib/utils/ganttUtils.ts
import {TaskResponse, ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import {JSX} from 'react';
import {rowHeight} from '../constants/gantt';

// Type alias for enriched TaskResponse with UI fields (flat structure)
type Task = TaskResponse & {
  duration: number;
  localId: number;
};

export const renderVerticalGrid = (
  viewMode: ViewMode,
  visibleTaskCount: number,
  dayWidth: number,
  projectStart: dayjs.Dayjs,
  projectEnd: dayjs.Dayjs,
) => {
  const totalHeight = visibleTaskCount * rowHeight;
  const cols: JSX.Element[] = [];
  const totalDays = projectEnd.diff(projectStart, 'day') + 1;

  for (let d = 0; d < totalDays; d++) {
    const date = projectStart.add(d, 'day');
    const isWeekend = date.day() === 0 || date.day() === 6;
    const isToday = date.isSame(dayjs(), 'day');
    const isEndOfMonth = date.date() === date.daysInMonth();

    if (viewMode === 'days') {
      cols.push(
        <div
          key={`col-${d}`}
          className={`wms-absolute wms-top-0 wms-border-r ${
            isEndOfMonth
              ? 'wms-border-[var(--gantt-borderTimelineMonthEnd,#9CA3AF)]'
              : 'wms-border-[var(--gantt-borderTimeline,#E5E7EB)]'
          }`}
          style={{
            left: d * dayWidth,
            width: dayWidth,
            height: totalHeight,
            // Match header colors but lighter: #F6F6F6 -> #FAFAFA, #f3f3f3 -> #F8F8F8
            background: isWeekend ? '#F0F0F0' : '#FAFAFA', // Lighter version of header #F6F6F6
            backgroundColor: isToday ? '#FDF6F0' : isWeekend ? '#f9f9f9' : '', // Lighter version of #f5e8dc
          }}
        />,
      );
    }

    if (viewMode === 'weeks') {
      cols.push(
        <div
          key={`col-${d}`}
          className="wms-absolute wms-top-0"
          style={{
            left: d * dayWidth,
            width: dayWidth,
            height: totalHeight,
            background: '#FAFAFA', // Match lighter header color
            borderRight: date.day() === 6 ? '1px solid #E1E2E5' : '',
          }}
        />,
      );
    }

    if (viewMode === 'months') {
      cols.push(
        <div
          key={`col-${d}`}
          className="wms-absolute wms-top-0"
          style={{
            left: d * dayWidth,
            width: dayWidth,
            height: totalHeight,
            background: '#FAFAFA', // Match lighter header color
            borderRight:
              date.date() === date.daysInMonth() ? '2px solid #9CA3AF' : '', // Bold border at end of month
          }}
        />,
      );
    }
  }

  return cols;
};

// Render vertical grid for mountain chart
export const renderMountainVerticalGrid = (
  viewMode: ViewMode,
  chartHeight: number,
  dayWidth: number,
  projectStart: dayjs.Dayjs,
  totalDays: number,
  keyPrefix: string = 'mgrid',
) => {
  const cols: JSX.Element[] = [];

  if (totalDays > 0) {
    for (let d = 0; d < totalDays; d++) {
      const date = projectStart.add(d, 'day');
      const isWeekend = date.day() === 0 || date.day() === 6;
      const isToday = date.isSame(dayjs(), 'day');
      const isEndOfMonth = date.date() === date.daysInMonth();

      if (viewMode === 'days') {
        cols.push(
          <div
            key={`${keyPrefix}-${d}`}
            className={`wms-absolute wms-top-0 wms-border-r wms-pointer-events-none ${isEndOfMonth
                ? 'wms-border-[var(--gantt-borderTimelineMonthEnd,#9CA3AF)]'
                : 'wms-border-[var(--gantt-borderTimeline,#E5E7EB)]'
              }`}
            style={{
              left: d * dayWidth,
              width: dayWidth,
              height: chartHeight,
              background: isWeekend ? '#F0F0F0' : '#FAFAFA',
              backgroundColor: isToday ? '#FDF6F0' : isWeekend ? '#f9f9f9' : 'transparent',
            }}
          />,
        );
      }

      if (viewMode === 'weeks') {
        cols.push(
          <div
            key={`${keyPrefix}-${d}`}
            className="wms-absolute wms-top-0 wms-pointer-events-none"
            style={{
              left: d * dayWidth,
              width: dayWidth,
              height: chartHeight,
              borderRight: date.day() === 6 ? '1px solid #E1E2E5' : '',
            }}
          />,
        );
      }

      if (viewMode === 'months') {
        cols.push(
          <div
            key={`${keyPrefix}-${d}`}
            className="wms-absolute wms-top-0 wms-pointer-events-none"
            style={{
              left: d * dayWidth,
              width: dayWidth,
              height: chartHeight,
              borderRight:
                date.date() === date.daysInMonth() ? '2px solid #9CA3AF' : '',
            }}
          />,
        );
      }
    }
  }

  return cols;
};

export const renderGridBackground = (
  taskCount: number,
  totalDays: number,
  dayWidth: number,
): JSX.Element[] =>
  Array.from({length: taskCount}, (_, i) => (
    <div
      key={`row-${i}`}
      className="wms-absolute wms-left-0 wms-border-b wms-border-[var(--gantt-borderTimeline,#E5E7EB)]"
      style={{
        top: i * rowHeight,
        width: totalDays * dayWidth,
        height: rowHeight,
      }}
    />
  ));

// Note: recalcParentDates removed - use updateParentDates for flat structure

export const updateTaskDate = (
  tasks: Task[],
  drag: {
    id: string;
    initDate: string;
    initDuration: number;
    type: 'move' | 'resize-left' | 'resize-right';
  } | null,
  deltaDays: number,
  clamp: (d: dayjs.Dayjs) => dayjs.Dayjs,
  projectEnd: dayjs.Dayjs,
): Task[] => {
  if (!drag) return tasks;

  const updateRecursive = (task: Task): Task => {
    let updatedTask = task;

    if (task.id === drag.id) {
      if (drag.type === 'move') {
        const newStart = clamp(dayjs(drag.initDate).add(deltaDays, 'day'));
        const newEnd = newStart.add(drag.initDuration - 1, 'day');
        updatedTask = {
          ...task,
          startDate: newStart.format('YYYY-MM-DD'),
          endDate: newEnd.format('YYYY-MM-DD'),
          duration: drag.initDuration,
        };
      }
      if (drag.type === 'resize-left') {
        let newStart = clamp(dayjs(drag.initDate).add(deltaDays, 'day'));
        let newDuration = drag.initDuration - deltaDays;
        if (newDuration < 1) {
          newDuration = 1;
          newStart = dayjs(task.endDate).subtract(newDuration - 1, 'day');
        }
        const newEndDate = newStart.add(newDuration - 1, 'day');
        updatedTask = {
          ...task,
          startDate: newStart.format('YYYY-MM-DD'),
          endDate: newEndDate.format('YYYY-MM-DD'),
          duration: newDuration,
        };
      }
      if (drag.type === 'resize-right') {
        let newDuration = drag.initDuration + deltaDays;
        if (newDuration < 1) newDuration = 1;
        const endDate = dayjs(task.startDate).add(newDuration - 1, 'day');
        if (endDate.isAfter(projectEnd)) {
          newDuration = projectEnd.diff(dayjs(task.startDate), 'day') + 1;
        }
        const finalEndDate = dayjs(task.startDate).add(newDuration - 1, 'day');
        updatedTask = {
          ...task,
          endDate: finalEndDate.format('YYYY-MM-DD'),
          duration: newDuration,
        };
      }
    }

    return updatedTask;
  };

  return tasks.map(updateRecursive);
};

export const updateParentDates = (tasks: Task[]): Task[] => {
  // For flat structure, we need to update parent dates based on their children
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => taskMap.set(task.id, task));

  return tasks.map(task => {
    // Find all direct children of this task
    const children = tasks.filter(t => t.parentId === task.id);

    if (children.length > 0) {
      // Calculate the min start date and max end date from children
      const childStartDates = children.map(c => dayjs(c.startDate));
      const childEndDates = children.map(c => dayjs(c.endDate));

      const startMin = dayjs.min(childStartDates);
      const endMax = dayjs.max(childEndDates);

      if (startMin && endMax) {
        return {
          ...task,
          startDate: startMin.format('YYYY-MM-DD'),
          endDate: endMax.format('YYYY-MM-DD'),
          duration: endMax.diff(startMin, 'day') + 1,
        };
      }
    }
    return task;
  });
};
