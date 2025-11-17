import {Task, ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import {getDayWidth} from './ganttUtils';

/**
 * Relation connection point type
 * - start: Connect to task start (left side)
 * - end: Connect to task end (right side)
 */
export type ConnectionPoint = 'start' | 'end';

/**
 * Parsed relation with source and target connection points
 */
export interface ParsedRelation {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  relationType: 'SS' | 'FS' | 'SF' | 'FF';
  sourcePoint: ConnectionPoint;
  targetPoint: ConnectionPoint;
  delayDays?: number;
}

/**
 * Position coordinates for rendering
 */
export interface RelationPosition {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceTaskId: string;
  targetTaskId: string;
  relationType: string;
  sourcePoint: ConnectionPoint;
  targetPoint: ConnectionPoint;
}

/**
 * Parse relation type to determine connection points
 *
 * - SS (Start-to-Start): đầu task nguồn → đầu task đích
 * - FS (Finish-to-Start): đuôi task nguồn → đầu task đích
 * - SF (Start-to-Finish): đầu task nguồn → đuôi task đích
 * - FF (Finish-to-Finish): đuôi task nguồn → đuôi task đích
 */
export function parseRelationType(relationType: 'SS' | 'FS' | 'SF' | 'FF'): {
  sourcePoint: ConnectionPoint;
  targetPoint: ConnectionPoint;
} {
  switch (relationType) {
    case 'SS':
      return {sourcePoint: 'start', targetPoint: 'start'};
    case 'FS':
      return {sourcePoint: 'end', targetPoint: 'start'};
    case 'SF':
      return {sourcePoint: 'start', targetPoint: 'end'};
    case 'FF':
      return {sourcePoint: 'end', targetPoint: 'end'};
    default:
      return {sourcePoint: 'end', targetPoint: 'start'}; // Default to FS
  }
}

/**
 * Parse all relations from a task
 */
export function parseTaskRelations(task: Task): ParsedRelation[] {
  if (!task.relations || task.relations.length === 0) {
    return [];
  }

  return task.relations.map(relation => {
    const relationType = relation.relationType || 'FS';
    const {sourcePoint, targetPoint} = parseRelationType(relationType);

    return {
      id: relation.id,
      sourceTaskId: task.id,
      targetTaskId: relation.targetTask.id,
      relationType,
      sourcePoint,
      targetPoint,
      delayDays: relation.delayDays,
    };
  });
}

/**
 * Calculate X position based on task date and connection point
 * Must match the logic in taskCalculations.ts for task bar positioning
 */
export function calculateConnectionX(
  task: Task,
  connectionPoint: ConnectionPoint,
  viewStart: dayjs.Dayjs,
  viewMode: ViewMode,
): number {
  const dayWidth = getDayWidth(viewMode);
  const taskStart = dayjs(task.startDate, 'YYYY-MM-DD').startOf('day');
  const taskEnd = dayjs(task.endDate, 'YYYY-MM-DD').startOf('day');
  const normalizedViewStart = viewStart.startOf('day');

  if (connectionPoint === 'start') {
    // Left edge of task bar - match calculateTaskDimensions baseLeft
    const daysFromStart = taskStart.diff(normalizedViewStart, 'day');
    return daysFromStart * dayWidth;
  } else {
    // Right edge of task bar - match calculateTaskDimensions baseLeft + baseWidth
    // baseWidth = (endDate.diff(startDate, 'day') + 1) * dayWidth
    const taskDuration = taskEnd.diff(taskStart, 'day') + 1;
    const daysFromStart = taskStart.diff(normalizedViewStart, 'day');
    return (daysFromStart + taskDuration) * dayWidth;
  }
}

/**
 * Calculate Y position for task bar center
 * NOTE: SVG overlay scrolls with the container, so we calculate absolute position
 */
export function calculateConnectionY(
  taskIndex: number,
  rowHeight: number,
): number {
  // Center of the task bar - absolute position in content
  return taskIndex * rowHeight + rowHeight / 2;
}

/**
 * Calculate all relation positions for rendering
 * Only returns relations where both source and target tasks are visible
 */
export function calculateRelationPositions(
  tasks: Task[],
  viewStart: dayjs.Dayjs,
  viewMode: ViewMode,
  rowHeight: number,
): RelationPosition[] {
  const positions: RelationPosition[] = [];
  const taskMap = new Map<string, {task: Task; index: number}>();

  // Build task map for quick lookup
  tasks.forEach((task, index) => {
    taskMap.set(task.id, {task, index});
  });

  // Process each task's relations
  tasks.forEach(sourceTask => {
    const parsedRelations = parseTaskRelations(sourceTask);
    const sourceTaskData = taskMap.get(sourceTask.id);

    if (!sourceTaskData) return;

    parsedRelations.forEach(relation => {
      const targetTaskData = taskMap.get(relation.targetTaskId);

      // Skip if task points to itself (self-reference)
      if (relation.sourceTaskId === relation.targetTaskId) return;

      // Only render if both source and target tasks exist in current view
      if (!targetTaskData) return;

      const sourceX = calculateConnectionX(
        sourceTaskData.task,
        relation.sourcePoint,
        viewStart,
        viewMode,
      );
      const sourceY = calculateConnectionY(sourceTaskData.index, rowHeight);

      const targetX = calculateConnectionX(
        targetTaskData.task,
        relation.targetPoint,
        viewStart,
        viewMode,
      );
      const targetY = calculateConnectionY(targetTaskData.index, rowHeight);

      positions.push({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourceTaskId: relation.sourceTaskId,
        targetTaskId: relation.targetTaskId,
        relationType: relation.relationType,
        sourcePoint: relation.sourcePoint,
        targetPoint: relation.targetPoint,
      });
    });
  });

  return positions;
}

/**
 * Generate SVG path for relation line with smart routing
 * Ưu tiên đường thẳng vuông góc đi xuống dưới, đường đi ngắn nhất
 *
 * @param sourcePoint - Connection point type của source ('start' hoặc 'end')
 * @param targetPoint - Connection point type của target ('start' hoặc 'end')
 *
 * Logic:
 * - Nếu source từ 'start' (đầu task): đi trái trước để tránh đè task bar
 * - Nếu source từ 'end' (cuối task): đi phải trước
 * - Tương tự cho target khi vào
 */
export function generateRelationPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourcePoint: ConnectionPoint,
  targetPoint: ConnectionPoint,
): string {
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;

  // Offset cho connection points:
  // - Từ 'start': đi trái trước (offset âm) để tránh task bar
  // - Từ 'end': đi phải trước (offset dương)
  const cornerOffset = 20;
  const sourceOffset = sourcePoint === 'start' ? -cornerOffset : cornerOffset;
  const targetOffset = targetPoint === 'start' ? -cornerOffset : cornerOffset;

  // Case 1: Same vertical level - đường ngang thẳng
  if (Math.abs(deltaY) < 5) {
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  const sourceOffsetX = sourceX + sourceOffset;
  const targetOffsetX = targetX + targetOffset;

  // Case 2: Target ở bên phải và đường đi không bị chặn
  // Chỉ đi thẳng nếu:
  // - Target ở bên phải (deltaX > 0)
  // - Và không bị đè: targetPoint='start' (vào từ trái) HOẶC sourcePoint='end' (ra từ phải) và có đủ khoảng cách
  if (deltaX > 0) {
    // Check xem có bị đè task không:
    // - Nếu vào target từ phải (targetPoint='end'), cần đi vòng
    // - Nếu vào target từ trái (targetPoint='start') và ra từ trái (sourcePoint='start'), cũng cần cẩn thận
    const needRouteAround =
      targetPoint === 'end' || // Vào từ phải target - cần đi vòng
      (sourcePoint === 'start' && targetPoint === 'start' && deltaX < 80); // SS quá gần - cần đi vòng

    if (needRouteAround) {
      // Route around: đi xuống/lên qua midpoint
      const midY = sourceY + deltaY / 2;

      return `M ${sourceX} ${sourceY} 
              L ${sourceOffsetX} ${sourceY} 
              L ${sourceOffsetX} ${midY} 
              L ${targetOffsetX} ${midY} 
              L ${targetOffsetX} ${targetY}
              L ${targetX} ${targetY}`;
    }

    // Đường thẳng đơn giản: đi ngang, xuống, vào target
    return `M ${sourceX} ${sourceY} 
            L ${sourceOffsetX} ${sourceY} 
            L ${sourceOffsetX} ${targetY} 
            L ${targetOffsetX} ${targetY}
            L ${targetX} ${targetY}`;
  }

  // Case 3: Target ở bên trái - luôn cần route around
  else {
    // Đi ngang theo sourceOffset, đi xuống/lên đến midpoint,
    // đi ngang qua, đi xuống/lên đến target, đi ngang vào theo targetOffset
    const midY = sourceY + deltaY / 2;

    return `M ${sourceX} ${sourceY} 
            L ${sourceOffsetX} ${sourceY} 
            L ${sourceOffsetX} ${midY} 
            L ${targetOffsetX} ${midY} 
            L ${targetOffsetX} ${targetY}
            L ${targetX} ${targetY}`;
  }
}

/**
 * Calculate arrow marker position and rotation
 */
export function calculateArrowTransform(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): {x: number; y: number; angle: number} {
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;

  // Arrow points towards target
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return {
    x: targetX,
    y: targetY,
    angle,
  };
}
