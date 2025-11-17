'use client';

import {useCallback, useEffect} from 'react';

// Constants
const STORAGE_KEY = 'listNavigationCache';
const NAVIGATION_STACK_KEY = 'navigationStack';
const NAVIGATION_STACK_LIMIT = 10;

// Types
interface NavigationStackItem {
  url: string;
  listPath: string;
  context?: string;
  timestamp: number;
  fromPath?: string;
  pageType: 'list' | 'detail' | 'form';
}

interface UseListNavigationOptions {
  listPath: string;
  sourceContext?: string;
  defaultBackUrl?: string;
}

interface NavigationStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
}

// Storage abstraction for better testability
const createStorage = (): NavigationStorage => ({
  get: (key: string) => {
    try {
      return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
      }
    } catch {
      // Silently fail if storage is not available
    }
  },
  remove: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch {
      // Silently fail if storage is not available
    }
  },
});

// Utility functions
const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getCurrentUrl = (pathname?: string, searchParams?: string): string => {
  if (typeof window === 'undefined') return '';
  
  const currentPathname = pathname || window.location.pathname;
  const currentSearch = searchParams || window.location.search;
  
  return `${currentPathname}${currentSearch}`;
};

/**
 * Enhanced navigation hook for managing list navigation with back functionality
 */
export const useListNavigation = ({
  listPath,
  sourceContext,
  defaultBackUrl,
}: UseListNavigationOptions) => {
  const storage = createStorage();

  // Clean up cache for different list paths
  useEffect(() => {
    const cachedData = storage.get(STORAGE_KEY);
    if (cachedData) {
      const parsed = parseJSON(cachedData, null);
      if (parsed?.listPath && parsed.listPath !== listPath) {
        storage.remove(STORAGE_KEY);
      }
    }
  }, [listPath, storage]);

  // Push navigation context to stack
  const pushNavigationContext = useCallback(
    (
      pageType: 'list' | 'detail' | 'form' = 'list',
      customUrl?: string,
      context?: string,
    ) => {
      const currentUrl = customUrl || getCurrentUrl();
      const stackData = storage.get(NAVIGATION_STACK_KEY);
      const stack: NavigationStackItem[] = parseJSON(stackData, []);

      // Avoid duplicate entries
      const latestEntry = stack[stack.length - 1];
      if (latestEntry?.url === currentUrl) {
        return;
      }

      // Filter existing list entries for the same listPath
      let filteredStack = stack;
      if (pageType === 'list') {
        filteredStack = stack.filter(
          item => !(item.listPath === listPath && item.pageType === 'list'),
        );
      }

      // Add new item
      const newItem: NavigationStackItem = {
        url: currentUrl,
        listPath,
        context: context || sourceContext,
        timestamp: Date.now(),
        fromPath: typeof window !== 'undefined' ? window.location.pathname : '',
        pageType,
      };

      filteredStack.push(newItem);

      // Limit stack size
      if (filteredStack.length > NAVIGATION_STACK_LIMIT) {
        filteredStack.shift();
      }

      storage.set(NAVIGATION_STACK_KEY, JSON.stringify(filteredStack));
    },
    [listPath, sourceContext, storage],
  );

  // Store current URL with filters (for list pages)
  const storeCurrentUrl = useCallback(
    (customUrl?: string, searchParams?: string) => {
      const url = customUrl || getCurrentUrl(listPath, searchParams);
      const cacheData = {
        listPath,
        url,
        timestamp: Date.now(),
      };
      
      storage.set(STORAGE_KEY, JSON.stringify(cacheData));
      pushNavigationContext('list', url);
    },
    [listPath, storage, pushNavigationContext],
  );

  // Store detail page URL
  const storeDetailUrl = useCallback(
    (detailUrl?: string) => {
      const url = detailUrl || getCurrentUrl();
      pushNavigationContext('detail', url);
    },
    [pushNavigationContext],
  );

  // Pop from navigation stack
  const popNavigationContext = useCallback(() => {
    const stackData = storage.get(NAVIGATION_STACK_KEY);
    if (!stackData) return;

    const stack: NavigationStackItem[] = parseJSON(stackData, []);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    const filteredStack = stack.filter(item => item.fromPath !== currentPath);
    
    if (filteredStack.length !== stack.length) {
      storage.set(NAVIGATION_STACK_KEY, JSON.stringify(filteredStack));
    }
  }, [storage]);

  // Get nearest back URL from navigation stack
  const getNearestBackUrl = useCallback(
    (currentPagePath?: string) => {
      // Check navigation stack first
      const stackData = storage.get(NAVIGATION_STACK_KEY);
      if (stackData) {
        const stack: NavigationStackItem[] = parseJSON(stackData, []);
        const currentFullUrl = getCurrentUrl();

        // Find the most recent valid URL
        for (let i = stack.length - 1; i >= 0; i--) {
          const item = stack[i];

          // Skip if matches current page path
          if (currentPagePath && item.url.includes(currentPagePath)) {
            continue;
          }

          // Skip current URL
          if (item.url === currentFullUrl) {
            continue;
          }

          return item.url;
        }
      }

      // Fallback to cached list URL
      const cachedData = storage.get(STORAGE_KEY);
      if (cachedData) {
        const parsed = parseJSON(cachedData, null);
        if (parsed?.url && parsed.listPath === listPath) {
          return parsed.url;
        }
      }

      // Final fallback
      return defaultBackUrl || listPath;
    },
    [listPath, defaultBackUrl, storage],
  );

  // Simple back URL getter
  const getBackUrl = useCallback(() => {
    return getNearestBackUrl();
  }, [getNearestBackUrl]);

  return {
    storeCurrentUrl,
    storeDetailUrl,
    pushNavigationContext,
    popNavigationContext,
    getBackUrl,
    getNearestBackUrl,
  };
};

/**
 * Enhanced hook for detail pages with back navigation handling
 */
export const useDetailPageNavigation = (options: UseListNavigationOptions) => {
  const navigation = useListNavigation(options);

  // Handle back navigation with cleanup
  const handleBackClick = useCallback(
    (router: {push: (url: string) => void} | null, currentPagePath?: string) => {
      const backUrl = navigation.getNearestBackUrl(currentPagePath);

      // Clean up navigation stack
      const storage = createStorage();
      const stackData = storage.get(NAVIGATION_STACK_KEY);
      if (stackData) {
        const stack: NavigationStackItem[] = parseJSON(stackData, []);
        const cleanedStack = stack.filter(item => item.url !== backUrl);
        storage.set(NAVIGATION_STACK_KEY, JSON.stringify(cleanedStack));
      }

      // Navigate
      if (router?.push) {
        router.push(backUrl);
      } else if (typeof window !== 'undefined') {
        window.location.href = backUrl;
      }
    },
    [navigation],
  );

  return {
    ...navigation,
    handleBackClick,
  };
};

// Export types for external use
export type {UseListNavigationOptions, NavigationStackItem};
