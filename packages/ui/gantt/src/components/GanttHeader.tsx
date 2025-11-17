import {ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import {JSX} from 'react';
import {baseProjectEnd, baseProjectStart} from '../constants';
import {
  renderDaysView,
  renderMonthsView,
  renderWeeksView,
} from '../utils/ganttHeaderUtils';

export const renderHeader = (
  viewMode: ViewMode,
  currentDayWidth: number,
  t: (key: string) => string,
  customStartDate?: dayjs.Dayjs,
  customEndDate?: dayjs.Dayjs,
): JSX.Element => {
  const startDate = customStartDate || baseProjectStart;
  const endDate = customEndDate || baseProjectEnd;
  const totalDays = endDate.diff(startDate, 'day') + 1;

  switch (viewMode) {
    case 'days':
      return renderDaysView(startDate, endDate, currentDayWidth, totalDays);
    case 'weeks':
      return renderWeeksView(startDate, endDate, currentDayWidth, t);
    case 'months':
      return renderMonthsView(startDate, endDate, currentDayWidth, t);
    default:
      return <></>;
  }
};
