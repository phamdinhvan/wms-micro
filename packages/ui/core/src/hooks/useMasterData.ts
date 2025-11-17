import {useAppQuery} from './useAppQuery';

// Master data query options
export interface MasterDataQueryOptions {
  contextKey?: string; // Optional filter
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
  retry?: number;
}

/**
 * Hook to get users from /external/users API
 * @param options Query options including optional contextKey filter
 */
export function useGetUsers(options: MasterDataQueryOptions = {}) {
  const {
    contextKey,
    enabled = true,
    staleTime,
    refetchInterval,
    retry,
  } = options;

  const queryParams: Record<string, string> = {};
  if (contextKey) {
    queryParams.contractId = contextKey;
  }

  return useAppQuery({
    key: 'externalUsers',
    url: {
      baseUrl: '/external/users',
      queryParams,
    },
    options: {
      enabled,
      staleTime: staleTime || 5 * 60 * 1000, // 5 minutes default
    },
    retry: retry || 1,
    refetchInterval: refetchInterval || false,
  });
}

/**
 * Hook to get status list from /external/status API
 * @param options Query options including optional contextKey filter
 */
export function useGetStatus(options: MasterDataQueryOptions = {}) {
  const {
    contextKey,
    enabled = true,
    staleTime,
    refetchInterval,
    retry,
  } = options;

  const queryParams: Record<string, string> = {};
  if (contextKey) {
    queryParams.contextKey = contextKey;
  }

  return useAppQuery({
    key: 'externalStatus',
    url: {
      baseUrl: '/external/status',
      queryParams,
    },
    options: {
      enabled,
      staleTime: staleTime || 5 * 60 * 1000, // 5 minutes default
    },
    retry: retry || 1,
    refetchInterval: refetchInterval || false,
  });
}

/**
 * Hook to get custom field types from /gantt/custom-field-types API
 * @param options Query options including optional contextKey filter
 */
export function useGetCustomFieldTypes(options: MasterDataQueryOptions = {}) {
  const {
    contextKey,
    enabled = true,
    staleTime,
    refetchInterval,
    retry,
  } = options;

  const queryParams: Record<string, string> = {};
  if (contextKey) {
    queryParams.contextKey = contextKey;
  }

  return useAppQuery({
    key: 'ganttCustomFieldTypes',
    url: {
      baseUrl: '/gantt/custom-field-types',
      queryParams,
    },
    options: {
      enabled,
      staleTime: staleTime || 5 * 60 * 1000, // 5 minutes default
    },
    retry: retry || 1,
    refetchInterval: refetchInterval || false,
  });
}

// Add more specific hooks here as needed
// Example: useGetCategories, useGetRoles, etc.
