import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";
import { mapErrorCodeToMessage } from '../../utils/errors.utils';
import {
  adjustPricesToMicroUSDC,
  parseEngagementData,
  parseBalanceByAddressData,
} from "src/utils/parse.utils";
import {
  buildTransaction,
  signAndSendTransaction,
} from "src/utils/transaction.utils";
import { ApiResponse } from "src/interfaces/response.interface";

@Injectable()
export class EngagementService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  private usdcToken: string;
  private usdcTokenPublic: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
    this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN;
    this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
  }

  async initializeEscrow(
    engagementId: string,
    description: string,
    issuer: string,
    serviceProvider: string,
    amount: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(this.sourceKeypair.publicKey());
  
      const adjustedPrice = adjustPricesToMicroUSDC(amount);
      const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, { type: "u128" });
  
      const operations = [
        this.contract.call(
          "initialize_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.nativeToScVal(description, { type: "string" }),
          StellarSDK.Address.fromString(issuer).toScVal(),
          StellarSDK.Address.fromString(serviceProvider).toScVal(),
          scValPrice,
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
      ];
  
      const transaction = buildTransaction(account, operations);
      
      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to initialize the escrow. Please try again' }
      }

      return { status: result.status, message: 'The escrow has been successfully initialized' }

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async fundEscrow(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );
      // const account = await this.server.getAccount(signer);
      const operations = [
        this.contract.call(
          "fund_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      // const preparedTransaction = await this.server.prepareTransaction(transaction);

      // return preparedTransaction.toXDR();

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to fund the escrow. Please try again' }
      }

      return { status: result.status, message: 'The escrow has been successfully funded' }

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async completeEscrow(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "complete_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to complete the escrow. Please try again' }
      }

      return { status: result.status, message: 'The escrow has been successfully completed' }

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async cancelEscrow(engagementId: string, signer: string): Promise<ApiResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "cancel_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to cancel the escrow. Please try again' }
      }

      return { status: result.status, message: 'The escrow has been successfully canceled' }

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async refundRemainingFunds(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "refund_remaining_funds",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to refund the escrow. Please try again' }
      }

      return { status: result.status, message: 'Escrow funds have been successfully refunded' }

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async getEscrowByEngagementID(engagementId: string): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_escrow_by_id",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) =>
          parseEngagementData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          ),
      );
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage
      }

      throw error;
    }
  }

  async sendTransaction(signedXdr: string): Promise<any> {
    const transaction = StellarSDK.TransactionBuilder.fromXDR(
      signedXdr,
      StellarSDK.Networks.TESTNET
    );

    const transactionResult = await this.server.sendTransaction(transaction);
    // console.log({ transactionResult })
    if (transactionResult.status === "PENDING") {
      let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getResponse = await this.server.getTransaction(transactionResult.hash);
      } while (getResponse.status === "NOT_FOUND");
      
      console.log({ getResponse })
      console.log({ resultXdr: JSON.stringify(getResponse.resultXdr) })
      if (getResponse.status === "SUCCESS") {
        return getResponse;
      } else {
        throw new Error(
          `Transaction failed: ${JSON.stringify(getResponse.resultXdr)}`,
        );
      }
    } else {
      throw new Error(`Transaction submission failed: ${transactionResult.errorResult}`);
    }
  }

  async establishTrustline(sourceSecretKey: string): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const usdcAsset = new StellarSDK.Asset("USDC", this.usdcTokenPublic);

      const operations = [
        StellarSDK.Operation.changeTrust({ asset: usdcAsset }),
      ];

      const transaction = buildTransaction(account, operations);

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if( result.status !== 'SUCCESS' ){
        return { status: result.status, message: 'An unexpected error occurred while trying to define the trustline in the USDC token. Please try again' }
      }

      return { status: result.status, message: 'The trust line has been correctly defined in the USDC token' }

    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_balance",
          StellarSDK.Address.fromString(address).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) => {
          const result = parseBalanceByAddressData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          );
          return { balance: result };
        },
      );

    } catch (error) {
      console.error(
        "An error occurred while trying to obtain the address balance:",
        error,
      );
      throw error;
    }
  }

  async approve_amount(
    from: string,
    spender: string,
    amount: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const microAmount = BigInt(Math.round(parseFloat(amount) * 1e6));
      const high = microAmount >> 64n;
      const low = microAmount & BigInt("0xFFFFFFFFFFFFFFFF");

      const apiWalletAddress = process.env.API_PUBLIC_KEY_WALLET;
      const operations = [
        this.contract.call(
          "approve_amounts",
          StellarSDK.Address.fromString(from).toScVal(),
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.xdr.ScVal.scvI128(
            new StellarSDK.xdr.Int128Parts({
              hi: StellarSDK.xdr.Int64.fromString(high.toString()),
              lo: StellarSDK.xdr.Uint64.fromString(low.toString()),
            }),
          ),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(apiWalletAddress).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );
    } catch (error) {
      console.error(
        "An error occurred when trying to approve amounts between addresses:",
        error,
      );
      throw error;
    }
  }

  async getAllowance(from: string, spender: string): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_allowance",
          StellarSDK.Address.fromString(from).toScVal(),
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) => {
          const result = parseBalanceByAddressData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          );
          return { allownce: result };
        },
      );
    } catch (error) {
      console.error(
        "An error occurred while trying to obtain the allowance of an address:",
        error,
      );
      throw error;
    }
  }
}
