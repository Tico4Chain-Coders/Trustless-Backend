import { Module } from "@nestjs/common";
import { StellarContractModule } from "./stellar-contract/stellar-contract.module";

@Module({
  imports: [StellarContractModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
