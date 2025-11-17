import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnResizeMode,
  Header,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type React from 'react';

export type FilterRenderProps<TData> = {
  column: Header<TData, unknown>['column'];
  value: unknown;
  setValue: (v: unknown) => void;
  meta?: TableColumnDef<TData>['meta']; // helpful for options
};

export type FilterRenderer<TData> = (
  props: FilterRenderProps<TData>,
) => React.ReactNode;

export type TableColumnDef<TData> = ColumnDef<TData, unknown> & {
  meta?: {
    filterRenderer?: FilterRenderer<TData>; // per-column custom renderer
    headerTooltip?: string;
    sticky?: boolean; // sticky this column (left)
    width?: number;
  };
};

export interface TableSearchConfig<TData> {
  placeholder?: string;
  query?: string;
  searchableColumns?: Array<keyof TData & string>;
  onChange?: (q: string) => void;
}

export interface PaginationConfig {
  page: number; // 1-based Mantine Pagination
  pageSize: number;
  total?: number; // for server-side
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface CommonTableProps<TData> {
  title?: string;
  data: TData[];
  columns: TableColumnDef<TData>[];
  enableColumnResizing?: boolean;
  columnResizeMode?: ColumnResizeMode;
  defaultColumnMinSize?: number;

  enableSorting?: boolean;
  initialSorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;

  enableFilters?: boolean;
  initialColumnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (state: ColumnFiltersState) => void;

  // Column visibility (show/hide columns)
  enableColumnVisibility?: boolean;
  initialColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (state: VisibilityState) => void;

  /**
   * Optional registry of custom filter renderers keyed by column id.
   * Per-column meta.filterRenderer takes precedence over this registry.
   */
  filterRenderers?: Record<string, FilterRenderer<TData>>;

  search?: TableSearchConfig<TData>;
  pagination?: PaginationConfig;

  tableHeight?: number | string; // ScrollArea height
  stickyFirstColumn?: boolean; // convenience sticky first column

  onRowAction?: (row: TData, index: number) => void;
  onCellAction?: (row: TData, columnId: string, index: number) => void;

  isFetching?: boolean; // show loading state
}
