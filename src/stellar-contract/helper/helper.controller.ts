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
import { ApiTags } from "@nestjs/swagger";
import { DisabledEndpoint } from "src/swagger/decorators/disabled-endpoint";
import { ApiSendTransaction, ApiSetTrustline } from "src/swagger";
import { SendTransactionDto, SetTrustlineDto } from "./Dto/helper.dto";

@ApiTags("Helper")
@Controller("helper")
export class HelperController {
  constructor(private readonly helperService: HelperService) {}

  @Post("send-transaction")
  @ApiSendTransaction()
  async sendTransaction(
    @Body() sendTransactionDto: SendTransactionDto,
  ): Promise<ApiResponse> {
    const { signedXdr } = sendTransactionDto;
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
    @Body() setTrustlineDto: SetTrustlineDto,
  ): Promise<ApiResponse> {
    const { sourceSecretKey } = setTrustlineDto;
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
