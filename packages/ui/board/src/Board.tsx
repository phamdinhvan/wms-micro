'use client';
import {
  DragDropContext,
  DraggableLocation,
  DropResult,
} from '@hello-pangea/dnd';
import {
  ApiTaskOption,
  CommonUtils,
  DEFAULT_ASSIGNEE_OPTIONS,
  Task,
  TaskAssignee,
  TaskPriority,
  TaskStatus,
  TaskStatusCode,
  useProjectConfig,
  useProjectIdTracking,
  useTranslation,
} from '@wms/core';
import BoardColumn from './components/BoardColumn';
import HorizontalScrollPreview from './components/ScrollPreview';
import BoardViewProvider, {
  TaskStatusData,
  useBoardViewContext,
} from './context/BoardViewContext';
import {calculateNewOrderIdOfTwoStatusOrders} from './utils/common';

export type BoardProps = {
  assignees?: TaskAssignee[];
};

export function Board({assignees = DEFAULT_ASSIGNEE_OPTIONS}: BoardProps) {
  const [t, i18n] = useTranslation();
  const currentProjectId = useProjectIdTracking();
  const {statuses: statusesResponse, priorities: prioritiesResponse} =
    useProjectConfig(currentProjectId!);
  const statuses = CommonUtils.mapTaskOptions(
    statusesResponse,
    i18n.language as keyof ApiTaskOption,
  ) as TaskStatus[];
  const priorities = CommonUtils.mapTaskOptions(
    prioritiesResponse,
    i18n.language as keyof ApiTaskOption,
  ) as TaskPriority[];

  return (
    <BoardViewProvider
      columns={statuses}
      assignees={assignees}
      priorities={priorities}
      projectId={currentProjectId!}>
      <TopDownBoard />
    </BoardViewProvider>
  );
}

const TopDownBoard = () => {
  const {
    columnData: statusData,
    setColumnData,
    onChangeTaskStatus,
  } = useBoardViewContext();
  const columns = Array.from(statusData.values());
  const handleCrossColumnMove = async (
    source: DraggableLocation,
    destination: DraggableLocation,
    sourceCol: TaskStatusData,
    destCol: TaskStatusData,
    dataFrom: Task,
  ) => {
    const currentStatusData = statusData;
    const dataToAfter = destCol?.tasks?.[destination.index];
    const dataToBefore = destCol?.tasks?.[destination.index - 1];

    const orderId = calculateNewOrderIdOfTwoStatusOrders(
      dataToBefore?.sortOrder,
      dataToAfter?.sortOrder,
    );

    const payload = [
      {
        statusCode: dataToAfter?.status?.code || destination.droppableId,
        statusId: dataFrom.id,
        orderId,
      },
    ];

    const updatedSource = sourceCol.tasks;
    const updatedDest = destCol.tasks;
    const [movedStatus] = updatedSource.splice(source.index, 1);
    movedStatus.status.code = destination.droppableId as TaskStatusCode;
    movedStatus.sortOrder = orderId;
    updatedDest.splice(destination.index, 0, movedStatus);

    await onChangeTaskStatus(
      dataFrom.id,
      sourceCol.status.code,
      destCol.status.code,
    );
  };

  const handleSameColumnReorder = async (
    source: DraggableLocation,
    destination: DraggableLocation,
    column: TaskStatusData,
    dataFrom: Task,
  ) => {
    const currentStatusData = statusData;
    const tasks = column.tasks;
    const [movedStatus] = tasks.splice(source.index, 1);

    let payload = [];

    const isAdjacentMove = Math.abs(destination.index - source.index) === 1;

    if (isAdjacentMove) {
      const dataTo = column.tasks[destination.index];
      payload = [
        {
          statusCode: dataFrom.status?.code,
          statusId: dataFrom.id,
          orderId: Number(dataTo?.sortOrder),
        },
        {
          statusCode: dataTo?.status?.code,
          statusId: dataTo?.id,
          orderId: Number(dataFrom?.sortOrder),
        },
      ];
      movedStatus.sortOrder = payload[0].orderId;
    } else {
      const dataToBefore = column.tasks[destination.index];
      const dataToAfter = column.tasks[destination.index + 1];
      const newOrder = calculateNewOrderIdOfTwoStatusOrders(
        dataToBefore?.sortOrder,
        dataToAfter?.sortOrder,
      );

      payload = [
        {
          statusCode: dataToAfter?.status?.code ?? column.status.code,
          statusId: dataFrom.id,
          orderId: newOrder,
        },
      ];
      movedStatus.sortOrder = newOrder;
    }

    tasks.splice(destination.index, 0, movedStatus);

    requestAnimationFrame(() => {
      setColumnData(prev => {
        const newMap = new Map(prev);
        newMap.set(column.status.code, {
          ...column,
          tasks,
        });
        return newMap;
      });
    });
  };

  const onDragEnd = async (result: DropResult) => {
    const {destination, source} = result;

    const currentStatuses = statusData;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;
    const sourceId = source.droppableId as TaskStatusCode;
    const destId = destination.droppableId as TaskStatusCode;
    const sourceCol = statusData.get(sourceId);
    const destCol = statusData.get(destId);
    if (!sourceCol || !destCol) return;
    try {
      const dataFrom = sourceCol?.tasks?.[source.index];

      if (!dataFrom) return;

      if (sourceId !== destId) {
        await handleCrossColumnMove(
          source,
          destination,
          sourceCol,
          destCol,
          dataFrom,
        );
      } else {
        await handleSameColumnReorder(source, destination, sourceCol, dataFrom);
      }
    } catch (error) {
      requestAnimationFrame(() => {
        setColumnData(currentStatuses);
      });
      console.error('Error during drag and drop:', error);
    }
  };

  return (
    <HorizontalScrollPreview
      totalColumn={columns.length ?? 1}
      previewWidth={120}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="wms-flex wms-gap-2 wms-h-full">
          {columns.map(col => (
            <BoardColumn key={col.status.code} column={col.status} />
          ))}
        </div>
      </DragDropContext>
    </HorizontalScrollPreview>
  );
};
