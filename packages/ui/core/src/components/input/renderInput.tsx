'use client';

import {
  Checkbox,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  Textarea,
  TextInput,
} from '@mantine/core';
import {DateInput, TimeInput} from '@mantine/dates';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React from 'react';
import {Controller, UseFormReturn} from 'react-hook-form';
import {useTranslation} from '../../i18n';
import {TFormInput} from '../../types';
import AppDateTimePicker from '../date/AppDateTimePicker';

dayjs.extend(utc);

type RenderWithLabelProps = {
  inputElement: React.ReactNode;
  label?: React.ReactNode;
  withAsterisk?: boolean;
  inputWidth?: string;
  labelWidth?: string;
  isShowLabel?: boolean;
  type?: string;
};
export const RenderWithLabel = ({
  inputElement,
  label,
  withAsterisk,
  inputWidth,
  labelWidth,
  isShowLabel = true,
  type = 'text',
}: RenderWithLabelProps) => {
  const {t} = useTranslation('gantt');
  return (
    <div
      className={`wms-flex wms-items-start md:wms-items-center wms-gap-2 wms-mb-2 wms-w-full md:wms-flex-row ${
        type === 'right-checkbox' ? '' : 'wms-flex-col'
      }`}>
      {label && isShowLabel && (
        <label
          className={`${labelWidth} wms-font-medium wms-text-sm wms-text-gray-800 wms-shrink-0 wms-pb-[6px] md:wms-whitespace-pre-line wms-whitespace-normal wms-leading-4 wms-align-middle`}>
          {t(label as string)}
          {withAsterisk &&
            (t('language') === 'ja' ? (
              <span className="wms-text-white wms-bg-red-600 wms-rounded wms-px-[6px] wms-text-xs wms-ml-[2px] wms-select-none wms-pointer-events-none">
                {t('common.required')}
              </span>
            ) : (
              <span className="wms-text-red-500 wms-pointer-events-none wms-ml-[2px]">
                *
              </span>
            ))}
        </label>
      )}
      <div className="wms-grow-0 wms-w-full">
        <div className={`${inputWidth}`}>{inputElement}</div>
      </div>
    </div>
  );
};

