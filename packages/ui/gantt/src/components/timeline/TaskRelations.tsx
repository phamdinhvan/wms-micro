import {Task, ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import React, {useMemo} from 'react';
import {
  calculateRelationPositions,
  generateRelationPath,
  RelationPosition,
} from '../../utils/relationUtils';

interface TaskRelationsProps {
  /** All visible tasks in the timeline */
  tasks: Task[];
  /** Start date of the visible view range */
  viewStart: dayjs.Dayjs;
  /** Current view mode (days, weeks, months) */
  viewMode: ViewMode;
  /** Height of each task row */
  rowHeight: number;
  /** Width of the timeline container */
  timelineWidth: number;
  /** Height of the timeline container */
  timelineHeight: number;
}

/**
 * TaskRelations Component
 *
 * Renders all task relation lines (dependencies) in the Gantt timeline.
 * Supports 4 relation types:
 * - SS (Start-to-Start): Start of source → Start of target
 * - FS (Finish-to-Start): End of source → Start of target
 * - SF (Start-to-Finish): Start of source → End of target
 * - FF (Finish-to-Finish): End of source → End of target
 *
 * Features:
 * - Smart routing with orthogonal lines
 * - Automatic filtering of invisible relations
 * - Virtual scroll support
 * - Arrow markers pointing to target tasks
 */
export const TaskRelations: React.FC<TaskRelationsProps> = React.memo(
  ({tasks, viewStart, viewMode, rowHeight, timelineWidth, timelineHeight}) => {
    // Calculate all relation positions
    const relationPositions = useMemo<RelationPosition[]>(
      () => calculateRelationPositions(tasks, viewStart, viewMode, rowHeight),
      [tasks, viewStart, viewMode, rowHeight],
    );

    // Don't render if no relations exist
    if (relationPositions.length === 0) {
      return null;
    }

    return (
      <svg
        className="wms-absolute wms-inset-0 wms-pointer-events-none"
        style={{
          width: timelineWidth,
          height: timelineHeight,
          zIndex: 1,
        }}
        xmlns="http://www.w3.org/2000/svg">
        {/* Arrow marker definition - màu xanh nhạt, nhỏ gọn */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth">
            <path d="M0,0 L0,5 L5,2.5 z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Render all relation lines */}
        {relationPositions.map((position, index) => {
          const {
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourceTaskId,
            targetTaskId,
            relationType,
            sourcePoint,
            targetPoint,
          } = position;

          // Generate path for this relation with connection point info
          const pathData = generateRelationPath(
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePoint,
            targetPoint,
          );

          // Unique key for each relation
          const key = `relation-${sourceTaskId}-${targetTaskId}-${index}`;

          return (
            <g key={key}>
              {/* Relation line with arrow marker - màu xanh nhạt */}
              <path
                d={pathData}
                stroke="#3b82f6"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="wms-transition-all wms-duration-200"
                // style={{
                //   opacity: 0.85,
                // }}
              />

              {/* Hover highlight - invisible larger path for better hover detection */}
              <path
                d={pathData}
                stroke="transparent"
                strokeWidth="8"
                fill="none"
                className="wms-cursor-pointer wms-pointer-events-auto hover:wms-stroke-[#3b82f6] wms-transition-colors"
                style={{
                  opacity: 0,
                }}>
                <title>{`${relationType}: ${sourceTaskId} → ${targetTaskId}`}</title>
              </path>
            </g>
          );
        })}
      </svg>
    );
  },
);

TaskRelations.displayName = 'TaskRelations';
