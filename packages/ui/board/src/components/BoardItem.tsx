'use client';
import {DraggableProvided} from '@hello-pangea/dnd';
import {Card, Popover, Skeleton} from '@mantine/core';
import {DatePicker} from '@mantine/dates';
import {useDisclosure} from '@mantine/hooks';
import {
  AssigneeSelect,
  cn,
  DateUtils,
  Task,
  TruncateTooltipWrapper,
} from '@wms/core';
import {forwardRef} from 'react';
import {MAX_BOARD_ITEM_HEIGHT} from '../constants/common';
import {useBoardViewContext} from '../context/BoardViewContext';

interface BoardItemProps {
  task: Task;
  provided?: DraggableProvided;
  isDragging?: boolean;
}

const BoardItem = forwardRef<HTMLDivElement, BoardItemProps>(
  ({task, provided, isDragging = false}, ref) => {
    const {assignees, onAssignUser, onChangeDueDate} = useBoardViewContext();
    const [opened, {toggle, close, open}] = useDisclosure();
    return (
      <Card
        withBorder
        m={4}
        p={0}
        shadow={isDragging ? 'lg' : undefined}
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        {...provided?.dragHandleProps}
        className={cn('wms-group wms-h-full wms-border wms-p-0', {
          'wms-select-none wms-bg-gray-100 wms-shadow-xl wms-opacity-70':
            isDragging,
          'hover:wms-shadow-lg hover:wms-bg-gray-100': !isDragging,
        })}>
        <div
          ref={ref}
          className={`wms-flex wms-h-full wms-flex-col wms-justify-between wms-gap-1 wms-p-2.5`}
          style={{
            height: MAX_BOARD_ITEM_HEIGHT,
          }}>
          <div className="wms-flex-1">
            <TruncateTooltipWrapper
              tooltipLabel={task.name}
              maxWidth={340}
              lineClamp={1}
              tooltipProps={{
                floatingStrategy: 'fixed',
                openDelay: 300,
              }}>
              <span className="wms-select-none wms-text-sm wms-font-semibold hover:wms-underline hover:wms-underline-offset-2 wms-cursor-pointer">
                {task.name}
              </span>
            </TruncateTooltipWrapper>
          </div>
          <div className="wms-flex wms-items-center wms-gap-1">
            <AssigneeSelect
              assigneeOptions={assignees}
              value={task.assignee?.id}
              onChange={asg => onAssignUser(task.status.code, task.id, asg)}
            />
            <Popover opened={opened} onChange={toggle}>
              <Popover.Target>
                <span
                  className="wms-cursor-pointer wms-text-xs wms-text-gray-500 wms-underline hover:wms-no-underline"
                  onClick={open}>
                  {task.endDate
                    ? DateUtils.formatDate(task.endDate, 'YYYY-MM-DD')
                    : 'No due date'}
                </span>
              </Popover.Target>
              <Popover.Dropdown>
                <DatePicker
                  value={task.endDate}
                  date={DateUtils.formatDate(task.endDate, 'YYYY-MM-DD')}
                  allowDeselect={false}
                  onChange={date => {
                    onChangeDueDate(task.id, date!);
                    close();
                  }}
                />
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>
      </Card>
    );
  },
);

export const BoardItemSkeleton = () => {
  return (
    <div className="wms-m-1 wms-border wms-p-2.5">
      <div className="wms-flex wms-h-full wms-flex-col wms-justify-between wms-gap-2">
        <div className="wms-flex wms-items-start wms-justify-between wms-gap-2">
          <Skeleton height={16} width="80%" radius="sm" />
          <Skeleton height={16} width={16} circle />
        </div>

        <div className="wms-mt-1">
          <Skeleton height={14} width={80} radius="sm" />
        </div>

        <div className="wms-mt-1 wms-flex wms-items-center wms-justify-between wms-gap-2">
          <Skeleton height={18} width={70} radius="sm" />

          <div className="wms-flex wms-items-center wms-gap-1">
            <Skeleton height={22} width={60} radius="sm" />
            <Skeleton height={22} width={60} radius="sm" />
            <Skeleton height={24} width={24} circle />
          </div>
        </div>
      </div>
    </div>
  );
};

BoardItem.displayName = 'BoardItem';

export default BoardItem;
