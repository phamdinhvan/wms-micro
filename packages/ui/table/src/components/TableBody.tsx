import {Table as MantineTable} from '@mantine/core';
import {
  flexRender,
  type Cell as RTCell,
  type Row as RTRow,
} from '@tanstack/react-table';
import type {TableColumnDef} from '../types';

interface TableBodyProps<TData> {
  rows: RTRow<TData>[];
  onRowAction?: (row: TData, index: number) => void;
  onCellAction?: (row: TData, columnId: string, index: number) => void;
}

export function TableBody<TData>({
  rows,
  onRowAction,
  onCellAction,
}: TableBodyProps<TData>) {
  return (
    <MantineTable.Tbody>
      {rows.map((row, rowIndex) => (
        <MantineTable.Tr
          key={row.id}
          onClick={() => onRowAction?.(row.original, rowIndex)}
          style={{cursor: onRowAction ? 'pointer' : undefined}}>
          {row.getVisibleCells().map((cell: RTCell<TData, unknown>) => {
            const meta = (cell.column.columnDef as TableColumnDef<TData>).meta;
            const sticky = meta?.sticky;
            return (
              <MantineTable.Td
                key={cell.id}
                onClick={e => {
                  e.stopPropagation();
                  onCellAction?.(row.original, cell.column.id, rowIndex);
                }}
                style={{
                  position: sticky ? 'sticky' : undefined,
                  left: sticky ? 0 : undefined,
                  zIndex: sticky ? 1 : undefined,
                  background: sticky ? 'var(--mantine-color-body)' : undefined,
                }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </MantineTable.Td>
            );
          })}
        </MantineTable.Tr>
      ))}
    </MantineTable.Tbody>
  );
}
