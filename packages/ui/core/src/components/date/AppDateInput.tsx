'use client';

import {ActionIcon, Group, Tooltip} from '@mantine/core';
import {DateInput, DateInputProps} from '@mantine/dates';
import {IconCalendar} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {forwardRef, useMemo} from 'react';
import {useTranslation} from '../../i18n';

type AppDateInputProps = Omit<
  DateInputProps,
  'value' | 'onChange' | 'valueFormat'
> & {
  /** External value as date string (e.g. 2025-01-30) */
  value?: string | null;
  /** Emits date string in YYYY-MM-DD format (or null when cleared) */
  onChangeISO?: (dateString: string | null) => void;
  showTodayButton?: boolean;
  /** Display format in the field */
  displayFormat?: string; // default "YYYY/MM/DD"
};

const AppDateInput = forwardRef<HTMLInputElement, AppDateInputProps>(
  (
    {
      value,
      onChangeISO,
      showTodayButton = true,
      displayFormat = 'YYYY/MM/DD',
      ...rest
    },
    ref,
  ) => {
    const {t} = useTranslation('gantt');

    // What the input should show (formatted string)
    const displayValue = useMemo(() => {
      if (!value) return null;
      const d = dayjs(value, 'YYYY-MM-DD');
      return d.isValid() ? d.format(displayFormat) : null;
    }, [value, displayFormat]);

    const isToday =
      !!value &&
      dayjs(value, 'YYYY-MM-DD').format('YYYY/MM/DD') ===
        dayjs().format('YYYY/MM/DD');

    // Mantine expects (value: string | null) => void (DateStringValue)
    const handleChange = (s: string | null) => {
      if (!s) {
        onChangeISO?.(null);
        return;
      }
      const parsed = dayjs(s, displayFormat, true); // strict by format
      onChangeISO?.(parsed.isValid() ? parsed.format('YYYY-MM-DD') : null);
    };

    return (
      <Group gap="xs" wrap="nowrap" align="start">
        <DateInput
          ref={ref}
          // IMPORTANT: this prop shape wants strings, not Date
          value={displayValue}
          onChange={handleChange}
          valueFormat={displayFormat}
          clearable
          popoverProps={{withinPortal: false}}
          highlightToday
          className="flex-1"
          {...rest}
        />

        {showTodayButton && !isToday && (
          <Tooltip label={t('common.today')}>
            <ActionIcon
              onClick={() => onChangeISO?.(dayjs().format('YYYY-MM-DD'))}
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

export default AppDateInput;
