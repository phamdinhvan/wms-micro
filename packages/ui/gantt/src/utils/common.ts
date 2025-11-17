import {ApiTaskOption, ApiTaskOptionsResponse} from '@wms/core';
import dayjs from 'dayjs';

// parse QueryParams when have array param
export const parseQueryParams = (params?: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  if (!params) return '';

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) searchParams.append(`${key}[]`, String(item));
      }
    } else {
      searchParams.set(key, String(value as string));
    }
  }
  return searchParams.toString();
};

export const replaceDynamicValues = (
  template: string,
  dynamicValues: {[key: string]: string | number},
) => {
  const dynamicKeys = Object.keys(dynamicValues);
  let replacedUrl = template;

  dynamicKeys.forEach(key => {
    // Use a regex pattern that matches colons and the key
    const pattern = new RegExp(`:${key}`, 'g');
    replacedUrl = replacedUrl.replace(pattern, dynamicValues[key]?.toString());
  });

  return replacedUrl;
};

export function parseTime(
  time: string | number | Date | null | undefined,
  format = 'YYYY/MM/DD',
): string {
  if (!time) return '';
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format(format) : '';
}

export const isValidDate = (str: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

const VALID_SYMBOLS = '_-';

export const validateCode = (code?: string): boolean => {
  if (!code) return false;
  const validPattern = new RegExp(`^[A-Za-z0-9${VALID_SYMBOLS}]+$`);
  return validPattern.test(code);
};

export const checkRequiredFieldsFilled = (
  formData: Record<string, any>,
  requiredFields: (string | string[])[],
): boolean => {
  return requiredFields.every(field => {
    if (Array.isArray(field)) {
      const [mainField, subField] = field;
      const mainValue = formData[mainField];
      if (Array.isArray(mainValue)) {
        return mainValue.some(
          item =>
            item[subField] !== null &&
            item[subField] !== undefined &&
            item[subField] !== '',
        );
      }
      return false;
    }

    return (
      formData[field] !== null &&
      formData[field] !== '' &&
      formData[field] !== undefined
    );
  });
};

export const mapTaskOptions = (
  apiData: ApiTaskOptionsResponse,
  locale: keyof ApiTaskOption = 'en',
) => {
  return Object.entries(apiData).map(([code, value]) => ({
    code,
    color: value.color,
    label: value[locale] ?? code, // fallback to code if label missing
  }));
};
