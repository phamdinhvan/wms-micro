'use client';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {appConfig} from '../config/appConfig';

export interface AppCredentials {
  appId?: string;
  code?: string;
}

interface AppCredentialsContextType {
  credentials: AppCredentials;
  setCredentials: (credentials: AppCredentials) => void;
}

const AppCredentialsContext = createContext<AppCredentialsContextType | null>(
  null,
);

export interface AppCredentialsProviderProps {
  children: ReactNode;
  appId?: string;
  code?: string;
}

export function AppCredentialsProvider({
  children,
  appId,
  code,
}: AppCredentialsProviderProps) {
  // Use state to allow dynamic updates from appConfig
  const [credentials, setCredentials] = useState<AppCredentials>({appId, code});

  // Sync with appConfig when it gets initialized
  useEffect(() => {
    let hasSync = false; // Prevent multiple syncs

    const checkAppConfig = () => {
      if (!hasSync && appConfig.isInitialized()) {
        const configCredentials = appConfig.getCredentials();
        if (configCredentials.appId && configCredentials.code) {
          setCredentials(configCredentials);
          hasSync = true; // Mark as synced
          return true; // Signal success
        }
      }
      return false;
    };

    // Check immediately
    if (checkAppConfig()) return;

    // Also check periodically but stop when synced
    const interval = setInterval(() => {
      if (checkAppConfig()) {
        clearInterval(interval);
      }
    }, 50);

    // Cleanup after 1 second regardless
    setTimeout(() => clearInterval(interval), 1000);

    return () => clearInterval(interval);
  }, []);

  // Also update when props change
  useEffect(() => {
    if (appId || code) {
      setCredentials({appId, code});
    }
  }, [appId, code]);

  const updateCredentials = useCallback((newCredentials: AppCredentials) => {
    setCredentials(newCredentials);
  }, []);

  // Create a new context value object to ensure re-renders
  const contextValue = useMemo(
    () => ({
      credentials,
      setCredentials: updateCredentials,
    }),
    [credentials, updateCredentials],
  );

  return (
    <AppCredentialsContext.Provider value={contextValue}>
      {children}
    </AppCredentialsContext.Provider>
  );
}

export function useAppCredentials(): AppCredentialsContextType {
  const context = useContext(AppCredentialsContext);
  if (!context) {
    throw new Error(
      'useAppCredentials must be used within AppCredentialsProvider',
    );
  }
  return context;
}

// Hook to get credentials safely (returns empty object if no provider)
export function useAppCredentialsSafe(): AppCredentials {
  const context = useContext(AppCredentialsContext);
  const credentials = context?.credentials || {};

  return credentials;
}
