import dayjs from 'dayjs';
import {useEffect, useState} from 'react';
import {useGanttParams} from './useGanttParams';

export function useGanttDateRange(
  projectStartDate?: dayjs.Dayjs,
  projectEndDate?: dayjs.Dayjs,
) {
  const {params, updateParams} = useGanttParams();

  // Use today as default start
  const defaultStart = projectStartDate || dayjs().startOf('day');

  // Date range state - only track startDate, endDate is calculated
  const [currentStartDate, setCurrentStartDate] = useState<dayjs.Dayjs>(() => {
    const urlStart = params.startDate
      ? dayjs(params.startDate, 'YYYY-MM-DD')
      : null;

    return urlStart && urlStart.isValid() ? urlStart : defaultStart;
  });

  // Calculate endDate as startDate + 6 months
  const currentDateRange = {
    start: currentStartDate,
    end: currentStartDate.add(6, 'month').startOf('day'),
  };

  // Update start date when URL params change
  useEffect(() => {
    const urlStart = params.startDate
      ? dayjs(params.startDate, 'YYYY-MM-DD')
      : null;

    if (urlStart && urlStart.isValid()) {
      setCurrentStartDate(urlStart);
    }
  }, [params.startDate]);

  const handleDateRangeChange = (start: dayjs.Dayjs) => {
    setCurrentStartDate(start);
    updateParams({
      startDate: start.format('YYYY-MM-DD'),
      endDate: '', // Clear endDate from URL
    });
  };

  const handleResetToProject = () => {
    setCurrentStartDate(defaultStart);
    updateParams({startDate: '', endDate: ''}); // Clear URL params
  };

  const handleDateFilterChange = (
    startDate: string | null,
    endDate: string | null,
  ) => {
    updateParams({startDate, endDate});
  };

  return {
    currentDateRange,
    setCurrentDateRange: (range: {start: dayjs.Dayjs; end: dayjs.Dayjs}) => {
      setCurrentStartDate(range.start);
    },
    handleDateRangeChange,
    handleResetToProject,
    handleDateFilterChange,
  };
}
