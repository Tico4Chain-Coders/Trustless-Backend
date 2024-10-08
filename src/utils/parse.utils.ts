import * as StellarSDK from "@stellar/stellar-sdk";
import { escrowResponse } from "src/interfaces/response.interface";

export function adjustPricesToMicroUSDC(price: string): string {
  const microUSDC = BigInt(Math.round(parseFloat(price) * 1e7));
  return microUSDC.toString();
}

export function microUSDToDecimal(microUSDC: bigint | number): number {
  return Number(microUSDC) / 1e7;
}

export function parseEngagementData(
  response: StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
): escrowResponse {
  try {
    const xdrResult = response.resultMetaXdr;
    const xdrBuffer = xdrResult.toXDR();
    const xdrBase64 = xdrBuffer.toString("base64");
    const transactionMeta = StellarSDK.xdr.TransactionMeta.fromXDR(
      xdrBase64,
      "base64",
    );

    const contractEvents = transactionMeta.v3().sorobanMeta().events();

    const lastEvent = contractEvents[contractEvents.length - 1];
    const scVal = lastEvent.body().value();
    const contractEventV0 = scVal.data();

    const engagements = StellarSDK.scValToNative(contractEventV0);
    const {
      engagement_id,
      description,
      issuer,
      signer,
      service_provider,
      amount,
      balance,
      cancelled,
      completed,
    } = engagements[1];
    return {
      engagement_id,
      description,
      issuer,
      signer,
      service_provider,
      amount: microUSDToDecimal(Number(amount)),
      balance: microUSDToDecimal(Number(balance)),
      cancelled,
      completed,
    };
  } catch (error) {
    console.error("Error parsing escrow data:", error);
    throw error;
  }
}

export function parseBalanceByAddressData(
  response: StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
): number {
  try {
    const xdrResult = response.resultMetaXdr;
    const xdrBuffer = xdrResult.toXDR();
    const xdrBase64 = xdrBuffer.toString("base64");
    const transactionMeta = StellarSDK.xdr.TransactionMeta.fromXDR(
      xdrBase64,
      "base64",
    );

    const contractEvents = transactionMeta.v3().sorobanMeta().events();

    const lastEvent = contractEvents[contractEvents.length - 1];
    const scVal = lastEvent.body().value();
    const contractEventV0 = scVal.data();

    const data = StellarSDK.scValToNative(contractEventV0);
    const value = Number(data[2]) / 10_000_000;
    return value;
  } catch (error) {
    console.error("Error parsing escrow data:", error);
    throw error;
  }
}
