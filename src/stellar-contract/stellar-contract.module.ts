import { Module } from "@nestjs/common";
import { EscrowModule } from "./escrow/escrow.module";
// import { UserModule } from "./user/user.module";
import { HelperModule } from "./helper/helper.module";
import { DeployerModule } from "./deployer/deployer.module";

@Module({
  imports: [EscrowModule /*, UserModule*/, HelperModule, DeployerModule],
})
export class StellarContractModule {}
