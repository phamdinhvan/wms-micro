import {
  IconAbc,
  IconCalendar,
  IconCircle,
  IconCircleCheck,
  IconCircleDot,
  IconCurrencyDollar,
  IconFunction,
  IconHash,
  IconListDetails,
  IconMail,
  IconNumber123,
  IconPhone,
  IconPlayerPause,
  IconSquareCheck,
  IconTags,
  IconTextSize,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';

export interface FieldTypeConfig {
  icon: React.ComponentType<any>;
  color: string;
}

export const getFieldTypeIcon = (fieldType: any): FieldTypeConfig => {
  const name = fieldType?.name?.toLowerCase() || '';
  const displayName = fieldType?.displayName?.toLowerCase() || '';

  const checkName = (keywords: string[]) =>
    keywords.some(
      keyword => name.includes(keyword) || displayName.includes(keyword),
    );

  if (checkName(['name', 'title'])) {
    return {icon: IconUser, color: 'blue.6'};
  }
  if (checkName(['phone', 'tel'])) {
    return {icon: IconPhone, color: 'green.6'};
  }
  if (checkName(['email', 'mail'])) {
    return {icon: IconMail, color: 'red.6'};
  }
  if (checkName(['date', 'time'])) {
    return {icon: IconCalendar, color: 'orange.6'};
  }
  if (checkName(['text', 'string'])) {
    return {icon: IconAbc, color: 'blue.6'};
  }
  if (checkName(['number', 'numeric', 'integer'])) {
    return {icon: IconNumber123, color: 'cyan.6'};
  }
  if (checkName(['website', 'url', 'link'])) {
    return {icon: IconWorld, color: 'blue.6'};
  }
  if (checkName(['money', 'currency', 'price'])) {
    return {icon: IconCurrencyDollar, color: 'green.6'};
  }
  if (checkName(['checkbox', 'check', 'boolean'])) {
    return {icon: IconSquareCheck, color: 'teal.6'};
  }
  if (checkName(['tag', 'label'])) {
    return {icon: IconTags, color: 'pink.6'};
  }
  if (checkName(['formula', 'calculation'])) {
    return {icon: IconFunction, color: 'violet.6'};
  }
  if (checkName(['textarea', 'longtext', 'long_text'])) {
    return {icon: IconTextSize, color: 'indigo.6'};
  }
  if (checkName(['dropdown', 'select', 'option'])) {
    return {icon: IconListDetails, color: 'yellow.6'};
  }

  return {icon: IconHash, color: 'gray.6'};
};

export interface TaskStatusConfig {
  icon: React.ComponentType<any>;
  color: string;
  label: string;
}

export const getTaskStatusConfig = (
  status: string,
  t: (key: string) => string,
): TaskStatusConfig => {
  switch (status) {
    case 'new':
      return {
        icon: IconCircle,
        color: 'gray',
        label: t('task.status.new'),
      };
    case 'in_progress':
      return {
        icon: IconCircleDot,
        color: 'blue',
        label: t('task.status.in_progress'),
      };
    case 'completed':
      return {
        icon: IconCircleCheck,
        color: 'green',
        label: t('task.status.completed'),
      };
    case 'on_hold':
      return {
        icon: IconPlayerPause,
        color: 'orange',
        label: t('task.status.on_hold'),
      };
    default:
      return {
        icon: IconCircle,
        color: 'gray',
        label: t('task.status.new'),
      };
  }
};
