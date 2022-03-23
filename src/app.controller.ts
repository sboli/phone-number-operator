import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { trimStart } from 'lodash';
import { AppService } from './app.service';
import { OperatorInfo } from './types/operator-info';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:internationalNumber')
  find(
    @Param('internationalNumber') internationalNumber: string
  ): OperatorInfo {
    const pn = parsePhoneNumberFromString(
      '+' + trimStart(internationalNumber, '+')
    );
    if (!pn?.isValid()) {
      throw new BadRequestException('Please provide a valid phone number');
    }

    return this.appService.find(pn.formatNational().replace(/ /gim, ''));
  }
}
