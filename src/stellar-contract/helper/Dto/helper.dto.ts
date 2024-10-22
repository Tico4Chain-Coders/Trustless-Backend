import { IsNotEmpty, IsString } from "class-validator";

export class SendTransactionDto {
  @IsNotEmpty({ message: "The signedXdr must not be empty" })
  @IsString()
  signedXdr: string;
}

export class SetTrustlineDto {
  @IsNotEmpty({ message: "The sourceSecretKey must not be empty" })
  @IsString()
  sourceSecretKey: string;
}
