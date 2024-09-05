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

}
