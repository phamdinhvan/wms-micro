import dayjs from 'dayjs';

type FormatDate = Date | string | number | null | undefined;

export class DateUtils {
  private static _instance: DateUtils;

  private static readonly DEFAULT_FORMAT = 'YYYY-MM-DD';

  private constructor() {}
  static formatDate(
    date?: FormatDate,
    format: string = this.DEFAULT_FORMAT,
  ): string {
    if (!date) return '';
    return dayjs(date).format(format);
  }
  static parseDate(
    dateString: string,
    format: string = this.DEFAULT_FORMAT,
  ): Date {
    return dayjs(dateString, format).toDate();
  }
  static addDays(date: FormatDate, days: number): Date {
    return dayjs(date).add(days, 'day').toDate();
  }
  static differenceInDays(date1: FormatDate, date2: FormatDate): number {
    return dayjs(date1).diff(dayjs(date2), 'day');
  }
  static isBefore(date1: FormatDate, date2: FormatDate): boolean {
    return dayjs(date1).isBefore(dayjs(date2));
  }
  static isAfter(date1: FormatDate, date2: FormatDate): boolean {
    return dayjs(date1).isAfter(dayjs(date2));
  }
  static isSame(date1: FormatDate, date2: FormatDate): boolean {
    return dayjs(date1).isSame(dayjs(date2));
  }

  static getInstance(): DateUtils {
    if (!this._instance) {
      this._instance = new DateUtils();
    }
    return this._instance;
  }
}
