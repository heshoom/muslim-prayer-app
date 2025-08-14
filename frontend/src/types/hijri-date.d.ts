declare module 'hijri-date' {
  export default class HijriDate {
    constructor(date?: Date);
    format(format: string): string;
    static toHijri(date: Date): HijriDate;
  }
}
