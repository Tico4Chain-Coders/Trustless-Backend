import { IsNotEmpty, IsString } from 'class-validator';
import { IsAddressValid } from 'src/common/custom-validators';

export class EscrowOperationWithSignerDto {
  @IsNotEmpty({ message: 'The contractId must not be empty' })
  @IsString()
  @IsAddressValid()
  contractId: string;

  @IsNotEmpty({ message: 'The engagementId must not be empty' })
  @IsString()
  engagementId: string;

  @IsNotEmpty({ message: 'The signer must not be empty' })
  @IsString()
  @IsAddressValid()
  signer: string;
}

export class EscrowOperationWithServiceProviderDto {
  @IsNotEmpty({ message: 'The contractId must not be empty' })
  @IsString()
  @IsAddressValid()
  contractId: string;

  @IsNotEmpty({ message: 'The engagementId must not be empty' })
  @IsString()
  engagementId: string;

  @IsNotEmpty({ message: 'The serviceProvider must not be empty' })
  @IsString()
  @IsAddressValid()
  serviceProvider: string;
}

export class GetEscrowByEngagementIdDto {
  @IsNotEmpty({ message: 'The contractId must not be empty' })
  @IsString()
  @IsAddressValid()
  contractId: string;

  @IsNotEmpty({ message: 'The engagementId must not be empty' })
  @IsString()
  engagementId: string;
  }