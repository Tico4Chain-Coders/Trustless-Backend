import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }


}
