import { Module } from "@nestjs/common";
import { EngagenmentController } from "./engagement.controller";
import { EngagementService } from "./engagement.service";

@Module({
  controllers: [EngagenmentController],
  providers: [EngagementService],
})
export class EngagementModule {}
