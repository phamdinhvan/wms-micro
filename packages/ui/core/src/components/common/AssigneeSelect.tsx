import {Avatar, Group, Menu, Tooltip, UnstyledButton} from '@mantine/core';
import {IconChevronDown, IconUser} from '@tabler/icons-react';
import React, {memo, useMemo} from 'react';
import {useTranslation} from '../../i18n';
import {TaskAssignee} from '../../types';

interface AssigneeSelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  assigneeOptions: TaskAssignee[];
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  variant?: 'avatar-only' | 'avatar-with-name' | 'auto';
  maxWidth?: number;
}

const AssigneeSelectComponent: React.FC<AssigneeSelectProps> = ({
  value,
  onChange,
  assigneeOptions,
  placeholder,
  size = 'xs',
  disabled = false,
  className,
  variant = 'auto',
  maxWidth,
}) => {
  const {t} = useTranslation('gantt');

  const selectedAssignee = useMemo(
    () => assigneeOptions.find(a => a.id === value),
    [assigneeOptions, value],
  );

  // Determine display mode based on variant - memoized to prevent unnecessary re-renders
  const shouldShowName = useMemo(
    () =>
      !!(
        variant === 'avatar-with-name' ||
        (variant === 'auto' && maxWidth && maxWidth > 120)
      ),
    [variant, maxWidth],
  );

  return (
    <Menu shadow="md" width={280} position="bottom-start" withinPortal>
      <Menu.Target>
        <Tooltip
          label={
            selectedAssignee?.name ||
            placeholder ||
            t('common.assignee.placeholder')
          }
          withinPortal
          openDelay={300}
          disabled={!selectedAssignee || shouldShowName}>
          <UnstyledButton
            className={`wms-relative wms-group wms-transition-all wms-duration-200 wms-ease-in-out ${
              !disabled
                ? 'hover:wms-transform hover:wms-translate-y-[-1px] hover:wms-shadow-lg hover:wms-border-blue-400'
                : ''
            } ${className || ''}`}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: shouldShowName ? 'flex-start' : 'center',
              gap: shouldShowName ? 8 : 0,
              width: shouldShowName ? 'auto' : 28,
              minWidth: shouldShowName ? 120 : 28,
              maxWidth: maxWidth || (shouldShowName ? 200 : 28),
              height: 28,
              padding: shouldShowName ? '0 12px' : 0,
              borderRadius: 14,
              border: '1px solid #e9ecef',
              backgroundColor: '#ffffff',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}>
            {selectedAssignee ? (
              <>
                <Avatar
                  name={selectedAssignee.name}
                  size={shouldShowName ? 20 : 22}
                  radius="xl"
                  color="initials"
                  allowedInitialsColors={[
                    'blue',
                    'red',
                    'grape',
                    'orange',
                    'pink',
                    'purple',
                    'teal',
                    'yellow',
                  ]}
                />
                {shouldShowName && (
                  <span
                    className="wms-text-sm wms-font-medium wms-text-gray-700 wms-truncate wms-min-w-0"
                    style={{fontSize: 14}}>
                    {selectedAssignee.name}
                  </span>
                )}
              </>
            ) : (
              <>
                <IconUser
                  size={shouldShowName ? 16 : 16}
                  className="wms-text-gray-400"
                />
                {shouldShowName && (
                  <span
                    className="wms-text-sm wms-text-gray-500 wms-truncate wms-min-w-0"
                    style={{fontSize: 14}}>
                    {placeholder || t('common.assignee.placeholder')}
                  </span>
                )}
              </>
            )}

            {shouldShowName && (
              <IconChevronDown
                size={12}
                className="wms-text-gray-400 wms-ml-auto wms-flex-shrink-0"
              />
            )}
          </UnstyledButton>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid #e9ecef',
          borderRadius: 8,
          padding: 4,
          maxHeight: 300,
          overflowY: 'auto',
        }}>
        {/* None option */}
        <Menu.Item
          onClick={() => onChange(null)}
          style={{
            fontSize: 14,
            padding: '8px 12px',
            borderRadius: 6,
            color: value ? '#6c757d' : '#339af0',
            fontWeight: value ? 'normal' : '500',
          }}>
          <Group gap="xs">
            <IconUser size={20} className="wms-text-gray-400" />
            <span>{t('common.assignee.none')}</span>
          </Group>
        </Menu.Item>

        <Menu.Divider style={{margin: '4px 0'}} />

        {/* Assignee options */}
        {assigneeOptions.map(assignee => (
          <Menu.Item
            key={assignee.id}
            onClick={() => onChange(assignee.id)}
            style={{
              fontSize: 14,
              padding: '8px 12px',
              borderRadius: 6,
              backgroundColor:
                value === assignee.id ? '#f0f7ff' : 'transparent',
              color: value === assignee.id ? '#339af0' : '#495057',
              fontWeight: value === assignee.id ? '500' : 'normal',
            }}>
            <Group
              gap="xs"
              wrap="nowrap"
              className="wms-items-center wms-min-w-0">
              <Avatar
                size={20}
                radius="xl"
                color="initials"
                allowedInitialsColors={[
                  'blue',
                  'red',
                  'grape',
                  'orange',
                  'pink',
                  'purple',
                  'teal',
                  'yellow',
                ]}
                name={assignee.name}
              />
              <span className="wms-flex-1 wms-truncate wms-min-w-0">
                {assignee.name}
              </span>
            </Group>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

// Memoize component to prevent unnecessary re-renders during drag
export const AssigneeSelect = memo(AssigneeSelectComponent);
