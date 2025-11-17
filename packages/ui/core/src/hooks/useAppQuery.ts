import {
  Query,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import {ResponseType} from 'axios';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {appConfig} from '../config/appConfig';
import {API_URL} from '../constants';
import {useAppCredentialsSafe} from '../providers/AppCredentialsProvider';
import {ApiQueryType} from '../types';
import {CommonUtils} from '../utils';
import HttpWithCredentials from '../utils/httpWithCredentials';

// Define AppQueryOptions type
export type AppQueryOptions<T extends keyof ApiQueryType> = Omit<
  UseQueryOptions<ApiQueryType[T]['response']>,
  'queryFn' | 'queryKey'
> & {queryKey?: string[] | string};

export const useAppQuery = <T extends keyof ApiQueryType>({
  url,
  options,
  onSuccess,
  onError,
  responseType = 'json',
  retry,
  refetchInterval,
  isArrayParams = false,
}: Omit<ApiQueryType[T], 'response'> & {key: T} & {
  options?: AppQueryOptions<T>;
  onSuccess?: (data: ApiQueryType[T]['response']) => void;
  onError?: (error: any) => void;
  retry?: number;
  responseType?: ResponseType;
  refetchInterval?:
    | number
    | false
    | ((
        query: Query<
          ApiQueryType[T]['response'],
          Error,
          ApiQueryType[T]['response'],
          readonly unknown[]
        >,
      ) => number | false | undefined);

  isArrayParams?: boolean;
}) => {
  const queryClient = useQueryClient();

  // Try to get credentials from context first, then fallback to appConfig
  const contextCredentials = useAppCredentialsSafe();

  // Always get fresh config credentials (not cached)
  const configCredentials = appConfig.getCredentials();

  // Prefer context credentials, but fallback to config if context is empty
  const credentials =
    contextCredentials.appId && contextCredentials.code
      ? contextCredentials
      : configCredentials;

  // Force re-evaluation when credentials change by creating a dependency
  const credentialsKey = `${credentials.appId || 'no-app-id'}-${credentials.code || 'no-code'}`;
  const baseURL = appConfig.getApiUrl() || API_URL;
  const {t} = useTranslation('gantt');

  const http = new HttpWithCredentials(
    baseURL,
    false,
    t,
    credentials.appId,
    credentials.code,
  ).instance;

  const queryParams = isArrayParams
    ? CommonUtils.parseQueryParams((url as any)?.queryParams)
    : new URLSearchParams((url as any)?.queryParams).toString();

  const urlApi = `${CommonUtils.replaceDynamicValues(
    url.baseUrl,
    (url as any)?.urlParams || {},
  )}`;
  const requestKey = `${urlApi}${queryParams ? `?${queryParams}` : ''}`;

  // Force invalidate queries when credentials change
  useEffect(() => {
    if (credentials.appId && credentials.code) {
      queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = query.queryKey;
          return queryKey.includes(requestKey);
        },
      });
    }
  }, [credentialsKey, queryClient, requestKey]);

  const data = useQuery(
    {
      ...options,
      refetchInterval: refetchInterval,
      retry: retry || false,
      queryKey: [requestKey, options?.queryKey, credentialsKey].filter(Boolean),
      enabled: (() => {
        const isEnabled =
          options?.enabled !== false &&
          (!!credentials.appId || !!credentials.code);
        return isEnabled;
      })(), // ✅ Only enable when we have credentials
      queryFn: async (): Promise<ApiQueryType[T]['response']> => {
        try {
          const response = await http.get(urlApi, {
            params: (url as any)?.queryParams,
            responseType,
          });
          onSuccess?.(response.data);
          return response.data;
        } catch (error: any) {
          console.error('❌ API Query error:', {
            urlApi,
            error: error?.response?.data || error?.message || 'Unknown error',
            status: error?.response?.status,
            headers: error?.response?.headers,
          });
          onError?.(error);
          return Promise.reject(error);
        }
      },
    },
    queryClient,
  );

  return data;
};
