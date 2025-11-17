import {TaskStatusCode} from '@wms/core';
import dayjs from 'dayjs';

export const appId = 'gantt-21554caf-f4ca-48c1-a244-53c1985e611e';

export const baseProjectStart = dayjs('2025-07-20');
export const baseProjectEnd = dayjs('2026-09-10');

export const rowHeight = 40;
export const dayWidth = 40;
export const HEADER_HEIGHT = 50;

export const levelColors = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#795548',
];
export const statusColors: Record<TaskStatusCode, string> = {
  new: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  cancelled: '#9C27B0',
  //   on_hold: '#795548',
};
