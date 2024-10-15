import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from 'src/interfaces/response.interface';
import { ApiInitializeEscrow } from 'src/swagger';
import { DeployerService } from './deployer.service';

@Controller('deployer')
export class DeployerController {

    constructor(private readonly deployerService: DeployerService) {}

    @Post("invoke-deployer-contract")
    @ApiInitializeEscrow()
    async initializeEscrow(
        @Body("engagementId") engagementId: string,
        @Body("description") description: string,
        @Body("serviceProvider") serviceProvider: string,
        @Body("amount") amount: string,
        @Body("signer") signer: string,
    ): Promise<ApiResponse> {
        try {
        const result = await this.deployerService.invokeDeployerContract(
            engagementId,
            description,
            serviceProvider,
            amount,
            signer,
        );
        return result;
        } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
