import {ApiTaskOption, ApiTaskOptionsResponse} from '../types';

export class CommonUtils {
  static parseQueryParams = (params?: Record<string, unknown>): string => {
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

  static replaceDynamicValues = (
    template: string,
    dynamicValues: {[key: string]: string | number},
  ) => {
    const dynamicKeys = Object.keys(dynamicValues);
    let replacedUrl = template;

    dynamicKeys.forEach(key => {
      // Use a regex pattern that matches colons and the key
      const pattern = new RegExp(`:${key}`, 'g');
      replacedUrl = replacedUrl.replace(
        pattern,
        dynamicValues[key]?.toString(),
      );
    });

    return replacedUrl;
  };

  static mapTaskOptions = (
    apiData: ApiTaskOptionsResponse,
    locale: keyof ApiTaskOption = 'en',
  ) => {
    return Object.entries(apiData).map(([code, value]) => ({
      code,
      color: value.color,
      label: value[locale] ?? code, // fallback to code if label missing
    }));
  };
}
