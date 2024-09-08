import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';
import { u128ToBytes } from 'src/utils/u128ToBytes';

@Injectable()
export class ProjectService {

    private server: StellarSDK.SorobanRpc.Server; 
    private contract: StellarSDK.Contract;
    private sourceKeypair: StellarSDK.Keypair;
    private trustlessContractId: string;

    constructor() {
        this.server = new StellarSDK.SorobanRpc.Server('https://soroban-testnet.stellar.org/');
        this.trustlessContractId = 'CBZIYK6PJ5PLMA5DD4MY5U3LC4G4VELXBQZUUVIAIUDUWXWZRZFEBPES';
        this.contract = new StellarSDK.Contract(this.trustlessContractId);
    }

    async createProject(freelancer: string, prices: string[], user: string, secretKey: string): Promise<number> {

        try {

            this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
            const account = await this.server.getAccount(this.sourceKeypair.publicKey());
            const scValPrices = StellarSDK.nativeToScVal(prices, { type: "u128" });

            const transaction = new StellarSDK.TransactionBuilder( account, {
                fee: "10",
            })
                .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
                .setTimeout(30)
                .addOperation(
                    this.contract.call(
                        'create_project',
                        StellarSDK.Address.fromString(freelancer).toScVal(),
                        scValPrices,
                        StellarSDK.Address.fromString(user).toScVal()
                    )
                )
                .build();
        
            let preparedTransaction = await this.server.prepareTransaction(transaction);
            preparedTransaction.sign(this.sourceKeypair);

            const response = await this.server.sendTransaction(preparedTransaction);
            
            if ( response.status === "PENDING" ) {
                
                let getResponse;

                do {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  getResponse = await this.server.getTransaction(response.hash);
                } while (getResponse.status === "NOT_FOUND");
      
                if ( getResponse.status === "SUCCESS" ) {
                    return getResponse;
                } else {
                  throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
                }
            } else {
                throw new Error(`Transaction submission failed: ${response.errorResult}`);
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
        secretKey: string
      ): Promise<any> {
        try {
          this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
          const account = await this.server.getAccount(this.sourceKeypair.publicKey());
    
          const contractIdBytes = u128ToBytes(contractId);
          const objectiveIdBigInt = BigInt(objectiveId); 
          const high = StellarSDK.xdr.Uint64.fromString((objectiveIdBigInt >> 64n).toString());
          const low = StellarSDK.xdr.Uint64.fromString((objectiveIdBigInt & BigInt("0xFFFFFFFFFFFFFFFF")).toString());
          const objectiveIdU128 = StellarSDK.xdr.ScVal.scvU128(new StellarSDK.xdr.UInt128Parts({ hi: high, lo: low }));

          const transaction = new StellarSDK.TransactionBuilder(account, {
            fee: '10',
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
                StellarSDK.Address.fromString(freelanceContract).toScVal()
              )
            )
            .build();
    
          let preparedTransaction = await this.server.prepareTransaction(transaction);
          preparedTransaction.sign(this.sourceKeypair);
    
          const response = await this.server.sendTransaction(preparedTransaction);
    
          if (response.status === 'PENDING') {
            let getResponse;
    
            do {
              await new Promise(resolve => setTimeout(resolve, 1000));
              getResponse = await this.server.getTransaction(response.hash);
            } while (getResponse.status === 'NOT_FOUND');
    
            if (getResponse.status === 'SUCCESS') {
              return getResponse;
            } else {
              throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
            }
          } else {
            throw new Error(`Transaction submission failed: ${response.errorResult}`);
          }
        } catch (error) {
          console.error('Error calling fund_objective:', error);
          throw error;
        }
      }
    
}
