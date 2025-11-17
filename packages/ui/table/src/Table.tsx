'use client';
import {
  Button,
  Checkbox,
  LoadingOverlay,
  Table as MantineTable,
  Menu,
  ScrollArea,
  Stack,
} from '@mantine/core';
import {IconColumns} from '@tabler/icons-react';
import {useTranslation} from '@wms/core';
import type React from 'react';
import PaginationControl from './components/PaginationControl';
import {TableBody} from './components/TableBody';
import {TableHeader} from './components/TableHeader';
import {TableToolbar} from './components/TableToolbar';
import {useTable} from './hooks/useTable';
import type {CommonTableProps} from './types';

export type {
  CommonTableProps,
  PaginationConfig,
  TableColumnDef,
  TableSearchConfig,
} from './types';

export function Table<TData>(props: CommonTableProps<TData>) {
  const {
    title,
    search,
    pagination,
    tableHeight,
    onRowAction,
    onCellAction,
    enableColumnResizing = true,
    enableSorting = true,
    enableFilters = true,
    filterRenderers,
    isFetching = false,
    enableColumnVisibility = true,
  } = props;

  const {t} = useTranslation('table');
  const {table} = useTable<TData>(props);

  const totalItems =
    pagination?.total ?? table.getFilteredRowModel().rows.length;
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? (totalItems || 10);

  const columnsMenu = enableColumnVisibility ? (
    <Menu withinPortal>
      <Menu.Target>
        <Button
          variant="outline"
          size="xs"
          color="gray"
          leftSection={<IconColumns size={20} />}>
          {t('viewOptions')}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {table
          .getAllLeafColumns()
          .filter(c => c.getCanHide())
          .map(col => (
            <Menu.Item
              key={col.id}
              closeMenuOnClick={false}
              className="wms-cursor-pointer">
              <Checkbox
                label={String(col.columnDef.header ?? col.id)}
                checked={col.getIsVisible()}
                disabled={
                  col.getIsVisible() &&
                  table.getVisibleLeafColumns().length <= 1
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  col.toggleVisibility(e.currentTarget.checked)
                }
                classNames={{
                  label: 'wms-cursor-pointer',
                  input: 'wms-cursor-pointer',
                }}
              />
            </Menu.Item>
          ))}
      </Menu.Dropdown>
    </Menu>
  ) : null;

  return (
    <Stack gap="xs">
      <TableToolbar<TData>
        title={title}
        search={search}
        rightSlot={columnsMenu}
      />
      <ScrollArea h={tableHeight ?? undefined} type="auto">
        <LoadingOverlay visible={isFetching} />
        <MantineTable
          className="w-max min-w-full"
          horizontalSpacing="sm"
          verticalSpacing="xs"
          withRowBorders
          withColumnBorders
          withTableBorder
          stickyHeader
          highlightOnHover>
          <TableHeader<TData>
            headerGroups={table.getHeaderGroups()}
            enableSorting={enableSorting}
            enableColumnResizing={enableColumnResizing}
            enableFilters={enableFilters}
            filterRenderers={filterRenderers}
          />
          <TableBody<TData>
            rows={table.getRowModel().rows}
            onRowAction={onRowAction}
            onCellAction={onCellAction}
          />
        </MantineTable>
      </ScrollArea>

      {pagination ? (
        <PaginationControl
          total={pagination.total}
          page={page}
          onPageChange={pagination.onPageChange}
          pageSize={pageSize}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      ) : null}
    </Stack>
  );
}

Table.displayName = 'Table';
