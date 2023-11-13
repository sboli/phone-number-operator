import { Injectable, NotFoundException } from "@nestjs/common";
import { carrier as getCarrier } from "libphonenumber-geo-carrier";
import { PhoneNumber } from "libphonenumber-js";
import * as mccMncList from "mcc-mnc-list";
import { OperatorInfo } from "./types/operator-info";

@Injectable()
export class AppService {
  constructor() {}

  private newMatch(mccmnc: mccMncList.Operator) {}

  async find(pn: PhoneNumber): Promise<OperatorInfo> {
    const country = pn.country;
    const carrier = await getCarrier(pn);
    const mccmncs = mccMncList
      .all()
      .filter(
        (it) =>
          (it.brand?.includes(carrier) || it.operator?.includes(carrier)) &&
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
}
