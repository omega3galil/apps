import { AppId } from "../const";
import { RedisClient } from "./redis-client";

export class RedisRepository {
  private static CONNECTION_STRING = process.env.REDIS_CONNECTION_STRING || undefined;

  static async get<T>(recordType: string, recordId: string): Promise<T | undefined> {
    const key = RedisRepository.getKey(recordType, recordId);

    try {
      if (RedisRepository.CONNECTION_STRING === undefined) {
        throw new Error(`[${AppId}] Redis connection failed. No connection string found.`);
      }
      return (await new RedisClient(RedisRepository.CONNECTION_STRING).get<T>(key)) ?? undefined;
    } catch (error) {
      console.error(`[${AppId}][RedisRepository.get] Error: ${error}`);
      throw new Error(`${error}`);
    }
  }

  static async set(
    recordType: string,
    recordId: string,
    value: object,
    ttl: number = 60 * 60 * 24,
  ): Promise<void> {
    const key = RedisRepository.getKey(recordType, recordId);

    try {
      if (RedisRepository.CONNECTION_STRING === undefined) {
        throw new Error("Redis connection failed. No connection string found.");
      }
      await new RedisClient(RedisRepository.CONNECTION_STRING).set(key, value, ttl);
    } catch (error) {
      console.error(`[${AppId}][RedisRepository.set] Error: ${error}`);
      throw new Error(`${error}`);
    }
  }

  static async delete(recordType: string, recordId: string): Promise<void> {
    const key = RedisRepository.getKey(recordType, recordId);

    try {
      if (RedisRepository.CONNECTION_STRING === undefined) {
        throw new Error(`[${AppId}] Redis connection failed. No connection string found.`);
      }
      return await new RedisClient(RedisRepository.CONNECTION_STRING).delete(key);
    } catch (error) {
      console.error(`[${AppId}][RedisRepository.get] Error: ${error}`);
      throw new Error(`[${AppId}] ${error}`);
    }
  }

  static getKey(recordType: string, recordId: string) {
    return `app.saleor.accounts.manager:${
      process.env.UNIQUE_REDIS_RECORD_KEY
    }:${recordType.toLowerCase()}:${recordId}`;
  }
}
