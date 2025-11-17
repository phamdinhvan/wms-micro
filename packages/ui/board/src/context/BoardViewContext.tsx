'use client';

import {
  DateUtils,
  Task,
  TaskAssignee,
  TaskPriority,
  TaskStatus,
  TaskStatusCode,
  useUpdateTask,
} from '@wms/core';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type TaskStatusMeta = {
  totalPages: number;
};

export type TaskStatusData = {
  tasks: Task[];
  status: TaskStatus;
} & TaskStatusMeta;

type BoardViewContextType = {
  columns: TaskStatus[];
  assignees: TaskAssignee[];
  priorities: TaskPriority[];
  columnData: Map<TaskStatusCode, TaskStatusData>;
  setColumnData: React.Dispatch<
    React.SetStateAction<Map<TaskStatusCode, TaskStatusData>>
  >;
  updateDataToStatus: (
    statusCode: TaskStatusCode,
    newData: Array<Task>,
    type?: 'set' | 'push',
  ) => void;
  setStatusMeta: (statusCode: TaskStatusCode, meta: TaskStatusMeta) => void;
  getInstanceByStatus: (
    statusCode: TaskStatusCode,
  ) => TaskStatusData | undefined;

  onTaskAdded: (statusCode: TaskStatusCode, newTask: Task) => void;

  onAssignUser: (
    statusCode: TaskStatusCode,
    taskId: string,
    userId: string | null,
  ) => Promise<void>;
  onChangeTaskStatus: (
    taskId: string,
    currentStatusCode: TaskStatusCode,
    newStatusCode: TaskStatusCode,
  ) => Promise<void>;

  onChangeDueDate: (taskId: string, newDueDate: string | Date) => Promise<void>;
};
const BoardViewContext = createContext<BoardViewContextType | undefined>(
  undefined,
);

export const useBoardViewContext = () => {
  const ctx = useContext(BoardViewContext);
  if (!ctx) {
    throw new Error(
      'useBoardViewContext must be used within a BoardViewProvider',
    );
  }
  return ctx;
};

