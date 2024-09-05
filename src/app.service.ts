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

    try {
      
        const contract = new StellarSDK.Contract(this.trustlessContractId);
        console.log("Llego 1");
        
        // Use SorobanRpc.Server methods
        const account = await this.server.getAccount(this.sourceKeypair.publicKey());
        console.log("Llego 2");

        //* Para trabajar con los fees
        // const fee = StellarSDK.BASE_FEE;
        // const feeStats = await this.server.getFeeStats();
        // const baseFee = feeStats.inclusionFee.min;
        // const contractFee = baseFee * 100;
        
        let transaction = new StellarSDK.TransactionBuilder(account, {
            fee: "100000",
            networkPassphrase: StellarSDK.Networks.TESTNET
        })
        // .addOperation(
        //     contract.call(
        //         'create_project',
        //         StellarSDK.Address.fromString(freelancer).toScVal(),
        //         StellarSDK.xdr.ScVal.scvVec(
        //             prices.map(price => {
        //                 const scInt = new StellarSDK.ScInt(price);
        //                 const i128 = scInt.toI128();
        //                 return StellarSDK.xdr.ScVal.scvU128(i128.u128());
        //             })
        //         ),
        //         StellarSDK.Address.fromString(user).toScVal()
        //     )
        // ),
        .addOperation(
          contract.call(
            'create_project',
            StellarSDK.nativeToScVal("GDPA2KHMH5UD3TVVFCOJIFXFMMJKVTZAEVL7YU3NTKW3XEZ4YTGT36SK"),
            StellarSDK.nativeToScVal(["100", "200", "300"]),
            StellarSDK.nativeToScVal("GDPA2KHMH5UD3TVVFCOJIFXFMMJKVTZAEVL7YU3NTKW3XEZ4YTGT36SK"),
          ),
      )
        .setTimeout(30)
        .build();

        console.log("Llego 3");

        this.server.simulateTransaction(transaction).then((sim) => {
          console.log("_parsed:", sim._parsed);
          console.log("events:", sim.events);
          console.log("id:", sim.id);
          console.log("latestLedger:", sim.latestLedger);
        });
        
        console.log("Transaction: ");
        console.log(JSON.stringify(transaction.toXDR(), null, 2));

        // Preparacion de la transaccion.
        let preparedTransaction = await this.server.prepareTransaction(transaction);
        // Firma de la transaccion.
        preparedTransaction.sign(this.sourceKeypair);
        console.log("Llego 4");

      
        // const simulateResponse = await this.server.simulateTransaction(transaction);
        // Check simulation results before proceeding
        console.log("Llego 5");
      
        // Use SorobanRpc.Server methods
        const response = await this.server.sendTransaction(transaction);
        console.log("Llego 6");
        console.log("Transaction response:", JSON.stringify(response, null, 2));


        if ( response.status === "PENDING" ) {

          console.log("Llego 7");
          let getResponse;

          do {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 1 second
            getResponse = await this.server.getTransaction(response.hash);
          } while (getResponse.status === "NOT_FOUND");

          if ( getResponse.status === "SUCCESS" ) {
            console.log("Transaction successful: ${JSON.stringify(getResponse)}");
            return getResponse;
          } else {
            throw new Error("Transaction failed: ${getResponse.resultXdr}");
          }
        } else {
          throw new Error("Transaction submission failed: ${sendResponse.errorResultXdr}")
        }

      


        
        // Check the transaction status
        // if ((response as any).status === 'SUCCESS') {
        //   const result = StellarSDK.scValToNative(
        //     (response as any).resultMetaXdr?.v3?.result?.results?.[0]?.tr()?.invokeHostFunctionResult()?.success() ?? null
        //   );
        //   console.log("Llego 7");
        //     return Number(result);
        // } else {
        //     throw new Error(`Transaction failed: ${response.status}`);
        // }
    } catch (error) {
        console.error('Error calling create_project:', error);
        throw error;
    }

  }

  

  getHello(): string {
    return 'Hello World!';
  }


}
