import {ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import {baseProjectEnd, baseProjectStart} from '../constants/gantt';

/**
 * Get pixel width for one day based on current view mode
 *
 * Different view modes show different levels of detail:
 * - Days: 40px per day (most detailed, shows individual days)
 * - Weeks: 20px per day (medium detail, shows weeks)
 * - Months: 7px per day (least detailed, shows months)
 *
 * @param mode - Current view mode (days/weeks/months)
 * @returns Width in pixels for one day
 */
export function getDayWidth(mode: ViewMode): number {
  return mode === 'days' ? 40 : mode === 'weeks' ? 20 : 7;
}

/**
 * Clamp a date to stay within project boundaries
 *
 * This ensures that drag operations don't move tasks outside
 * the valid project timeline range.
 *
 * @param date - Date to clamp
 * @returns Date clamped to project start/end boundaries
 */
export function clampDate(date: dayjs.Dayjs): dayjs.Dayjs {
  if (date.isBefore(baseProjectStart)) return baseProjectStart;
  if (date.isAfter(baseProjectEnd)) return baseProjectEnd;
  return date;
}

/**
 * Calculate total number of days in the project timeline
 *
 * Used for determining timeline width and boundary calculations.
 * Adds +1 because date ranges are inclusive.
 *
 * @returns Total project days (inclusive)
 */
export function getTotalProjectDays(): number {
  return baseProjectEnd.diff(baseProjectStart, 'day') + 1;
}

/**
 * Calculate total timeline width in pixels for given view mode
 *
 * This determines how wide the entire timeline should be rendered.
 *
 * @param viewMode - Current view mode
 * @returns Total width in pixels
 */
export function getTotalTimelineWidth(viewMode: ViewMode): number {
  const totalDays = getTotalProjectDays();
  const dayWidth = getDayWidth(viewMode);
  return totalDays * dayWidth;
}

/**
 * Convert pixel position to day offset from project start
 *
 * Used for converting mouse coordinates to timeline dates.
 *
 * @param pixelX - Horizontal pixel position
 * @param dayWidth - Width of one day in current view mode
 * @returns Day offset from project start (rounded to nearest day)
 */
export function pixelToDayOffset(pixelX: number, dayWidth: number): number {
  return Math.round(pixelX / dayWidth);
}

/**
 * Convert day offset to pixel position
 *
 * Used for positioning tasks on the timeline.
 *
 * @param dayOffset - Days from project start
 * @param dayWidth - Width of one day in current view mode
 * @returns Pixel position from timeline start
 */
export function dayOffsetToPixel(dayOffset: number, dayWidth: number): number {
  return dayOffset * dayWidth;
}

/**
 * Calculate task position and width in pixels
 *
 * This converts task dates and duration into pixel coordinates
 * for rendering on the timeline.
 *
 * @param startDate - Task start date (YYYY-MM-DD format)
 * @param duration - Task duration in days
 * @param dayWidth - Width of one day in current view mode
 * @returns Object with left position and width in pixels
 */
export function getTaskPosition(
  startDate: string,
  duration: number,
  dayWidth: number,
): {left: number; width: number} {
  const left = dayjs(startDate).diff(baseProjectStart, 'day') * dayWidth;
  const width = duration * dayWidth;
  return {left, width};
}

/**
 * Calculate new task dates after a drag operation
 *
 * This is the core logic for determining where a task should end up
 * after being dragged. It handles all three drag types and ensures
 * dates stay within project boundaries and maintain minimum duration.
 *
 * IMPORTANT: This logic must match exactly with the preview calculation
 * in GanttTimeLine.tsx to avoid visual discrepancies.
 *
 * @param initDate - Original start date of the task
 * @param initDuration - Original duration in days
 * @param type - Type of drag operation
 * @param deltaDays - Number of days moved (positive = right, negative = left)
 * @returns New start date, end date, and duration
 */
export function calculateNewDates(
  initDate: string,
  initDuration: number,
  type: 'move' | 'resize-left' | 'resize-right',
  deltaDays: number,
): {startDate: string; endDate: string; duration: number} {
  let newStartDate: string;
  let newEndDate: string;
  let newDuration: number;

  if (type === 'move') {
    // MOVE: Shift both start and end dates by deltaDays, keep duration same
    const newStart = clampDate(dayjs(initDate).add(deltaDays, 'day'));
    const newEnd = newStart.add(initDuration - 1, 'day'); // -1 because duration is inclusive
    newStartDate = newStart.format('YYYY-MM-DD');
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = initDuration; // Duration stays the same
  } else if (type === 'resize-left') {
    // RESIZE-LEFT: Move start date, adjust duration, keep end date relative
    let calculatedStart = clampDate(dayjs(initDate).add(deltaDays, 'day'));
    let calculatedDuration = initDuration - deltaDays; // Moving start right = shorter duration

    // Ensure minimum 1 day duration
    if (calculatedDuration < 1) {
      calculatedDuration = 1;
      // If duration would be < 1, set start to be 1 day before original end
      calculatedStart = dayjs(initDate).add(initDuration - 1, 'day');
    }

    const newEnd = calculatedStart.add(calculatedDuration - 1, 'day');
    newStartDate = calculatedStart.format('YYYY-MM-DD');
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = calculatedDuration;
  } else if (type === 'resize-right') {
    // RESIZE-RIGHT: Keep start date, extend/shrink end date
    let calculatedDuration = initDuration + deltaDays; // Moving right = longer duration

    // Ensure minimum 1 day duration
    if (calculatedDuration < 1) calculatedDuration = 1;

    // Calculate new end date and clamp to project boundaries
    const newEnd = clampDate(
      dayjs(initDate).add(calculatedDuration - 1, 'day'), // -1 for inclusive duration
    );

    newStartDate = initDate; // Start date stays the same
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = calculatedDuration;
  } else {
    throw new Error(`Invalid drag type: ${type}`);
  }

  return {
    startDate: newStartDate,
    endDate: newEndDate,
    duration: newDuration,
  };
}