type BoardViewProviderProps = PropsWithChildren<{
  columns: TaskStatus[];
  assignees?: TaskAssignee[];
  priorities?: TaskPriority[];
  projectId: string;
}>;
const BoardViewProvider = ({
  children,
  columns,
  assignees = [],
  priorities = [],
  projectId,
}: BoardViewProviderProps) => {
  const initialColumnData = useMemo(() => {
    const map = new Map<TaskStatusCode, TaskStatusData>();
    columns.forEach(col => {
      map.set(col.code, {tasks: [], status: col, totalPages: 0});
    });
    return map;
  }, [columns]);

  const [columnData, setColumnData] =
    useState<Map<TaskStatusCode, TaskStatusData>>(initialColumnData);

  useEffect(() => {
    setColumnData(initialColumnData);
  }, [initialColumnData]);

  const assigneesMap = useMemo(() => {
    const map = new Map<string, TaskAssignee>();
    assignees.forEach(assignee => {
      map.set(assignee.id, assignee);
    });
    return map;
  }, [assignees]);

  const {onUpdateTask} = useUpdateTask(projectId);

  const updateDataToStatus = useCallback(
    (statusCode: string, newData: Task[], type: 'set' | 'push' = 'set') => {
      switch (type) {
        case 'set': {
          setColumnData(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(statusCode as TaskStatusCode);
            if (existing) {
              newMap.set(statusCode as TaskStatusCode, {
                ...existing,
                tasks: newData,
              });
            }
            return newMap;
          });
          break;
        }
        case 'push': {
          setColumnData(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(statusCode as TaskStatusCode);
            if (existing) {
              newMap.set(statusCode as TaskStatusCode, {
                ...existing,
                tasks: [...existing.tasks, ...newData],
              });
            }
            return newMap;
          });
          break;
        }
        default:
          break;
      }
    },
    [],
  );

  const setStatusMeta = useCallback(
    (statusCode: TaskStatusCode, meta: TaskStatusMeta) => {
      setColumnData(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(statusCode);
        if (existing) {
          newMap.set(statusCode, {
            ...existing,
            ...meta,
          });
        }
        return newMap;
      });
    },
    [],
  );

  const getInstanceByStatus = useCallback(
    (statusCode: TaskStatusCode) => {
      return columnData.get(statusCode);
    },
    [columnData],
  );

  const onTaskAdded = useCallback(
    (statusCode: TaskStatusCode, newTask: Task) => {
      setColumnData(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(statusCode);
        if (existing) {
          newMap.set(statusCode, {
            ...existing,
            tasks: [...existing.tasks, newTask],
          });
        }
        return newMap;
      });
    },
    [],
  );

  const onAssignUser = useCallback(
    async (
      statusCode: TaskStatusCode,
      taskId: string,
      userId: string | null,
    ) => {
      const currentMap = columnData;
      try {
        setColumnData(prev => {
          const newMap = new Map(prev);
          const currentStatus = newMap.get(statusCode);
          if (currentStatus) {
            const updatedTasks = currentStatus.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  assignee: assigneesMap.get(userId ?? '') ?? null,
                };
              }
              return task;
            });
            newMap.set(statusCode, {
              ...currentStatus,
              tasks: updatedTasks,
            });
          }
          return newMap;
        });
        await onUpdateTask(taskId, {assignee: {id: userId}}, 'patch');
      } catch (error) {
        setColumnData(currentMap);
        console.error('Error assigning user:', error);
      }
    },
    [assigneesMap, columnData, onUpdateTask],
  );

  const onChangeTaskStatus = useCallback(
    async (
      taskId: string,
      currentStatusCode: TaskStatusCode,
      newStatusCode: TaskStatusCode,
    ) => {
      const currentMap = columnData;
      let taskToMove: Task | null = null;
      try {
        setColumnData(prev => {
          const newMap = new Map(prev);
          const currentStatus = newMap.get(currentStatusCode);
          const newStatus = newMap.get(newStatusCode);
          if (currentStatus) {
            const filteredTasks = currentStatus.tasks.filter(task => {
              if (task.id === taskId) {
                taskToMove = task;
                return false;
              }
              return true;
            });
            newMap.set(currentStatusCode, {
              ...currentStatus,
              tasks: filteredTasks,
            });
          }
          if (newStatus && taskToMove) {
            newMap.set(newStatusCode, {
              ...newStatus,
              tasks: [taskToMove, ...newStatus.tasks],
            });
          }
          return newMap;
        });
        await onUpdateTask(taskId, {status: newStatusCode}, 'patch');
      } catch (error) {
        setColumnData(currentMap);
        console.error('Error changing task status:', error);
      }
    },
    [columnData, onUpdateTask],
  );

  const onChangeDueDate = useCallback(
    async (taskId: string, newDueDate: string | Date) => {
      const currentMap = columnData;
      try {
        setColumnData(prev => {
          const newMap = new Map(prev);
          newMap.forEach((statusData, statusCode) => {
            const updatedTasks = statusData.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  endDate: DateUtils.formatDate(newDueDate, 'YYYY-MM-DD'),
                };
              }
              return task;
            });
            newMap.set(statusCode, {
              ...statusData,
              tasks: updatedTasks,
            });
          });
          return newMap;
        });
        await onUpdateTask(taskId, {endDate: newDueDate}, 'patch');
      } catch (error) {
        setColumnData(currentMap);
        console.error('Error changing task due date:', error);
      }
    },
    [columnData, onUpdateTask],
  );

  const ctxValue = useMemo(
    () => ({
      columns,
      assignees,
      priorities,
      columnData,
      setColumnData,
      updateDataToStatus,
      getInstanceByStatus,
      setStatusMeta,
      onTaskAdded,
      onAssignUser,
      onChangeTaskStatus,
      onChangeDueDate,
    }),
    [
      columns,
      assignees,
      priorities,
      columnData,
      getInstanceByStatus,
      updateDataToStatus,
      setStatusMeta,
      onTaskAdded,
      onAssignUser,
      onChangeTaskStatus,
      onChangeDueDate,
    ],
  );

  return (
    <BoardViewContext.Provider value={ctxValue}>
      {children}
    </BoardViewContext.Provider>
  );
};

export default BoardViewProvider;
