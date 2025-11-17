import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import type {CommonTableProps} from '../types';

export function useTable<TData>(props: CommonTableProps<TData>) {
  const {
    data,
    columns,
    enableSorting = true,
    enableFilters = true,
    enableColumnVisibility = true,
    columnResizeMode = 'onChange',
    defaultColumnMinSize = 80,
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
  } = props;

  const [sorting, setSorting] = React.useState<SortingState>(
    initialSorting ?? [],
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialColumnFilters ?? [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState(
    initialColumnVisibility ?? {},
  );

  React.useEffect(() => {
    onSortingChange?.(sorting);
  }, [sorting, onSortingChange]);

  React.useEffect(() => {
    onColumnFiltersChange?.(columnFilters);
  }, [columnFilters, onColumnFiltersChange]);

  React.useEffect(() => {
    onColumnVisibilityChange?.(columnVisibility);
  }, [columnVisibility, onColumnVisibilityChange]);

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : [],
      columnFilters: enableFilters ? columnFilters : [],
      columnVisibility: enableColumnVisibility ? columnVisibility : {},
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFilters ? setColumnFilters : undefined,
    onColumnVisibilityChange: enableColumnVisibility
      ? setColumnVisibility
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFilters ? getFilteredRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode,
    defaultColumn: {
      minSize: defaultColumnMinSize,
    },
  });

  return {table, sorting, columnFilters, columnVisibility} as const;
}
