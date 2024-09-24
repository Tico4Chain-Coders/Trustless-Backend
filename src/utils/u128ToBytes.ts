import * as StellarSDK from "@stellar/stellar-sdk";

export function u128ToBytes(contractId: string): StellarSDK.xdr.ScVal {
  const bytes = Buffer.from(contractId, "hex");
  return StellarSDK.xdr.ScVal.scvBytes(bytes);
}
