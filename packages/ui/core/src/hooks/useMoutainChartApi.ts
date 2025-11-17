import {ApiQueryType} from '../types';
import {useAppQuery} from './useAppQuery';

type GetMountainChartParams = {
  projectId: string;
  startDate: string;
  duration: number;
};

export const useGetMountainChart = (props: GetMountainChartParams) => {
  const {projectId, startDate, duration} = props;

  const queryParams: Record<string, any> = {};
  if (startDate) queryParams.startDate = startDate;
  if (duration) queryParams.duration = duration;

  const {data, isLoading} = useAppQuery({
    key: 'ganttMountainChart',
    url: {
      baseUrl: '/gantt/:projectId/chart-bar',
      urlParams: {projectId},
      queryParams,
    },
    options: {
      enabled: !!projectId && !!startDate,
    },
  });
  return {data, isLoading};
};
