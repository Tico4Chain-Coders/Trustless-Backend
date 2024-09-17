import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {

    constructor(
        private readonly projectService: ProjectService
    ){}

    @Post('initialize-escrow')
    async createProject(
        @Body('freelancer') freelancer: string,
        @Body('prices') prices: string[],
        @Body('user') user: string,
        @Body('secretKey') secretKey: string
    ): Promise<number> {
        try {
            const result = await this.projectService.initializeEscrow(freelancer, prices, user, secretKey);
            return result;
        } catch (error) {
            throw new HttpException('Failed to interact with contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('fund-objective')
    async fundObjective(
      @Body('contractId') contractId: string,
      @Body('objectiveId') objectiveId: string,
      @Body('user') user: string,
      @Body('usdcContract') usdcContract: string,
      @Body('freelanceContract') freelanceContract: string,
      @Body('secretKey') secretKey: string,
    ): Promise<any> {
        try {
          const result = await this.projectService.fundObjective(
            contractId,
            objectiveId,
            user,
            usdcContract,
            freelanceContract,
            secretKey
          );
          return result;
        } catch (error) {
          throw new HttpException('Failed to fund objective', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

  @Get('by-client')
  async getProjectsByClient(
    @Query('spenderAddress') spenderAddress: string,
    @Query('secretKey') secretKey: string,
  ) {
    try {
      const projects = await this.projectService.getProjectsBySpender(spenderAddress, secretKey);
      return projects;
    } catch (error) {
      throw new HttpException('Failed to fetch projects by client', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  }
