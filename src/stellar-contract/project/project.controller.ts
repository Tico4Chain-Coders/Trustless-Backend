import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {

    constructor(
        private readonly projectService: ProjectService
    ){}

    @Post('create')
    async createProject(
        @Body('freelancer') freelancer: string,
        @Body('prices') prices: string[],
        @Body('user') user: string,
        @Body('secretKey') secretKey: string
    ): Promise<number> {
        try {
            const result = await this.projectService.createProject(freelancer, prices, user, secretKey);
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
}
