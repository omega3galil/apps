import { AuthData } from "@saleor/app-sdk/APL";

export type APIResponse = {
  answer: string | undefined;
  error: string | undefined;
};

export class AccountsAppSettings {
  autoConfirmAllAccounts: string = "false";
}

export type ProtectedHandlerContext = {
  baseUrl: string; // the URL your application is available
  authData: AuthData; // Auth Data which can be used to communicate with the Saleor API
  user: {
    email: string;
    userPermissions: string[];
  };
};

export interface IAppSettingsRepository {
  get(saleorApiUrl: string): Promise<AccountsAppSettings | undefined>;
  set(saleorApiUrl: string, paypalSettings: AccountsAppSettings): Promise<void>;
}
