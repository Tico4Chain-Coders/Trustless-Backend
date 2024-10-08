import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";

import { EscrowService } from "./escrow.service";
import { ApiResponse, escrowResponse } from "src/interfaces/response.interface";
import { ApiTags } from "@nestjs/swagger";
import {
  ApiCancelEscrow,
  ApiCompleteEscrow,
  ApiFundEscrow,
  ApiGetEscrowByEngagementIdEscrow,
  ApiInitializeEscrow,
  ApiRefundRemainingFundsEscrow,
} from "src/swagger";

@ApiTags("Escrow")
@Controller("escrow")
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post("initialize-escrow")
  @ApiInitializeEscrow()
  async initializeEscrow(
    @Body("engagementId") engagementId: string,
    @Body("description") description: string,
    @Body("issuer") issuer: string,
    @Body("serviceProvider") serviceProvider: string,
    @Body("amount") amount: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.initializeEscrow(
        engagementId,
        description,
        issuer,
        serviceProvider,
        amount,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("fund-escrow")
  @ApiFundEscrow()
  async fundEscrow(
    @Body("engagementId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.fundEscrow(
        engamentId,
        signer,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("complete-escrow")
  @ApiCompleteEscrow()
  async completeEscrow(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.completeEscrow(
        engamentId,
        signer,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("cancel-escrow")
  @ApiCancelEscrow()
  async cancelEscrow(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.cancelEscrow(engamentId, signer);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("refund-remaining-funds")
  @ApiRefundRemainingFundsEscrow()
  async refundRemainingFunds(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.refundRemainingFunds(
        engamentId,
        signer,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("get-escrow-by-engagement-id")
  @ApiGetEscrowByEngagementIdEscrow()
  async getEscrowByEngagementId(
    @Query("engagementId") engagementId: string,
  ): Promise<escrowResponse | ApiResponse> {
    try {
      const escrow =
        await this.escrowService.getEscrowByEngagementID(engagementId);
      return escrow;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
