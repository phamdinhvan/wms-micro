import {useEffect, useRef, useState} from 'react';

export function useGanttHeight() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    function updateHeight() {
      if (!parentRef.current) return;
      const rect = parentRef.current.getBoundingClientRect();
      const remain = window.innerHeight - rect.top;
      setHeight(`${remain}px`);
    }

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return {parentRef, height};
}
