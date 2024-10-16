export const appName = "SMTP App";
export const AppId: string = "app.saleor.smtp";
export const APIBaseURL: string = process.env.APP_API_BASE_URL ?? "";
export const isDebug: boolean =
  process.env.DEBUG !== undefined &&
  process.env.DEBUG !== null &&
  typeof process.env.DEBUG === "string" &&
  process.env.DEBUG === "1"
    ? true
    : false;
