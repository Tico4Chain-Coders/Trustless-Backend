import { IsNotEmpty, IsString } from 'class-validator';
import { IsAddressValid, IsAmountValid } from 'src/common/custom-validators';

export class InvokeDeployerContractDto {
  @IsNotEmpty({ message: 'The engagementId must not be empty' })
  @IsString()
  engagementId: string;

  @IsNotEmpty({ message: 'The description must not be empty' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'The serviceProvider must not be empty' })
  @IsString()
  @IsAddressValid()
  serviceProvider: string;

  @IsNotEmpty({ message: 'The amount must not be empty' })
  @IsString()
  @IsAmountValid()
  amount: string;

  @IsNotEmpty({ message: 'The signer must not be empty' })
  @IsString()
  @IsAddressValid()
  signer: string;
}