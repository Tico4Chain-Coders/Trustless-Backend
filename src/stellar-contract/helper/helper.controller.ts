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
import { SetTrustline } from "src/swagger/classes/helper.class";
import { SetTrustlineDefaultValue } from "src/swagger/default-values-in-body/helper-default-value";

@ApiTags("Helper")
@Controller("helper")
export class HelperController {
  constructor(private readonly helperService: HelperService) {}

  @Post("send-transaction")
  async sendTransaction(@Body("signedXdr") signedXdr: string): Promise<ApiResponse> {
    try {
      const transactionSigned =
        await this.helperService.sendTransaction(signedXdr);
      return transactionSigned;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("get-allowance")
  async getAllowance(
    @Query("from") from: string,
    @Query("spender") spender: string,
  ): Promise<{ allowance: number }> {
    try {
      const allowance = await this.helperService.getAllowance(from, spender);
      return allowance;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("set-trustline")
  @ApiBody({ type: SetTrustline, examples: SetTrustlineDefaultValue })
  async setTrustline(
    @Body("sourceSecretKey") sourceSecretKey: string,
  ): Promise<ApiResponse> {
    try {
      const result =
        await this.helperService.establishTrustline(sourceSecretKey);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
