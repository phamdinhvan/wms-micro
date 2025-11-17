export type TFormInput = {
  label: string;
  name: string;
  rightSectionWidth?: number;
  type:
    | 'area'
    | 'calc'
    | 'contact'
    | 'text'
    | 'number'
    | 'only-number'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'nationalCode'
    | 'saleman'
    | 'time'
    | 'richtext'
    | 'recipient'
    | 'file'
    | 'assignee'
    | 'lead'
    | 'agency'
    | 'user'
    | 'postcode'
    | 'prefecture'
    | 'checkbox'
    | 'right-checkbox'
    | 'textarea'
    | 'radio'
    | 'phone'
    | 'nationality'
    | 'date-range'
    | 'datetime';
  placeholder?: string;
  row?: number;
  withAsterisk?: boolean;
  maxLength?: number;
  vlStartTime?: string;
  leftSection?: any;
  rightSection?: any;
  currency?: boolean;
  options?: {label: string; value: string}[] | string[];
  optionKey?: string;
  isTranslate?: boolean; // Flag to determine if options should be translated
  disabled?: boolean;
  column?: number;
  group?: string;
  addressName?: string;
  addressName2?: string;
  addressName3?: string;
  prefName?: string;
  minDate?: Date;
  maxDate?: Date;
  min?: number;
  max?: number;
  rows?: number;
  viewSystem?: boolean;
  viewClient?: boolean;
  isExist?: string;
  viewOnly?: boolean;
  autoFocus?: boolean;
  inputWidth?: string;
  labelWidth?: string;
  isShowLabel?: boolean;
  // API select properties
  apiUrl?: string;
  valueKey?: string;
  labelKey?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
};

export type TFormGroup = {
  name: string;
  label?: string;
  col: {col: number; field: TFormInput[]}[];
  viewClient?: boolean;
};
