import { Module } from "@nestjs/common";
import { EngagementModule } from "./engagement/engagement.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [EngagementModule, UserModule],
})
export class StellarContractModule {}
