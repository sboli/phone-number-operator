export class OperatorInfoHlr {
  mcc: string;
  mnc: string;
}

export class OperatorInfo {
  mccmnc: string;
  code: string;
  name: string;
  territory: string;
  mcc: string;
  mnc: string;
  otherMatches?: OperatorInfo[];
  country: string;
  hlr?: OperatorInfoHlr;
}
