'use client';

import {Button, Menu} from '@mantine/core';
import {IconAlertTriangle, IconArrowUp, IconMinus} from '@tabler/icons-react';
import {Control, Controller} from 'react-hook-form';
import {useTranslation} from '../../../i18n';
import {TaskFormSchemaType} from '../../../schema';
import {RenderWithLabel} from '../../input/renderInput';

interface TaskPrioritySelectorProps {
  control: Control<TaskFormSchemaType>;
}

interface PriorityConfig {
  icon: React.ComponentType<any>;
  color: string;
  label: string;
}

const getPriorityConfig = (
  priority: string,
  t: (key: string) => string,
): PriorityConfig => {
  switch (priority) {
    case 'high':
      return {
        icon: IconAlertTriangle,
        color: 'red',
        label: t('task.priority.high'),
      };
    case 'medium':
      return {
        icon: IconArrowUp,
        color: 'orange',
        label: t('task.priority.medium'),
      };
    case 'low':
      return {
        icon: IconMinus,
        color: 'gray',
        label: t('task.priority.low'),
      };
    case 'normal':
    default:
      return {
        icon: IconMinus,
        color: 'blue',
        label: t('task.priority.normal'),
      };
  }
};

export function TaskPrioritySelector({control}: TaskPrioritySelectorProps) {
  const {t} = useTranslation('gantt');

  const priorityOptions = [
    {value: 'high', label: t('task.priority.high')},
    {value: 'medium', label: t('task.priority.medium')},
    {value: 'normal', label: t('task.priority.normal')},
    {value: 'low', label: t('task.priority.low')},
  ];

  return (
    <Controller
      name="attributes.priority"
      control={control}
      render={({field}) => {
        const priorityConfig = getPriorityConfig(field.value, t);
        const PriorityIcon = priorityConfig.icon;

        const menuElement = (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="light"
                size="sm"
                color={priorityConfig.color}
                leftSection={<PriorityIcon size={14} />}>
                {priorityConfig.label}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {priorityOptions.map(option => {
                const optionConfig = getPriorityConfig(option.value, t);
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
            label="task.form.priority.label"
            labelWidth="wms-w-[140px]"
            inputWidth="wms-w-full"
          />
        );
      }}
    />
  );
}
