/**
 * Helper utilities for External Fields with dynamic data extraction
 */

import {FieldValue} from '../types';

/**
 * Helper để get nested value từ object by path
 * Example: getNestedValue({a: {b: {c: 123}}}, 'a.b.c') => 123
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

/**
 * Factory để tạo onChange handler cho dependency extraction
 *
 * @param sourceDataMap - Map chứa full data objects indexed by ID
 * @param sourcePath - Path đến data cần extract (e.g., 'equipment.name')
 *
 * Usage:
 * dependencies: [{
 *   sourceField: 'taskMaster',
 *   targetField: 'equipment',
 *   onChange: createExtractionHandler(sourceDataMap, 'taskMaster', 'equipment.name')
 * }]
 */
export function createExtractionHandler(
  sourceDataMap: Record<string, Record<string, any>> | undefined,
  sourceFieldKey: string,
  sourcePath: string,
) {
  return (sourceValue: FieldValue): FieldValue => {
    if (!sourceValue || !sourceDataMap) return '';

    // Get full source object from map
    const sourceId = String(sourceValue);
    const sourceData = sourceDataMap[sourceFieldKey]?.[sourceId];

    if (!sourceData) return '';

    // Extract nested value
    const extractedValue = getNestedValue(sourceData, sourcePath);
    return extractedValue !== undefined ? extractedValue : '';
  };
}

/**
 * Helper để filter options based on dependent field value
 *
 * @param allOptions - All available options
 * @param filterField - Field name to filter by
 * @param filterValue - Value to match
 *
 * Usage trong fetchOptions callback
 */
export function filterOptionsByField(
  allOptions: any[],
  filterField: string,
  filterValue: FieldValue,
) {
  if (!filterValue) return [];

  return allOptions.filter(option => {
    const fieldValue = getNestedValue(option, filterField);
    return fieldValue === filterValue;
  });
}
