import { Injectable, Logger } from "@nestjs/common";

const TABLE = "hlr";

@Injectable()
export class HlrService {
  private readonly logger = new Logger(HlrService.name);
  private latestAvailableUrl = "SINCH_HLR_URL_0";

  constructor() {}

  async query(msisdn: string, retries = 0): Promise<string | null> {
    if (retries > +process.env.SINCH_HLR_MAX_RETRIES) {
      return null;
    }
    return await new Promise(async (resolve, reject) => {
      const abortController = new AbortController();
      const timeout = setTimeout(async () => {
        abortController.abort();
      }, +process.env.SINCH_HLR_TIMEOUT_MS);
      const retry = async () => {
        this.logger.log("Retrying ...");
        clearTimeout(timeout);
        this.rotateUrl();
        resolve(await this.query(msisdn, ++retries));
        return null;
      };
      try {
        const res = await fetch(this.getUrl() + `?msisdn=${msisdn}`, {
          headers: this.getHeaders(),
          method: "GET",
          signal: abortController.signal,
        });
        if (res.status !== 200) {
          this.logger.error("Status code is not 200");
          resolve(await retry());
        }
        const text = (await res.text()) || "";

        const parts = text.split(";");
        let imsi = null;
        let result = null;
        for (const part of parts) {
          if (part.startsWith("imsi=")) {
            imsi = part.split("imsi=").pop();
          }
          if (part.startsWith("result=")) {
            result = part.split("result=").pop();
          }
        }
        if ("OK" == result) {
          resolve(imsi);
        } else {
          resolve(await retry());
        }
      } catch (e) {
        this.logger.error(e);
        resolve(await retry());
      }
    });
  }

  getHeaders() {
    const basic = Buffer.from(
      `${process.env.SINCH_HLR_USERNAME}:${process.env.SINCH_HLR_PASSWORD}`
    ).toString("base64");
    return {
      Authorization: `Basic ${basic}`,
    };
  }

  rotateUrl() {
    const prefix = "SINCH_HLR_URL_";
    const index = +this.latestAvailableUrl.split(prefix).pop();
    const nextKey = `${prefix}${index + 1}`;
    if (process.env[nextKey]) {
      this.latestAvailableUrl = nextKey;
    } else {
      this.latestAvailableUrl = `${prefix}${0}`;
    }
  }

  getUrl(rotate = false) {
    if (rotate) {
      this.rotateUrl();
    }
    return process.env[this.latestAvailableUrl];
  }
}
