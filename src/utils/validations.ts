import * as StellarSDK from "@stellar/stellar-sdk";

export function validateAddress(address) {
  try {
    new StellarSDK.Address(address);
    return true;
  } catch (error) {
    return false;
  }
}
