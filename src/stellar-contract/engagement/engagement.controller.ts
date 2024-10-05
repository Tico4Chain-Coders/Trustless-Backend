import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { EngagementService } from "./engagement.service";

@Controller("engagement")
export class EngagenmentController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post("initialize-escrow")
  async createEngagement(
    @Body("engagementId") engagementId: string,
    @Body("description") description: string,
    @Body("issuer") issuer: string,
    @Body("serviceProvider") serviceProvider: string,
    @Body("amount") amount: string,
    @Body("signer") signer: string,
  ): Promise<number> {
    try {
      const result = await this.engagementService.initializeEscrow(
        engagementId,
        description,
        issuer,
        serviceProvider,
        amount,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to interact with contract",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("fund-escrow")
  async fundEscrow(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<any> {
    try {
      const result = await this.engagementService.fundEscrow(
        engamentId,
        signer,
        secretKey
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to fund escrow",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("complete-escrow")
  async completeEscrow(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<any> {
    try {
      const result = await this.engagementService.completeEscrow(
        engamentId,
        signer,
        secretKey
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to complete escrow",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("cancel-escrow")
  async cancelEscrow(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
  ): Promise<any> {
    try {
      const result = await this.engagementService.cancelEscrow(
        engamentId,
        signer,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to cancel escrow",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("refund-remaining-funds")
  async refundRemainingFunds(
    @Body("engamentId") engamentId: string,
    @Body("signer") signer: string,
    @Body("secretKey") secretKey: string,
  ): Promise<any> {
    try {
      const result = await this.engagementService.refundRemainingFunds(
        engamentId,
        signer,
        secretKey
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to refund remaining funds",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-escrow-by-engagement-id")
  async getEngagementsByClient(
    @Body("engagementId") engagementId: string,
  ) {
    try {
      const engagements = await this.engagementService.getEscrowByEngagementID(
        engagementId,
      );
      return engagements;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch engagements by address",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-balance")
  async getBalance(
    @Body("address") address: string,
  ) {
    try {
      const engagements = await this.engagementService.getBalance(
        address,
      );
      return engagements;
    } catch (error) {
      throw new HttpException(
        "A problem occurred when obtaining the address balance.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-allowance")
  async getAllowance(
    @Body("from") from: string,
    @Body("spender") spender: string,
  ) {
    try {
      const engagement = await this.engagementService.getAllowance(
        from,
        spender,
      );
      return engagement;
    } catch (error) {
      throw new HttpException(
        "There was a problem obtaining the address allowance.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("set-trustline")
  async setTrustline(@Body("sourceSecretKey") sourceSecretKey: string) {
    try {
      const engagements =
        await this.engagementService.establishTrustline(sourceSecretKey);
      return engagements;
    } catch (error) {
      throw new HttpException(
        "A problem occurred when defining the trustline.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("approve")
  async approve(
    @Body("from") from: string,
    @Body("spender") spender: string,
    @Body("amount") amount: string,
  ) {
    try {
      const engagement = await this.engagementService.approve_amount(
        from,
        spender,
        amount,
      );
      return engagement;
    } catch (error) {
      throw new HttpException(
        "There was a problem in approving the amounts between the addresses.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
