import {
  ActionIcon,
  Box,
  Group,
  Table as MantineTable,
  Popover,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconFilter,
} from '@tabler/icons-react';
import {
  flexRender,
  type HeaderGroup,
  type Header as RTHeader,
} from '@tanstack/react-table';
import type {FilterRenderer, TableColumnDef} from '../types';

interface TableHeaderProps<TData> {
  headerGroups: HeaderGroup<TData>[];
  enableSorting: boolean;
  enableColumnResizing: boolean;
  enableFilters: boolean;
  filterRenderers?: Record<string, FilterRenderer<TData>>;
}

export function TableHeader<TData>({
  headerGroups,
  enableSorting,
  enableColumnResizing,
  enableFilters,
  filterRenderers,
}: TableHeaderProps<TData>) {
  return (
    <MantineTable.Thead>
      {headerGroups.map(headerGroup => (
        <MantineTable.Tr key={headerGroup.id}>
          {headerGroup.headers.map((header: RTHeader<TData, unknown>) => {
            const canSort = enableSorting && header.column.getCanSort();
            const sortDir = header.column.getIsSorted();
            const meta = header.column.columnDef.meta as
              | TableColumnDef<TData>['meta']
              | undefined;
            const headerContent = (
              <Group gap={6} wrap="nowrap" align="center">
                <Box style={{userSelect: 'none'}}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Box>
                {canSort ? (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={header.column.getToggleSortingHandler()}
                    aria-label="Toggle sort">
                    {sortDir === 'asc' ? (
                      <IconArrowUp size={14} />
                    ) : sortDir === 'desc' ? (
                      <IconArrowDown size={14} />
                    ) : (
                      <IconArrowsSort size={14} />
                    )}
                  </ActionIcon>
                ) : null}
                {enableFilters && header.column.getCanFilter()
                  ? renderColumnFilter(header.column, meta, filterRenderers)
                  : null}
              </Group>
            );

            const sticky = meta?.sticky;

            return (
              <MantineTable.Th
                key={header.id}
                style={{
                  position: sticky ? 'sticky' : undefined,
                  left: sticky ? 0 : undefined,
                  zIndex: sticky ? 2 : undefined,
                  width: header.getSize(),
                  minWidth: header.column.columnDef.minSize,
                }}>
                {meta?.headerTooltip ? (
                  <Tooltip label={meta.headerTooltip}>
                    <div className="wms-flex wms-justify-center wms-items-center text-center">
                      {headerContent}
                    </div>
                  </Tooltip>
                ) : (
                  <div className="wms-flex wms-justify-center wms-items-center text-center">
                    {headerContent}
                  </div>
                )}
                {/* Filter popover is now placed next to the sort icon inside headerContent */}
                {enableColumnResizing ? (
                  <Box
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: 6,
                      cursor: header.column.getIsResizing()
                        ? 'col-resize'
                        : 'ew-resize',
                      userSelect: 'none',
                    }}
                    aria-label="Resize column"
                    role="separator"
                    aria-orientation="vertical"
                  />
                ) : null}
              </MantineTable.Th>
            );
          })}
        </MantineTable.Tr>
      ))}
    </MantineTable.Thead>
  );
}

function renderColumnFilter<TData>(
  column: RTHeader<TData, unknown>['column'],
  meta?: TableColumnDef<TData>['meta'],
  registry?: Record<string, FilterRenderer<TData>>,
) {
  const filterValue = (column.getFilterValue() ?? '') as string;
  const setUnknown = (v: unknown) =>
    column.setFilterValue(v && v !== '' ? v : undefined);

  // 1) Per-column custom renderer takes precedence
  if (meta?.filterRenderer) {
    return (
      <Popover position="bottom-start" shadow="md" withinPortal>
        <Popover.Target>
          <ActionIcon
            variant="subtle"
            size="sm"
            aria-label={`Open filter for ${column.id}`}
            title="Filter">
            <IconFilter size={14} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown className="p-2">
          {meta.filterRenderer({
            column,
            value: filterValue,
            setValue: setUnknown,
            meta,
          })}
        </Popover.Dropdown>
      </Popover>
    );
  }

  // 2) Registry-based custom renderer keyed by column id
  {
    const renderer = registry?.[String(column.id)] as
      | FilterRenderer<TData>
      | undefined;
    if (renderer) {
      return (
        <Popover position="bottom-start" shadow="md" withinPortal>
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label={`Open filter for ${column.id}`}
              title="Filter">
              <IconFilter size={14} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown className="p-2">
            {renderer({column, value: filterValue, setValue: setUnknown, meta})}
          </Popover.Dropdown>
        </Popover>
      );
    }
  }

  // No custom renderer found; do not render filter button
  return null;
}
