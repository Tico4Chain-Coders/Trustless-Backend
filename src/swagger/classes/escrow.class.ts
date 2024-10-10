export class InitializeEscrow {
  engagementId: string;
  description: string;
  issuer: string;
  serviceProvider: string;
  amount: string;
  signer: string;
}

export class FundEscrow {
  engamentId: string;
  signer: string;
  secretKey: string;
}

export class CompleteEscrow {
  engamentId: string;
  signer: string;
  secretKey: string;
}

export class CancelEscrow {
  engamentId: string;
  signer: string;
}

export class RefundRemainingFunds {
  engamentId: string;
  signer: string;
  secretKey: string;
}
