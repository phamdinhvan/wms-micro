import { useEffect, useState } from "react";

/**
 * Custom hook for project ID management
 * Tracks project ID from props or localStorage with real-time updates
 */
export function useProjectIdTracking(projectId?: string) {
  const [localStorageProjectId, setLocalStorageProjectId] = useState<
    string | null
  >(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedProjectId")
      : null,
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const newProjectId = localStorage.getItem("selectedProjectId");
      setLocalStorageProjectId(newProjectId);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return projectId || localStorageProjectId || null;
}
