declare module 'moment-hijri' {
  import { Moment } from 'moment';
  
  interface MomentHijri extends Moment {
    format(format: string): string;
    iDate(): number;
    iMonth(): number;
    iYear(): number;
  }
  
  function moment(): MomentHijri;
  function moment(date: Date | string | number): MomentHijri;
  
  export = moment;
}
