'use client';

import {useCallback, useEffect, useState} from 'react';

interface SearchParams {
  pCompany: string | null;
  pCompanyName: string | null;
  pPage: string | null;
  pPageSize: string | null;
  pSearch: string | null;
  pRole: string | null;
  pIsAuth: string | null;
  pType: string;
  pStatus: string | null;
  pView: string | null;
  pPriority: string | null;
  pDate: string | null;
  pCode: string | null;
  pSessionState: string | null;
  pSession: string | null;
  pState: string | null;
  pTab: string | null;
  pCategory: string | null;
  pMonth: string | null;
  pYear: string | null;
  pAssignee: string | null;
  pReferer: string | null;
  pCreatedAtTo: string | null;
  pCreatedAtFrom: string | null;
  pEndDateTo: string | null;
  pEndDateFrom: string | null;
  pVersion: string | null;
  pRedirectUrl: string | null;
  pFromReportDatetime: string | null;
  pToReportDatetime: string | null;
  pCategories: string[] | null;
  pStatuses: string[] | null;
  pPriorities: string[] | null;
  pAssignees: string[] | null;
  pFromDate: string | null;
  pToDate: string | null;
  pSortField: string | null;
  pSortType: string | null;
  pMode: string | null;
  pContractStatus: string | null;
  pOtt: string | null;
  pIsTempPassword: string | null;
  pStartDate: string | null;
  pEndDate: string | null;
  pFrom: string | null;
  pTo: string | null;
  pProjectId: string | null;
  pTaskId: string | null;
  pMountainChart: string | null;
}

const getQueryParams = (searchParams: URLSearchParams): SearchParams => ({
  pCompany: searchParams.get('company'),
  pCompanyName: searchParams.get('companyName'),
  pPage: searchParams.get('page'),
  pPageSize: searchParams.get('pageSize'),
  pSearch: searchParams.get('search'),
  pRole: searchParams.get('role'),
  pIsAuth: searchParams.get('hasPwSet'),
  pType: searchParams.get('type') ?? '',
  pStatus: searchParams.get('status'),
  pView: searchParams.get('view'),
  pPriority: searchParams.get('priority'),
  pDate: searchParams.get('date'),
  pCode: searchParams.get('code'),
  pSessionState: searchParams.get('session_state'),
  pSession: searchParams.get('session'),
  pState: searchParams.get('state'),
  pTab: searchParams.get('tab'),
  pCategory: searchParams.get('categories'),
  pMonth: searchParams.get('month'),
  pYear: searchParams.get('year'),
  pAssignee: searchParams.get('assignee'),
  pReferer: searchParams.get('referer'),
  pCreatedAtTo: searchParams.get('createdAtTo'),
  pCreatedAtFrom: searchParams.get('createdAtFrom'),
  pEndDateTo: searchParams.get('endDateTo'),
  pEndDateFrom: searchParams.get('endDateFrom'),
  pVersion: searchParams.get('version'),
  pRedirectUrl: searchParams.get('redirect_url'),
  pFromReportDatetime: searchParams.get('fromReportDatetime'),
  pToReportDatetime: searchParams.get('toReportDatetime'),
  pCategories: searchParams.getAll('categories'),
  pStatuses: searchParams.getAll('status'),
  pPriorities: searchParams.getAll('priority'),
  pAssignees: searchParams.getAll('assignee'),
  pFromDate: searchParams.get('fromDate'),
  pToDate: searchParams.get('toDate'),
  pSortField: searchParams.get('sortField'),
  pSortType: searchParams.get('sortType'),
  pMode: searchParams.get('mode'),
  pContractStatus: searchParams.get('contractStatus'),
  pOtt: searchParams.get('ott'),
  pIsTempPassword: searchParams.get('isTempPassword'),
  pStartDate: searchParams.get('startDate'),
  pEndDate: searchParams.get('endDate'),
  pFrom: searchParams.get('from'),
  pTo: searchParams.get('to'),
  pProjectId: searchParams.get('projectId'),
  pTaskId: searchParams.get('taskId'),
  pMountainChart: searchParams.get('mountainChart'),
});

export const useControlParams = () => {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search),
  );

  const [queryParams, setQueryParams] = useState<SearchParams>(() =>
    getQueryParams(searchParams),
  );

  // Listen for browser navigation events (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const newSearchParams = new URLSearchParams(window.location.search);
      setSearchParams(newSearchParams);
      setQueryParams(getQueryParams(newSearchParams));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setQueryParams(getQueryParams(searchParams));
  }, [searchParams]);

  const replaceParams = useCallback(
    (paramsToUpdate: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach(v => {
            params.append(key, v);
          });
        } else if (value || value == 'false') {
          params.set(key, value);
        }
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
      setSearchParams(params);
    },
    [searchParams],
  );

  const clearParams = useCallback(() => {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    setSearchParams(new URLSearchParams());
  }, []);

  return {searchParams, queryParams, replaceParams, clearParams};
};
