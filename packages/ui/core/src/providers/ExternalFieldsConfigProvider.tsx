'use client';

import React, {createContext, ReactNode, useContext} from 'react';
import {EnhancedExternalFieldConfig} from '../types/externalFieldsAPI';

type ExternalFieldsConfigContextType = {
  taskFieldsConfig?: Record<string, EnhancedExternalFieldConfig>;
  projectFieldsConfig?: Record<string, EnhancedExternalFieldConfig>;
};

const ExternalFieldsConfigContext = createContext<
  ExternalFieldsConfigContextType | undefined
>(undefined);

type ExternalFieldsConfigProviderProps = {
  children: ReactNode;
  taskFieldsConfig?: Record<string, EnhancedExternalFieldConfig>;
  projectFieldsConfig?: Record<string, EnhancedExternalFieldConfig>;
};

/**
 * Provider để cung cấp external fields config cho toàn bộ app
 * Usage:
 * <ExternalFieldsConfigProvider taskFieldsConfig={myConfig}>
 *   <App />
 * </ExternalFieldsConfigProvider>
 */
export function ExternalFieldsConfigProvider({
  children,
  taskFieldsConfig,
  projectFieldsConfig,
}: ExternalFieldsConfigProviderProps): JSX.Element {
  return (
    <ExternalFieldsConfigContext.Provider
      value={{
        taskFieldsConfig,
        projectFieldsConfig,
      }}>
      {children}
    </ExternalFieldsConfigContext.Provider>
  );
}

/**
 * Hook để lấy toàn bộ config
 */
export function useExternalFieldsConfig(): ExternalFieldsConfigContextType {
  const context = useContext(ExternalFieldsConfigContext);
  if (context === undefined) {
    return {
      taskFieldsConfig: undefined,
      projectFieldsConfig: undefined,
    };
  }
  return context;
}

/**
 * Hook để lấy task fields config
 */
export function useTaskFieldsConfig(): Record<string, EnhancedExternalFieldConfig> | undefined {
  const {taskFieldsConfig} = useExternalFieldsConfig();
  return taskFieldsConfig;
}

/**
 * Hook để lấy project fields config
 */
export function useProjectFieldsConfig(): Record<string, EnhancedExternalFieldConfig> | undefined {
  const {projectFieldsConfig} = useExternalFieldsConfig();
  return projectFieldsConfig;
}
