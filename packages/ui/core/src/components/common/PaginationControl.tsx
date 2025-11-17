import {Pagination, Select} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {useTranslation} from '../../i18n';

type Props = {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

export default function PaginationControl({
  total,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: Props) {
  const {t} = useTranslation('gantt');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const renderPageSizeOptions = () => (
    <Select
      value={String(pageSize)}
      allowDeselect={false}
      onChange={value => onPageSizeChange(Number(value))}
      data={['5', '10', '20', '50', '100']}
      size="xs"
      className="wms-w-[80px]"
      styles={{
        input: {
          padding: '0.25rem 0.5rem',
          fontSize: '0.875rem',
          height: '28px',
        },
      }}
      comboboxProps={{
        withinPortal: false,
        position: 'top',
      }}
    />
  );

  return (
    <div className="wms-flex wms-items-center wms-justify-between wms-mt-2 wms-gap-4 wms-flex-wrap">
      {/* Left: Display item range */}
      <div className="wms-flex wms-items-center wms-gap-2 wms-flex-wrap">
        <div className="wms-text-gray-700 wms-font-medium wms-text-sm wms-whitespace-nowrap">
          {t('pagination.showing', {from, to, total})}
        </div>
      </div>

      {/* Right: Page size and controls */}
      <div className="wms-flex wms-items-center wms-gap-2 wms-flex-wrap">
        <div className="wms-flex wms-items-center wms-gap-2">
          <span className="wms-text-gray-700 wms-font-medium wms-text-sm wms-whitespace-nowrap">
            {t('pagination.itemsPerPage') || 'Items per page'}:
          </span>
          {renderPageSizeOptions()}
        </div>

        <Pagination
          siblings={isMobile ? 0 : 1}
          boundaries={isMobile ? 0 : 1}
          value={page}
          onChange={onPageChange}
          total={totalPages}
          hideWithOnePage
          size="sm"
          styles={{
            control: {
              fontSize: '0.75rem',
              minWidth: '28px',
              minHeight: '28px',
              borderRadius: '4px',
            },
          }}
        />
      </div>
    </div>
  );
}
