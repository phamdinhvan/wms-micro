import {useCallback, useEffect, useState} from 'react';

interface GanttParams {
  status: string | null;
  priority: string | null;
  assignee: string | null;
  category: string | null;
  view: string | null;
  search: string | null;
  startDate: string | null;
  endDate: string | null;
  projectId: string | null;
  taskId: string | null;
}

const getGanttParams = (searchParams: URLSearchParams): GanttParams => ({
  status: searchParams.get('status'),
  priority: searchParams.get('priority'),
  assignee: searchParams.get('assignee'),
  category: searchParams.get('category'),
  view: searchParams.get('view'),
  search: searchParams.get('search'),
  startDate: searchParams.get('startDate'),
  endDate: searchParams.get('endDate'),
  projectId: searchParams.get('projectId'),
  taskId: searchParams.get('taskId'),
});

export const useGanttParams = () => {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search),
  );

  const [params, setParams] = useState<GanttParams>(() =>
    getGanttParams(searchParams),
  );

  // Listen for browser navigation events (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const newSearchParams = new URLSearchParams(window.location.search);
      setSearchParams(newSearchParams);
      setParams(getGanttParams(newSearchParams));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update params when searchParams change
  useEffect(() => {
    setParams(getGanttParams(searchParams));
  }, [searchParams]);

  const updateParams = useCallback(
    (paramsToUpdate: Partial<GanttParams>, replace: boolean = true) => {
      const urlParams = new URLSearchParams(searchParams);

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          urlParams.delete(key);
        } else {
          urlParams.set(key, value);
        }
      });

      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

      if (replace) {
        window.history.replaceState({}, '', newUrl);
      } else {
        window.history.pushState({}, '', newUrl);
      }

      setSearchParams(urlParams);
    },
    [searchParams],
  );

  const clearParams = useCallback(() => {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    setSearchParams(new URLSearchParams());
  }, []);

  const getParam = useCallback(
    (key: keyof GanttParams): string | null => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  return {
    params,
    updateParams,
    clearParams,
    getParam,
    searchParams,
  };
};
