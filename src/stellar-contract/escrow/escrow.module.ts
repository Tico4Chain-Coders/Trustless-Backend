import { Module } from "@nestjs/common";
import { EscrowController } from "./escrow.controller";
import { EscrowService } from "./escrow.service";

@Module({
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
