import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import Logger from "./Logger";
import { DynamoDB } from "aws-sdk";

class Storage {
  private static readonly DATASTORE_FILE: string = "datastore.json";
  private static values: any = {};
  private static isLoaded: boolean;
  private static dynamoDB: DynamoDB.DocumentClient;

  public static async load(): Promise<boolean> {
    try {
      Logger.appendDebugLog("Initializing dynamoDB client.");
      this.dynamoDB = new DynamoDB.DocumentClient();

      Logger.appendDebugLog("Fetching store_id [0] from gh-metrics-store.");
      this.values = await this.dynamoDB
        .get({
          TableName: "gh-metrics-store",
          Key: {
            store_id: 0,
          },
        })
        .promise();

      Logger.appendDebugLog(
        `Fetched values: ${JSON.stringify(this.values, null, 2)}`
      );

      if (!this.values) {
        Logger.appendDebugLog(
          "Nothing to fetch from gh-metrics-store. Creating value for store_id [0] with value [{}]."
        );

        await this.dynamoDB
          .put({
            TableName: "gh-metrics-store",
            Item: {
              store_id: 0,
              ItemValue: {},
            },
          })
          .promise();
      }

      this.isLoaded = true;
      return true;
    } catch (error: any) {
      Logger.appendError(error.toString());
      return false;
    }
  }

  public static async get(key: string): Promise<any> {
    if (!this.isLoaded) {
      const success: boolean = await this.load();

      if (!success) {
        Logger.appendError(
          `Unable to load to fetch value [${key}] from storage.`
        );
      }
    }

    return this.values[key];
  }

  public static async store(key: string, value: any): Promise<void> {
    if (!this.isLoaded) {
      const success: boolean = await this.load();

      if (!success) {
        Logger.appendError(
          `Unable to load to store key/value [${key}]: [${value}] in storage.`
        );
      }
    }

    try {
      Logger.appendDebugLog("Storing values to gh-metrics-store.");
      await this.dynamoDB
        .update({
          TableName: "gh-metrics-store",
          Key: {
            store_id: 0,
          },
          UpdateExpression: "SET ItemValue = :value",
          ExpressionAttributeValues: {
            ":value": this.values,
          },
        })
        .promise();
    } catch (error: any) {
      Logger.appendError(error.toString());
    }
  }
}

export default Storage;
