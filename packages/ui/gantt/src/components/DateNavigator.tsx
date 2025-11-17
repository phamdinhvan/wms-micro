import {ActionIcon, Button, Group, Text} from '@mantine/core';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import {ViewMode, useControlParams} from '@wms/core';
import dayjs from 'dayjs';
import {useState, useEffect, useCallback, useRef} from 'react';

interface DateNavigatorProps {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  viewMode: ViewMode;
  onDateRangeChange: (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => void;
  onResetToProject: () => void;
  onDateFilterChange?: (from: string | null, to: string | null) => void;
  t: (key: string) => string;
}

export function DateNavigator({
  startDate,
  endDate,
  viewMode,
  onDateRangeChange,
  onResetToProject,
  onDateFilterChange,
  t,
}: DateNavigatorProps) {
  const {replaceParams} = useControlParams();
  
  // Temporary state for immediate UI updates
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  // Update temp dates when props change
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  // Debounce timeout refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced API calls - 500ms delay to prevent rapid API calls
  const debouncedApiCall = useCallback(
    (newStartDate: dayjs.Dayjs, newEndDate: dayjs.Dayjs) => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for API calls
      debounceTimeoutRef.current = setTimeout(() => {
        // Call the actual API functions
        onDateRangeChange(newStartDate, newEndDate);
        
        replaceParams({
          startDate: newStartDate.format('YYYY-MM-DD'),
          endDate: newEndDate.format('YYYY-MM-DD'),
        });

        if (onDateFilterChange) {
          onDateFilterChange(
            newStartDate.format('YYYY-MM-DD'),
            newEndDate.format('YYYY-MM-DD'),
          );
        }
      }, 500);
    },
    [onDateRangeChange, replaceParams, onDateFilterChange],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const getNavigationUnit = (mode: ViewMode) => {
    switch (mode) {
      case 'days':
        return {unit: 'week', amount: 1};
      case 'weeks':
        return {unit: 'month', amount: 1};
      case 'months':
        return {unit: 'month', amount: 3};
      default:
        return {unit: 'week', amount: 1};
    }
  };

  const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    const isSameMonth =
      start.month() === end.month() && start.year() === end.year();
    const isSameYear = start.year() === end.year();

    if (isSameMonth) {
      return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
    } else if (isSameYear) {
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    } else {
      return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
    }
  };

  const handlePrevious = () => {
    const {unit, amount} = getNavigationUnit(viewMode);
    const duration = tempEndDate.diff(tempStartDate, 'day');
    const newStartDate = tempStartDate.subtract(amount, unit as any);
    const newEndDate = newStartDate.add(duration, 'day');
    
    // Update temporary state immediately for UI responsiveness
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    
    // Debounced API calls to prevent rapid requests
    debouncedApiCall(newStartDate, newEndDate);
  };

  const handleNext = () => {
    const {unit, amount} = getNavigationUnit(viewMode);
    const duration = tempEndDate.diff(tempStartDate, 'day');
    const newStartDate = tempStartDate.add(amount, unit as any);
    const newEndDate = newStartDate.add(duration, 'day');
    
    // Update temporary state immediately for UI responsiveness
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    
    // Debounced API calls to prevent rapid requests
    debouncedApiCall(newStartDate, newEndDate);
  };

  const handleToday = () => {
    const today = dayjs();
    const duration = tempEndDate.diff(tempStartDate, 'day'); // keep same number of days visible
    const newStartDate = today.startOf('day'); // anchor at today
    const newEndDate = newStartDate.add(duration, 'day');
    
    // Update temporary state immediately for UI responsiveness
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    
    // Debounced API calls to prevent rapid requests
    debouncedApiCall(newStartDate, newEndDate);
  };

  return (
    <Group gap="xs" align="center">
      <ActionIcon
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        title={t('gantt.filters.time.previous')}>
        <IconChevronLeft size={16} />
      </ActionIcon>

      <Text size="sm" fw={500} className="wms-min-w-[200px] wms-text-center">
        {formatDateRange(tempStartDate, tempEndDate)}
      </Text>

      <ActionIcon
        variant="outline"
        size="sm"
        onClick={handleNext}
        title={t('gantt.filters.time.next')}>
        <IconChevronRight size={16} />
      </ActionIcon>

      <Button
        variant="outline"
        size="xs"
        leftSection={<IconCalendar size={14} />}
        onClick={handleToday}
        title={t('gantt.filters.time.today')}>
        {t('gantt.filters.time.today')}
      </Button>

      <Button
        variant="outline"
        size="xs"
        onClick={onResetToProject}
        title={t('gantt.filters.time.resetToProject')}>
        {t('gantt.filters.time.resetToProject')}
      </Button>
    </Group>
  );
}
