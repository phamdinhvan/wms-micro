import {useCallback} from 'react';

type RouterBackOptions = {
  replace?: boolean;
};

const useRouterBack = () => {
  const back = useCallback((fallback: string, opts?: RouterBackOptions) => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      if (opts?.replace) {
        window.location.replace(fallback);
      } else {
        window.location.href = fallback;
      }
    }
  }, []);

  const canGoBack = window.history.length > 1;

  return {back, canGoBack};
};

export default useRouterBack;
