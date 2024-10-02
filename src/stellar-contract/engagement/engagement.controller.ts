import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { EngagementService } from "./engagement.service";

@Controller("project")
export class EngagenmentController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post("create-engagement")
  async createProject(
    @Body("serviceProvider") serviceProvider: string,
    @Body("prices") prices: string[],
    @Body("client") client: string,
    @Body("secretKey") secretKey: string,
  ): Promise<number> {
    try {
      const result = await this.engagementService.createEngagement(
        serviceProvider,
        prices,
        client,
        secretKey,
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
  async fundObjective(
    @Body("engamentId") escrowId: string,
    @Body("escrowId") partyId: string,
    @Body("owner") owner: string,
    @Body("secretKey") secretKey: string,
  ): Promise<any> {
    try {
      const result = await this.engagementService.fundEscrow(
        escrowId,
        partyId,
        owner,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to fund escrow",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-engagements-by-address")
  async getProjectsByClient(
    @Query("address") address: string,
    @Query("page") page: number,
    @Query("secretKey") secretKey: string,
  ) {
    try {
      const projects = await this.engagementService.getEngagementsByAddress(
        address,
        page,
        secretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch engagements by address",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-balance")
  async getBalance(
    @Query("address") address: string,
    @Query("secretKey") secretKey: string,
  ) {
    try {
      const projects = await this.engagementService.getBalance(address, secretKey);
      return projects;
    } catch (error) {
      throw new HttpException(
        "A problem occurred when obtaining the address balance.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-allowance")
  async getAllowance(
    @Query("from") from: string,
    @Query("spender") spender: string,
    @Query("secretKey") secretKey: string,
  ) {
    try {
      const projects = await this.engagementService.getAllowance(
        from,
        spender,
        secretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "There was a problem obtaining the address allowance.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("set-trustline")
  async setTrustline(@Query("sourceSecretKey") sourceSecretKey: string) {
    try {
      const projects =
        await this.engagementService.establishTrustline(sourceSecretKey);
      return projects;
    } catch (error) {
      throw new HttpException(
        "A problem occurred when defining the trustline.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("approve")
  async approve(
    @Query("from") from: string,
    @Query("spender") spender: string,
    @Query("amount") amount: string,
    @Query("sourceSecretKey") sourceSecretKey: string,
  ) {
    try {
      const projects = await this.engagementService.approve_amount(
        from,
        spender,
        amount,
        sourceSecretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "There was a problem in approving the amounts between the addresses.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
