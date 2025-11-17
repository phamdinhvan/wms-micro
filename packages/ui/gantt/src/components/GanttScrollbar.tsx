import {UI_CONSTANTS} from '../utils/ganttConfig';

interface GanttScrollbarProps {
  treeWidth: number;
  totalWidth: number;
  scrollX: number;
  onScroll: React.UIEventHandler<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function GanttScrollbar({
  treeWidth,
  totalWidth,
  scrollX,
  onScroll,
  bottomRef,
}: GanttScrollbarProps) {
  const SCROLLBAR_H = UI_CONSTANTS.SCROLLBAR_HEIGHT;

  return (
    <div className="wms-bg-white wms-border-t">
      <div className="wms-flex">
        <div style={{width: treeWidth, height: SCROLLBAR_H}} />
        <div style={{width: 4, height: SCROLLBAR_H}} />

        <div
          ref={bottomRef}
          className="wms-flex-1 gantt-bottom-scroll"
          onScroll={onScroll}
          style={{
            height: SCROLLBAR_H,
            overflowX: 'scroll',
            overflowY: 'hidden',
            // Force scrollbar to always be visible on all platforms
            scrollbarWidth: 'auto', // Firefox
            msOverflowStyle: 'scrollbar', // IE/Edge
            WebkitOverflowScrolling: 'touch', // iOS Safari
          }}>
          <div
            style={{
              width: totalWidth,
              height: SCROLLBAR_H - 2,
              minHeight: SCROLLBAR_H - 2,
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
}
