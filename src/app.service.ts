import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { carrier as getCarrier } from "libphonenumber-geo-carrier";
import { PhoneNumber } from "libphonenumber-js";
import { trimStart } from "lodash";
import * as mccMncList from "mcc-mnc-list";
import { HlrService } from "./hlr/hlr.service";
import { OperatorInfo } from "./types/operator-info";

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly hlrService: HlrService) {}

  async find(pn: PhoneNumber, withHlr: boolean): Promise<OperatorInfo> {
    const country = pn.country;
    const carrier = (await getCarrier(pn))?.toLowerCase();
    if (!carrier) {
      this.logger.error("Carrier not found for number " + pn.number);
      throw new NotFoundException();
    }
    // carrier = this.cleanCarrier(carrier);
    const mccmncs = mccMncList
      .all()
      .filter(
        (it) =>
          (it.brand?.toLowerCase().includes(carrier) ||
            it.operator?.toLowerCase().includes(carrier) ||
            it.brand
              ?.toLowerCase()
              .includes(carrier.split(" ")[0].split("/")[0])) &&
          it.countryCode?.includes(country)
      );
    if (mccmncs.length === 0) {
      throw new NotFoundException(null, "Unable to find operator info");
    }
    const otherMatches =
      mccmncs.length > 1
        ? mccmncs.slice(1).map((it) => ({
            name: carrier,
            territory: it.countryName,
            code: it.mcc + it.mnc,
            mccmnc: it.mcc + it.mnc,
            mcc: it.mcc,
            mnc: it.mnc,
            country: pn.country,
          }))
        : [];

    const first = mccmncs[0];

    const mccMnc = first.mcc + first.mnc;

    let hlr = undefined;
    if (withHlr) {
      const imsi = await this.hlrService.query(trimStart(pn.number, "+"));
      hlr = imsi
        ? {
            mcc: imsi.substring(0, 3),
            mnc: imsi.substring(3),
          }
        : undefined;
      if (hlr) {
        const match = mccMncList.find({
          ...hlr,
        });
        if (match) {
          Object.assign(hlr, {
            name: match.brand,
            mccmnc: match.mcc + match.mnc,
            code: match.mcc + match.mnc,
            country: pn.country,
            territory: match.countryName,
          });
        }
      }
    }

    return {
      name: carrier,
      territory: first.countryName,
      code: mccMnc,
      mccmnc: mccMnc,
      mcc: first.mcc,
      mnc: first.mnc,
      country: pn.country,
      otherMatches,
      hlr,
    };
  }

  cleanCarrier(carrier: string) {
    // if (carrier === "sfr/rife") {
    //   return "sfr";
    // }
    return carrier;
  }
}
