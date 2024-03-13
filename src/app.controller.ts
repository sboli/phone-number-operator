import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import parsePhoneNumberFromString from "libphonenumber-js";
import { trimStart } from "lodash";
import { AppService } from "./app.service";
import { CacheService } from "./cache/cache.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService
  ) {}

  @Get("/:internationalNumber")
  async find(
    @Param("internationalNumber") internationalNumber: string,
    @Query("hlr") hlr: string
  ) {
    const withHlr = hlr === "true";
    internationalNumber = "+" + trimStart(internationalNumber, "+");
    const pn = parsePhoneNumberFromString(internationalNumber);
    if (!pn?.isValid()) {
      throw new BadRequestException("Please provide a valid phone number");
    }
    if (!withHlr) {
      return await this.appService.find(pn, false);
    }
    if (await this.cacheService.has(pn.number)) {
      const res = this.cacheService.get(pn.number);
      if (!res) {
        throw new NotFoundException();
      }
      return res;
    } else {
      const res = await this.appService.find(pn, false);
      await this.cacheService.set(pn.number, res);
      return res;
    }
  }
}
