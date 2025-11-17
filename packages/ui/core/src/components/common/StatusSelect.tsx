import {Combobox, useCombobox} from '@mantine/core';
import {IconCheck, IconChevronDown, IconPointFilled} from '@tabler/icons-react';
import React from 'react';
import {useTranslation} from '../../i18n';
import {TaskStatus} from '../../types';

interface StatusSelectProps {
  value?: string;
  onChange: (value: string | null) => void;
  statusOptions: TaskStatus[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  statusOptions,
  size = 'xs',
  disabled = false,
}) => {
  const {t} = useTranslation('gantt');
  const currentStatus = value;
  const backgroundColor =
    statusOptions.find(s => s.code === currentStatus)?.color || '#6c757d';

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const selected = statusOptions.find(s => s.code === currentStatus)?.label;
  return (
    <>
      <style>{`
        .status-pill {
          width: 90px;
          background: var(--status-bg);
          color: #fff;
          height: 24px;
          // padding: 0 5px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 9999px;
          border: none;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          position: relative;
          transition: box-shadow .15s ease, transform .15s ease, filter .15s ease;
          cursor: pointer;
          user-select: none;
        }
        .status-pill:hover,
        .status-pill:focus-visible,
        .status-pill[data-open="true"] {
          box-shadow: 0 0 0 2px #fff; /* outer white border 1–2px */
          transform: translateY(-1px);
          filter: brightness(1.05);
          outline: none;
        }
        .status-pill[aria-disabled="true"] {
          opacity: .6;
          cursor: not-allowed;
          transform: none !important;
          filter: none !important;
          box-shadow: none !important;
        }
        .status-pill .status-chevron {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%) translateX(4px);
          opacity: 0;
          transition: opacity .12s ease, transform .12s ease;
          pointer-events: none;
        }
        .status-pill:hover .status-chevron,
        .status-pill:focus-visible .status-chevron,
        .status-pill[data-open="true"] .status-chevron {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>

      <Combobox
        store={combobox}
        onOptionSubmit={val => {
          const selectedStatus = statusOptions.find(s => s.code === val);
          onChange(selectedStatus?.code || null);
          combobox.closeDropdown();
        }}
        disabled={disabled}
        width={140}
        position="bottom-start">
        <Combobox.Target>
          <button
            type="button"
            className="status-pill"
            style={{['--status-bg' as any]: backgroundColor}}
            data-open={combobox.dropdownOpened || undefined}
            aria-disabled={disabled ? 'true' : undefined}
            onClick={() => !disabled && combobox.toggleDropdown()}>
            <span style={{lineHeight: 1}}>
              {selected ?? t('common.status.select')}
            </span>
            <span className="status-chevron">
              <IconChevronDown size={12} color="white" />
            </span>
          </button>
        </Combobox.Target>

        <Combobox.Dropdown
          style={{
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            border: '1px solid #e9ecef',
            borderRadius: 8,
          }}>
          <Combobox.Options>
            {statusOptions.map(opt => {
              const checked = opt.code === currentStatus;
              return (
                <Combobox.Option
                  value={opt.code}
                  key={opt.code}
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <IconPointFilled size={20} color={opt.color} />
                  <span style={{flex: 1}}>{opt.label}</span>
                  {checked && <IconCheck size={14} />}
                </Combobox.Option>
              );
            })}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};
