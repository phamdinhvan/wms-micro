'use client';

import {Draggable, Droppable} from '@hello-pangea/dnd';
import {ActionIcon, Group} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {IconPlus} from '@tabler/icons-react';
import {useQueryClient} from '@tanstack/react-query';
import {
  cn,
  Task,
  TaskFormModal,
  TaskStatus,
  useGetTasks,
  useProjectIdTracking,
  useTranslation,
} from '@wms/core';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Virtuoso} from 'react-virtuoso';
import {MAX_BOARD_ITEM_HEIGHT} from '../constants/common';
import {useBoardViewContext} from '../context/BoardViewContext';
import BoardItem, {BoardItemSkeleton} from './BoardItem';

const TRIGGER_BOTTOM_REACHED_SIZE = 10;

type BoardColumnProps = {
  column: TaskStatus;
  isOverlay?: boolean;
};
const BoardColumn = ({column}: BoardColumnProps) => {
  const projectId = useProjectIdTracking();
  const [t] = useTranslation('common');
  const {
    getInstanceByStatus,
    updateDataToStatus,
    setStatusMeta,
    assignees,
    columns,
    priorities,
    onTaskAdded,
  } = useBoardViewContext();
  const actualProjectId = useProjectIdTracking();
  const [visible, {close, open}] = useDisclosure();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const {data, isSuccess, isLoading} = useGetTasks({
    status: column.code,
    projectId: actualProjectId!,
    page,
    limit: 20,
    options: {
      queryKey: column.code,
    },
  });

  const taskQData = data?.data;
  const columnIns = useMemo(
    () => getInstanceByStatus(column.code),
    [column, getInstanceByStatus],
  );
  const tasks = columnIns?.tasks || [];
  const totalTasks = columnIns?.tasks.length ?? 0;
  const totalPages = columnIns?.totalPages ?? 1;
  const hasMore = page < totalPages;

  useEffect(() => {
    if (isSuccess && taskQData) {
      const tasks = taskQData.items as unknown as Task[];
      if (page === 1) {
        updateDataToStatus(column.code, tasks, 'set');
        setStatusMeta(column.code, {
          totalPages: taskQData.totalPages || 1,
        });
      } else {
        updateDataToStatus(column.code, tasks, 'push');
      }
    }
  }, [column, isSuccess, page, setStatusMeta, taskQData, updateDataToStatus]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setPage(prevPage => prevPage + 1);
  }, [isLoading, hasMore]);

  const onEndReached = useCallback(
    (index: number) => {
      if (isLoading || !hasMore) return;

      if (index > tasks.length - TRIGGER_BOTTOM_REACHED_SIZE) {
        loadMore();
      }
    },
    [loadMore, tasks.length, isLoading, hasMore],
  );

  const HeightPreservingItem = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return ({children, ...props}: any) => {
      return (
        <div
          {...props}
          style={{
            height: MAX_BOARD_ITEM_HEIGHT,
          }}>
          {children}
        </div>
      );
    };
  }, []);

  return (
    columnIns && (
      <Droppable
        droppableId={column.code}
        mode="virtual"
        renderClone={(provided, snapshot, rubric) => {
          const value = tasks[rubric.source.index];

          return (
            <div ref={provided.innerRef} {...provided.dragHandleProps}>
              <BoardItem
                provided={provided}
                isDragging={snapshot.isDragging}
                task={value}
              />
            </div>
          );
        }}>
        {droppableProvided => (
          <div
            ref={droppableProvided.innerRef}
            className="wms-flex wms-min-w-[340px] wms-max-w-[340px] wms-flex-1 wms-flex-col wms-overflow-hidden wms-rounded-t-xl wms-border wms-bg-white">
            <div className="wms-flex wms-justify-between wms-border-b wms-px-2 wms-py-3 wms-select-none">
              <Group gap={4}>
                <div
                  className="wms-text-sm wms-font-semibold wms-uppercase wms-px-3 wms-py-1 wms-rounded wms-text-white wms-text-center wms-text-xs"
                  style={{
                    backgroundColor: column.color,
                  }}>
                  {column.label}
                </div>
                {!!totalTasks && (
                  <span
                    className={cn(
                      'wms-min-w-8 wms-rounded wms-px-1 wms-py-[2px] wms-text-center wms-text-xs',
                      totalTasks ? 'wms-bg-gray-200' : 'wms-bg-transparent',
                    )}>
                    {totalTasks}
                  </span>
                )}
              </Group>
              <ActionIcon
                onClick={open}
                variant="outline"
                color="gray"
                size="sm">
                <IconPlus />
              </ActionIcon>
              <TaskFormModal
                projectId={projectId!}
                assigneeOptions={assignees}
                statusOptions={columns}
                priorityOptions={priorities}
                opened={visible}
                onClose={close}
                onCreated={newTask => {
                  onTaskAdded(column.code, newTask);
                }}
              />
            </div>
            <Virtuoso
              className="wms-flex-1"
              data={tasks}
              components={{
                Footer: () =>
                  isLoading
                    ? Array.from({length: 3}).map((_, index) => (
                        <BoardItemSkeleton key={index} />
                      ))
                    : null,
                EmptyPlaceholder: () =>
                  isLoading ? null : (
                    <p className="wms-py-2 wms-text-center wms-text-xs wms-text-gray-500">
                      {t('noData')}
                    </p>
                  ),
                Item: HeightPreservingItem,
              }}
              itemContent={index => {
                const value = tasks[index];
                return (
                  <Draggable draggableId={value.id} index={index}>
                    {(providedC, snapshot) => (
                      <BoardItem
                        provided={providedC}
                        task={value}
                        isDragging={snapshot.isDragging}
                      />
                    )}
                  </Draggable>
                );
              }}
              endReached={onEndReached}
            />
          </div>
        )}
      </Droppable>
    )
  );
};

export default memo(BoardColumn);
