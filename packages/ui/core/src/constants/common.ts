import {TaskAssignee, TaskStatusCode} from '../types';
export const LOCALES = ['en', 'ja', 'vi'];
export const DEFAULT_LOCALE = 'ja';
//@ts-ignore
export const API_URL = import.meta.env.VITE_API_URL;

export const DATE_FORMAT_OPTIONS = [
  {value: 'MM/dd/yyyy', label: 'MM/dd/yyyy'},
  {value: 'dd/MM/yyyy', label: 'dd/MM/yyyy'},
  {value: 'yyyy/MM/dd', label: 'yyyy/MM/dd'},
  {value: 'yyyy-MM-dd', label: 'yyyy-MM-dd'},
  {value: 'MM-dd-yyyy', label: 'MM-dd-yyyy'},
  {value: 'dd-MM-yyyy', label: 'dd-MM-yyyy'},
  {value: 'dd.MM.yyyy', label: 'dd.MM.yyyy'},
];

export const DATE_FORMAT = 'YYYY/MM/DD';
export const DATE_TIME_FORMAT = 'YYYY/MM/DD HH:mm';

export const statusColors: Record<TaskStatusCode, string> = {
  new: '#2196F3',
  in_progress: '#FF9800',
  completed: '#4CAF50',
  cancelled: '#9C27B0',
  //   on_hold: '#795548',
};

export const DEFAULT_ASSIGNEE_OPTIONS: TaskAssignee[] = [
  {id: 'VanPD', name: 'Văn Phạm Đình'},
  {id: 'KietTT', name: 'Kiệt Trần Tuấn'},
  {id: 'GiangHH', name: 'Giang Huỳnh Hoàng'},
  {id: 'TienLD', name: 'Tiến Lê Duy'},
  {id: 'TrangLTX', name: 'Trang Lê Thị Xuân'},
  {id: 'ManDM', name: 'Mẫn Dương Minh'},
  {id: 'NguyetNTA', name: 'Nguyệt Nguyễn Thị Ánh'},
];
