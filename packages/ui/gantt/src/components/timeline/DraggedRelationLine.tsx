import React, {useMemo} from 'react';
import {ConnectionPoint} from './ConnectionNode';

interface DraggedRelationLineProps {
  /** Starting X coordinate (from source node center) */
  startX: number;
  /** Starting Y coordinate (from source node center) */
  startY: number;
  /** Current mouse X coordinate (or target node X if snapped) */
  endX: number;
  /** Current mouse Y coordinate (or target node Y if snapped) */
  endY: number;
  /** Source connection point type */
  sourcePoint: ConnectionPoint;
  /** Whether the line is snapped to a target node */
  isSnapped: boolean;
}

export const DraggedRelationLine: React.FC<DraggedRelationLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  sourcePoint,
  isSnapped,
}) => {
  // Generate SVG path with curved line
  const pathData = useMemo(() => {
    const dx = endX - startX;
    const absDx = Math.abs(dx);

    // Control point distance for smooth curve
    const controlDistance = Math.min(absDx * 0.5, 100);

    // Create a curved path
    if (sourcePoint === 'end') {
      // From right side - curve to the right first
      const cx1 = startX + controlDistance;
      const cy1 = startY;
      const cx2 = endX - controlDistance;
      const cy2 = endY;

      return `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
    } else {
      // From left side - curve to the left first
      const cx1 = startX - controlDistance;
      const cy1 = startY;
      const cx2 = endX + controlDistance;
      const cy2 = endY;

      return `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
    }
  }, [startX, startY, endX, endY, sourcePoint]);

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true">
      <defs>
        {/* Arrow marker definition */}
        <marker
          id="dragged-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth">
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={isSnapped ? '#1971c2' : '#1971c2'}
            opacity={isSnapped ? 1 : 0.8}
          />
        </marker>

        {/* Animated dash pattern */}
        <style>
          {`
            @keyframes dash-animation {
              to {
                stroke-dashoffset: -20;
              }
            }
            .animated-dashed-line {
              animation: dash-animation 0.5s linear infinite;
            }
          `}
        </style>
      </defs>

      {/* Dashed line path */}
      <path
        d={pathData}
        stroke={isSnapped ? '#1971c2' : '#1971c2'}
        strokeWidth={isSnapped ? 3 : 2}
        fill="none"
        strokeDasharray="8 4"
        strokeLinecap="round"
        className="animated-dashed-line"
        opacity={isSnapped ? 1 : 0.8}
        style={{
          filter: isSnapped
            ? 'drop-shadow(0 0 4px rgba(25, 113, 194, 0.4))'
            : 'none',
        }}
      />

      {/* Glow effect when snapped */}
      {isSnapped && (
        <circle
          cx={endX}
          cy={endY}
          r="12"
          fill="none"
          stroke="#1971c2"
          strokeWidth="2"
          opacity="0.3">
          <animate
            attributeName="r"
            from="8"
            to="16"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
};

DraggedRelationLine.displayName = 'DraggedRelationLine';
