import {useQueryClient} from '@tanstack/react-query';
import {TMountainChartItemWorkforce, useGetMountainChart} from '@wms/core';
import dayjs from 'dayjs';
import {useCallback, useMemo} from 'react';

interface UseGanttMountainChartProps {
  projectId: string | null;
  baseProjectStart: dayjs.Dayjs;
  baseProjectEnd: dayjs.Dayjs;
  enabled?: boolean;
}

export interface DailyLoad {
  date: string;
  count: number;
  statusCounts: Record<string, number>;
}

export interface MountainChartData {
  dailyLoads: DailyLoad[];
  maxCount: number;
  averageTotalWorkforce: number;
  totalDays: number;
}

export function useGanttMountainChart({
  projectId,
  baseProjectStart,
  baseProjectEnd,
  enabled = true,
}: UseGanttMountainChartProps) {
  const queryClient = useQueryClient();

  const apiParams = useMemo(() => {
    if (!projectId || !enabled) {
      return null;
    }

    const startDate = baseProjectStart.format('YYYY-MM-DD');
    const duration = baseProjectEnd.diff(baseProjectStart, 'month', true);
    const durationInMonths = Math.ceil(duration);

    return {
      projectId,
      startDate,
      duration: durationInMonths,
    };
  }, [projectId, baseProjectStart, baseProjectEnd, enabled]);

  const queryResult = useGetMountainChart({
    projectId: apiParams?.projectId || '',
    startDate: apiParams?.startDate || '',
    duration: apiParams?.duration,
  });

  const apiData = queryResult.data;
  const isLoading = queryResult.isLoading;

  const refetchMountainChart = useCallback(() => {
    if (!apiParams?.projectId) return Promise.resolve();

    const startDate = apiParams.startDate;
    const duration = apiParams.duration;
    const url = `/gantt/${apiParams.projectId}/chart-bar`;
    const queryParams = new URLSearchParams({
      startDate,
      duration: duration.toString(),
    }).toString();
    const requestKey = `${url}?${queryParams}`;

    return queryClient.invalidateQueries({
      predicate: query => {
        const queryKey = query.queryKey;
        return queryKey.includes(requestKey);
      },
    });
  }, [apiParams, queryClient]);

  const invalidateMountainChart = refetchMountainChart;

  const mountainChartData: MountainChartData | null = useMemo(() => {
    if (!apiData?.data?.items || apiData.data.items.length === 0) {
      return null;
    }

    const {items, averageTotalWorkforce, totalDays} = apiData.data;

    const dateMap = new Map<string, TMountainChartItemWorkforce>();
    items.forEach((item: TMountainChartItemWorkforce) => {
      dateMap.set(item.date, item);
    });

    const totalDaysInRange = baseProjectEnd.diff(baseProjectStart, 'day') + 1;
    const dailyLoads: DailyLoad[] = Array.from(
      {length: totalDaysInRange},
      (_, index) => {
        const currentDate = baseProjectStart.add(index, 'day');
        const dateStr = currentDate.format('YYYY-MM-DD');
        const apiItem = dateMap.get(dateStr);

        if (apiItem) {
          const statusCounts: Record<string, number> = {
            new: apiItem.statusWorkforce.new || 0,
            progress: apiItem.statusWorkforce.progress || 0,
            completed: apiItem.statusWorkforce.completed || 0,
            closed: apiItem.statusWorkforce.closed || 0,
          };

          return {
            date: dateStr,
            count: apiItem.totalWorkforce,
            statusCounts,
          };
        }

        return {
          date: dateStr,
          count: 0,
          statusCounts: {},
        };
      },
    );

    const maxCount = Math.max(
      ...dailyLoads.map((load: DailyLoad) => load.count),
      0,
    );

    return {
      dailyLoads,
      maxCount,
      averageTotalWorkforce,
      totalDays: totalDaysInRange,
    };
  }, [apiData, baseProjectStart, baseProjectEnd]);

  const statistics = useMemo(() => {
    if (!mountainChartData) {
      return {
        peakWorkforce: 0,
        averageWorkforce: 0,
        minWorkforce: 0,
        totalWorkDays: 0,
      };
    }

    const {dailyLoads, averageTotalWorkforce} = mountainChartData;
    const workforceCounts = dailyLoads.map(load => load.count);

    return {
      peakWorkforce: Math.max(...workforceCounts, 0),
      averageWorkforce: averageTotalWorkforce,
      minWorkforce: Math.min(...workforceCounts.filter(c => c > 0), 0),
      totalWorkDays: dailyLoads.filter(load => load.count > 0).length,
    };
  }, [mountainChartData]);

  // Get data for a specific date
  const getDataForDate = useMemo(() => {
    if (!mountainChartData) return (): DailyLoad | null => null;

    const dataMap = new Map(
      mountainChartData.dailyLoads.map((load: DailyLoad) => [load.date, load]),
    );

    return (date: string): DailyLoad | null => dataMap.get(date) || null;
  }, [mountainChartData]);

  return {
    data: mountainChartData,
    isLoading,
    statistics,
    getDataForDate,
    hasData: !!mountainChartData && mountainChartData.dailyLoads.length > 0,
    refetch: refetchMountainChart,
    invalidate: invalidateMountainChart,
  };
}
