import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'materiaByte'
})
export class BytePipe implements PipeTransform {

  transform(bytes: any, precision?: any): any {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }

}
