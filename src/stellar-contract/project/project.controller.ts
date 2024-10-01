import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { ProjectService } from "./project.service";

@Controller("project")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post("create-engagement")
  async createProject(
    @Body("serviceProvider") serviceProvider: string,
    @Body("prices") prices: string[],
    @Body("client") client: string,
    @Body("secretKey") secretKey: string,
  ): Promise<number> {
    try {
      const result = await this.projectService.createEngagement(
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
    @Body("spender") spender: string,
    @Body("from") from: string,
    @Body("secretKey") secretKey: string,
  ): Promise<any> {
    try {
      const result = await this.projectService.fundEscrow(
        escrowId,
        partyId,
        spender,
        from,
        secretKey,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        "Failed to fund objective",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("get-escrows-by-client")
  async getProjectsByClient(
    @Query("spenderAddress") spenderAddress: string,
    @Query("page") page: number,
    @Query("secretKey") secretKey: string,
  ) {
    try {
      const projects = await this.projectService.getEscrowsBySpender(
        spenderAddress,
        page,
        secretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch projects by client",
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
      const projects = await this.projectService.getBalance(
        address,
        secretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch projects by client",
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
      const projects = await this.projectService.getAllowance(
        from,
        spender,
        secretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch projects by client",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("set-trustline")
  async setTrustline(
    @Query("sourceSecretKey") sourceSecretKey: string,
  ) {
    try {
      const projects = await this.projectService.establishTrustline(
        sourceSecretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch projects by client",
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
      const projects = await this.projectService.approve_amount(
        from,
        spender,
        amount,
        sourceSecretKey,
      );
      return projects;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch projects by client",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
