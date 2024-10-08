import * as StellarSDK from "@stellar/stellar-sdk";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";

import { EscrowService } from "./escrow.service";
import { ApiResponse } from "src/interfaces/response.interface";

@Controller("escrow")
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post("initialize-escrow")
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
  async getEngagementsByClient(
    @Body("engagementId") engagementId: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const engagements =
        await this.escrowService.getEscrowByEngagementID(engagementId);
      return engagements;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
