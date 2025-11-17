import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import {JSX} from 'react';

dayjs.extend(minMax);

export const renderDaysView = (
  baseProjectStart: dayjs.Dayjs,
  baseProjectEnd: dayjs.Dayjs,
  currentDayWidth: number,
  totalDays: number,
): JSX.Element => {
  const months: JSX.Element[] = [];
  const days: JSX.Element[] = [];
  let cursor = baseProjectStart.clone();

  // First month (partial)
  let firstMonthEnd = cursor.endOf('month');
  let daysInFirstMonth = firstMonthEnd.diff(baseProjectStart, 'day') + 1;

  months.push(
    <div
      key={cursor.format('YYYY-MM')}
      className="wms-border-r wms-border-[var(--gantt-borderTimelineMonthEnd,#E5E7EB)] wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
      style={{
        width: currentDayWidth * daysInFirstMonth,
      }}>
      {cursor.format('YYYY/MM')}
    </div>,
  );

  cursor = cursor.add(1, 'month').startOf('month');

  // Full months
  while (cursor.isBefore(baseProjectEnd)) {
    const monthEnd = cursor.endOf('month');
    const daysInMonth = monthEnd.diff(cursor, 'day') + 1;
    months.push(
      <div
        key={cursor.format('YYYY-MM')}
        className="wms-border-r wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
        style={{
          width: currentDayWidth * daysInMonth,
        }}>
        {cursor.format('YYYY/MM')}
      </div>,
    );
    cursor = cursor.add(1, 'month');
  }

  // Individual days
  for (let d = 0; d < totalDays; d++) {
    const date = baseProjectStart.add(d, 'day');
    const isToday = date.isSame(dayjs(), 'day');
    const isWeekend = date.day() === 0 || date.day() === 6;
    let isEndOfMonth = date.date() === date.daysInMonth();
    days.push(
      <div
        key={`day-${d}`}
        className={`wms-border-r ${isEndOfMonth ? 'wms-border-[var(--gantt-borderTimelineMonthEnd,#9CA3AF)]' : 'wms-border-[var(--gantt-borderTimeline,#E5E7EB)]'} wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-bold ${
          isWeekend ? 'wms-bg-[#e5e5e5]' : ''
        } ${isToday ? 'wms-bg-[#f5e8dc]' : ''}`}
        style={{
          width: currentDayWidth,
        }}>
        {date.format('D')}
      </div>,
    );
  }

  return (
    <div className="wms-grid wms-grid-flow-col wms-grid-rows-2 wms-h-full wms-border-b wms-border-[var(--gantt-borderTimeline,#E5E7EB)]">
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-bg-[#F6F6F6]">
        {months}
      </div>
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-bg-[#f3f3f3]">
        {days}
      </div>
    </div>
  );
};

export const renderWeeksView = (
  baseProjectStart: dayjs.Dayjs,
  baseProjectEnd: dayjs.Dayjs,
  currentDayWidth: number,
  t: (key: string) => string,
): JSX.Element => {
  const months: JSX.Element[] = [];
  const weeks: JSX.Element[] = [];
  let cursor = baseProjectStart.clone();

  let firstMonthEnd = cursor.endOf('month');
  let daysInFirstMonth = firstMonthEnd.diff(baseProjectStart, 'day') + 1;
  months.push(
    <div
      key={cursor.format('YYYY-MM')}
      className="wms-border-r wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
      style={{
        width: currentDayWidth * daysInFirstMonth,
        borderRightColor: 'var(--gantt-borderTimeline, #E5E7EB)',
      }}>
      {cursor.format('YYYY/MM')}
    </div>,
  );

  cursor = cursor.add(1, 'month').startOf('month');

  while (cursor.isBefore(baseProjectEnd)) {
    const monthEnd = cursor.endOf('month');
    const daysInMonth = monthEnd.diff(cursor, 'day') + 1;
    months.push(
      <div
        key={cursor.format('YYYY-MM')}
        className="wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
        style={{width: currentDayWidth * daysInMonth}}>
        {cursor.format('YYYY/MM')}
      </div>,
    );
    cursor = cursor.add(1, 'month');
  }

  let weekCursor = baseProjectStart.clone();
  while (weekCursor.isBefore(baseProjectEnd)) {
    const weekStart = weekCursor.clone();
    const weekEnd = dayjs.min([
      weekCursor.clone().endOf('week'),
      baseProjectEnd,
    ]);
    const daysInWeek = weekEnd.diff(weekStart, 'day') + 1;
    const weekLabel =
      weekStart.month() === weekEnd.month()
        ? `${weekStart.format('M/D')}-${weekEnd.format('D')}`
        : `${weekStart.format('M/D')}-${weekEnd.format('M/D')}`;

    weeks.push(
      <div
        key={`week-${weekStart.format('YYYY-MM-DD')}`}
        className="wms-border-r wms-border-gray-300 wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-bold"
        style={{width: daysInWeek * currentDayWidth}}>
        {t('header.week')} {weekLabel}
      </div>,
    );
    weekCursor = weekEnd.add(1, 'day');
  }

  return (
    <div className="wms-grid wms-grid-flow-col wms-grid-rows-2 wms-h-full wms-border-b wms-border-gray-300">
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-gray-300 wms-bg-[#F6F6F6]">
        {months}
      </div>
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-gray-300 wms-bg-[#f3f3f3]">
        {weeks}
      </div>
    </div>
  );
};

export const renderMonthsView = (
  baseProjectStart: dayjs.Dayjs,
  baseProjectEnd: dayjs.Dayjs,
  currentDayWidth: number,
  t: (key: string) => string,
): JSX.Element => {
  const years: JSX.Element[] = [];
  const months: JSX.Element[] = [];
  let cursor = baseProjectStart.clone();

  let firstYearEnd = cursor.endOf('year');
  let daysInFirstYear = firstYearEnd.diff(baseProjectStart, 'day') + 1;
  years.push(
    <div
      key={cursor.format('YYYY')}
      className="wms-border-r wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
      style={{
        width: currentDayWidth * daysInFirstYear,
      }}>
      {t('header.year')} {cursor.format('YYYY')}
    </div>,
  );

  cursor = cursor.add(1, 'year').startOf('year');

  while (cursor.isBefore(baseProjectEnd)) {
    const yearEnd = cursor.endOf('year');
    const daysInYear = yearEnd.diff(cursor, 'day') + 1;
    years.push(
      <div
        key={cursor.format('YYYY')}
        className="wms-border-r wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-semibold"
        style={{
          width: currentDayWidth * daysInYear,
        }}>
        {t('header.year')} {cursor.format('YYYY')}
      </div>,
    );
    cursor = cursor.add(1, 'year');
  }

  let monthCursor = baseProjectStart.clone();
  while (monthCursor.isBefore(baseProjectEnd)) {
    const monthStart = monthCursor.clone();
    const monthEnd = dayjs.min([
      monthCursor.clone().endOf('month'),
      baseProjectEnd,
    ]);
    const daysInMonth = monthEnd.diff(monthStart, 'day') + 1;
    const monthLabel =
      monthStart.year() === monthEnd.year()
        ? `${monthStart.format('M/D')}-${monthEnd.format('D')}`
        : `${monthStart.format('M/D')}-${monthEnd.format('M/D')}`;

    months.push(
      <div
        key={`month-${monthStart.format('YYYY-MM')}`}
        className="wms-border-r wms-border-[var(--gantt-borderTimeline,#E5E7EB)] wms-text-center wms-text-xs wms-flex wms-items-center wms-justify-center wms-font-bold"
        style={{width: daysInMonth * currentDayWidth}}>
        {t('header.month')} {monthLabel}
      </div>,
    );

    monthCursor = monthEnd.add(1, 'day');
  }

  return (
    <div className="wms-grid wms-grid-flow-col wms-grid-rows-2 wms-h-full wms-border-b wms-border-gray-300">
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-gray-300 wms-bg-[#F6F6F6]">
        {years}
      </div>
      <div className="wms-col-span-1 wms-flex wms-border-b wms-border-gray-300 wms-bg-[#f3f3f3]">
        {months}
      </div>
    </div>
  );
};
