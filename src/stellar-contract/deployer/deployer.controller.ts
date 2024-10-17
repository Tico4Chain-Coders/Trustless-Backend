import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiResponse } from "src/interfaces/response.interface";
import { ApiInvokeContract } from "src/swagger";
import { DeployerService } from "./deployer.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Deployer")
@Controller("deployer")
export class DeployerController {
  constructor(private readonly deployerService: DeployerService) {}

  @Post("invoke-deployer-contract")
  @ApiInvokeContract()
  async invokeContract(
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
      if (error instanceof Error && error.message) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, message: error.message },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "An unexpected error occurred",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
