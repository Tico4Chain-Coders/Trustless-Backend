import * as StellarSDK from "@stellar/stellar-sdk";

export function adjustPricesToMicroUSDC(prices: string[]): string[] {
  return prices.map((price) => {
    const microUSDC = BigInt(Math.round(parseFloat(price) * 1e6));
    return microUSDC.toString();
  });
}

export function microUSDToDecimal(microUSDC: bigint | number): number {
  return Number(microUSDC) / 1e6;
}

export function parseEngagementData(
  response: StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
): any {
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
    return engagements[1].map((engagement: any) => ({
      engagement_id: Buffer.from(engagement.engagement_id).toString("hex"),
      spender: engagement.client,
      from: engagement.service_provider,
      escrows_count: Number(engagement.escrows_count),
      escrows: Object.values(engagement.escrows).map((escrow: any) => ({
        completed: escrow.completed,
        amount_paid: microUSDToDecimal(Number(escrow.amount_paid)),
        price: microUSDToDecimal(Number(escrow.price)),
      })),
      completed_escrows: Number(engagement.completed_escrows),
      earned_amount: Number(engagement.earned_amount),
      contract_balance: Number(engagement.contract_balance),
      cancelled: engagement.cancelled,
      completed: engagement.completed,
    }));
  } catch (error) {
    console.error("Error parsing engagements data:", error);
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
    const value = Number(data[2]) / 1_000_000;
    return value;
  } catch (error) {
    console.error("Error parsing escrow data:", error);
    throw error;
  }
}