export function renderInput(
  fieldConfig: TFormInput,
  methods: UseFormReturn<any>,
) {
  const {
    name,
    type,
    label,
    placeholder,
    withAsterisk,
    options,
    rows = 3,
    min,
    max,
    disabled,
    maxLength,
    autoFocus,
    inputWidth = 'wms-w-full',
    labelWidth = 'wms-w-[120px]', // default width if not provided
    isShowLabel = true,
    isTranslate = false, // Default to false
  } = fieldConfig;
  const {t} = useTranslation('gantt');

  // Additional properties that might exist on fieldConfig
  const decimalScale = (fieldConfig as any).decimalScale || 0;
  const maxRows = (fieldConfig as any).maxRows || 10;
  const numberUnit = (fieldConfig as any).numberUnit;
  const hidden = (fieldConfig as any).hidden || false;
  const checkboxLabel = (fieldConfig as any).checkboxLabel;

  return hidden ? null : (
    <Controller
      name={name}
      control={methods.control}
      render={({field, fieldState}) => {
        const error = fieldState.error?.message;
        const commonProps = {
          placeholder: placeholder ? t(placeholder) : label ? t(label) : '',
          disabled,
          autoFocus,
          error,
          classNames: {
            input: 'wms-w-full',
            error: 'wms-text-red-500',
          },
          leftSection: (fieldConfig as any).leftSection,
          rightSection: (fieldConfig as any).rightSection,
          'data-autofocus': autoFocus ? 'true' : undefined,
        };

        switch (type) {
          case 'text':
            return (
              <RenderWithLabel
                inputElement={
                  <TextInput
                    {...commonProps}
                    {...field}
                    value={field.value || ''}
                    maxLength={maxLength}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'number':
            return (
              <RenderWithLabel
                inputElement={
                  <div className="wms-relative">
                    <NumberInput
                      {...commonProps}
                      value={field.value}
                      onChange={val => field.onChange(val)}
                      min={min}
                      max={max}
                      decimalScale={decimalScale}
                      classNames={{
                        ...commonProps.classNames,
                        input: `${commonProps.classNames.input} ${
                          numberUnit ? 'wms-pr-12' : 'wms-pr-8'
                        }`,
                      }}
                    />
                    {numberUnit && (
                      <span className="wms-absolute wms-right-4 wms-top-[18px] wms-transform wms--translate-y-1/2 wms-text-sm wms-text-gray-600 wms-select-none wms-pointer-events-none">
                        {numberUnit}
                      </span>
                    )}
                  </div>
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );
          case 'textarea':
            return (
              <RenderWithLabel
                inputElement={
                  <div className="wms-relative">
                    <Textarea
                      {...commonProps}
                      {...field}
                      autosize
                      minRows={rows}
                      maxRows={maxRows}
                      maxLength={maxLength}
                    />
                    {!!maxLength && maxLength > 0 && (
                      <div className="wms-text-xs wms-text-gray-500 wms-mt-1 wms-text-right">
                        {field.value?.length || 0}/{maxLength}
                        {t('common.characters')}
                      </div>
                    )}
                  </div>
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'checkbox':
            return (
              <div className="wms-flex md:wms-items-center wms-gap-2 wms-mb-2">
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e: any) => field.onChange(e.currentTarget.checked)}
                  label={
                    <div className="wms-text-sm wms-font-medium wms-text-gray-800">
                      {t(label as string)?.toString()}
                    </div>
                  }
                  disabled={disabled}
                  color="blue"
                  iconColor="white"
                />
              </div>
            );
          case 'right-checkbox':
            return (
              <RenderWithLabel
                type="right-checkbox"
                inputElement={
                  <Checkbox
                    className="wms-mt-[4px]"
                    {...field}
                    checked={field.value}
                    onChange={(e: any) =>
                      field.onChange(e.currentTarget.checked)
                    }
                    disabled={disabled}
                    label={checkboxLabel ? t(checkboxLabel) : null}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );
          case 'select': {
            // Transform options based on isTranslate flag
            const selectOptions = isTranslate
              ? (options ?? []).map((opt: any) => ({
                  value: opt.value,
                  label:
                    typeof opt.label === 'string' ? t(opt.label) : opt.label,
                }))
              : (options ?? []);

            return (
              <RenderWithLabel
                inputElement={
                  <Select
                    {...commonProps}
                    data={selectOptions}
                    value={field.value || null}
                    onChange={field.onChange}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );
          }

          case 'multiselect':
            return (
              <RenderWithLabel
                inputElement={
                  <MultiSelect
                    {...commonProps}
                    data={options ?? []}
                    value={field.value || []}
                    onChange={val => field.onChange(val || [])}
                    searchable
                    clearable
                    comboboxProps={{withinPortal: false}}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'radio':
            return (
              <RenderWithLabel
                inputElement={
                  <Radio.Group
                    value={field.value}
                    onChange={field.onChange}
                    name={field.name}
                    className="wms-space-y-1">
                    {(options ?? []).map((opt: any) => (
                      <Radio
                        key={opt.value}
                        value={opt.value}
                        label={
                          typeof opt.label === 'string'
                            ? t(opt.label)
                            : opt.label
                        }
                      />
                    ))}
                  </Radio.Group>
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'date': {
            const {rightSection, ...rest} = commonProps;
            return (
              <RenderWithLabel
                inputElement={
                  <DateInput
                    valueFormat="YYYY/MM/DD"
                    clearable
                    {...rest}
                    value={
                      field.value
                        ? dayjs.utc(field.value).local().toDate()
                        : null
                    }
                    onChange={field.onChange}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );
          }

          case 'time':
            return (
              <RenderWithLabel
                inputElement={
                  <TimeInput
                    {...commonProps}
                    value={field.value || ''}
                    onChange={(event: any) => {
                      // Convert local time string → UTC time string
                      const localTime = dayjs(
                        event.currentTarget.value,
                        'HH:mm',
                      );
                      const utcTime = localTime.utc().format('HH:mm');
                      field.onChange(utcTime);
                    }}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'datetime':
            return (
              <RenderWithLabel
                inputElement={
                  <AppDateTimePicker
                    {...commonProps}
                    value={
                      field.value
                        ? dayjs.utc(field.value).local().toDate()
                        : null
                    }
                    onChange={(value: any) => {
                      // Convert to UTC string when saving
                      field.onChange(
                        value
                          ? dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss')
                          : '',
                      );
                    }}
                  />
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          case 'richtext':
            return (
              <RenderWithLabel
                inputElement={
                  <div className="wms-relative">
                    <Textarea
                      {...commonProps}
                      {...field}
                      autosize
                      minRows={rows}
                      maxRows={maxRows}
                      maxLength={maxLength || 1000}
                      placeholder={t(placeholder as string)}
                    />
                    {!!maxLength && maxLength > 0 && (
                      <div className="wms-text-xs wms-text-gray-500 wms-mt-1 wms-text-right">
                        {field.value?.length || 0}/{maxLength || 1000}
                        {t('common.characters')}
                      </div>
                    )}
                  </div>
                }
                label={label}
                withAsterisk={withAsterisk}
                inputWidth={inputWidth}
                labelWidth={labelWidth}
                isShowLabel={isShowLabel}
              />
            );

          default:
            return <span style={{display: 'none'}} />;
        }
      }}
    />
  );
}
