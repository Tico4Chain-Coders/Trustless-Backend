import * as StellarSDK from "@stellar/stellar-sdk";

export interface ApiResponse {
  status: StellarSDK.rpc.Api.GetTransactionStatus;
  unsignedTransaction?: string
  message?: string;
  contract_id?: string;
  engagement_id?: string;
}

export interface escrowResponse {
  engagementId: string;
  description: string;
  issuer: string;
  signer: string;
  serviceProvider: string;
  amount: number;
  balance: number;
  cancelled: boolean;
  completed: boolean;
}
