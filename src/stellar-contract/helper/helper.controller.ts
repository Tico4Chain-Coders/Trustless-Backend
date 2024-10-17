import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { HelperService } from "./helper.service";
import { ApiResponse } from "src/interfaces/response.interface";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import {
  SendTransaction,
  SetTrustline,
} from "src/swagger/classes/helper.class";
import {
  SendTransactionDefaultValue,
  SetTrustlineDefaultValue,
} from "src/swagger/default-values-in-body/helper-default-value";
import { DisabledEndpoint } from "src/swagger/decorators/disabled-endpoint";
import { ApiSendTransaction, ApiSetTrustline } from "src/swagger";

@ApiTags("Helper")
@Controller("helper")
export class HelperController {
  constructor(private readonly helperService: HelperService) {}

  @Post("send-transaction")
  @ApiSendTransaction()
  async sendTransaction(
    @Body("signedXdr") signedXdr: string,
  ): Promise<ApiResponse> {
    try {
      const transactionSigned =
        await this.helperService.sendTransaction(signedXdr);
      return transactionSigned;
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

  @Get("get-allowance")
  @DisabledEndpoint()
  async getAllowance() /*: Promise<{ allowance: number }>*/ {
    // @Query("spender") spender: string, // @Query("from") from: string,
    try {
      // const allowance = await this.helperService.getAllowance(from, spender);
      // return allowance;
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

  @Post("set-trustline")
  @ApiSetTrustline()
  async setTrustline(
    @Body("sourceSecretKey") sourceSecretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result =
        await this.helperService.establishTrustline(sourceSecretKey);
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
