import * as StellarSDK from "@stellar/stellar-sdk";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { HelperService } from "./helper.service";
import { ApiResponse } from "src/interfaces/response.interface";

@Controller("helper")
export class HelperController {
  constructor(private readonly helperService: HelperService) {}

  @Post("send-transaction")
  async sendTransaction(@Body("signedXdr") signedXdr: string) {
    try {
      const transactionSigned =
        await this.helperService.sendTransaction(signedXdr);
      return transactionSigned;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("get-balance")
  async getBalance(
    @Body("address") address: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const engagements = await this.helperService.getBalance(address);
      return engagements;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("get-allowance")
  async getAllowance(
    @Body("from") from: string,
    @Body("spender") spender: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const engagement = await this.helperService.getAllowance(from, spender);
      return engagement;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("set-trustline")
  async setTrustline(
    @Body("sourceSecretKey") sourceSecretKey: string,
  ): Promise<ApiResponse> {
    try {
      const engagements =
        await this.helperService.establishTrustline(sourceSecretKey);
      return engagements;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("approve")
  async approve(
    @Body("from") from: string,
    @Body("spender") spender: string,
    @Body("amount") amount: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const engagement = await this.helperService.approve_amount(
        from,
        spender,
        amount,
      );
      return engagement;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
