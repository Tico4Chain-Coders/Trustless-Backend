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
    @Body("contractId") contractId: string,
    @Body("engagementId") engagementId: string,
    @Body("description") description: string,
    @Body("serviceProvider") serviceProvider: string,
    @Body("amount") amount: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.initializeEscrow(
        contractId,
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

  @Post("fund-escrow")
  @ApiFundEscrow()
  async fundEscrow(
    @Body("contractId") contractId: string,
    @Body("engagementId") engamentId: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.fundEscrow(
        contractId,
        engamentId,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("complete-escrow")
  @ApiCompleteEscrow()
  async completeEscrow(
    @Body("contractId") contractId: string,
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.completeEscrow(
        contractId,
        engamentId,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("cancel-escrow")
  @ApiCancelEscrow()
  async cancelEscrow(
    @Body("contractId") contractId: string,
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.cancelEscrow(contractId, engamentId, signer);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("refund-remaining-funds")
  @ApiRefundRemainingFundsEscrow()
  async refundRemainingFunds(
    @Body("contractId") contractId: string,
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
  ): Promise<ApiResponse> {
    try {
      const result = await this.escrowService.refundRemainingFunds(
        contractId,
        engamentId,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("get-escrow-by-engagement-id")
  @ApiGetEscrowByEngagementIdEscrow()
  async getEscrowByEngagementId(
    @Query("contractId") contractId: string,
    @Query("engagementId") engagementId: string,
  ): Promise<escrowResponse | ApiResponse> {
    try {
      const escrow =
        await this.escrowService.getEscrowByEngagementID(contractId, engagementId);
      return escrow;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
