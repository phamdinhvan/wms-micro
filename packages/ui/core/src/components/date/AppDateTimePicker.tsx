'use client';

import {ActionIcon, Group, Tooltip} from '@mantine/core';
import {DateTimePicker, DateTimePickerProps} from '@mantine/dates';
import {IconCalendar} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {forwardRef} from 'react';
import {useTranslation} from '../../i18n';

type AppDateTimePickerProps = DateTimePickerProps & {
  showTodayButton?: boolean;
};
const AppDateTimePicker = forwardRef<HTMLButtonElement, AppDateTimePickerProps>(
  ({showTodayButton = true, ...props}, ref) => {
    const {t} = useTranslation('gantt');
    const value = props.value;
    const isToday =
      value &&
      dayjs(value).format('YYYY/MM/DD') === dayjs().format('YYYY/MM/DD');

    return (
      <Group gap="xs" wrap="nowrap" align="start">
        <DateTimePicker
          ref={ref}
          highlightToday
          valueFormat="YYYY/MM/DD HH:mm"
          timePickerProps={{
            withDropdown: true,
            popoverProps: {withinPortal: false},
          }}
          submitButtonProps={{className: 'hidden'}}
          popoverProps={{withinPortal: false}}
          clearable
          className="flex-1"
          {...props}
        />
        {showTodayButton && !isToday && (
          <Tooltip label={t('common.today')}>
            <ActionIcon
              onClick={() => props.onChange?.(dayjs().format('YYYY/MM/DD'))}
              variant="subtle"
              color="gray"
              mt={4}>
              <IconCalendar size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  },
);

export default AppDateTimePicker;
