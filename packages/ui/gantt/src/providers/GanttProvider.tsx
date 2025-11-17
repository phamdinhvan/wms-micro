import {MantineProvider} from '@mantine/core';
import {Notifications} from '@mantine/notifications';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GanttEventCallbacks} from '@wms/core';
import React, {createContext, ReactNode, useContext} from 'react';

// Configuration interface for the Gantt library
export interface GanttConfig {
  // API Configuration
  apiBaseUrl: string;
  apiHeaders?: Record<string, string>;

  // Authentication
  authToken?: string;
  authType?: 'Bearer' | 'Basic' | 'Custom';

  // App Configuration
  appId: string;

  // Event Callbacks
  eventCallbacks?: GanttEventCallbacks;

  // UI Configuration
  theme?: {
    colors?: Record<string, string>;
    rowHeight?: number;
    headerHeight?: number;
  };

  // Feature Flags
  features?: {
    enableDragDrop?: boolean;
    enableTaskCreation?: boolean;
    enableTaskEditing?: boolean;
    enableExternalLinking?: boolean;
  };
}

// Default configuration
const defaultConfig: Partial<GanttConfig> = {
  theme: {
    rowHeight: 40,
    headerHeight: 50,
  },
  features: {
    enableDragDrop: true,
    enableTaskCreation: true,
    enableTaskEditing: true,
    enableExternalLinking: true,
  },
};

// Context for Gantt configuration
const GanttConfigContext = createContext<GanttConfig | null>(null);

// Hook to use Gantt configuration
export const useGanttConfig = (): GanttConfig => {
  const config = useContext(GanttConfigContext);
  if (!config) {
    throw new Error('useGanttConfig must be used within a GanttProvider');
  }
  return config;
};

// Provider component props
interface GanttProviderProps {
  config: GanttConfig;
  children: ReactNode;
  queryClient?: QueryClient;
}

/**
 * GanttProvider - Main provider component for the Gantt library
 *
 * This component sets up all necessary providers and configuration
 * for the Gantt chart to work with external APIs and systems.
 *
 * @example
 * ```tsx
 * import { GanttProvider, GanttChart } from '@your-org/gantt';
 *
 * const config = {
 *   apiBaseUrl: 'https://your-api.com',
 *   appId: 'your-app-id',
 *   authToken: 'your-auth-token',
 *   eventCallbacks: {
 *     onTaskEvent: (event) => console.log('Task event:', event),
 *     onTaskSelect: (task) => console.log('Task selected:', task),
 *   }
 * };
 *
 * function App() {
 *   return (
 *     <GanttProvider config={config}>
 *       <GanttChart projectId="project-123" />
 *     </GanttProvider>
 *   );
 * }
 * ```
 */
export const GanttProvider: React.FC<GanttProviderProps> = ({
  config,
  children,
  queryClient,
}) => {
  // Merge with default configuration
  const mergedConfig: GanttConfig = {
    ...defaultConfig,
    ...config,
    theme: {
      ...defaultConfig.theme,
      ...config.theme,
    },
    features: {
      ...defaultConfig.features,
      ...config.features,
    },
  };

  // Create default QueryClient if not provided
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  const clientToUse = queryClient || defaultQueryClient;

  return (
    <GanttConfigContext.Provider value={mergedConfig}>
      <QueryClientProvider client={clientToUse}>
        <MantineProvider>
          <Notifications />
          {children}
        </MantineProvider>
      </QueryClientProvider>
    </GanttConfigContext.Provider>
  );
};

// Export types for external use
// Note: GanttConfig is exported from index.ts to avoid duplicate exports
