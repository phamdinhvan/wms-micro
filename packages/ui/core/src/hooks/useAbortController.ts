import { useRef } from "react";

export const useAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  const abort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  };

  const getSignal = () => {
    if (!controllerRef.current) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current.signal;
  };

  return {
    signal: getSignal(),
    abort,
  };
};
