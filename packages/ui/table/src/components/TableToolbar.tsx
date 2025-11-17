import {Box, Group, Text, TextInput} from '@mantine/core';
import {IconSearch} from '@tabler/icons-react';
import type {TableSearchConfig} from '../types';

interface TableToolbarProps<TData> {
  title?: string | React.ReactNode;
  search?: TableSearchConfig<TData>;
  rightSlot?: React.ReactNode;
}

export function TableToolbar<TData>({
  title,
  search,
  rightSlot,
}: TableToolbarProps<TData>) {
  return (
    <Group justify="space-between">
      <Box>
        {typeof title === 'string' ? (
          <Text fw={600} mb={4}>
            {title}
          </Text>
        ) : (
          (title ?? null)
        )}
        {search ? (
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder={search.placeholder ?? 'Search...'}
            value={search.query ?? ''}
            onChange={e => search.onChange?.(e.currentTarget.value)}
            aria-label="Search"
          />
        ) : null}
      </Box>
      <Box>{rightSlot}</Box>
    </Group>
  );
}
