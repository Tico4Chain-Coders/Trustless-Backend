import * as StellarSDK from "@stellar/stellar-sdk";

export interface ApiResponse {
  status: StellarSDK.rpc.Api.GetTransactionStatus;
  message: string;
}
