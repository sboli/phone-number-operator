import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import parsePhoneNumberFromString from "libphonenumber-js";
import { trimStart } from "lodash";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    // this.find("590690861909").then((r) => console.log("RESPONSE", r));
  }

  @Get("/:internationalNumber")
  async find(@Param("internationalNumber") internationalNumber: string) {
    internationalNumber = "+" + trimStart(internationalNumber, "+");
    const pn = parsePhoneNumberFromString(internationalNumber);
    if (!pn?.isValid()) {
      throw new BadRequestException("Please provide a valid phone number");
    }

    return await this.appService.find(pn);
  }
}
