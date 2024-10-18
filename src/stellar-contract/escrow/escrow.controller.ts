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
  ApiClaimEscrowEarnings,
  ApiCompleteEscrow,
  ApiFundEscrow,
  ApiGetEscrowByEngagementIdEscrow,
  ApiRefundRemainingFundsEscrow,
} from "src/swagger";
import { EscrowOperationWithServiceProviderDto, EscrowOperationWithSignerDto, GetEscrowByEngagementIdDto } from "./Dto/escrow.dto";

@ApiTags("Escrow")
@Controller("escrow")
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  // @Post("initialize-escrow")
  // @DisabledEndpoint()
  // @ApiInitializeEscrow()
  // async initializeEscrow(
  //   @Body("contractId") contractId: string,
  //   @Body("engagementId") engagementId: string,
  //   @Body("description") description: string,
  //   @Body("serviceProvider") serviceProvider: string,
  //   @Body("amount") amount: string,
  //   @Body("signer") signer: string,
  // ): Promise<ApiResponse> {
  //   try {
  //     const result = await this.escrowService.initializeEscrow(
  //       contractId,
  //       engagementId,
  //       description,
  //       serviceProvider,
  //       amount,
  //       signer,
  //     );
  //     return result;
  //   } catch (error) {
  //     if (error instanceof Error && error.message) {
  //       throw new HttpException(
  //         { status: HttpStatus.BAD_REQUEST, message: error.message },
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: "An unexpected error occurred",
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Post("fund-escrow")
  @ApiFundEscrow()
  async fundEscrow(
    @Body() escrowOperationWithSignerDto: EscrowOperationWithSignerDto
  ): Promise<ApiResponse> {
    const { contractId, engagementId, signer } = escrowOperationWithSignerDto;
    try {
      const result = await this.escrowService.fundEscrow(
        contractId,
        engagementId,
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

  @Post("complete-escrow")
  @ApiCompleteEscrow()
  async completeEscrow(
    @Body() escrowOperationWithSignerDto: EscrowOperationWithSignerDto
  ): Promise<ApiResponse> {
    const { contractId, engagementId, signer } = escrowOperationWithSignerDto;
    try {
      const result = await this.escrowService.completeEscrow(
        contractId,
        engagementId,
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

  @Post("claim-escrow-earnings")
  @ApiClaimEscrowEarnings()
  async claimEscrowEarnings(
    @Body() escrowOperationWithServiceProviderDto: EscrowOperationWithServiceProviderDto
  ): Promise<ApiResponse> {
    const { contractId, engagementId, serviceProvider } = escrowOperationWithServiceProviderDto;
    try {
      const result = await this.escrowService.claimEscrowEarnings(
        contractId,
        engagementId,
        serviceProvider,
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

  @Post("cancel-escrow")
  @ApiCancelEscrow()
  async cancelEscrow(
    @Body() escrowOperationWithServiceProviderDto: EscrowOperationWithServiceProviderDto
  ): Promise<ApiResponse> {
    const { contractId, engagementId, serviceProvider } = escrowOperationWithServiceProviderDto;
    try {
      const result = await this.escrowService.cancelEscrow(
        contractId,
        engagementId,
        serviceProvider,
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

  @Post("refund-remaining-funds")
  @ApiRefundRemainingFundsEscrow()
  async refundRemainingFunds(
    @Body() escrowOperationWithSignerDto: EscrowOperationWithSignerDto
  ): Promise<ApiResponse> {
    const { contractId, engagementId, signer } = escrowOperationWithSignerDto;
    try {
      const result = await this.escrowService.refundRemainingFunds(
        contractId,
        engagementId,
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

  @Get("get-escrow-by-engagement-id")
  @ApiGetEscrowByEngagementIdEscrow()
  async getEscrowByEngagementId(
    @Query() getEscrowByEngagementIdDto: GetEscrowByEngagementIdDto
  ): Promise<escrowResponse | ApiResponse> {
    const { contractId, engagementId } = getEscrowByEngagementIdDto;
    try {
      const escrow = await this.escrowService.getEscrowByEngagementID(
        contractId,
        engagementId,
      );
      return escrow;
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
