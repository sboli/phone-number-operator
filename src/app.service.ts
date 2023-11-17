import { Injectable, NotFoundException } from "@nestjs/common";
import { carrier as getCarrier } from "libphonenumber-geo-carrier";
import { PhoneNumber } from "libphonenumber-js";
import * as mccMncList from "mcc-mnc-list";
import { OperatorInfo } from "./types/operator-info";

@Injectable()
export class AppService {
  constructor() {}

  async find(pn: PhoneNumber): Promise<OperatorInfo> {
    const country = pn.country;
    const carrier = (await getCarrier(pn)).toLowerCase();
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

    console.log(carrier);
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

    return {
      name: carrier,
      territory: first.countryName,
      code: mccMnc,
      mccmnc: mccMnc,
      mcc: first.mcc,
      mnc: first.mnc,
      country: pn.country,
      otherMatches,
    };
  }

  cleanCarrier(carrier: string) {
    // if (carrier === "sfr/rife") {
    //   return "sfr";
    // }
    return carrier;
  }
}
