import {ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import {DailyLoad, MountainChartData} from '../hooks/useGanttMoutainChart';
import {renderMountainVerticalGrid} from '../utils';

interface MountainChartProps {
  baseProjectStart: dayjs.Dayjs;
  baseProjectEnd: dayjs.Dayjs;
  currentDayWidth: number;
  viewMode: ViewMode;
  scrollX: number;
  height?: number;
  containerWidth?: number;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  /** API data for mountain chart */
  apiData: MountainChartData;
}

/**
 * MountainChart Component
 * 
 * Displays a visual representation of task load distribution across the timeline.
 * Shows the number of tasks active on each day as a bar chart.
 */
export function MountainChart({
  baseProjectStart,
  baseProjectEnd,
  currentDayWidth,
  viewMode,
  scrollX,
  height = 100,
  containerWidth = 1000,
  contentRef,
  apiData,
}: MountainChartProps) {
  const dailyLoads = apiData?.dailyLoads || [];
  const maxCount = apiData?.maxCount || 0;
  const averageTotalWorkforce = apiData?.averageTotalWorkforce || 0;

  const totalDays = baseProjectEnd.diff(baseProjectStart, 'day') + 1;
  const totalWidth = totalDays * currentDayWidth;


  // Render mountain chart vertical grid
  const mountainGrid = useMemo(() => {
    return renderMountainVerticalGrid(
      viewMode,
      height,
      currentDayWidth,
      baseProjectStart,
      totalDays,
      'mgrid',
    );
  }, [
    viewMode,
    height,
    currentDayWidth,
    baseProjectStart
  ]);

  const referenceLineY = height - (averageTotalWorkforce / maxCount) * (height - 20);

  //over capacity color
  const overCapacityColor = 'linear-gradient(to top, #f05555, #fb8b8b)';
  const normalColor = 'linear-gradient(to top, #2fbf6a, #9feec1)';
  
  return (
    <div
      className="wms-relative wms-bg-white wms-border-t-2 wms-border-gray-400 wms-overflow-hidden"
      style={{ height }}>
      <div className="wms-overflow-hidden wms-h-full">
        <div
          ref={contentRef}
          className="wms-relative wms-h-full"
          style={{
            width: totalWidth,
            transform: `translate3d(-${scrollX}px,0,0)`,
            willChange: 'transform',
          }}>
          <div className="wms-relative wms-h-full wms-pointer-events-none">
            {/* Reference Line */}
            {averageTotalWorkforce > 0 && (
              <div
                className="wms-absolute wms-left-0 wms-right-0 wms-border-t-2 wms-border-dashed wms-border-red-500 wms-z-10 wms-pointer-events-none"
                style={{ top: referenceLineY }}>
                <span
                  className="wms-absolute wms-left-2 wms-text-[10px] wms-text-red-500 wms-font-bold wms-pointer-events-none wms-bg-white wms-px-1 wms-rounded"
                  style={{
                    top: -8,
                    fontFamily: 'var(--gantt-font-primary, sans-serif)',
                  }}>
                  100 %
                </span>
              </div>
            )}

            {/* Grid Lines */}
            {mountainGrid}

            {/* Chart Bars */}
            <div
              className="wms-relative wms-h-full wms-z-[1] wms-pointer-events-none"
              style={{ height }}>
              {dailyLoads.map((load, index) => {
                // Improved bar height calculation with minimum height for visibility
                const normalizedHeight = (load.count / maxCount) * (height - 20);
                const minBarHeight = load.count > 0 ? Math.max(normalizedHeight, 8) : 0;
                const barHeight = Math.min(minBarHeight, height - 10);

                // Subtract 2 to avoid showing the reference line as over capacity
                const isOverCapacity = load.count > averageTotalWorkforce;

                // Calculate opacity based on actual count for visual feedback
                const barOpacity =
                  load.count === 0
                    ? 0
                    : Math.max(0.5, Math.min(1, 0.5 + (load.count / maxCount) * 0.5));

                return (
                  <div
                    key={`bar-${index}`}
                    className="wms-absolute wms-bottom-0 wms-flex wms-items-end wms-justify-center wms-group wms-pointer-events-auto"
                    style={{
                      left: index * currentDayWidth,
                      width: currentDayWidth,
                      height,
                      padding: '0 1px',
                    }}>
                    <div
                      className="wms-w-full wms-rounded-t wms-transition-all wms-duration-150 wms-cursor-pointer hover:wms-opacity-90"
                      style={{
                        height: barHeight,
                        background: isOverCapacity
                          ? overCapacityColor
                          : normalColor,
                        boxShadow: load.count > 0 ? '0 -1px 3px rgba(0,0,0,0.1)' : 'none',
                        opacity: barOpacity,
                        pointerEvents: 'auto',
                      }}
                      title={load.count.toString()}>
                      {load.count > 0 && currentDayWidth > 20 && (
                        <div
                          className="wms-absolute wms-inset-x-0 wms-text-center wms-text-[10px] wms-font-semibold wms-text-white wms-opacity-0 group-hover:wms-opacity-100 wms-transition-opacity"
                          style={{
                            top: -14,
                            fontFamily: 'var(--gantt-font-primary, sans-serif)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          }}>
                          {load.count}
                        </div>
                      )}
                    </div>

                    {load.count > 0 && (
                      <div className="wms-absolute wms-bottom-full wms-left-1/2 wms-transform wms--translate-x-1/2 wms-mb-2 wms-opacity-0 group-hover:wms-opacity-100 wms-pointer-events-none wms-transition-opacity wms-z-20">
                        <div className="wms-bg-gray-900 wms-text-white wms-text-xs wms-rounded wms-px-2 wms-py-1 wms-whitespace-nowrap wms-shadow-lg">
                          <div className="wms-font-semibold wms-mb-1">
                            {load.count}
                          </div>
                          {Object.entries(load.statusCounts).map(([status, count]) => (
                            <div key={status} className="wms-text-[10px] wms-opacity-80">
                              {status}: {count}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

