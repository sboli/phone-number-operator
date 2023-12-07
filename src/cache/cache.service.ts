import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@nestjs/common";

const TABLE = "hlr";
const TTL_MS = 10_368_000_000; // 120 days

@Injectable()
export class CacheService {
  private dynamoDb: DynamoDBDocumentClient;
  private docClient: DynamoDBDocumentClient;
  private inMemory = new Map<string, any>();

  constructor() {
    this.dynamoDb = new DynamoDBClient();
    this.docClient = DynamoDBDocumentClient.from(this.dynamoDb);
  }

  async has(msisdn: string) {
    const v = this.inMemory.get(msisdn);
    if (v && v.Ttl > Date.now()) {
      return true;
    }
    try {
      await this.preGet(msisdn);
    } catch (e) {}
    return false;
  }

  async preGet(msisdn: string) {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: `Msisdn = :msisdn`,
        ExpressionAttributeValues: {
          ":msisdn": msisdn,
        },
      })
    );
    if (res.Count >= 1) {
      const item = res.Items[0];
      const msisdn = item.Msisdn;
      delete item.Msidn;
      item.Ttl = item.Ttl * 1000;
      this.inMemory.set(msisdn, item);
    }
  }

  get(msisdn: string) {
    return this.inMemory.get(msisdn);
  }

  async set(msisdn: string, value: any) {
    const Ttl = Math.round((Date.now() + TTL_MS) / 1000);
    this.inMemory.set(msisdn, {
      ...value,
      Ttl: Ttl * 1000,
    });
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: TABLE,
          Item: {
            Msisdn: msisdn,
            Ttl,
            ...value,
          },
        })
      );
    } catch (e) {}
  }
}
