import { Injectable, NotFoundException } from '@nestjs/common';
import * as Xlsx from 'xlsx';
import { OperatorInfo } from './types/operator-info';

@Injectable()
export class AppService {
  readonly majope;
  readonly majnum;

  constructor() {
    this.majope = this.readFile('data/MAJOPE.xls');
    this.majnum = this.readFile('data/MAJNUM.xls');
  }

  private readFile(file: string) {
    const workbook = Xlsx.readFile(file);
    return Xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  find(nationalNumber: string): OperatorInfo {
    let num = null;
    for (const row of this.majnum) {
      if (
        row.Tranche_Debut <= nationalNumber &&
        nationalNumber <= row.Tranche_Fin
      ) {
        num = row;
        break;
      }
    }
    if (!num) {
      throw new NotFoundException("Can't find operator for this number");
    }
    const op = this.majope.find((it) => it.CODE_OPERATEUR === num['Mnémo']);
    return {
      name: op?.IDENTITE_OPERATEUR || '',
      territory: num.Territoire || '',
      abbreviation: num['Mnémo'],
    };
  }
}
