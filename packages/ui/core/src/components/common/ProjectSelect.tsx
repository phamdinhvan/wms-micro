import {ActionIcon, Select, SelectProps} from '@mantine/core';
import {IconChevronDown} from '@tabler/icons-react';
import {useTranslation} from '@wms/core';
import {cn} from '../../utils';

type ProjectSelectProps = SelectProps & {
  isLoading?: boolean;
};

export function ProjectSelect({
  isLoading: isProjectsLoading = false,
  ...props
}: ProjectSelectProps) {
  const [t] = useTranslation();
  return (
    <div className="wms-border-b wms-border-gray-200 wms-bg-white">
      <div className="wms-px-3 wms-py-2 wms-flex wms-items-center wms-gap-2 wms-border-b wms-border-gray-200">
        <Select
          w={320}
          searchable
          placeholder={t('gantt.project.selectPlaceholder')}
          disabled={isProjectsLoading}
          nothingFoundMessage={
            isProjectsLoading ? t('common.loading') : t('common.noData')
          }
          rightSection={
            <ActionIcon size="xs" variant="transparent" color="black">
              <IconChevronDown />
            </ActionIcon>
          }
          className={cn(
            'wms-bg-white wms-border-gray-300 wms-border wms-rounded wms-shadow-sm',
            props.className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
