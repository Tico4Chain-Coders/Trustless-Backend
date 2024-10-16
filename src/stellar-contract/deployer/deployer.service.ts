import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as StellarSDK from "@stellar/stellar-sdk";
import { randomBytes } from 'crypto';
import { EngagementIdException } from 'src/exceptions/engagement-id.exception';
import { ApiResponse } from 'src/interfaces/response.interface';
import { mapErrorCodeToMessage } from 'src/utils/errors.utils';
import { adjustPricesToMicroUSDC } from 'src/utils/parse.utils';
import { buildInvokeContractOperation, signAndSendTransaction } from 'src/utils/transaction.utils';

@Injectable()
export class DeployerService {

    private sorobanServer: StellarSDK.SorobanRpc.Server;
    private sourceKeypair: StellarSDK.Keypair;
    private trustlessContractId: string;

    constructor() {
        this.sorobanServer = new StellarSDK.SorobanRpc.Server(
            `${process.env.SOROBAN_SERVER_URL}`,
            { allowHttp: true },
          );
        this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
    }

    async invokeDeployerContract(
        engagementId: string,
        description: string,
        serviceProvider: string,
        amount: string,
        signer: string,
    ): Promise<ApiResponse> {

        const wasmHash = process.env.WASM_HASH;

        if (!engagementId) {
            throw new EngagementIdException();
        }

        try {

            const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
            this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
            const account = await this.sorobanServer.getAccount(
                this.sourceKeypair.publicKey(),
            );

            const adjustedPrice = adjustPricesToMicroUSDC(amount);
            const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, {
                type: "u128",
            });

            const operations = [
                StellarSDK.nativeToScVal(engagementId, { type: "string" }),
                StellarSDK.nativeToScVal(description, { type: "string" }),
                StellarSDK.Address.fromString(process.env.ISSUER_ADDRESS).toScVal(),
                StellarSDK.Address.fromString(serviceProvider).toScVal(),
                scValPrice,
                StellarSDK.Address.fromString(signer).toScVal(),
            ];

            const operation = buildInvokeContractOperation(
                this.trustlessContractId,
                wasmHash,
                "deploy",
                "initialize_escrow",
                operations,
            );

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
                this.sorobanServer,
                true,
            );

            const transactionMeta = result.resultMetaXdr;
            const returnValue = transactionMeta.v3().sorobanMeta().returnValue();
            const [contract_id, engagement_id] = StellarSDK.scValToNative(returnValue);

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
                contract_id,
                engagement_id
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
