import {Task} from '@wms/core';
import dayjs from 'dayjs';

export interface TaskDimensions {
  baseLeft: number;
  baseWidth: number;
  leftPx: number;
  widthPx: number;
  taskDuration: number;
  isParent: boolean;
  isChild: boolean;
}

export const calculateDuration = (task: Task): number => {
  return Math.max(
    1,
    dayjs(task.endDate, 'YYYY-MM-DD').diff(dayjs(task.startDate, 'YYYY-MM-DD'), 'day') + 1,
  );
};

export const calculateTaskDimensions = (
  task: Task,
  tasks: Task[],
  baseProjectStart: dayjs.Dayjs,
  currentDayWidth: number,
  isFlatView: boolean,
): TaskDimensions => {
  const taskDuration = calculateDuration(task);
  const baseLeft =
    dayjs(task.startDate, 'YYYY-MM-DD')
      .startOf('day')
      .diff(baseProjectStart.startOf('day'), 'day') * currentDayWidth;
  const baseWidth = taskDuration * currentDayWidth;

  const isParent = tasks.some(t => t.parentId === task.id) && !isFlatView;
  const isChild = task.parentId !== null && task.parentId !== undefined && !isFlatView;

  return {
    baseLeft,
    baseWidth,
    leftPx: baseLeft,
    widthPx: baseWidth,
    taskDuration,
    isParent,
    isChild,
  };
};

export const applyDragPreview = (
  dimensions: TaskDimensions,
  dragPreview: {id: string; type: 'move' | 'resize-left' | 'resize-right'; deltaDays: number} | null,
  task: Task,
  baseProjectStart: dayjs.Dayjs,
  currentDayWidth: number,
): {leftPx: number; widthPx: number} => {
  if (!dragPreview || dragPreview.id !== task.id) {
    return {leftPx: dimensions.leftPx, widthPx: dimensions.widthPx};
  }

  const {deltaDays, type} = dragPreview;
  const {taskDuration, baseLeft, baseWidth} = dimensions;

  if (type === 'move') {
    const newStartDate = dayjs(task.startDate, 'YYYY-MM-DD').add(deltaDays, 'day');
    const newLeft =
      newStartDate.diff(baseProjectStart.startOf('day'), 'day') * currentDayWidth;
    return {leftPx: newLeft, widthPx: baseWidth};
  }

  if (type === 'resize-left') {
    const newStartDate = dayjs(task.startDate, 'YYYY-MM-DD').add(deltaDays, 'day');
    const newDuration = Math.max(1, taskDuration - deltaDays);
    const newLeft =
      newStartDate.diff(baseProjectStart.startOf('day'), 'day') * currentDayWidth;
    return {leftPx: newLeft, widthPx: newDuration * currentDayWidth};
  }

  if (type === 'resize-right') {
    const newDuration = Math.max(1, taskDuration + deltaDays);
    return {leftPx: baseLeft, widthPx: newDuration * currentDayWidth};
  }

  return {leftPx: dimensions.leftPx, widthPx: dimensions.widthPx};
};

export const calculateTaskPosition = (
  index: number,
  rowHeight: number,
  isParent: boolean,
  isChild: boolean,
  virtualTop?: number,
): number => {
  if (virtualTop !== undefined) {
    return isParent || isChild ? (rowHeight - 40) / 2 : 0;
  }
  return isParent || isChild ? index * rowHeight + (rowHeight - 40) / 2 : index * rowHeight;
};

export const getTaskHeight = (isParent: boolean, isChild: boolean): number => {
  return isParent || isChild ? 30 : 38;
};
