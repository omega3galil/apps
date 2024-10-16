import { APL, FileAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { RedisAPL } from "./lib/redis-apl";

const aplType = process.env.APL ?? "file";

export let apl: APL;

switch (aplType) {
  case "redis":
    const uniqueKey = process.env.UNIQUE_REDIS_RECORD_KEY || undefined;
    const connectionString = process.env.REDIS_CONNECTION_STRING || undefined;

    if (uniqueKey === undefined || connectionString === undefined) {
      apl = new FileAPL();
    } else {
      apl = new RedisAPL({
        uniqueRedisRecordKey: uniqueKey,
        redisConnectionString: connectionString,
      });
    }

    break;
  case "upstash":
    apl = new UpstashAPL();

    break;
  case "file":
    apl = new FileAPL();

    break;
  case "saleor-cloud": {
    if (!process.env.REST_APL_ENDPOINT || !process.env.REST_APL_TOKEN) {
      throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
    }

    apl = new SaleorCloudAPL({
      resourceUrl: process.env.REST_APL_ENDPOINT,
      token: process.env.REST_APL_TOKEN,
    });

    break;
  }
  default: {
    throw new Error("Invalid APL config, ");
  }
}
export const saleorApp = new SaleorApp({
  apl,
});

export const REQUIRED_SALEOR_VERSION = ">=3.11.7 <4";
