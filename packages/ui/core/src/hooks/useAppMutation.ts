'use client';

import {
  MutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {AxiosRequestConfig} from 'axios';
import {appConfig} from '../config/appConfig';
import {API_URL} from '../constants/common';
import {useTranslation} from '../i18n';
import {useAppCredentialsSafe} from '../providers/AppCredentialsProvider';
import {ApiMutationType} from '../types/mutation';
import {CommonUtils} from '../utils/common';
import HttpWithCredentials from '../utils/httpWithCredentials';

const objectToFormData = (obj: any): FormData => {
  const formData = new FormData();

  for (const key in obj) {
    if (obj?.hasOwnProperty(key)) {
      const value = obj[key];

      if (value instanceof File) {
        formData?.append(key, value);
      } else if (Array?.isArray(value)) {
        value?.forEach((item, index) => {
          if (item instanceof File) {
            formData?.append(`${key}[${index}]`, item);
          } else {
            formData?.append(`${key}[${index}]`, item?.toString());
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        for (const nestedKey in value) {
          if (value?.hasOwnProperty(nestedKey)) {
            const nestedValue = value[nestedKey];
            if (nestedValue instanceof File) {
              formData?.append(`${key}[${nestedKey}]`, nestedValue);
            } else {
              formData?.append(`${key}[${nestedKey}]`, nestedValue?.toString());
            }
          }
        }
      } else {
        formData?.append(key, value ? value?.toString() : '');
      }
    }
  }

  return formData;
};

export const useAppMutation = <T extends keyof ApiMutationType>(
  _key: T,
  options?: {
    config?: AxiosRequestConfig;
    mutationOptions?: MutationOptions<
      ApiMutationType[T]['response'],
      unknown,
      Omit<ApiMutationType[T], 'response'> & {isFormData?: boolean},
      unknown
    >;
    signal?: AbortSignal;
    responseType?: XMLHttpRequestResponseType;
  },
  isFile?: boolean,
  isArrayParams?: boolean,
) => {
  const queryClient = useQueryClient();
  const {t} = useTranslation('gantt');

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
  const mutation = useMutation(
    {
      mutationKey: [_key, credentialsKey],
      mutationFn: async ({
        method,
        url,
        isFormData,
        ...rest
      }: Omit<ApiMutationType[T], 'response'> & {
        isFormData?: boolean;
      }): Promise<ApiMutationType[T]['response']> => {
        const http = new HttpWithCredentials(
          baseURL,
          false,
          t,
          credentials.appId,
          credentials.code,
        ).instance;
        const headers = {
          ...(options?.config?.headers || {}),
          ...(isFormData ? {'Content-Type': 'multipart/form-data'} : {}),
        };
        const queryParams = isArrayParams
          ? CommonUtils.parseQueryParams((url as any)?.queryParams)
          : new URLSearchParams((url as any)?.queryParams).toString();

        const _url = CommonUtils.replaceDynamicValues(
          url.baseUrl,
          (url as any)?.urlParams || {},
        );
        const requestKey = `${_url}${queryParams ? `?${queryParams}` : ''}`;
        if (method !== 'get') {
          const response = await http[method](
            requestKey,
            isFormData
              ? objectToFormData((rest as any).payload)
              : (rest as any).payload,
            {
              ...options?.config,
              headers,
              signal: options?.signal,
            },
          );
          return isFile ? response : response.data;
        } else {
          const response = await http[method](requestKey, {
            ...options?.config,
            headers,
            responseType: options?.responseType,
            signal: options?.signal,
          });
          return isFile ? response : response.data;
        }
      },
      ...options?.mutationOptions,
    },
    queryClient,
  );

  return mutation;
};
