import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";
import { debug } from "console";

import { AppId, isDebug } from "../const";
import { RedisClient } from "./redis-client";

export type RedisAPLConfig = {
  uniqueRedisRecordKey: string;
  redisConnectionString: string;
};

export class RedisAPL implements APL {
  private config?: RedisAPLConfig;
  private debug: boolean = isDebug;
  private client?: RedisClient;

  constructor(config: RedisAPLConfig) {
    if (!config) {
      throw new Error(`[${AppId}] No config provided for RedisAPL`);
    }

    if (!config.uniqueRedisRecordKey) {
      throw new Error(`[${AppId}]  No uniqueRedisRecordKey provided in RedisAPL config`);
    }

    if (!config.redisConnectionString) {
      throw new Error(
        `[${AppId}]  Missing REDIS_CONNECTION_STRING env variable or in RedisAPL config`,
      );
    }

    if (this.debug) {
      debug(`[${AppId}][RedisAPL.constructor] Redis record key: ${config?.uniqueRedisRecordKey}`);
    }

    this.config = config;
    this.client = new RedisClient(this.config.redisConnectionString);
  }

  private getApplicationRedisKey(): string {
    if (!this.config) {
      throw new Error(`[${AppId}] No config provided for RedisAPL`);
    }
    return `${AppId}.auth:${this.config.uniqueRedisRecordKey}`;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    try {
      return await this.client?.hGet<AuthData>(this.getApplicationRedisKey(), saleorApiUrl);
    } catch (error) {
      console.error(`[${AppId}] Error in RedisAPL 'get' method: ${error}`);
    }
    return;
  }

  async set(authData: AuthData): Promise<void> {
    try {
      await this.client?.hSet(
        this.getApplicationRedisKey(),
        authData.saleorApiUrl,
        JSON.stringify(authData),
      );
    } catch (error) {
      console.error(`[${AppId}] Error in RedisAPL 'set' method: ${error}`);
    }
  }

  async delete(saleorApiUrl: string): Promise<void> {
    try {
      await this.client?.hDelete(this.getApplicationRedisKey(), saleorApiUrl);
    } catch (error) {
      console.error(`[${AppId}] Error in RedisAPL 'delete' method: ${error}`);
    }
  }

  async getAll(): Promise<AuthData[]> {
    try {
      const result = await this.client?.getAll<AuthData>(this.getApplicationRedisKey());

      if (result) return result;
    } catch (error) {
      console.error(`[${AppId}] Error in RedisAPL 'getAll' method: ${error}`);
    }
    return [];
  }

  async isReady(): Promise<AplReadyResult> {
    let connectionOK: boolean = false;

    try {
      connectionOK = (await this.client?.testConnection()) ?? false;
    } catch (error) {
      console.error(`[${AppId}] Error in RedisAPL 'isReady' method: ${error}`);
    }

    return connectionOK == true
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new Error(`[${AppId}] Redis Hash Client failed to connect to the redis server`),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const configured = this.config?.uniqueRedisRecordKey && this.config?.redisConnectionString;

    return configured
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new Error(
            `[${AppId}] Missing redis env variables for RedisAPL, please provide REDIS_CONNECTION_STRING and REDIS_RECORD_KEY`,
          ),
        };
  }
}
