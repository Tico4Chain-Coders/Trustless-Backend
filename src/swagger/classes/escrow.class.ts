export class InitializeEscrow {
  engagementId: string;
  description: string;
  issuer: string;
  serviceProvider: string;
  amount: string;
  signer: string;
}

export class FundEscrow {
  engagementId: string;
  signer: string;
  contractId: string;
}

export class CompleteEscrow {
  engagementId: string;
  signer: string;
  contractId: string;
}

export class CancelEscrow {
  engagementId: string;
  signer: string;
}

export class RefundRemainingFunds {
  engagementId: string;
  signer: string;
  contractId: string;
}

export class ClaimEscrowEarnings {
  engagementId: string;
  signer: string;
  contractId: string;
}
