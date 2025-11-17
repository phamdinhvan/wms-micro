'use client';

import {useCallback, useEffect, useState} from 'react';

export interface NavigationOptions {
  replace?: boolean; // Sử dụng replaceState thay vì pushState
  reload?: boolean; // Force page reload instead of SPA navigation
}

export interface SmartBackOptions {
  defaultPath?: string; // Fallback path nếu không có history
  fallbackPaths?: {
    // Smart fallback dựa trên current path pattern
    [currentPathPattern: string]: string;
  };
}

export interface UseNavigationReturn {
  currentPath: string;
  navigate: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  smartBack: (options?: SmartBackOptions) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  navigationHistory: string[];
}

/**
 * Custom hook để quản lý navigation với window.history API
 *
 * @example
 * ```tsx
 * const {navigate, goBack, currentPath} = useNavigation();
 *
 * // SPA navigation (default)
 * navigate('/projects');
 * navigate('/projects/123/update');
 * navigate('/projects/create');
 *
 * // Force page reload
 * navigate('/projects', { reload: true });
 * navigate('/projects/create', { reload: true });
 *
 * // Replace current history entry
 * navigate('/projects', { replace: true });
 *
 * // Quay lại
 * goBack();
 * ```
 */
export function useNavigation(): UseNavigationReturn {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [historyLength, setHistoryLength] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.history.length;
    }
    return 1;
  });

  // Track navigation history trong session
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('wms-navigation-history');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [window.location.pathname];
        }
      }
      return [window.location.pathname];
    }
    return ['/'];
  });

  // Theo dõi thay đổi URL từ browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
      setHistoryLength(window.history.length);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync currentPath với actual window.location - check periodically
  useEffect(() => {
    const syncPath = () => {
      const actualPath = window.location.pathname;
      if (actualPath !== currentPath) {
        setCurrentPath(actualPath);
      }
    };

    // Check periodically for path changes
    const interval = setInterval(syncPath, 50); // Check every 50ms
    
    // Also check on focus/visibility change
    window.addEventListener('focus', syncPath);
    document.addEventListener('visibilitychange', syncPath);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncPath);
      document.removeEventListener('visibilitychange', syncPath);
    };
  }, [currentPath]);

  // Hàm navigate chính
  const navigate = useCallback(
    (path: string, options: NavigationOptions = {}) => {
      const {replace = false, reload = false} = options;

      // Force page reload if reload option is true
      if (reload) {
        window.location.href = path;
        return;
      }

      if (path === currentPath) {
        // Nếu path giống nhau thì không làm gì
        return;
      }

      try {
        if (replace) {
          // Thay thế entry hiện tại trong history
          window.history.replaceState(null, '', path);
          // Update history tracking - replace current entry
          setNavigationHistory(prev => {
            const newHistory = [...prev];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = path;
            } else {
              newHistory.push(path);
            }
            sessionStorage.setItem(
              'wms-navigation-history',
              JSON.stringify(newHistory),
            );
            return newHistory;
          });
        } else {
          // Thêm entry mới vào history
          window.history.pushState(null, '', path);
          setHistoryLength(prev => prev + 1);
          // Add to navigation history tracking
          setNavigationHistory(prev => {
            const newHistory = [...prev, path];
            // Keep only last 10 entries to prevent memory issues
            if (newHistory.length > 10) {
              newHistory.shift();
            }
            sessionStorage.setItem(
              'wms-navigation-history',
              JSON.stringify(newHistory),
            );
            return newHistory;
          });
        }

        setCurrentPath(path);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to location.href nếu pushState/replaceState fail
        window.location.href = path;
      }
    },
    [currentPath],
  );

  // Quay lại trang trước
  const goBack = useCallback(() => {
    try {
      window.history.back();
    } catch (error) {
      console.error('Go back error:', error);
    }
  }, []);

  // Kiểm tra có thể quay lại không
  const canGoBack = historyLength > 1;

  // Smart back với fallback logic
  const smartBack = useCallback(
    (options: SmartBackOptions = {}) => {
      const {defaultPath, fallbackPaths} = options;

      // Kiểm tra có thể back trong browser history không
      if (canGoBack && navigationHistory.length > 1) {
        // Có history, sử dụng browser back
        goBack();
        return;
      }

      // Không có history, sử dụng smart fallback
      let targetPath = defaultPath;

      // Smart fallback dựa trên current path pattern
      if (fallbackPaths && currentPath) {
        // Check exact match first
        if (fallbackPaths[currentPath]) {
          targetPath = fallbackPaths[currentPath];
        } else {
          // Check pattern matches
          for (const [pattern, fallback] of Object.entries(fallbackPaths)) {
            // Simple pattern matching: /projects/{projectId}/update -> /projects/123/update
            const regex = new RegExp(pattern.replace(/\{[^}]+\}/g, '[^/]+'));
            if (regex.test(currentPath)) {
              targetPath = fallback;
              break;
            }
          }
        }
      }

      // Navigate to target path or default
      if (targetPath) {
        navigate(targetPath);
      } else {
        // Last resort: try browser back anyway
        goBack();
      }
    },
    [canGoBack, navigationHistory, goBack, currentPath, navigate],
  );

  // Tiến tới trang sau
  const goForward = useCallback(() => {
    try {
      window.history.forward();
    } catch (error) {
      console.error('Go forward error:', error);
    }
  }, []);

  // Kiểm tra có thể tiến tới không (khó xác định chính xác)
  const canGoForward = false; // Browser không cung cấp API để check này

  return {
    currentPath,
    navigate,
    goBack,
    smartBack,
    canGoBack,
    canGoForward,
    navigationHistory,
  };
}

/**
 * Hook helper để tạo navigation functions cho project routes
 */
export function useProjectNavigation() {
  const {navigate, goBack, currentPath} = useNavigation();

  const navigateToList = useCallback(() => {
    navigate('/projects');
  }, [navigate]);

  const navigateToCreate = useCallback(() => {
    navigate('/projects/create');
  }, [navigate]);

  const navigateToEdit = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}/update`);
    },
    [navigate],
  );

  const navigateToDetail = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}/detail`);
    },
    [navigate],
  );

  const navigateToView = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}`);
    },
    [navigate],
  );

  return {
    currentPath,
    navigate,
    goBack,
    navigateToList,
    navigateToCreate,
    navigateToEdit,
    navigateToDetail,
    navigateToView,
  };
}
