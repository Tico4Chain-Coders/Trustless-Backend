import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';

@Injectable()
export class ProjectService {

    // Initialize variables.
    private server: StellarSDK.SorobanRpc.Server; 
    private contract: StellarSDK.Contract;
    private sourceKeypair: StellarSDK.Keypair;
    private trustlessContractId: string;

    constructor() {

        // testnet server
        this.server = new StellarSDK.SorobanRpc.Server('https://soroban-testnet.stellar.org/');

        // Freelancer-Contract
        this.trustlessContractId = 'CCOOAVIBQXEDYF2J6FR2BPPJ7XPRHWXKCDH27OIXXECAUV4A65JPECXN';
        
        // Contract variable
        this.contract = new StellarSDK.Contract(this.trustlessContractId);
    }

    async createProject(freelancer: string, prices: string[], user: string, secretKey: string): Promise<number> {

        try {

            this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);

            // Account that realize the transaction
            const account = await this.server.getAccount(this.sourceKeypair.publicKey());

            // Convert the array of strings to ScVal
            const scValPrices = StellarSDK.nativeToScVal(prices, { type: "u128" });


            // Transaction with parameters
            const transaction = new StellarSDK.TransactionBuilder( account, {
                fee: "100000",
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
            
            // Getting prepared the transaction
            let preparedTransaction = await this.server.prepareTransaction(transaction);
            
            // Getting signed the transaction
            preparedTransaction.sign(this.sourceKeypair);

            // Sending the transaction
            const response = await this.server.sendTransaction(preparedTransaction);
            
            if ( response.status === "PENDING" ) {
                
                let getResponse;

                do {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  getResponse = await this.server.getTransaction(response.hash);
                } while (getResponse.status === "NOT_FOUND");
      
                if ( getResponse.status === "SUCCESS" ) {
                    console.log(`Transaction successful: ${JSON.stringify(getResponse)}`);
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
    
}