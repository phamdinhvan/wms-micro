export type ColumnType = 'text' | 'number' | 'short' | 'title' | 'action';

export type Column<T = any> = {
  key: string;
  label: string;
  type?: ColumnType;
  render?: (row: T) => React.ReactNode;
  cellClassName?: string | ((row: T) => string);
  headerClassName?: string | ((row: T) => string);
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
};
