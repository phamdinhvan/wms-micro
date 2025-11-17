import {Pagination, Select} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {useTranslation} from '@wms/core';

type Props = {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50', '100'];

export default function PaginationControl({
  total,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: Props) {
  const {t} = useTranslation('table');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const renderPageSizeOptions = () => (
    <Select
      value={String(pageSize)}
      allowDeselect={false}
      onChange={value => onPageSizeChange(Number(value))}
      data={PAGE_SIZE_OPTIONS}
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
    <div className="wms-flex-wrap wms-items-center wms-gap-2 wms-space-y-2 sm:wms-justify-between sm:wms-space-y-0 sm:wms-flex">
      {/* Left: Display item range */}
      <div className="wms-flex wms-items-center wms-justify-between wms-gap-1">
        <div className="wms-text-sm wms-font-medium wms-text-gray-700">
          {t('pagination.showing', {from, to, total})}
        </div>
        {isMobile && (
          <div className="wms-flex wms-flex-wrap wms-items-center wms-justify-end wms-gap-0.5">
            <span className="wms-text-sm wms-font-medium wms-text-gray-700">
              {t('pagination.itemsPerPage')}:
            </span>
            {renderPageSizeOptions()}
          </div>
        )}
      </div>

      {/* Right: Page size and controls */}
      <div className="wms-flex wms-flex-1 wms-flex-wrap wms-items-center wms-justify-center wms-gap-2 wms-rounded-md wms-px-1 wms-text-sm sm:wms-justify-end">
        {!isMobile && (
          <div className="wms-flex wms-items-center wms-gap-2">
            <span className="wms-font-medium wms-text-gray-700">
              {t('pagination.itemsPerPage')}:
            </span>
            {renderPageSizeOptions()}
          </div>
        )}

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
