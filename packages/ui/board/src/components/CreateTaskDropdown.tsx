'use client';

import {ActionIcon, Popover} from '@mantine/core';
import {IconPlus} from '@tabler/icons-react';
import {TaskStatusCode, useCreateTask, useProjectIdTracking} from '@wms/core';

type CreateTaskDropdownProps = {
  status: TaskStatusCode;
};
const CreateTaskDropdown = ({status}: CreateTaskDropdownProps) => {
  const projectId = useProjectIdTracking();
  const {onCreateTask, isCreating} = useCreateTask(projectId!);
  return (
    <Popover>
      <Popover.Target>
        <ActionIcon variant="outline" color="gray" size="sm">
          <IconPlus />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <form></form>
      </Popover.Dropdown>
    </Popover>
  );
};

export default CreateTaskDropdown;
