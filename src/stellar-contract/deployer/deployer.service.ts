import { Injectable } from '@nestjs/common';
import * as StellarSDK from "@stellar/stellar-sdk";
import { randomBytes } from 'crypto';
import { ApiResponse } from 'src/interfaces/response.interface';
import { mapErrorCodeToMessage } from 'src/utils/errors.utils';
import { adjustPricesToMicroUSDC } from 'src/utils/parse.utils';
import { buildTransaction, signAndSendTransaction } from 'src/utils/transaction.utils';

@Injectable()
export class DeployerService {

    private server: StellarSDK.SorobanRpc.Server;
    private contract: StellarSDK.Contract;
    private sourceKeypair: StellarSDK.Keypair;
    private trustlessContractId: string;
    private usdcToken: string;

    constructor() {
        this.server = new StellarSDK.SorobanRpc.Server(
            `${process.env.SERVER_URL}`,
            { allowHttp: true },
          );
        this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
        this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
        this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
    }

    async invokeDeployerContract(
        engagementId: string,
        description: string,
        issuer: string,
        serviceProvider: string,
        amount: string,
        signer: string,
    ): Promise<ApiResponse> {

        const deployerContractAddress: string = 'CCSYONXZDHI2I2EI765E6AGBAVF7CB2PD6U5E6ESEUBLBCXCHAQHMEPY';
        const wasmHash = '8d8ee0d0a7edfbf273373683507e34f3a8fbea2f4ef99e2237e0e4a95ee784e4';
        const salt = StellarSDK.nativeToScVal(Buffer.from(randomBytes(32)), {type: 'bytes'})
        const wasmHashBytes = StellarSDK.nativeToScVal(Buffer.from(wasmHash, 'hex'), {type: 'bytes'});

        try {

            const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
            this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
            const account = await this.server.getAccount(
                this.sourceKeypair.publicKey(),
            );

            const adjustedPrice = adjustPricesToMicroUSDC(amount);
            const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, {
                type: "u128",
            });

            const operation = StellarSDK.Operation.invokeHostFunction({
                auth: [],
                func: StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new StellarSDK.xdr.InvokeContractArgs({
                        contractAddress: new StellarSDK.Address(deployerContractAddress).toScAddress(),
                        functionName: 'deploy',
                        args: [
                            StellarSDK.Address.fromString(deployerContractAddress).toScVal(), 
                            wasmHashBytes,
                            salt, 
                            StellarSDK.nativeToScVal('initialize_escrow', { type: 'symbol' }), 
                            StellarSDK.nativeToScVal([ 
                                StellarSDK.nativeToScVal(engagementId, { type: "string" }),
                                StellarSDK.nativeToScVal(description, { type: "string" }),
                                StellarSDK.Address.fromString(issuer).toScVal(),
                                StellarSDK.Address.fromString(serviceProvider).toScVal(),
                                scValPrice,
                                StellarSDK.Address.fromString(signer).toScVal(),
                            ], { type: 'vec' })
                        ]
                    })
                )
            });

            let transaction = new StellarSDK.TransactionBuilder(account, {
                fee: StellarSDK.BASE_FEE,
                networkPassphrase: StellarSDK.Networks.TESTNET
              })
                .addOperation(operation)
                .setTimeout(30)
                .build();


            const result = await signAndSendTransaction(
                transaction,
                this.sourceKeypair,
                this.server,
                true,
            );

            const transactionMeta = result.resultMetaXdr;
            const returnValue = transactionMeta.v3().sorobanMeta().returnValue();

            if (result.status !== "SUCCESS") {
                return {
                  status: result.status,
                  message:
                    "An unexpected error occurred while trying to initialize the escrow. Please try again",
                };
            }

            return {
                status: result.status,
                message: "The escrow has been successfully initialized",
                contractReturnValue: StellarSDK.scValToNative(returnValue)
            };
            
        } catch (error) {
            if (error.message.includes("HostError: Error(Contract, #")) {
                const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
                const errorMessage = mapErrorCodeToMessage(errorCode);
                throw errorMessage;
            }
        
            throw error;
        }




    }


}
