import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';
import { u128ToBytes } from 'src/utils/u128ToBytes';

@Injectable()
export class ProjectService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  private tokenContractId: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      'https://soroban-testnet.stellar.org/',
    );
    this.trustlessContractId = 'CC33GOPHHQW2F3FEWFK44T47MB5ZUPKWMCGOOBPO3RUXKLAHJDA4A3Z7';
    this.tokenContractId = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    this.contract = new StellarSDK.Contract(this.trustlessContractId);
  }

  async createProject(
    freelancer: string,
    prices: string[],
    user: string,
    secretKey: string,
  ): Promise<number> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );
     
       const adjustedPrices = prices.map((price) => {
        const microUSDC = BigInt(Math.round(parseFloat(price) * 1e6));
        return microUSDC.toString();
      });

      const scValPrices = StellarSDK.nativeToScVal(adjustedPrices, { type: 'u128' });

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: '100',
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            'create_project',
            StellarSDK.Address.fromString(freelancer).toScVal(),
            scValPrices,
            StellarSDK.Address.fromString(user).toScVal(),
          ),
        )
        .build();

      let preparedTransaction =
        await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);

      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');

        if (getResponse.status === 'SUCCESS') {
          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${response.errorResult}`,
        );
      }
    } catch (error) {
      console.error('Error calling create_project:', error);
      throw error;
    }
  }

  async fundObjective(
    contractId: string,
    objectiveId: string,
    user: string,
    usdcContract: string,
    freelanceContract: string,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBytes = u128ToBytes(contractId);
      const objectiveIdBigInt = BigInt(objectiveId);
      const high = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt >> 64n).toString(),
      );
      const low = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt & BigInt('0xFFFFFFFFFFFFFFFF')).toString(),
      );
      const objectiveIdU128 = StellarSDK.xdr.ScVal.scvU128(
        new StellarSDK.xdr.UInt128Parts({ hi: high, lo: low }),
      );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: '10000',
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            'fund_objective',
            contractIdBytes,
            objectiveIdU128,
            StellarSDK.Address.fromString(user).toScVal(),
            StellarSDK.Address.fromString(usdcContract).toScVal(),
            StellarSDK.Address.fromString(freelanceContract).toScVal(),
          ),
        )
        .build();

      let preparedTransaction = await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);

      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');

        if (getResponse.status === 'SUCCESS') {
          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${response.errorResult}`,
        );
      }
    } catch (error) {
      console.error('Error calling fund_objective:', error);
      throw error;
    }
  }

  async decodeObject(scVal: StellarSDK.xdr.ScVal): Promise<any> {
    if (scVal.switch() === StellarSDK.xdr.ScValType.scvMap()) {
      const obj: any = {};
  
      scVal.map().forEach((entry: any) => {
        let key: string;
        let value: any;
        console.log('Key (raw):', entry.key);
        console.log('Value (raw):', entry.val);
  
        if (entry.key instanceof StellarSDK.xdr.ScVal) {
          try {
            key = Buffer.from(entry.key.sym()).toString('utf-8');
          } catch (e) {
            key = 'invalid_key';
          }
        } else {
          key = 'invalid_key';
        }
  
        if (entry.val instanceof StellarSDK.xdr.ScVal) {
          try {
            switch (entry.val.switch()) {
              case StellarSDK.xdr.ScValType.scvU32():
                value = entry.val.u32();
                break;
              case StellarSDK.xdr.ScValType.scvString():
                value = entry.val.str();
                break;
              case StellarSDK.xdr.ScValType.scvBool():
                value = entry.val.bool();
                break;
              default:
                value = 'unknown_value';
            }
          } catch (e) {
            value = 'invalid_value';
          }
        } else {
          value = 'invalid_value';
        }
  
        obj[key] = value;
      });
  
      return obj;
    }
  
    throw new Error('Unexpected object type');
  }

  async decodeContractResult(scVal: StellarSDK.xdr.ScVal): Promise<any> {
    if (scVal.switch() === StellarSDK.xdr.ScValType.scvVec()) {
      return scVal.vec().map((item: any) => this.decodeObject(item));
    }
    throw new Error('Unexpected return value type');
  }

  async getProjectsBySpender(spenderAddress: string, secretKey: string): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBuffer = StellarSDK.StrKey.decodeContract(this.trustlessContractId);
      if (contractIdBuffer.length !== 32) {
        throw new Error('Invalid contract ID: Must be 32 bytes in length');
      }

      const hostFunction = StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
        new StellarSDK.xdr.InvokeContractArgs({
          contractAddress: StellarSDK.xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
          functionName: 'get_projects_by_spender',
          args: [
            StellarSDK.Address.fromString(spenderAddress).toScVal(),
          ],
        })
      );
      
      const transaction = new StellarSDK.TransactionBuilder(account, {
          fee: '100',
        })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(300) 
        .addOperation(StellarSDK.Operation.invokeHostFunction({
          func: hostFunction,
        }))
        .build();
      
      console.log('Sending transaction...');
      let preparedTransaction = await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);
      const response = await this.server.sendTransaction(preparedTransaction);
      
      console.log('Transaction Response:', response);
      if (response.status === 'PENDING') {
        let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;
  
        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');
  
        if (getResponse.status === 'SUCCESS') {
          const resultMetaXdr = getResponse.resultMetaXdr.toXDR();
          const encodedResultMetaXdr = Buffer.from(resultMetaXdr).toString('base64');

          console.log('Encoded resultMetaXdr (base64):', encodedResultMetaXdr); // resultMetaXdr (base64) to decoded

          const resultXdr = getResponse.resultMetaXdr;
          const returnValue = resultXdr.v3().sorobanMeta().returnValue()
          const decodedResult = this.decodeContractResult(returnValue);

          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
      }
    } catch (error) {
      console.error('Error fetching projects by client:', error);
      throw error;
    }
  }
}