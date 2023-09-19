import { appendFile } from "fs/promises";
import { getCurrentDateTime } from "./DateUtility";

class Logger {
  private static readonly LOG_FILE: string = `logs/${getCurrentDateTime()}-log.txt`;

  public static appendLog(msg: string) {
    const formattedMsg: string = `[LOG] [${getCurrentDateTime()}]: ${msg}`;
    console.log(formattedMsg);
    appendFile(this.LOG_FILE, `${formattedMsg}\n`);
  }

  public static appendError(msg: string) {
    const formattedMsg: string = `[ERROR] [${getCurrentDateTime()}]: ${msg}`;
    console.error(formattedMsg);
    appendFile(this.LOG_FILE, `${formattedMsg}\n`);
  }

  public static appendDebugLog(msg: string) {
    const isDebug: boolean = process.env.DEBUG === "true";

    if (isDebug) {
      const formattedMsg: string = `[DEBUG] [${getCurrentDateTime()}]: ${msg}`;
      console.log(formattedMsg);
      appendFile(this.LOG_FILE, `${formattedMsg}\n`);
    }
  }
}

export default Logger;
