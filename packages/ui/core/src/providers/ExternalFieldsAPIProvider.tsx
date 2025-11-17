/**
 * External Fields API Provider
 * Manages runtime state, data fetching, and sourceDataMap for enhanced external fields
 */

'use client';

import {createContext, useCallback, useContext, useRef, useState} from 'react';
import {
  EnhancedExternalFieldsConfig,
  ExternalFieldsAPIContextValue,
  FieldDataConfig,
  FieldDataResult,
  FieldRuntimeState,
  FieldsRuntimeState,
  SelectOption,
} from '../types/externalFieldsAPI';

// ============================================================================
// Context
// ============================================================================

const ExternalFieldsAPIContext =
  createContext<ExternalFieldsAPIContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface Props {
  config: EnhancedExternalFieldsConfig;
  children: React.ReactNode;
}

export function ExternalFieldsAPIProvider({config, children}: Props) {
  const [runtimeState, setRuntimeState] = useState<FieldsRuntimeState>({});
  const [sourceDataMap, setSourceDataMap] = useState<
    Record<string, Record<string, any>>
  >(config.sourceDataMap || {});

  // Cache for fetched data
  const cacheRef = useRef<
    Record<string, {data: SelectOption[]; timestamp: number}>
  >({});

  // Track pending requests to prevent duplicate concurrent calls (React Strict Mode protection)
  const pendingRequestsRef = useRef<Record<string, Promise<SelectOption[]>>>(
    {},
  );

  /**
   * Update source data map
   */
  const updateSourceDataMap = useCallback(
    (dataKey: string, data: Record<string, any>) => {
      setSourceDataMap(prev => ({
        ...prev,
        [dataKey]: {...prev[dataKey], ...data},
      }));
    },
    [],
  );

  /**
   * Fetch field data
   */
  const fetchFieldData = useCallback(
    async <TParams = any,>(
      fieldKey: string,
      dataConfig: FieldDataConfig<TParams>,
      params?: TParams,
    ): Promise<SelectOption[]> => {
      const {renderData, cacheDuration = 300000, dataKey} = dataConfig;

      // Check cache
      const cacheKey = `${fieldKey}:${JSON.stringify(params)}`;
      const cached = cacheRef.current[cacheKey];

      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
      }

      // ✅ Check if there's already a pending request for this field
      if (pendingRequestsRef.current[cacheKey]) {
        return pendingRequestsRef.current[cacheKey];
      }

      // Set loading state
      setRuntimeState(prev => ({
        ...prev,
        [fieldKey]: {...prev[fieldKey], loading: true, error: undefined},
      }));

      // Create and track the pending request
      const fetchPromise = (async () => {
        try {
          // Call renderData
          const result = await renderData(params);

          let options: SelectOption[];
          let fullData: Record<string, any> | undefined;

          // Handle result
          if (Array.isArray(result)) {
            options = result;
          } else {
            const dataResult = result as FieldDataResult;
            options = dataResult.options;
            fullData = dataResult.data;

            // Populate sourceDataMap with full data
            if (fullData && dataKey) {
              updateSourceDataMap(dataKey, fullData);
            }
          }

          // Cache the result
          cacheRef.current[cacheKey] = {data: options, timestamp: Date.now()};

          // Update runtime state
          setRuntimeState(prev => ({
            ...prev,
            [fieldKey]: {
              ...prev[fieldKey],
              options,
              loading: false,
              lastFetched: Date.now(),
            },
          }));

          return options;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch data';

          setRuntimeState(prev => ({
            ...prev,
            [fieldKey]: {
              ...prev[fieldKey],
              loading: false,
              error: errorMessage,
            },
          }));

          console.error(
            `[APIProvider] ❌ Failed to fetch data for ${fieldKey}:`,
            error,
          );
          return [];
        } finally {
          // ✅ Clean up pending request after completion
          delete pendingRequestsRef.current[cacheKey];
        }
      })();

      // ✅ Track the pending request
      pendingRequestsRef.current[cacheKey] = fetchPromise;

      return fetchPromise;
    },
    [updateSourceDataMap],
  );

  /**
   * Update runtime state for a field
   */
  const updateRuntimeState = useCallback(
    (fieldKey: string, state: Partial<FieldRuntimeState>) => {
      setRuntimeState(prev => ({
        ...prev,
        [fieldKey]: {...prev[fieldKey], ...state},
      }));
    },
    [],
  );

  return (
    <ExternalFieldsAPIContext.Provider
      value={{
        config,
        runtimeState,
        sourceDataMap,
        fetchFieldData,
        updateRuntimeState,
        updateSourceDataMap,
      }}>
      {children}
    </ExternalFieldsAPIContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useExternalFieldsAPI(): ExternalFieldsAPIContextValue {
  const context = useContext(ExternalFieldsAPIContext);
  if (!context) {
    throw new Error(
      'useExternalFieldsAPI must be used within ExternalFieldsAPIProvider',
    );
  }
  return context;
}
