import { debug } from "console";
import { createClient } from "redis";

import { AppId, isDebug } from "../const";

export class RedisClient {
  private debug: boolean = isDebug;
  private connectionString: string = "";

  constructor(connectionString: string) {
    if (
      connectionString === undefined ||
      connectionString === null ||
      connectionString.trim().length === 0
    ) {
      throw new Error(`[${AppId}]Connection string is missing in RedisHashClient constructor`);
    }

    this.connectionString = connectionString;

    if (this.debug) {
      debug(
        `[${AppId}][RedisHashClient.constructor] Redis connection string: ${this.connectionString}`,
      );
    }
  }

  async testConnection(): Promise<boolean> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const pong = await client.ping();

      if (this.debug) {
        debug(`[${AppId}][RedisHashClient.testConnection] Ping response: ${pong}`);
      }
      if (pong && pong === "PONG") {
        debug(`[${AppId}][RedisHashClient.testConnection] Connection OK.`);
        return true;
      }
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.testConnection] Error: ${error}`);
    } finally {
      await client.quit();
    }

    debug(`[${AppId}][RedisHashClient.testConnection] Can not connect.`);
    return false;
  }

  async hSetRecords(recordKey: string, records: Record<string, any>): Promise<void> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      await client.hSet(recordKey, Object.entries(records));
      if (this.debug)
        debug(
          `[${AppId}][RedisHashClient.hSet] RecordKey: '${recordKey}'. Records: '${Object.entries(
            records,
          )}'.`,
        );
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.hSet] Error: ${error}`);
    } finally {
      await client.quit();
    }
  }

  async hSet(recordKey: string, key: string, value: string): Promise<void> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      await client.hSet(recordKey, key, value);
      if (this.debug)
        debug(
          `[${AppId}][RedisHashClient.hSet] RecordKey: '${recordKey}'. Key: '${key}'. Value: '${value}'.`,
        );
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.hSet] Error: ${error}`);
    } finally {
      await client.quit();
    }
  }

  async set(key: string, value: object, ttl?: number): Promise<void> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const stringValue = JSON.stringify(value);

      if (ttl) {
        await client.set(key, stringValue, {
          EX: ttl, // in sec
        });
      } else {
        await client.set(key, stringValue);
      }

      console.error(`[${AppId}][RedisHashClient.set] Key: '${key}'. Value: '${stringValue}'`);
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.set] Error: ${error}`);
    } finally {
      await client.quit();
    }
  }

  async hGet<T>(recordKey: string, key: string): Promise<T | undefined> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const data = await client.hGet(recordKey, key);

      if (this.debug)
        debug(
          `[${AppId}][RedisHashClient.hGet] RecordKey: '${recordKey}'. Key: '${key}'. Value: '${data}'`,
        );
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.hGet] Error: ${error}`);
    } finally {
      await client.quit();
    }
    return;
  }

  async hGetAny(recordKey: string, key: string): Promise<any | undefined> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const data = await client.hGet(recordKey, key);

      if (this.debug)
        debug(
          `[${AppId}][RedisHashClient.hGet] RecordKey: '${recordKey}'. Key: '${key}'. Value: '${data}'`,
        );
      return data;
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.hGet] Error: ${error}`);
    } finally {
      await client.quit();
    }
    return;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const stringValue = await client.get(key);

      console.error(`[${AppId}][RedisHashClient.get] Key: '${key}'. Value: '${stringValue}'.`);
      if (stringValue) {
        return JSON.parse(stringValue) as T;
      }
      return null;
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.get] Error: ${error}`);
      return null;
    } finally {
      await client.quit();
    }
  }

  async delete(key: string): Promise<void> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      await client.del(key);
      if (this.debug) debug(`[${AppId}][RedisHashClient.delete] Key: '${key}'.`);
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.delete] Error: ${error}`);
    } finally {
      await client.quit();
    }
  }

  async hDelete(recordKey: string, key: string): Promise<void> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      await client.hDel(recordKey, key);
      if (this.debug)
        debug(`[${AppId}][RedisHashClient.hDelete] Key: '${key}'. RecordKey: '${recordKey}'.`);
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.hDelete] Error: ${error}`);
    } finally {
      await client.quit();
    }
  }

  async getAll<T>(recordKey: string): Promise<T[]> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const dataRows = await client.hGetAll(recordKey);

      if (!dataRows) {
        if (this.debug) debug(`[${AppId}][RedisHashClient.getAll] RecordKey: '${recordKey}'.`);
        return [];
      }
      return Object.values(dataRows).map((data: string) => {
        if (this.debug)
          debug(`[${AppId}][RedisHashClient.getAll] Row: '${data}'. RecordKey '${recordKey}'.`);
        return JSON.parse(data) as T;
      });
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.getAll] Error: ${error}`);
    } finally {
      await client.quit();
    }

    if (this.debug)
      debug(`[${AppId}][RedisHashClient.getAll] Empty array. RecordKey: ${recordKey}.`);
    return [];
  }

  async getAllRecordsWithValueAsT<T>(recordKey: string): Promise<Record<string, T>> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const dataRows = await client.hGetAll(recordKey);

      if (!dataRows) {
        if (this.debug)
          debug(`[${AppId}][RedisHashClient.getAllRecords] RecordKey: '${recordKey}'.`);
        return {};
      }
      return Object.entries(dataRows).reduce(
        (acc: Record<string, T>, [key, data]: [string, string]) => {
          if (this.debug)
            debug(
              `[${AppId}][RedisHashClient.getAllRecords] Row: '${data}'. RecordKey '${recordKey}'.`,
            );
          acc[key] = JSON.parse(data) as T;
          return acc;
        },
        {},
      );
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.getAllRecords] Error: ${error}`);
    } finally {
      await client.quit();
    }

    if (this.debug)
      debug(`[${AppId}][RedisHashClient.getAllRecords] Empty object. RecordKey: ${recordKey}.`);
    return {};
  }

  async getAllRecordsWithValueAsStr(recordKey: string): Promise<Record<string, string>> {
    const client = createClient({
      url: this.connectionString,
    });

    try {
      await client.connect();
      const dataRows = await client.hGetAll(recordKey);

      if (!dataRows) {
        if (this.debug)
          debug(`[${AppId}][RedisHashClient.getAllRecords] RecordKey: '${recordKey}'.`);
        return {};
      }

      return Object.entries(dataRows).reduce(
        (acc: Record<string, string>, [key, data]: [string, string]) => {
          if (this.debug)
            debug(
              `[${AppId}][RedisHashClient.getAllRecords] Row: '${data}'. RecordKey '${recordKey}'.`,
            );
          acc[key] = data;
          return acc;
        },
        {},
      );
    } catch (error) {
      console.error(`[${AppId}][RedisHashClient.getAllRecords] Error: ${error}`);
    } finally {
      await client.quit();
    }

    if (this.debug)
      debug(`[${AppId}][RedisHashClient.getAllRecords] Empty object. RecordKey: ${recordKey}.`);
    return {};
  }
}
