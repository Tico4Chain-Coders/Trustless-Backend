import { Module } from '@nestjs/common';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [ProjectModule, UserModule]
})
export class StellarContractModule {}
