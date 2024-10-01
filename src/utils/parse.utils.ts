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

export function parseEscrowData(
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

        const escrows = StellarSDK.scValToNative(contractEventV0);
        return escrows[1].map((escrow: any) => ({
        escrow_id: Buffer.from(escrow.escrow_id).toString("hex"),
        spender: escrow.spender,
        from: escrow.from,
        parties_count: Number(escrow.parties_count),
        parties: Object.values(escrow.parties).map((party: any) => ({
            completed: party.completed,
            half_paid: microUSDToDecimal(Number(party.half_paid)),
            price: microUSDToDecimal(Number(party.price)),
        })),
        completed_parties: Number(escrow.completed_parties),
        earned_amount: Number(escrow.earned_amount),
        contract_balance: Number(escrow.contract_balance),
        cancelled: escrow.cancelled,
        completed: escrow.completed,
        }));
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
      const value = Number(data[2]) / 1_000_000;
      return value;
    } catch (error) {
      console.error("Error parsing escrow data:", error);
      throw error;
    }
}

