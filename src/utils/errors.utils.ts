export function mapErrorCodeToMessage(code: string): string {
  switch (code) {
    case "1":
      return "Escrow not funded";
    case "2":
      return "Amount cannot be zero";
    case "3":
      return "Escrow already initialized";
    case "4":
      return "Only the signer can fund the escrow";
    case "5":
      return "Escrow already funded";
    case "6":
      return "This escrow is already fully funded";
    case "7":
      return "The signer does not have sufficient funds";
    case "8":
      return "Not enough allowance to fund this escrow";
    case "9":
      return "Only the signer can complete the escrow";
    case "10":
      return "Escrow already completed";
    case "11":
      return "The signer does not have sufficient funds to complete this escrow";
    case "12":
      return "Only the service provider can cancel the escrow";
    case "13":
      return "The escrow has already been cancelled";
    case "14":
      return "Only the signer can request a refund";
    case "15":
      return "The escrow must be cancelled to refund the amounts";
    case "16":
      return "No funds available to refund";
    case "17":
      return "The contract has no balance to repay";
    case "18":
      return "Escrow not found";
    case "19":
      return "Only the service provider can claim escrow earnings";
    case "20":
      return "The escrow must be completed to claim earnings";
    case "21":
      return "The escrow balance must be equal to the amount of earnings defined for the escrow";
    case "22":
      return "The contract does not have sufficient funds";
    default:
      return "Unknown error occurred in the contract";
  }
}
