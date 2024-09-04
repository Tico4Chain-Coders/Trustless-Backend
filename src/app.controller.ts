import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as StellarSDK from '@stellar/stellar-sdk';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  functionName = 'increment';

  @Get('interact')
  async interactWithContract() {


    try {
      const result = await this.appService.callContractFunction(this.functionName);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to interact with contract', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Post('create')
  async createProject(
    @Body('freelancer') freelancer: string,
    @Body('prices') prices: number[],
    @Body('user') user: string
  ): Promise<number> {
      try {
        const result = await this.appService.createProject(freelancer, prices, user);
        return result;
      } catch (error) {
        throw new HttpException('Failed to interact with contract', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


}
