import * as StellarSDK from "@stellar/stellar-sdk";

export interface ApiResponse {
  status: StellarSDK.rpc.Api.GetTransactionStatus;
  message: string;
}

export interface escrowResponse {
  engagement_id: string;
  description: string;
  issuer: string;
  signer: string;
  service_provider: string;
  amount: number;
  balance: number;
  cancelled: boolean;
  completed: boolean;
}
