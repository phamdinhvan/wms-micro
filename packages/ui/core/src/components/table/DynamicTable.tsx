import {LoadingOverlay, Skeleton, Table} from '@mantine/core';
import {IconGripVertical} from '@tabler/icons-react';
import clsx from 'clsx';
import {forwardRef} from 'react';
import {useTranslation} from 'react-i18next';
import type {Column} from '../../types/table';

type DynamicTableProps = {
  columns: Column[];
  data: Record<string, any>[];
  isLoading?: boolean;
  isRefetching?: boolean;
};

export default function DynamicTable({
  columns,
  data = [],
  isLoading,
  isRefetching,
}: DynamicTableProps) {
  const {t} = useTranslation('gantt');
  const defaultHeaderClass =
    'font-primary wms-bg-gray-100 wms-text-gray-700 wms-text-sm wms-font-semibold wms-text-center wms-p-[0.625rem] wms-whitespace-normal wms-break-words';

  let tableBodyContent: React.ReactNode;

  if (isLoading) {
    tableBodyContent = [...Array(5)].map((_, rowIndex) => (
      <Table.Tr key={`loading-${rowIndex}`}>
        {columns.map((col, colIndex) => (
          <Table.Td key={col.key || colIndex}>
            <Skeleton height={20} radius="sm" />
          </Table.Td>
        ))}
      </Table.Tr>
    ));
  } else if (data.length === 0) {
    tableBodyContent = (
      <tr>
        <td
          colSpan={columns.length}
          className="wms-h-[300px] wms-text-center wms-text-gray-500">
          {t('noData')}
        </td>
      </tr>
    );
  } else {
    tableBodyContent = data.map((row, rowIndex) => (
      <RenderRow key={row.id || rowIndex} row={row} columns={columns} />
    ));
  }

  return (
    <div className="wms-relative wms-h-full wms-min-h-0">
      <div 
        className="wms-rounded-lg wms-border wms-border-gray-300 wms-shadow-sm wms-overflow-hidden wms-h-full wms-flex wms-flex-col"
      >
        <LoadingOverlay
          visible={!isLoading && isRefetching}
          zIndex={100}
          classNames={{
            overlay: 'wms-rounded-lg',
          }}
        />
        
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Table className="wms-table-fixed wms-w-full" withColumnBorders>
            <Table.Thead className="wms-sticky wms-top-0 wms-z-10">
              <Table.Tr className="wms-bg-gray-100 hover:wms-bg-gray-100">
                {columns.map(col => (
                  <Table.Th
                    key={col.key}
                    className={clsx(
                      defaultHeaderClass,
                      typeof col.headerClassName === 'function'
                        ? col.headerClassName(col)
                        : col.headerClassName,
                      '!wms-text-center wms-bg-gray-100 hover:wms-bg-gray-200',
                    )}
                    style={{
                      ...col.headerStyle,
                      width: col.headerStyle?.width || col.cellStyle?.width || 'auto',
                      minWidth: col.headerStyle?.minWidth || col.cellStyle?.minWidth || 'auto',
                    }}>
                    {col.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody className="wms-border-b">
              {tableBodyContent}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

type RenderRowProps = {
  row: any;
  columns: Column[];
  style?: React.CSSProperties;
  draggable?: boolean;
  otherProps?: any;
};
const RenderRow = forwardRef<HTMLButtonElement, RenderRowProps>(
  (props: RenderRowProps, ref) => {
    const {columns, row, style, draggable, ...otherProps} = props;

    const defaultCellClass =
      'font-primary wms-p-[0.625rem] wms-whitespace-normal wms-break-words wms-bg-inherit';

    return (
      <Table.Tr
        className={clsx(
          'odd:wms-bg-white even:wms-bg-gray-50 hover:wms-bg-gray-100 wms-transition-colors',
        )}
        style={style}>
        {draggable && (
          <Table.Td>
            <button
              className="wms-cursor-grab wms-flex wms-justify-center wms-items-center"
              ref={ref}
              aria-label="Drag to reorder"
              {...otherProps}>
              <IconGripVertical size={20} />
            </button>
          </Table.Td>
        )}
        {columns.map(col => (
          <Table.Td
            key={col.key}
            className={clsx(
              defaultCellClass,
              typeof col.cellClassName === 'function'
                ? col.cellClassName(row)
                : col.cellClassName,
              {
                'wms-text-left': col.type === 'text' || !col.type,
                'wms-text-center': ['short', 'title', 'action'].includes(
                  col.type || '',
                ),
                'wms-text-right': col.type === 'number',
                'wms-font-semibold': col.type === 'title',
              },
            )}
            style={{
              ...col.cellStyle,
              width: col.cellStyle?.width || col.headerStyle?.width || 'auto',
              minWidth: col.cellStyle?.minWidth || col.headerStyle?.minWidth || 'auto',
            }}>
            {col.render ? col.render(row) : row[col.key]}
          </Table.Td>
        ))}
      </Table.Tr>
    );
  },
);
