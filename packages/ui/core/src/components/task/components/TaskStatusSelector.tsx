'use client';

import {Button, Menu} from '@mantine/core';
import {Control, Controller} from 'react-hook-form';
import {useTranslation} from '../../../i18n';
import {TaskFormSchemaType} from '../../../schema';
import {RenderWithLabel} from '../../input/renderInput';
import {getTaskStatusConfig} from '../utils/fieldTypeUtils';

interface TaskStatusSelectorProps {
  control: Control<TaskFormSchemaType>;
}

export function TaskStatusSelector({control}: TaskStatusSelectorProps) {
  const {t} = useTranslation('gantt');

  const statusOptions = [
    {value: 'new', label: t('task.status.new')},
    {value: 'in_progress', label: t('task.status.in_progress')},
    {value: 'completed', label: t('task.status.completed')},
    {value: 'on_hold', label: t('task.status.on_hold')},
  ];

  return (
    <Controller
      name="attributes.status"
      control={control}
      render={({field}) => {
        const statusConfig = getTaskStatusConfig(field.value, t);
        const StatusIcon = statusConfig.icon;

        const menuElement = (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="light"
                size="sm"
                color={statusConfig.color}
                leftSection={<StatusIcon size={14} />}>
                {statusConfig.label}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {statusOptions.map(option => {
                const optionConfig = getTaskStatusConfig(option.value, t);
                const OptionIcon = optionConfig.icon;

                return (
                  <Menu.Item
                    key={option.value}
                    leftSection={<OptionIcon size={14} />}
                    onClick={() => field.onChange(option.value)}>
                    {option.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        );

        return (
          <RenderWithLabel
            inputElement={menuElement}
            label="task.form.status.label"
            labelWidth="wms-w-[140px]"
            inputWidth="wms-w-full"
          />
        );
      }}
    />
  );
}
