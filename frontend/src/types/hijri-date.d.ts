declare module 'hijri-date' {
  export default class HijriDate {
    constructor(date?: Date);
    format(format: string): string;
    toString(): string;
    day: number;
    month: number;
    monthName: string;
    year: number;
    static toHijri(date: Date): HijriDate;
  }
}
