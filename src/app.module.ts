import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StellarContractModule } from './stellar-contract/stellar-contract.module';

@Module({
  imports: [StellarContractModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
