import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';

@Injectable()
export class AppService {

  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server('https://soroban-testnet.stellar.org/');
    this.sourceKeypair = StellarSDK.Keypair.fromSecret('SAVCNJ2VBALWBZTFOYTMMB2BZU7WZDYPNRDBARTEZIWDLW3YTPUNLYWO');
    const contractId = 'CDOUBM34TZHLYXX6LRTBPHXM2QTMXVLY7GVOROARJWGTT3EA3TS3NKNY';
    this.trustlessContractId = 'CBZIYK6PJ5PLMA5DD4MY5U3LC4G4VELXBQZUUVIAIUDUWXWZRZFEBPES';
    this.contract = new StellarSDK.Contract(contractId);
  }

  async callContractFunction1(functionName: string) {
    const account = await this.server.getAccount(this.sourceKeypair.publicKey());

    let transaction = new StellarSDK.TransactionBuilder(account, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: StellarSDK.Networks.TESTNET,
    })
      .addOperation(this.contract.call(functionName))
      .setTimeout(30)
      .build();

    transaction = await this.server.prepareTransaction(transaction);
    transaction.sign(this.sourceKeypair);

    const response = await this.server.sendTransaction(transaction);

    // Esperar y devolver el resultado de la transacción
    return await this.server.getTransaction(response.hash);
  }

  async callContractFunction(functionName: string) {
    try {
      const account = await this.server.getAccount(this.sourceKeypair.publicKey());
    
      let transaction = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: StellarSDK.Networks.TESTNET,
      })
        .addOperation(this.contract.call(functionName))
        .setTimeout(30)
        .build();
      
      transaction = await this.server.prepareTransaction(transaction);
      transaction.sign(this.sourceKeypair);
      
      const sendResponse = await this.server.sendTransaction(transaction);
      console.log("Sent transaction: ${JSON.stringify(sendResponse)}");
      
      if (sendResponse.status === "PENDING") {

        let getResponse;

        do {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          getResponse = await this.server.getTransaction(sendResponse.hash);
        } while (getResponse.status === "NOT_FOUND");
        
        if (getResponse.status === "SUCCESS") {
          console.log("Transaction successful: ${JSON.stringify(getResponse)}");
          return getResponse;
        } else {
          throw new Error("Transaction failed: ${getResponse.resultXdr}");
        }
      } else {
        throw new Error("Transaction submission failed: ${sendResponse.errorResultXdr}");
      }
    } catch (error) {
      console.error("Error in callContractFunction:", error);
      throw error;
    }
  }

  async createProject(freelancer: string, prices: number[], user: string): Promise<number> {
    const contract = new StellarSDK.Contract(this.trustlessContractId);

    // Use SorobanRpc.Server methods
    const account = await this.server.getAccount(this.sourceKeypair.publicKey());
    
    const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: StellarSDK.Networks.TESTNET
    })
    .addOperation(
        contract.call(
            'create_project',
            StellarSDK.Address.fromString(freelancer).toScVal(),
            StellarSDK.xdr.ScVal.scvVec(
                prices.map(price => {
                    const scInt = new StellarSDK.ScInt(price);
                    const i128 = scInt.toI128();
                    return StellarSDK.xdr.ScVal.scvU128(i128.u128());
                })
            ),
            StellarSDK.Address.fromString(user).toScVal()
        )
    )
    .setTimeout(30)
    .build();

    transaction.sign(this.sourceKeypair);

    try {
        // Use SorobanRpc.Server methods
        const response = await this.server.sendTransaction(transaction);
        
        // Check the transaction status
        if ((response as any).status === 'SUCCESS') {
          const result = StellarSDK.scValToNative((response as any).resultMetaXdr?.v3?.result?.results()?.[0]?.tr()?.invokeHostFunctionResult()?.success());
            return Number(result);
        } else {
            throw new Error(`Transaction failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error calling create_project:', error);
        throw error;
    }
}
  

  getHello(): string {
    return 'Hello World!';
  }


}
